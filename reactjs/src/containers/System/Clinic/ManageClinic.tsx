import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './ManageClinic.scss';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import {
  createNewClinic,
  deleteClinic,
  getAllClinic,
  IApiResponse,
  updateClinic,
} from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt();

interface ClinicItem {
  id: number | string;
  name: string;
  address: string;
  image?: string;
  descriptionHTML?: string;
  descriptionMarkdown?: string;
}

interface ClinicFormState {
  id?: number | string | null;
  name: string;
  address: string;
  imageBase64: string;
  descriptionHTML: string;
  descriptionMarkdown: string;
}

interface MarkdownEditorChange {
  html: string;
  text: string;
}

type FormAction = 'CREATE' | 'EDIT';

const ManageClinic: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [descriptionHTML, setDescriptionHTML] = useState<string>('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState<string>('');
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [action, setAction] = useState<FormAction>('CREATE');
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const pageSize = 5;

  const fetchAllClinics = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = (await getAllClinic()) as unknown as IApiResponse<
        ClinicItem[]
      >;

      if (res && res.errCode === 0) {
        setClinics(res.data || []);
      } else {
        toast.error(res?.errMessage || 'Failed to load clinics');
      }
    } catch {
      toast.error('Failed to load clinics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllClinics();
  }, [fetchAllClinics]);

  const resetForm = useCallback(() => {
    setName('');
    setAddress('');
    setImageBase64('');
    setDescriptionHTML('');
    setDescriptionMarkdown('');
    setAction('CREATE');
    setEditingId(null);
  }, []);

  const handleOnChangeInput = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      fieldName: 'name' | 'address' | 'searchText'
    ) => {
      const value = event.target.value;
      if (fieldName === 'name') {
        setName(value);
      } else if (fieldName === 'address') {
        setAddress(value);
      } else {
        setSearchText(value);
        setCurrentPage(1);
      }
    },
    []
  );

  const handleEditorChange = useCallback(
    ({ html, text }: MarkdownEditorChange) => {
      setDescriptionHTML(html);
      setDescriptionMarkdown(text);
    },
    []
  );

  const handleOnChangeImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const data = event.target.files;
      if (data && data.length > 0) {
        const file = data[0];
        try {
          const base64 = await CommonUtils.getBase64(file);
          setImageBase64(base64 as string);
        } catch {
          toast.error('Failed to process image');
        }
      }
    },
    []
  );

  const handleSaveClinic = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Please enter clinic name');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter clinic address');
      return;
    }

    if (action === 'CREATE' && !imageBase64) {
      toast.error('Please select clinic image');
      return;
    }

    if (!descriptionMarkdown.trim()) {
      toast.error('Please enter clinic description');
      return;
    }

    setIsSaving(true);

    try {
      const clinicData: ClinicFormState = {
        id: editingId,
        name,
        address,
        imageBase64,
        descriptionHTML,
        descriptionMarkdown,
      };

      const res = (action === 'EDIT'
        ? await updateClinic(clinicData)
        : await createNewClinic(clinicData)) as unknown as IApiResponse;

      if (res && res.errCode === 0) {
        toast.success(
          action === 'EDIT' ? 'Update clinic succeed!' : 'Add new clinic succeed!'
        );
        resetForm();
        await fetchAllClinics();
      } else {
        toast.error(res?.errMessage || res?.message || 'Something wrongs....');
      }
    } catch {
      toast.error('Failed to save clinic');
    } finally {
      setIsSaving(false);
    }
  }, [
    action,
    address,
    descriptionHTML,
    descriptionMarkdown,
    editingId,
    fetchAllClinics,
    imageBase64,
    name,
    resetForm,
  ]);

  const handleEditClinic = useCallback((item: ClinicItem) => {
    setName(item.name || '');
    setAddress(item.address || '');
    setImageBase64('');
    setDescriptionHTML(item.descriptionHTML || '');
    setDescriptionMarkdown(item.descriptionMarkdown || '');
    setAction('EDIT');
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteClinic = useCallback(
    async (item: ClinicItem) => {
      const isConfirmed = window.confirm(
        `Bạn có chắc muốn xóa cơ sở y tế "${item.name}" không?`
      );

      if (!isConfirmed) return;

      try {
        const res = (await deleteClinic(item.id)) as unknown as IApiResponse;
        if (res && res.errCode === 0) {
          toast.success('Delete clinic succeed!');
          await fetchAllClinics();
        } else {
          toast.error(res?.errMessage || 'Cannot delete clinic');
        }
      } catch {
        toast.error('Failed to delete clinic');
      }
    },
    [fetchAllClinics]
  );

  const filteredClinics = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return clinics;

    return clinics.filter((item) =>
      `${item.name || ''} ${item.address || ''}`.toLowerCase().includes(keyword)
    );
  }, [clinics, searchText]);

  const totalPages = Math.max(Math.ceil(filteredClinics.length / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredClinics.slice(startIndex, startIndex + pageSize);
  }, [filteredClinics, safeCurrentPage]);

  return (
    <div className="manage-specialty-container">
      <div className="ms-title">Quản lý phòng khám</div>
      <div className="add-new-specialty row">
        <div className="col-6 form-group">
          <label>Tên phòng khám</label>
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={(event) => handleOnChangeInput(event, 'name')}
            placeholder="Enter clinic name"
          />
        </div>

        <div className="col-6 form-group">
          <label>Ảnh phòng khám</label>
          <input
            className="form-control-file"
            type="file"
            accept="image/*"
            onChange={handleOnChangeImage}
          />
          {imageBase64 && <small className="text-success">Image uploaded</small>}
        </div>

        <div className="col-6 form-group">
          <label>Địa chỉ phòng khám</label>
          <input
            className="form-control"
            type="text"
            value={address}
            onChange={(event) => handleOnChangeInput(event, 'address')}
            placeholder="Enter clinic address"
          />
        </div>

        <div className="col-12 mt-3">
          <label>Mô tả chi tiết</label>
          <MdEditor
            style={{ height: '300px' }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
            value={descriptionMarkdown}
          />
        </div>

        <div className="col-12 form-actions">
          <button
            className="btn-save-specialty"
            onClick={handleSaveClinic}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : action === 'EDIT' ? 'Update' : 'Save'}
          </button>
          {action === 'EDIT' && (
            <button
              className="btn-cancel-edit"
              onClick={resetForm}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="management-list-panel">
        <div className="management-toolbar">
          <div>
            <h3>Danh sách cơ sở y tế</h3>
            <span>{filteredClinics.length} cơ sở y tế</span>
          </div>
          <input
            className="management-search"
            value={searchText}
            onChange={(event) => handleOnChangeInput(event, 'searchText')}
            placeholder="Tìm theo tên hoặc địa chỉ"
          />
        </div>

        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên cơ sở</th>
                <th>Địa chỉ</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div
                        className="management-thumb"
                        style={{
                          backgroundImage: item.image ? `url(${item.image})` : 'none',
                        }}
                      >
                        {!item.image && 'No image'}
                      </div>
                    </td>
                    <td className="item-name">{item.name}</td>
                    <td className="item-address">{item.address}</td>
                    <td className="item-description">
                      {item.descriptionMarkdown || 'Chưa có mô tả'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-edit-item"
                          onClick={() => handleEditClinic(item)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete-item"
                          onClick={() => handleDeleteClinic(item)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Không có cơ sở y tế phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage(safeCurrentPage - 1)}
          >
            Trước
          </button>
          <span>
            Trang {safeCurrentPage}/{totalPages}
          </span>
          <button
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage(safeCurrentPage + 1)}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageClinic;
