import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import UserManage from '../containers/System/UserManage';
import UserRedux from '../containers/System/Admin/UserRedux';
import Header from '../containers/Header/Header';
import ManageDoctor from '../containers/System/Admin/ManageDoctor';
import ManageSpecialty from '../containers/System/Specialty/ManageSpecialty';
import ManageClinic from '../containers/System/Clinic/ManageClinic';
class System extends Component {
  render() {
    const { systemMenuPath, isLoggedIn } = this.props;
    return (
      <React.Fragment>
        {isLoggedIn && <Header />}
        <div className="system-container">
          <div className="system-list">
            <Routes>
              <Route index element={<Navigate to="user-manage" replace />} />
              <Route path="user-manage" element={<UserManage />} />
              <Route path="user-redux" element={<UserRedux />} />
              <Route path="manage-doctor" element={<ManageDoctor />} />
              <Route path="manage-specialty" element={<ManageSpecialty />} />
              <Route path="manage-clinic" element={<ManageClinic />} />
              <Route path="*" element={<Navigate to="user-manage" replace />} />
            </Routes>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
