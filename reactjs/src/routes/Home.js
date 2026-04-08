import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';

class Home extends Component {
  render() {
    const { isLoggedIn, userInfo } = this.props;
    let linkToRedirect = '/home';

    if (isLoggedIn) {
      // Check if user is a patient (role R3)
      if (userInfo && userInfo.roleId === 'R3') {
        linkToRedirect = '/home';
      }
      // Check if user is a doctor (role R2)
      else if (userInfo && userInfo.roleId === 'R2') {
        linkToRedirect = '/doctor/manage-schedule';
      }
      // Admin and other roles
      else {
        linkToRedirect = '/system/user-manage';
      }
    }

    return <Navigate to={linkToRedirect} replace />;
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
