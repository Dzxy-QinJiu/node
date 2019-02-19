require('../css/user-add-form.less');
var Form = require('antd').Form;
var Input = require('antd').Input;
var Select = require('antd').Select;
var Icon = require('antd').Icon;
var Option = Select.Option;
var FormItem = Form.Item;
var HeadIcon = require('../../../../components/headIcon');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var crypto = require('crypto');//用于密码md5
var UserFormStore = require('../store/user-form-store');
var UserFormAction = require('../action/user-form-actions');
var AlertTimer = require('../../../../components/alert-timer');
import Trace from 'LIB_DIR/trace';
import PhoneInput from 'CMP_DIR/phone-input';
import {nameLengthRule, emailRegex} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

function noop() {
}

const LAYOUT_CONST = {
    HEADICON_H: 107,//头像的高度
    TITLE_H: 94//标题的高度
};

class UserForm extends React.Component {
    static defaultProps = {
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

    initData = () => {
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
    };

    componentWillReceiveProps(nextProps) {
        this.setState(this.initData());
    }

    onChange = () => {
        this.setState({... UserFormStore.getState()});
    };

    componentWillUnmount() {
        UserFormStore.unlisten(this.onChange);
    }

    componentDidMount() {
        var _this = this;
        UserFormStore.listen(_this.onChange);
    }

    //关闭面板前清空验证的处理
    resetValidatFlags = () => {
        UserFormAction.resetUserNameFlags();
        UserFormAction.resetEmailFlags();
    };

    handleCancel = (e) => {
        e.preventDefault();
        this.resetValidatFlags();
        this.props.closeRightPanel();
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            if (this.state.userNameExist || this.state.emailExist || this.state.userNameError || this.state.emailError) {
                err = true;
            }
            if (err) {
                return;
            } else {
                //所有者各项唯一性验证均不存在且没有出错再添加
                var user = _.extend({}, values);
                if (user.phone) {
                    user.phone = _.trim(user.phone);
                }
                if (user.email) {
                    user.email = _.trim(user.email);
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
    };

    //电话唯一性的验证
    getPhoneInputValidateRules = () => {
        return [{
            validator: (rule, value, callback) => {
                value = _.trim(value);
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
                } else {
                    callback();
                }
            }
        }];
    };

    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传头像');
        this.props.form.setFieldsValue({image: src});
    };

    //关闭
    closePanel = () => {
        this.resetValidatFlags();
        this.props.closeRightPanel();
    };

    //返回详细信息展示页
    returnInfoPanel = (newAddUser) => {
        this.resetValidatFlags();
        this.props.returnInfoPanel(newAddUser);
    };

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        if (this.props.formType === 'add' && (this.state.saveResult === 'success' || this.state.saveResult === 'warn')) {
            //返回详情页继续添加
            this.returnInfoPanel(this.state.savedUser);
            this.props.showContinueAddButton();
        }

        UserFormAction.resetSaveResult(this.props.formType, this.state.saveResult);
    };

    //用户名只能由字母、数字、下划线组成
    checkUserName = (rule, value, callback) => {
        if (this.state.userNameExist || this.state.userNameError) {
            UserFormAction.resetUserNameFlags();
        }
        value = _.trim(value);
        if (value) {
            if (!(/^[A-Za-z0-9]\w+$/).test(value)) {
                callback(new Error(Intl.get('member.check.member.name', '请输入数字、字母或下划线，首字母不能是下划线')));
            } else {
                callback();
            }
        } else {
            callback();
        }
    };

    //邮箱唯一性验证
    checkOnlyEmail = (e) => {
        let email = _.trim(this.props.form.getFieldValue('email'));
        if (email && email !== this.props.user.email.value && emailRegex.test(email)) {
            //所有者的邮箱唯一性验证
            UserFormAction.checkOnlyEmail(email);

        } else {
            UserFormAction.resetEmailFlags();
            UserFormAction.resetUserNameFlags();
        }
    };

    //验证所有者用户名的唯一性
    checkOnlyUserName = () => {
        var userName = _.trim(this.props.form.getFieldValue('name'));
        if (userName && (/^[A-Za-z0-9]\w+$/).test(userName)) {
            UserFormAction.checkOnlyUserName(userName);
        } else {
            UserFormAction.resetUserNameFlags();
        }
    };

    //用户名唯一性验证的展示
    renderUserNameMsg = () => {
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
    };

    //邮箱唯一性验证的展示
    renderEmailMsg = () => {
        if (this.state.emailExist) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.is.used"
                defaultMessage="邮箱已被使用！"/></div>);
        } else if (this.state.emailError) {
            return (<div className="phone-email-check"><ReactIntl.FormattedMessage id="common.email.validate.error"
                defaultMessage="邮箱校验失败！"/></div>);
        } else {
            return '';
        }
    };

    //渲染角色下拉列表
    renderRoleOptions = () => {
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
    };

    //渲染所属团队下拉列表
    renderTeamOptions = () => {
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
    };

    handleSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form ul li'), '选择角色');
    };

    handleTeamSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form ul li'), '选择所属团队');
    };

    state = this.initData();

    renderFormContent() {
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
        var formHeight = $('body').height() - LAYOUT_CONST.HEADICON_H - LAYOUT_CONST.TITLE_H;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <Form layout='horizontal' className="form" autoComplete="off">
                <FormItem id="image">
                    {getFieldDecorator('image')(
                        <div>
                            <HeadIcon
                                headIcon={values.image}
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
                <div className="user-form-scroll" style={{height: formHeight}}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <div id="user-add-form">
                            <FormItem
                                label={Intl.get('common.name', '姓名')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true,
                                        message: nameLengthRule
                                    }]
                                })(
                                    <Input name="name" id="name" type="text"
                                        placeholder={Intl.get('crm.90', '请输入姓名')}
                                        className={this.state.userNameExist || this.state.userNameError ? 'input-red-border' : ''}
                                        onBlur={() => {
                                            this.checkOnlyUserName();
                                        }}
                                    />
                                )}
                            </FormItem>
                            {this.renderUserNameMsg()}
                            <FormItem
                                label={Intl.get('common.email', '邮箱')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true,
                                        type: 'email',
                                        message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                    }]
                                })(
                                    <Input name="email" id="email" type="text"
                                        placeholder={Intl.get('member.email.extra.tip', '邮箱会作为登录时的用户名使用')}
                                        className={this.state.emailExist || this.state.emailError ? 'input-red-border' : ''}
                                        onBlur={(e) => {
                                            this.checkOnlyEmail(e);
                                        }}
                                    />
                                )}

                            </FormItem>
                            {this.renderEmailMsg()}
                            <FormItem
                                label={Intl.get('common.role', '角色')}
                                {...formItemLayout}
                            >
                                {this.state.isLoadingRoleList ? (
                                    <div className="role-list-loading">
                                        <ReactIntl.FormattedMessage id="member.get.role.lists"
                                            defaultMessage="正在获取角色列表"/>
                                        <Icon type="loading"/>
                                    </div>) : (
                                    <div>
                                        {getFieldDecorator('role', {
                                            rules: [{
                                                required: true,
                                                type: 'array',
                                                message: Intl.get('member.select.role', '请选择角色')
                                            }]
                                        })(
                                            <Select multiple
                                                size='large'
                                                optionFilterProp="children"
                                                placeholder={Intl.get('member.select.role', '请选择角色')}
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
                            <PhoneInput
                                placeholder={Intl.get('crm.95', '请输入联系人电话')}
                                validateRules={this.getPhoneInputValidateRules()}
                                initialValue={values.phone}
                                id="phone"
                                labelCol={{span: formItemLayout.labelCol.span}}
                                wrapperCol={{span: formItemLayout.wrapperCol.span}}
                                form={this.props.form}

                            />
                            {/** v8环境下，不显示所属团队 */}
                            {this.props.formType === 'add' ? (!Oplate.hideSomeItem && <FormItem
                                label={Intl.get('common.belong.team', '所属团队')}
                                {...formItemLayout}
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
                            <FormItem>
                                <SaveCancelButton loading={this.state.isSaving}
                                    saveErrorMsg={saveResult === 'error' ? this.state.saveMsg : ''}
                                    handleSubmit={this.handleSubmit.bind(this)}
                                    handleCancel={this.handleCancel.bind(this)}
                                />
                            </FormItem>
                            <FormItem>
                                <div className="indicator">
                                    {saveResult === 'success' ?
                                        (
                                            <AlertTimer time={3000}
                                                message={this.state.saveMsg}
                                                type={saveResult} showIcon
                                                onHide={this.hideSaveTooltip}/>
                                        ) : ''
                                    }
                                </div>
                            </FormItem>
                        </div>
                    </GeminiScrollbar>
                </div>
            </Form>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="member-add-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={Intl.get('common.add.member', '添加成员')}
                content={this.renderFormContent()}
                dataTracename='添加成员'
            />);
    }
}
UserForm.propTypes = {
    form: PropTypes.form,
    closeRightPanel: PropTypes.func,
    user: PropTypes.object,
    formType: PropTypes.string,
    returnInfoPanel: PropTypes.func,
    showContinueAddButton: PropTypes.func,
    userFormShow: PropTypes.bool
},
module.exports = Form.create()(UserForm);

