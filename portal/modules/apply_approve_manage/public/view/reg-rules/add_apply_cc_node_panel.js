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
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
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
//用户昵称和index直接的链接用&& 间隔
const CONNECTNAMEANDINDEX = '&&';
class AddApplyNodePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedRadioValue: '',
            //可以多选
            teamowner_range: {
                candidateUsers: [],//上级审批人
                showCandidateUsers: [],//显示的名称
            },
            teammanager_range: {
                selectSecretry: '',//选中的舆情秘书
                showSelectSecretry: []//只能单选，但是后端存储show_name的时候只能是一种类型，就只能用数组
            },
            teammember_range: {
                selectUser: '',//选中的成员
                showSelectUser: []//只能单选，但是后端存储show_name的时候只能是一种类型，就只能用数组
            },
            //可以多选
            system_roles: {
                selectRole: [],//选中的角色
                showSelectRole: [],
            },
            //可选择用户，可以多选
            setting_users: {
                selectUser: [],
                showSelectUser: [],
            },
            roleList: this.props.roleList,//角色列表
            userList: this.props.userList,//用户列表
            submitErrorMsg: '',//提交时的错误提示
            higherUpLists: this.getHigherLevelLists()

        };
    }

    componentDidMount() {
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            roleList: nextProps.roleList,
            userList: nextProps.userList,
        });
    }
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
                    if (item === 'teamowner_range' || item === 'system_roles') {
                        radioType[key] = [];
                    } else {
                        radioType[key] = '';
                    }

                }
            }
        });
        this.setState({
            checkedRadioValue: radioValue
        });
    };

    handleHigherUpChange = (higherUpArr) => {
        var teamowner_range = this.state.teamowner_range;
        teamowner_range.candidateUsers = [];
        teamowner_range.showCandidateUsers = [];
        //如果选择了所有上级，其他级别就不能筛选了
        var higherUpLists = _.cloneDeep(this.getHigherLevelLists());
        var selectHighUp = _.get(higherUpArr, '[0]',''),highUpLists = [];
        if (selectHighUp.indexOf('all_senior_teams') > -1) {
            highUpLists = higherUpLists.slice(0, 1);
            this.setState({
                higherUpLists: highUpLists
            });
        } else if (selectHighUp) {
            highUpLists = higherUpLists.slice(1);
            this.setState({
                higherUpLists: highUpLists
            });
        } else {
            highUpLists = this.getHigherLevelLists();
            this.setState({
                higherUpLists: highUpLists
            });
        }
        _.forEach(higherUpArr, value => {
            var target = _.find(highUpLists, item => item.value === value);
            if (target) {
                teamowner_range.candidateUsers.push(target.value);
                teamowner_range.showCandidateUsers.push(target.name);
                this.setState({
                    teamowner_range: teamowner_range
                });
            }
        });


    };
    //筛选角色
    handleChangeSelectRole = (rolesArr) => {
        var system_roles = this.state.system_roles;
        system_roles.selectRole = [];
        system_roles.showSelectRole = [];
        _.forEach(rolesArr, value => {
            var userArr = value.split(CONNECTNAMEANDINDEX);
            var index = _.get(userArr, '[1]');
            var target = _.get(this, `state.roleList[${index}]`);
            if (target) {
                system_roles.selectRole.push(target.save_role_value);
                system_roles.showSelectRole.push(target.role_name);
                this.setState({
                    system_roles: system_roles
                });
            }
        });
    };
    //筛选用户
    handleChangeSelectUser = (selectUserArr) => {
        var setting_users = this.state.setting_users;
        setting_users.selectUser = [];
        setting_users.showSelectUser = [];
        _.forEach(selectUserArr,value => {
            var userArr = value.split(CONNECTNAMEANDINDEX);
            var index = _.get(userArr,'[1]');
            var target = _.get(this.state,`userList[${index}]`);
            if (target){
                setting_users.selectUser.push(target.userId);
                setting_users.showSelectUser.push(target.nickName);
                this.setState({
                    setting_users
                });
            }
        });
    };
    handleChangeSelectSecretry = (value) => {
        var teammanager_range = this.state.teammanager_range;
        var target = _.find(SECRETRYOPTIONS, item => item.value === value);
        if (value && target) {
            teammanager_range.selectSecretry = value;
            teammanager_range.showSelectSecretry.push(target.name);
            this.setState({
                teammanager_range: teammanager_range
            });
        }
    };
    handleChangeSelectTeamMember = (value) => {
        var teammember_range = this.state.teammember_range;
        var target = _.find(USEROPTIONS, item => item.value === value);
        if (value && target) {
            teammember_range.selectUser = value;
            teammember_range.showSelectUser.push(target.name);
            this.setState({
                teammember_range: teammember_range
            });
        }
    };
    getHigherLevelLists = () => {
        var TEAM_HIGHER_LEVEL = _.cloneDeep(getTeamHigerLevel());
        TEAM_HIGHER_LEVEL.unshift({
            name: Intl.get('apply.condition.node.all.higher.level', '所有上级'),
            value: 'all_senior_teams'
        });
        return TEAM_HIGHER_LEVEL;
    };
    renderAdditonContent = (typeItem, index) => {
        var higherUpLists = this.state.higherUpLists;
        if (this.state.checkedRadioValue === typeItem.value) {
            switch (typeItem.value) {
                case 'teamowner_range':
                    return (
                        <div className="add-higher-up addition-condition">
                            <div className="higher-level-item addition-condition-item">
                                <Select showSearch
                                    mode="multiple"
                                    onChange={this.handleHigherUpChange}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                >
                                    {_.map(higherUpLists, (item, index) => {
                                        return <Option value={item.value} key={index}>{item.name}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'teammanager_range' :
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch
                                    onChange={this.handleChangeSelectSecretry}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(SECRETRYOPTIONS, (item, index) => {
                                        return <Option value={item.value} key={index}>{item.name}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'teammember_range' :
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch
                                    onChange={this.handleChangeSelectTeamMember}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(USEROPTIONS, (item, index) => {
                                        return <Option value={item.value} key={index}>{item.name}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'system_roles' :
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch mode="multiple"
                                    onChange={this.handleChangeSelectRole}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(this.state.roleList, (item, index) => {
                                        return <Option value={item.role_name + CONNECTNAMEANDINDEX + index} key={index}>{item.role_name}(
                                            {Intl.get('apply.add.approve.num.person', '{num}人', {num: item.num})})</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                case 'member_ids':
                    return (
                        <div className="addition-condition">
                            <div className="addition-condition-item">
                                <Select showSearch mode="multiple"
                                    onChange={this.handleChangeSelectUser}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(this.state.userList, (item,index) => {
                                        return <Option value={item.nickName + CONNECTNAMEANDINDEX + index} key={index}>{item.nickName}</Option>;
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
            }
        }
    };
    isShowaddCCType = (ccType) => {
        var notify_configs = _.get(this, 'props.notify_configs');
        var addCCNodePanelFlow = this.props.addCCNodePanelFlow;
        var showFlag = true;
        var targetObj = _.find(notify_configs, item => item.type === addCCNodePanelFlow);
        if (_.get(targetObj,`${ccType}`,'')){
            showFlag = false;
        }
        return showFlag;
    };
    handleSubmitAddApproveNode = () => {
        var radioValue = this.state.checkedRadioValue, submitObj = {}, errTip = true;
        if (radioValue) {
            switch (radioValue) {
                case 'teamowner_range':
                    var teamowner_range = this.state.teamowner_range;
                    if (_.get(teamowner_range,'candidateUsers[0]') ) {
                        submitObj[radioValue] = {
                            show_name: teamowner_range.showCandidateUsers,
                            team_levels: []
                        };
                        _.forEach(teamowner_range.candidateUsers, item => {
                            if(item.indexOf('all_senior_teams') > -1){
                                submitObj[radioValue]['all_senior_teams'] = true;
                                //上级这里要特殊处理一下，选择所有上级的时候也需要把表示直属上级的字段传过去
                                submitObj[radioValue]['team_levels'] = [0];
                            } else if (item.indexOf('team_') > -1){
                                var teamArr = item.split('_');
                                submitObj[radioValue]['team_levels'].push(_.get(teamArr,'[1]'));
                            }
                        });
                        if (_.get(submitObj[radioValue],'team_levels[0]','') === ''){
                            delete submitObj[radioValue]['team_levels'];
                        }
                        errTip = false;
                    }
                    break;
                case 'teammanager_range':
                    var teammanager_range = this.state.teammanager_range;
                    if (teammanager_range.selectSecretry) {
                        submitObj[radioValue] = {
                            show_name: teammanager_range.showSelectSecretry,
                        };
                        if (teammanager_range.selectSecretry === 'team_levels_all_senior_teams') {
                            submitObj[radioValue]['team_levels'] = [0];
                            submitObj[radioValue]['all_senior_teams'] = true;
                        } else if (teammanager_range.selectSecretry === 'all_senior_teams') {
                            submitObj[radioValue]['all_senior_teams'] = true;
                        } else {
                            submitObj[radioValue]['team_levels'] = [0];
                        }
                        errTip = false;
                    }
                    break;
                case 'teammember_range':
                    var teammember_range = this.state.teammember_range;
                    if (teammember_range.selectUser) {
                        submitObj[radioValue] = {
                            show_name: teammember_range.showSelectUser,
                            all_senior_teams: true
                        };
                        errTip = false;
                    }
                    break;
                case 'system_roles':
                    var system_roles = this.state.system_roles;
                    if (_.get(system_roles, 'selectRole[0]', '')) {
                        submitObj[radioValue] = {
                            show_name: system_roles.showSelectRole
                        };
                        _.forEach(system_roles.selectRole, item => {
                            submitObj[radioValue][item] = true;
                        });
                        errTip = false;
                    }
                    break;
                case 'member_ids':
                    var setting_users = this.state.setting_users;
                    if (_.get(setting_users,'selectUser[0]')) {
                        submitObj.member_ids = setting_users.selectUser;
                        errTip = false;
                    }
                    break;
            }


        } else {
        }
        if (!errTip) {
            this.setState({
                submitErrorMsg: ''
            });
            this.props.saveAddCCApproveNode(submitObj);
            this.props.hideRightPanel();
        } else {
            this.setState({
                submitErrorMsg: Intl.get('apply.select.cc.person.type', '请选择抄送人类型')
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
                                            //校验一下是否已经添加过了，如果已经添加了就不能再添加
                                            if(this.isShowaddCCType(typeItem.value)){
                                                return (
                                                    <div>
                                                        <Radio value={typeItem.value}>{typeItem.name}</Radio>
                                                        {this.renderAdditonContent(typeItem, index)}
                                                    </div>
                                                );
                                            }else{
                                                return null;
                                            }
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
    saveAddCCApproveNode: function() {

    },
    notify_configs: [],
    addCCNodePanelFlow: '',
    roleList: [],
    userList: []


};
AddApplyNodePanel.propTypes = {
    hideRightPanel: PropTypes.func,
    saveAddCCApproveNode: PropTypes.func,
    notify_configs: PropTypes.array,
    addCCNodePanelFlow: PropTypes.string,
    roleList: PropTypes.array,
    userList: PropTypes.array,
};
export default Form.create()(AddApplyNodePanel);
