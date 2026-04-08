import React, { useState, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import './ManageClinic.scss';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { createNewClinic, IApiResponse } from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt();

interface ClinicFormState {
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

const ManageClinic: React.FC = () => {
  // Form State
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [descriptionHTML, setDescriptionHTML] = useState<string>('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setName('');
    setAddress('');
    setImageBase64('');
    setDescriptionHTML('');
    setDescriptionMarkdown('');
  }, []);

  // Handle text input changes (name, address)
  const handleOnChangeInput = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      fieldName: 'name' | 'address'
    ) => {
      const value = event.target.value;
      if (fieldName === 'name') {
        setName(value);
      } else if (fieldName === 'address') {
        setAddress(value);
      }
    },
    []
  );

  // Handle markdown editor change
  const handleEditorChange = useCallback(
    ({ html, text }: MarkdownEditorChange) => {
      setDescriptionHTML(html);
      setDescriptionMarkdown(text);
    },
    []
  );

  // Handle image file selection and convert to base64
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

  // Save new clinic to database
  const handleSaveNewClinic = useCallback(async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error('Please enter clinic name');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter clinic address');
      return;
    }

    if (!imageBase64) {
      toast.error('Please select clinic image');
      return;
    }

    if (!descriptionMarkdown.trim()) {
      toast.error('Please enter clinic description');
      return;
    }

    setIsLoading(true);

    try {
      const clinicData: ClinicFormState = {
        name,
        address,
        imageBase64,
        descriptionHTML,
        descriptionMarkdown,
      };

      const res = (await createNewClinic(
        clinicData
      )) as unknown as IApiResponse;

      if (res && res.errCode === 0) {
        toast.success('Add new clinic succeed!');
        resetForm();
      } else {
        toast.error(res?.message || 'Something wrongs....');
      }
    } catch {
      toast.error('Failed to create clinic');
    } finally {
      setIsLoading(false);
    }
  }, [
    name,
    address,
    imageBase64,
    descriptionHTML,
    descriptionMarkdown,
    resetForm,
  ]);

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
          {imageBase64 && (
            <small className="text-success">Image uploaded</small>
          )}
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

        <div className="col-12">
          <button
            className="btn-save-specialty"
            onClick={handleSaveNewClinic}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageClinic;
