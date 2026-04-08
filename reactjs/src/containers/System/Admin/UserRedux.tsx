import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { LANGUAGES, CRUD_ACTIONS, CommonUtils } from '../../../utils';
import * as actions from '../../../store/actions';
import {
  fetchGenderStart,
  fetchPositionStart,
  fetchRoleStart,
  fetchAllUsersStart,
  createNewUser,
  editAUser,
  deleteAUser,
} from '../../../store/actions/adminActions';
import './UserRedux.scss';
import './TableManageUser.scss';
interface GenderOption {
  keyMap: string;
  valueVi: string;
  valueEn: string;
}

interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  phonenumber: string;
  address: string;
  gender: string;
  roleId: string;
  positionId: string;
  image?: string;
}

interface RootState {
  app: {
    language: string;
  };
  admin: {
    genders: GenderOption[];
    roles: GenderOption[];
    positions: GenderOption[];
    isLoadingGender: boolean;
    users: User[];
  };
}

const UserRedux = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.app.language);
  const genderRedux = useSelector((state: RootState) => state.admin.genders);
  const roleRedux = useSelector((state: RootState) => state.admin.roles);
  const positionRedux = useSelector(
    (state: RootState) => state.admin.positions
  );
  const isLoadingGender = useSelector(
    (state: RootState) => state.admin.isLoadingGender
  );
  const listUsers = useSelector((state: RootState) => state.admin.users);

  // Form state
  const [genderArr, setGenderArr] = useState<GenderOption[]>([]);
  const [positionArr, setPositionArr] = useState<GenderOption[]>([]);
  const [roleArr, setRoleArr] = useState<GenderOption[]>([]);
  const [previewImgURL, setPreviewImgURL] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [action, setAction] = useState<string>(CRUD_ACTIONS.CREATE);
  const [userEditId, setUserEditId] = useState('');

  // Table state
  const [usersRedux, setUsersRedux] = useState<User[]>([]);

  // Initialize
  useEffect(() => {
    dispatch(fetchGenderStart() as any);
    dispatch(fetchPositionStart() as any);
    dispatch(fetchRoleStart() as any);
    dispatch(fetchAllUsersStart() as any);
  }, [dispatch]);

  // Update genders
  useEffect(() => {
    if (genderRedux && genderRedux.length > 0) {
      setGenderArr(genderRedux);
      setGender(genderRedux[0].keyMap);
    }
  }, [genderRedux]);

  // Update roles
  useEffect(() => {
    if (roleRedux && roleRedux.length > 0) {
      setRoleArr(roleRedux);
      setRole(roleRedux[0].keyMap);
    }
  }, [roleRedux]);

  // Update positions
  useEffect(() => {
    if (positionRedux && positionRedux.length > 0) {
      setPositionArr(positionRedux);
      setPosition(positionRedux[0].keyMap);
    }
  }, [positionRedux]);

  // Update users list
  useEffect(() => {
    if (listUsers && listUsers.length > 0) {
      setUsersRedux(listUsers);
      // Reset form when user list updates
      if (
        genderRedux &&
        genderRedux.length > 0 &&
        roleRedux &&
        roleRedux.length > 0 &&
        positionRedux &&
        positionRedux.length > 0
      ) {
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setAddress('');
        setGender(genderRedux[0].keyMap);
        setPosition(positionRedux[0].keyMap);
        setRole(roleRedux[0].keyMap);
        setAvatar('');
        setAction(CRUD_ACTIONS.CREATE);
        setPreviewImgURL('');
      }
    }
  }, [listUsers, genderRedux, roleRedux, positionRedux]);

  // Handle image upload
  const handleOnchangeImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const data = event.target.files;
      const file = data?.[0];
      if (file) {
        const base64 = await CommonUtils.getBase64(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewImgURL(objectUrl);
        setAvatar(base64 as string);
      }
    },
    []
  );

  // Open preview image
  const openPreviewImage = useCallback(() => {
    if (!previewImgURL) return;
    setIsOpen(true);
  }, [previewImgURL]);

  // Validate input
  const checkValidateInput = useCallback((): boolean => {
    const arrCheck = [
      'email',
      'password',
      'firstName',
      'lastName',
      'phoneNumber',
      'address',
    ];
    for (let i = 0; i < arrCheck.length; i++) {
      const fieldValue = {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        address,
      } as any;
      if (!fieldValue[arrCheck[i]]) {
        alert('This input is required: ' + arrCheck[i]);
        return false;
      }
    }
    return true;
  }, [email, password, firstName, lastName, phoneNumber, address]);

  // Save user
  const handleSaveUser = useCallback(() => {
    if (!checkValidateInput()) return;

    if (action === CRUD_ACTIONS.CREATE) {
      dispatch(
        createNewUser({
          email,
          password,
          firstName,
          lastName,
          address,
          phonenumber: phoneNumber,
          gender,
          roleId: role,
          positionId: position,
          avatar,
        }) as any
      );
    } else if (action === CRUD_ACTIONS.EDIT) {
      dispatch(
        editAUser({
          id: userEditId,
          email,
          password,
          firstName,
          lastName,
          address,
          phonenumber: phoneNumber,
          gender,
          roleId: role,
          positionId: position,
          avatar,
        }) as any
      );
    }
  }, [
    action,
    email,
    password,
    firstName,
    lastName,
    address,
    phoneNumber,
    gender,
    role,
    position,
    avatar,
    userEditId,
    checkValidateInput,
    dispatch,
  ]);

  // Handle input change
  const onChangeInput = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      id: string
    ) => {
      if (id === 'email') setEmail(event.target.value);
      else if (id === 'password') setPassword(event.target.value);
      else if (id === 'firstName') setFirstName(event.target.value);
      else if (id === 'lastName') setLastName(event.target.value);
      else if (id === 'phoneNumber') setPhoneNumber(event.target.value);
      else if (id === 'address') setAddress(event.target.value);
      else if (id === 'gender') setGender(event.target.value);
      else if (id === 'position') setPosition(event.target.value);
      else if (id === 'role') setRole(event.target.value);
    },
    []
  );

  // Edit user from table
  const handleEditUserFromParent = useCallback((user: User) => {
    let imageBase64 = '';
    if (user.image) {
      imageBase64 = `data:image/jpeg;base64,${user.image}`;
    }
    setEmail(user.email);
    setPassword('HARDCODE');
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phonenumber);
    setAddress(user.address);
    setGender(user.gender);
    setRole(user.roleId);
    setPosition(user.positionId);
    setAvatar('');
    setPreviewImgURL(imageBase64);
    setAction(CRUD_ACTIONS.EDIT);
    setUserEditId(user.id as string);
  }, []);

  // Delete user
  const handleDeleteUser = useCallback(
    (user: User) => {
      dispatch(deleteAUser(user.id) as any);
    },
    [dispatch]
  );

  return (
    <div className="user-redux-container">
      <div className="title">Quản lý người dùng</div>
      <div className="user-redux-body">
        <div className="container">
          <div className="row">
            {/* Add User Section */}
            <div className="col-12 my-3">
              <FormattedMessage id="manage-user.add" />
            </div>
            <div className="col-12">
              {isLoadingGender === true ? 'Loading genders' : ''}
            </div>

            {/* Email Input */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.email" />
              </label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(event) => onChangeInput(event, 'email')}
                disabled={action === CRUD_ACTIONS.EDIT}
              />
            </div>

            {/* Password Input */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.password" />
              </label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(event) => onChangeInput(event, 'password')}
                disabled={action === CRUD_ACTIONS.EDIT}
              />
            </div>

            {/* First Name Input */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.first-name" />
              </label>
              <input
                className="form-control"
                type="text"
                value={firstName}
                onChange={(event) => onChangeInput(event, 'firstName')}
              />
            </div>

            {/* Last Name Input */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.last-name" />
              </label>
              <input
                className="form-control"
                type="text"
                value={lastName}
                onChange={(event) => onChangeInput(event, 'lastName')}
              />
            </div>

            {/* Phone Number Input */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.phone-number" />
              </label>
              <input
                className="form-control"
                type="text"
                value={phoneNumber}
                onChange={(event) => onChangeInput(event, 'phoneNumber')}
              />
            </div>

            {/* Address Input */}
            <div className="col-9">
              <label>
                <FormattedMessage id="manage-user.address" />
              </label>
              <input
                className="form-control"
                type="text"
                value={address}
                onChange={(event) => onChangeInput(event, 'address')}
              />
            </div>

            {/* Gender Select */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.gender" />
              </label>
              <select
                className="form-control"
                onChange={(event) => onChangeInput(event, 'gender')}
                value={gender}
              >
                {genderArr &&
                  genderArr.length > 0 &&
                  genderArr.map((item, index) => (
                    <option key={index} value={item.keyMap}>
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </option>
                  ))}
              </select>
            </div>

            {/* Position Select */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.position" />
              </label>
              <select
                className="form-control"
                onChange={(event) => onChangeInput(event, 'position')}
                value={position}
              >
                {positionArr &&
                  positionArr.length > 0 &&
                  positionArr.map((item, index) => (
                    <option key={index} value={item.keyMap}>
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </option>
                  ))}
              </select>
            </div>

            {/* Role Select */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.role" />
              </label>
              <select
                className="form-control"
                onChange={(event) => onChangeInput(event, 'role')}
                value={role}
              >
                {roleArr &&
                  roleArr.length > 0 &&
                  roleArr.map((item, index) => (
                    <option key={index} value={item.keyMap}>
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </option>
                  ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.image" />
              </label>
              <div className="preview-img-container">
                <input
                  id="previewImg"
                  type="file"
                  hidden
                  onChange={handleOnchangeImage}
                />
                <label className="label-upload" htmlFor="previewImg">
                  Tải ảnh<i className="fas fa-upload"></i>
                </label>
                <div
                  className="preview-image"
                  style={{ backgroundImage: `url(${previewImgURL})` }}
                  onClick={openPreviewImage}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openPreviewImage();
                    }
                  }}
                ></div>
              </div>
            </div>

            {/* Save/Edit Button */}
            <div className="col-12 my-3">
              <button
                className={
                  action === CRUD_ACTIONS.EDIT
                    ? 'btn btn-warning'
                    : 'btn btn-primary'
                }
                onClick={handleSaveUser}
              >
                {action === CRUD_ACTIONS.EDIT ? (
                  <FormattedMessage id="manage-user.edit" />
                ) : (
                  <FormattedMessage id="manage-user.save" />
                )}
              </button>
            </div>

            {/* Users Table */}
            <div className="col-12 mb-5">
              <table id="TableManageUser">
                <tbody>
                  <tr>
                    <th>Email</th>
                    <th>First name</th>
                    <th>Last name</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                  {usersRedux &&
                    usersRedux.length > 0 &&
                    usersRedux.map((item, index) => (
                      <tr key={index}>
                        <td>{item.email}</td>
                        <td>{item.firstName}</td>
                        <td>{item.lastName}</td>
                        <td>{item.address}</td>
                        <td>
                          <button
                            onClick={() => handleEditUserFromParent(item)}
                            className="btn-edit"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(item)}
                            className="btn-delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Lightbox */}
      {isOpen && (
        <Lightbox
          mainSrc={previewImgURL}
          onCloseRequest={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserRedux;
