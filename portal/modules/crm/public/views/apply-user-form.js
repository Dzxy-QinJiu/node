const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
require("../css/apply-user-form.less");
require("../../../../public/css/antd-vertical-tabs.css");
import {Tabs, Tooltip, Form, Input, Radio, InputNumber, Select, message, Checkbox, Tag} from "antd";
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
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
import {OVER_DRAFT_TYPES} from 'PUB_DIR/sources/utils/consts';
import commonAppAjax from "MOD_DIR/common/public/ajax/app";
import contactAjax from "../ajax/contact-ajax";
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');

import DetailCard from "CMP_DIR/detail-card";
import SquareLogoTag from "./components/square-logo-tag";
import ApplyUserAppConfig from "./components/apply-user-app-config";
import AppConfigForm from "./components/apply-user-app-config/app-config-form";

const applyTitles = [Intl.get("crm.100", "老用户申请试用用户"), Intl.get("crm.101", "老用户转签约用户"), Intl.get("common.apply.user.trial", "申请试用用户"), Intl.get("user.apply.user.official", "申请签约用户")];
const TRIAL_USER_TYPES = [0, 2];//0：老用户申请试用用户，2：申请试用用户
//顶部tab标题的高度
const LAY_CONSTS = {
    TAB_TITLE_HEIGHT: 80
};
const CONFIG_TYPE = {
    UNIFIED_CONFIG: "unified_config",//统一配置
    SEPARATE_CONFIG: "separate_config"//分别配置
};
const ApplyUserForm = React.createClass({
    mixins: [ValidateMixin, UserTimeRangeField],

    getInitialState: function() {
        const formData = this.buildFormData(this.props);

        return {
            formData: formData,
            appFormData: formData.products[0],
            appDefaultConfigList: [],//应用默认配置列表
            isLoading: false,
            configType: CONFIG_TYPE.UNIFIED_CONFIG,//配置类型：统一配置、分别配置
            customerContacts: []//客户的联系人列表
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.buildFormData(nextProps);
        let oldAppIds = _.pluck(this.props.apps, "client_id");
        let newAppIds = _.pluck(nextProps.apps, "client_id");
        //获取newAppIds中，不存在于oldAppIds中的应用id
        let diffAppIds = _.difference(newAppIds, oldAppIds);
        //获取新增的应用的默认配置
        this.getAppsDefaultConfig(diffAppIds);
    },
    buildFormData: function(props) {
        const timeObj = DatePickerUtils.getHalfAMonthTime();
        const begin_date = DatePickerUtils.getMilliseconds(timeObj.start_time);
        let end_date = DatePickerUtils.getMilliseconds(timeObj.end_time);
        const order = props.order;
        const isTrailUserType = TRIAL_USER_TYPES.indexOf(props.applyType) !== -1;
        let formData = {
            customer_id: order.customer_id,
            order_id: order.id,
            sales_opportunity: order.sale_stages,
            remark: "",
            tag: isTrailUserType ? Intl.get("common.trial.user", "试用用户") : Intl.get("common.trial.official", "正式用户"),
            user_name: "",
            nick_name: props.customerName
        };
        //获取的应用默认配置列表
        let appDefaultConfigList = this.state ? this.state.appDefaultConfigList : [];
        //构造应用数据
        formData.products = props.apps.map(app => {
            //没有取到应用默认配置时的默认值
            let appData = {
                client_id: app.client_id,
                number: 1,
                begin_date: begin_date,
                end_date: end_date,
                range: "0.5m",
                over_draft: isTrailUserType ? OVER_DRAFT_TYPES.UN_CHANGED : OVER_DRAFT_TYPES.STOP_USE, //0：到期不变，1：到期停用
            };
            if (_.isArray(appDefaultConfigList) && appDefaultConfigList.length) {
                let defaultConfig = _.find(appDefaultConfigList, data => data.client_id === app.client_id && formData.tag === data.user_type);
                //找到该应用对应用户类型的默认配置信息
                if (defaultConfig) {
                    appData.end_date = begin_date + defaultConfig.valid_period;
                    appData.range = DatePickerUtils.getDateRange(defaultConfig.valid_period);
                    appData.over_draft = defaultConfig.over_draft;
                }
            }
            return appData;
        });

        if (this.state) {
            this.state.formData = formData;
            // this.state.appFormData = formData.products[0];
        } else {
            return formData;
        }
    },
    componentDidMount: function() {
        let appList = this.props.apps;
        if (_.isArray(appList) && appList.length) {
            //获取各应用的默认设置
            this.getAppsDefaultConfig(_.pluck(appList, 'client_id'));
        }
        this.getCustomerContacts();
    },
    //获取客户联系人列表
    getCustomerContacts: function() {
        let customerId = this.state.formData ? this.state.formData.customer_id : "";
        if (!customerId) return;
        contactAjax.getContactList(customerId).then((data) => {
            let contactList = data && _.isArray(data.result) ? data.result : [];
            this.setState({
                customerContacts: contactList
            });
        }, (errorMsg) => {
            this.setState({
                customerContacts: []
            });
        });
    },
    //获取各应用的默认设置
    getAppsDefaultConfig: function(appIds) {
        if (_.isArray(appIds) && appIds.length) {
            //获取各应用的默认设置(不需要角色和权限信息)
            commonAppAjax.getAppsDefaultConfigAjax().sendRequest({
                client_id: appIds.join(','),
                with_addition: false
            }).success((dataList) => {
                if (_.isArray(dataList) && dataList.length) {
                    //去重取并集
                    let appDefaultConfigList = _.union(this.state.appDefaultConfigList, dataList);
                    let formData = this.state.formData;
                    formData.products = formData.products.map(app => {
                        //找到该应用对应用户类型的配置信息
                        let defaultConfig = _.find(appDefaultConfigList, data => data.client_id === app.client_id && formData.tag === data.user_type);
                        if (defaultConfig) {
                            //应用默认设置中的开通周期、到期可选项
                            app.begin_date = DatePickerUtils.getMilliseconds(moment().format(oplateConsts.DATE_FORMAT));
                            app.end_date = app.begin_date + defaultConfig.valid_period;
                            app.range = DatePickerUtils.getDateRange(defaultConfig.valid_period);
                            app.over_draft = defaultConfig.over_draft;
                        }
                        return app;
                    });
                    this.setState({
                        formData: formData,
                        // appFormData: formData.products[0],
                        appDefaultConfigList: appDefaultConfigList
                    });
                }
            });
        }
    },

    // onAppChange: function (id) {
    //如果用户名是邮箱格式，并且应用对应用户开通数量超过1时，不能切换应用
    // if (id === this.state.appFormData.client_id || this.state.onlyOneUser) {
    //     return;
    // } else {
    //     const appFormData = _.find(this.state.formData.products, app => app.client_id === id);
    //     this.setState({appFormData: appFormData});
    // }
    // },
    onNickNameChange: function(e) {
        this.state.formData.nick_name = e.target.value.trim();
        this.setState(this.state);
    },

    onRemarkChange: function(e) {
        this.state.formData.remark = e.target.value.trim();
        this.setState(this.state);
    },

    onUserNameChange: function(e) {
        let userName = e.target.value.trim();
        this.state.formData.user_name = userName;
        let isEmail = userName && userName.indexOf("@") != -1;
        _.each(this.state.formData.products, appFormData => {
            //用户名是邮箱格式时，只能申请1个用户
            if (isEmail && appFormData.number > 1) {
                appFormData.onlyOneUserTip = true;
            } else {
                appFormData.onlyOneUserTip = false;
            }
        });
        this.setState(this.state);
    },

    onCountChange: function(app, v) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.number = v;
            let userName = this.state.formData.user_name;
            if (userName && userName.indexOf("@") != -1 && v > 1) {
                //用户名是邮箱格式时，只能申请1个用户
                appFormData.onlyOneUserTip = true;
            } else {
                appFormData.onlyOneUserTip = false;
            }
        }
        this.setState(this.state);
    },

    onTimeChange: function(begin_date, end_date, range, app) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.begin_date = parseInt(begin_date);
            appFormData.end_date = parseInt(end_date);
            appFormData.range = range;
            this.setState(this.state);
        }
    },

    onOverDraftChange: function(app, e) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.over_draft = parseInt(e.target.value);
        }
        this.setState(this.state);
    },

    handleSubmit: function(e) {
        e.preventDefault();
        if (this.state.isLoading) {
            //正在申请，不可重复申请
            return;
        }
        const validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                let submitData = JSON.parse(JSON.stringify(this.state.formData));
                let hasOnlyOneUserTip = _.find(submitData.products, item => item.onlyOneUserTip);
                //有只能申请一个的验证提示时，没有通过验证，不能提交（用户名是邮箱格式时，只能开通一个用户）
                if (hasOnlyOneUserTip) return;
                this.setState({isLoading: true});
                this.state.formData.user_name = this.state.formData.user_name.trim();
                //统一配置
                if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {
                    let appFormData = _.isArray(submitData.products) && submitData.products[0] ? submitData.products[0] : {};
                    submitData.products = _.map(submitData.products, app => {
                        return {
                            client_id: app.client_id,
                            number: appFormData.number,
                            begin_date: appFormData.begin_date,
                            end_date: appFormData.end_date,
                            over_draft: appFormData.over_draft
                        };
                    });
                } else {//分别配置
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
                        message.success(Intl.get("user.apply.success", "申请成功"));
                        this.handleCancel();
                    } else {
                        message.error(result || Intl.get("common.apply.failed", "申请失败"));
                    }
                });
            }
        });
    },

    handleCancel: function() {
        this.props.cancelApply();
    },
    //是否应用到所有应用上的设置
    toggleCheckbox: function() {
        this.setState({setAllChecked: !this.state.setAllChecked});
    },
    renderTabToolTip(app_name) {
        return (
            <Tooltip title={app_name} placement="right">
                {<div className="app_name_tooltip">{app_name}</div>}
            </Tooltip>
        );
    },
    //获取申请用户的个数
    getApplyUserCount(){
        let appFormData = _.isArray(this.state.formData.products) ? this.state.formData.products[0] : {};
        //TODO 获取验证时所需的开通个数
        return appFormData.number || 1;
    },
    checkUserExist(rule, value, callback) {
        let customer_id = this.state.formData.customer_id;
        let number = this.getApplyUserCount();
        let trimValue = $.trim(value);
        // 校验的信息提示
        UserNameTextfieldUtil.validatorMessageTips(trimValue, callback);
        let obj = {
            customer_id: customer_id,
            user_name: trimValue
        };
        UserNameTextfieldUtil.checkUserExist(rule, obj, callback, number, this.refs.username_block);
    },
    selectEmail: function(value, field) {
        value = $.trim(value);
        if (value) {
            this.state.formData.user_name = value;
            this.setState({formData: this.state.formData});
        }
    },
    renderUserNameInput: function(userName) {
        const placeholder = Intl.get("user.username.write.tip", "请填写用户名");
        let input = (
            <Input
                name="user_name"
                placeholder={placeholder}
                value={userName}
                onChange={this.onUserNameChange}/>
        );
        let customerContacts = this.state.customerContacts;
        let emailList = [];//联系人的邮箱列表
        if (customerContacts.length) {
            _.each(customerContacts, contact => {
                if (_.isArray(contact.email) && contact.email.length) {
                    _.each(contact.email, email => {
                        if (email.indexOf(userName) != -1) {
                            emailList.push(email);
                        }
                    });
                }
            });
        }
        if (emailList.length) {
            return (
                <Select combobox
                    name="user_name"
                    placeholder={placeholder}
                    filterOption={false}
                    onChange={this.selectEmail}
                    value={userName}
                    dropdownMatchSelectWidth={false}
                >
                    {emailList.map((email, i) => {
                        return (<Option key={i} value={email}>{email}</Option>);
                    })}
                </Select>
            );
        } else {
            return input;
        }
    },
    changeConfigType: function(configType) {
        this.setState({configType});
    },

    renderAppConfigForm: function(appFormData) {
        const timePickerConfig = {
            isCustomSetting: true,
            appId: "applyUser"
        };
        return (<AppConfigForm appFormData={appFormData}
            timePickerConfig={timePickerConfig}
            renderUserTimeRangeBlock={this.renderUserTimeRangeBlock}
            onCountChange={this.onCountChange}
            onOverDraftChange={this.onOverDraftChange}/>);
    },
    renderApplyUserForm: function() {
        const appFormData = this.state.appFormData;
        const fixedHeight = $(window).height() - LAY_CONSTS.TAB_TITLE_HEIGHT;
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
        const shadowHeight = (appContentHeight - shadowTop < 0) ? 0 : (appContentHeight - shadowTop);
        const shadowLeft = appMarginLeft + appWidth;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        };
        return (
            <Form horizontal className="apply-user-form">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    <div className="user-name-textfield-block" ref="username_block">
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get("common.username", "用户名")}
                            validateStatus={this.getValidateStatus("user_name")}
                            help={this.getHelpMessage("user_name")}
                            required
                        >
                            <Validator rules={[{validator: this.checkUserExist}]}>
                                {this.renderUserNameInput(formData.user_name)}
                            </Validator>
                        </FormItem>
                    </div>
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get("common.nickname", "昵称")}
                        validateStatus={this.getValidateStatus("nick_name")}
                        help={this.getHelpMessage("nick_name")}
                        required
                    >
                        <Validator rules={[{
                            required: true,
                            message: Intl.get("user.nickname.write.tip", "请填写昵称")
                        }]}>
                            <Input
                                name="nick_name"
                                placeholder={Intl.get("user.nickname.write.tip", "请填写昵称")}
                                value={formData.nick_name}
                                onChange={this.onNickNameChange}/>
                        </Validator>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get("common.app", "应用")}
                        required
                    >
                        { _.map(this.props.apps, app => {
                            return (
                                <SquareLogoTag name={app ? app.client_name : ""}
                                    logo={app ? app.client_logo : ""}
                                />);
                        })}
                    </FormItem>
                    <ApplyUserAppConfig apps={this.props.apps}
                        appsFormData={formData.products}
                        configType={this.state.configType}
                        changeConfigType={this.changeConfigType}
                        renderAppConfigForm={this.renderAppConfigForm.bind(this)}
                    />
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get("common.remark", "备注")}
                    >
                        <Input
                            type="textarea"
                            placeholder={Intl.get("user.remark.write.tip", "请填写备注")}
                            value={formData.remark}
                            onChange={this.onRemarkChange}/>
                    </FormItem>
                </Validation>
                {/*<div className="app-user-info ant-form-item" style={{maxHeight: fixedHeight}}>*/}
                {/*<Tabs tabPosition="left" onChange={this.onAppChange}*/}
                {/*prefixCls="antd-vertical-tabs">*/}
                {/*{this.props.apps.map(app => {*/}
                {/*//应用到所有应用或只能申请一个应用的验证未通过，并且不是当前展示应用时，不可切换到其他应用*/}
                {/*let disabled = (this.state.setAllChecked || this.state.onlyOneUser) && app.client_id != appFormData.client_id;*/}
                {/*return (<TabPane key={app.client_id}*/}
                {/*tab={this.renderTabToolTip(app.client_name)}*/}
                {/*disabled={disabled}>*/}
                {/*<div className="set-all-check-box col-22">*/}
                {/*<Checkbox checked={this.state.setAllChecked}*/}
                {/*onChange={this.toggleCheckbox}/>*/}
                {/*<span className="checkbox-title" onClick={this.toggleCheckbox}>*/}
                {/*{Intl.get("user.all.app.set", "设置到所有应用上")}*/}
                {/*</span>*/}
                {/*/!*<span className="checkbox-notice">(<ReactIntl.FormattedMessage id="crm.105" defaultMessage="注：若想设置单个应用，请取消此项的勾选" />)</span>*!/*/}
                {/*</div>*/}
                {/*<div className="app-tab-pane col-22">*/}
                {/*<FormItem*/}
                {/*label={Intl.get("user.batch.open.count", "开通个数")}*/}
                {/*labelCol={{span: 5}}*/}
                {/*wrapperCol={{span: 19}}*/}
                {/*>*/}
                {/*<InputNumber*/}
                {/*prefixCls={this.state.onlyOneUser ? "number-error-border ant-input-number" : "ant-input-number"}*/}
                {/*value={appFormData.number}*/}
                {/*min={1}*/}
                {/*max={999}*/}
                {/*onChange={this.onCountChange}/>*/}
                {/*</FormItem>*/}
                {/*{this.state.onlyOneUser ?*/}
                {/*<div className="only-one-user-tip">*/}
                {/*{Intl.get("crm.201", "用户名是邮箱格式时，只能申请1个用户")}</div> : null}*/}
                {/*<FormItem*/}
                {/*label={Intl.get("user.open.cycle", "开通周期")}*/}
                {/*labelCol={{span: 5}}*/}
                {/*wrapperCol={{span: 19}}*/}
                {/*>*/}
                {/*{this.renderUserTimeRangeBlock(timePickerConfig)}*/}
                {/*</FormItem>*/}
                {/*<FormItem*/}
                {/*label={Intl.get("user.expire.select", "到期可选")}*/}
                {/*labelCol={{span: 5}}*/}
                {/*wrapperCol={{span: 19}}*/}
                {/*>*/}
                {/*<RadioGroup onChange={this.onOverDraftChange}*/}
                {/*value={appFormData.over_draft.toString()}>*/}
                {/*<Radio key="1" value="1"><ReactIntl.FormattedMessage*/}
                {/*id="user.status.stop" defaultMessage="停用"/></Radio>*/}
                {/*<Radio key="2" value="2"><ReactIntl.FormattedMessage*/}
                {/*id="user.status.degrade" defaultMessage="降级"/></Radio>*/}
                {/*<Radio key="0" value="0"><ReactIntl.FormattedMessage*/}
                {/*id="user.status.immutability"*/}
                {/*defaultMessage="不变"/></Radio>*/}
                {/*</RadioGroup>*/}
                {/*</FormItem>*/}
                {/*</div>*/}
                {/*</TabPane>);*/}
                {/*})}*/}
                {/*</Tabs>*/}
                {/*{*/}
                {/*this.state.isLoading ?*/}
                {/*(<Spinner className="isloading"/>) :*/}
                {/*(null)*/}
                {/*}*/}
                {/*<b style={{height: shadowHeight, top: shadowTop, left: shadowLeft,}}></b>*/}
                {/*</div>*/}
                {/*<FormItem*/}
                {/*wrapperCol={{span: 23}}*/}
                {/*>*/}
                {/*<RightPanelCancel onClick={this.handleCancel}*/}
                {/*style={{visibility: this.state.submitResult === 'success' ? 'hidden' : 'visible'}}>*/}
                {/*<ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>*/}
                {/*</RightPanelCancel>*/}
                {/*<RightPanelSubmit onClick={this.handleSubmit}*/}
                {/*style={{visibility: this.state.submitResult === 'success' ? 'hidden' : 'visible'}}*/}
                {/*disabled={this.state.isLoading}>*/}
                {/*<ReactIntl.FormattedMessage id="crm.109" defaultMessage="申请"/>*/}
                {/*</RightPanelSubmit>*/}
                {/*</FormItem>*/}
            </Form>
        );
    },
    render: function() {
        return (
            <DetailCard title={applyTitles[this.props.applyType]}
                className="apply-user-form-container"
                content={this.renderApplyUserForm()}
                isEdit={true}
                loading={this.state.loading}
                saveErrorMsg={this.state.submitErrorMsg}
                handleSubmit={this.handleSubmit.bind(this)}
                handleCancel={this.handleCancel.bind(this)}
            />);
    }
});

module.exports = ApplyUserForm;
