require('../css/member-add-form.less');
import {Form, Input, Icon, Button, message} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const FormItem = Form.Item;
import HeadIcon from 'CMP_DIR/headIcon';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const crypto = require('crypto');//用于密码md5
import MemberFormStore from '../store/member-form-store';
import MemberFormAction from '../action/member-form-actions';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {nameLengthRule, emailRegex, commonPhoneRegex, userNameRule, checkQQ} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import MemberManageAjax from '../ajax';
import AddEditGroupForm from 'MOD_DIR/home_page/public/views/boot-process/components/add-edit-group-from';
import classNames from 'classnames';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import {COLOR_LIST} from 'PUB_DIR/sources/utils/consts';
import {getEmailActiveUrl} from 'PUB_DIR/sources/utils/common-method-util';

function noop() {
}

const LAYOUT_CONST = {
    HEADICON_H: 107,//头像的高度
    TITLE_H: 94//标题的高度
};

class MemberForm extends React.Component {
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
            ...MemberFormStore.getState(),
            formData: {
                userName: '',
                name: '',
                image: '',
                phone: '',
                email: '',
                role: [],
                team: ''
            },
            phoneEmailCheck: true, //电话邮箱必填一项的验证
            newAddPosition: {}, // 新添加的职务
            isAddPositionLoading: false, // 保存新添加的职务
            isCancelSavePosition: false, // 取消保存职务，默认false
            isShowSaveCancelBtn: true, // 是否显示保存取消按钮，默认true
        };
    };

    onChange = () => {
        this.setState({... MemberFormStore.getState()});
    };

    componentWillUnmount() {
        MemberFormStore.unlisten(this.onChange);
    }

    componentDidMount = () => {
        MemberFormStore.listen(this.onChange);
    }

    //关闭面板前清空验证的处理
    resetValidatFlags = () => {
        MemberFormAction.resetNickNameFlags();
        MemberFormAction.resetEmailFlags();
    };

    handleCancel = (e) => {
        e && e.preventDefault();
        this.resetValidatFlags();
        this.props.closeRightPanel();
    };

    handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let validateFlag = this.state.userNameExist || this.state.emailExist || this.state.nickNameExist ||
                this.state.userNameError || this.state.emailError || this.state.nickNameError;
            if (validateFlag) {
                err = true;
            }
            if (err) {
                return;
            } else {
                //所有者各项唯一性验证均不存在且没有出错再添加
                let user = _.extend({}, values);
                let positionName = user.position;
                if (positionName) {
                    if (this.state.newAddPosition) { // 新添加的职务
                        user.position = this.state.newAddPosition.id;
                    } else { // 已存在的职务
                        let matchPosition = _.find(this.state.positionList, item => item.name === positionName);
                        if (matchPosition) {
                            user.position = matchPosition.id;
                        }
                    }
                }
                if (user.phone) {
                    user.phone = _.trim(user.phone);
                }
                if (user.email) {
                    user.email = _.trim(user.email);
                }
                if (user.email !== this.props.member.email) {
                    //修改邮箱后，邮箱的激活状态改为未激活
                    user.emailEnable = false;
                }

                if (user.name === '') { // 若昵称为空时，使用用户名作为昵称
                    user.name = user.userName;
                }
                //设置正在保存中
                MemberFormAction.setSaveFlag(true);
                if (this.props.formType === 'add') {
                    //将邮箱中激活链接的url传过去，以便区分https://ent.curtao.com还是https://csm.curtao.com
                    user.activate_url = getEmailActiveUrl();
                    MemberFormAction.addUser(user);
                }
            }
        });
    };

    //手机号唯一性的验证
    getValidator = () => {
        return (rule, value, callback) => {
            let phoneNumber = _.trim(value);
            //空值不做校验
            if (!phoneNumber) {
                callback();
                return;
            }
            if (commonPhoneRegex.test(phoneNumber)) {
                MemberFormAction.checkOnlyPhone(phoneNumber, data => {
                    if (_.isString(data)) {
                        //唯一性验证出错了
                        callback(Intl.get('member.add.member.phone.verify', '手机号唯一性验证出错了'));
                    } else {
                        if (data === false) {
                            callback();
                        } else {
                            //已存在
                            callback(Intl.get('member.add.member.phone.exist', '该手机号已存在'));
                        }
                    }
                });
            } else {
                //延迟1秒钟后再显示错误信息，以防止一输入就报错
                setTimeout(() => {
                    callback(Intl.get('register.phon.validat.tip', '请输入正确的手机号, 格式如:13877775555'));
                }, 1000);
            }
        };
    };

    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传头像');
        this.props.form.setFieldsValue({image: src});
    };

    // 返回详细信息展示页
    returnInfoPanel = (newMember) => {
        this.resetValidatFlags();
        //添加完成员返回详情页角色的处理
        let rolesIds = _.get(newMember, 'roleIds');
        let length = _.get(rolesIds, 'length', 0);
        if (_.isArray(rolesIds) && length) {
            let roleList = this.props.roleList;
            let roleListLength = _.get(roleList, 'length');
            if (_.isArray(roleList) && roleListLength) {
                let role = _.filter(roleList, role => rolesIds.indexOf(role.roleId) !== -1);
                if (_.isArray(role) && role.length) {
                    newMember.roleNames = _.map(role, 'roleName');
                }
            }
        }
        this.props.returnInfoPanel(newMember);
    };

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        if (this.props.formType === 'add' && (this.state.saveResult === 'success' || this.state.saveResult === 'warn')) {
            //返回详情页继续添加
            this.returnInfoPanel(this.state.savedUser);
            this.props.showContinueAddButton();
        }
        MemberFormAction.resetSaveResult(this.props.formType, this.state.saveResult);
    };

    //邮箱唯一性验证
    checkOnlyEmail = (e) => {
        let email = _.trim(this.props.form.getFieldValue('email'));
        if (email && email !== this.props.member.email.value && emailRegex.test(email)) {
            //所有者的邮箱唯一性验证
            MemberFormAction.checkOnlyEmail(email);
        }
    };

    resetEmailFlags = () => {
        MemberFormAction.resetEmailFlags();
    };

    userNameValidationRules = () => {
        return (rule, value, callback) => {
            let userName = _.trim(value);
            if (userName) {
                if (userNameRule.test(userName) || emailRegex.test(userName)) {
                    MemberFormAction.checkOnlyUserName(userName, data => {
                        if (_.isString(data)) {
                            //唯一性验证出错了
                            callback(Intl.get('common.username.is.unique', '用户名唯一性校验出错！'));
                        } else {
                            if (data === false) {
                                callback();
                            } else {
                                //已存在
                                callback(Intl.get('common.is.existed', '用户名已存在！'));
                            }
                        }
                    });
                } else {
                    //延迟1秒钟后再显示错误信息，以防止一输入就报错
                    setTimeout(() => {
                        callback(Intl.get('member.add.member.rule', '用户名只能是邮箱或由字母、数字、横线、下划线组成，且长度在1到50（包括50）之间'));
                    }, 1000);
                }
            } else {
                callback(Intl.get('login.write.username', '请输入用户名'));
            }
        };
    };

    //验证昵称（对应的是姓名）的唯一性
    checkOnlyNickName = () => {
        let userName = _.trim(this.props.form.getFieldValue('name'));
        if (userName && (/^[A-Za-z0-9]\w+$/).test(userName)) {
            MemberFormAction.checkOnlyNickName(userName);
        }
    };
    resetNickNameFlags = () => {
        MemberFormAction.resetNickNameFlags();
    };

    // 是否展示添加部门
    setAddGroupForm = (type) => {
        MemberFormAction.setAddGroupForm(type);
    };

    // 添加部门成功后
    cancelAddGroup = (addTeam) => {
        MemberFormAction.cancelAddGroup(addTeam);
    };

    //昵称（对应的是姓名）唯一性验证的展示
    renderNickNameMsg = () => {
        if (this.state.nickNameExist) {
            return (
                <div className="phone-email-check">
                    {Intl.get('common.nickname.is.existed', '昵称已存在！')}
                </div>
            );
        } else if (this.state.nickNameError) {
            return (
                <div className="phone-email-check">
                    {Intl.get('common.nickname.is.unique', '昵称唯一性校验出错！')}
                </div>
            );
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
        //角色列表
        let roleOptions = '';
        let roleList = this.props.roleList;
        if (_.isArray(roleList) && roleList.length > 0) {
            roleOptions = roleList.map(function(role) {
                return (<Option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                </Option>);

            });
        } else {
            roleOptions =
                <Option value=""><ReactIntl.FormattedMessage id="member.no.role" defaultMessage="暂无角色"/></Option>;
        }
        return roleOptions;
    };

    // 渲染职务下拉列表
    renderPositionOptions = () => {
        let values = this.props.form.getFieldsValue();
        // 职务列表
        let positionOptions = '';
        let positionList = this.state.positionList;
        if (_.isArray(positionList) && _.get(positionList, 'length')) {
            positionOptions = _.map(positionList, item => <Option key={item.id} value={item.name}>{item.name}</Option>);
        }
        return positionOptions;
    };

    //渲染所属团队下拉列表
    renderTeamOptions = () => {
        let values = this.props.form.getFieldsValue();
        // 部门列表
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
                <Option value="">{Intl.get('contract.68', '暂无部门')}</Option>;
        }
        return teamOptions;
    };

    handlePositionSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form ul li'), '选择职务');
    };

    handleSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form ul li'), '选择角色');
    };

    handleTeamSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form ul li'), '选择部门');
    };

    handleSelectPosition = (value) => {
        let positionValue = _.trim(value);
        if (positionValue) {
            let isSelectedPosition = _.find(this.state.positionList, item => item.name === positionValue);
            if (isSelectedPosition) { // 从已有的职务列表中选择
                this.setState({
                    isShowSaveCancelBtn: true
                });
            } else { // 手动输入
                this.setState({
                    isShowSaveCancelBtn: false
                });
            }
        }
    };

    handleBlurPositionSelect = () => {
        let positionSelectValue = _.trim(this.props.form.getFieldValue('position'));
        // 没有选择或是输入内容，移出职位选择框时，需要显示保存按钮
        if (positionSelectValue === '') {
            this.setState({
                isShowSaveCancelBtn: true
            });
        }
    };

    handleFocusPositionSelect = () => {
        this.setState({
            isShowSaveCancelBtn: false
        });
    };

    // 获取职务的颜色
    getPositionColor = () => {
        // 职务列表中已存在的颜色列表
        let existColors = _.map(this.state.positionList, 'color');
        //第一个不在已有角色的颜色列表中的颜色，作为当前添加角色的颜色
        return _.find(COLOR_LIST, color => existColors.indexOf(color) === -1);
    };

    handleSavePosition = () => {
        let positionSelectValue = _.trim(this.props.form.getFieldValue('position'));
        let color = this.getPositionColor();
        let submitObj = {
            name: positionSelectValue,
            color: color,
            customer_num: 1000
        };
        this.setState({
            isAddPositionLoading: true,
            isCancelSavePosition: false,
            isShowSaveCancelBtn: true
        });
        MemberManageAjax.addPosition(submitObj).then( (result) => {
            this.setState({
                isAddPositionLoading: false,
            });
            if (result && _.get(result, 'id')) {
                this.setState({
                    newAddPosition: result
                });
                MemberFormAction.updatePositionList(result);
            } else {
                message.error(Intl.get('member.add.failed', '添加失败！'));
            }
        }, (errMsg) => {
            this.setState({
                isAddPositionLoading: false,
            });
            message.error(errMsg || Intl.get('member.add.failed', '添加失败！'));
        } );
    };

    handleCancelPosition = () => {
        this.props.form.setFieldsValue({position: ''});
        this.setState({
            isCancelSavePosition: true,
            isShowSaveCancelBtn: true
        });
    };

    state = this.initData();

    handleUserNameChange = (event) => {
        let value = event.target.value;
        this.props.form.setFieldsValue({
            name: value,
        });
    };

    renderFormContent() {
        let values = this.props.form.getFieldsValue();
        const {getFieldDecorator} = this.props.form;
        const saveResult = this.state.saveResult;
        const headDescr = Intl.get('member.head.logo', '头像');
        const formHeight = $('body').height() - LAYOUT_CONST.HEADICON_H - LAYOUT_CONST.TITLE_H;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        const addTeamCls = classNames({
            'show-add-group-form': this.props.isShowAddGroupFrom
        });

        let roleId = '';
        let filterRoleObj = _.find(this.props.roleList, item => item.roleName === '销售');
        if (filterRoleObj) {
            roleId = filterRoleObj.roleId;
        }
        let hideAddPositionBtn = true;
        let positionSelectValue = _.trim(this.props.form.getFieldValue('position'));
        if (positionSelectValue) {
            let isSelectedPosition = _.find(this.state.positionList, item => item.name === positionSelectValue);
            if (isSelectedPosition) {
                hideAddPositionBtn = true;
            } else {
                if (_.get(this.state.newAddPosition, 'name') === positionSelectValue) {
                    hideAddPositionBtn = true;
                } else {
                    hideAddPositionBtn = false;
                }
            }
        }
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
                                isUseDefaultUserImage={true}
                            />
                            <Input type="hidden" name="image" id="image"/>
                        </div>
                    )}
                </FormItem>
                <div className="user-form-scroll" style={{height: formHeight}}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <div id="user-add-form">
                            <FormItem
                                label={Intl.get('common.username', '用户名')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('userName', {
                                    rules: [{
                                        required: true,
                                        type: 'userName',
                                        validator: this.userNameValidationRules()
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        name="userName"
                                        id="userName"
                                        type="text"
                                        placeholder={Intl.get('login.write.username', '请输入用户名')}
                                        onChange={this.handleUserNameChange}
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('common.nickname', '昵称')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        message: nameLengthRule
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        name="name"
                                        id="name"
                                        type="text"
                                        placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}
                                        className={this.state.nickNameExist || this.state.nickNameError ? 'input-red-border' : ''}
                                        onBlur={this.checkOnlyNickName}
                                        onFocus={this.resetNickNameFlags}
                                    />
                                )}
                            </FormItem>
                            {this.renderNickNameMsg()}
                            <FormItem
                                label={Intl.get('common.email', '邮箱')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true,
                                        type: 'email',
                                        message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        name="email"
                                        id="email"
                                        type="text"
                                        placeholder={Intl.get('common.correct.email', '请输入正确的邮箱')}
                                        className={this.state.emailExist || this.state.emailError ? 'input-red-border' : ''}
                                        onBlur={(e) => {
                                            this.checkOnlyEmail(e);
                                        }}
                                        onFocus={this.resetEmailFlags}
                                    />
                                )}
                            </FormItem>
                            {this.renderEmailMsg()}
                            <FormItem
                                label={Intl.get('common.role', '角色')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('role', {
                                    initialValue: roleId,
                                    rules: [{
                                        message: Intl.get('member.select.role', '请选择角色')
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <AntcSelect
                                        size='large'
                                        optionFilterProp="children"
                                        placeholder={Intl.get('member.select.role', '请选择角色')}
                                        searchPlaceholder={Intl.get('member.select.role', '请选择角色')}
                                        notFoundContent={Intl.get('common.no.match', '暂无匹配项')}
                                        onSelect={this.handleSelect}
                                        getPopupContainer={() => document.getElementById('user-add-form')}
                                    >
                                        {this.renderRoleOptions()}
                                    </AntcSelect>
                                )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('member.position', '职务')}
                                {...formItemLayout}
                            >
                                {
                                    this.state.isLoadingPosition ? (
                                        <div className="role-list-loading">
                                            {Intl.get('member.is.get.position.lists', '正在获取职务列表')}
                                            <Icon type="loading"/>
                                        </div>) : (
                                        <div>
                                            {
                                                getFieldDecorator('position')(
                                                    <AntcSelect
                                                        combobox
                                                        name="position"
                                                        id="position"
                                                        dropdownClassName={this.state.isCancelSavePosition ? 'cancel-save-position-select' : ''}
                                                        optionFilterProp="children"
                                                        placeholder={Intl.get('member.select.position', '请选择职务')}
                                                        searchPlaceholder={Intl.get('member.select.position', '请选择职务')}
                                                        notFoundContent={Intl.get('common.no.match', '暂无匹配项')}
                                                        onSelect={this.handlePositionSelect}
                                                        onChange={this.handleSelectPosition}
                                                        onBlur={(e) => {
                                                            this.handleBlurPositionSelect(e);
                                                        }}
                                                        onFocus={(e) => {
                                                            this.handleFocusPositionSelect(e);
                                                        }}
                                                        getPopupContainer={() => document.getElementById('user-add-form')}
                                                    >
                                                        {this.renderPositionOptions()}
                                                    </AntcSelect>
                                                )
                                            }
                                            {
                                                hideAddPositionBtn ? null : (
                                                    <div className="no-position-tips">
                                                        <div className="content-tips">
                                                            {Intl.get('member.add.member.no.position.tips', '系统中暂无 {name} 职务，是否添加?', {
                                                                name: positionSelectValue
                                                            })}
                                                        </div>
                                                        <div className="operator-buttons-zone">
                                                            <Button
                                                                className="add-btn"
                                                                disabled={this.state.isAddPositionLoading}
                                                                onClick={this.handleSavePosition.bind(this)}
                                                            >
                                                                {
                                                                    this.state.isAddPositionLoading ? <Icon type="loading"/> : null
                                                                }
                                                                {Intl.get('common.add', '添加')}
                                                            </Button>
                                                            <Button
                                                                className="cancel-btn"
                                                                onClick={this.handleCancelPosition}
                                                            >
                                                                {Intl.get('common.cancel', '取消')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>)
                                }
                            </FormItem>
                            <FormItem
                                label={Intl.get('member.phone', '手机')}
                                colon={false}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('phone', {
                                    rules: [{
                                        type: 'phone',
                                        validator: this.getValidator()
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        name="phone"
                                        id="phone"
                                        placeholder={Intl.get('user.input.phone', '请输入手机号')}
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                label={'QQ'}
                                colon={false}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('qq', {
                                    rules: [{
                                        type: 'qq',
                                        validator: checkQQ
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Input
                                        name="qq"
                                        id="qq"
                                        placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                                    />
                                )}
                            </FormItem>

                            {/** v8环境下，不显示所属团队 */}
                            {this.props.formType === 'add' ? (!Oplate.hideSomeItem && <FormItem
                                label={Intl.get('crm.113', '部门')}
                                {...formItemLayout}
                            >
                                {this.state.isLoadingTeamList ? (
                                    <div className="role-list-loading">
                                        {Intl.get('member.is.get.department.lists', '正在获取部门列表')}
                                        <Icon type="loading"/>
                                    </div>) : (
                                    <div className={addTeamCls}>
                                        {getFieldDecorator('team')(
                                            <AntcSelect
                                                name="team"
                                                id="team"
                                                placeholder={Intl.get('contract.67', '请选择部门')}
                                                notFoundContent={Intl.get('member.no.department', '暂无此部门')}
                                                showSearch
                                                filterOption={(input, option) => ignoreCase(input, option)}
                                                searchPlaceholder={Intl.get('member.search.department.by.name', '输入部门名称搜索')}
                                                optionFilterProp="children"
                                                value={values.team}
                                                // onChange={this.setField.bind(this, 'team')}
                                                onSelect={this.handleTeamSelect}
                                                getPopupContainer={() => document.getElementById('user-add-form')}
                                            >
                                                {this.renderTeamOptions()}
                                            </AntcSelect>
                                        )}
                                        {this.props.isShowAddGroupFrom ? <i title={Intl.get('guide.add.member.team.tip', '添加新部门')} className="iconfont icon-add handle-btn-item" onClick={this.setAddGroupForm.bind(this, true)}/> : null}
                                    </div>)
                                }
                            </FormItem>) : null}
                            {this.state.showAddGroupForm ? (
                                <FormItem
                                    wrapperCol={{
                                        offset: 5,
                                        span: 19
                                    }}
                                >
                                    <AddEditGroupForm
                                        salesTeamList={this.state.userTeamList}
                                        onHandleClose={this.setAddGroupForm}
                                        cancelAddGroup={this.cancelAddGroup}
                                        getPopupContainer={() => document.getElementById('user-add-form')}
                                    />
                                </FormItem>
                            ) : (
                                <FormItem>
                                    {
                                        this.state.isShowSaveCancelBtn ? (
                                            <SaveCancelButton
                                                loading={this.state.isSaving}
                                                saveErrorMsg={saveResult === 'error' ? this.state.saveMsg : ''}
                                                handleSubmit={this.handleSubmit.bind(this)}
                                                handleCancel={this.handleCancel.bind(this)}
                                            />
                                        ) : null
                                    }
                                </FormItem>
                            )}
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
MemberForm.propTypes = {
    form: PropTypes.form,
    closeRightPanel: PropTypes.func,
    member: PropTypes.object,
    formType: PropTypes.string,
    returnInfoPanel: PropTypes.func,
    showContinueAddButton: PropTypes.func,
    isShowMemberForm: PropTypes.bool,
    roleList: PropTypes.array,
    isShowAddGroupFrom: PropTypes.bool
};

module.exports = Form.create()(MemberForm);