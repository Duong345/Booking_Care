import patientService from "../services/patientServices";
let postBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let postVerifyBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postVerifyBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let getBookingHistoryForPatient = async (req, res) => {
  try {
    let infor = await patientService.getBookingHistoryForPatient(req.query);
    return res.status(200).json(infor);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let cancelBookingByPatient = async (req, res) => {
  try {
    let infor = await patientService.cancelBookingByPatient(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let rebookCanceledAppointment = async (req, res) => {
  try {
    let infor = await patientService.rebookCanceledAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getBookingHistoryForPatient: getBookingHistoryForPatient,
  cancelBookingByPatient: cancelBookingByPatient,
  rebookCanceledAppointment: rebookCanceledAppointment,
};
