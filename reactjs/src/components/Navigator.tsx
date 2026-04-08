import React, { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import './Navigator.scss';

interface SubMenuItem {
  name: string;
  link: string;
}

interface MenuItem {
  name: string;
  link?: string;
  subMenus?: SubMenuItem[];
}

interface MenuGroup {
  name: string;
  menus: MenuItem[];
}

interface NavigatorProps {
  menus: MenuGroup[];
  onLinkClick?: () => void;
}

const Navigator: React.FC<NavigatorProps> = ({ menus, onLinkClick }) => {
  const location = useLocation();

  const [expandedMenu, setExpandedMenu] = useState<Record<string, boolean>>({});

  const toggle = (groupIndex: number, menuIndex: number) => {
    const key = `${groupIndex}_${menuIndex}`;
    setExpandedMenu((prev) => ({
      [key]: !prev[key],
    }));
  };

  const isMenuActive = (subMenus?: SubMenuItem[], link?: string) => {
    const currentPath = location.pathname;

    if (subMenus && subMenus.length > 0) {
      return subMenus.some((sub) => sub.link === currentPath);
    }

    if (link) {
      return currentPath === link;
    }

    return false;
  };

  useEffect(() => {
    for (let i = 0; i < menus.length; i++) {
      const group = menus[i];

      for (let j = 0; j < group.menus.length; j++) {
        const menu = group.menus[j];

        if (menu.subMenus && isMenuActive(menu.subMenus)) {
          const key = `${i}_${j}`;
          setExpandedMenu({ [key]: true });
          return;
        }
      }
    }
  }, [location.pathname, menus]);

  return (
    <ul className="navigator-menu list-unstyled">
      {menus.map((group, groupIndex) => (
        <li className="menu-group" key={groupIndex}>
          <div className="menu-group-name">
            <FormattedMessage id={group.name} />
          </div>

          <ul className="menu-list list-unstyled">
            {group.menus.map((menu, menuIndex) => {
              const isActive = isMenuActive(menu.subMenus, menu.link);
              const key = `${groupIndex}_${menuIndex}`;
              const isOpen = expandedMenu[key];

              return (
                <li
                  key={menuIndex}
                  className={`menu 
                    ${menu.subMenus ? 'has-sub-menu' : ''} 
                    ${isActive ? 'active' : ''}`}
                >
                  {menu.subMenus ? (
                    <>
                      <span
                        className="menu-link collapsed"
                        onClick={() => toggle(groupIndex, menuIndex)}
                      >
                        <FormattedMessage id={menu.name} />
                        <div className="icon-right">
                          <i className="far fa-angle-right" />
                        </div>
                      </span>

                      {isOpen && (
                        <ul className="sub-menu-list list-unstyled">
                          {menu.subMenus.map((sub, idx) => (
                            <li
                              key={idx}
                              className={`sub-menu ${
                                location.pathname === sub.link ? 'active' : ''
                              }`}
                            >
                              <Link
                                to={sub.link}
                                className="sub-menu-link"
                                onClick={onLinkClick}
                              >
                                <FormattedMessage id={sub.name} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={menu.link || '#'}
                      className="menu-link"
                      onClick={onLinkClick}
                    >
                      <FormattedMessage id={menu.name} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default Navigator;
