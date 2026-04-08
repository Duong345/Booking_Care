import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../../store/actions';
import Navigator from '../../components/Navigator';
import { adminMenu, doctorMenu } from './menuApp';
import './Header.scss';
import { USER_ROLE } from '../../utils';
import _ from 'lodash';

interface MenuItem {
  name: string;
  link: string;
}

interface MenuGroup {
  name: string;
  menus: MenuItem[];
}

interface UserInfo {
  roleId: string;
}

interface RootState {
  user: {
    isLoggedIn: boolean;
    userInfo: UserInfo | null;
  };
  app: {
    language: string;
  };
}

const Header = () => {
  const dispatch = useDispatch();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const language = useSelector((state: RootState) => state.app.language);

  const [menuApp, setMenuApp] = useState<MenuGroup[]>([]);

  useEffect(() => {
    let menu: MenuGroup[] = [];

    if (userInfo && !_.isEmpty(userInfo)) {
      switch (userInfo.roleId) {
        case USER_ROLE.ADMIN:
          menu = adminMenu;
          break;
        case USER_ROLE.DOCTOR:
          menu = doctorMenu;
          break;
        default:
          menu = [];
      }
    }

    setMenuApp(menu);
  }, [userInfo]);

  const handleLogout = () => {
    dispatch(actions.processLogout());
  };

  const handleChangeLanguage = (lang: 'vi' | 'en') => {
    dispatch(actions.changeLanguageApp(lang));
  };

  return (
    <div className="header-container">
      <div className="header-tabs-container">
        <Navigator menus={menuApp} />
      </div>

      <div className="btn btn-logout" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
      </div>
    </div>
  );
};

export default Header;
