require("../scss/apply-user-form.scss");
require("../../../../public/css/antd-vertical-tabs.css");
import {Tabs, Tooltip, Form, Input, Validation, Radio, InputNumber, Icon, message,Checkbox} from "antd";
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Validator = Validation.Validator;
const RadioGroup = Radio.Group;
const RightPanelSubmit = require("../../../../components/rightPanel").RightPanelSubmit;
const RightPanelCancel = require("../../../../components/rightPanel").RightPanelCancel;
import UserTimeRangeField from '../../../../components/user_manage_components/user-time-rangefield';
import ValidateMixin from "../../../../mixins/ValidateMixin";
const Spinner = require("../../../../components/spinner");
const history = require("../../../../public/sources/history");
const OrderAction = require("../action/order-actions");
const DatePickerUtils = require("../../../../components/date-selector/utils");
import UserNameTextfieldUtil from '../../../../components/user_manage_components/user-name-textfield/util';
const applyTitles = [Intl.get("crm.100", "老用户申请试用用户"), Intl.get("crm.101", "老用户转签约用户"), Intl.get("common.apply.user.trial", "申请试用用户"), Intl.get("user.apply.user.official", "申请签约用户")];
const ApplyUserForm = React.createClass({
    mixins: [ValidateMixin, UserTimeRangeField],

    getInitialState: function () {
        const formData = this.buildFormData(this.props);

        return {
            formData: formData,
            appFormData: formData.products[0],
            isLoading: false,
            onlyOneUser: false,//是否只能开通一个用户（用户名是邮箱格式时）
            setAllChecked: true//是否设置到所有应用上
        };
    },

    componentWillReceiveProps: function (nextProps) {
        this.buildFormData(nextProps);
    },

    buildFormData: function (props) {
        const timeObj = DatePickerUtils.getHalfAMonthTime();
        const begin_date = DatePickerUtils.getMilliseconds(timeObj.start_time);
        const end_date = DatePickerUtils.getMilliseconds(timeObj.end_time);
        const order = props.order;
        let formData = {
            customer_id: order.customer_id,
            order_id: order.id,
            sales_opportunity: order.sale_stages,
            remark: "",
            tag: [0, 2].indexOf(props.applyType) > -1 ? Intl.get("common.trial.user", "试用用户") : Intl.get("common.trial.official", "正式用户"),
            user_name: "",
            nick_name: props.customerName
        };
        //构造应用数据
        formData.products = props.apps.map(app => {
            return {
                client_id: app.client_id,
                number: 1,
                begin_date: begin_date,
                end_date: end_date,
                range: "0.5m",
                over_draft: 1,
            };
        });

        if (this.state) {
            this.state.formData = formData;
            this.state.appFormData = formData.products[0];
        } else {
            return formData;
        }
    },

    onAppChange: function (id) {
        //如果用户名是邮箱格式，并且应用对应用户开通数量超过1时，不能切换应用
        if (id === this.state.appFormData.client_id || this.state.onlyOneUser) {
            return;
        } else {
            const appFormData = _.find(this.state.formData.products, app => app.client_id === id);
            this.setState({appFormData: appFormData});
        }
    },
    onNickNameChange: function (e) {
        this.state.formData.nick_name = e.target.value.trim();
        this.setState(this.state);
    },

    onRemarkChange: function (e) {
        this.state.formData.remark = e.target.value.trim();
        this.setState(this.state);
    },

    onUserNameChange: function (e) {
        let userName = e.target.value.trim();
        this.state.formData.user_name = userName;
        if (userName && userName.indexOf("@") != -1 && this.state.appFormData.number > 1) {
            //用户名是邮箱格式时，只能申请1个用户
            this.state.onlyOneUser = true;
        } else {
            this.state.onlyOneUser = false;
        }
        this.setState(this.state);
    },

    onCountChange: function (v) {
        let userName = this.state.formData.user_name;
        if (userName && userName.indexOf("@") != -1 && v > 1) {
            //用户名是邮箱格式时，只能申请1个用户
            this.state.onlyOneUser = true;
        } else {
            this.state.onlyOneUser = false;
        }
        this.state.appFormData.number = v;
        this.setState(this.state);
    },

    onTimeChange: function (begin_date, end_date, range) {
        this.state.appFormData.begin_date = parseInt(begin_date);
        this.state.appFormData.end_date = parseInt(end_date);
        this.state.appFormData.range = range;
        this.setState(this.state);
    },

    onOverDraftChange: function (e) {
        this.state.appFormData.over_draft = parseInt(e.target.value);
        this.setState(this.state);
    },

    handleSubmit: function (e) {
        e.preventDefault();
        if (this.state.isLoading) {
            //正在申请，不可重复申请
            return;
        }
        const validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid || this.state.onlyOneUser) {
                return;
            } else {
                this.setState({isLoading: true});
                this.state.formData.user_name = this.state.formData.user_name.trim();
                let submitData = JSON.parse(JSON.stringify(this.state.formData));
                //是否将当前设置，应用到所有应用上
                if (this.state.setAllChecked) {
                    let appFormData = this.state.appFormData;
                    submitData.products = submitData.products.map(app => {
                        return {
                            client_id: app.client_id,
                            number: appFormData.number,
                            begin_date: appFormData.begin_date,
                            end_date: appFormData.end_date,
                            over_draft: appFormData.over_draft
                        };
                    });
                } else {
                    submitData.products.forEach(app => delete app.range);
                }
                submitData.products = JSON.stringify(submitData.products);
                //添加申请邮件中用的应用名
                if (_.isArray(this.props.apps)) {
                    var client_names = _.map(this.props.apps, (obj) => obj.client_name);
                    submitData.email_app_names = client_names.join("、");
                }
                //添加申请邮件中用的客户名
                submitData.email_customer_names = this.props.customerName;
                //添加申请邮件中用的用户名
                submitData.email_user_names = submitData.user_name.trim();
                OrderAction.applyUser(submitData, {}, result => {
                    this.setState({isLoading: false});
                    if (result === true) {
                        message.success( Intl.get("user.apply.success", "申请成功"));
                        this.handleCancel();
                    }
                    else {
                        message.error(result);
                    }
                });
            }
        });
    },

    handleCancel: function () {
        this.props.cancelApply();
    },
    //是否应用到所有应用上的设置
    toggleCheckbox: function () {
        this.setState({setAllChecked: !this.state.setAllChecked});
    },
    renderTabToolTip(app_name) {
        return (
            <Tooltip title={app_name} placement="right">
                {<div className="app_name_tooltip">{app_name}</div>}
            </Tooltip>
        );
    },

    checkUserExist(rule,value,callback) {
        let customer_id = this.state.formData.customer_id;
        let  number = this.state.appFormData.number;
        let trimValue = value.trim();
        // 校验的信息提示
        UserNameTextfieldUtil.validatorMessageTips(trimValue,callback);
        let obj = {
            customer_id: customer_id,
            user_name: trimValue
        };
        UserNameTextfieldUtil.checkUserExist(rule,obj,callback, number, this.refs.username_block);
    },

    render: function () {
        const appFormData = this.state.appFormData;
        const fixedHeight = $(window).height() - 290;
        const formData = this.state.formData;
        //用于布局的常量 左侧app名称的margin-left和margin-top
        const appMarginLeft = 18, appMarginTop = 15;
        //左侧展示app的个数
        const length = this.props.apps.length > 4 ? this.props.apps.length : 4;
        //appHeight为左侧每个app名称的高度 appWidth为左侧每个app名称的宽度
        const appHeight = $('.antd-vertical-tabs-tab').height(),
               appWidth = $('.antd-vertical-tabs-tab').width();
        //appContentHeight为左侧所有app所在容器的高度
        const appContentHeight = $('.antd-vertical-tabs-content').height();
        const shadowTop = appMarginTop + length * appHeight;
        //父元素的高度-<b>相对定位的top值=<b>元素的高度 <b>为遮盖元素
        const shadowHeight = (appContentHeight-shadowTop < 0) ? 0 : (appContentHeight - shadowTop);
        const shadowLeft = appMarginLeft + appWidth;
        const timePickerConfig = {
            isCustomSetting: true,
            appId: "applyUser"
        };
       
        return (
            <div className="full_size wrap_padding crm_apply_user_form_wrap">
                <Tabs defaultActiveKey="form">
                    <TabPane tab={applyTitles[this.props.applyType]} key="form">
                        <div className="crm_apply_user_form" style={{height:fixedHeight}} ref="scrollWrap">
                            <Form horizontal>
                                <Validation ref="validation" onValidate={this.handleValidate}>
                                    <div className="user-name-textfield-block" ref="username_block">
                                        <FormItem
                                            label={Intl.get("common.username", "用户名")}
                                            labelCol={{span: 4}}
                                            wrapperCol={{span: 14}}
                                            validateStatus={this.getValidateStatus("user_name")}
                                            help={this.getHelpMessage("user_name")}
                                        >
                                            <Validator  rules={[{validator:this.checkUserExist}]}>
                                                <Input
                                                    name="user_name"
                                                    placeholder={Intl.get("user.username.write.tip", "请填写用户名")}
                                                    value={formData.user_name}
                                                    onChange={this.onUserNameChange}/>
                                            </Validator>
                                        </FormItem>
                                    </div>
                                    <FormItem
                                        label={Intl.get("common.nickname", "昵称")}
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 14}}
                                        validateStatus={this.getValidateStatus("nick_name")}
                                        help={this.getHelpMessage("nick_name")}
                                    >
                                        <Validator rules={[{required: true,message: Intl.get("user.nickname.write.tip", "请填写昵称")}]}>
                                            <Input
                                                name="nick_name"
                                                placeholder={Intl.get("user.nickname.write.tip", "请填写昵称")}
                                                value={formData.nick_name}
                                                onChange={this.onNickNameChange}/>
                                        </Validator>
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get("common.remark", "备注")}
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 14}}
                                    >
                                        <Input
                                            type="textarea"
                                            placeholder={Intl.get("user.remark.write.tip", "请填写备注")}
                                            value={formData.remark}
                                            onChange={this.onRemarkChange}/>
                                    </FormItem>
                                </Validation>
                                <div className="app-user-info ant-form-item" style={{maxHeight:fixedHeight}}>
                                    <Tabs tabPosition="left" onChange={this.onAppChange}
                                          prefixCls="antd-vertical-tabs">
                                        {this.props.apps.map(app => {
                                            //应用到所有应用或只能申请一个应用的验证未通过，并且不是当前展示应用时，不可切换到其他应用
                                            let disabled = (this.state.setAllChecked || this.state.onlyOneUser) && app.client_id != appFormData.client_id;
                                            return (<TabPane key={app.client_id}
                                                             tab={this.renderTabToolTip(app.client_name)}
                                                             disabled={disabled}>
                                                <div className="set-all-check-box col-22">
                                                    <Checkbox checked={this.state.setAllChecked}
                                                              onChange={this.toggleCheckbox}/>
                                                    <span className="checkbox-title" onClick={this.toggleCheckbox}><ReactIntl.FormattedMessage id="user.all.app.set" defaultMessage="设置到所有应用上" /></span>
                                                    <span className="checkbox-notice">(<ReactIntl.FormattedMessage id="crm.105" defaultMessage="注：若想设置单个应用，请取消此项的勾选" />)</span>
                                                </div>
                                                <div className="app-tab-pane col-22">
                                                    <FormItem
                                                        label={Intl.get("user.batch.open.count", "开通个数")}
                                                        labelCol={{span: 4}}
                                                        wrapperCol={{span: 20}}
                                                    >
                                                        <InputNumber
                                                            prefixCls={this.state.onlyOneUser?"number-error-border ant-input-number":"ant-input-number"}
                                                            value={appFormData.number}
                                                            min={1}
                                                            max={999}
                                                            onChange={this.onCountChange}/>
                                                    </FormItem>
                                                    {this.state.onlyOneUser ?
                                                        <div className="only-one-user-tip">
                                                            {Intl.get("crm.201", "用户名是邮箱格式时，只能申请1个用户")}</div> : null}
                                                    <FormItem
                                                        label={Intl.get("user.open.cycle", "开通周期")}
                                                        labelCol={{span: 4}}
                                                        wrapperCol={{span: 20}}
                                                    >
                                                        {this.renderUserTimeRangeBlock(timePickerConfig)}
                                                    </FormItem>
                                                    <FormItem
                                                        label={Intl.get("user.expire.select", "到期可选")}
                                                        labelCol={{span: 4}}
                                                        wrapperCol={{span: 20}}
                                                    >
                                                        <RadioGroup onChange={this.onOverDraftChange}
                                                                    value={appFormData.over_draft.toString()}>
                                                            <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用" /></Radio>
                                                            <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade" defaultMessage="降级" /></Radio>
                                                            <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability" defaultMessage="不变" /></Radio>
                                                        </RadioGroup>
                                                    </FormItem>
                                                </div>
                                            </TabPane>)
                                        })}
                                    </Tabs>
                                    {
                                        this.state.isLoading ?
                                            (<Spinner className="isloading"/>) :
                                            (null)
                                    }
                                <b style={{height:shadowHeight,top:shadowTop,left:shadowLeft,}}></b>
                                </div>
                                <FormItem
                                    wrapperCol={{span: 23}}
                                >
                                    <RightPanelCancel onClick={this.handleCancel}
                                                      style={{visibility:this.state.submitResult === 'success' ? 'hidden' : 'visible'}}>
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit}
                                                      style={{visibility:this.state.submitResult === 'success' ? 'hidden' : 'visible'}}
                                                      disabled={this.state.isLoading}>
                                        <ReactIntl.FormattedMessage id="crm.109" defaultMessage="申请" />
                                    </RightPanelSubmit>
                                </FormItem>
                            </Form>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
});

module.exports = ApplyUserForm;