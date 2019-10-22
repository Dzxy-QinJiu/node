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
            checkedRadioValue: '',
            //可以多选
            teamowner_range: {
                candidateUsers: [],//上级审批人
                showCandidateUsers: [],//显示的名称
            },
            teammanager_range: {
                selectSecretry: '',//选中的舆情秘书
                showSelectSecretry: ''
            },
            teammember_range: {
                selectUser: '',//选中的成员
                showSelectUser: ''
            },
            //可以多选
            system_roles: {
                selectRole: [],//选中的角色
                showSelectRole: [],
            },
            roleList: [],//角色列表
            submitErrorMsg: '',//提交时的错误提示
            higherUpLists: this.getHigherLevelLists()

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
                    if (item === 'teamowner_range' || item === 'system_roles'){
                        radioType[key] = [];
                    }else{
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
        //如果选择了所有上级，其他级别就不能筛选了
        var higherUpLists = _.cloneDeep(this.getHigherLevelLists());
        if (_.get(higherUpArr,'[0]') === 'all_senior_teams'){
            this.setState({
                higherUpLists: higherUpLists.slice(0,1)
            });
        }else if(_.get(higherUpArr,'[0]')){
            this.setState({
                higherUpLists: higherUpLists.slice(0,1)
            });
        }else {
            this.setState({
                higherUpLists: this.getHigherLevelLists()
            });
        }
        _.forEach(higherUpArr, value => {
            var userArr = value.split('-');
            var index = _.get(userArr,'[1]');

            var target = _.get(TEAM_HIGHER_LEVEL, `[${index}]`);
            if (target){
                teamowner_range.candidateUsers = target.value;
                teamowner_range.showCandidateUsers = target.name;
                this.setState({
                    teamowner_range: teamowner_range
                });
            }
        });



    };
    //筛选角色
    handleChangeSelectRole = (rolesArr) => {
        var system_roles = this.state.system_roles;
        _.forEach(rolesArr, value => {
            var userArr = value.split('-');
            var index = _.get(userArr,'[1]');
            var target = _.get(this, `state.roleList[${index}]`);
            if (target){
                system_roles.selectRole.push(target.save_role_value);
                system_roles.showSelectRole.push(target.role_name);
                system_roles.selectRole = _.uniq(system_roles.selectRole);
                system_roles.showSelectRole = _.uniq(system_roles.showSelectRole);
                this.setState({
                    system_roles: system_roles
                });
            }
        });
    };
    handleChangeSelectSecretry = (value) => {
        var teammanager_range = this.state.teammanager_range;
        var target = _.find(SECRETRYOPTIONS, item => item.value === value);
        if (value && target){
            teammanager_range.selectSecretry = value;
            teammanager_range.showSelectSecretry = target.name;
            this.setState({
                teammanager_range: teammanager_range
            });
        }
    };
    handleChangeSelectUser = (value) => {
        var teammember_range = this.state.teammember_range;
        var target = _.find(USEROPTIONS, item => item.value === value);
        if (value && target){
            teammember_range.selectUser = value;
            teammember_range.showSelectUser = target.name;
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
                                    {_.map(higherUpLists, (item,index) => {
                                        return <Option value={item.name + '-' + index} key={index}>{item.name}</Option>;
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
                                    {_.map(SECRETRYOPTIONS, (item,index) => {
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
                                    onChange={this.handleChangeSelectUser}
                                    filterOption={(input, option) => ignoreCase(input, option)}>
                                    {_.map(USEROPTIONS, (item,index) => {
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
                case 'teamowner_range':
                    var teamowner_range = this.state.teamowner_range;
                    if (teamowner_range.candidateUsers) {
                        submitObj[radioValue] = {
                            showName: teamowner_range.showCandidateUsers
                        };

                        submitObj.candidateApprover = teamowner_range.candidateUsers;
                        errTip = false;
                    }
                    break;
                case 'teammanager_range':
                    var teammanager_range = this.state.teammanager_range;
                    if (teammanager_range.selectSecretry) {
                        submitObj[radioValue] = {
                            showName: teammanager_range.showSelectSecretry,
                        };
                        _.forEach(teammanager_range.selectSecretry, item => {
                            if (item === 'team_levels_all_senior_teams'){
                                submitObj[radioValue]['team_levels'] = [0];
                                submitObj[radioValue]['all_senior_teams'] = true;
                            }else if (item === 'all_senior_teams'){
                                submitObj[radioValue]['all_senior_teams'] = true;
                            }else{
                                submitObj[radioValue]['team_levels'] = [0];
                            }
                        });
                        errTip = false;
                    }
                    break;
                case 'teammember_range':
                    var teammember_range = this.state.teammember_range;
                    if (teammember_range.selectUser) {
                        submitObj[radioValue] = {
                            showName: teammember_range.showSelectUser,
                            all_senior_teams: true
                        };
                        errTip = false;
                    }
                    break;
                case 'system_roles':
                    var system_roles = this.state.system_roles;
                    if (_.get(system_roles,'selectRole[0]','')) {
                        submitObj[radioValue] = {
                            showName: system_roles.showSelectRole
                        };
                        _.forEach(system_roles.selectRole, item => {
                            submitObj[radioValue][item] = true;
                        });
                        errTip = false;
                    }
                    break;
            }


        } else {


        }
        if (!errTip) {
            submitObj.type = radioValue;
            console.log(submitObj);
            // this.props.saveAddApproveNode(submitObj);
            // this.props.hideRightPanel();
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
