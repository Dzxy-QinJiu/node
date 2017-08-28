var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../scss/index-es_VE.scss");
} else if (language.lan() == "zh") {
    require("../scss/index-zh_CN.scss");
}
var Validation = require("antd").Validation;
var Form = require("antd").Form;
var Input = require("antd").Input;
var Select = require("antd").Select;
var Icon = require("antd").Icon;
var Option = Select.Option;
var Validator = Validation.Validator;
var FormItem = Form.Item;
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var HeadIcon = require("../../../../components/headIcon");
var Spinner = require("../../../../components/spinner");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var crypto = require("crypto");//用于密码md5
var UserFormStore = require("../store/user-form-store");
var UserFormAction = require("../action/user-form-actions");
var AlertTimer = require("../../../../components/alert-timer");
var classNames = require("classnames");
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
var User = require("../util/user");
import Trace from "LIB_DIR/trace";
function noop() {
}

var UserForm = React.createClass({
        mixins: [Validation.FieldMixin],
        getDefaultProps: function () {
            return {
                submitUserForm: noop,
                user: {
                    id: '',
                    userName: "",
                    name: "",
                    image: "",
                    phone: "",
                    email: "",
                    role: [],
                    team: "",
                    phoneOrder:""
                }
            };
        },

        getInitialState: function () {
            return {
                ...UserFormStore.getState(),
                status: {
                    userName: {},
                    name: {},
                    phone: {},
                    email: {},
                    role: {},
                    team: {},
                    phoneOrder: {}
                },
                formData: {
                    userName: "",
                    name: "",
                    image: "",
                    phone: "",
                    email: "",
                    role: [],
                    team: "",
                    phoneOrder:""
                },
                phoneEmailCheck: true//电话邮箱必填一项的验证

            };
        },
        componentWillReceiveProps: function (nextProps) {
            this.refs.validation.reset();
            this.setState(this.getInitialState());
        },
        onChange: function () {
            this.setState({... UserFormStore.getState()});
        },
        componentWillUnmount: function () {
            UserFormStore.unlisten(this.onChange);
        },
        componentDidMount: function () {
            var _this = this;
            _this.layout();
            UserFormStore.listen(_this.onChange);
            $(window).resize(function (e) {
                e.stopPropagation();
                _this.layout();
            });
        },

        layout: function () {
            var bHeight = $("body").height();
            var formHeight = bHeight - $("form .head-image-container").outerHeight(true);
            $(".user-form-scroll").height(formHeight);
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
        //关闭面板前清空验证的处理
        resetValidatFlags: function () {
            UserFormAction.resetUserNameFlags();
            UserFormAction.resetPhoneFlags();
            UserFormAction.resetEmailFlags();
            UserFormAction.resetPhoneOrderFlags();
        },
        handleCancel: function (e) {
            e.preventDefault();
            this.resetValidatFlags();
            this.props.closeRightPanel();
        },
        handleSubmit: function (e) {
            e.preventDefault();
            var validation = this.refs.validation;
            var _this = this;
            //必填一项的验证
            this.checkPhoneEmail();
            validation.validate(function (valid) {
                if (!valid) {
                    return;
                } else if (!_this.state.userNameExist && !_this.state.phoneExist && !_this.state.emailExist && !_this.state.phoneOrderExist && !_this.state.userNameError && !_this.state.phoneError && !_this.state.emailError && !_this.state.phoneOrderError) {
                    //所有者各项唯一性验证均不存在且没有出错再添加
                    var user = _.extend({}, _this.state.formData);
                    if (user.phone) {
                        user.phone = $.trim(user.phone);
                    }
                    if (user.email) {
                        user.email = $.trim(user.email);
                    }
                    if (user.email !== _this.props.user.email) {
                        //修改邮箱后，邮箱的激活状态改为未激活
                        user.emailEnable = false;
                    }
                    user.role = JSON.stringify(user.role);
                    //设置正在保存中
                    UserFormAction.setSaveFlag(true);
                    if (_this.props.formType == "add") {
                        user.userName = user.email;
                        UserFormAction.addUser(user);
                    }
                }
            });
        },

        checkPhone: function (rule, value, callback) {
            value = $.trim(value);
            if (value) {
                if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                    (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                    (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                    callback();
                } else {
                    callback(new Error(Intl.get("common.input.correct.phone", "请输入正确的电话号码")));
                }
            } else {
                callback();
            }
        },
        checkEmail: function (rule, value, callback) {
            value = $.trim(value);
            if (value) {
                if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                        .test(value)) {
                    callback(new Error(Intl.get("common.correct.email", "请输入正确的邮箱")));
                } else {
                    callback();
                }
            } else {
                callback(new Error(Intl.get("member.input.email", "请输入邮箱")));
            }
        },
        uploadImg: function (src) {
            Trace.traceEvent($(this.getDOMNode()).find(".head-image-container .update-logo-desr"),"上传头像");
            var formData = this.state.formData;
            formData.image = src;
            this.setState({formData: formData});
        },
        //关闭
        closePanel: function () {
            this.resetValidatFlags();
            this.props.closeRightPanel();
        },

        //返回详细信息展示页
        returnInfoPanel: function (newAddUser) {
            this.resetValidatFlags();
            this.props.returnInfoPanel(newAddUser);
        },

        //去掉保存后提示信息
        hideSaveTooltip: function () {
            if (this.props.formType == "add" && (this.state.saveResult == "success" || this.state.saveResult == "warn")) {
                //返回详情页继续添加
                this.returnInfoPanel(this.state.savedUser);
                this.props.showContinueAddButton();
            }

            UserFormAction.resetSaveResult(this.props.formType, this.state.saveResult);
        },

        //用户名只能由字母、数字、下划线组成
        checkUserName: function (rule, value, callback) {
            if (this.state.userNameExist || this.state.userNameError) {
                UserFormAction.resetUserNameFlags();
            }
            value = $.trim(value);
            if (value) {
                if (!(/^[A-Za-z0-9]\w+$/).test(value)) {
                    callback(new Error(Intl.get("member.check.member.name", "请输入数字、字母或下划线，首字母不能是下划线")));
                } else {
                    callback();
                }
            } else {
                callback();
            }
        },

        //电话唯一性验证
        checkOnlyPhone: function (e) {
            var phone = $.trim(this.state.formData.phone);
            if (phone && phone != this.props.user.phone.value && ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone)) ||
                (/^\d{3,4}\-\d{7,8}$/.test(phone)) || (/^400\-?\d{3}\-?\d{4}$/.test(phone)))) {
                Trace.traceEvent(e,"填写电话");
                //电话唯一性验证
                UserFormAction.checkOnlyPhone(phone);
            } else {
                UserFormAction.resetPhoneFlags();
            }
        },
        traceNickName: function (e) {
            var nickname = this.state.formData.name;
            Trace.traceEvent(e,"填写姓名");
        },
        //坐席号唯一性验证
        checkOnlyPhoneOrder: function (e) {
            var phoneOrder = $.trim(this.state.formData.phoneOrder);
            if (phoneOrder) {
                Trace.traceEvent(e,"填写坐席号");
                //坐席号唯一性验证
                UserFormAction.checkOnlyPhoneOrder({phone_order:phoneOrder});
            } else {
                UserFormAction.resetPhoneOrderFlags();
            }
        },

        //邮箱唯一性验证
        checkOnlyEmail: function (e) {
            var email = $.trim(this.state.formData.email);
            if (email && email != this.props.user.email.value && /^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
                    .test(email)) {
                Trace.traceEvent(e,"增加邮箱");
                //所有者的邮箱唯一性验证
                UserFormAction.checkOnlyEmail(email);

            } else {
                UserFormAction.resetEmailFlags();
                UserFormAction.resetUserNameFlags();
            }
        },

        //电话、邮箱必填一项的验证
        checkPhoneEmail: function () {
            if (!this.state.formData.phone && !this.state.formData.email) {
                //电话邮箱都为空
                this.state.phoneEmailCheck = false;
                this.setState({phoneEmailCheck: this.state.phoneEmailCheck});
            }
        },

        //验证所有者用户名的唯一性
        checkOnlyUserName: function () {
            var userName = $.trim(this.state.formData.userName);
            if (userName && (/^[A-Za-z0-9]\w+$/).test(userName)) {
                UserFormAction.checkOnlyUserName(userName);
            } else {
                UserFormAction.resetUserNameFlags();
            }
        },

        //用户名唯一性验证的展示
        renderUserNameMsg: function () {
            if (this.state.userNameExist) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.is.existed"
                                                                                       defaultMessage="用户名已存在！"/></div>);
            } else if (this.state.userNameError) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.username.is.unique"
                                                                                       defaultMessage="用户名唯一性校验出错！"/>
                </div>);
            } else {
                return "";
            }
        },

        //电话唯一性验证的展示
        renderPhoneMsg: function () {
            if (this.state.phoneExist) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.phone.is.existed"
                                                                                       defaultMessage="电话已存在！"/></div>);
            } else if (this.state.phoneError) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.phone.is.unique"
                                                                                       defaultMessage="电话唯一性校验出错！"/></div>);
            } else {
                return "";
            }
        },

        //坐席号唯一性验证的展示
        renderPhoneOrderMsg: function () {
            if (this.state.phoneOrderExist) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="errorcode.138"
                                                                                       defaultMessage="座席号已存在！"/></div>)
            } else if (this.state.phoneOrderError) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.phone.order.is.unique"
                                                                                       defaultMessage="坐席号唯一性校验出错！"/></div>)
            } else {
                return "";
            }
        },
        //邮箱唯一性验证的展示
        renderEmailMsg: function () {
            if (this.state.emailExist || this.state.userNameExist) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.is.used"
                                                                                       defaultMessage="邮箱已被使用！"/></div>);
            } else if (this.state.emailError || this.state.userNameError) {
                return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.validate.error"
                                                                                       defaultMessage="邮箱校验失败！"/></div>);
            } else {
                return "";
            }
        },

        //渲染角色下拉列表
        renderRoleOptions: function () {
            var formData = this.state.formData;
            //角色列表
            var roleOptions = "";
            var roleList = this.state.roleList;
            if (_.isArray(roleList) && roleList.length > 0) {
                roleOptions = roleList.map(function (role) {
                    var className = "";
                    if (_.isArray(formData.role) && formData.role.length > 0) {
                        formData.role.forEach(function (roleId) {
                            if (role.roleId == roleId) {
                                className = "role-options-selected";
                            }
                        });
                    }
                    //<span className={className}>{role.roleName}</span>
                    return (<Option className={className} key={role.roleId} value={role.roleId}>
                        {role.roleName}
                    </Option>);

                });
            } else {
                roleOptions =
                    <Option value=""><ReactIntl.FormattedMessage id="member.no.role" defaultMessage="暂无角色"/></Option>;
            }
            return roleOptions
        },
        //渲染所属团队下拉列表
        renderTeamOptions: function () {
            var formData = this.state.formData;
            //团队列表
            var teamOptions = "";
            var teamList = this.state.userTeamList;
            if (_.isArray(teamList) && teamList.length > 0) {
                teamOptions = teamList.map(function (team) {
                    var className = "";
                    if (team.group_id == formData.team) {
                        className = "role-options-selected";
                    }
                    return (<Option className={className} key={team.group_id} value={team.group_id}>
                        {team.group_name}
                    </Option>);

                });
            } else {
                teamOptions =
                    <Option value=""><ReactIntl.FormattedMessage id="member.no.groups" defaultMessage="暂无团队"/></Option>;
            }
            return teamOptions
        },
        handleSelect: function () {
            Trace.traceEvent($(this.getDOMNode()).find("form ul li"),"选择角色");
        },
        handleTeamSelect: function () {
            Trace.traceEvent($(this.getDOMNode()).find("form ul li"),"选择所属团队");
        },
        render: function () {
            var formData = this.state.formData;
            var status = this.state.status;
            var className = "right-panel-content";
            if (this.props.userFormShow) {
                if (this.props.formType == "add") {
                    className += " right-form-add";
                } else {
                    className += " right-panel-content-slide";
                }
            }

            var saveResult = this.state.saveResult;
            var headDescr = Intl.get("member.head.logo", "头像");
            return (
                <div className={className} data-tracename="添加/编辑面板">
                    <RightPanelClose onClick={this.closePanel} data-tracename="关闭添加/编辑面板"/>
                    {(this.props.formType == "add" || !this.props.userFormShow) ? null : (
                        <RightPanelReturn onClick={this.returnInfoPanel} data-tracename="返回详细信息展示页"/>)}
                    <Form horizontal className="form" autoComplete="off">
                        <HeadIcon
                            headIcon={formData.image }
                            iconDescr={formData.name||headDescr}
                            upLoadDescr={headDescr}
                            isEdit={true}
                            onChange={this.uploadImg}
                            userName={formData.userName}
                            isUserHeadIcon={true}
                        />
                        <Input type="hidden" name="image" id="image" value={formData.image}/>
                        <div className="user-form-scroll" style={{width:'420px'}}>
                            <GeminiScrollbar className="geminiScrollbar-vertical">
                                <Validation ref="validation" onValidate={this.handleValidate}>
                                    <FormItem
                                        label={Intl.get("realm.change.owner.name", "姓名")}
                                        id="name"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 18}}
                                        validateStatus={this.renderValidateStyle('name')}
                                        help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                                    >
                                        <Validator
                                            rules={[{required: true, min: 1, max : 20 , message: Intl.get("common.input.character.prompt", "最少1个字符,最多20个字符") }]}>
                                            <Input name="name" id="nickName" value={formData.name}
                                                   placeholder={Intl.get("common.required.tip","必填项*")}
                                                   onChange={this.setField.bind(this, 'name')}
                                                   onBlur={(e)=>{this.traceNickName(e)}}
                                            />
                                        </Validator>
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get("common.phone", "电话")}
                                        id="phone"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 18}}
                                        validateStatus={this.renderValidateStyle('phone')}
                                        help={status.phone.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.phone.errors && status.phone.errors.join(','))}
                                    >
                                        <Validator rules={[{validator:this.checkPhone}]}>
                                            <Input name="phone" id="phone" value={formData.phone}
                                                   className={this.state.phoneExist||this.state.phoneError?"input-red-border":""}
                                                   onChange={this.setField.bind(this, 'phone')}
                                                   onBlur={(e)=>{this.checkOnlyPhone(e)}}

                                            />
                                        </Validator>
                                    </FormItem>
                                    {this.renderPhoneMsg()}
                                    <FormItem
                                        label={Intl.get("common.email", "邮箱")}
                                        id="email"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 18}}
                                        validateStatus={this.renderValidateStyle('email')}
                                        help={status.email.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.email.errors && status.email.errors.join(','))}
                                    >
                                        <Validator rules={[{validator:this.checkEmail}]}>
                                            <Input name="email" id="email" type="text" value={formData.email}
                                                   placeholder={Intl.get("common.required.tip","必填项*")}
                                                   className={this.state.emailExist||this.state.emailError?"input-red-border":""}
                                                   onBlur={(e)=>{this.checkOnlyEmail(e)}}
                                                   onChange={this.setField.bind(this, 'email')}
                                            />
                                        </Validator>
                                    </FormItem>
                                    {this.renderEmailMsg()}
                                    {hasPrivilege("GET_MEMBER_PHONE_ORDER")?(
                                    <div>
                                        <FormItem
                                            label={Intl.get("user.manage.phone.order", "坐席号")}
                                            id="phoneOrder"
                                            labelCol={{span: 4}}
                                            wrapperCol={{span: 18}}
                                            validateStatus={this.renderValidateStyle('phoneOrder')}
                                            help={status.phoneOrder.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.phoneOrder.errors && status.phoneOrder.errors.join(','))}
                                        >
                                            <Validator rules={[{validator:User.checkPhoneOrder}]}>
                                                <Input name="phoneOrder" id="phoneOrder" value={formData.phoneOrder}
                                                       className={this.state.phoneOrderExist || this.state.phoneOrderError?"input-red-border":""}
                                                       onChange={this.setField.bind(this, 'phoneOrder')}
                                                       onBlur={(e)=>{this.checkOnlyPhoneOrder(e)}}
                                                />
                                            </Validator>
                                        </FormItem>
                                        {this.renderPhoneOrderMsg()}
                                    </div>
                                    ):null}
                                    <FormItem
                                        label={Intl.get("common.role", "角色")}
                                        id="role"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 18}}
                                        validateStatus={this.renderValidateStyle('role')}
                                        help={status.role.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.role.errors && status.role.errors.join(','))}
                                    >
                                        {this.state.isLoadingRoleList ? (
                                            <div className="role-list-loading">
                                                <ReactIntl.FormattedMessage id="member.get.role.lists"
                                                                            defaultMessage="正在获取角色列表"/>

                                                <Icon type="loading"/></div>) : (
                                            <Validator
                                                rules={[{required: true, message: Intl.get("member.select.role", "请选择角色") , type: 'array'}]}>
                                                <Select className="" multiple name="role" id="role"
                                                        optionFilterProp="children"
                                                        searchPlaceholder={Intl.get("member.select.role", "请选择角色")}
                                                        notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                                        value={formData.role}
                                                        onChange={this.setField.bind(this, 'role')}
                                                        onSelect={this.handleSelect}
                                                >
                                                    {this.renderRoleOptions()}
                                                </Select>
                                            </Validator>
                                        )}
                                    </FormItem>
                                    {this.props.formType == "add" ? (<FormItem
                                        label={Intl.get("common.belong.team", "所属团队")}
                                        id="team"
                                        labelCol={{span: 4}}
                                        wrapperCol={{span: 18}}
                                    >
                                        {this.state.isLoadingTeamList ? (
                                            <div className="role-list-loading"><ReactIntl.FormattedMessage
                                                id="member.is.get.group.lists" defaultMessage="正在获取团队列表"/><Icon
                                                type="loading"/></div>) : (
                                            <Select name="team" id="team"
                                                    placeholder={Intl.get("member.select.group", "请选择团队")}
                                                    notFoundContent={Intl.get("member.no.group", "暂无此团队")}
                                                    showSearch
                                                    searchPlaceholder={Intl.get("member.search.group.by.name", "输入团队名称搜索")}
                                                    optionFilterProp="children"
                                                    value={formData.team}
                                                    onChange={this.setField.bind(this, 'team')}
                                                    onSelect={this.handleTeamSelect}
                                            >
                                                {this.renderTeamOptions()}
                                            </Select>
                                        )}
                                    </FormItem>) : null}
                                    <FormItem
                                        wrapperCol={{span: 22}}>
                                        <div className="indicator">
                                            {saveResult ?
                                                (
                                                    <AlertTimer time={3000}
                                                                message={this.state.saveMsg}
                                                                type={this.state.saveResult} showIcon
                                                                onHide={this.hideSaveTooltip}/>
                                                ) : ""
                                            }
                                        </div>
                                        <RightPanelCancel onClick={this.handleCancel} data-tracename="取消新添加成员的基本信息">
                                            <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                        </RightPanelCancel>
                                        <RightPanelSubmit onClick={this.handleSubmit} data-tracename="保存新添加成员的基本信息">
                                            <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                        </RightPanelSubmit>
                                    </FormItem>
                                </Validation>
                            </GeminiScrollbar>
                        </div>
                        {this.state.isSaving ? (<div className="right-pannel-block">
                            <Spinner className="right-panel-saving"/>
                        </div>) : ""}
                    </Form>
                </ div >
            );
        }
    })
    ;

module.exports = UserForm;
