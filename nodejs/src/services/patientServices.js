import db from "../../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
const getDefaultMaxNumberSchedule = () => {
  const maxNumber = parseInt(MAX_NUMBER_SCHEDULE, 10);
  return Number.isInteger(maxNumber) && maxNumber > 0 ? maxNumber : 1;
};
const getActiveBookingWhere = (doctorId, date, timeType) => {
  const Op = db.Sequelize ? db.Sequelize.Op : require("sequelize").Op;
  return {
    doctorId,
    date,
    timeType,
    statusId: { [Op.ne]: "S4" },
  };
};
const syncScheduleCurrentNumber = async (doctorId, date, timeType) => {
  const currentNumber = await db.Booking.count({
    where: getActiveBookingWhere(doctorId, date, timeType),
  });
  await db.Schedule.update(
    { currentNumber },
    {
      where: {
        doctorId,
        date,
        timeType,
      },
    }
  );
  return currentNumber;
};
const getPatientIdFromInput = async (data) => {
  if (data.patientId) return data.patientId;
  if (!data.email) return null;

  const patient = await db.User.findOne({
    where: { email: data.email },
    attributes: ["id"],
    raw: true,
  });

  return patient ? patient.id : null;
};
let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let getBookingHistoryForPatient = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const patientId = await getPatientIdFromInput(data);

      if (!patientId) {
        return resolve({
          errCode: 1,
          errMessage: "Missing patient information",
        });
      }

      let bookings = await db.Booking.findAll({
        where: { patientId },
        attributes: [
          "id",
          "statusId",
          "doctorId",
          "patientId",
          "date",
          "timeType",
          "reason",
          "createdAt",
        ],
        include: [
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        order: [
          ["date", "DESC"],
          ["createdAt", "DESC"],
        ],
        raw: false,
        nest: true,
      });

      bookings = await Promise.all(
        bookings.map(async (booking) => {
          const plainBooking = booking.get
            ? booking.get({ plain: true })
            : booking;
          const doctorData = await db.User.findOne({
            where: { id: plainBooking.doctorId },
            attributes: ["id", "firstName", "lastName", "positionId"],
            include: [
              {
                model: db.Allcode,
                as: "positionData",
                attributes: ["valueEn", "valueVi"],
              },
            ],
            raw: false,
            nest: true,
          });

          return {
            ...plainBooking,
            doctorData: doctorData
              ? doctorData.get
                ? doctorData.get({ plain: true })
                : doctorData
              : null,
          };
        })
      );

      resolve({
        errCode: 0,
        data: bookings,
      });
    } catch (e) {
      reject(e);
    }
  });
};
let cancelBookingByPatient = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const patientId = await getPatientIdFromInput(data);

      if (!patientId || !data.bookingId) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      const booking = await db.Booking.findOne({
        where: {
          id: data.bookingId,
          patientId,
        },
        raw: false,
      });

      if (!booking) {
        return resolve({
          errCode: 2,
          errMessage: "Appointment does not exist",
        });
      }

      if (booking.statusId === "S3" || booking.statusId === "S4") {
        return resolve({
          errCode: 3,
          errMessage: "Appointment cannot be canceled",
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = Number(booking.date);
      if (Number.isFinite(bookingDate) && bookingDate < today.getTime()) {
        return resolve({
          errCode: 4,
          errMessage: "Past appointment cannot be canceled",
        });
      }

      booking.statusId = "S4";
      await booking.save();
      await syncScheduleCurrentNumber(
        booking.doctorId,
        booking.date,
        booking.timeType
      );

      resolve({
        errCode: 0,
        errMessage: "Cancel appointment succeed",
      });
    } catch (e) {
      reject(e);
    }
  });
};
let rebookCanceledAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    let transaction;
    let createdBooking = null;
    let bookingCommitted = false;
    try {
      if (!data.bookingId || !data.doctorId || !data.timeType || !data.date) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      }

      transaction = await db.sequelize.transaction();

      const oldBooking = await db.Booking.findOne({
        where: {
          id: data.bookingId,
          statusId: "S4",
        },
        raw: false,
        transaction,
      });

      if (!oldBooking) {
        await transaction.rollback();
        return resolve({
          errCode: 2,
          errMessage: "Canceled appointment does not exist",
        });
      }

      const inputPatientId = await getPatientIdFromInput(data);
      if (
        inputPatientId &&
        Number(inputPatientId) !== Number(oldBooking.patientId)
      ) {
        await transaction.rollback();
        return resolve({
          errCode: 3,
          errMessage: "Patient information does not match appointment",
        });
      }

      const patient = await db.User.findOne({
        where: { id: oldBooking.patientId },
        attributes: ["id", "email", "firstName", "lastName"],
        raw: false,
        transaction,
      });

      if (!patient || !patient.email) {
        await transaction.rollback();
        return resolve({
          errCode: 4,
          errMessage: "Patient information is not available",
        });
      }

      let schedule = await db.Schedule.findOne({
        where: {
          doctorId: data.doctorId,
          date: data.date,
          timeType: data.timeType,
        },
        raw: false,
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!schedule) {
        await transaction.rollback();
        return resolve({
          errCode: 5,
          errMessage: "Khung giờ này không còn khả dụng",
        });
      }

      const activeBookingCount = await db.Booking.count({
        where: getActiveBookingWhere(data.doctorId, data.date, data.timeType),
        transaction,
      });
      const maxNumber =
        parseInt(schedule.maxNumber, 10) || getDefaultMaxNumberSchedule();

      if (activeBookingCount > 0 || activeBookingCount >= maxNumber) {
        await transaction.rollback();
        return resolve({
          errCode: 6,
          errMessage: "Khung giờ này đã có người đặt",
        });
      }

      const token = uuidv4();

      createdBooking = await db.Booking.create(
        {
          statusId: "S1",
          doctorId: data.doctorId,
          patientId: oldBooking.patientId,
          date: data.date,
          timeType: data.timeType,
          token: token,
          reason: oldBooking.reason,
        },
        { transaction }
      );

      schedule.currentNumber = activeBookingCount + 1;
      await schedule.save({ transaction });
      await transaction.commit();
      bookingCommitted = true;

      const patientName =
        `${patient.lastName || ""} ${patient.firstName || ""}`.trim() ||
        patient.email;

      await emailService.sendSimpleEmail({
        receiverEmail: patient.email,
        patientName: patientName,
        time: data.timeString || data.timeType,
        doctorName: data.doctorName || "",
        language: data.language || "vi",
        redirectLink: buildUrlEmail(data.doctorId, token),
      });

      resolve({
        errCode: 0,
        errMessage: "Rebook appointment succeed",
      });
    } catch (e) {
      if (transaction && !bookingCommitted) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.log("ROLLBACK REBOOK ERROR:", rollbackError);
        }
      }

      if (bookingCommitted && createdBooking) {
        try {
          await db.Booking.update(
            { statusId: "S4" },
            { where: { id: createdBooking.id } }
          );
          await syncScheduleCurrentNumber(
            createdBooking.doctorId,
            createdBooking.date,
            createdBooking.timeType
          );
        } catch (cleanupError) {
          console.log("REBOOK CLEANUP ERROR:", cleanupError);
        }
      }

      console.log("SERVER REBOOK ERROR:", e);
      reject(e);
    }
  });
};
let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    let transaction;
    let createdBooking = null;
    let bookingCommitted = false;
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        transaction = await db.sequelize.transaction();
        let token = uuidv4();

        let schedule = await db.Schedule.findOne({
          where: {
            doctorId: data.doctorId,
            date: data.date,
            timeType: data.timeType,
          },
          raw: false,
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!schedule) {
          await transaction.rollback();
          return resolve({
            errCode: 2,
            errMessage: "Khung giờ này không còn khả dụng",
          });
        }

        const activeBookingCount = await db.Booking.count({
          where: getActiveBookingWhere(data.doctorId, data.date, data.timeType),
          transaction,
        });
        const maxNumber =
          parseInt(schedule.maxNumber, 10) || getDefaultMaxNumberSchedule();

        if (activeBookingCount > 0 || activeBookingCount >= maxNumber) {
          await transaction.rollback();
          return resolve({
            errCode: 3,
            errMessage: "Khung giờ này đã có người đặt",
          });
        }

        let [user] = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            gender: data.selectedGender,
            address: data.address,
            firstName: data.fullName,
          },
          transaction,
        });

        createdBooking = await db.Booking.create(
          {
            statusId: "S1",
            doctorId: data.doctorId,
            patientId: user.id,
            date: data.date,
            timeType: data.timeType,
            token: token,
            reason: data.reason,
          },
          { transaction }
        );

        schedule.currentNumber = activeBookingCount + 1;
        await schedule.save({ transaction });
        await transaction.commit();
        bookingCommitted = true;

        await emailService.sendSimpleEmail({
          receiverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });

        resolve({
          errCode: 0,
          errMessage: "Save infor patient succeed!",
        });
      }
    } catch (e) {
      if (transaction && !bookingCommitted) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.log("ROLLBACK BOOKING ERROR:", rollbackError);
        }
      }

      if (bookingCommitted && createdBooking) {
        try {
          await db.Booking.update(
            { statusId: "S4" },
            { where: { id: createdBooking.id } }
          );
          await syncScheduleCurrentNumber(
            createdBooking.doctorId,
            createdBooking.date,
            createdBooking.timeType
          );
        } catch (cleanupError) {
          console.log("BOOKING CLEANUP ERROR:", cleanupError);
        }
      }

      console.log("SERVER BOOKING ERROR:", e);
      reject(e);
    }
  });
};
let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });
        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: "Update the appointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getBookingHistoryForPatient: getBookingHistoryForPatient,
  cancelBookingByPatient: cancelBookingByPatient,
  rebookCanceledAppointment: rebookCanceledAppointment,
};
