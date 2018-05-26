const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
require("../css/index.less");
var Form = require("antd").Form;
var Input = require("antd").Input;
var Col = require("antd").Col;
var FormItem = Form.Item;
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var crypto = require("crypto");//用于密码md5
var Spinner = require("../../../../components/spinner");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var passwdStrengthFile = require('../../../../components/password-strength-bar');
var PasswdStrengthBar = passwdStrengthFile.PassStrengthBar;
var RealmFormStore = require("../store/realm-form-store");
var RealmFormAction = require("../action/realm-form-actions");
var RealmActions = require("../action/realm-actions");
var AlertTimer = require("../../../../components/alert-timer");
var classNames = require("classnames");
import Trace from "LIB_DIR/trace";

function noop() {
}

var OwnerForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getInitialState: function() {
        return {
            status: {
                user_name: {},
                password: {},
                rePassword: {},
                nick_name: {},
                phone: {},
                email: {}
            },
            formData: {
                nick_name: "",
                user_name: "",
                password: "",
                rePassword: "",
                phone: "",
                email: "",
            },
            passBarShow: false,//是否显示密码强度
            passStrength: 'L',//密码强度
            phoneEmailCheck: true,//所有者的电话邮箱必填一项的验证
            saveFlags: RealmFormStore.getState()//保存数据时的标志
        };
    },
    clone: function(obj) {
        if (typeof (obj) != 'object')
            return obj;

        var re = {};
        if (obj.constructor == Array)
            re = [];

        for (var i in obj) {
            re[i] = this.clone(obj[i]);
        }

        return re;

    },
    onChange: function() {
        this.setState({saveFlags: RealmFormStore.getState()});
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(this.getInitialState());
    },
    componentWillUnmount: function() {
        RealmFormStore.unlisten(this.onChange);
    },
    componentDidMount: function() {
        var _this = this;
        RealmFormStore.listen(_this.onChange);
        _this.layout();
        $(window).resize(function(e) {
            e.stopPropagation();
            _this.layout();
        });
    },
    layout: function() {
        var bHeight = $("body").height();
        var formHeight = bHeight - $("form .head-image-container").outerHeight(true);
        $(".realm-form-scroll").height(formHeight);
    },
    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },
    //关闭面板前清空验证的处理
    resetValidatFlags: function() {
        RealmFormAction.resetUserNameFlags();
        RealmFormAction.resetPhoneFlags();
        RealmFormAction.resetEmailFlags();
    },
    handleCancel: function(e) {
        e.preventDefault();
        Trace.traceEvent(e, '点击取消按钮');
        if (this.props.formType == "edit") {
            this.props.returnInfoPanel();
        } else {
            this.props.closeRightPanel();
        }
        this.resetValidatFlags();
    },
    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(e, '点击保存按钮');
        if (this.state.isSaving) {
            return;
        }
        var validation = this.refs.validation;
        var _this = this;
        //必填一项的验证
        this.checkPhoneEmail("owner");
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else if (_this.state.phoneEmailCheck) {
                var newOwner = _this.clone(_this.state.formData);
                _this.setState({
                    formData: _this.state.formData
                });
                if (!_this.state.saveFlags.userNameExit && !_this.state.saveFlags.phoneExit && !_this.state.saveFlags.emailExit && !_this.state.saveFlags.userNameError && !_this.state.saveFlags.phoneError && !_this.state.saveFlags.emailError) {
                    //所有者各项唯一性验证均不存在且没有出错再添加
                    //密码MD5加密的处理
                    var md5Hash = crypto.createHash("md5");
                    md5Hash.update(newOwner.password);
                    newOwner.password = md5Hash.digest("hex");
                    delete newOwner.rePassword;
                    newOwner.realm_id = _this.props.realm.id;
                    //设置正在保存中
                    RealmFormAction.setSaveFlag(true);
                    if (newOwner.user_name) {
                        newOwner.user_name = $.trim(newOwner.user_name);
                    }
                    if (newOwner.phone) {
                        newOwner.phone = $.trim(newOwner.phone);
                    }
                    if (newOwner.email) {
                        newOwner.email = $.trim(newOwner.email);
                    }
                    RealmFormAction.addOwner(newOwner);
                }
            }
        });
    },

    checkPass(rule, value, callback) {
        if (value && value.match(passwdStrengthFile.passwordRegex)) {
            //获取密码强度及是否展示
            var passStrengthObj = passwdStrengthFile.getPassStrenth(value);
            this.setState({
                passBarShow: passStrengthObj.passBarShow,
                passStrength: passStrengthObj.passStrength
            });
            if (this.state.formData.password) {
                this.refs.validation.forceValidate(['rePassword']);
            }
            callback();
        } else {
            this.setState({
                passBarShow: false,
                passStrength: 'L'
            });
            callback(Intl.get("common.password.validate.rule", "请输入6-18位数字、字母、符号组成的密码"));
        }
    },

    checkPass2(rule, value, callback) {
        if (value && value !== this.state.formData.password) {
            callback( Intl.get("common.password.unequal", "两次输入密码不一致！"));
        } else {
            callback();
        }
    },
    checkPhone: function(rule, value, callback) {
        if (this.state.saveFlags.phoneExit || this.state.saveFlags.phoneError) {
            RealmFormAction.resetPhoneFlags();
        }
        value = $.trim(value);
        if (value) {
            if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                    (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                    (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                callback();
            } else {
                callback(new Error( Intl.get("common.input.correct.phone", "请输入正确的电话号码")));
            }
        } else {
            callback();
        }
    },
    checkEmail: function(rule, value, callback) {
        if (this.state.saveFlags.emailExit || this.state.saveFlags.emailError) {
            RealmFormAction.resetEmailFlags();
        }
        value = $.trim(value);
        if (value) {
            if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                .test(value)) {
                callback(new Error( Intl.get("common.correct.email", "请输入正确的邮箱")));
            } else {
                callback();
            }
        } else {
            callback();
        }
    },
    //关闭
    closePanel: function(e) {
        Trace.traceEvent(e, '点击关闭按钮');
        this.resetValidatFlags();
        this.props.closeRightPanel(e);
    },
    //返回详细信息展示页
    returnInfoPanel: function(e) {
        Trace.traceEvent(e,"返回安全域详情界面");
        this.resetValidatFlags();
        this.props.returnInfoPanel(e);
    },
    //去掉保存后提示信息
    hideSaveTooltip: function() {
        if (this.state.saveFlags.saveResult == "success") {
            RealmActions.closeRightPanel();
        }
        RealmFormAction.resetSaveResult();
    },
    //用户名只能由字母、数字、下划线组成
    checkUserName: function(rule, value, callback) {
        if (this.state.saveFlags.userNameExit || this.state.saveFlags.userNameError) {
            RealmFormAction.resetUserNameFlags();
        }
        value = $.trim(value);
        if (value) {
            if (!(/^[A-Za-z0-9]\w+$/).test(value)) {
                callback(new Error( Intl.get("member.check.member.name", "请输入数字、字母或下划线，首字母不能是下划线")));
            } else {
                callback();
            }
        } else {
            callback();
        }
    },
    //电话唯一性验证
    checkOnlyPhone: function(type) {
        //电话、邮箱至少填一项的验证
        this.checkPhoneEmail(type);
        var phone = $.trim(this.state.formData.phone);
        if (phone && type == "owner" && ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone)) ||
                (/^\d{3,4}\-\d{7,8}$/.test(phone)) || (/^400\-?\d{3}\-?\d{4}$/.test(phone)))) {
            //所有者的电话唯一性验证
            RealmFormAction.checkOnlyOwnerPhone(phone);

        } else {
            RealmFormAction.resetPhoneFlags();
        }
    },
    //邮箱唯一性验证
    checkOnlyEmail: function(type) {
        //电话、邮箱至少填一项的验证
        this.checkPhoneEmail(type);
        if (type == "owner") {
            var email = $.trim(this.state.formData.email);
            if (email && /^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                .test(email)) {
                //所有者的邮箱唯一性验证
                RealmFormAction.checkOnlyOwnerEmail(email);

            } else {
                RealmFormAction.resetEmailFlags();
            }
        }
    },
    //获取焦点后去必填一项的验证提示
    resetPhoneEmailCheck: function() {
        this.setState({
            phoneEmailCheck: true
        });
    },
    //电话、邮箱必填一项的验证
    checkPhoneEmail: function() {
        //所有者的
        if (!this.state.formData.phone && !this.state.formData.email) {
            //电话邮箱都为空
            this.state.phoneEmailCheck = false;
            this.setState({
                phoneEmailCheck: this.state.phoneEmailCheck
            });
        }
    },
    //验证所有者用户名的唯一性
    checkOnlyUserName: function() {
        var userName = $.trim(this.state.formData.user_name);
        if (userName && (/^[A-Za-z0-9]\w+$/).test(userName)) {
            RealmFormAction.checkOnlyUserName(userName);
        } else {
            RealmFormAction.resetUserNameFlags();
        }
    },
    //用户名唯一性验证的展示
    renderUserNameMsg: function() {
        if (this.state.saveFlags.userNameExit) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.is.existed" defaultMessage="用户名已存在！" /></div>);
        } else if (this.state.saveFlags.userNameError) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.username.is.unique" defaultMessage="用户名唯一性校验出错！" /></div>);
        } else {
            return "";
        }
    },

    //电话唯一性验证的展示
    renderOwnerPhoneMsg: function() {
        if (this.state.saveFlags.phoneExit) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.phone.is.existed" defaultMessage="电话已存在！" /></div>);
        } else if (this.state.saveFlags.phoneError) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.phone.is.unique" defaultMessage="电话唯一性校验出错！" /></div>);
        } else {
            return "";
        }
    },

    //邮箱唯一性验证的展示
    renderOwnerEmailMsg: function() {
        if (this.state.saveFlags.emailExit) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.is.existed" defaultMessage="邮箱已存在！" /></div>);
        } else if (this.state.saveFlags.emailError) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="member.email.is.unique" defaultMessage="邮箱唯一性校验出错！" /></div>);
        } else {
            return "";
        }
    },

    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var className = "right-panel-content";
        if (this.props.ownerFormShow) {
            if (this.props.formType == "add") {
                className += " right-form-add";
            } else if (this.props.formType == "edit") {
                className += " right-panel-content-slide";
            }
        }
        var saveResult = this.state.saveFlags.saveResult;
        return (
            <div className={className}>
                <RightPanelClose onClick={this.closePanel}/>
                {(this.props.formType == "add" || !this.props.ownerFormShow) ? null : (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>)}
                <Form horizontal className="form" autoComplete="off">
                    <div className="realm-form-scroll" style={{width:'420px'}} data-tracename="更换所有者">
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                <div className="realm-owner-block">
                                    <div className="realm-owner-split-line"/>
                                    <div className="realm-owner-title">
                                        <ReactIntl.FormattedMessage
                                            id="realm.change.owner.title"
                                            defaultMessage={`为安全域{realname}添加新所有者`}
                                            values={{
                                                "realname": this.props.realm.company
                                            }}
                                        />
                                    </div>
                                    <FormItem
                                        label={Intl.get("realm.change.owner.name", "姓名")}
                                        id="owner-name"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 17}}
                                        validateStatus={this.renderValidateStyle('nick_name')}
                                        help={status.nick_name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.nick_name.errors && status.nick_name.errors.join(','))}
                                    >
                                        <Validator
                                            rules={[{required: true, min: 1, max : 20 , message: Intl.get("common.input.character.prompt", "最少1个字符,最多20个字符")}]}>
                                            <Input name="nick_name" id="nick_name" value={formData.nick_name}
                                                placeholder="必填项*"
                                                onChange={this.setField.bind(this, 'nick_name')}/>
                                        </Validator>
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get("common.username", "用户名")}
                                        id="userName"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 17}}
                                        validateStatus={this.renderValidateStyle('user_name')}
                                        help={status.user_name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.user_name.errors && status.user_name.errors.join(','))}
                                    >
                                        <Validator
                                            rules={[{required: true, min: 1, max : 20 , message: Intl.get("common.input.character.prompt", "最少1个字符,最多20个字符")},{validator:this.checkUserName}]}>
                                            <Input name="user_name" id="user_name" value={formData.user_name}
                                                className={this.state.saveFlags.userNameExit||this.state.saveFlags.userNameError?"input-red-border":""}
                                                placeholder="必填项*"
                                                onBlur={this.checkOnlyUserName}
                                                onChange={this.setField.bind(this, 'user_name')}/>
                                        </Validator>
                                    </FormItem>
                                    {this.renderUserNameMsg()}
                                    < FormItem
                                        label={Intl.get("common.password", "密码")}
                                        id="password"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 17}}
                                        validateStatus={this.renderValidateStyle('password')}
                                        help={status.password.errors ? status.password.errors.join(',') : null}
                                    >
                                        <Validator
                                            rules={[{validator: this.checkPass}]}>
                                            <Input
                                                name="password"
                                                id="password"
                                                type="password"
                                                onContextMenu={noop}
                                                onPaste={noop}
                                                onCopy={noop}
                                                onCut={noop}
                                                autoComplete="off"
                                                value={formData.password}
                                                placeholder={Intl.get("common.password.compose.rule", "6-18位字符(由数字，字母，符号组成)")}
                                            />
                                        </Validator>
                                    </FormItem>
                                    {this.state.passBarShow ?
                                        (<PasswdStrengthBar passStrength={this.state.passStrength}/>) : null}
                                    <FormItem
                                        label={Intl.get("common.confirm.password", "确认密码")}
                                        id="password2"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 17}}
                                        validateStatus={this.renderValidateStyle('rePassword')}
                                        help={status.rePassword.errors ? status.rePassword.errors.join(',') : null}
                                    >
                                        <Validator
                                            rules={[{required: true,whitespace: true,message: Intl.get("common.password.unequal", "两次输入密码不一致！")}, {validator: this.checkPass2}]}
                                        >
                                            <Input
                                                name="rePassword"
                                                id="password2"
                                                type="password"
                                                onContextMenu={noop}
                                                onPaste={noop}
                                                onCopy={noop}
                                                onCut={noop}
                                                autoComplete="off"
                                                value={formData.rePassword}
                                                placeholder={Intl.get("common.input.confirm.password", "请输入确认密码")}
                                                maxLength={18}
                                            />
                                        </Validator>
                                    </FormItem>

                                    <FormItem
                                        label={Intl.get("common.phone", "电话")}
                                        id="owner-phone"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 17}}
                                        validateStatus={this.renderValidateStyle('phone')}
                                        help={status.phone.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.phone.errors && status.phone.errors.join(','))}
                                    >
                                        <Validator rules={[{validator:this.checkPhone}]}>
                                            <Input name="phone" id="phone" value={formData.phone}
                                                className={!this.state.phoneEmailCheck||this.state.saveFlags.phoneExit||this.state.saveFlags.phoneError?"input-red-border":""}
                                                placeholder={Intl.get("common.phone.email.tip", "电话、邮箱必填其中一项")}
                                                onChange={this.setField.bind(this, 'phone')}
                                                onBlur={this.checkOnlyPhone.bind(this,'owner')}
                                                onFocus={this.resetPhoneEmailCheck.bind(this,'owner')}/>
                                        </Validator>
                                    </FormItem>
                                    {this.state.phoneEmailCheck ? "" : (
                                        <div className="phone-email-check"><ReactIntl.FormattedMessage id="realm.change.owner.phone.tip" defaultMessage="电话、邮箱必填一项！" /></div>)}
                                    {this.renderOwnerPhoneMsg()}
                                    <FormItem
                                        label={Intl.get("common.email", "邮箱")}
                                        id="owner-email"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 17}}
                                        validateStatus={this.renderValidateStyle('email')}
                                        help={status.email.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.email.errors && status.email.errors.join(','))}
                                    >
                                        <Validator rules={[{validator:this.checkEmail}]}>
                                            <Input name="email" id="email" type="text"
                                                className={!this.state.phoneEmailCheck||this.state.saveFlags.emailExit||this.state.saveFlags.emailError?"input-red-border":""}
                                                value={formData.email}
                                                placeholder={Intl.get("common.phone.email.tip", "电话、邮箱必填其中一项")}
                                                onChange={this.setField.bind(this, 'email')}
                                                onBlur={this.checkOnlyEmail.bind(this,'owner')}
                                                onFocus={this.resetPhoneEmailCheck.bind(this,'owner')}/>
                                        </Validator>
                                    </FormItem>
                                    {this.state.phoneEmailCheck ? "" : (
                                        <div className="phone-email-check"><ReactIntl.FormattedMessage id="realm.change.owner.phone.tip" defaultMessage="电话、邮箱必填一项！" /></div>)}
                                    {this.renderOwnerEmailMsg()}
                                </div>

                                <FormItem>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={saveResult=="error"?3000:600}
                                                    message={this.state.saveFlags.saveMsg}
                                                    type={this.state.saveFlags.saveResult} showIcon
                                                    onHide={this.hideSaveTooltip}/>
                                            ) : ""
                                        }
                                    </div>
                                    <RightPanelCancel onClick={this.handleCancel}>
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit}>
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                                    </RightPanelSubmit>
                                </FormItem>
                            </Validation>
                        </GeminiScrollbar>
                    </div>
                    {this.state.saveFlags.isSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : null}
                </Form>
            </div>
        );
    }
})
    ;

module.exports = OwnerForm;
