/**
 * Created by wangliping on 2016/11/8.
 */
var React = require('react');
const PropTypes = require('prop-types');
require('../css/member-info.less');
import {Icon, Select, Popconfirm, message, Tabs, Switch} from 'antd';
const TabPane = Tabs.TabPane;
import {getPassStrenth, passwordRegex} from 'CMP_DIR/password-strength-bar';
var Option = Select.Option;
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var HeadIcon = require('../../../../components/headIcon');
import MemberLog from './member-log';
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
import MemberFormStore from '../store/member-form-store';
import MemberInfoStore from '../store/member-info-store';
import MemberManageAjax from '../ajax';
import MemberManageAction from '../action';
import MemberInfoAction from '../action/member-info-action';
import Trace from 'LIB_DIR/trace';
const UserData = require('PUB_DIR/sources/user-data');
import RadioCard from './radio-card';
import {checkPhone, nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import DetailCard from 'CMP_DIR/detail-card';
import Spinner from 'CMP_DIR/spinner';
import { StatusWrapper } from 'antc';
import MemberStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';

const TAB_KEYS = {
    BASIC_INFO_TAB: '1',//基本信息
    LOG_TAB: '2'//操作日志
};
const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 352;
class MemberInfo extends React.Component {
    state = {
        isGetMemberDetailLoading: this.props.isGetMemberDetailLoading,
        getMemberDetailErrMsg: this.props.getMemberDetailErrMsg,
        memberInfo: $.extend(true, {}, this.props.memberInfo),
        userBasicDetail: {id: '', createDate: ''},//要传用户的id和用户的创建时间
        modalStr: '',//模态框提示内容
        isDel: false,//是否删除
        userTeamList: MemberFormStore.getState().userTeamList,
        isPasswordInputShow: false,//是否展示修改密码的输入框
        activeKey: TAB_KEYS.BASIC_INFO_TAB,
        resultType: this.props.resultType,
        errorMsg: this.props.errorMsg,
        salesRoleList: [], // 职务列表
        ...MemberInfoStore.getState(),
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'memberInfo.id') && _.get(nextProps, 'memberInfo.id') !== this.state.memberInfo.id) {
            setTimeout(() => {
                this.getUserData(nextProps.memberInfo);
            });
        }
        this.setState({
            memberInfo: $.extend(true, {}, nextProps.memberInfo),
            getMemberDetailErrMsg: nextProps.getMemberDetailErrMsg,
            isGetMemberDetailLoading: nextProps.isGetMemberDetailLoading,
            resultType: nextProps.resultType,
            errorMsg: nextProps.errorMsg,
        });
    }

    onChange = () => {
        this.setState({
            userTeamList: MemberFormStore.getState().userTeamList,
            ...MemberInfoStore.getState()
        });
    };

    componentWillUnmount() {
        MemberInfoStore.unlisten(this.onChange);
        MemberFormStore.unlisten(this.onChange);
    }

    componentDidMount() {
        MemberFormStore.listen(this.onChange);
        MemberInfoStore.listen(this.onChange);
        setTimeout(() => {
            this.getUserData(this.state.memberInfo);
            this.getPositionList(); // 获取职务列表
        });
        let userBasicDetail = this.state.userBasicDetail;
        if (userBasicDetail.id) {
            //获取用户的详情
            MemberManageAction.setUserLoading(true);
            MemberInfoAction.getCurUserById(userBasicDetail);
        }
    }

    getPositionList = () => {
        MemberManageAjax.getSalesPosition().then( (data) => {
            if ( _.isArray(data) && data.length) {
                data.unshift({id: '', name: ''});
            }
            this.setState({
                salesRoleList: data || [],
            });
        }, () => {
            this.setState({
                salesRoleList: [],
            });
        } );
    };
    
    getUserData = (user) => {
        if (user.id) {
            //跟据用户的id获取销售提成和比例
            MemberInfoAction.getSalesGoals({user_id: user.id});
        }

    };

    handleConfirm = (e) => {
        let memberInfo = this.state.memberInfo;
        let modalStr = Intl.get('member.start.this', '启用此');
        if (memberInfo.status === 1) {
            modalStr = Intl.get('member.stop.this', '禁用此');
        }
        Trace.traceEvent(e, '点击确认' + modalStr + '成员');
        let status = 1;
        if (memberInfo.status === 1) {
            status = 0;
        }
        let updateObj = {
            id: _.get(this.state, 'memberInfo.id'),
            status
        };
        MemberManageAction.updateMemberStatus(updateObj);
        // 更新列表中当前修改成员的状态
        MemberManageAction.updateCurrentMemberStatus(status);
        if (memberInfo.id && _.isFunction(this.props.updateMemberStatus)) {
            this.props.updateMemberStatus(updateObj);
        }
    };

    //获取团队下拉列表
    getTeamOptions = () => {
        const userTeamList = this.state.userTeamList;
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
        Trace.traceEvent(ReactDOM.findDOMNode(this), '选择部门');
        let memberInfo = this.state.memberInfo;
        memberInfo.teamId = teamId;
        this.setState({memberInfo});
    };

    cancelEditTeam = () => {
        let memberInfo = this.state.memberInfo;
        memberInfo.teamId = this.props.memberInfo.teamId;
        this.setState({memberInfo});
    };

    //修改的所属团队成功后的处理
    afterEditTeamSuccess = (member) => {
        //更新详情中的所属团队
        let updateTeam = _.find(this.state.userTeamList, team => team.group_id === member.team);
        if (_.isFunction(this.props.afterEditTeamSuccess)) {
            this.props.afterEditTeamSuccess(member);
        } else {
            MemberManageAction.updateMemberTeam(updateTeam);
            this.props.changeMemberFieldSuccess({...member, teamName: _.get(updateTeam, 'group_name')});
        }
    };

    afterEditRoleSuccess = (user) => {
        //更新详情中的角色
        let roleList = this.props.roleList;
        let curRole = _.find(roleList, role => role.roleId === user.role);
        let roleObj = {roleIds: [_.get(curRole, 'roleId')], roleNames: [_.get(curRole, 'roleName')]};
        MemberManageAction.updateMemberRoles(roleObj); 
        if (_.isFunction(this.props.afterEditRoleSuccess)) {
            this.props.afterEditRoleSuccess(user);
        }
    };

    changeMemberFieldSuccess = (member) => {
        _.isFunction(this.props.changeMemberFieldSuccess) && this.props.changeMemberFieldSuccess(member);
    };

    //渲染角色下拉列表
    getRoleSelectOptions = (memberInfo) => {
        //角色列表
        let roleOptions = [];
        let roleList = this.props.roleList;
        if (_.isArray(roleList) && roleList.length > 0) {
            roleOptions = roleList.map(function(role) {
                return (<Option key={role.roleId} value={role.roleId}>
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
        let memberInfo = this.state.memberInfo;
        memberInfo.roleIds = roleIds;
        this.setState({memberInfo});
    };

    cancelEditRole = () => {
        let memberInfo = this.state.memberInfo;
        memberInfo.roleIds = _.extend([], this.props.memberInfo.roleIds);
        this.setState({memberInfo});
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
        let memberInfo = this.state.memberInfo;
        memberInfo.image = src;
        this.setState({memberInfo, showSaveIconTip: true});
    };

    saveUserIcon = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.upload-img-select'), '保存上传头像');
        this.setState({showSaveIconTip: false});
        let memberInfo = this.state.memberInfo;
        if (memberInfo.image && memberInfo.image !== this.props.memberInfo.image) {
            const updateObj = {id: memberInfo.id, user_logo: memberInfo.image};
            let editObj = {user_id: memberInfo.id, user_logo: memberInfo.image};

            MemberManageAjax.editUser(editObj).then(function(result) {
                //上传成功
                if (result) {
                    message.success(Intl.get('common.upload.success', '上传成功！'));
                    MemberManageAction.afterEditMember(updateObj);
                }
            }, function(errorObj) {
                //上传失败
                message.error(errorObj.message || Intl.get('common.upload.error', '上传失败，请重试!'));
            });
        }
    };

    //切换日志分页时的处理
    changeLogNum = (num) => {
        MemberInfoAction.changeLogNum(num);
        MemberInfoAction.getLogList({
            user_name: this.state.memberInfo.userName,
            num: num,
            page_size: this.state.page_size
        });
    };

    cancelEditIcon = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.upload-img-select'), '取消头像的保存');
        let memberInfo = this.state.memberInfo;
        memberInfo.image = this.props.memberInfo.image;
        this.setState({memberInfo, showSaveIconTip: false});
    };

    //保存修改的成员信息
    saveEditMemberInfo = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存成员${type}的修改`);
        const updateObj = _.cloneDeep(saveObj);
        saveObj.user_id = saveObj.id;
        delete saveObj.id;
        MemberManageAjax.editUser(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.changeMemberFieldSuccess(updateObj);
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
        let memberInfo = this.state.memberInfo || {};
        if (!saveObj.id) {
            delete saveObj.id;//原来未设置过销售目标，则是添加，不需要传id
        }
        saveObj.user_id = memberInfo.id;
        saveObj.user_name = memberInfo.name;
        saveObj.sales_team = memberInfo.teamName;
        saveObj.sales_team_id = memberInfo.teamId;
        MemberManageAjax.setSalesGoals(saveObj).then((result) => {
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
        MemberManageAjax.updateMemberRoles(saveObj).then((result) => {
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
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存成员部门的修改');
        MemberManageAjax.updateMemberTeam(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.afterEditTeamSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };

    // 职务选择事件
    onSelectPosition = (positionId) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '选择职务');
        let memberInfo = this.state.memberInfo;
        memberInfo.positionId = positionId;
        this.setState({memberInfo});
    };

    cancelEditPosition = () => {
        let memberInfo = this.state.memberInfo;
        memberInfo.positionId = this.props.memberInfo.positionId;
        this.setState({memberInfo});
    };
    // 成功保存职务的修改
    afterEditPositionSuccess = (member) => {
        //更新详情中的职务
        let updatePosition = _.find(this.state.salesRoleList, position => position.id === member.position);
        let updateMember = {
            ...member,
            positionName: _.get(updatePosition, 'name')
        };
        if (_.isFunction(this.props.afterEditPositionSuccess)) {
            this.props.afterEditPositionSuccess(updateMember);
        } else {
            MemberManageAction.updateMemberPosition(updatePosition);
            this.props.changeMemberFieldSuccess(updateMember);
        }

    };
    // 保存职务
    saveEditPosition = (saveObj, successFunc, errorFunc) => {
        let position = saveObj.position; // 职务
        let memberId = saveObj.id; // 成员id
        if (position) { // 修改成员的职务
            let reqBody = {
                member_id: memberId,
                teamrole_id: position
            };
            Trace.traceEvent(ReactDOM.findDOMNode(this), '保存职务的修改');
            MemberManageAjax.setMemberPosition(reqBody).then((result) => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    this.afterEditPositionSuccess(saveObj);
                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, (errorMsg) => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        } else { // 成员的职务置空
            Trace.traceEvent(ReactDOM.findDOMNode(this), '成员职务清空');
            MemberManageAjax.clearMemberPosition(memberId).then((result) => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    this.afterEditPositionSuccess({...saveObj, position: ''});
                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, (errorMsg) => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        }
    };

    renderMemberInfoContent = () => {
        let memberInfo = this.state.memberInfo;
        let roleSelectOptions = this.getRoleSelectOptions(memberInfo);
        let roleNames = '', isSales = false;
        if (_.isArray(memberInfo.roleNames) && memberInfo.roleNames.length) {
            if (_.indexOf(memberInfo.roleNames, Intl.get('sales.home.sales', '销售')) > -1) {
                //是否是销售角色
                isSales = true;
            }
            roleNames = memberInfo.roleNames.join(',');
        }
        let roleId = _.get(memberInfo, 'roleIds[0]');
        let length = _.get(memberInfo, 'roleIds.length');
        // 成员详情中的角色设置，由于刚开始做的时候是多选的，现在需要改成单选，在下拉选择框中，展示的是第一个角色
        // 在组件中，有个判断，value !== this.state.value 若是直接选第一个的话，修改后不起作用
        // 当有多个角色时，增加了一个属性判断，忽略修改后的值是否和原值相等的判断
        let ignoreValueIsChangeBeforeSave = length > 1 ? true : false;
        // 职务的下拉列表
        let positionOptions = _.map(this.state.salesRoleList, item => {
            if(item.name) {
                return <Option value={item.id} >{item.name}</Option>;
            } else {
                return <Option value='' >&nbsp;</Option>;
            }
        });
        return (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('common.role', '角色')}:
                    </span>

                    <BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        id={memberInfo.id}
                        displayText={roleNames}
                        value={roleId}
                        field="role"
                        selectOptions={roleSelectOptions}
                        hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_ROLE')}
                        validators={[{
                            required: true,
                            message: Intl.get('member.select.role', '请选择角色'),
                        }]}
                        placeholder={Intl.get('member.select.role', '请选择角色')}
                        onSelectChange={this.selectRole}
                        cancelEditField={this.cancelEditRole}
                        saveEditSelect={this.saveEditRoles.bind(this)}
                        noDataTip={Intl.get('member.no.role', '暂无角色')}
                        addDataTip={Intl.get('user.setting.roles', '设置角色')}
                        ignoreValueIsChangeBeforeSave={ignoreValueIsChangeBeforeSave}
                    />
                </div>
                {/** v8环境下，不显示所属团队*/}
                { !Oplate.hideSomeItem ? (
                    <div className="basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('operation.report.department', '部门')}:
                        </span>
                        <BasicEditSelectField
                            id={memberInfo.id}
                            displayText={memberInfo.teamName}
                            value={memberInfo.teamId}
                            field="team"
                            selectOptions={this.getTeamOptions()}
                            placeholder={Intl.get('contract.67', '请选择部门')}
                            validators={[{message: Intl.get('contract.67', '请选择部门')}]}
                            onSelectChange={this.onSelectTeam}
                            cancelEditField={this.cancelEditTeam}
                            width={EDIT_FEILD_LESS_WIDTH}
                            hasEditPrivilege={hasPrivilege('USER_MANAGE_EDIT_USER')}
                            saveEditSelect={this.saveEditTeam.bind(this)}
                            noDataTip={Intl.get('contract.68', '暂无部门')}
                            addDataTip={Intl.get('organization.add.department', '添加部门')}
                        />
                    </div>) : null }
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('member.position', '职务')}:</span>
                    <BasicEditSelectField
                        id={memberInfo.id}
                        displayText={memberInfo.positionName}
                        value={memberInfo.positionId}
                        field="position"
                        selectOptions={positionOptions}
                        placeholder={Intl.get('member.select.position', '请选择职务')}
                        validators={[{message: Intl.get('member.select.position', '请选择职务')}]}
                        onSelectChange={this.onSelectPosition}
                        cancelEditField={this.cancelEditPosition}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasPrivilege('MEMBER_TEAM_ROLE_MANAGE')}
                        saveEditSelect={this.saveEditPosition.bind(this)}
                        noDataTip={Intl.get('member.no.position', '暂无职务')}
                        addDataTip={Intl.get('member.add.position', '添加职务')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('member.create.time', '创建时间')}:</span>
                    <BasicEditDateField
                        width={EDIT_FEILD_WIDTH}
                        id={memberInfo.id}
                        field="createDate"
                        value={memberInfo.createDate ? moment(memberInfo.createDate).format(oplateConsts.DATE_FORMAT) : ''}
                        hasEditPrivilege={false}
                    />
                </div>
            </div>
        );
    };

    renderSalesContent() {
        let commissionRadio = '';
        let recordId = '';
        let saleGoalsAndCommissionRadio = this.state.saleGoalsAndCommissionRadio;
        let newCommissionRatio = '';
        let renewalCommissionRatio = '';
        let goal = '';
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
        if (saleGoalsAndCommissionRadio.goal || saleGoalsAndCommissionRadio.goal === 0) {
            //销售目标
            goal = saleGoalsAndCommissionRadio.goal;
        }
        return (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('member.sale.goal', '个人销售目标')}:</span>
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
                </div>
                <RadioCard
                    id={recordId}
                    commissionRadio={commissionRadio}
                    newCommissionRatio={newCommissionRatio}
                    renewalCommissionRatio={renewalCommissionRatio}
                    memberInfo={this.state.memberInfo}
                    setSalesGoals={MemberManageAjax.setSalesGoals}
                />
            </div>
        );
    }

    renderContactContent() {
        let memberInfo = this.state.memberInfo;
        return (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('user.phone', '手机号')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={memberInfo.id}
                        value={memberInfo.phone}
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
                        id={memberInfo.id}
                        value={memberInfo.email}
                        afterTextTip={`(${memberInfo.emailEnable ? Intl.get('common.actived', '已激活') : Intl.get('member.not.actived', '未激活')})`}
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

    renderMemberStatus(memberInfo) {
        let loginUserInfo = UserData.getUserData();
        //自己不能停用自己
        if (memberInfo.id === loginUserInfo.user_id) {
            return null;
        }

        return (
            <div className="status-switch-container">
                <StatusWrapper
                    errorMsg={this.state.resultType === 'error' && this.state.errorMsg}
                    size='small'
                >
                    <MemberStatusSwitch
                        title={Intl.get('member.status.eidt.tip', '确定要{status}该成员？', {
                            status: memberInfo.status === 0 ? Intl.get('common.enabled', '启用') :
                                Intl.get('common.stop', '停用')
                        })}
                        handleConfirm={this.handleConfirm}
                        status={memberInfo.status}
                    />
                </StatusWrapper>
            </div>
        );
    }

    renderTitle() {
        let memberInfo = this.state.memberInfo;
        const TITLE_INPUT_WIDTH = 270;
        return (
            <div className="member-detail-title">
                <Popconfirm title={Intl.get('member.save.logo.tip', '是否保存上传的头像？')}
                    visible={this.state.showSaveIconTip}
                    onConfirm={this.saveUserIcon} onCancel={this.cancelEditIcon}>
                    <HeadIcon headIcon={memberInfo.image}
                        isEdit={true}
                        onChange={this.uploadImg}
                        userName={memberInfo.userName || ''}
                        isUserHeadIcon={true}
                    />
                </Popconfirm>
                {this.state.isPasswordInputShow ? (
                    <div className="password-edit-container">
                        <BasicEditInputField
                            ref="password"
                            width={TITLE_INPUT_WIDTH}
                            id={memberInfo.id}
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
                            id={memberInfo.id}
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
                    <div className="member-name-container">
                        <div className="member-info-label">
                            {memberInfo.userName || ''}
                        </div>
                        <div className="member-info-label member-name-label">
                            <BasicEditInputField
                                width={TITLE_INPUT_WIDTH}
                                id={memberInfo.id}
                                value={memberInfo.name}
                                field="nick_name"
                                type="text"
                                validators={[nameLengthRule]}
                                placeholder={Intl.get('crm.90', '请输入姓名')}
                                hasEditPrivilege={hasPrivilege('UPDATE_MEMBER_BASE_INFO')}
                                saveEditInput={this.saveEditMemberInfo.bind(this, 'nick_name')}
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
                    {this.renderMemberStatus(memberInfo)}
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
        if (this.state.isGetMemberDetailLoading) {
            return (<Spinner/>);
        } else {
            var memberInfo = this.state.memberInfo;
            let isSales = false;
            if (_.isArray(memberInfo.roleNames) && memberInfo.roleNames.length) {
                if (_.indexOf(memberInfo.roleNames, Intl.get('sales.home.sales', '销售')) > -1) {
                    //是否是销售角色
                    isSales = true;
                }
            }

            return (
                <div className="member-detail-basic-container" style={{height: this.getContainerHeight()}}>
                    <GeminiScrollbar>
                        <div className="member-detail-basic-content">
                            <DetailCard
                                content={this.renderMemberInfoContent()}
                                className='member-info-card-container'
                            />
                            <div className="">
                                {
                                    isSales ? (
                                        <DetailCard
                                            className='radio-container-wrap'
                                            content={this.renderSalesContent()}
                                        />
                                    ) : null
                                }
                            </div>
                            <DetailCard
                                title={Intl.get('crm.5', '联系方式')}
                                content={this.renderContactContent()}
                                className='member-contact-card-container'
                            />
                            {this.props.isContinueAddButtonShow ? (
                                <div className="btn-add-member"
                                    onClick={this.props.showEditForm.bind(null, 'add')}
                                >
                                    <Icon type="plus"/>
                                    <span>
                                        {Intl.get('member.continue.add.member', '继续添加成员')}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </GeminiScrollbar>
                </div>
            );
        }
    }

    renderDetailTabs() {
        let containerHeight = this.getContainerHeight();
        return (
            <Tabs
                defaultActiveKey={TAB_KEYS.BASIC_INFO_TAB}
                activeKey={this.state.activeKey}
                onChange={this.changeActiveKey}
            >
                <TabPane
                    tab={Intl.get('user.basic.info', '基本资料')}
                    key={TAB_KEYS.BASIC_INFO_TAB}
                >
                    {
                        this.state.activeKey === TAB_KEYS.BASIC_INFO_TAB ?
                            <div style={{height: containerHeight}}>
                                {this.renderBasicContent()}
                            </div>
                            : null
                    }
                </TabPane>
                <TabPane
                    tab={Intl.get('member.operation.log', '操作日志')}
                    key={TAB_KEYS.LOG_TAB}
                >
                    {
                        this.state.activeKey === TAB_KEYS.LOG_TAB ? (
                            <MemberLog
                                getContainerHeight={this.getContainerHeight}
                                userName={_.get(this.state, 'memberInfo.userName.value') ||
                                       _.get(this.state, 'memberInfo.userName', '')}
                            />
                        ) : null
                    }
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
MemberInfo.propTypes = {
    memberInfo: PropTypes.object,
    isContinueAddButtonShow: PropTypes.bool,
    deleteCard: PropTypes.func,
    afterEditPositionSuccess: PropTypes.func,
    afterEditTeamSuccess: PropTypes.func,
    afterEditRoleSuccess: PropTypes.func,
    changeMemberFieldSuccess: PropTypes.func,
    updateMemberStatus: PropTypes.func,
    memberInfoShow: PropTypes.bool,
    closeRightPanel: PropTypes.func,
    showEditForm: PropTypes.func,
    isGetMemberDetailLoading: PropTypes.string,
    getMemberDetailErrMsg: PropTypes.string,
    resultType: PropTypes.string,
    errorMsg: PropTypes.string,
    roleList: PropTypes.array,
};
module.exports = MemberInfo;