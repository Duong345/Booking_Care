import { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import {
  userIsAuthenticated,
  userIsNotAuthenticated,
} from '../hoc/authentication';
import { path } from '../utils';
import Home from '../routes/Home';
import Login from './Auth/Login';
import Signup from '../routes/Signup';
import System from '../routes/System';
import HomePage from './HomePage/HomePage';
import CustomScrollbars from '../components/CustomScrollbars';
import DetailDoctor from './Patient/Doctor/DetailDoctor';
import Doctor from '../routes/Doctor';
import VerifyEmail from './Patient/VerifyEmail';
import DetailSpecialty from './Patient/Specialty/DetailSpecialty';
import DetailClinic from './Patient/Clinic/DetailClinic';
import PatientProfile from './Patient/PatientProfile';
import type { Persistor } from 'redux-persist';

interface AppProps {
  persistor: Persistor;
  onBeforeLift?: () => void | Promise<void>;
}

const App = ({ persistor, onBeforeLift }: AppProps) => {
  const [, setBootstrapped] = useState(false);

  const ProtectedLogin = useMemo(() => userIsNotAuthenticated(Login), []);
  const ProtectedSignup = useMemo(() => userIsNotAuthenticated(Signup), []);
  const ProtectedSystem = useMemo(() => userIsAuthenticated(System), []);
  const ProtectedDoctor = useMemo(() => userIsAuthenticated(Doctor), []);
  const ProtectedPatientProfile = useMemo(
    () => userIsAuthenticated(PatientProfile),
    []
  );

  const handlePersistorState = useCallback(() => {
    const { bootstrapped } = persistor.getState() as { bootstrapped?: boolean };

    if (bootstrapped) {
      if (onBeforeLift) {
        Promise.resolve(onBeforeLift())
          .then(() => setBootstrapped(true))
          .catch(() => setBootstrapped(true));
      } else {
        setBootstrapped(true);
      }
    }
  }, [onBeforeLift, persistor]);

  useEffect(() => {
    handlePersistorState();
  }, [handlePersistorState]);

  return (
    <BrowserRouter>
      <div className="main-container">
        <div className="content-container">
          <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
            <Routes>
              <Route path={path.HOME} element={<Home />} />
              <Route path={path.LOGIN} element={<ProtectedLogin />} />
              <Route path="/signup" element={<ProtectedSignup />} />
              <Route path="/system/*" element={<ProtectedSystem />} />
              <Route path="/doctor/*" element={<ProtectedDoctor />} />
              <Route
                path={path.PATIENT_PROFILE}
                element={<ProtectedPatientProfile />}
              />
              <Route path={path.HOMEPAGE} element={<HomePage />} />
              <Route path={path.DETAIL_DOCTOR} element={<DetailDoctor />} />
              <Route
                path={path.DETAIL_SPECIALTY}
                element={<DetailSpecialty />}
              />
              <Route path={path.DETAIL_CLINIC} element={<DetailClinic />} />
              <Route
                path={path.VERIFY_EMAIL_BOOKING}
                element={<VerifyEmail />}
              />
            </Routes>
          </CustomScrollbars>
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
