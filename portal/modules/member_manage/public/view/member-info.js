/**
 * Created by wangliping on 2016/11/8.
 */
require('../css/member-info.less');
import {Icon, Select, Popconfirm, message, Tabs, Switch, Col} from 'antd';
const TabPane = Tabs.TabPane;
var Option = Select.Option;
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
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
import {checkPhone, checkQQ, validatorNameRuleRegex, getNumberValidateRule, checkPassword} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import DetailCard from 'CMP_DIR/detail-card';
import Spinner from 'CMP_DIR/spinner';
import { StatusWrapper } from 'antc';
import MemberStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
import MemberRecord from './member-record';
import { storageUtil } from 'ant-utils';
import ajax from 'ant-ajax';
import memberManagePrivilege from '../privilege-const';
import {PasswdStrengthBar} from 'CMP_DIR/password-strength-bar';

const TAB_KEYS = {
    BASIC_INFO_TAB: '1',//基本信息
    LOG_TAB: '2',//操作日志
    RECORD_TAB: '3', // 变更记录
};
const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 352;
const EDIT_PASSWORD_WIDTH = 340;

const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));

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
        //是否显示拨打电话的提示
        isShowCallTip: !_.get(websiteConfig, 'no_show_call_tips'),
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
        // 有销售目标的权限
        if (hasPrivilege(memberManagePrivilege.USER_MANAGE_ADD_SALES_GOAL) && user.id) {
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

    //获取部门下拉列表
    getTeamOptions = () => {
        return _.map(this.state.userTeamList, team => {
            if(team.group_name) {
                return <Option key={team.group_id} value={team.group_id}>
                    {team.group_name}
                </Option>;
            } else {
                return <Option value='' >&nbsp;</Option>;
            }
        });
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
            MemberManageAction.updateMemberTeam(updateTeam);
        } else {
            this.props.changeMemberFieldSuccess({...member, teamName: _.get(updateTeam, 'group_name')});
        }
    };

    afterEditRoleSuccess = (member) => {
        //更新详情中的角色
        let roleList = this.props.roleList;
        let curRole = _.find(roleList, role => role.roleId === member.role);
        let roleObj = {roleIds: [_.get(curRole, 'roleId')], roleNames: [_.get(curRole, 'roleName')]};
        if (_.isFunction(this.props.afterEditRoleSuccess)) {
            MemberManageAction.updateMemberRoles(roleObj);
        } else {
            this.props.changeMemberFieldSuccess({...member, roleNames: _.get(roleObj, 'roleNames')});
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
        const confirmPassword = this.confirmPassWordRef;
        if (confirmPassword && confirmPassword.state.formData.input) {
            confirmPassword.refs.validation.forceValidate();
        }
    };

    onConfirmPasswordDisplayTypeChange = () => {
        this.setState({isPasswordInputShow: false});
        this.passwordRef.setState({displayType: 'text'});
    };

    //对密码 进行校验
    checkPass = (rule, value, callback) => {
        let rePassWord = this.confirmPassWordRef.state.formData.input;
        checkPassword(this.passwordRef, value, callback, rePassWord);
    };

    //对确认密码 进行校验
    checkRePass = (rule, value, callback) => {
        if (value && value === this.passwordRef.state.formData.input) {
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
    // 保存修改的密码
    saveEditPassword = (type, saveObj, successFunc, errorFunc) => {
        if(_.get(this, 'passwordRef.refs.validation')){
            // 密码验证通过后才能调用保存密码的方法(不能设置弱密码)
            this.passwordRef.refs.validation.validate(valid => {
                if (!valid) {
                    this.confirmPassWordRef.setState({loading: false});
                    return;
                }
                this.saveEditMemberInfo(type, saveObj, successFunc, errorFunc);
            });
        }
    }
    //保存修改的成员信息
    saveEditMemberInfo = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存成员${type}的修改`);
        const updateObj = _.cloneDeep(saveObj);
        saveObj.user_id = saveObj.id;
        delete saveObj.id;
        MemberManageAjax.editUser(saveObj).then((result) => {
            if (result) {
                //如果修改的是自己的邮箱，userdata数据更新
                if(_.isEqual(type, 'email')) {
                    let userId = UserData.getUserData().user_id;
                    if(_.isEqual(saveObj.user_id, userId)) {
                        UserData.setUserData('email', saveObj.email);
                        UserData.setUserData('emailEnable', false);
                    }
                }
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
        if (saveObj.team) { // 修改成员的部门
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
        } else { // 清空成员的部门
            MemberManageAjax.clearMemberDepartment(saveObj.id).then((result) => {
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
            MemberManageAction.updateMemberPosition(updatePosition);
        } else {
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

        let loginUserInfo = UserData.getUserData();
        // 自己不能停用自己状态，所以自己查看自己的详情不显示停用时间、启用状态下不显示停用时间
        let isShowDisableDate = memberInfo.status === 1 || memberInfo.id === loginUserInfo.user_id ? false : true;
        let disableDate = _.get(memberInfo, 'disableDate');

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
                        hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
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
                            hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
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
                        hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
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
                {
                    isShowDisableDate ? (
                        <div className="basic-info-item">
                            <span className="basic-info-label">
                                {Intl.get('member.disable.time', '停用时间')}:
                            </span>
                            <BasicEditDateField
                                width={EDIT_FEILD_WIDTH}
                                value={disableDate ? moment(disableDate).format(oplateConsts.DATE_FORMAT) : ''}
                                hasEditPrivilege={false}
                            />
                        </div>
                    ) : null
                }

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
                        validators={[getNumberValidateRule()]}
                        afterTextTip={Intl.get('contract.82', '元')}
                        afterValTip={Intl.get('contract.82', '元')}
                        hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
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
                        hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
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
                        hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
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
                <div className="basic-info-item">
                    <span className="basic-info-label">QQ:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={memberInfo.id}
                        value={memberInfo.qq}
                        field="qq"
                        type="text"
                        hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
                        validators={[{validator: checkQQ}]}
                        placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                        saveEditInput={this.saveEditMemberInfo.bind(this, 'qq')}
                        noDataTip={Intl.get('crm.contact.qq.none', '暂无QQ')}
                        addDataTip={Intl.get('crm.contact.qq.add', '添加QQ')}
                    />
                </div>
            </div>
        );
    }

    //切换tab时的处理
    changeActiveKey = (key) => {
        let keyName = '基本信息';
        if (key === TAB_KEYS.LOG_TAB) {
            keyName = '操作日志';
        } else if (key === TAB_KEYS.RECORD_TAB) {
            keyName = '变更记录';
        }
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
        const name = Intl.get('common.nickname', '昵称');
        return (
            <div className="member-detail-title">
                <Popconfirm title={Intl.get('member.save.logo.tip', '是否保存上传的头像？')}
                    visible={this.state.showSaveIconTip}
                    onConfirm={this.saveUserIcon} onCancel={this.cancelEditIcon}>
                    <HeadIcon 
                        headIcon={memberInfo.image}
                        isEdit={true}
                        onChange={this.uploadImg}
                        userName={memberInfo.userName || ''}
                        isUserHeadIcon={true}
                        isUseDefaultUserImage={true}
                    />
                </Popconfirm>
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
                            validators={[{
                                required: true,
                                message: Intl.get('organization.tree.name.placeholder', '请输入{name}名称', {name: name}),
                            }, validatorNameRuleRegex(50, name)]}
                            placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}
                            hasEditPrivilege={hasPrivilege(memberManagePrivilege.EDIT_MEMBER)}
                            saveEditInput={this.saveEditMemberInfo.bind(this, 'nick_name')}
                            noDataTip={Intl.get('user.nickname.add.tip', '添加昵称')}
                            addDataTip={Intl.get('user.nickname.no.tip', '暂无昵称')}
                        />
                    </div>
                </div>
                <div className="member-title-btns">
                    {
                        hasPrivilege(memberManagePrivilege.EDIT_MEMBER) ? (
                            <div>{this.renderMemberStatus(memberInfo)}</div>
                        ) : null
                    }
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


    //不再提示可以打电话的提示
    handleClickNoCallTip = () => {
        ajax.send({
            url: '/rest/base/v1/user/website/config/personnel',
            type: 'post',
            data: {
                no_show_call_tips: true
            }
        })
            .done(result => {
                this.setState({
                    isShowCallTip: false
                });
            })
            .fail(err => {
                message.error(err);
            });
    }

    // 添加成员成功后的提示信息
    renderAddMemberSuccessTips = () => {
        return (
            <div className="add-member-success-tips">
                <i className="iconfont icon-add-success"></i>
                <span>
                    {Intl.get('member.add.member.success.tips', '该成员登录后可以拨打电话了')}
                </span>
                <span 
                    className="no-longer-tips" 
                    onClick={this.handleClickNoCallTip}
                    title={Intl.get('sale.homepage.no.tip.more', '不再提示')}
                >
                    <i className="iconfont icon-close-tips"></i>
                </span>
            </div>
        );
    }

    renderPasswordContent = (memberInfo) => {
        if (this.state.isPasswordInputShow) {
            return (
                <div className="password-edit-container">
                    <div className="basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('user.password.new.password', '新密码')}
                        </span>
                        <BasicEditInputField
                            ref={ref => this.passwordRef = ref}
                            width={EDIT_PASSWORD_WIDTH}
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
                    </div>
                    <Col span="23">
                        {this.state.passBarShow ?
                            (<PasswdStrengthBar passStrength={this.state.passStrength}/>) : null}
                    </Col>
                    <div className="basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('common.confirm.password', '确认密码')}
                        </span>
                        <BasicEditInputField
                            ref={ref => this.confirmPassWordRef = ref}
                            width={EDIT_PASSWORD_WIDTH}
                            id={memberInfo.id}
                            displayType="edit"
                            field="password"
                            type="password"
                            placeholder={Intl.get('common.input.confirm.password', '请输入确认密码')}
                            validators={[{
                                required: true, message: Intl.get('common.input.confirm.password', '请输入确认密码')
                            }, {validator: this.checkRePass}]}
                            onDisplayTypeChange={this.onConfirmPasswordDisplayTypeChange}
                            saveEditInput={this.saveEditPassword.bind(this, 'password')}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="basic-info-item show-password-text-zone">
                    <span className="basic-info-label">{Intl.get('common.password', '密码')}:</span>
                    <span className="hide-password-text">********</span>
                    <span
                        className="password-change-zone"
                        onClick={this.onPasswordDisplayChange.bind(this)}
                    >
                        {Intl.get('common.edit.password', '修改密码')}
                    </span>
                </div>
            );
        }
    };

    renderBasicContent() {
        if (this.state.isGetMemberDetailLoading) {
            return (<Spinner/>);
        } else {
            let memberInfo = this.state.memberInfo;
            let roleNames = _.get(memberInfo, 'roleNames', []);
            //是否是销售角色
            let isSales = _.find(roleNames, roleName => roleName && roleName.indexOf(Intl.get('sales.home.sales', '销售')) !== -1);
            // 开通营收中心并且有销售目标的权限
            let showSalesGoalPrivilege = isSales && hasPrivilege(memberManagePrivilege.USER_MANAGE_ADD_SALES_GOAL);
            return (
                <div className="member-detail-basic-container" style={{height: this.getContainerHeight()}}>
                    <GeminiScrollbar>
                        <div className="member-detail-basic-content">
                            {
                                this.props.isContinueAddButtonShow && this.state.isShowCallTip ? (
                                    <DetailCard
                                        content={this.renderAddMemberSuccessTips()}
                                        className='member-info-success-tips-card-container'
                                    />
                                ) : null
                            }
                            <DetailCard
                                content={this.renderMemberInfoContent()}
                                className='member-info-card-container'
                            />
                            <div className="">
                                {
                                    showSalesGoalPrivilege ? (
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
                            {
                                hasPrivilege(memberManagePrivilege.EDIT_MEMBER) ? (
                                    <DetailCard
                                        className='password-card-container-wrap'
                                        content={this.renderPasswordContent(memberInfo)}
                                    />
                                ) : null
                            }
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
        const containerHeight = this.getContainerHeight();
        const memberInfo = this.state.memberInfo;
        const memberId = memberInfo.id;
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
                {hasPrivilege(memberManagePrivilege.USER_LOG) ? (
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
                    </TabPane>) : null}
                <TabPane
                    tab={Intl.get('user.change.record', '变更记录')}
                    key={TAB_KEYS.RECORD_TAB}
                >
                    {
                        this.state.activeKey === TAB_KEYS.RECORD_TAB ? (
                            <MemberRecord
                                memberId={memberId}
                                getContainerHeight={this.getContainerHeight}
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