require("../../scss/alert.scss");
var AlertStore = require("../../store/alert-store");
var AlertAction = require("../../action/alert-action");
var Spinner = require('../../../../../components/spinner');
var AlertTimer = require('../../../../../components/alert-timer');
import { Form, Validation, Input, Button, message } from "antd";
const FormItem = Form.Item;
const Validator = Validation.Validator;
import "react-date-picker/index.css";
import { DateFormatSpinnerInput } from "react-date-picker";
import BootstrapDatepicker from "../../../../../components/bootstrap-datepicker";
import ValidateMixin from "../../../../../mixins/ValidateMixin";
import Trace from "LIB_DIR/trace";

const DATE_FORMAT = oplateConsts.DATE_FORMAT;

var CrmAlertForm = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function() {
        let formData = this.props.currentAlert;
        formData.alert_time = formData.alert_time || moment().add(1, "day").valueOf();

        return {
            formData: formData,
            isLoading: false,
            isMessageShow: false,
            messageType: "success",
            messageContent: "",
        };
    },
    onDateChange: function(date) {
        //原有时间
        const dateTime = this.state.formData.alert_time;
        //获取原有时间里去除了日期之后的时间值部分
        const timeValue = dateTime - moment(dateTime).startOf("day").valueOf();
        //用新选择的日期加上原有时间里的时间值部分得到新选择的时间值
        const newTime = moment(date).valueOf() + timeValue;

        this.state.formData.alert_time = newTime;
        this.setState(this.state);
        Trace.traceEvent(this.getDOMNode(),"修改提醒日期");
    },
    onTimeChange: function(time) {
        //用原有时间里的日期部分加上新选择的时间，组合出新选择的时间字符串
        const newTimeStr = moment(this.state.formData.alert_time).format(DATE_FORMAT) + " " + time;
        //将时间字符串转换成unix时间戳
        const newTime = moment(newTimeStr).valueOf();

        //禁止选择小于当前时间的时间
        if (newTime < moment().valueOf()) return;

        this.state.formData.alert_time = newTime;
        this.setState(this.state);
        Trace.traceEvent(this.getDOMNode(),"修改提醒时间");
    },
    handleSubmit: function(e) {
        e.preventDefault();

        this.refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.setState({isLoading: true});
        
                const _this = this;
        
                if (this.props.currentAlert.id) {
                    AlertAction.editAlert(this.state.formData, function (resData) {
                        if (resData.code == 0) {
                            _this.showMessage( Intl.get("user.edit.success", "修改成功"));
                            _this.props.getAlertList();
                        } else {
                            _this.showMessage(Intl.get("common.edit.failed", "修改失败"), "error");
                        }
            
                        _this.setState({isLoading: false});
                    });
                } else {
                    AlertAction.addAlert(this.state.formData, function (resData) {
                        if (resData.code == 0) {
                            _this.showMessage( Intl.get("user.user.add.success", "添加成功"));
                            _this.props.getAlertList();
                        } else {
                            _this.showMessage(Intl.get("crm.154", "添加失败"), "error");
                        }
            
                        _this.setState({isLoading: false});
                    });
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
    handleSave: function () {
        Trace.traceEvent(this.getDOMNode(),"保存对提醒的添加/修改");
    },
    handleCancel: function () {
        Trace.traceEvent(this.getDOMNode(),"取消对提醒的添加/编辑");
        AlertAction.cancelEdit();
    },
    render: function () {
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 8 },
        };

        return (
            <Form horizontal onSubmit={this.handleSubmit}>
            <Validation ref="validation" onValidate={this.handleValidate}>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get("common.login.time", "时间")}
                >
                    <BootstrapDatepicker
                        type="input"
                        options={{format: "yyyy-mm-dd", startDate: moment().startOf("day").format(DATE_FORMAT)}}
                        value={moment(this.state.formData.alert_time).format(DATE_FORMAT)}
                        onChange={this.onDateChange}
                    />
                    <DateFormatSpinnerInput
                        dateFormat="HH:mm"
                        value={this.state.formData.alert_time}
                        onChange={this.onTimeChange}
                    />
                </FormItem>
                <FormItem
                    label={Intl.get("crm.177", "内容")}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 16 }}
                    validateStatus={this.getValidateStatus("topic")}
                    help={this.getHelpMessage("topic")}
                >
                    <Validator
                        rules={[{required: true, message: Intl.get("user.apply.reply.placeholder", "请填写内容")}]}
                    >
                    <Input
                        name="topic"
                        type="textarea"
                        rows={2}
                        value={this.state.formData.topic}
                        onChange={this.setField.bind(this, "topic")}
                        data-tracename="填写提醒内容"
                    />
                    </Validator>
                </FormItem>
                <FormItem
                    wrapperCol={{ span: 16, offset: 3 }}
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
                        (null)
                }
                {this.state.isMessageShow? (
                    <AlertTimer
                        message={this.state.messageContent}
                        type={this.state.messageType}
                        showIcon
                        time={1000}
                    />
                ) : null}
            </Validation>
            </Form>
        );
    }
});

module.exports = CrmAlertForm;
