import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import ManageSchedule from '../containers/System/Doctor/ManageSchedule';
import Header from '../containers/Header/Header';
import ManagePatient from '../containers/System/Doctor/ManagePatient';

interface RootState {
  user: {
    isLoggedIn: boolean;
  };
}

const Doctor = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return (
    <>
      {isLoggedIn && <Header />}
      <div className="system-container">
        <div className="system-list">
          <Routes>
            <Route path="manage-schedule" element={<ManageSchedule />} />
            <Route path="manage-patient" element={<ManagePatient />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Doctor;
