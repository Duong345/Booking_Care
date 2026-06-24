import express from 'express';
import homeController from '../controllers/homeController';
import userController from '../controllers/userController';
import doctorController from '../controllers/doctorController';
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController';
import clinicController from '../controllers/clinicController';
let router = express.Router();
let initWebRoute = (app) => {
  router.get('/about', homeController.getAboutPage);
  router.get('/crud', homeController.getCRUD);
  router.post('/post-crud', homeController.postCRUD);
  router.get('/get-crud', homeController.displayGetCRUD);
  router.get('/edit-crud', homeController.getEditCRUD);
  router.post('/put-crud', homeController.putCRUD);
  router.get('/', homeController.getHomePage);
  router.get('/delete-crud', homeController.deleteCRUD);
  router.post('/api/login', userController.handleLogin);
  router.get('/api/get-all-users', userController.handleGetAllUsers);
  router.post('/api/create-new-user', userController.handleCreateNewUser);
  router.put('/api/edit-user', userController.handleEditUser);
  router.delete('/api/delete-user', userController.handleDeleteUser);
  router.get('/api/allcode', userController.getAllCode);
  router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
  router.get('/api/get-all-doctors', doctorController.getAllDoctors);
  router.post('/api/save-infor-doctors', doctorController.postInforDoctor);
  router.get(
    '/api/get-detail-doctor-by-id',
    doctorController.getDetailDoctorById
  );
  router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
  router.get(
    '/api/get-schedule-doctor-by-date',
    doctorController.getScheduleByDate
  );
  router.get(
    '/api/get-extra-infor-doctor-by-id',
    doctorController.getExtraInforDoctorById
  );
  router.get(
    '/api/get-profile-doctor-by-id',
    doctorController.getProfileDoctorById
  );
  router.post(
    '/api/patient-book-appointment',
    patientController.postBookAppointment
  );
  router.post(
    '/api/verify-book-appointment',
    patientController.postVerifyBookAppointment
  );
  router.get(
    '/api/get-booking-history-for-patient',
    patientController.getBookingHistoryForPatient
  );
  router.post(
    '/api/patient-cancel-booking',
    patientController.cancelBookingByPatient
  );
  router.post(
    '/api/patient-rebook-canceled-appointment',
    patientController.rebookCanceledAppointment
  );
  router.post('/api/create-new-specialty', specialtyController.createSpecialty);
  router.get('/api/get-specialty', specialtyController.getAllSpecialty);
  router.put('/api/update-specialty', specialtyController.updateSpecialty);
  router.delete('/api/delete-specialty', specialtyController.deleteSpecialty);
  router.get(
    '/api/get-detail-specialty-by-id',
    specialtyController.getDetailSpecialtyById
  );
  router.post('/api/create-new-clinic', clinicController.createClinic);
  router.get('/api/get-clinic', clinicController.getAllClinic);
  router.put('/api/update-clinic', clinicController.updateClinic);
  router.delete('/api/delete-clinic', clinicController.deleteClinic);
  router.get(
    '/api/get-detail-clinic-by-id',
    clinicController.getDetailClinicById
  );
  router.get(
    '/api/get-list-patient-for-doctor',
    doctorController.getListPatientForDoctor
  );
  router.get(
    '/api/get-confirmed-booking-history',
    doctorController.getConfirmedBookingHistory
  );
  router.post('/api/send-remedy', doctorController.sendRemedy);

  router.post('/api/send-cancel', doctorController.sendCancel);
  router.post('/api/test-ollama', async (req, res) => {
    res.json({ message: 'test ok' });
  });

  router.post('/test', (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    res.json({ result: `Received prompt: ${prompt}` });
  });

  return app.use('/', router);
};
module.exports = initWebRoute;
