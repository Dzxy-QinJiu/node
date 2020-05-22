/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/26.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Form, Input, DatePicker, Button, Icon, Radio, Checkbox} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
var classNames = require('classnames');
import PropTypes from 'prop-types';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';

const FORMLAYOUT = {
    PADDINGTOTAL: 60
};
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {
    INNER_SETTING_FLOW,
    APPROVER_TYPE,
    getTeamHigerLevel,
    isSalesOpportunityFlow,
    isBussinessTripFlow,
    isLeaveFlow,
    ROLES_SETTING,
    SETTING_APPLY_APPROVER
} from '../../utils/apply-approve-utils';

require('../../style/add-apply-node.less');
import {isEmail} from 'PUB_DIR/sources/utils/validate-util';

class AddApplyNodePanel extends React.Component {
    constructor(props) {
        super(props);
        var isPreviousNodeCheck = this.isPreviousNodeCheck();
        var isEditNodePanelFlowItemClone = _.cloneDeep(this.props.isEditNodePanelFlowItem);
        var showType = _.get(isEditNodePanelFlowItemClone, 'radioType', '');
        var selectUser = _.get(isEditNodePanelFlowItemClone, 'candidateApprover');
        var showName = _.get(isEditNodePanelFlowItemClone,'showName');
        var higherUser = showType === 'higher_ups' ? selectUser : 'team_0_true';
        this.state = {
            adminApproveHigherLevel: 'higherLevelApproveChecked',
            checkedRadioValue: showType,
            //todo 可否可以多选
            higher_ups: {
                candidateUsers: higherUser.replace('false', 'true'),//上级审批人
                showCandidateUsers: showName || Intl.get('apply.approve.first.higher.level', '直属上级'),//显示的名称
                higherLevelApproveChecked: higherUser.split('_')[2] === 'true' ? true : false,//空缺时由组织中的更上一级审批
                adminApproveChecked: false,//没有审批人的时候由管理员审批
            },
            setting_roles: {
                selectRole: showType === 'setting_roles' ? selectUser : '',//选中的角色
                showSelectRole: showType === 'setting_roles' ? showName : '',
            },
            setting_users: {
                selectUser: showType === 'setting_users' ? selectUser : '',//选中的成员
                showSelectUser: showType === 'setting_users' ? showName : ''
            },
            submitFiles: _.get(isEditNodePanelFlowItemClone, 'submitFiles') === 'true' ? true : false,//可以上传文件
            assignNextNodeApprover: _.get(isEditNodePanelFlowItemClone, 'assignNextNodeApprover') === 'true' ? true : false,//指定下一审批人
            workflowFormEmailToCheck: _.get(isEditNodePanelFlowItemClone, 'workflowFormEmailTo[0]') ? true : false ,
            workflowFormEmailTo: _.get(isEditNodePanelFlowItemClone, 'workflowFormEmailTo',[]),//可以发送邮件
            workflowFormEmailToName: _.get(isEditNodePanelFlowItemClone, 'workflowFormEmailToName',[]),//可发送邮件人的列表（用于页面展示）
            emailValidateErrMsg: '',//邮箱校验的错误提示
            roleList: this.props.roleList,//角色列表
            userList: this.props.userList,//用户列表
            submitErrorMsg: '',//提交时的错误提示
            isPreviousNodeCheck: isPreviousNodeCheck

        };
    }

    componentDidMount() {

    }
    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            userList: nextProps.userList,
            roleList: nextProps.roleList,
        });
    }

    onRadioChange = (event) => {
        //把其他类型的下面的选项都置为空
        var radioValue = event.target.value;
        var allRadioSelect = [];
        _.forEach(APPROVER_TYPE, (item) => {
            if (item.value && item.value !== radioValue) {
                allRadioSelect.push(item.value);
            }
        });
        _.forEach(allRadioSelect, (item) => {
            var radioType = this.state[item];
            for (var key in radioType) {
                if (_.isBoolean(radioType[key])) {
                    radioType[key] = false;
                } else {
                    radioType[key] = '';
                }
            }
        });
        var checkedRadioValue = this.state.checkedRadioValue;
        this.setState({
            checkedRadioValue: radioValue
        });
    };
    onChangeSubmitFilesCheck = (e) => {
        this.setState({
            submitFiles: e.target.checked,
        });
    };
    onChangeAssignNextNodeApprover = (e) => {
        this.setState({
            assignNextNodeApprover: e.target.checked,
        });
    };
    onChangeWorkFlowEmailTo = (e) => {
        this.setState({
            workflowFormEmailToCheck: e.target.checked,
        }, () => {
            if (!e.target.checked) {
                this.setState({
                    workflowFormEmailToName: [],
                    workflowFormEmailTo: [],
                });
            }
        });
    };

    onChangeAdminApproveCheck = (e) => {
        var higher_ups = this.state.higher_ups;
        higher_ups.adminApproveChecked = e.target.checked;
        higher_ups.higherLevelApproveChecked = false;
        this.setState({
            higher_ups: higher_ups
        });
    };
    onChangeHigherLevelCheck = (e) => {
        var higher_ups = this.state.higher_ups;
        higher_ups.higherLevelApproveChecked = e.target.checked;
        higher_ups.adminApproveChecked = false;
        this.setState({
            higher_ups: higher_ups
        });
    };
    getHigherUpByIndex = (index) => {
        var TEAM_HIGHER_LEVEL = getTeamHigerLevel();
        return _.get(TEAM_HIGHER_LEVEL, `[${index}]`);
    };
    handleHigherUpChange = (value) => {
        var higher_ups = this.state.higher_ups;
        var userArr = value.split('-');
        var index = _.get(userArr, '[1]');
        let target = this.getHigherUpByIndex(index);
        if (target) {
            higher_ups.candidateUsers = target.value;
            higher_ups.showCandidateUsers = target.name;
            this.setState({
                higher_ups: higher_ups
            });
        }
    };
    handleChangeSelectRole = (value) => {
        var setting_roles = this.state.setting_roles;
        var userArr = value.split('-');
        var index = _.get(userArr, '[1]');
        var target = _.get(this, `state.roleList[${index}]`);
        if (target) {
            setting_roles.selectRole = target.save_role_value;
            setting_roles.showSelectRole = target.role_name;
            this.setState({
                setting_roles: setting_roles
            });
        }
    };
    getTargetRoleItemByIndex = (index) => {
        return _.get(this, `state.roleList[${index}]`);
    };
    getTargetUserItemByIndex = (index) => {
        return _.get(this, `state.userList[${index}]`);
    };
    handleChangeSelectUser = (value) => {
        var setting_users = this.state.setting_users;
        var userArr = value.split('-');
        var index = _.get(userArr, '[1]');
        var target = this.getTargetUserItemByIndex(index);
        if (target) {
            setting_users.selectUser = target.userId;
            setting_users.showSelectUser = target.nickName;
            this.setState({
                setting_users: setting_users
            });
        }
    };
    handleChangeSelectEmailTo = (valueList) => {
        var {userList} = this.state;
        var emailToName = [];
        var emailValidateErrMsg = '';
        _.forEach(valueList, value => {
            var targetObj = _.find(userList, item => item.userId === value);
            if (!targetObj) {
                if (isEmail(value)) {
                    emailToName.push(value);
                } else {
                    emailValidateErrMsg = Intl.get('common.correct.email', '请输入正确的邮箱');
                }
            } else {
                emailToName.push(_.get(targetObj, 'nickName'));
            }

        });
        this.setState({
            emailValidateErrMsg,
            workflowFormEmailTo: valueList,
            workflowFormEmailToName: _.uniq(emailToName)
        });
    };

    renderAdditonContent = (typeItem, index) => {
        var checkedRadioValue = this.state.checkedRadioValue;
        var TEAM_HIGHER_LEVEL = getTeamHigerLevel();
        if (this.state.checkedRadioValue === typeItem.value) {
            switch (typeItem.value) {
                case 'higher_ups':
                    var higher_ups = this.state.higher_ups;
                    var higherIndex = _.findIndex(TEAM_HIGHER_LEVEL, userItem => userItem.value === _.get(higher_ups, 'candidateUsers'));
                    var higherTarget = this.getHigherUpByIndex(higherIndex);
                    return (
                        <div className="add-higher-up addition-condition">
                            <div className="higher-level-item addition-condition-item">
                                <AntcSelect showSearch
                                    onChange={this.handleHigherUpChange}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                    defaultValue={_.get(higherTarget, 'name') ? _.get(higherTarget, 'name') + '-' + higherIndex : ''}
                                >
                                    {_.map(TEAM_HIGHER_LEVEL, (item, index) => {
                                        return <Option value={item.name + '-' + index} key={index}>{item.name}</Option>;
                                    })}
                                </AntcSelect>
                            </div>
                            <div className="higher-level-item addition-condition-item">
                                <Checkbox checked={higher_ups.higherLevelApproveChecked}
                                    onChange={this.onChangeHigherLevelCheck}>{Intl.get('apply.empty.approve.higher.level', '空缺时，由组织中的更上一级代审批')}</Checkbox>
                            </div>
                            {/*<div className="higher-level-item addition-condition-item">*/}
                            {/*<Checkbox checked={higher_ups.adminApproveChecked}*/}
                            {/*onChange={this.onChangeAdminApproveCheck}>{Intl.get('apply.empty.admin.approve', '没有审批人时，由管理员审批')}</Checkbox>*/}
                            {/*</div>*/}
                        </div>
                    );
                case 'setting_roles' :
                    var setting_roles = this.state.setting_roles;
                    var roleIndex = _.findIndex(this.state.roleList, userItem => userItem.save_role_value === _.get(setting_roles, 'selectRole'));
                    var roleTarget = this.getTargetRoleItemByIndex(roleIndex);
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <AntcSelect showSearch
                                    defaultValue={_.get(roleTarget, 'role_name') ? _.get(roleTarget, 'role_name') + '-' + roleIndex : ''}
                                    onChange={this.handleChangeSelectRole}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(this.state.roleList, (item, index) => {
                                        return <Option value={item.role_name + '-' + index} key={index}>{item.role_name}(
                                            {Intl.get('apply.add.approve.num.person', '{num}人', {num: item.num})})</Option>;
                                    })}
                                </AntcSelect>
                            </div>
                        </div>
                    );
                case 'setting_users' :
                    var setting_users = this.state.setting_users;
                    var userIndex = _.findIndex(this.state.userList, userItem => userItem.userId === _.get(setting_users, 'selectUser'));
                    var userTarget = this.getTargetUserItemByIndex(userIndex);
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <AntcSelect showSearch
defaultValue={_.get(userTarget, 'nickName') ? _.get(userTarget, 'nickName') + '-' + userIndex : ''}
                                    onChange={this.handleChangeSelectUser}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(this.state.userList, (item, index) => {
                                        return <Option value={item.nickName + '-' + index}
                                            key={index}>{item.nickName}</Option>;
                                    })}
                                </AntcSelect>
                            </div>
                        </div>
                    );
            }
        }
    };
    handleSubmitAddApproveNode = () => {
        var radioValue = this.state.checkedRadioValue, submitObj = {}, errTip = true, submitErrorMsg = '';
        if (radioValue) {
            switch (radioValue) {
                case 'higher_ups':
                    var higher_ups = this.state.higher_ups;
                    if (higher_ups.candidateUsers) {
                        submitObj.candidateApprover = higher_ups.candidateUsers;
                        submitObj.showName = higher_ups.showCandidateUsers;
                        if (_.isBoolean(higher_ups.higherLevelApproveChecked)) {
                            submitObj.higherLevelApproveChecked = higher_ups.higherLevelApproveChecked;
                            var approveArr = submitObj.candidateApprover.split('_');
                            if (submitObj.higherLevelApproveChecked) {
                                approveArr[_.get(approveArr, 'length') - 1] = 'true';
                            } else {
                                approveArr[_.get(approveArr, 'length') - 1] = 'false';
                            }
                            submitObj.candidateApprover = approveArr.join('_');
                        }
                        if (_.isBoolean(higher_ups.adminApproveChecked)) {
                            submitObj.adminApproveChecked = higher_ups.adminApproveChecked;
                            if (submitObj.adminApproveChecked) {
                                var approveArr = submitObj.candidateApprover.split('_');
                                approveArr[_.get(approveArr, 'length') - 1] = 'managers';
                                submitObj.candidateApprover = approveArr.join('_');
                            }
                        }
                        errTip = false;
                    }
                    break;
                case 'setting_roles':
                    var setting_roles = this.state.setting_roles;
                    if (setting_roles.selectRole) {
                        submitObj.candidateApprover = setting_roles.selectRole;
                        submitObj.showName = setting_roles.showSelectRole;
                        errTip = false;
                    }
                    break;
                case 'setting_users':
                    var setting_users = this.state.setting_users;
                    if (setting_users.selectUser) {
                        submitObj.candidateApprover = setting_users.selectUser;
                        submitObj.showName = setting_users.showSelectUser;
                        submitObj.hideBrack = true;//如果是指定成员的话，不需要加$符号
                        errTip = false;
                    }
                    break;
                default:
                    submitObj.candidateApprover = radioValue;
                    var target = _.find(APPROVER_TYPE, item => item.value === radioValue);
                    submitObj.showName = target.name;
                    errTip = false;
            }
        } else {
            //如果上一节点是指定审批人
            if (this.state.isPreviousNodeCheck) {
                submitObj.candidateApprover = SETTING_APPLY_APPROVER.value;
                submitObj.showName = SETTING_APPLY_APPROVER.label;
                errTip = false;
            }

        }
        if (this.state.workflowFormEmailToCheck) {
            if (!_.get(this.state.workflowFormEmailTo, '[0]')) {
                errTip = true;
                submitErrorMsg = Intl.get('apply.approved.select.receive.email', '请选择接收邮件的成员或邮箱');
            }
        }
        if (!errTip) {
            submitObj.radioType = radioValue;
            //可上传文件
            submitObj.submitFiles = this.state.submitFiles;
            //可以指定下一节点审批人
            submitObj.assignNextNodeApprover = this.state.assignNextNodeApprover;
            //可分配销售
            // submitObj.distributeSales = this.state.distributeSales;
            //邮件是否抄送给对应的人
            if (this.state.workflowFormEmailToCheck && _.get(this.state.workflowFormEmailTo, '[0]')) {
                submitObj.workflowFormEmailTo = this.state.workflowFormEmailTo;//邮件所抄送给人的列表
                var workflowFormEmailToName = [];
                _.forEach(this.state.workflowFormEmailToName, value => {
                    var targetObj = _.find(this.state.userList, item => item.userId === value);
                    if (targetObj) {
                        workflowFormEmailToName.push(_.get(targetObj, 'nickName'));
                    } else {
                        workflowFormEmailToName.push(value);
                    }
                });
                submitObj.workflowFormEmailToName = workflowFormEmailToName;//在页面上显示的抄送人
            }else{
                submitObj.workflowFormEmailTo = [];
                submitObj.workflowFormEmailToName = [];
            }
            this.props.saveAddApproveNode(submitObj,this.props.isEditNodePanelFlowItem);
            this.props.hideRightPanel();
        } else {
            this.setState({
                submitErrorMsg: submitErrorMsg || Intl.get('apply.select.approver.type', '请选择审批人类型')
            });
        }


    };
    //上一节点是否选择了指定下一节点审批人
    isPreviousNodeCheck = () => {
        var hideType = false;
        var applyRulesAndSetting = _.get(this, 'props.applyRulesAndSetting.applyApproveRules');
        var addNodePanelFlow = this.props.addNodePanelFlow;
        if (applyRulesAndSetting && _.isObject(applyRulesAndSetting[addNodePanelFlow]) && _.isArray(applyRulesAndSetting[addNodePanelFlow]['bpmnNode'])) {
            //如果是之前已经添加过的流程，最后一个节点是结束的节点，那就要看倒数第二个是不是指定了需要
            var bpmnNodeArr = applyRulesAndSetting[addNodePanelFlow]['bpmnNode'];
            var lastNode = _.last(bpmnNodeArr);
            if (lastNode) {
                if (lastNode.type === 'EndEvent') {
                    var arrLength = bpmnNodeArr.length - 2;
                    if (arrLength > -1) {
                        lastNode = _.get(bpmnNodeArr, `[${arrLength}]`);
                    } else {
                        lastNode = null;
                    }

                }
                if (lastNode && lastNode.assignNextNodeApprover + '' === 'true') {
                    hideType = true;
                }

            }
        }
        return hideType;
    };

    render() {
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        var {workflowFormEmailTo} = this.state;
        var emailArr = [];
        _.forEach(workflowFormEmailTo, emailItem => {
            var userTarget = _.find(this.state.userList, userItem => userItem.email === emailItem);
            if (userTarget) {
                emailArr.push(userTarget.userId);
            } else {
                emailArr.push(emailItem);
            }
        });

        return (
            <RightPanel showFlag={true} data-tracename="添加审批人节点" className="add-apply-approver-container">
                <div className="add-apply-node-wrap">
                    <BasicData
                        clueTypeTitle={_.isEmpty(this.props.isEditNodePanelFlowItem) ? Intl.get('apply.add.apply.approver', '添加审批人') : Intl.get('apply.edit.apply.approver','修改审批节点')}
                    />
                    <div className="add-apply-node-item " style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            {/*如果上一节点已经勾选了指定下一审批人，那么下一节点添加的时候就不展示类型了*/}

                            <div className="add-apply-form ant-row ant-form-item">
                                <label className="ant-form-item-label ">
                                    {Intl.get('common.type', '类型')}
                                </label>
                                <div className="add-node-content ant-form-item-control-wrapper">
                                    {this.state.isPreviousNodeCheck ? <span>{SETTING_APPLY_APPROVER.label}</span> :
                                        <RadioGroup onChange={this.onRadioChange} value={this.state.checkedRadioValue}>
                                            {_.map(APPROVER_TYPE, (typeItem, index) => {
                                                return (
                                                    <div>
                                                        <Radio value={typeItem.value}>{typeItem.name}</Radio>
                                                        {this.renderAdditonContent(typeItem, index)}
                                                    </div>
                                                );

                                            })}
                                        </RadioGroup>}
                                </div>
                            </div>
                            <div className="add-apply-form ant-row ant-form-item">
                                <label className="ant-form-item-label ">
                                    {Intl.get('crm.186', '其他')}
                                </label>
                                <div className="add-node-content ant-form-item-control-wrapper">
                                    <div>
                                        <Checkbox
                                            checked={this.state.submitFiles}
                                            onChange={this.onChangeSubmitFilesCheck}
                                        >
                                            {Intl.get('apply.add.approver.submit.files', '可提交文件')}
                                        </Checkbox>
                                    </div>
                                    <div>
                                        <Checkbox
                                            checked={this.state.assignNextNodeApprover}
                                            onChange={this.onChangeAssignNextNodeApprover}
                                        >
                                            {Intl.get('apply.add.approver.distribute', '指定下一审批人')}
                                        </Checkbox>
                                    </div>
                                    <div>
                                        <Checkbox
                                            checked={this.state.workflowFormEmailToCheck}
                                            onChange={this.onChangeWorkFlowEmailTo}
                                        >
                                            {Intl.get('apply.approved.receive.email', '接收邮件人员或邮箱')}
                                        </Checkbox>
                                        {this.state.workflowFormEmailToCheck ?
                                            <div>
                                                <AntcSelect
                                                    defaultValue={emailArr}
                                                    mode="tags"
                                                    tokenSeparators={[',']}
                                                    onChange={this.handleChangeSelectEmailTo}
                                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                                    {_.map(this.state.userList, (item, index) => {
                                                        return <Option value={item.userId}
                                                            key={index}>{item.nickName}</Option>;
                                                    })}
                                                </AntcSelect>
                                                {this.state.emailValidateErrMsg ? <div
                                                    className='validate-err-msg'>{this.state.emailValidateErrMsg}</div> : null}
                                            </div>
                                            : null}
                                    </div>
                                </div>
                            </div>
                            <SaveCancelButton
                                handleSubmit={this.handleSubmitAddApproveNode}
                                handleCancel={this.props.hideRightPanel}
                                saveErrorMsg={this.state.submitErrorMsg}
                            />
                        </GeminiScrollbar>
                    </div>
                </div>

            </RightPanel>
        );
    }
}

AddApplyNodePanel.defaultProps = {
    hideRightPanel: function() {

    },
    saveAddApproveNode: function() {

    },

    applyRulesAndSetting: {},
    addNodePanelFlow: '',
    isEditNodePanelFlowItem: {},
    roleList: [],
    userList: []


};
AddApplyNodePanel.propTypes = {
    hideRightPanel: PropTypes.func,
    saveAddApproveNode: PropTypes.func,
    applyRulesAndSetting: PropTypes.object,
    addNodePanelFlow: PropTypes.string,
    isEditNodePanelFlowItem: PropTypes.object,
    roleList: PropTypes.array,
    userList: PropTypes.array
};
export default Form.create()(AddApplyNodePanel);
