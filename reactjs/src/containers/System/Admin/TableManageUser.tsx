import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions';

// ===== Types =====
interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  phonenumber: string;
  gender: string;
  roleId: string;
  positionId: string;
  image?: string;
}

interface RootState {
  admin: {
    users: User[];
  };
}

interface TableManageUserProps {
  handleEditUserFromParentKey?: (user: User) => void;
}

// ===== Component =====
const TableManageUser: React.FC<TableManageUserProps> = ({
  handleEditUserFromParentKey,
}) => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.admin.users);

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(actions.fetchAllUsersStart() as any);
  }, [dispatch]);

  // Handle delete
  const handleDeleteUser = (userId: string | number) => {
    dispatch(actions.deleteAUser(userId) as any);
  };

  // Handle edit
  const handleEditUser = (user: User) => {
    handleEditUserFromParentKey?.(user);
  };

  return (
    <div className="table-manage-user">
      <table id="TableManageUser">
        <thead>
          <tr>
            <th>Email</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.address}</td>
                <td>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="btn-edit"
                  >
                    <i className="fas fa-pencil-alt"></i>
                  </button>

                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn-delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableManageUser;
