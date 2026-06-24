const db = require("../../models");
let createSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        await db.Specialty.create({
          name: data.name,
          image: data.imageBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getAllSpecialty = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Specialty.findAll({});
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = new Buffer(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: "OK",
        data,
      });
    } catch (e) {
      reject(e);
    }
  });
};
let getDetailSpecialtyById = (inputId, location, timeType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: { id: inputId },
          attributes: ["descriptionHTML", "descriptionMarkdown"],
        });
        if (data) {
          let doctorWhere = { specialtyId: inputId };
          if (location !== "ALL") {
            doctorWhere.provinceId = location;
          }

          if (timeType && timeType !== "ALL") {
            const Op = db.Sequelize ? db.Sequelize.Op : require("sequelize").Op;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextSevenDays = [];

            for (let i = 0; i < 7; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              nextSevenDays.push(date.getTime().toString());
            }

            const schedules = await db.Schedule.findAll({
              where: {
                timeType: timeType,
                date: {
                  [Op.in]: nextSevenDays,
                },
              },
              attributes: ["doctorId"],
              raw: true,
            });

            const doctorIdsHasSchedule = [
              ...new Set(schedules.map((item) => item.doctorId)),
            ];

            if (doctorIdsHasSchedule.length === 0) {
              data.doctorSpecialty = [];
              resolve({
                errCode: 0,
                errMessage: "OK",
                data,
              });
              return;
            }

            doctorWhere.doctorId = {
              [Op.in]: doctorIdsHasSchedule,
            };
          }

          let doctorSpecialty = await db.Doctor_Infor.findAll({
            where: doctorWhere,
            attributes: ["doctorId", "provinceId"],
          });
          data.doctorSpecialty = doctorSpecialty;
        } else data = {};
        resolve({
          errCode: 0,
          errMessage: "OK",
          data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        let specialty = await db.Specialty.findOne({
          where: { id: data.id },
        });

        if (!specialty) {
          resolve({
            errCode: 2,
            errMessage: "Specialty not found",
          });
          return;
        }

        let updateData = {
          name: data.name,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        };

        if (data.imageBase64) {
          updateData.image = data.imageBase64;
        }

        await specialty.update(updateData);

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteSpecialty = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        let specialty = await db.Specialty.findOne({
          where: { id: inputId },
        });

        if (!specialty) {
          resolve({
            errCode: 2,
            errMessage: "Specialty not found",
          });
          return;
        }

        let doctorInfor = await db.Doctor_Infor.findOne({
          where: { specialtyId: inputId },
        });

        if (doctorInfor) {
          resolve({
            errCode: 3,
            errMessage:
              "This specialty is being used by doctors and cannot be deleted",
          });
          return;
        }

        await specialty.destroy();

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
  updateSpecialty: updateSpecialty,
  deleteSpecialty: deleteSpecialty,
};
