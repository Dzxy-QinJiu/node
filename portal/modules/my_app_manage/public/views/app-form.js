const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../css/index-es_VE.less");
} else if (language.lan() == "zh") {
    require("../css/index-zh_CN.less");
}
import {Icon,Form,Input,Select,InputNumber,Radio} from "antd";
var RadioGroup = Radio.Group;
var Option = Select.Option;
var FormItem = Form.Item;
var AlertTimer = require("../../../../components/alert-timer");
var Spinner = require("../../../../components/spinner");
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var HeadIcon = require("../../../../components/headIcon");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var AppFormStore = require("../store/app-form-store");
var AppFormAction = require("../action/app-form-actions");
var classNames = require("classnames");
var userData = require("../../../../public/sources/user-data");
import { defineMessages,injectIntl} from 'react-intl';
import Trace from "LIB_DIR/trace";

function noop() {
}

var AppForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function () {
        return {
            submitAppForm: noop,
            app: {
                id: '',
                name: '',
                appUrl: '',
                owner: '',
                descr: ''
            }
        };
    },

    formatAppInfo: function (app) {
        let managers = [];
        if (_.isArray(app.managers) && app.managers.length) {
            managers = _.pluck(app.managers, "managerId");
        }
        return {
            id: app.id,
            name: app.name,
            image: app.image,
            appUrl: app.appUrl,
            owner: app.owner,
            managers: managers,
            secretApp: app.secretApp,
            captchaTime: app.captchaTime,
            sessionCaptcha: app.sessionCaptcha,
            ipCaptcha: app.ipCaptcha,
            descr: app.descr,
            status: app.status
        };
    },

    getInitialState: function () {
        var appInfo = this.formatAppInfo(this.props.app);
        return {
            status: {
                name: {},
                appUrl: {},
                owner: {},
                managers: {},
                secretApp: {},
                captchaTime: {},
                descr: {}
            },
            formData: appInfo,
            ...AppFormStore.getState()//保存数据时的标志
        };
    },

    componentWillReceiveProps: function (nextProps) {
        var appInfo = this.formatAppInfo(nextProps.app);
        this.refs.validation.reset();
        this.setState({formData: appInfo});
    },
    onChange: function () {
        this.setState(AppFormStore.getState());
    },
    componentWillUnmount: function () {
        AppFormStore.unlisten(this.onChange);
    },
    componentDidMount: function () {
        var _this = this;
        AppFormStore.listen(_this.onChange);
        _this.layout();
        $(window).resize(function (e) {
            e.stopPropagation();
            _this.layout();
        });
    },

    layout: function () {
        var bHeight = $("body").height();
        var formHeight = bHeight - $("form .head-image-container").outerHeight(true);
        $(".app-form-scroll").height(formHeight);
    },

    componentDidUpdate: function () {
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
    },

    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    handleCancel: function (e) {
        e.preventDefault();
        Trace.traceEvent(e,"点击取消编辑按钮");
        if (this.props.formType == "edit") {
            this.props.returnInfoPanel(e);
        } else {
            this.props.closeRightPanel(e);
        }
    },

    handleSubmit: function (e) {
        e.preventDefault();
        Trace.traceEvent(e,"点击保存编辑信息");
        var validation = this.refs.validation;
        var _this = this;
        validation.validate(function (valid) {
            if (!valid) {
                return;
            } else {
                var app = $.extend(true, {}, _this.state.formData);
                app.managers = JSON.stringify(app.managers);
                //设置正在保存中
                AppFormAction.setSaveFlag(true);
                AppFormAction.editApp(app);
            }
        });
    },

    uploadImg: function (src) {
        var formData = this.state.formData;
        formData.image = src;
        this.setState({formData: formData});
    },

    //关闭
    closePanel: function (e) {
        e.stopPropagation();
        Trace.traceEvent(e,"关闭编辑界面");
        this.props.closeRightPanel();
    },

    //返回详细信息展示页
    returnInfoPanel: function (e) {
        e.stopPropagation();
        Trace.traceEvent(e,"返回应用详情界面");
        this.props.returnInfoPanel();
    },

    //去掉保存后提示信息
    hideSaveTooltip: function () {
        AppFormAction.resetSaveResult(this.state.saveResult);
    },
    //下拉列表的渲染
    renderSelectOptions: function () {
        var options = '';
        var appManagerList = this.state.appManagerList;
        var managers = this.state.formData.managers;
        if (_.isArray(appManagerList) && appManagerList.length > 0) {
            options = appManagerList.map(function (user) {
                var className = "";
                //管理员（多选）选择后，从下拉列表中去掉已选的选项
                if (_.isArray(managers) && managers.length > 0) {
                    managers.forEach(function (manager) {
                        if (manager == user.userId) {
                            className = "manager-options-selected";
                        }
                    });
                }
                return (<Option className={className} key={user.userId} value={user.userId}>
                    {user.nickName}
                </Option>);
            });
        } else {
            options = <Option disabled value="">
                {Intl.get("app.app.no.managers", "暂无管理员") }
            </Option>;
        }
        return options;
    },
    //渲染密令APP的下拉列表
    renderSecretAppOptions: function () {
        var options = '';
        var appList = this.state.allAppList;
        if (_.isArray(appList) && appList.length > 0) {
            options = appList.map(function (app) {
                return (<Option key={app.id} value={app.id}>
                    {app.name}
                </Option>);
            });
        } else {
            options = <Option disabled value="">
                <ReactIntl.FormattedMessage id="app.app.no.secret" defaultMessage="暂无密令APP"/>
            </Option>;
        }
        return options;
    },

    onStatusChange: function (e) {
        this.state.formData.status = parseInt(e.target.value);
        this.setState({formData: this.state.formData});
    },

    render: function () {
        var formData = this.state.formData;
        var status = this.state.status;
        //保存成功失败的结果
        var saveResult = this.state.saveResult;
        var logoDescr = 'Logo';
        //是否是应用所有者，应用所有者才可以修改管理员、LOGO、启停应用
        var isAppOwner = userData.hasRole(userData.ROLE_CONSTANS.APP_OWNER);
        let labelCol = (language.lan() == 'zh' ? 4 : 6);
        let wrapperCol = (language.lan() == 'zh' ? 12 : 24);
        return (
            <div data-tracename="编辑应用界面">
                <RightPanelClose onClick={this.closePanel}/>
                {(this.props.formType == "add" || !this.props.appFormShow) ? null : (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>)}
                <Form horizontal className="form" autoComplete="off">
                    <HeadIcon headIcon={formData.image}
                              iconDescr={formData.name||logoDescr}
                              upLoadDescr={logoDescr}
                              isEdit={isAppOwner}
                              isUserHeadIcon={true}
                              onChange={this.uploadImg}/>
                    {isAppOwner ? (<Input type="hidden" name="image" id="image" value={formData.image}/>) : null}
                    <div className="app-form-scroll">
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                <FormItem
                                    label={Intl.get("common.definition", "名称")}
                                    id="appName"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                    validateStatus={this.renderValidateStyle('name')}
                                    help={
                                    status.name.isValidating ?
                                        Intl.get("common.is.validiting", Intl.get("common.is.validiting", "正在校验中..")) :
                                        (status.name.errors && status.name.errors.join(','))
                                    }
                                >
                                    <Validator
                                        rules={[{required: true, min: 1, max : 20 ,
                                        message: Intl.get("common.input.character.prompt", "最少1个字符,最多20个字符")
                                         }
                                         ]}
                                    >
                                        <Input name="name" id="name" value={formData.name}
                                               placeholder={Intl.get("common.required.tip", "必填项*")}
                                               onChange={this.setField.bind(this, 'name')}
                                        />
                                    </Validator>
                                </FormItem>

                                <FormItem
                                    label="URL"
                                    id="appUrl"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                >
                                    <Input name="appUrl" id="appUrl" value={formData.appUrl}
                                           onChange={this.setField.bind(this, 'appUrl')}/>
                                </FormItem>
                                {isAppOwner ?
                                    (<div>
                                        <FormItem
                                            label={Intl.get("common.status", "状态")}
                                            id="status"
                                            labelCol={{span: labelCol}}
                                            wrapperCol={{span: 12}}
                                        >
                                            <RadioGroup onChange={this.onStatusChange}
                                                        value={formData.status||formData.status==0?formData.status.toString():""}>
                                                <Radio key="1" value="1"><ReactIntl.FormattedMessage id="common.enabled"
                                                                                                     defaultMessage="启用"/></Radio>
                                                <Radio key="0" value="0"><ReactIntl.FormattedMessage
                                                    id="common.disabled" defaultMessage="禁用"/></Radio>
                                            </RadioGroup>
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("common.managers", "管理员")}
                                            id="managers"
                                            labelCol={{span: labelCol}}
                                            wrapperCol={{span: 12}}
                                            validateStatus={this.renderValidateStyle('managers')}
                                            help={
                                            status.managers.isValidating ?
                                            Intl.get("common.is.validiting", "正在校验中..") :
                                            (status.managers.errors && status.managers.errors.join(','))
                                            }
                                        >
                                            {this.state.isLoadingManagerList ? (
                                                <div className="user-list-loading">
                                                    <ReactIntl.FormattedMessage id="app.app.get.managers.list"
                                                                                defaultMessage="正在获取管理员列表"/>
                                                    <Icon type="loading"/>
                                                </div>) : (
                                                <Select className="" multiple name="managers" id="managers"
                                                        optionFilterProp="children"
                                                        searchPlaceholder={Intl.get("app.app.managers.placeholder", "请选择管理员*")}
                                                        notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                                        value={formData.managers}
                                                        onChange={this.setField.bind(this, 'managers')}
                                                >
                                                    {this.renderSelectOptions()}
                                                </Select>)}
                                        </FormItem>
                                    </div>) : null}
                                <FormItem
                                    label={Intl.get("common.secret.app", "密令APP")}
                                    id="secretApp"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                >
                                    {this.state.isLoadingAllAppList ? (
                                        <div className="app-list-loading">
                                            <ReactIntl.FormattedMessage id="app.app.get.secret.list"
                                                                        defaultMessage="正在获取密令APP列表"/>
                                            <Icon type="loading"/>
                                        </div>) : (
                                        <Select showSearch name="secretApp" id="secretApp"
                                                placeholder={Intl.get("app.app.secret.placeholder", "请选择密令APP")}
                                                value={formData.secretApp}
                                                optionFilterProp="children"
                                                notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                                searchPlaceholder={Intl.get("app.app.secret.search.placeholder", "请输入应用名称进行过滤")}
                                                onChange={this.setField.bind(this, 'secretApp')}>
                                            {this.renderSecretAppOptions()}
                                        </Select>)}
                                </FormItem>
                                <FormItem
                                    label={Intl.get("common.describe", "描述")}
                                    id="descr"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('descr')}
                                >
                                    <Input type="textarea" id="descr" rows="3" value={formData.descr}
                                           onChange={this.setField.bind(this, 'descr')}/>
                                </FormItem>
                                <div className="captcha-set-container">
                                    <FormItem
                                        label={Intl.get("common.captcha", "验证码")}
                                        id="captchaTime"
                                        labelCol={{span: labelCol}}
                                        wrapperCol={{span: wrapperCol}}
                                    >
                                        <ReactIntl.FormattedMessage
                                            id="common.password.verify"
                                            defaultMessage={`{errpassword}{number}{captcha}`}
                                            values={{
                                              "errpassword":<span className="captcha-time-span">{Intl.get("secret.error", "密码输错")}</span>,
                                              "number": <InputNumber min={1} max={100000} name="captchaTime" id="captchaTime"
                                                     value={formData.captchaTime}
                                                     onChange={this.setField.bind(this, 'captchaTime')}/>,
                                              "captcha":<span className="captcha-time-span">{Intl.get("show.captcha", "次，出现验证码")}</span>
                                             }}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label=" "
                                        id="sessionCaptcha"
                                        labelCol={{span: labelCol}}
                                        wrapperCol={{span: wrapperCol}}
                                    >
                                        <ReactIntl.FormattedMessage
                                            id="common.session.verify"
                                            defaultMessage={`{session}{number}{captcha}`}
                                            values={{
                                               "session":<span className="captcha-time-span">{Intl.get("session.overclock", " session超频")}</span>,
                                              "number": <InputNumber min={1} max={100000} name="sessionCaptcha" id="sessionCaptcha"
                                                     value={formData.sessionCaptcha}
                                                     onChange={this.setField.bind(this, 'sessionCaptcha')}/>,
                                              "captcha":<span className="captcha-time-span">{Intl.get("show.captcha", "次，出现验证码")}</span>
                                             }}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label=" "
                                        id="ipCaptcha"
                                        labelCol={{span: labelCol}}
                                        wrapperCol={{span: wrapperCol}}
                                    >
                                        <ReactIntl.FormattedMessage
                                            id="common.ip.verify"
                                            defaultMessage={`{ip}{number}{captcha}`}
                                            values={{
                                               "ip":<span className="captcha-time-span">{Intl.get("ip.overclock", "IP超频")} </span>,
                                              "number": <InputNumber min={1} max={100000} name="ipCaptcha" id="ipCaptcha"
                                                     value={formData.ipCaptcha}
                                                     onChange={this.setField.bind(this, 'ipCaptcha')}/>,
                                              "captcha":<span className="captcha-time-span">{Intl.get("show.captcha", "次，出现验证码")}</span>
                                             }}
                                        />
                                    </FormItem>
                                </div>
                                <FormItem
                                    wrapperCol={{span: 22}}>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={saveResult=="error"?3000:600}
                                                            message={this.state.saveMsg}
                                                            type={this.state.saveResult} showIcon
                                                            onHide={this.hideSaveTooltip}/>
                                            ) : ""
                                        }
                                    </div>
                                    <RightPanelCancel onClick={this.handleCancel}>
                                        {Intl.get("common.cancel")}
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit}>
                                        {Intl.get("common.sure")}
                                    </RightPanelSubmit>
                                </FormItem>
                            </Validation>
                        </GeminiScrollbar>
                    </div>
                    {this.state.isSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : null}
                </Form>
            </div>
        );
    }
});

module.exports = injectIntl(AppForm);
