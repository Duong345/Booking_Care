import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import './ManageSchedule.scss';
import Select from 'react-select';
import { LANGUAGES, CRUD_ACTIONS, dateFormat } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import _ from 'lodash';
import {
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
} from '../../../services/userService';
class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDoctor: {},
      listDoctors: [],
      currentDate: moment(new Date()).startOf('day').valueOf(), // default to today
      rangeTime: [],
      isDoctorMode: false,
    };
  }
  componentDidMount() {
    this.props.fetchAllDoctors();
    this.props.fetchAllScheduleTime();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.allDoctors !== this.props.allDoctors ||
      prevProps.userInfo !== this.props.userInfo
    ) {
      // Build the normal list
      let dataSelect = this.buildDataInputSelect(this.props.allDoctors);

      // If the logged-in user is a doctor, restrict the list to only that doctor
      if (this.props.userInfo && this.props.userInfo.roleId === 'R2') {
        const doctor = this.props.allDoctors.find(
          (d) => d.id === this.props.userInfo.id
        );
        if (doctor) {
          let singleSelect = this.buildDataInputSelect([doctor]);
          this.setState(
            {
              listDoctors: singleSelect,
              selectedDoctor: singleSelect.length > 0 ? singleSelect[0] : {},
              isDoctorMode: true,
            },
            async () => {
              // fetch saved schedule for default date
              if (singleSelect.length > 0) {
                await this.fetchScheduleForDate(
                  singleSelect[0].value,
                  this.state.currentDate
                );
              }
            }
          );
          // don't fallthrough to set full list
          return;
        }
      }

      this.setState({
        listDoctors: dataSelect,
        isDoctorMode: false,
      });
    }
    if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
      let data = this.props.allScheduleTime;
      if (data && data.length > 0) {
        data = data.map((item) => ({ ...item, isSelected: false }));
      }
      this.setState({
        rangeTime: data,
      });
    }
  }
  buildDataInputSelect = (inputData) => {
    let result = [];
    let { language } = this.props;
    if (inputData && inputData.length > 0) {
      inputData.map((item, index) => {
        let object = {};
        let labelVi = `${item.lastName} ${item.firstName}`;
        let labelEn = `${item.firstName} ${item.lastName}`;

        object.label = language === LANGUAGES.VI ? labelVi : labelEn;
        object.value = item.id;
        result.push(object);
      });
    }
    return result;
  };
  handleChangeSelect = async (selectedOption) => {
    this.setState({ selectedDoctor: selectedOption }, async () => {
      if (selectedOption && selectedOption.value && this.state.currentDate) {
        await this.fetchScheduleForDate(
          selectedOption.value,
          this.state.currentDate
        );
      }
    });
  };

  handleOnchangeDatePicker = (date) => {
    this.setState(
      {
        currentDate: date[0],
      },
      async () => {
        // when date changes, refetch schedules for the selected doctor
        if (this.state.selectedDoctor && this.state.selectedDoctor.value) {
          await this.fetchScheduleForDate(
            this.state.selectedDoctor.value,
            this.state.currentDate
          );
        }
      }
    );
  };
  handleClickBtnTime = (time) => {
    let { rangeTime } = this.state;
    if (rangeTime && rangeTime.length > 0) {
      rangeTime = rangeTime.map((item) => {
        if (item.id === time.id) item.isSelected = !item.isSelected;

        return item;
      });
      this.setState({
        rangeTime: rangeTime,
      });
    }
  };

  fetchScheduleForDate = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      let formatedDate = new Date(date).getTime();
      let res = await getScheduleDoctorByDate(doctorId, formatedDate);
      if (res && res.errCode === 0) {
        // res.data is array of schedules with timeType
        let booked = res.data || [];
        let { rangeTime } = this.state;
        if (rangeTime && rangeTime.length > 0) {
          let newRange = rangeTime.map((rt) => {
            let exists = booked.find((b) => b.timeType === rt.keyMap);
            return { ...rt, isSelected: exists ? true : false };
          });
          this.setState({ rangeTime: newRange });
        }
      }
    } catch (e) {
      console.log('fetchScheduleForDate error', e);
    }
  };
  handleSaveSchedule = async () => {
    let { rangeTime, selectedDoctor, currentDate } = this.state;
    let result = [];
    if (!currentDate) {
      toast.error('Invalid date!');
      return;
    }
    if (selectedDoctor && _.isEmpty(selectedDoctor)) {
      toast.error('invalid selected doctor');
      return;
    }
    let formatedDate = new Date(currentDate).getTime();
    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      if (selectedTime && selectedTime.length > 0) {
        selectedTime.map((schedule, index) => {
          let object = {};
          object.doctorId = selectedDoctor.value;
          object.date = formatedDate;
          object.timeType = schedule.keyMap;
          result.push(object);
        });
      } else {
        toast.error('invalid selected time');
        return;
      }
    }
    let res = await saveBulkScheduleDoctor({
      arrSchedule: result,
      doctorId: selectedDoctor.value,
      formatedDate: formatedDate,
    });
    if (res && res.errCode === 0) {
      toast.success('save infor succeed');
      // refresh schedule to reflect created/deleted slots
      await this.fetchScheduleForDate(selectedDoctor.value, formatedDate);
    } else {
      toast.error('error saveBulkScheduleDoctor');
    }
  };
  render() {
    let { rangeTime } = this.state;
    let { language } = this.props;
    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    return (
      <div className="manage-schedule-container">
        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="manage-schedule.choose-doctor" />
              </label>
              <Select
                value={this.state.selectedDoctor}
                onChange={this.handleChangeSelect}
                options={this.state.listDoctors}
                isDisabled={this.state.isDoctorMode}
                isSearchable={!this.state.isDoctorMode}
              />
            </div>
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="manage-schedule.choose-date" />
              </label>
              <DatePicker
                onChange={this.handleOnchangeDatePicker}
                className="form-control"
                value={this.state.currentDate}
                minDate={yesterday}
              />
            </div>
            <div className="col-12 pick-hour-container">
              {rangeTime &&
                rangeTime.length > 0 &&
                rangeTime.map((item, index) => {
                  return (
                    <button
                      className={
                        item.isSelected === true
                          ? 'btn btn-schedule active'
                          : 'btn btn-schedule'
                      }
                      key={index}
                      onClick={() => this.handleClickBtnTime(item)}
                    >
                      {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                    </button>
                  );
                })}
            </div>
            <div className="col-12">
              <button
                className="btn btn-primary btn-save-schedule"
                onClick={() => this.handleSaveSchedule()}
              >
                <FormattedMessage id="manage-schedule.save" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    allDoctors: state.admin.allDoctors,
    allScheduleTime: state.admin.allScheduleTime,
    userInfo: state.user.userInfo,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
