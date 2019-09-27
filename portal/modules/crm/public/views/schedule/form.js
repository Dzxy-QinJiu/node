var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
require('../../css/schedule.less');
var ScheduleAction = require('../../action/schedule-action');
var BatchChangeActions = require('../../action/batch-change-actions');
var basicOverviewAction = require('../../action/basic-overview-actions');
import {Form, Input, message, Select, Radio, Switch, TimePicker} from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const FormItem = Form.Item;
import 'react-date-picker/index.css';
import BootstrapDatepicker from '../../../../../components/bootstrap-datepicker';
import ValidateMixin from '../../../../../mixins/ValidateMixin';
import Trace from 'LIB_DIR/trace';
import {SELECT_FULL_OPTIONS, NO_SELECT_FULL_OPTIONS, CONTACT_TIMES_CONSTS, TIME_TYPE_CONSTS, TIME_CALCULATE_CONSTS} from 'PUB_DIR/sources/utils/consts';
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
const HOUR_MUNITE_FORMAT = oplateConsts.HOUR_MUNITE_FORMAT;
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import ClueSuggest from 'CMP_DIR/basic-edit-field-new/clue-suggest';
//日程类型
const CUSTOMER_SCHEDULE_TYPES = [
    {name: Intl.get('schedule.phone.connect', '电联'), value: 'calls', iconCls: 'icon-phone-call-out'},
    {name: Intl.get('common.visit', '拜访'), value: 'visit', iconCls: 'icon-visit-briefcase'},
    {name: Intl.get('common.others', '其他'), value: 'other', iconCls: 'icon-trace-other'}
];

const CLUE_SCHEDULE_TYPES = [
    {name: Intl.get('schedule.phone.connect', '电联'), value: 'lead', iconCls: 'icon-phone-call-out'},
    {name: Intl.get('common.others', '其他'), value: 'other', iconCls: 'icon-trace-other'}
];


var CrmAlertForm = createReactClass({
    displayName: 'CrmAlertForm',
    mixins: [ValidateMixin],
    propTypes: {
        selectedCustomer: PropTypes.object,
        closeContent: PropTypes.func,
        handleScheduleCancel: PropTypes.func,
        currentSchedule: PropTypes.object,
        getScheduleList: PropTypes.func,
        formItemLayout: PropTypes.object,
        customerArr: PropTypes.array,
        isAddToDoClicked: PropTypes.bool,
        handleScheduleAdd: PropTypes.func,
        topicValue: PropTypes.string,
    },
    getInitialState: function() {
        var formData = this.getInitialFormData(this.props);
        var selectedAlertTimeRange = 'not_remind';
        return {
            formData: formData,
            isLoading: false,
            isMessageShow: false,
            messageType: 'success',
            messageContent: '',
            selectedTimeRange: '1h',//选中的联系时间
            selectedAlertTimeRange: selectedAlertTimeRange,//选中的提醒时间的类型
            isSelectFullday: true,//是否已经选择了全天
            hideCustomerRequiredTip: false,
            hideClueRequiredTip: false,
            topicValue: this.props.topicValue
        };
    },
    //初始化值数据
    getInitialFormData: function(props) {
        let formData = _.cloneDeep(props.currentSchedule);
        let scheduleType = _.isEqual(_.get(props,'topicValue'), 'customer') ? 'calls' : 'lead';
        //从用户调用会传入用户名
        formData.topic = formData.customer_name || '';
        //代办类型的默认值
        formData.scheduleType = scheduleType || 'calls';
        //内容的默认值
        formData.content = '';
        //联系的开始时间
        formData.start_time = moment().add(TIME_CALCULATE_CONSTS.ONE, 'h').valueOf();
        //联系的结束时间
        formData.end_time = moment().add(TIME_CALCULATE_CONSTS.ONE_POINT_FIVE, 'h').valueOf();
        //默认不提醒
        formData.alert_time = '';
        return formData;
    },
    //还原初值
    initialFormData: function(props){
        formData = this.getInitialFormData();
        this.setState({
            formData,
            selectedTimeRange: '1h',
            selectedAlertTimeRange: 'not_remind',
            topicValue: props.topicValue,
        });
    },

    componentWillReceiveProps: function(nextProps) {
        //用户切换添加"线索"或"客户"类型代办时，更新formData里的scheduleType初始值数据还原初值
        if(_.has(nextProps, 'topicValue')) {
            this.initialFormData(nextProps);
        }
    },
    //是否是今天
    isToday: function(date) {
        const newTime = moment(date).format(DATE_FORMAT);
        const today = moment().format(DATE_FORMAT);
        return (newTime === today);
    },

    //是否是N天后
    isNDayLater: function(date, n) {
        const newTime = moment(date).format(DATE_FORMAT);
        const isNDayLater = moment().add(n, 'day').format(DATE_FORMAT);
        return (newTime === isNDayLater);
    },

    //更改开始日期
    onScheduleDateChange: function(date) {
        let formData = this.state.formData;
        let selectedAlertTimeRange = this.state.selectedAlertTimeRange;
        //选中的是不是今天
        if (this.isToday(date)) {
            formData.start_time = moment().valueOf();
            formData.end_time = TimeStampUtil.getTodayTimeStamp().end_time;
            //并未选中全天这种状态
            if (!this.state.isSelectFullday) {
                selectedAlertTimeRange = 'not_remind';
            }
        } else {
            //是否选中全天的状态
            if (this.state.isSelectFullday) {
                //开始时间
                formData.start_time = moment(date).valueOf();
                //结束时间
                formData.end_time = (moment(date).valueOf() / 1000 + 24 * 60 * 60 - 1) * 1000;
            } else {
                //原有时间
                const dateTime = this.state.formData.start_time;
                //获取原有时间里去除了日期之后的时间值部分
                const timeValue = dateTime - moment(dateTime).startOf('day').valueOf();
                //用新选择的日期加上原有时间里的时间值部分得到新选择的时间值
                const newTime = moment(date).valueOf() + timeValue;
                //禁止选择小于当前时间的时间
                if (newTime < moment().valueOf()) return;

                //自定义的时候 修改开始时间的时候，把结束时间设置成比开始时间晚一分钟
                formData.start_time = newTime;
                formData.end_time = moment(newTime).add(TIME_CALCULATE_CONSTS.ONE, 'm').valueOf();
            }
        }
        this.setState({formData, selectedAlertTimeRange});
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改提醒日期');
    },

    //更改开始时间
    onScheduleStartTimeChange: function(momentTime, timeStr) {
        //用原有时间里的日期部分加上新选择的时间，组合出新选择的时间字符串
        const newTimeStr = moment(this.state.formData.start_time).format(DATE_FORMAT) + ' ' + timeStr;
        //将时间字符串转换成unix时间戳
        const newTime = moment(newTimeStr).valueOf();
        //禁止选择小于当前时间的时间
        if (newTime < moment().valueOf()) {
            message.warn(Intl.get('crm.alert.select.future.time', '请选择大于当前时间的时间'));
            return;
        }
        let formData = this.state.formData;
        formData.start_time = newTime;
        formData.end_time = moment(newTime).add(TIME_CALCULATE_CONSTS.ONE, 'm').valueOf();
        this.setState({formData});
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改开始时间');

    },

    //更改结束时间
    onScheduleEndTimeChange: function(momentTime, timeStr) {
        //用原有时间里的日期部分加上新选择的时间，组合出新选择的时间字符串
        const newTimeStr = moment(this.state.formData.end_time).format(DATE_FORMAT) + ' ' + timeStr;
        //将时间字符串转换成unix时间戳
        const newTime = moment(newTimeStr).valueOf();
        //禁止选择小于当前时间的时间
        if (newTime < moment().valueOf()) {
            message.warn(Intl.get('crm.alert.select.future.time', '请选择大于当前时间的时间'));
            return;
        }
        let formData = this.state.formData;
        formData.end_time = newTime;
        this.setState({formData});
        Trace.traceEvent(ReactDOM.findDOMNode(this), '修改结束时间');
    },

    //添加联系计划
    addSchedule: function(submitObj) {
        //如果是批量添加联系计划的情况,要跟据联系人逐个添加
        var selectedCustomer = this.props.selectedCustomer;
        if (_.isArray(selectedCustomer)) {
            var count = 0,//count发送成功的请求数量
                finishedAjaxCount = 0, //finishedAjaxCount已经完成的请求的数量
                totalLength = selectedCustomer.length;//一共要发请求的个数
            //设置loading效果为true
            BatchChangeActions.setLoadingState(true);
            selectedCustomer.forEach((item, index) => {
                submitObj.customer_id = item.id;
                submitObj.customer_name = item.name;
                submitObj.topic = item.name;
                ScheduleAction.addSchedule(submitObj, (resData) => {
                    finishedAjaxCount++;
                    //发完请求后，设置为false
                    if (finishedAjaxCount === totalLength) {
                        //设置loading效果为false
                        BatchChangeActions.setLoadingState(false);
                    }
                    if (resData.id) {
                        count++;
                        //如果批量添加日程都成功了，就会把下拉面板关闭
                        if (count === totalLength) {
                            //提示全部添加成功
                            message.success(Intl.get('batch.success.add.schedule', '所有联系计划均添加成功'));
                            this.props.closeContent();
                        }
                    } else {
                        message.error(Intl.get('batch.failed.add.schedule', '{customerName}添加联系计划失败', {customerName: submitObj.customer_name}), 60);
                    }
                });
            });
        } else {
            //单独添加一个联系计划
            ScheduleAction.addSchedule(submitObj, (resData) => {
                if (resData.id) {
                    this.showMessage(Intl.get('user.user.add.success', '添加成功'));
                    _.isFunction(this.props.handleScheduleCancel) && this.props.handleScheduleCancel(resData);
                    // 判断是否是添加日程项
                    if(this.props.isAddToDoClicked) {
                        _.isFunction(this.props.handleScheduleAdd) && this.props.handleScheduleAdd(resData);
                    } else {
                        ScheduleAction.afterAddSchedule(resData);
                        var todayTimeObj = TimeStampUtil.getTodayTimeStamp();
                        //如果添加的是今天的电联联系计划，就在基本资料的日程列表中加一个计划
                        if (resData.type === 'calls' && resData.start_time > todayTimeObj.start_time && resData.end_time < todayTimeObj.end_time){
                            basicOverviewAction.afterAddSchedule(resData);
                        }
                    }
                } else {
                    this.showMessage(resData || Intl.get('crm.154', '添加失败'), 'error');
                }
                this.setState({isLoading: false});
            });
        }
    },

    //提交添加请求
    handleSubmit: function(submitObj) {
        this.refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.setState({isLoading: true});
                if (this.props.currentSchedule.id) {
                    ScheduleAction.editAlert(this.state.formData, (resData) => {
                        if (resData.code === 0) {
                            this.showMessage(Intl.get('user.edit.success', '修改成功'));
                            _.isFunction(this.props.getScheduleList) && this.props.getScheduleList();
                        } else {
                            this.showMessage(Intl.get('common.edit.failed', '修改失败'), 'error');
                        }
                        this.setState({isLoading: false});
                    });
                } else {
                    //添加联系计划
                    this.addSchedule(submitObj);
                }
            }
        });
    },

    showMessage: function(content, type) {
        this.setState({
            isLoading: false,
            isMessageShow: true,
            messageType: type || 'success',
            messageContent: content || '',
        });
    },

    // 选择线索
    clueChosen: function(selectedClue) {
        let formData = this.state.formData;
        formData.lead_id = selectedClue.id;
        formData.topic = selectedClue.name;
        this.setState({
            formData
        }, () => {
            this.refs.validation.forceValidate(['clue']);
        });
    },

    // 选择客户
    customerChoosen: function(selectedCustomer) {
        let formData = this.state.formData;
        formData.customer_id = selectedCustomer.id;
        formData.customer_name = selectedCustomer.name;
        formData.topic = selectedCustomer.name;
        this.setState({
            formData
        }, () => {
            this.refs.validation.forceValidate(['customer']);
        });
    },

    // 选择客户验证事件
    checkCustomerName: function(rule, value, callback){
        value = _.trim(_.get(this.state, 'formData.customer_id'));
        if (!value && !this.state.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    },

    // 选择线索验证事件
    checkClueName: function(rule, value, callback) {
        value = _.trim(_.get(this.state, 'formData.lead_id'));
        if (!value && !this.state.hideClueRequiredTip) {
            callback(new Error(Intl.get('crm.suggest.select.clue.first','请先选择线索')));
        } else {
            callback();
        }
    },

    hideCustomerRequiredTip: function(flag) {
        this.setState({
            hideCustomerRequiredTip: flag
        },() => {
            this.refs.validation.forceValidate(['customer']);
        });
    },

    hideClueRequiredTip: function(flag) {
        this.setState({
            hideClueRequiredTip: flag
        },() => {
            this.refs.validation.forceValidate(['clue']);
        });
    },

    //对应不同下拉框中的选项
    switchDiffSelectOptions(formData){
        var value = this.state.selectedAlertTimeRange;
        var alert_time = '';
        var start_time = formData.start_time;
        var end_time = formData.end_time;
        let formObj = this.state.formData;
        switch (value) {
            case TIME_TYPE_CONSTS.NOT_REMIND:
            //选择不提醒的时候，设置socketio_notice为false，alert_time字段也必须要传，所以传一个当前时间之后，结束时间之前的时间
                alert_time = moment(end_time).subtract(TIME_CALCULATE_CONSTS.ONE, 's').valueOf();
                formObj.socketio_notice = false;
                break;
            case TIME_TYPE_CONSTS.AHEAD_5_MIN:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.FIVE, 'm').valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_10_MIN:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.TEN, 'm').valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_15_MIN:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.FIFTeen, 'm').valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_30_MIN:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.THIRTY, 'm').valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_1_H:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.ONE, 'h').valueOf();
                break;
            case TIME_TYPE_CONSTS.THATDAY_10:
                alert_time = moment(start_time).set('hour', TIME_CALCULATE_CONSTS.TEN).set('minute', TIME_CALCULATE_CONSTS.ZERO).set('second', TIME_CALCULATE_CONSTS.ZERO).valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_1DAY_10:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.ONE, 'days').set('hour', TIME_CALCULATE_CONSTS.TEN).set('minute', TIME_CALCULATE_CONSTS.ZERO).set('second', TIME_CALCULATE_CONSTS.ZERO).valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_2DAY_10:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.TWO, 'days').set('hour', TIME_CALCULATE_CONSTS.TEN).set('minute', TIME_CALCULATE_CONSTS.ZERO).set('second', TIME_CALCULATE_CONSTS.ZERO).valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_3DAY_10:
                alert_time = moment(start_time).subtract(TIME_CALCULATE_CONSTS.THREE, 'days').set('hour', TIME_CALCULATE_CONSTS.TEN).set('minute', TIME_CALCULATE_CONSTS.ZERO).set('second', TIME_CALCULATE_CONSTS.ZERO).valueOf();
                break;
        }
        formObj.alert_time = alert_time;
        var submitObj = _.clone(formObj);
        delete submitObj.customer_name;
        delete submitObj.edit;
        if (formData.end_time <= formData.start_time) {
            message.warn(Intl.get('crm.alert.finish.longer', '结束时间必须要大于开始时间'));
            return;
        }

        if(this.props.isAddToDoClicked) {
            //若当前添加的是客户代办
            if (_.isEqual(this.state.topicValue, 'customer') && !submitObj.customer_id) {
                this.refs.validation.forceValidate(['customer']);
                return;
            } else if (_.isEqual(this.state.topicValue, 'clue') && !submitObj.lead_id) { //若当前添加的是线索代办
                this.refs.validation.forceValidate(['clue']);
                return;
            }
        }
        this.handleSubmit(submitObj);
    },

    handleSave: function(e) {
        var formData = this.state.formData;
        if (this.state.selectedTimeRange !== 'custom') {
            switch (this.state.selectedTimeRange) {
            //根据不同的选择的不同的时间段类型，计算不同的开始时间
                case TIME_TYPE_CONSTS.ONE_HOUR:
                    formData.start_time = moment().add(TIME_CALCULATE_CONSTS.ONE, 'h').valueOf();
                    formData.end_time = moment().add(TIME_CALCULATE_CONSTS.ONE_POINT_FIVE, 'h').valueOf();
                    break;
                case TIME_TYPE_CONSTS.TWO_HOURS:
                    formData.start_time = moment().add(TIME_CALCULATE_CONSTS.TWO, 'h').valueOf();
                    formData.end_time = moment().add(TIME_CALCULATE_CONSTS.TWO_POINT_FIVE, 'h').valueOf();
                    break;
                case TIME_TYPE_CONSTS.FIVE_HOURS:
                    formData.start_time = moment().add(TIME_CALCULATE_CONSTS.FIVE, 'h').valueOf();
                    formData.end_time = moment().add(TIME_CALCULATE_CONSTS.FIVE_POINT_FIVE, 'h').valueOf();
                    break;
                case TIME_TYPE_CONSTS.ONE_DAY:
                    formData.start_time = moment().add(TIME_CALCULATE_CONSTS.TWENTY_FOUR, 'h').valueOf();
                    formData.end_time = moment().add(TIME_CALCULATE_CONSTS.TWENTY_FOUR_POINT_FIVE, 'h').valueOf();
                    break;
                case TIME_TYPE_CONSTS.ONE_WEEK:
                    formData.start_time = moment().add(TIME_CALCULATE_CONSTS.TWENTY_FOUR * TIME_CALCULATE_CONSTS.SEVERN, 'h').valueOf();
                    formData.end_time = moment().add((TIME_CALCULATE_CONSTS.TWENTY_FOUR * TIME_CALCULATE_CONSTS.SEVERN + TIME_CALCULATE_CONSTS.ZERO_POINT_FIVE), 'h').valueOf();
                    break;
            }
        }
        this.switchDiffSelectOptions(this.state.formData);
        Trace.traceEvent(e, '保存联系计划');
    },

    handleCancel: function(e) {
        Trace.traceEvent(e, '取消添加联系计划');
        _.isFunction(this.props.handleScheduleCancel) && this.props.handleScheduleCancel();
        if(this.props.isAddToDoClicked) return;
        //如果是批量添加联系计划,关闭后应该清空数据
        if (_.isArray(this.props.selectedCustomer)) {
            this.initialFormData(this.props);
        } else {
            ScheduleAction.cancelEdit();
        }

    },

    //修改日程类型
    handleTypeChange: function(event) {
        let value = event.target.value;
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-select-selection__rendered'), '修改日程的类型为' + value);
        let formData = this.state.formData;
        formData.scheduleType = value;
        this.setState({formData});
    },

    //修改选择的时间
    handleTimeRangeChange: function(value) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-radio-button'), '修改联系时间为' + value);
        var formData = this.state.formData;
        let isSelectFullday = this.state.isSelectFullday;
        if (value === 'custom') {
            //选择自定义时，要把开始和结束时间改为当前时间
            formData.start_time = moment().valueOf();
            formData.end_time = TimeStampUtil.getTodayTimeStamp().end_time;
            //默认选中全天
            isSelectFullday = true;
        }
        this.setState({
            selectedTimeRange: value,
            selectedAlertTimeRange: 'not_remind',//为防止由整天的类型切换到几个小时后的类型时，下拉框中没有对应的类型的情况
            formData: formData,
            isSelectFullday: isSelectFullday
        });
    },

    renderSelectFulldayOptions: function() {
        if (this.state.selectedTimeRange === '1d') {
            //如果选中的是一天，要把后面几个选项去掉
            let SELECT_FULL_OPTIONS_SPLICE = _.clone(SELECT_FULL_OPTIONS).splice(0, 2);
            return (
                _.map(SELECT_FULL_OPTIONS_SPLICE, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            );
        } else if (this.state.selectedTimeRange === '1w') {
            //一周后的提醒时间的下拉框选项
            return (
                _.map(SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            );

        } else if (this.state.isSelectFullday) {
            var start_time = this.state.formData.start_time;
            //选择全天后的下拉框选项,要根据具体时间，显示合理的提醒时间下拉框
            let CLONE_SELECT_FULL_OPTIONS = _.clone(SELECT_FULL_OPTIONS);
            const isAfter10 = moment().hour() - TIME_CALCULATE_CONSTS.TEN;
            for (var i = 0; i <= 3; i++) {
                //是否是1天后
                if (this.isNDayLater(start_time, i)) {
                    CLONE_SELECT_FULL_OPTIONS = CLONE_SELECT_FULL_OPTIONS.splice(0, i + 2);
                    if (isAfter10 >= 0) {
                        CLONE_SELECT_FULL_OPTIONS = CLONE_SELECT_FULL_OPTIONS.splice(0, i + 1);
                    }
                }
            }
            return (
                _.map(CLONE_SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            );
        }
    },

    renderNotSelectFulldayOptions: function() {
        if (this.state.selectedTimeRange === 'custom') {
            var CLONE_NO_SELECT_FULL_OPTIONS = _.clone(NO_SELECT_FULL_OPTIONS);
            //自定义的时候
            var start_time = this.state.formData.start_time;
            var now_time = moment().valueOf();
            var n = Math.floor((start_time - now_time) / (1000 * 60));
            //需要根据选定的时间，来决定下拉框展示哪些选项 5,10, 15 ,30,60 分别对应下拉框中的提前5，10,15,30,60分钟提醒
            if (n <= 5) {
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0, 1);
            } else if (n <= 10) {
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0, 2);
            } else if (n <= 15) {
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0, 3);
            } else if (n <= 30) {
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0, 4);
            } else if (n <= 60) {
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0, 5);
            }
            return (
                _.map(CLONE_NO_SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            );
        } else {
            return (
                _.map(NO_SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            );
        }

    },

    //修改联系计划的主题
    handleTopicChange: function(customerId) {
        var targetObj = _.find(this.props.customerArr, (item) => {
            return item.id === customerId;
        });
        var formData = this.state.formData;
        formData.customer_id = targetObj.id;
        formData.customer_name = targetObj.name;
        formData.topic = targetObj.name;
        this.setState({
            formData: formData
        });
    },

    //是否选中全天
    onChangeSelectFullday: function(checked) {
        let formData = this.state.formData;
        if (!checked){
            formData.start_time = moment().valueOf();
        }
        this.setState({
            isSelectFullday: checked,
            formData: formData
        });
    },

    //改变提醒时间的类型
    handleAlertTimeChange: function(value) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-select-lg .ant-select-selection__rendered'), '修改提醒时间的类型为' + value);
        this.setState({
            selectedAlertTimeRange: value,
        });
        if (value !== 'not_remind') {
            let formData = this.state.formData;
            formData.socketio_notice = true;
            this.setState({formData});
        }
    },

    //根据传进来的不同topicValue渲染“客户”或“线索”
    renderTopic: function(topicValue, formItemLayout){
        if(_.isEqual(topicValue, 'clue')) {
            return(<FormItem
                {...formItemLayout}
                required
                validateStatus={this.getValidateStatus('clue')}
                help={this.getHelpMessage('clue')}
                label={Intl.get('crm.sales.clue','线索')}
            >
                <Validator rules={[{validator: this.checkClueName}]}>
                    <ClueSuggest
                        name='clue'
                        field='clue'
                        show_error={false}
                        noDataTip={Intl.get('clue.has.no.data', '暂无')}
                        required={true}
                        clueChosen={this.clueChosen.bind(this)}
                        hideClueRequiredTip={this.hideClueRequiredTip}
                    />
                </Validator>
            </FormItem>);
        }else {
            return (<FormItem
                {...formItemLayout}
                required
                validateStatus={this.getValidateStatus('customer')}
                help={this.getHelpMessage('customer')}
                label={Intl.get('call.record.customer', '客户')}
            >
                <Validator rules={[{validator: this.checkCustomerName}]}>
                    <CustomerSuggest
                        name='customer'
                        field='customer'
                        hasEditPrivilege={true}
                        displayText={''}
                        displayType={'edit'}
                        id={''}
                        show_error={false}
                        noJumpToCrm={false}
                        customer_name={''}
                        customer_id={''}
                        noDataTip={Intl.get('clue.has.no.data', '暂无')}
                        hideButtonBlock={true}
                        customerChoosen={this.customerChoosen.bind(this)}
                        required={true}
                        hideCustomerRequiredTip={this.hideCustomerRequiredTip}
                    />
                </Validator>
            </FormItem>);
        }
    },

    render: function() {
        const formItemLayout = this.props.formItemLayout || {
            colon: false,
            labelCol: {span: 3},
            wrapperCol: {span: 21},
        };
        var formData = this.state.formData;
        //如果一个电话对应多个联系人的时候，要可以选择标题
        let hasOverOneCustomer = _.isArray(this.props.customerArr) && this.props.customerArr.length > 1;
        var scheduleStartTime = moment(formData.start_time).format(HOUR_MUNITE_FORMAT);
        var scheduleEndTime = moment(formData.end_time).format(HOUR_MUNITE_FORMAT);
        //根据topic渲染不同的radio buttons
        let scheduleType = _.isEqual(_.get(this.state, 'topicValue'), 'customer') ? CUSTOMER_SCHEDULE_TYPES : CLUE_SCHEDULE_TYPES;
        return (
            <Form layout='horizontal' data-tracename="添加联系计划表单" className="schedule-form" id="schedule-form">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    {/*如果是点击待办项，显示客户选择框，否则如果是批量操作的时候，不需要展示标题*/
                        this.props.isAddToDoClicked ? (
                            this.renderTopic(_.get(this.state, 'topicValue'), formItemLayout)
                        ) : (this.props.selectedCustomer ? null : (
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('crm.alert.topic', '标题')}
                            >
                                <Validator rules={[{required: true}]}>
                                    {hasOverOneCustomer ?
                                        <Select onChange={this.handleTopicChange} value={formData.customer_id} >
                                            {_.map(this.props.customerArr, (customerItem) => {
                                                return (
                                                    <Option value={customerItem.id}>{customerItem.name}</Option>
                                                );
                                            })}
                                        </Select>

                                        : <Input name="topic" value={formData.topic} disabled/>}

                                </Validator>
                            </FormItem>))
                    }
                    <FormItem
                        {...formItemLayout}
                        required
                        label={Intl.get('common.type', '类型')}
                    >
                        <RadioGroup onChange={this.handleTypeChange} value={formData.scheduleType}>
                            {_.map(scheduleType, item => {
                                return (
                                    <RadioButton value={item.value}>
                                        <span className={`iconfont ${item.iconCls}`}/>{item.name}
                                    </RadioButton>);
                            })}
                        </RadioGroup>
                    </FormItem>
                    <FormItem
                        label={Intl.get('crm.177', '内容')}
                        {...formItemLayout}
                        required
                        validateStatus={this.getValidateStatus('content')}
                        help={this.getHelpMessage('content')}
                    >
                        <div className="content-wrap">
                            <Validator
                                rules={[{required: true, message: Intl.get('crm.schedule.fill.content', '请填写联系内容')}]}
                            >
                                <Input
                                    name="content"
                                    type="textarea"
                                    rows={2}
                                    value={formData.content}
                                    onChange={this.setField.bind(this, 'content')}
                                />
                            </Validator>
                        </div>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('common.login.time', '时间')}
                    >
                        {<Select onChange={this.handleTimeRangeChange} value={this.state.selectedTimeRange} getPopupContainer={() => document.getElementById('schedule-form')}>
                            {_.map(CONTACT_TIMES_CONSTS, (key, value) => {
                                return (<Option value={value}>{key}</Option>);
                            })}
                        </Select>}
                    </FormItem>

                    {this.state.selectedTimeRange === 'custom' ?
                        <div className="define-timerange-area">
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('crm.alert.full.day', '全天')}
                            >
                                <Switch
                                    defaultChecked={true}
                                    onChange={this.onChangeSelectFullday}
                                    checkedChildren="是"
                                    unCheckedChildren="否"
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('crm.schedule.begin.time', '开始')}
                            >
                                <div>
                                    <BootstrapDatepicker
                                        className="begin-date-input"
                                        type="input"
                                        options={{
                                            format: 'yyyy-mm-dd',
                                            startDate: moment().startOf('day').format(DATE_FORMAT)
                                        }}
                                        value={moment(formData.start_time).format(DATE_FORMAT)}
                                        onChange={this.onScheduleDateChange}
                                    />
                                    {this.state.isSelectFullday ? null :
                                        <TimePicker
                                            value={moment(scheduleStartTime, HOUR_MUNITE_FORMAT)}
                                            format={HOUR_MUNITE_FORMAT}
                                            onChange={this.onScheduleStartTimeChange}
                                        />
                                        // <DateFormatSpinnerInput
                                        //     className="schedule-time-input"
                                        //     dateFormat="HH:mm"
                                        //     value={formData.start_time}
                                        //     onChange={this.onScheduleStartTimeChange}
                                        // />
                                    }
                                </div>
                            </FormItem>
                            {this.state.isSelectFullday ? null :
                                <FormItem
                                    {...formItemLayout}
                                    label={Intl.get('crm.schedule.end.time', '结束')}
                                >
                                    <TimePicker
                                        value={moment(scheduleEndTime, HOUR_MUNITE_FORMAT)}
                                        format={HOUR_MUNITE_FORMAT}
                                        onChange={this.onScheduleEndTimeChange}
                                    />
                                </FormItem>
                            }
                        </div> : null}
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('crm.40', '提醒')}
                    >
                        <Select
                            value={this.state.selectedAlertTimeRange}
                            onChange={this.handleAlertTimeChange}
                            getPopupContainer={() => document.getElementById('schedule-form')}
                        >
                            {(this.state.selectedTimeRange === 'custom' && this.state.isSelectFullday) || this.state.selectedTimeRange === '1d' || this.state.selectedTimeRange === '1w' ? this.renderSelectFulldayOptions() : this.renderNotSelectFulldayOptions()}
                        </Select>

                    </FormItem>
                    {/*如果是批量操作的时候，不需要展示保存和取消按钮，用原组件中有的保存和取消*/}
                    {this.props.selectedCustomer ? null :
                        <SaveCancelButton loading={this.state.isLoading}
                            saveErrorMsg={this.state.messageType === 'error' ? this.state.messageContent : ''}
                            handleSubmit={this.handleSave}
                            handleCancel={this.handleCancel}/>
                    }
                </Validation>
            </Form>
        );
    },
});

CrmAlertForm.defaultProps = {
    currentSchedule: {},
    topicValue: 'customer', //默认修改为“客户”的联系计划
};

module.exports = CrmAlertForm;

