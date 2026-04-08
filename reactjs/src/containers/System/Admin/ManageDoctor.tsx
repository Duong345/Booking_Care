import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { LANGUAGES, CRUD_ACTIONS } from '../../../utils';
import * as actions from '../../../store/actions';
import {
  saveDetailDoctorService,
  getDetailInforDoctor,
} from '../../../services/userService';
import './ManageDoctor.scss';

const mdParser = new MarkdownIt();

interface DoctorOption {
  label: string;
  value: string | number;
}

interface SelectOption {
  label: string;
  value: string;
}

interface DoctorMarkdown {
  contentHTML: string;
  contentMarkdown: string;
  description: string;
}

interface DoctorInfo {
  Doctor_Infor?: {
    addressClinic: string;
    nameClinic: string;
    note: string;
    paymentId: string;
    priceId: string;
    provinceId: string;
    specialtyId: string;
    clinicId: string;
  };
  Markdown: DoctorMarkdown;
}

interface ApiResponse {
  errCode: number;
  data?: DoctorInfo;
}

interface AllRequiredDoctorInfor {
  resPayment: any[];
  resPrice: any[];
  resProvince: any[];
  resSpecialty: any[];
  resClinic: any[];
}

interface RootState {
  app: {
    language: string;
  };
  admin: {
    allDoctors: any[];
    allRequiredDoctorInfor: AllRequiredDoctorInfor;
  };
}

const ManageDoctor = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.app.language);
  const allDoctors = useSelector((state: RootState) => state.admin.allDoctors);
  const allRequiredDoctorInfor = useSelector(
    (state: RootState) => state.admin.allRequiredDoctorInfor
  );

  // Local state
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [contentHTML, setContentHTML] = useState('');
  const [selectedOption, setSelectedOption] = useState<DoctorOption | null>(
    null
  );
  const [description, setDescription] = useState('');
  const [listDoctors, setListDoctors] = useState<DoctorOption[]>([]);
  const [hasOldData, setHasOldData] = useState(false);

  const [listPrice, setListPrice] = useState<SelectOption[]>([]);
  const [listPayment, setListPayment] = useState<SelectOption[]>([]);
  const [listProvince, setListProvince] = useState<SelectOption[]>([]);
  const [listClinic, setListClinic] = useState<SelectOption[]>([]);
  const [listSpecialty, setListSpecialty] = useState<SelectOption[]>([]);

  const [selectedPrice, setSelectedPrice] = useState<SelectOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SelectOption | null>(
    null
  );
  const [selectedProvince, setSelectedProvince] = useState<SelectOption | null>(
    null
  );
  const [selectedSpecialty, setSelectedSpecialty] =
    useState<SelectOption | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<SelectOption | null>(
    null
  );

  const [nameClinic, setNameClinic] = useState('');
  const [addressClinic, setAddressClinic] = useState('');
  const [note, setNote] = useState('');

  // Build select options
  const buildDataInputSelect = useCallback(
    (inputData: any[], type: string) => {
      let result: Array<{ label: string; value: any }> = [];

      if (!inputData || inputData.length === 0) return result;

      if (type === 'USERS') {
        inputData.forEach((item) => {
          const labelVi = `${item.lastName} ${item.firstName}`;
          const labelEn = `${item.firstName} ${item.lastName}`;
          result.push({
            label: language === LANGUAGES.VI ? labelVi : labelEn,
            value: item.id,
          });
        });
      } else if (type === 'PRICE') {
        inputData.forEach((item) => {
          const labelVi = `${item.valueVi}`;
          const labelEn = `${item.valueEn} USD`;
          result.push({
            label: language === LANGUAGES.VI ? labelVi : labelEn,
            value: item.keyMap,
          });
        });
      } else if (type === 'PAYMENT' || type === 'PROVINCE') {
        inputData.forEach((item) => {
          const labelVi = `${item.valueVi}`;
          const labelEn = `${item.valueEn}`;
          result.push({
            label: language === LANGUAGES.VI ? labelVi : labelEn,
            value: item.keyMap,
          });
        });
      } else if (type === 'SPECIALTY') {
        inputData.forEach((item) => {
          result.push({
            label: item.name,
            value: item.id,
          });
        });
      } else if (type === 'CLINIC') {
        inputData.forEach((item) => {
          result.push({
            label: item.name,
            value: item.id,
          });
        });
      }

      return result;
    },
    [language]
  );

  // Initialize on mount
  useEffect(() => {
    (dispatch as any)(actions.fetchAllDoctors());
    (dispatch as any)(actions.getAllRequiredDoctorInfor());
  }, [dispatch]);

  // Update doctors list
  useEffect(() => {
    if (allDoctors && allDoctors.length > 0) {
      const dataSelect = buildDataInputSelect(allDoctors, 'USERS');
      setListDoctors(dataSelect);
    }
  }, [allDoctors, buildDataInputSelect]);

  // Update required doctor info
  useEffect(() => {
    if (allRequiredDoctorInfor) {
      const { resPayment, resPrice, resProvince, resSpecialty, resClinic } =
        allRequiredDoctorInfor;
      const dataSelectPrice = buildDataInputSelect(resPrice, 'PRICE');
      const dataSelectPayment = buildDataInputSelect(resPayment, 'PAYMENT');
      const dataSelectProvince = buildDataInputSelect(resProvince, 'PROVINCE');
      const dataSelectSpecialty = buildDataInputSelect(
        resSpecialty,
        'SPECIALTY'
      );
      const dataSelectClinic = buildDataInputSelect(resClinic, 'CLINIC');

      setListPrice(dataSelectPrice);
      setListPayment(dataSelectPayment);
      setListProvince(dataSelectProvince);
      setListSpecialty(dataSelectSpecialty);
      setListClinic(dataSelectClinic);
    }
  }, [allRequiredDoctorInfor, buildDataInputSelect]);

  // Handle markdown editor change
  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setContentMarkdown(text);
      setContentHTML(html);
    },
    []
  );

  // Load doctor detail when selected
  const handleChangeSelect = useCallback(
    async (selectedOption: DoctorOption | null) => {
      if (!selectedOption) {
        setSelectedOption(null);
        resetForm();
        return;
      }

      setSelectedOption(selectedOption);

      // Convert value to number if it's a string
      const doctorId =
        typeof selectedOption.value === 'string'
          ? parseInt(selectedOption.value, 10)
          : selectedOption.value;

      const res = (await getDetailInforDoctor(
        doctorId
      )) as unknown as ApiResponse;

      if (res && res.errCode === 0 && res.data && res.data.Markdown) {
        const markdown = res.data.Markdown;
        let addressClinic = '';
        let nameClinic = '';
        let note = '';
        let selectedPayment: SelectOption | null = null;
        let selectedPrice: SelectOption | null = null;
        let selectedProvince: SelectOption | null = null;
        let selectedSpecialty: SelectOption | null = null;
        let selectedClinic: SelectOption | null = null;

        if (res.data.Doctor_Infor) {
          const doctorInfo = res.data.Doctor_Infor;
          addressClinic = doctorInfo.addressClinic || '';
          nameClinic = doctorInfo.nameClinic || '';
          note = doctorInfo.note || '';

          selectedPayment =
            listPayment.find((item) => item.value === doctorInfo.paymentId) ||
            null;
          selectedPrice =
            listPrice.find((item) => item.value === doctorInfo.priceId) || null;
          selectedProvince =
            listProvince.find((item) => item.value === doctorInfo.provinceId) ||
            null;
          selectedSpecialty =
            listSpecialty.find(
              (item) => item.value === doctorInfo.specialtyId
            ) || null;
          selectedClinic =
            listClinic.find((item) => item.value === doctorInfo.clinicId) ||
            null;
        }

        setContentHTML(markdown.contentHTML);
        setContentMarkdown(markdown.contentMarkdown);
        setDescription(markdown.description);
        setHasOldData(true);
        setAddressClinic(addressClinic);
        setNameClinic(nameClinic);
        setNote(note);
        setSelectedPayment(selectedPayment);
        setSelectedPrice(selectedPrice);
        setSelectedProvince(selectedProvince);
        setSelectedSpecialty(selectedSpecialty);
        setSelectedClinic(selectedClinic);
      } else {
        resetForm();
      }
    },
    [listPayment, listPrice, listProvince, listSpecialty, listClinic]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setContentHTML('');
    setContentMarkdown('');
    setDescription('');
    setHasOldData(false);
    setAddressClinic('');
    setNameClinic('');
    setNote('');
    setSelectedPayment(null);
    setSelectedPrice(null);
    setSelectedProvince(null);
    setSelectedSpecialty(null);
    setSelectedClinic(null);
  }, []);

  // Handle select change for doctor info - factory function
  const createSelectHandler = useCallback(
    (
      fieldName:
        | 'selectedPrice'
        | 'selectedPayment'
        | 'selectedProvince'
        | 'selectedSpecialty'
        | 'selectedClinic'
    ) =>
      (selectedOption: SelectOption | null) => {
        switch (fieldName) {
          case 'selectedPrice':
            setSelectedPrice(selectedOption);
            break;
          case 'selectedPayment':
            setSelectedPayment(selectedOption);
            break;
          case 'selectedProvince':
            setSelectedProvince(selectedOption);
            break;
          case 'selectedSpecialty':
            setSelectedSpecialty(selectedOption);
            break;
          case 'selectedClinic':
            setSelectedClinic(selectedOption);
            break;
          default:
            break;
        }
      },
    []
  );

  // Handle text input change
  const handleOnChangeText = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      id: string
    ) => {
      if (id === 'description') setDescription(event.target.value);
      else if (id === 'nameClinic') setNameClinic(event.target.value);
      else if (id === 'addressClinic') setAddressClinic(event.target.value);
      else if (id === 'note') setNote(event.target.value);
    },
    []
  );

  // Handle save
  const handleSaveContentMarkdown = useCallback(() => {
    if (
      !selectedOption ||
      !selectedPrice ||
      !selectedPayment ||
      !selectedProvince ||
      !selectedSpecialty
    ) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    (dispatch as any)(
      actions.saveDetailDoctor({
        contentHTML: contentHTML,
        contentMarkdown: contentMarkdown,
        description: description,
        doctorId: selectedOption.value,
        action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,
        selectedPrice: selectedPrice.value,
        selectedPayment: selectedPayment.value,
        selectedProvince: selectedProvince.value,
        nameClinic: nameClinic,
        addressClinic: addressClinic,
        note: note,
        specialtyId: selectedSpecialty.value,
        clinicId:
          selectedClinic && selectedClinic.value ? selectedClinic.value : '',
      })
    );
  }, [
    selectedOption,
    selectedPrice,
    selectedPayment,
    selectedProvince,
    selectedSpecialty,
    selectedClinic,
    contentHTML,
    contentMarkdown,
    description,
    nameClinic,
    addressClinic,
    note,
    hasOldData,
    dispatch,
  ]);

  return (
    <div className="manage-doctor-container">
      <div className="manage-doctor-title">
        <FormattedMessage id="admin.manage-doctor.title" />
      </div>

      <div className="more-infor">
        <div className="content-left form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.select-doctor" />
          </label>
          <Select
            value={selectedOption}
            onChange={handleChangeSelect}
            options={listDoctors}
            placeholder={
              <FormattedMessage id="admin.manage-doctor.select-doctor" />
            }
            isClearable
          />
        </div>
        <div className="content-right">
          <label>
            <FormattedMessage id="admin.manage-doctor.intro" />
          </label>
          <textarea
            className="form-control"
            onChange={(event) => handleOnChangeText(event, 'description')}
            value={description}
          ></textarea>
        </div>
      </div>

      <div className="more-infor-extra row">
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.price" />
          </label>
          <Select
            value={selectedPrice}
            onChange={createSelectHandler('selectedPrice')}
            options={listPrice}
            placeholder={<FormattedMessage id="admin.manage-doctor.price" />}
            name="selectedPrice"
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.payment" />
          </label>
          <Select
            value={selectedPayment}
            onChange={createSelectHandler('selectedPayment')}
            options={listPayment}
            placeholder={<FormattedMessage id="admin.manage-doctor.payment" />}
            name="selectedPayment"
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.province" />
          </label>
          <Select
            value={selectedProvince}
            onChange={createSelectHandler('selectedProvince')}
            options={listProvince}
            placeholder={<FormattedMessage id="admin.manage-doctor.province" />}
            name="selectedProvince"
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.nameClinic" />
          </label>
          <input
            className="form-control"
            onChange={(event) => handleOnChangeText(event, 'nameClinic')}
            value={nameClinic}
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.addressClinic" />
          </label>
          <input
            className="form-control"
            onChange={(event) => handleOnChangeText(event, 'addressClinic')}
            value={addressClinic}
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.note" />
          </label>
          <input
            className="form-control"
            onChange={(event) => handleOnChangeText(event, 'note')}
            value={note}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.specialty" />
          </label>
          <Select
            value={selectedSpecialty}
            options={listSpecialty}
            placeholder={
              <FormattedMessage id="admin.manage-doctor.specialty" />
            }
            name="selectedSpecialty"
            onChange={createSelectHandler('selectedSpecialty')}
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.select-clinic" />
          </label>
          <Select
            value={selectedClinic}
            options={listClinic}
            placeholder={
              <FormattedMessage id="admin.manage-doctor.select-clinic" />
            }
            name="selectedClinic"
            onChange={createSelectHandler('selectedClinic')}
            isClearable
          />
        </div>
      </div>

      <div className="manage-doctor-editor">
        <MdEditor
          style={{ height: '300px' }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
          value={contentMarkdown}
        />
      </div>

      <button
        onClick={handleSaveContentMarkdown}
        className={
          hasOldData === true ? 'save-content-doctor' : 'create-content-doctor'
        }
      >
        {hasOldData === true ? (
          <span>
            <FormattedMessage id="admin.manage-doctor.save" />
          </span>
        ) : (
          <span>
            <FormattedMessage id="admin.manage-doctor.add" />
          </span>
        )}
      </button>
    </div>
  );
};

export default ManageDoctor;
