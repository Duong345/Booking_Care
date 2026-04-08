require("dotenv").config();
import { get } from "lodash";
import nodemailer from "nodemailer";
let sendSimpleEmail = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
  let info = await transporter.sendMail({
    from: "Bệnh viện Hoàng Thái Dương",
    to: dataSend.receiverEmail,
    subject: "Thông tin đặt lịch khám bệnh",
    html: getBodyHTMLEmail(dataSend),
  });
};
let getBodyHTMLEmail = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn đã đặt lịch khám bệnh thành công tại Bệnh viện Hoàng Thái Dương</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time} </b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName} </b></div>
        <p>Nếu thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
        <div>
            <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
        <p>Xin chân thành cảm ơn!</p>
    `;
  }
  if (dataSend.language === "en") {
    result = `
        <h3>Dear ${dataSend.patientName}!</h3>
        <p>You have successfully booked an appointment at Hoang Thai Duong Hospital</p>
        <p>Information to book an appointment:</p>
        <div><b>Time: ${dataSend.time} </b></div>
        <div><b>Doctor: ${dataSend.doctorName} </b></div>
        <p>If the above information is true, please click on the link below to confirm and complete the appointment booking procedure.</p>
        <div>
            <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
        <p>Sincerely thank!</p>
    `;
  }
  return result;
};
let getBodyHTMLEmailRemedy = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn đã hoàn tất thủ tục đặt lịch khám bệnh tại Bệnh viện Hoàng Thái Dương</p>
        <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm:</p>
        <div> Xin chân thành cảm ơn!</div>
    `;
  }
  if (dataSend.language === "en") {
    result = `
        <h3>Dear ${dataSend.patientName}!</h3>
        <p>You have completed the procedure for booking an appointment at Hoang Thai Duong Hospital</p>
        <p>Prescription/invoice information is sent in the attached file:</p>
        <div> Sincerely thank!</div>
    `;
  }
  return result;
};

let getBodyHTMLEmailCancel = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Rất tiếc thông báo rằng lịch khám của bạn tại Bệnh viện Hoàng Thái Dương đã bị hủy do bác sĩ bận.</p>
        <p>Thông tin lịch hẹn:</p>
        <div><b>Thời gian: ${dataSend.time} </b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName} </b></div>
        <p>Chúng tôi xin lỗi vì sự bất tiện này và sẽ liên hệ để sắp xếp lại lịch nếu bạn cần.</p>
        <p>Xin chân thành cảm ơn!</p>
    `;
  }
  if (dataSend.language === "en") {
    result = `
        <h3>Dear ${dataSend.patientName}!</h3>
        <p>We regret to inform you that your appointment at Hoang Thai Duong Hospital has been canceled because the doctor is unavailable.</p>
        <p>Appointment info:</p>
        <div><b>Time: ${dataSend.time} </b></div>
        <div><b>Doctor: ${dataSend.doctorName} </b></div>
        <p>We apologize for the inconvenience and will contact you to reschedule if needed.</p>
        <p>Sincerely thank!</p>
    `;
  }
  return result;
};

let sendAttachment = async (dataSend) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });
      let info = await transporter.sendMail({
        from: "Bệnh viện Hoàng Thái Dương",
        to: dataSend.email,
        subject: "Hóa đơn/đơn thuốc đặt lịch khám bệnh",
        html: getBodyHTMLEmailRemedy(dataSend),
        attachments: [
          {
            filename: `remedy-${
              dataSend.patientId
            }-${new Date().getTime()}.png`,
            content: dataSend.imgBase64.split("base64,")[1],
            encoding: "base64",
          },
        ],
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

let sendCancelEmail = async (dataSend) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });
      let info = await transporter.sendMail({
        from: "Bệnh viện Hoàng Thái Dương",
        to: dataSend.email,
        subject: "Thông báo huỷ lịch khám",
        html: getBodyHTMLEmailCancel(dataSend),
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  sendSimpleEmail: sendSimpleEmail,
  sendAttachment: sendAttachment,
  sendCancelEmail: sendCancelEmail,
};
