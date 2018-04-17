/**
 * Created by wangliping on 2017/9/20.
 */
import {Form, Icon, DatePicker, InputNumber, Select, Radio} from 'antd';
import {RightPanelCancel, RightPanelSubmit} from "CMP_DIR/rightPanel"
import language from "PUB_DIR/language/getLanguage";
import AutosizeTextarea from "CMP_DIR/autosize-textarea";
import AlertTimer from "CMP_DIR/alert-timer";
import AppUserAjax from "MOD_DIR/app_user_manage/public/ajax/app-user-ajax";
import Trace from "LIB_DIR/trace";
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const labelCol = {span: 4};
const wrapperCol = {span: 11};
const SELECT_CUSTOM_TIME_TYPE = 'custom';
class CrmUserApplyForm extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        formData: {
            //延迟时间输入框，默认是1
            delayTimeNumber: 1,
            //延期时间范围，默认是天
            delayTimeRange: "days",
            // 到期时间(选择到期时间)
            delayDeadlineTime: moment().add('days', 1).valueOf(),
            //到期不变
            over_draft: "0",
            //销售申请的备注
            remark: {
                //延期备注
                delayRemark: "",
                //启用、停用备注
                statusRemark: "",
                //修改密码备注
                passwordRemark: "",
                //修改其他类型的备注
                otherRemark: ""
            }
        },
        isApplying: false,//正在申请中
        applyErrorMsg: ""//申请报错的提示
    };
    //延期时间数字改变
    delayTimeNumberChange(value) {
        this.state.formData.delayTimeNumber = value;
        this.setState({formData: this.state.formData});
    }

    // 将延期时间设置为截止时间（具体到xx年xx月xx日）
    setDelayDeadlineTime(value) {
        let timestamp = value && value.valueOf() || '';
        this.state.formData.delayDeadlineTime = timestamp;
        this.setState({formData: this.state.formData});
    }

    // 设置不可选时间的范围
    setDisabledDate(current) {
        return current && current.valueOf() < Date.now();
    }

    //备注信息修改
    remarkChange(field, event) {
        this.state.formData.remark[field] = event.target.value;
        this.setState({formData: this.state.formData});
    }

    //延期时间范围改变
    delayTimeRangeChange(value, text) {
        this.state.formData.delayTimeRange = value;
        this.setState({formData: this.state.formData});
    }

    radioValueChange(field, event) {
        let value = event.target.value;
        this.state.formData[field] = value;
        this.setState({formData: this.state.formData});
    }

    getDelayTimeMillis() {
        //延期周期
        const delayTimeRange = this.state.formData.delayTimeRange;
        const delayTimeNumber = this.state.formData.delayTimeNumber;
        const millis = moment.duration(+delayTimeNumber, delayTimeRange).valueOf();
        return millis;
    }

    //申请延期的数据处理
    getDelayData() {
        let formData = this.state.formData;
        let submitObj = {};
        //向data中添加delay字段
        if (formData.delayTimeRange == SELECT_CUSTOM_TIME_TYPE) {
            submitObj.end_date = formData.delayDeadlineTime;
        } else {
            let delayMillis = this.getDelayTimeMillis();
            submitObj.delay = delayMillis;
        }
        //向data中添加备注
        submitObj.remark = this.state.formData.remark.delayRemark;
        //到期是否停用
        submitObj.over_draft = formData.over_draft;
        /* 构造发邮件数据
         申请审批的，需要传入用户名，客户，应用名，发邮件时候使用
         向后端传递email_customer_names,email_app_names,email_user_names，发邮件使用
         */
        //添加邮箱使用的字段, 客户名 用户名 添加应用名 用户id
        submitObj = _.extend(submitObj, this.getSelectedUserAppData());
        return submitObj;
    }

    //申请延期的数据提交
    submitDelayData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), "点击确定按钮(申请延期)");
        let submitObj = this.getDelayData();
        //销售提交申请延期
        this.setState({isApplying: true});
        AppUserAjax.applyDelayTime(submitObj).then((result) => {
            this.setState({isApplying: false});
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({applyErrorMsg: Intl.get("user.apply.delay.failed", "申请延期失败")});
            }
        }, (errorMsg) => {
            this.setState({isApplying: false, applyErrorMsg: errorMsg});
        });
    }

    getSelectedUsers() {
        //选中的用户
        let selectedUsers = [];
        if (_.isArray(this.props.crmUserList) && this.props.crmUserList.length) {
            selectedUsers = _.filter(this.props.crmUserList, (userObj) => {
                //选择的用户
                if (userObj && userObj.user && userObj.user.checked) {
                    return true;
                }
                //选择的应用
                if (userObj && _.isArray(userObj.apps) && userObj.apps.length) {
                    let checkedApp = _.find(userObj.apps, app => app.checked);
                    if (checkedApp) {
                        return true;
                    }
                }
            });
        }
        return selectedUsers;
    }

    //获取选择的用户及其应用相关的数据
    getSelectedUserAppData() {
        let selectedUsers = this.getSelectedUsers();
        //客户名 用户名 添加应用名 用户id
        let email_customer_names = [], email_user_names = [], email_app_names = [], selectedAppId = [], user_ids = [];
        _.each(selectedUsers, (obj) => {
            let customer_name = obj.customer.customer_name;
            email_customer_names.push(customer_name);
            let user_name = obj.user.user_name;
            email_user_names.push(user_name);
            user_ids.push(obj.user.user_id);
            //选择的应用
            if (obj && _.isArray(obj.apps) && obj.apps.length) {
                _.each(obj.apps, app => {
                    if (app.checked) {
                        email_app_names.push(app.app_name);
                        selectedAppId.push(app.app_id);
                    }
                });
            }
        });
        return {
            email_customer_names: _.uniq(email_customer_names).join('、'),
            email_app_names: _.uniq(email_app_names).join('、'),
            email_user_names: _.uniq(email_user_names).join('、'),
            application_ids: JSON.stringify(selectedAppId),
            user_ids: JSON.stringify(user_ids)
        };
    }

    // 申请停用
    submitStopUseData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), "点击确定按钮(申请停用)");
        const selectedUserAppData = this.getSelectedUserAppData();
        const submitObj = {
            user_ids: selectedUserAppData.user_ids,
            application_ids: selectedUserAppData.application_ids,
            remark: this.state.formData.remark.statusRemark,
            status: "0"
        };

        this.setState({isApplying: true});
        //调用申请修改开通状态
        AppUserAjax.salesApplyStatus(submitObj).then((result) => {
            this.setState({isApplying: false});
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({applyErrorMsg: Intl.get("user.apply.status.failed", "申请修改开通状态失败")});
            }
        }, (errorMsg) => {
            this.setState({isApplying: false, applyErrorMsg: errorMsg});
        });
    }

    //申请修改密码
    submitEditPasswordData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), "点击确定按钮(申请修改密码)");
        const selectedUserAppData = this.getSelectedUserAppData();
        const submitObj = {
            user_ids: selectedUserAppData.user_ids,
            remark: this.state.formData.remark.passwordRemark
        };
        this.setState({isApplying: true});
        //调用修改密码
        AppUserAjax.applyChangePassword(submitObj).then((result) => {
            this.setState({isApplying: false});
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({applyErrorMsg: Intl.get("user.apply.password.failed", "申请修改密码失败")});
            }
        }, (errorMsg) => {
            this.setState({isApplying: false, applyErrorMsg: errorMsg});
        });
    }

    //申请其他类型的修改
    submitEditOtherData() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), "点击确定按钮(申请其他类型的修改)");
        const selectedUserAppData = this.getSelectedUserAppData();
        const submitObj = {
            user_ids: selectedUserAppData.user_ids,
            remark: this.state.formData.remark.otherRemark
        };
        this.setState({isApplying: true});
        //调用修改其他类型的申请
        AppUserAjax.applyChangeOther(submitObj).then((result) => {
            this.setState({isApplying: false});
            if (result) {
                this.props.closeApplyPanel();
            } else {
                this.setState({applyErrorMsg: Intl.get("user.apply.password.failed", "申请其他类型的修改失败")});
            }
        }, (errorMsg) => {
            this.setState({isApplying: false, applyErrorMsg: errorMsg});
        });
    }

    handleSubmit() {
        if (this.state.isApplying) {
            return;
        }
        const APPLY_TYPES = this.props.APPLY_TYPES;
        const applyType = this.props.applyType;
        //申请延期
        if (applyType === APPLY_TYPES.DELAY) {
            this.submitDelayData();
        } else if (applyType === APPLY_TYPES.STOP_USE) {
            //申请停用
            this.submitStopUseData();
        } else if (applyType === APPLY_TYPES.EDIT_PASSWORD) {
            //申请修改密码
            this.submitEditPasswordData();
        } else if (applyType === APPLY_TYPES.OTHER) {
            //申请其他类型的修改
            this.submitEditOtherData();
        }
    }

    renderDelayForm() {
        let divWidth = (language.lan() === "zh") ? '80px' : '74px';
        let label = '';
        if (this.state.formData.delayTimeRange === SELECT_CUSTOM_TIME_TYPE) {
            label = Intl.get(" user.time.end", "到期时间");
        } else {
            label = Intl.get("common.delay.time", "延期时间");
        }
        return (
            <Form>
                <div className="delay_time_form">
                    <FormItem
                        label={label}
                        labelCol={labelCol}
                        wrapperCol={{span: 20}}
                    >
                        {this.state.formData.delayTimeRange === SELECT_CUSTOM_TIME_TYPE ? (
                            <DatePicker placeholder={Intl.get("my.app.change.expire.time.placeholder", "请选择到期时间")}
                                        onChange={this.setDelayDeadlineTime.bind(this)}
                                        disabledDate={this.setDisabledDate}
                                        defaultValue={moment(this.state.formData.delayDeadlineTime)}
                                        allowClear={false}
                                        showToday={false}
                            />
                        ) : (
                            <InputNumber
                                value={this.state.formData.delayTimeNumber}
                                onChange={this.delayTimeNumberChange.bind(this)}
                                style={{width: '80px', height: '30px'}}
                                min={1}
                                max={10000}
                            />
                        )}

                        <Select
                            value={this.state.formData.delayTimeRange}
                            style={{width: divWidth}}
                            onChange={this.delayTimeRangeChange.bind(this)}
                        >
                            <Option value="days"><ReactIntl.FormattedMessage id="common.time.unit.day"
                                                                             defaultMessage="天"/></Option>
                            <Option value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week"
                                                                              defaultMessage="周"/></Option>
                            <Option value="months"><ReactIntl.FormattedMessage id="common.time.unit.month"
                                                                               defaultMessage="月"/></Option>
                            <Option value="years"><ReactIntl.FormattedMessage id="common.time.unit.year"
                                                                              defaultMessage="年"/></Option>
                            <Option value="custom"><ReactIntl.FormattedMessage id="user.time.custom"
                                                                               defaultMessage="自定义"/></Option>
                        </Select>
                    </FormItem>
                </div>
                <FormItem
                    label={Intl.get("user.expire.select", "到期可选")}
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                >
                    <RadioGroup onChange={this.radioValueChange.bind(this, 'over_draft')}
                                value={this.state.formData.over_draft}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用"/></Radio>
                        <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade"
                                                                             defaultMessage="降级"/></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability"
                                                                             defaultMessage="不变"/></Radio>
                    </RadioGroup>
                </FormItem>
                {/*申请延期要填备注，批量延期不需要填备注*/}
                <FormItem
                    label={Intl.get("common.remark", "备注")}
                    labelCol={labelCol}
                    wrapperCol={{span: 13}}
                >
                    <AutosizeTextarea
                        rows="5"
                        onChange={this.remarkChange.bind(this, "delayRemark")}
                        value={this.state.formData.remark.delayRemark}
                    />
                </FormItem>
            </Form>
        );
    }

    renderIndicator() {
        if (this.state.isApplying) {
            return (
                <Icon type="loading"/>
            );
        }
        const hide = function () {
            this.setState({applyErrorMsg: ""});
        };
        if (this.state.applyErrorMsg) {
            return (
                <AlertTimer time={3000} message={this.state.applyErrorMsg} type="error" showIcon
                            onHide={hide.bind(this)}/>
            );
        }
        return null;
    }

    //停用及修改密码的备注表单
    renderRemarkForm(key) {
        return (
            <form>
                <FormItem
                    label={Intl.get("common.remark", "备注")}
                    labelCol={labelCol}
                    wrapperCol={{span: 13}}
                >
                    <AutosizeTextarea
                        rows="5"
                        onChange={this.remarkChange.bind(this, key)}
                        value={this.state.formData.remark[key]}
                    />
                </FormItem>
            </form>
        );
    }

    closeApplyPanel() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), "点击取消按钮");
        this.props.closeApplyPanel();
    }

    render() {
        const APPLY_TYPES = this.props.APPLY_TYPES;
        const applyType = this.props.applyType;
        return (
            <div className="crm-user-apply-form-container">
                {applyType === APPLY_TYPES.DELAY ? this.renderDelayForm() :
                    applyType === APPLY_TYPES.STOP_USE ? this.renderRemarkForm("statusRemark") :
                        applyType === APPLY_TYPES.EDIT_PASSWORD ? this.renderRemarkForm("passwordRemark") :
                            applyType === APPLY_TYPES.OTHER ? this.renderRemarkForm("otherRemark") : null}
                <div className="pull-right">
                    <RightPanelCancel onClick={this.closeApplyPanel.bind(this)}>
                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                    </RightPanelCancel>
                    <RightPanelSubmit onClick={this.handleSubmit.bind(this)}>
                        <ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定"/>
                    </RightPanelSubmit>
                    <div className="indicator">
                        {this.renderIndicator()}
                    </div>
                </div>
            </div>)
    }
}

export default CrmUserApplyForm;
