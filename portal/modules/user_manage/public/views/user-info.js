/**
 * Created by wangliping on 2016/11/8.
 */
var React = require('react');
const PropTypes = require('prop-types');
var language = require('../../../../public/language/getLanguage');
require('../css/user-info.less');
import {Icon, Select, Popconfirm, message, Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import {getPassStrenth, passwordRegex} from 'CMP_DIR/password-strength-bar';
var Option = Select.Option;
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var HeadIcon = require('../../../../components/headIcon');
import UserLog from './user-log';
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var UserFormStore = require('../store/user-form-store');
var UserInfoStore = require('../store/user-info-store');
var UserInfoAjax = require('../ajax/user-ajax');
var UserAction = require('../action/user-actions');
var UserInfoAction = require('../action/user-info-action');
import Trace from 'LIB_DIR/trace';
const UserData = require('PUB_DIR/sources/user-data');
import RadioCard from '../views/radio-card';
import {checkPhone, nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import DetailCard from 'CMP_DIR/detail-card';
import {StatusWrapper} from 'antc';
import classNames from 'classnames';
import Spinner from 'CMP_DIR/spinner';
const TAB_KEYS = {
    BASIC_INFO_TAB: '1',//基本信息
    LOG_TAB: '2'//操作日志
};
const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 352;
class UserInfo extends React.Component {
    state = {
        userIsLoading: this.props.userIsLoading,
        getUserDetailError: this.props.getUserDetailError,
        userInfo: $.extend(true, {}, this.props.userInfo),
        userBasicDetail: {id: '', createDate: ''},//要传用户的id和用户的创建时间
        modalStr: '',//模态框提示内容
        isDel: false,//是否删除
        userTeamList: UserFormStore.getState().userTeamList,
        roleList: UserFormStore.getState().roleList,
        isPasswordInputShow: false,//是否展示修改密码的输入框
        activeKey: TAB_KEYS.BASIC_INFO_TAB,
        ...UserInfoStore.getState(),
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.userInfo.id !== this.state.userInfo.id) {
            setTimeout(() => {
                this.getUserData(nextProps.userInfo);
            });
        }
        this.setState({
            userInfo: $.extend(true, {}, nextProps.userInfo),
            getUserDetailError: nextProps.getUserDetailError,
            userIsLoading: nextProps.userIsLoading
        });
    }

    onChange = () => {
        this.setState({
            userTeamList: UserFormStore.getState().userTeamList,
            roleList: UserFormStore.getState().roleList,
            ...UserInfoStore.getState()
        });
    };

    componentWillUnmount() {
        UserInfoStore.unlisten(this.onChange);
        UserFormStore.unlisten(this.onChange);
    }

    componentDidMount() {
        UserFormStore.listen(this.onChange);
        UserInfoStore.listen(this.onChange);
        setTimeout(() => {
            this.getUserData(this.state.userInfo);
        });
        var userBasicDetail = this.state.userBasicDetail;
        if (userBasicDetail.id) {
            //获取用户的详情
            UserAction.setUserLoading(true);
            UserInfoAction.getCurUserById(userBasicDetail);
        }
    }

    getUserData = (user) => {
        if (user.id) {
            //跟据用户的id获取销售提成和比例
            UserInfoAction.getSalesGoals({user_id: user.id});
        }

    };

    forbidCard = (e) => {
        let userInfo = this.state.userInfo;
        let modalStr = Intl.get('member.start.this', '启用此');
        if (userInfo.status === 1) {
            modalStr = Intl.get('member.stop.this', '禁用此');
        }
        Trace.traceEvent(e, '点击确认' + modalStr + '成员');
        let status = 1;
        if (userInfo.status === 1) {
            status = 0;
        }
        if (userInfo.id && _.isFunction(this.props.updateUserStatus)) {
            this.props.updateUserStatus({
                id: _.get(this.state, 'userInfo.id'),
                status
            });
        }
    };

    //获取团队下拉列表
    getTeamOptions = () => {
        var userTeamList = this.state.userTeamList;
        if (_.isArray(userTeamList) && userTeamList.length > 0) {
            return userTeamList.map(function(team) {
                return <Option key={team.group_id} value={team.group_id}>
                    {team.group_name}
                </Option>;
            });
        } else {
            return [];
        }
    };

    //团队的选择事件
    onSelectTeam = (teamId) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '选择所属团队');
        let userInfo = this.state.userInfo;
        userInfo.teamId = teamId;
        this.setState({userInfo});
    };

    cancelEditTeam = () => {
        let userInfo = this.state.userInfo;
        userInfo.teamId = this.props.userInfo.teamId;
        this.setState({userInfo});
    };

    //修改的所属团队成功后的处理
    afterEditTeamSuccess = (user) => {
        //更新详情中的所属团队
        let updateTeam = _.find(this.state.userTeamList, team => team.group_id === user.team);
        UserAction.updateUserTeam(updateTeam);
        if (_.isFunction(this.props.afterEditTeamSuccess)) {
            this.props.afterEditTeamSuccess(user);
        }
    };

    afterEditRoleSuccess = (user) => {
        //更新详情中的角色
        let roleObj = {roleIds: [], roleNames: []}, roleList = this.state.roleList;
        if (_.isArray(user.role) && user.role.length) {
            user.role.forEach(roleId => {
                let curRole = _.find(roleList, role => role.roleId === roleId);
                roleObj.roleIds.push(curRole.roleId);
                roleObj.roleNames.push(curRole.roleName);
            });
            UserAction.updateUserRoles(roleObj);
        }
        if (_.isFunction(this.props.afterEditRoleSuccess)) {
            this.props.afterEditRoleSuccess(user);
        }
    };

    changeUserFieldSuccess = (user) => {
        _.isFunction(this.props.changeUserFieldSuccess) && this.props.changeUserFieldSuccess(user);
    };

    //渲染角色下拉列表
    getRoleSelectOptions = (userInfo) => {
        //角色列表
        var roleOptions = [];
        var roleList = this.state.roleList;
        if (_.isArray(roleList) && roleList.length > 0) {
            roleOptions = roleList.map(function(role) {
                var className = '';
                if (_.isArray(userInfo.roleIds) && userInfo.roleIds.length > 0) {
                    userInfo.roleIds.forEach(function(roleId) {
                        if (role.roleId === roleId) {
                            className = 'role-options-selected';
                        }
                    });
                }
                return (<Option className={className} key={role.roleId} value={role.roleId}>
                    {role.roleName}
                </Option>);

            });
        } else {
            roleOptions = [<Option value="" key="role">{Intl.get('member.no.role', '暂无角色')}</Option>];
        }
        return roleOptions;
    };

    selectRole = (roleIds) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '选择角色');
        let userInfo = this.state.userInfo;
        userInfo.roleIds = roleIds;
        this.setState({userInfo});
    };

    cancelEditRole = () => {
        let userInfo = this.state.userInfo;
        userInfo.roleIds = _.extend([], this.props.userInfo.roleIds);
        this.setState({userInfo});
    };

    onPasswordDisplayChange(e) {
        this.setState({isPasswordInputShow: !this.state.isPasswordInputShow});
    }

    onPasswordValueChange = () => {
        const confirmPassword = this.refs.confirmPassword;
        if (confirmPassword && confirmPassword.state.formData.input) {
            confirmPassword.refs.validation.forceValidate();
        }
    };

    onConfirmPasswordDisplayTypeChange = () => {
        this.setState({isPasswordInputShow: false});
        this.refs.password.setState({displayType: 'text'});
    };

    //对密码 进行校验
    checkPass = (rule, value, callback) => {
        if (value && value.match(passwordRegex)) {
            let passStrength = getPassStrenth(value);
            this.refs.password.setState({passStrength: passStrength});
            callback();
        } else {
            this.refs.password.setState({
                passStrength: {
                    passBarShow: false,
                    passStrength: 'L'
                }
            });
            callback(Intl.get('common.password.validate.rule', '请输入6-18位数字、字母、符号组成的密码'));
        }
    };

    //对确认密码 进行校验
    checkRePass = (rule, value, callback) => {
        if (value && value === this.refs.password.state.formData.input) {
            callback();
        } else {
            callback(Intl.get('common.password.unequal', '两次输入密码不一致！'));
        }
    };

    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.upload-img-select'), '点击上传头像');
        let userInfo = this.state.userInfo;
        userInfo.image = src;
        this.setState({userInfo, showSaveIconTip: true});
    };

    saveUserIcon = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.upload-img-select'), '保存上传头像');
        this.setState({showSaveIconTip: false});
        let userInfo = this.state.userInfo;
        if (userInfo.image && userInfo.image !== this.props.userInfo.image) {
            let editObj = {user_id: userInfo.id, user_logo: userInfo.image};
            UserInfoAjax.editUser(editObj).then(function(result) {
                //上传成功
                if (result) {
                    message.success(Intl.get('common.upload.success', '上传成功！'));
                    UserAction.afterEditUser(editObj);
                }
            }, function(errorObj) {
                //上传失败
                message.error(errorObj.message || Intl.get('common.upload.error', '上传失败，请重试!'));
            });
        }
    };

    //切换日志分页时的处理
    changeLogNum = (num) => {
        UserInfoAction.changeLogNum(num);
        UserInfoAction.getLogList({
            user_name: this.state.userInfo.userName,
            num: num,
            page_size: this.state.page_size
        });
    };

    //启用、停用
    updateUserStatus = (userId, status) => {
        var updateObj = {id: userId, status: status};
        _.isFunction(this.props.updateUserStatus) && this.props.updateUserStatus(updateObj);
    };

    cancelEditIcon = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.upload-img-select'), '取消头像的保存');
        let userInfo = this.state.userInfo;
        userInfo.image = this.props.userInfo.image;
        this.setState({userInfo, showSaveIconTip: false});
    };

    // 保存修改的昵称（姓名）
    saveEditNicknameInfo = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存成员昵称的修改');
        UserInfoAjax.checkOnlyNickName(saveObj.nick_name).then( (result) => {
            if (result) {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('common.name.is.existed', '姓名已存在！'));
            }else {
                if (_.isFunction(successFunc)) successFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        } );
    };

    //保存修改的成员信息
    saveEditMemberInfo = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存成员${type}的修改`);
        saveObj.user_id = saveObj.id;
        delete saveObj.id;
        UserInfoAjax.editUser(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.changeUserFieldSuccess(saveObj);
                //如果是密码的修改，取消密码框的展示
                if (type === 'password') {
                    this.setState({isPasswordInputShow: false});
                }
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    }
    //保存修改的销售目标,saveObj={id,goal}
    saveSalesGole = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存销售目标的修改');
        let userInfo = this.state.userInfo || {};
        if (!saveObj.id) {
            delete saveObj.id;//原来未设置过销售目标，则是添加，不需要传id
        }
        saveObj.user_id = userInfo.id;
        saveObj.user_name = userInfo.name;
        saveObj.sales_team = userInfo.teamName;
        saveObj.sales_team_id = userInfo.teamId;
        UserInfoAjax.setSalesGoals(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                //如果之前没有填写过销售目标和提成比例
                if (!saveObj.id) {
                    saveObj.id = result.id;
                }
                if (_.has(result,'goal')){
                    saveObj.goal = result.goal;
                }
                if (_.has(result,'commission_ratio')){
                    saveObj.commission_ratio = result.commission_ratio;
                }
                this.setState({
                    saleGoalsAndCommissionRadio: saveObj
                });
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    }

    //保存编辑的角色
    saveEditRoles = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存成员角色的修改');
        UserInfoAjax.updateUserRoles(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.afterEditRoleSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    }

    //保存编辑的团队
    saveEditTeam = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存成员团队的修改');
        UserInfoAjax.updateUserTeam(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.afterEditTeamSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    }

    renderMemberInfoContent = () => {
        let userInfo = this.state.userInfo;
        let roleSelectOptions = this.getRoleSelectOptions(userInfo);
        let roleNames = '', isSales = false;
        if (_.isArray(userInfo.roleNames) && userInfo.roleNames.length) {
            if (_.indexOf(userInfo.roleNames, Intl.get('sales.home.sales', '销售')) > -1) {
                //是否是销售角色
                isSales = true;
            }
            roleNames = userInfo.roleNames.join(',');

        }
        var commissionRadio = '', goal = '', recordId = '',
            saleGoalsAndCommissionRadio = this.state.saleGoalsAndCommissionRadio;
        if (saleGoalsAndCommissionRadio.id) {
            //某条销售目标和提成比例的id
            recordId = saleGoalsAndCommissionRadio.id;
        }

        if (saleGoalsAndCommissionRadio.goal || saleGoalsAndCommissionRadio.goal === 0) {
            //销售目标
            goal = saleGoalsAndCommissionRadio.goal;
        }
        return (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('common.role', '角色')}:
                    </span>
                    <BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        id={userInfo.id}
                        displayText={roleNames}
                        value={userInfo.roleIds}
                        multiple={true}
                        field="role"
                        selectOptions={roleSelectOptions}
                        hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_ROLE')}
                        validators={[{
                            required: true,
                            message: Intl.get('member.select.role', '请选择角色'),
                            type: 'array'
                        }]}
                        placeholder={Intl.get('member.select.role', '请选择角色')}
                        onSelectChange={this.selectRole}
                        cancelEditField={this.cancelEditRole}
                        saveEditSelect={this.saveEditRoles.bind(this)}
                        noDataTip={Intl.get('member.no.role', '暂无角色')}
                        addDataTip={Intl.get('user.setting.roles', '设置角色')}
                    />
                </div>
                {/** v8环境下，不显示所属团队*/}
                { !Oplate.hideSomeItem ? (
                    <div className="basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('common.belong.team', '所属团队')}:
                        </span>
                        <BasicEditSelectField
                            id={userInfo.id}
                            displayText={userInfo.teamName}
                            value={userInfo.teamId}
                            field="team"
                            selectOptions={this.getTeamOptions()}
                            placeholder={Intl.get('member.select.group', '请选择团队')}
                            validators={[{message: Intl.get('member.select.group', '请选择团队')}]}
                            onSelectChange={this.onSelectTeam}
                            cancelEditField={this.cancelEditTeam}
                            width={EDIT_FEILD_LESS_WIDTH}
                            hasEditPrivilege={hasPrivilege('USER_MANAGE_EDIT_USER')}
                            saveEditSelect={this.saveEditTeam.bind(this)}
                            noDataTip={Intl.get('member.no.groups', '暂无团队')}
                            addDataTip={Intl.get('sales.team.add.team', '添加团队')}
                        />
                    </div>) : null }
                {isSales ? (
                    <div className="basic-info-item">
                        <span className="basic-info-label">{Intl.get('sales.team.sales.goal', '销售目标')}:</span>
                        <BasicEditInputField
                            width={EDIT_FEILD_LESS_WIDTH}
                            id={recordId}
                            value={goal}
                            field="goal"
                            type="number"
                            placeholder={Intl.get('member.sales.goal.add', '设置销售目标')}
                            afterTextTip={Intl.get('contract.82', '元')}
                            afterValTip={Intl.get('contract.82', '元')}
                            hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_BASE_INFO')}
                            saveEditInput={this.saveSalesGole}
                            noDataTip={Intl.get('member.sales.goal.no.data', '未设置销售目标')}
                            addDataTip={Intl.get('member.sales.goal.add', '设置销售目标')}
                        />
                    </div> ) : null}
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('user.manage.phone.order', '坐席号')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={userInfo.id}
                        value={userInfo.phoneOrder}
                        hasEditPrivilege={false}
                        noDataTip={Intl.get('member.phone.order.null', '暂无座席')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('member.create.time', '创建时间')}:</span>
                    <BasicEditDateField
                        width={EDIT_FEILD_WIDTH}
                        id={userInfo.id}
                        field="createDate"
                        value={userInfo.createDate ? moment(userInfo.createDate).format(oplateConsts.DATE_FORMAT) : ''}
                        hasEditPrivilege={false}
                    />
                </div>
            </div>
        );
    };

    renderContactContent() {
        let userInfo = this.state.userInfo;
        return (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('user.phone', '手机号')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={userInfo.id}
                        value={userInfo.phone}
                        field="phone"
                        type="text"
                        hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_BASE_INFO')}
                        validators={[{validator: checkPhone}]}
                        placeholder={Intl.get('user.input.phone', '请输入手机号')}
                        saveEditInput={this.saveEditMemberInfo.bind(this, 'phone')}
                        addDataTip={Intl.get('member.phone.add', '添加手机号')}
                        noDataTip={Intl.get('member.phone.no.data', '未添加手机号')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('common.email', '邮箱')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        id={userInfo.id}
                        value={userInfo.email}
                        afterTextTip={`(${userInfo.emailEnable ? Intl.get('common.actived', '已激活') : Intl.get('member.not.actived', '未激活')})`}
                        field="email"
                        type="text"
                        hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_BASE_INFO')}
                        validators={[{
                            type: 'email',
                            required: true,
                            message: Intl.get('common.correct.email', '请输入正确的邮箱')
                        }]}
                        placeholder={Intl.get('member.input.email', '请输入邮箱')}
                        saveEditInput={this.saveEditMemberInfo.bind(this, 'email')}
                        noDataTip={Intl.get('member.email.no.data', '未添加邮箱')}
                        addDataTip={Intl.get('user.info.add.email', '添加邮箱')}
                    />
                </div>
            </div>
        );
    }

    //切换tab时的处理
    changeActiveKey = (key) => {
        let keyName = key === TAB_KEYS.BASIC_INFO_TAB ? '基本信息' : '操作日志';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + keyName);
        this.setState({
            activeKey: key
        });
    };

    renderMemberStatus(userInfo) {
        let loginUserInfo = UserData.getUserData();
        //自己不能停用自己
        if (userInfo.id === loginUserInfo.user_id) {
            return null;
        }
        let iconCls = classNames('iconfont', {
            'icon-enable': userInfo.status,
            'icon-disable': !userInfo.status
        });
        return (
            <div className="status-switch-container">
                <StatusWrapper
                    loading={this.state.resultType === 'loading'}
                    errorMsg={this.state.resultType === 'error' && this.state.errorMsg}
                    size='small'
                >
                    <Popconfirm
                        placement="bottomRight" onConfirm={this.forbidCard.bind(this)}
                        title={Intl.get('member.status.eidt.tip', '确定要{status}该成员？', {
                            status: userInfo.status === 0 ? Intl.get('common.enabled', '启用') : Intl.get('common.stop', '停用')
                        })}>
                        <span className={iconCls}
                            title={userInfo.status === 0 ? Intl.get('common.stop', '停用') : Intl.get('common.enabled', '启用')}/>
                    </Popconfirm>
                </StatusWrapper>
            </div>
        );
    }

    renderTitle() {
        let userInfo = this.state.userInfo;
        const TITLE_INPUT_WIDTH = 280;
        return (
            <div className="member-detail-title">
                <Popconfirm title={Intl.get('member.save.logo.tip', '是否保存上传的头像？')}
                    visible={this.state.showSaveIconTip}
                    onConfirm={this.saveUserIcon} onCancel={this.cancelEditIcon}>
                    <HeadIcon headIcon={userInfo.image}
                        isEdit={true}
                        onChange={this.uploadImg}
                        userName={userInfo.userName || ''}
                        isUserHeadIcon={true}
                    />
                </Popconfirm>
                {this.state.isPasswordInputShow ? (
                    <div className="password-edit-container">
                        <BasicEditInputField
                            ref="password"
                            width={TITLE_INPUT_WIDTH}
                            id={userInfo.id}
                            field="password"
                            type="password"
                            displayType="edit"
                            hideButtonBlock={true}
                            showPasswordStrength={true}
                            validators={[{validator: this.checkPass}]}
                            placeholder={Intl.get('login.please_enter_new_password', '请输入新密码')}
                            title={Intl.get('user.batch.password.reset', '重置密码')}
                            onDisplayTypeChange={this.onPasswordDisplayTypeChange}
                            onValueChange={this.onPasswordValueChange}
                        />
                        <BasicEditInputField
                            ref="confirmPassword"
                            width={TITLE_INPUT_WIDTH}
                            id={userInfo.id}
                            displayType="edit"
                            field="password"
                            type="password"
                            placeholder={Intl.get('common.input.confirm.password', '请输入确认密码')}
                            validators={[{validator: this.checkRePass}]}
                            onDisplayTypeChange={this.onConfirmPasswordDisplayTypeChange}
                            saveEditInput={this.saveEditMemberInfo.bind(this, 'password')}
                        />
                    </div>
                ) : (
                    <div className="memeber-name-container">
                        <div className="member-info-label">
                            {userInfo.userName || ''}
                        </div>
                        <div className="member-info-label member-name-label">
                            <BasicEditInputField
                                width={TITLE_INPUT_WIDTH}
                                id={userInfo.id}
                                value={userInfo.name}
                                field="nick_name"
                                type="text"
                                validators={[nameLengthRule]}
                                placeholder={Intl.get('crm.90', '请输入姓名')}
                                hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_BASE_INFO')}
                                saveEditInput={this.saveEditNicknameInfo}
                                noDataTip={Intl.get('user.nickname.add.tip', '添加昵称')}
                                addDataTip={Intl.get('user.nickname.no.tip', '暂无昵称')}
                            />
                        </div>
                    </div>
                )}
                <div className="member-title-btns">
                    {hasPrivilege('UPDATE_MEMBER_BASE_INFO') ? (
                        <span className="iconfont icon-edit-pw"
                            title={Intl.get('common.edit.password', '修改密码')}
                            onClick={this.onPasswordDisplayChange.bind(this)}/>) : null}
                    {this.renderMemberStatus(userInfo)}
                </div>
            </div>
        );
    }

    getContainerHeight() {
        const PADDING = 30;
        let logListHeight = $('body').height()
            - $('.member-detail-container .right-panel-modal-title').outerHeight(true)
            - $('.member-detail-container .ant-tabs-bar').outerHeight(true)
            - PADDING;
        return logListHeight;
    }

    renderBasicContent() {
        if (this.state.userIsLoading) {
            return (<Spinner/>);
        } else {
            var userInfo = this.state.userInfo;
            let isSales = false;
            if (_.isArray(userInfo.roleNames) && userInfo.roleNames.length) {
                if (_.indexOf(userInfo.roleNames, Intl.get('sales.home.sales', '销售')) > -1) {
                    //是否是销售角色
                    isSales = true;
                }
            }
            var commissionRadio = '', recordId = '',
                saleGoalsAndCommissionRadio = this.state.saleGoalsAndCommissionRadio, newCommissionRatio = '',
                renewalCommissionRatio = '';
            if (saleGoalsAndCommissionRadio.commission_ratio > -1) {
                //提成比例
                commissionRadio = saleGoalsAndCommissionRadio.commission_ratio;
            }
            if (saleGoalsAndCommissionRadio.new_commission_ratio > -1) {
                //新签提成比例,该字段存在，并且不为-1的时候，才进行赋值
                newCommissionRatio = saleGoalsAndCommissionRadio.new_commission_ratio;
            }
            if (saleGoalsAndCommissionRadio.renewal_commission_ratio > -1) {
                //续约提成比例，该字段存在，并且不为-1的时候，才进行赋值
                renewalCommissionRatio = saleGoalsAndCommissionRadio.renewal_commission_ratio;
            }
            if (saleGoalsAndCommissionRadio.id) {
                //某条销售目标和提成比例的id
                recordId = saleGoalsAndCommissionRadio.id;
            }

            return (
                <div className="member-detail-basic-container" style={{height: this.getContainerHeight()}}>
                    <GeminiScrollbar>
                        <div className="member-detail-basic-content">
                            <DetailCard content={this.renderMemberInfoContent()}
                                className='member-info-card-container'/>
                            <DetailCard title={Intl.get('crm.5', '联系方式')}
                                content={this.renderContactContent()}
                                className='member-contact-card-container'/>
                            <div className="">
                                {isSales ?
                                    <DetailCard className='radio-container-wrap'
                                        content={
                                            <RadioCard
                                                id={recordId}
                                                commissionRadio={commissionRadio}
                                                newCommissionRatio={newCommissionRatio}
                                                renewalCommissionRatio={renewalCommissionRatio}
                                                userInfo={this.state.userInfo}
                                                setSalesGoals={UserInfoAjax.setSalesGoals}
                                            />}
                                    /> : null}
                            </div>
                            {this.props.isContinueAddButtonShow ? (
                                <div className="btn-add-member" onClick={this.props.showEditForm.bind(null, 'add')}>
                                    <Icon type="plus"/><span><ReactIntl.FormattedMessage id="common.add.member"
                                        defaultMessage="添加成员"/></span>
                                </div>
                            ) : null}
                        </div>
                    </GeminiScrollbar>
                </div>
            );
        }
    }

    renderDetailTabs() {
        return (
            <Tabs defaultActiveKey={TAB_KEYS.BASIC_INFO_TAB}
                activeKey={this.state.activeKey}
                onChange={this.changeActiveKey}>
                <TabPane tab={Intl.get('user.basic.info', '基本资料')}
                    key={TAB_KEYS.BASIC_INFO_TAB}>
                    {this.state.activeKey === TAB_KEYS.BASIC_INFO_TAB ? this.renderBasicContent() : null}
                </TabPane>
                <TabPane tab={Intl.get('member.operation.log', '操作日志')}
                    key={TAB_KEYS.LOG_TAB}>
                    {this.state.activeKey === TAB_KEYS.LOG_TAB ? (
                        <UserLog getContainerHeight={this.getContainerHeight}
                            userName={_.get(this.state, 'userInfo.userName.value') ||
                                 _.get(this.state, 'userInfo.userName', '')}/>) : null}
                </TabPane>
            </Tabs>);
    }

    render() {
        return (
            <RightPanelModal
                className="member-detail-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.props.closeRightPanel}
                title={this.renderTitle()}
                content={this.renderDetailTabs()}
                dataTracename='成员详情'
            />
        );
    }
}
UserInfo.propTypes = {
    userInfo: PropTypes.object,
    isContinueAddButtonShow: PropTypes.bool,
    deleteCard: PropTypes.func,
    afterEditTeamSuccess: PropTypes.func,
    afterEditRoleSuccess: PropTypes.func,
    changeUserFieldSuccess: PropTypes.func,
    updateUserStatus: PropTypes.func,
    userInfoShow: PropTypes.bool,
    userFormShow: PropTypes.bool,
    closeRightPanel: PropTypes.func,
    showEditForm: PropTypes.func,
    userIsLoading: PropTypes.string,
    getUserDetailError: PropTypes.string
};
module.exports = UserInfo;

