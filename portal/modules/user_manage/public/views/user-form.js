var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/index-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/index-zh_CN.less');
}
var Form = require('antd').Form;
var Input = require('antd').Input;
var Select = require('antd').Select;
var Icon = require('antd').Icon;
var Option = Select.Option;
var FormItem = Form.Item;
var rightPanelUtil = require('../../../../components/rightPanel');
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var HeadIcon = require('../../../../components/headIcon');
var Spinner = require('../../../../components/spinner');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var crypto = require('crypto');//用于密码md5
var UserFormStore = require('../store/user-form-store');
var UserFormAction = require('../action/user-form-actions');
var AlertTimer = require('../../../../components/alert-timer');
var classNames = require('classnames');
import Trace from 'LIB_DIR/trace';
import PhoneInput from 'CMP_DIR/phone-input';
function noop() {
}
const FORM_CONST = {
    LABEL_COL: 5,
    WRAPPER_COL: 18
};
var UserForm = React.createClass({
    getDefaultProps: function() {
        return {
            submitUserForm: noop,
            user: {
                id: '',
                userName: '',
                name: '',
                image: '',
                phone: '',
                email: '',
                role: [],
                team: ''
            }
        };
    },

    getInitialState: function() {
        return {
            ...UserFormStore.getState(),
            formData: {
                userName: '',
                name: '',
                image: '',
                phone: '',
                email: '',
                role: [],
                team: ''
            },
            phoneEmailCheck: true//电话邮箱必填一项的验证

        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(this.getInitialState());
    },
    onChange: function() {
        this.setState({... UserFormStore.getState()});
    },
    componentWillUnmount: function() {
        UserFormStore.unlisten(this.onChange);
    },
    componentDidMount: function() {
        var _this = this;
        _this.layout();
        UserFormStore.listen(_this.onChange);
        $(window).resize(function(e) {
            e.stopPropagation();
            _this.layout();
        });
    },

    layout: function() {
        var bHeight = $('body').height();
        var formHeight = bHeight - $('form .head-image-container').outerHeight(true);
        $('.user-form-scroll').height(formHeight);
    },

    //关闭面板前清空验证的处理
    resetValidatFlags: function() {
        UserFormAction.resetUserNameFlags();
        UserFormAction.resetEmailFlags();
    },
    handleCancel: function(e) {
        e.preventDefault();
        this.resetValidatFlags();
        this.props.closeRightPanel();
    },
    handleSubmit: function(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if(err) return;
            if (this.state.userNameExist || this.state.emailExist || this.state.userNameError || this.state.emailError) {
                err = true;
            }
            if (err) {
                return;
            } else {
                //所有者各项唯一性验证均不存在且没有出错再添加
                var user = _.extend({}, values);
                if (user.phone) {
                    user.phone = $.trim(user.phone);
                }
                if (user.email) {
                    user.email = $.trim(user.email);
                }
                if (user.email !== this.props.user.email) {
                    //修改邮箱后，邮箱的激活状态改为未激活
                    user.emailEnable = false;
                }
                user.role = JSON.stringify(user.role);
                //设置正在保存中
                UserFormAction.setSaveFlag(true);
                if (this.props.formType === 'add') {
                    user.userName = user.email;
                    UserFormAction.addUser(user);
                }
            }
        });
    },
    //电话唯一性的验证
    getPhoneInputValidateRules: function() {
        return [{
            validator: (rule, value, callback) => {
                value = $.trim(value);
                if (value) {
                    UserFormAction.checkOnlyPhone(value, data => {
                        if (_.isString(data)) {
                            //唯一性验证出错了
                            callback(Intl.get('crm.82', '电话唯一性验证出错了'));
                        } else {
                            if (data === false) {
                                callback();
                            } else {
                                //已存在
                                callback(Intl.get('crm.83', '该电话已存在'));
                            }
                        }
                    });
                }else{
                    callback();
                }
            }
        }];
    },
    uploadImg: function(src) {
        Trace.traceEvent($(this.getDOMNode()).find('.head-image-container .update-logo-desr'),'上传头像');
        this.props.form.setFieldsValue({image: src});
    },
    //关闭
    closePanel: function() {
        this.resetValidatFlags();
        this.props.closeRightPanel();
    },

    //返回详细信息展示页
    returnInfoPanel: function(newAddUser) {
        this.resetValidatFlags();
        this.props.returnInfoPanel(newAddUser);
    },

    //去掉保存后提示信息
    hideSaveTooltip: function() {
        if (this.props.formType === 'add' && (this.state.saveResult === 'success' || this.state.saveResult === 'warn')) {
            //返回详情页继续添加
            this.returnInfoPanel(this.state.savedUser);
            this.props.showContinueAddButton();
        }

        UserFormAction.resetSaveResult(this.props.formType, this.state.saveResult);
    },

    //用户名只能由字母、数字、下划线组成
    checkUserName: function(rule, value, callback) {
        if (this.state.userNameExist || this.state.userNameError) {
            UserFormAction.resetUserNameFlags();
        }
        value = $.trim(value);
        if (value) {
            if (!(/^[A-Za-z0-9]\w+$/).test(value)) {
                callback(new Error(Intl.get('member.check.member.name', '请输入数字、字母或下划线，首字母不能是下划线')));
            } else {
                callback();
            }
        } else {
            callback();
        }
    },

    //邮箱唯一性验证
    checkOnlyEmail: function(e) {
        let email = $.trim(this.props.form.getFieldValue('email'));
        if (email && email !== this.props.user.email.value && /^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
            .test(email)) {
            //所有者的邮箱唯一性验证
            UserFormAction.checkOnlyEmail(email);

        } else {
            UserFormAction.resetEmailFlags();
            UserFormAction.resetUserNameFlags();
        }
    },

    //验证所有者用户名的唯一性
    checkOnlyUserName: function() {
        var userName = $.trim(this.props.form.getFieldValue('userName'));
        if (userName && (/^[A-Za-z0-9]\w+$/).test(userName)) {
            UserFormAction.checkOnlyUserName(userName);
        } else {
            UserFormAction.resetUserNameFlags();
        }
    },

    //用户名唯一性验证的展示
    renderUserNameMsg: function() {
        if (this.state.userNameExist) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.is.existed"
                defaultMessage="用户名已存在！"/></div>);
        } else if (this.state.userNameError) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.username.is.unique"
                defaultMessage="用户名唯一性校验出错！"/>
            </div>);
        } else {
            return '';
        }
    },

    //邮箱唯一性验证的展示
    renderEmailMsg: function() {
        if (this.state.emailExist || this.state.userNameExist) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.is.used"
                defaultMessage="邮箱已被使用！"/></div>);
        } else if (this.state.emailError || this.state.userNameError) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.validate.error"
                defaultMessage="邮箱校验失败！"/></div>);
        } else {
            return '';
        }
    },

    //渲染角色下拉列表
    renderRoleOptions: function() {
        let formData = this.props.form.getFieldsValue();
        //角色列表
        var roleOptions = '';
        var roleList = this.state.roleList;
        if (_.isArray(roleList) && roleList.length > 0) {
            roleOptions = roleList.map(function(role) {
                var className = '';
                if (_.isArray(formData.role) && formData.role.length > 0) {
                    formData.role.forEach(function(roleId) {
                        if (role.roleId === roleId) {
                            className = 'role-options-selected';
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
        return roleOptions;
    },

    //渲染所属团队下拉列表
    renderTeamOptions: function() {
        let values = this.props.form.getFieldsValue();
        //团队列表
        var teamOptions = '';
        var teamList = this.state.userTeamList;
        if (_.isArray(teamList) && teamList.length > 0) {
            teamOptions = teamList.map(function(team) {
                var className = '';
                if (team.group_id === values.team) {
                    className = 'role-options-selected';
                }
                return (<Option className={className} key={team.group_id} value={team.group_id}>
                    {team.group_name}
                </Option>);

            });
        } else {
            teamOptions =
                    <Option value=""><ReactIntl.FormattedMessage id="member.no.groups" defaultMessage="暂无团队"/></Option>;
        }
        return teamOptions;
    },
    handleSelect: function() {
        Trace.traceEvent($(this.getDOMNode()).find('form ul li'),'选择角色');
    },
    handleTeamSelect: function() {
        Trace.traceEvent($(this.getDOMNode()).find('form ul li'),'选择所属团队');
    },
    render: function() {
        let values = this.props.form.getFieldsValue();
        var className = 'right-panel-content';
        if (this.props.userFormShow) {
            if (this.props.formType === 'add') {
                className += ' right-form-add';
            } else {
                className += ' right-panel-content-slide';
            }
        }
        const {getFieldDecorator} = this.props.form;
        var saveResult = this.state.saveResult;
        var headDescr = Intl.get('member.head.logo', '头像');
        return (
            <div className={className} data-tracename="添加/编辑面板">
                <RightPanelClose onClick={this.closePanel} data-tracename="关闭添加/编辑面板"/>
                {(this.props.formType === 'add' || !this.props.userFormShow) ? null : (
                    <RightPanelReturn onClick={this.returnInfoPanel} data-tracename="返回详细信息展示页"/>)}
                <Form horizontal className="form" autoComplete="off" >
                    <FormItem id="image">
                        {getFieldDecorator('image')(
                            <div>
                                <HeadIcon
                                    headIcon={values.image }
                                    iconDescr={values.name || headDescr}
                                    upLoadDescr={headDescr}
                                    isEdit={true}
                                    onChange={this.uploadImg}
                                    userName={values.userName}
                                    isUserHeadIcon={true}
                                />
                                <Input type="hidden" name="image" id="image"/>
                            </div>
                        )}
                    </FormItem>
                    <div className="user-form-scroll" style={{width: '420px'}}>
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <div id="user-add-form">
                                <FormItem
                                    label={Intl.get('realm.change.owner.name', '姓名')}
                                    labelCol={{span: FORM_CONST.LABEL_COL}}
                                    wrapperCol={{span: FORM_CONST.WRAPPER_COL}}
                                >
                                    {getFieldDecorator('name',{
                                        rules: [{
                                            required: true, min: 1, max: 20, message: Intl.get('common.input.character.prompt', '最少1个字符,最多20个字符')
                                        }]
                                    })(
                                        <Input name="name" id="nickName"
                                            placeholder={Intl.get('common.required.tip','必填项*')}
                                        />
                                    )}
                                </FormItem>
                                <PhoneInput
                                    placeholder={Intl.get('crm.95', '请输入联系人电话')}
                                    validateRules={this.getPhoneInputValidateRules()}
                                    initialValue={values.phone}
                                    id="phone"
                                    labelCol={{span: FORM_CONST.LABEL_COL}}
                                    wrapperCol={{span: FORM_CONST.WRAPPER_COL}}
                                    form={this.props.form}

                                />
                                <FormItem
                                    label={Intl.get('common.email', '邮箱')}
                                    labelCol={{span: FORM_CONST.LABEL_COL}}
                                    wrapperCol={{span: FORM_CONST.WRAPPER_COL}}
                                >

                                    {getFieldDecorator('email',{
                                        rules: [{
                                            required: true, type: 'email', message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                        },{
                                            validator: {}
                                        }]
                                    })(
                                        <Input name="email" id="email" type="text"
                                            placeholder={Intl.get('common.required.tip','必填项*')}
                                            className={this.state.emailExist || this.state.emailError ? 'input-red-border' : ''}
                                            onBlur={(e) => {this.checkOnlyEmail(e);}}
                                        />
                                    )}

                                </FormItem>
                                {this.renderEmailMsg()}
                                <FormItem
                                    label={Intl.get('common.role', '角色')}
                                    labelCol={{span: FORM_CONST.LABEL_COL}}
                                    wrapperCol={{span: FORM_CONST.WRAPPER_COL}}
                                >
                                    {this.state.isLoadingRoleList ? (
                                        <div className="role-list-loading">
                                            <ReactIntl.FormattedMessage id="member.get.role.lists"
                                                defaultMessage="正在获取角色列表"/>
                                            <Icon type="loading"/>
                                        </div>) : (
                                        <div>
                                            {getFieldDecorator('role',{
                                                rules: [{
                                                    required: true, type: 'array', message: Intl.get('member.select.role', '请选择角色')
                                                }]
                                            })(
                                                <Select multiple
                                                    optionFilterProp="children"
                                                    searchPlaceholder={Intl.get('member.select.role', '请选择角色')}
                                                    notFoundContent={Intl.get('common.no.match', '暂无匹配项')}
                                                    onSelect={this.handleSelect}
                                                    getPopupContainer={() => document.getElementById('user-add-form')}
                                                >
                                                    {this.renderRoleOptions()}
                                                </Select>
                                            )}
                                        </div>)
                                    }
                                </FormItem>
                                {/** v8环境下，不显示所属团队 */}
                                {this.props.formType === 'add' ? ( !Oplate.hideSomeItem && <FormItem
                                    label={Intl.get('common.belong.team', '所属团队')}
                                    labelCol={{span: FORM_CONST.LABEL_COL}}
                                    wrapperCol={{span: FORM_CONST.WRAPPER_COL}}
                                >
                                    {this.state.isLoadingTeamList ? (
                                        <div className="role-list-loading"><ReactIntl.FormattedMessage
                                            id="member.is.get.group.lists" defaultMessage="正在获取团队列表"/><Icon
                                            type="loading"/></div>) : (
                                        <div>
                                            {getFieldDecorator('team')(
                                                <Select name="team" id="team"
                                                    placeholder={Intl.get('member.select.group', '请选择团队')}
                                                    notFoundContent={Intl.get('member.no.group', '暂无此团队')}
                                                    showSearch
                                                    searchPlaceholder={Intl.get('member.search.group.by.name', '输入团队名称搜索')}
                                                    optionFilterProp="children"
                                                    value={values.team}
                                                    // onChange={this.setField.bind(this, 'team')}
                                                    onSelect={this.handleTeamSelect}
                                                    getPopupContainer={() => document.getElementById('user-add-form')}
                                                >
                                                    {this.renderTeamOptions()}
                                                </Select>
                                            )}
                                        </div>)
                                    }
                                </FormItem>) : null}
                                <FormItem
                                    wrapperCol={{span: 23}}>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={3000}
                                                    message={this.state.saveMsg}
                                                    type={this.state.saveResult} showIcon
                                                    onHide={this.hideSaveTooltip}/>
                                            ) : ''
                                        }
                                    </div>
                                    <RightPanelCancel onClick={this.handleCancel} data-tracename="取消新添加成员的基本信息">
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit} data-tracename="保存新添加成员的基本信息">
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                    </RightPanelSubmit>
                                </FormItem>
                            </div>
                        </GeminiScrollbar>
                    </div>
                    {this.state.isSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : ''}
                </Form>
            </ div >
        );
    }
});

const UserFormForm = Form.create()(UserForm);
module.exports = UserFormForm;
