const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
require("../../css/schedule.less");
var ScheduleStore = require("../../store/schedule-store");
var ScheduleAction = require("../../action/schedule-action");
var BatchChangeActions = require("../../action/batch-change-actions");
var Spinner = require('../../../../../components/spinner');
var AlertTimer = require('../../../../../components/alert-timer');
import { Form, Input, Button, message,Select,Radio,Switch} from "antd";
const Option = Select.Option;
const FormItem = Form.Item;
import "react-date-picker/index.css";
import { DateFormatSpinnerInput } from "react-date-picker";
import BootstrapDatepicker from "../../../../../components/bootstrap-datepicker";
import ValidateMixin from "../../../../../mixins/ValidateMixin";
import Trace from "LIB_DIR/trace";
import {SELECT_FULL_OPTIONS, NO_SELECT_FULL_OPTIONS} from "PUB_DIR/sources/utils/consts"
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
const TIME_CONSTS = {
    "ZERO":0,
    "ZERO_POINT_FIVE":0.5,
    "ONE":1,
    "TWO":2,
    "TWO_POINT_FIVE":2.5,
    "THREE":3,
    "ONE_POINT_FIVE":1.5,
    "FIVE":5,
    "FIVE_POINT_FIVE":5.5,
    "SEVERN":7,
    "TEN":10,
    "FIFTeen":15,
    "TWENTY_FOUR":24,
    "TWENTY_FOUR_POINT_FIVE":24.5,
    "THIRTY":30,
    "SIXTY":60
};
const TIME_TYPE_CONSTS = {
    "NOT_REMIND":"not_remind",
    "ONE_HOUR":"1h",
    "TWO_HOURS":"2h",
    "FIVE_HOURS":"5h",
    "ONE_DAY":"1d",
    "ONE_WEEK":"1w",
    "AHEAD_5_MIN":"ahead_5min",
    "AHEAD_10_MIN":"ahead_10min",
    "AHEAD_15_MIN":"ahead_15min",
    "AHEAD_30_MIN":"ahead_30min",
    "AHEAD_1_H":"ahead_1h",
    "THATDAY_10":"thatday_10",
    "AHEAD_1DAY_10":"ahead_1day_10",
    "AHEAD_2DAY_10":"ahead_2day_10",
    "AHEAD_3DAY_10":"ahead_3day_10",

}

var CrmAlertForm = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function() {
        var formData = this.getInitialFormData();
        var selectedAlertTimeRange = "not_remind";
        return {
            formData: formData,
            isLoading: false,
            isMessageShow: false,
            messageType: "success",
            messageContent: "",
            selectedTimeRange:"1h",//选中的联系时间
            selectedAlertTimeRange:selectedAlertTimeRange,//选中的提醒时间的类型
            isSelectFullday:true//是否已经选择了全天
        };
    },

    getInitialFormData: function () {
        let formData = this.props.currentSchedule;
        formData.topic = formData.topic || formData.customer_name || "";
        //时间的默认值，用于编辑时使用
        formData.scheduleType = formData.scheduleType || "calls";
        //联系的开始时间
        formData.start_time = formData.start_time || moment().add(TIME_CONSTS.ONE,"h").valueOf();
        //联系的结束时间
        formData.end_time = formData.end_time || moment().add(TIME_CONSTS.ONE_POINT_FIVE,"h").valueOf();
        //提醒时间
        formData.alert_time = formData.alert_time || moment().add(TIME_CONSTS.ONE,"h").subtract(TIME_CONSTS.TEN, 'm').valueOf();
        return formData;
    },
    //是否是今天
    isToday:function(date){
        const newTime = moment(date).format(DATE_FORMAT);
        const today = moment().format(DATE_FORMAT);
        return (newTime == today)
    },
    //是否是N天后
    isNDayLater:function (date,n) {
        const newTime = moment(date).format(DATE_FORMAT);
        const isNDayLater = moment().add(n,"day").format(DATE_FORMAT);
        return (newTime == isNDayLater)
    },
    //更改开始日期
    onScheduleDateChange:function (date) {
        //选中的是不是今天
        if (this.isToday(date)){
            this.state.formData.start_time = moment().valueOf();
            this.state.formData.end_time = TimeStampUtil.getTodayTimeStamp().end_time;
            //并未选中全天这种状态
            if (!this.state.isSelectFullday){
                this.state.selectedAlertTimeRange = "not_remind";
            }
        }else{
            //是否选中全天的状态
            if (this.state.isSelectFullday){
                //开始时间
                this.state.formData.start_time = moment(date).valueOf();
                //结束时间
                this.state.formData.end_time = (moment(date).valueOf()/1000 + 24*60*60-1) * 1000;
            }else{
                //原有时间
                const dateTime = this.state.formData.start_time;
                //获取原有时间里去除了日期之后的时间值部分
                const timeValue = dateTime - moment(dateTime).startOf("day").valueOf();
                //用新选择的日期加上原有时间里的时间值部分得到新选择的时间值
                const newTime = moment(date).valueOf() + timeValue;
                //禁止选择小于当前时间的时间
                if (newTime < moment().valueOf()) return;
                //自定义的时候 修改开始时间的时候，把结束时间设置成比开始时间晚一分钟
                this.state.formData.start_time = newTime;
                this.state.formData.end_time = moment(newTime).add(TIME_CONSTS.ONE,"m").valueOf();
            }
        }
        this.setState(this.state);
        Trace.traceEvent(this.getDOMNode(),"修改提醒日期");
    },
    //更改开始时间
    onScheduleStartTimeChange:function (time) {
        //用原有时间里的日期部分加上新选择的时间，组合出新选择的时间字符串
        const newTimeStr = moment(this.state.formData.start_time).format(DATE_FORMAT) + " " + time;
        //将时间字符串转换成unix时间戳
        const newTime = moment(newTimeStr).valueOf();
        //禁止选择小于当前时间的时间
        if (newTime < moment().valueOf()) {
            message.warn(Intl.get("crm.alert.select.future.time","请选择大于当前时间的时间"));
            return;
        }
        this.state.formData.start_time = newTime;
        this.state.formData.end_time = moment(newTime).add(TIME_CONSTS.ONE,"m").valueOf();
        this.setState(this.state);
        Trace.traceEvent(this.getDOMNode(),"修改开始时间");

    },
    //更改结束时间
    onScheduleEndTimeChange:function (time) {
        //用原有时间里的日期部分加上新选择的时间，组合出新选择的时间字符串
        const newTimeStr = moment(this.state.formData.end_time).format(DATE_FORMAT) + " " + time;
        //将时间字符串转换成unix时间戳
        const newTime = moment(newTimeStr).valueOf();
        //禁止选择小于当前时间的时间
        if (newTime < moment().valueOf()){
            message.warn(Intl.get("crm.alert.select.future.time","请选择大于当前时间的时间"));
            return;
        }
        this.state.formData.end_time = newTime;
        this.setState({
            formData:this.state.formData
        });
        Trace.traceEvent(this.getDOMNode(),"修改结束时间");
    },

    //添加联系计划
    addSchedule:function (submitObj) {
        //如果是批量添加联系计划的情况,要跟据联系人逐个添加
        var selectedCustomer = this.props.selectedCustomer;
        if (_.isArray(selectedCustomer)){
            var count = 0;
            for (var i =0;i< selectedCustomer.length;i++){
                submitObj.customer_id = selectedCustomer[i].id;
                submitObj.customer_name = selectedCustomer[i].name;
                submitObj.topic = selectedCustomer[i].name;
                //设置loading效果为true
                BatchChangeActions.setLoadingState(true);
                ScheduleAction.addSchedule(submitObj,(resData)=>{
                    //设置loading效果为false
                    BatchChangeActions.setLoadingState(false);
                    if (resData.id){
                        count++;
                        //如果批量添加日程都成功了，就会把下拉面板关闭
                        if (count == selectedCustomer.length){
                            this.props.closeContent();
                        }
                    }else{
                        message.error(Intl.get("batch.failed.add.schedule","{customerName}添加联系计划失败",{customerName: submitObj.customer_name}));
                    }
                })
            }
        }else{
            //单独添加一个联系计划
            ScheduleAction.addSchedule(submitObj,(resData) => {
                if (resData.id) {
                    this.showMessage( Intl.get("user.user.add.success", "添加成功"));
                    ScheduleAction.afterAddSchedule(resData);
                } else {
                    this.showMessage(resData || Intl.get("crm.154", "添加失败"), "error");
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
                    ScheduleAction.editAlert(this.state.formData,(resData) => {
                        if (resData.code == 0) {
                            this.showMessage( Intl.get("user.edit.success", "修改成功"));
                            _.isFunction(this.props.getScheduleList) && this.props.getScheduleList();
                        } else {
                            this.showMessage(Intl.get("common.edit.failed", "修改失败"), "error");
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
    showMessage: function (content, type) {
        this.setState({
            isLoading: false,
            isMessageShow: true,
            messageType: type || "success",
            messageContent: content || "",
        });
    },
    //对应不同下拉框中的选项
    switchDiffSelectOptions(formData){
        var value = this.state.selectedAlertTimeRange;
        var alert_time = "";
        var start_time = formData.start_time;
        var end_time = formData.end_time;
        switch (value) {
            case TIME_TYPE_CONSTS.NOT_REMIND:
                //选择不提醒的时候，设置socketio_notice为false，alert_time字段也必须要传，所以传一个当前时间之后，结束时间之前的时间
                alert_time = moment(end_time).subtract(TIME_CONSTS.ONE,"s").valueOf();
                this.state.formData.socketio_notice = false;
                break;
            case TIME_TYPE_CONSTS.AHEAD_5_MIN:
                alert_time = moment(start_time).subtract(TIME_CONSTS.FIVE,"m").valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_10_MIN:
                alert_time = moment(start_time).subtract(TIME_CONSTS.TEN,"m").valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_15_MIN:
                alert_time = moment(start_time).subtract(TIME_CONSTS.FIFTeen,"m").valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_30_MIN:
                alert_time = moment(start_time).subtract(TIME_CONSTS.THIRTY,"m").valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_1_H:
                alert_time = moment(start_time).subtract(TIME_CONSTS.ONE,"h").valueOf();
                break;
            case TIME_TYPE_CONSTS.THATDAY_10:
                alert_time = moment(start_time).set('hour', TIME_CONSTS.TEN).set('minute', TIME_CONSTS.ZERO).set('second', TIME_CONSTS.ZERO).valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_1DAY_10:
                alert_time = moment(start_time).subtract(TIME_CONSTS.ONE, 'days').set('hour', TIME_CONSTS.TEN).set('minute', TIME_CONSTS.ZERO).set('second', TIME_CONSTS.ZERO).valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_2DAY_10:
                alert_time = moment(start_time).subtract(TIME_CONSTS.TWO, 'days').set('hour', TIME_CONSTS.TEN).set('minute', TIME_CONSTS.ZERO).set('second', TIME_CONSTS.ZERO).valueOf();
                break;
            case TIME_TYPE_CONSTS.AHEAD_3DAY_10:
                alert_time = moment(start_time).subtract(TIME_CONSTS.THREE, 'days').set('hour', TIME_CONSTS.TEN).set('minute', TIME_CONSTS.ZERO).set('second', TIME_CONSTS.ZERO).valueOf();
                break;
        }
        this.state.formData.alert_time = alert_time;
        var submitObj = _.clone(this.state.formData);
        delete submitObj.customer_name;
        delete submitObj.edit;
        if (formData.end_time <= formData.start_time){
            message.warn(Intl.get("crm.alert.finish.longer","结束时间必须要大于开始时间"));
            return;
        }
        this.handleSubmit(submitObj);
    },
    handleSave: function () {
        var formData = this.state.formData;
        if (this.state.selectedTimeRange !== "custom"){
            switch (this.state.selectedTimeRange) {
                //根据不同的选择的不同的时间段类型，计算不同的开始时间
                case TIME_TYPE_CONSTS.ONE_HOUR:
                    formData.start_time = moment().add(TIME_CONSTS.ONE,"h").valueOf();
                    formData.end_time = moment().add(TIME_CONSTS.ONE_POINT_FIVE,"h").valueOf();
                    break;
                case TIME_TYPE_CONSTS.TWO_HOURS:
                    formData.start_time = moment().add(TIME_CONSTS.TWO,"h").valueOf();
                    formData.end_time = moment().add(TIME_CONSTS.TWO_POINT_FIVE,"h").valueOf();
                    break;
                case TIME_TYPE_CONSTS.FIVE_HOURS:
                    formData.start_time = moment().add(TIME_CONSTS.FIVE,"h").valueOf();
                    formData.end_time = moment().add(TIME_CONSTS.FIVE_POINT_FIVE,"h").valueOf();
                    break;
                case TIME_TYPE_CONSTS.ONE_DAY:
                    formData.start_time = moment().add(TIME_CONSTS.TWENTY_FOUR,"h").valueOf();
                    formData.end_time = moment().add(TIME_CONSTS.TWENTY_FOUR_POINT_FIVE,"h").valueOf();
                    break;
                case TIME_TYPE_CONSTS.ONE_WEEK:
                    formData.start_time = moment().add(TIME_CONSTS.TWENTY_FOUR * TIME_CONSTS.SEVERN,"h").valueOf();
                    formData.end_time = moment().add((TIME_CONSTS.TWENTY_FOUR * TIME_CONSTS.SEVERN + TIME_CONSTS.ZERO_POINT_FIVE),"h").valueOf();
                    break;
            }
        };
        this.switchDiffSelectOptions(this.state.formData);
        Trace.traceEvent($(this.getDOMNode()).find(".alert-btn-block .btn-primary-sure"),"保存联系计划");
    },
    handleCancel: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".alert-btn-block .btn-primary-cancel"),"取消添加联系计划");
        //如果是批量添加联系计划,关闭后应该清空数据
        if (_.isArray(this.props.selectedCustomer)){
           this.setState({
               formData:this.getInitialFormData()
           })
        }else {
            ScheduleAction.cancelEdit();
        }

    },
    //修改日程类型
    handleTypeChange:function (value) {
        Trace.traceEvent($(this.getDOMNode()).find(".ant-select-selection__rendered"),"修改日程的类型为" + value);
        this.state.formData.scheduleType = value;
        this.setState({
            formData: this.state.formData
        })
    },
    //修改选择的时间
    handleTimeRangeChange:function (e) {
        Trace.traceEvent($(this.getDOMNode()).find(".ant-radio-button"),"修改联系时间为" + e.target.value);
        var formData = this.state.formData;
        if (e.target.value == "custom"){
            //选择自定义时，要把开始和结束时间改为当前时间
            formData.start_time = moment().valueOf();
            formData.end_time = TimeStampUtil.getTodayTimeStamp().end_time;
            //默认选中全天
            this.state.isSelectFullday = true;
        }
        this.setState({
            selectedTimeRange: e.target.value,
            selectedAlertTimeRange:"not_remind",//为防止由整天的类型切换到几个小时后的类型时，下拉框中没有对应的类型的情况
            formData:this.state.formData,
            isSelectFullday:this.state.isSelectFullday
        })
    },
    renderSelectFulldayOptions: function () {
        if (this.state.selectedTimeRange == "1d"){
            //如果选中的是一天，要把后面几个选项去掉
            let SELECT_FULL_OPTIONS_SPLICE =_.clone(SELECT_FULL_OPTIONS).splice(0,2);
            return (
                _.map(SELECT_FULL_OPTIONS_SPLICE, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            )
        }else if(this.state.selectedTimeRange == "1w"){
            //一周后的提醒时间的下拉框选项
            return (
                _.map(SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            )

        } else if (this.state.isSelectFullday){
            var start_time = this.state.formData.start_time;
            //选择全天后的下拉框选项,要根据具体时间，显示合理的提醒时间下拉框
            let CLONE_SELECT_FULL_OPTIONS = _.clone(SELECT_FULL_OPTIONS);
            const isAfter10 = moment().hour() - TIME_CONSTS.TEN;
            for (var i=0;i<=3;i++){
                //是否是1天后
                if (this.isNDayLater(start_time,i)){
                    CLONE_SELECT_FULL_OPTIONS = CLONE_SELECT_FULL_OPTIONS.splice(0,i+2);
                    if (isAfter10 >= 0){
                        CLONE_SELECT_FULL_OPTIONS = CLONE_SELECT_FULL_OPTIONS.splice(0,i+1);
                    }
                }
            }
            return (
                _.map(CLONE_SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            )
        }
    },
    renderNotSelectFulldayOptions: function () {
        if (this.state.selectedTimeRange == "custom"){
            var CLONE_NO_SELECT_FULL_OPTIONS = _.clone(NO_SELECT_FULL_OPTIONS);
            //自定义的时候
            var start_time = this.state.formData.start_time;
            var now_time = moment().valueOf();
            var n = Math.floor((start_time - now_time)/(1000*60));
            //需要根据选定的时间，来决定下拉框展示哪些选项 5,10, 15 ,30,60 分别对应下拉框中的提前5，10,15,30,60分钟提醒
            if (n<=5){
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0,1);
            }else if(n<=10){
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0,2);
            }else if(n<=15){
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0,3);
            }else if(n<=30){
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0,4);
            }else if(n<=60){
                CLONE_NO_SELECT_FULL_OPTIONS = CLONE_NO_SELECT_FULL_OPTIONS.splice(0,5);
            }
            return (
                _.map(CLONE_NO_SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            )
        }else{
            return (
                _.map(NO_SELECT_FULL_OPTIONS, (key) => {
                    return (<Option value={key.value}>{key.name}</Option>);
                })
            )
        }

    },
    //是否选中全天
    onChangeSelectFullday:function (checked) {
        this.setState({
            isSelectFullday:checked,
        });
    },
    //改变提醒时间的类型
    handleAlertTimeChange:function (value) {
        Trace.traceEvent($(this.getDOMNode()).find(".ant-select-lg .ant-select-selection__rendered"),"修改提醒时间的类型为" + value);
        this.setState({
            selectedAlertTimeRange:value,
        });
        if (value !== "not_remind"){
            this.state.formData.socketio_notice = true;
            this.setState({
                formData:this.state.formData
            })
        }
    },
    renderRadioButtonGroup:function(){
        return (
            <Radio.Group onChange={this.handleTimeRangeChange} value={this.state.selectedTimeRange}>
                <Radio.Button value="1h">
                    {Intl.get("crm.alert.after.1.hours","1小时后")}
                </Radio.Button>
                <Radio.Button value="2h">
                    {Intl.get("crm.alert.after.2.hours","2小时后")}
                </Radio.Button>
                <Radio.Button value="5h">
                    {Intl.get("crm.alert.after.5.hours","5小时后")}
                </Radio.Button>
                <Radio.Button value="1d">
                    {Intl.get("crm.alert.after.1.day","1天后")}
                </Radio.Button>
                <Radio.Button value="1w">
                    {Intl.get("crm.alert.after.1.week","1周后")}
                </Radio.Button>
                <Radio.Button value="custom">
                    {Intl.get("user.time.custom", "自定义")}
                </Radio.Button>
            </Radio.Group>
        )
    },
    render: function () {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20},
        };
        var formData = this.state.formData;

        return (
            <Form horizontal data-tracename="添加联系计划表单">
            <Validation ref="validation" onValidate={this.handleValidate}>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get("crm.alert.topic","标题")}
                >
                    <div className="topic-wrap">
                        {/*如果是批量操作的时候，不需要展示标题*/}
                        {!this.props.selectedCustomer ? <Validator rules={[{required: true}]}>
                            <Input
                                name="topic"
                                value={formData.topic}
                                disabled
                            />
                        </Validator>:null}
                        <Select value={formData.scheduleType} onChange={this.handleTypeChange} className="schedule-topic">
                            <Option value="calls">{Intl.get("common.phone","电话")}</Option>
                            <Option value="visit">{Intl.get("common.visit","拜访")}</Option>
                            <Option value="other">{Intl.get("crm.186","其他")}</Option>
                        </Select>
                    </div>
                </FormItem>
                <FormItem
                    label={Intl.get("crm.177", "内容")}
                    {...formItemLayout}
                    validateStatus={this.getValidateStatus("content")}
                    help={this.getHelpMessage("content")}
                >
                    <div className="content-wrap">
                        <Validator
                            rules={[{required: true, message: Intl.get("crm.schedule.fill.content", "请填写联系内容")}]}

                        >
                            <Input
                                name="content"
                                type="textarea"
                                rows={2}
                                value={formData.content}
                                onChange={this.setField.bind(this, "content")}
                            />
                        </Validator>
                    </div>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get("crm.contact.time","联系时间")}
                >
                    <div className="todo-timerange-content">
                        <div className="select-timerange-buttons">
                            {this.renderRadioButtonGroup()}
                        </div>
                        {this.state.selectedTimeRange == "custom"?
                            <div className="define-timerange-area">
                                <div className="define-full-day">
                                     <span className="define-timerange-label">
                                         {Intl.get("crm.alert.full.day","全天")}:
                                    </span>
                                    <Switch
                                        defaultChecked={true}
                                        onChange={this.onChangeSelectFullday}
                                        checkedChildren="是"
                                        unCheckedChildren="否"
                                    />
                                </div>
                                <div>
                                    <span className="define-timerange-label">
                                        {Intl.get("contract.120", "开始时间")}:
                                    </span>
                                    <BootstrapDatepicker
                                        type="input"
                                        options={{format: "yyyy-mm-dd", startDate: moment().startOf("day").format(DATE_FORMAT)}}
                                        value={moment(formData.start_time).format(DATE_FORMAT)}
                                        onChange={this.onScheduleDateChange}
                                    />
                                    {this.state.isSelectFullday? null: <DateFormatSpinnerInput
                                        dateFormat="HH:mm"
                                        value={formData.start_time}
                                        onChange={this.onScheduleStartTimeChange}
                                    />}
                                </div>
                                {this.state.isSelectFullday?null:
                                <div>
                                    <span className="define-timerange-label">
                                        {Intl.get("contract.105", "结束时间")}：
                                    </span>
                                     <DateFormatSpinnerInput
                                        dateFormat="HH:mm"
                                        value={formData.end_time}
                                        onChange={this.onScheduleEndTimeChange}
                                    />
                                </div>}
                        </div> :null}
                    </div>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get("crm.alert.time","提醒时间")}
                >
                    <Select
                        value={this.state.selectedAlertTimeRange}
                        onChange={this.handleAlertTimeChange}>
                    {(this.state.selectedTimeRange == "custom" && this.state.isSelectFullday) || this.state.selectedTimeRange == "1d" || this.state.selectedTimeRange == "1w" ? this.renderSelectFulldayOptions(): this.renderNotSelectFulldayOptions()}
                    </Select>

                </FormItem>
                {/*如果是批量操作的时候，不需要展示保存和取消按钮，用原组件中有的保存和取消*/}
                {this.props.selectedCustomer? null:
                <div>
                    <FormItem
                        {...formItemLayout}
                    >
                        <div className="alert-btn-block">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="btn-primary-sure"
                                disabled={this.state.isLoading}
                                onClick={this.handleSave}
                            >
                                <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                            </Button>
                            <Button
                                type="ghost"
                                onClick={this.handleCancel}
                                className="btn-primary-cancel"
                            >
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                            </Button>
                        </div>
                    </FormItem>
                    {
                        this.state.isLoading ?
                            (<Spinner className="isloading"/>) :
                            null
                    }
                    {this.state.isMessageShow? (
                        <AlertTimer
                            message={this.state.messageContent}
                            type={this.state.messageType}
                            showIcon
                            time={1000}
                        />
                    ) : null}
                </div>}
            </Validation>
            </Form>
        );
    }
});

module.exports = CrmAlertForm;
