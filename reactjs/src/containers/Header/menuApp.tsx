// Define types for menu structure
interface MenuItem {
  name: string;
  link: string;
}

interface MenuGroup {
  name: string;
  menus: MenuItem[];
}

// Admin menu configuration
export const adminMenu: MenuGroup[] = [
  {
    name: 'menu.admin.manage-user',
    menus: [
      {
        name: 'menu.admin.crud-redux',
        link: '/system/user-redux',
      },
      {
        name: 'menu.admin.manage-doctor',
        link: '/system/manage-doctor',
      },
      {
        name: 'menu.doctor.manage-schedule',
        link: '/doctor/manage-schedule',
      },
    ],
  },
  {
    name: 'menu.admin.clinic',
    menus: [
      {
        name: 'menu.admin.manage-clinic',
        link: '/system/manage-clinic',
      },
    ],
  },
  {
    name: 'menu.admin.specialty',
    menus: [
      {
        name: 'menu.admin.manage-specialty',
        link: '/system/manage-specialty',
      },
    ],
  },
];

// Doctor menu configuration
export const doctorMenu: MenuGroup[] = [
  {
    name: 'menu.admin.manage-user',
    menus: [
      {
        name: 'menu.doctor.manage-schedule',
        link: '/doctor/manage-schedule',
      },
      {
        name: 'menu.doctor.manage-patient',
        link: '/doctor/manage-patient',
      },
    ],
  },
];
