import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ManageSpecialty.scss';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import {
  createNewSpecialty,
  deleteSpecialty,
  getAllSpecialty,
  updateSpecialty,
} from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      imageBase64: '',
      descriptionHTML: '',
      descriptionMarkdown: '',
      specialties: [],
      searchText: '',
      currentPage: 1,
      pageSize: 5,
      isLoading: false,
      isSaving: false,
      action: 'CREATE',
      editingId: null,
    };
  }

  async componentDidMount() {
    await this.fetchAllSpecialties();
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
    }
  }

  fetchAllSpecialties = async () => {
    this.setState({ isLoading: true });

    try {
      let res = await getAllSpecialty();
      if (res && res.errCode === 0) {
        this.setState({
          specialties: res.data || [],
        });
      } else {
        toast.error(res?.errMessage || 'Failed to load specialties');
      }
    } catch (e) {
      toast.error('Failed to load specialties');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleOnChangeInput = (event, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = event.target.value;
    if (id === 'searchText') {
      stateCopy.currentPage = 1;
    }
    this.setState({
      ...stateCopy,
    });
  };

  handleEditorChange = ({ html, text }) => {
    this.setState({
      descriptionHTML: html,
      descriptionMarkdown: text,
    });
  };

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      this.setState({
        imageBase64: base64,
      });
    }
  };

  resetForm = () => {
    this.setState({
      name: '',
      imageBase64: '',
      descriptionHTML: '',
      descriptionMarkdown: '',
      action: 'CREATE',
      editingId: null,
    });
  };

  handleSaveSpecialty = async () => {
    let {
      action,
      editingId,
      name,
      imageBase64,
      descriptionHTML,
      descriptionMarkdown,
    } = this.state;

    if (!name.trim()) {
      toast.error('Please enter specialty name');
      return;
    }

    if (action === 'CREATE' && !imageBase64) {
      toast.error('Please select specialty image');
      return;
    }

    if (!descriptionMarkdown.trim()) {
      toast.error('Please enter specialty description');
      return;
    }

    this.setState({ isSaving: true });

    try {
      let payload = {
        id: editingId,
        name,
        imageBase64,
        descriptionHTML,
        descriptionMarkdown,
      };
      let res =
        action === 'EDIT'
          ? await updateSpecialty(payload)
          : await createNewSpecialty(payload);

      if (res && res.errCode === 0) {
        toast.success(
          action === 'EDIT'
            ? 'Update specialty succeed!'
            : 'Add new specialty succeed!'
        );
        this.resetForm();
        await this.fetchAllSpecialties();
      } else {
        toast.error(res?.errMessage || 'Something wrongs...');
      }
    } catch (e) {
      toast.error('Failed to save specialty');
    } finally {
      this.setState({ isSaving: false });
    }
  };

  handleEditSpecialty = (item) => {
    this.setState({
      name: item.name || '',
      imageBase64: '',
      descriptionHTML: item.descriptionHTML || '',
      descriptionMarkdown: item.descriptionMarkdown || '',
      action: 'EDIT',
      editingId: item.id,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  handleDeleteSpecialty = async (item) => {
    let isConfirmed = window.confirm(
      `Bạn có chắc muốn xóa chuyên khoa "${item.name}" không?`
    );

    if (!isConfirmed) return;

    try {
      let res = await deleteSpecialty(item.id);
      if (res && res.errCode === 0) {
        toast.success('Delete specialty succeed!');
        await this.fetchAllSpecialties();
      } else {
        toast.error(res?.errMessage || 'Cannot delete specialty');
      }
    } catch (e) {
      toast.error('Failed to delete specialty');
    }
  };

  getFilteredSpecialties = () => {
    let { specialties, searchText } = this.state;
    let keyword = searchText.trim().toLowerCase();

    if (!keyword) return specialties;

    return specialties.filter((item) =>
      `${item.name || ''}`.toLowerCase().includes(keyword)
    );
  };

  render() {
    let {
      name,
      imageBase64,
      descriptionMarkdown,
      searchText,
      currentPage,
      pageSize,
      isLoading,
      isSaving,
      action,
    } = this.state;
    let filteredSpecialties = this.getFilteredSpecialties();
    let totalPages = Math.max(Math.ceil(filteredSpecialties.length / pageSize), 1);
    let safeCurrentPage = Math.min(currentPage, totalPages);
    let startIndex = (safeCurrentPage - 1) * pageSize;
    let currentItems = filteredSpecialties.slice(
      startIndex,
      startIndex + pageSize
    );

    return (
      <div className="manage-specialty-container">
        <div className="ms-title">Quản lý chuyên khoa</div>
        <div className="add-new-specialty row">
          <div className="col-6 form-group">
            <label>Tên chuyên khoa</label>
            <input
              className="form-control"
              type="text"
              value={name}
              onChange={(event) => this.handleOnChangeInput(event, 'name')}
              placeholder="Nhập tên chuyên khoa"
            />
          </div>
          <div className="col-6 form-group">
            <label>Ảnh chuyên khoa</label>
            <input
              className="form-control-file"
              type="file"
              accept="image/*"
              onChange={(event) => this.handleOnChangeImage(event)}
            />
            {imageBase64 && <small className="text-success">Image uploaded</small>}
          </div>
          <div className="col-12 mt-3">
            <MdEditor
              style={{ height: '300px' }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={this.handleEditorChange}
              value={descriptionMarkdown}
            />
          </div>
          <div className="col-12 form-actions">
            <button
              className="btn-save-specialty"
              onClick={() => this.handleSaveSpecialty()}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : action === 'EDIT' ? 'Update' : 'Save'}
            </button>
            {action === 'EDIT' && (
              <button
                className="btn-cancel-edit"
                onClick={() => this.resetForm()}
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
              <h3>Danh sách chuyên khoa</h3>
              <span>{filteredSpecialties.length} chuyên khoa</span>
            </div>
            <input
              className="management-search"
              value={searchText}
              onChange={(event) => this.handleOnChangeInput(event, 'searchText')}
              placeholder="Tìm theo tên chuyên khoa"
            />
          </div>

          <div className="management-table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên chuyên khoa</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="empty-row">
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
                            backgroundImage: item.image
                              ? `url(${item.image})`
                              : 'none',
                          }}
                        >
                          {!item.image && 'No image'}
                        </div>
                      </td>
                      <td className="item-name">{item.name}</td>
                      <td className="item-description">
                        {item.descriptionMarkdown || 'Chưa có mô tả'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-edit-item"
                            onClick={() => this.handleEditSpecialty(item)}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn-delete-item"
                            onClick={() => this.handleDeleteSpecialty(item)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      Không có chuyên khoa phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => this.setState({ currentPage: safeCurrentPage - 1 })}
            >
              Trước
            </button>
            <span>
              Trang {safeCurrentPage}/{totalPages}
            </span>
            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => this.setState({ currentPage: safeCurrentPage + 1 })}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty);
