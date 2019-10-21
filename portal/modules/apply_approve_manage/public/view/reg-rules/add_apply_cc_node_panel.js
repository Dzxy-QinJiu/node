/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/26.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Form, Input, Select, DatePicker, Button, Icon, Radio, Checkbox} from 'antd';
const RadioGroup = Radio.Group;
var Option = Select.Option;
import PropTypes from 'prop-types';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
const FORMLAYOUT = {
    PADDINGTOTAL: 60
};
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {
    getTeamHigerLevel,
    ROLES_SETTING,
    CC_SETTINGT_TYPE,
    SECRETRYOPTIONS,
    USEROPTIONS
} from '../../utils/apply-approve-utils';
require('../../style/add-apply-node.less');
class AddApplyNodePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adminApproveHigherLevel: 'higherLevelApproveChecked',
            checkedRadioValue: '',
            //todo 可否可以多选
            higher_ups: {
                candidateUsers: 'team_0_true',//上级审批人
                showCandidateUsers: Intl.get('apply.approve.first.higher.level', '直属上级'),//显示的名称
            },
            team_secretry: {
                selectSecretry: '',//选中的舆情秘书
                showSelectSecretry: ''
            },
            setting_users: {
                selectUser: '',//选中的成员
                showSelectUser: ''
            },
            setting_roles: {
                selectRole: '',//选中的角色
                showSelectRole: '',
            },
            roleList: [],//角色列表
            userList: [],//用户列表
            submitErrorMsg: '',//提交时的错误提示

        };
    }

    componentDidMount() {
        //获取用户列表
        this.getUserList();
    }

    getUserList = () => {
        $.ajax({
            url: '/rest/user',
            dataType: 'json',
            type: 'get',
            data: {cur_page: 1},
            success: (userListObj) => {
                var rolesList = _.get(userListObj, 'roles');
                _.forEach(rolesList, item => {
                    var roleName = item.role_name;
                    var target = _.find(ROLES_SETTING, levelItem => levelItem.name === roleName);
                    if (target){
                        item.save_role_value = target.value;
                    }
                });
                this.setState({
                    roleList: _.filter(rolesList, item => item.save_role_value)//暂时把销售角色先去掉
                });
            },
            error: (xhr, textStatus) => {
                this.setState({
                    roleList: []
                });
            }
        });
    };
    onRadioChange = (event) => {
        //把其他类型的下面的选项都置为空
        var radioValue = event.target.value;
        var allRadioSelect = [];
        _.forEach(CC_SETTINGT_TYPE, (item) => {
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

    handleHigherUpChange = (value) => {
        var higher_ups = this.state.higher_ups;
        var userArr = value.split('-');
        var index = _.get(userArr,'[1]');
        var TEAM_HIGHER_LEVEL = getTeamHigerLevel();
        var target = _.get(TEAM_HIGHER_LEVEL, `[${index}]`);
        if (target){
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
        var index = _.get(userArr,'[1]');
        var target = _.get(this, `state.roleList[${index}]`);
        if (target){
            setting_roles.selectRole = target.save_role_value;
            setting_roles.showSelectRole = target.role_name;
            this.setState({
                setting_roles: setting_roles
            });
        }

    };
    handleChangeSelectSecretry = (value) => {

    };
    handleChangeSelectUser = (value) => {
        var setting_users = this.state.setting_users;
        var userArr = value.split('-');
        var index = _.get(userArr,'[1]');
        var target = _.get(this,`state.userList[${index}]`);
        if (target){
            setting_users.selectUser = target.userId;
            setting_users.showSelectUser = target.nickName;
            this.setState({
                setting_users: setting_users
            });
        }
    };
    renderAdditonContent = (typeItem, index) => {
        var checkedRadioValue = this.state.checkedRadioValue;
        var TEAM_HIGHER_LEVEL = _.cloneDeep(getTeamHigerLevel());
        //todo 加上所有上级选项
        TEAM_HIGHER_LEVEL.unshift({
            name: Intl.get('apply.condition.node.all.higher.level', '所有上级'),
            value: 'alll'
        });

        if (this.state.checkedRadioValue === typeItem.value) {
            switch (typeItem.value) {
                case 'higher_ups':
                    return (
                        <div className="add-higher-up addition-condition">
                            <div className="higher-level-item addition-condition-item">
                                <Select showSearch
                                    mode="multiple"
                                    onChange={this.handleHigherUpChange}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                    defaultValue={TEAM_HIGHER_LEVEL[1].name + '-1'}
                                >
                                    {_.map(TEAM_HIGHER_LEVEL, (item,index) => {
                                        return <Option value={item.name + '-' + index} key={index}>{item.name}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'team_secretry' :
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch
                                    onChange={this.handleChangeSelectSecretry}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(SECRETRYOPTIONS, (item,index) => {
                                        return <Option value={item.value} key={index}>{item.name}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'setting_users' :
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch
                                    onChange={this.handleChangeSelectUser}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(USEROPTIONS, (item,index) => {
                                        return <Option value={item.value} key={index}>{item.name}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'setting_roles' :
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch mode="multiple"
                                    onChange={this.handleChangeSelectRole}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(this.state.roleList, (item,index) => {
                                        return <Option value={item.role_name + '-' + index} key={index}>{item.role_name}(
                                            {Intl.get('apply.add.approve.num.person', '{num}人', {num: item.num})})</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
            }
        }
    };
    handleSubmitAddApproveNode = () => {
        var radioValue = this.state.checkedRadioValue, submitObj = {}, errTip = true;
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
                            if(submitObj.higherLevelApproveChecked){
                                approveArr[_.get(approveArr,'length') - 1] = 'true';
                            }else{
                                approveArr[_.get(approveArr,'length') - 1] = 'false';
                            }
                            submitObj.candidateApprover = approveArr.join('_');
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
                    var target = _.find(CC_SETTINGT_TYPE, item => item.value === radioValue);
                    submitObj.showName = target.name;
                    errTip = false;
            }


        } else {


        }
        if (!errTip) {
            submitObj.radioType = radioValue;

            this.props.saveAddApproveNode(submitObj);
            this.props.hideRightPanel();
        }else{
            this.setState({
                submitErrorMsg: Intl.get('apply.select.approver.type', '请选择审批人类型')
            });
        }



    };


    render() {
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        return (
            <RightPanel showFlag={true} data-tracename="添加审批人节点" className="add-apply-approver-container">
                <div className="add-apply-node-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('apply.add.apply.cc.approver', '添加抄送人')}
                    />
                    <div className="add-apply-node-item " style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-apply-form ant-row ant-form-item">
                                <label className="ant-form-item-label ">
                                    {Intl.get('common.type', '类型')}
                                </label>
                                <div className="add-node-content ant-form-item-control-wrapper">
                                    <RadioGroup onChange={this.onRadioChange} value={this.state.checkedRadioValue}>
                                        {_.map(CC_SETTINGT_TYPE, (typeItem, index) => {
                                            return (
                                                <div>
                                                    <Radio value={typeItem.value}>{typeItem.name}</Radio>
                                                    {this.renderAdditonContent(typeItem, index)}
                                                </div>
                                            );

                                        })}
                                    </RadioGroup>
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
    addNodePanelFlow: ''


};
AddApplyNodePanel.propTypes = {
    hideRightPanel: PropTypes.func,
    saveAddApproveNode: PropTypes.func,
    applyRulesAndSetting: PropTypes.object,
    addNodePanelFlow: PropTypes.string,


    defaultClueData: PropTypes.object,
    clueSourceArray: PropTypes.object,
    updateClueSource: PropTypes.func,
    accessChannelArray: PropTypes.object,
    updateClueChannel: PropTypes.func,
    clueClassifyArray: PropTypes.object,
    updateClueClassify: PropTypes.func,
    afterAddSalesClue: PropTypes.func,
    form: PropTypes.object,
    hideAddForm: PropTypes.func,
    appUserId: PropTypes.string,
    appUserName: PropTypes.string
};
export default Form.create()(AddApplyNodePanel);
