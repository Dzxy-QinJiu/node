/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/29.
 */

import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Form, Input, Menu, Dropdown, Select, DatePicker, Button, Icon, Radio, Checkbox, InputNumber} from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
const RadioGroup = Radio.Group;
var Option = Select.Option;
const FormItem = Form.Item;
var classNames = require('classnames');
import PropTypes from 'prop-types';

const FORMLAYOUT = {
    PADDINGTOTAL: 60
};
import {
    CONDITION_KEYS,
    ALL_COMPONENTS,
    isBussinessTripFlow,
    isLeaveFlow,
    isSalesOpportunityFlow,
    CONDITION_LIMITE, ADDAPPLYFORMCOMPONENTS, ROLES_SETTING
} from '../../utils/apply-approve-utils';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';

require('../../style/add_apply_condition_panel.less');
var uuid = require('uuid/v4');

class AddApplyConditionPanel extends React.Component {
    constructor(props) {
        super(props);
        var applySaveForm = _.get(this, 'props.applyTypeData.customiz_form', []);

        this.state = {
            showAddConditionForm: _.get(this, 'props.updateConditionObj.limitRules[0]') ? true : false,
            diffConditionLists: _.isEmpty(this.props.updateConditionObj) ? {
                conditionTitle: '',
                limitRules: [],
            } : _.cloneDeep(this.props.updateConditionObj),//添加的条件审批数据
            applySaveForm: applySaveForm,
            allConditionList: this.getAllConditionList(applySaveForm),
            userList: this.props.userList,//用户列表
            teamList: this.props.teamList,//团队列表
            setting_users: {
                selectUser: '',//选中的成员
                showSelectUser: ''
            },
            saveErrMsg: ''
        };
    }

    componentDidMount() {

    }
    getAllConditionList = (applySaveForm) => {
        //如果是出差或者请假申请，需要展示时长这个条件
        var applyType = _.get(this, 'props.applyTypeData.type');
        var isShowTimeRange = isBussinessTripFlow(applyType) || isLeaveFlow(applyType);
        var allConditionList = [
            {applyConditionType: ALL_COMPONENTS.TEAM_SEARCH + '_limit',name: Intl.get('user.apply.team', '申请人所属团队')},
            {applyConditionType: ALL_COMPONENTS.USER_SEARCH + '_limit',name: Intl.get('user.apply.presenter', '申请人')}
        ];
        if(isShowTimeRange){
            allConditionList.push({
                applyConditionType: ALL_COMPONENTS.TIME_PERIOD + '_limit',
                name: Intl.get('user.duration', '时长')
            });
        }else{
            _.forEach(applySaveForm,item => {
                var component_type = item.subComponentType || item.component_type;
                var target = this.getConditionRelate(component_type);
                if(target){
                    allConditionList.push(target);
                }
            });
        }
        return allConditionList;
    };

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            userList: nextProps.userList,
            teamList: nextProps.teamList,
        });
    }


    handleAddConditionType = (conditionType) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules', []);
        var target = this.getConditionRelate(conditionType);
        limitRules.push({limitType: _.get(target, 'value'), limitTypeDsc: _.get(target, 'name')});
        this.setState({
            showAddConditionForm: true,
            diffConditionLists: diffConditionLists
        });
    };
    getConditionRelate = (conditionType) => {
        var target = _.find(CONDITION_KEYS, item => item.value.indexOf(conditionType) > -1);
        return target;
    };
    hasAddThisTypeCondition = (type) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules');
        return _.find(limitRules, limit => limit.limitType === type);
    };
    getDiffTypeComponents = () => {
        var allConditionList = this.state.allConditionList;
        //保存的已经添加的表单，是个数组
        //任何流程都要展示选一批人这个筛选条件
        var menus = <Menu>{
            _.map(allConditionList, (item) => {
                var conditionType = _.get(item, 'value');
                if(item.applyConditionType){
                    conditionType = item.applyConditionType;
                }
                if (!this.hasAddThisTypeCondition(conditionType)) {
                    return <Menu.Item>
                        <a onClick={this.handleAddConditionType.bind(this, conditionType)}>{_.get(item, 'name')}</a>
                    </Menu.Item>;
                }
            })
        }
        </Menu>;
        return {
            menus: menus,
            hasNoMenuItem: _.get(allConditionList,'length') === _.get(this.state.diffConditionLists.limitRules,'length')
        };
    };
    renderDiffCondition = () => {
        var menusObj = this.getDiffTypeComponents();
        //如果这个menu中没有子元素就不需要再展示添加条件了
        if (menusObj.hasNoMenuItem) {
            return null;
        } else {
            return (
                <Dropdown overlay={menusObj.menus}>
                    <a className="ant-dropdown-link" href="#">
                        {Intl.get('apply.add.apply.condition', '添加条件')}
                    </a>
                </Dropdown>
            );
        }

    };
    deleteConditionType = (deleteType) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.filter(_.get(diffConditionLists, 'limitRules'), (item) => item.limitType !== deleteType);
        //如果所有条件都删除完了，要展示添加的提示
        if (!_.get(limitRules, 'length')) {
            this.setState({
                showAddConditionForm: false
            });
        }
        diffConditionLists.limitRules = limitRules;
        this.setState({
            diffConditionLists
        });
    };
    handleChangeRangeLimit = (key, subKey, inverseKey, allType, value) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules');
        var target = _.find(limitRules, limit => limit.limitType === key);
        if (target) {
            var limitTarget = _.find(allType, limitItem => limitItem.value === value);
            target[subKey] = value;
            target[subKey + 'Dsc'] = _.get(limitTarget, 'name');
            target[inverseKey] = _.get(limitTarget, inverseKey);
            this.setState({
                diffConditionLists
            });
        }
    };
    //选中用户
    handleChangeSelectUser = (key, subKey, index, userId) => {
        userId = userId.sort();
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules');
        var target = _.find(limitRules, limit => limit.limitType === key);
        if (target) {
            //todo 每个路径都要随机出一个数字作为路径的名称
            target[subKey + 'Route'] = userId.join('');
            target[subKey] = userId;
            var subKeyDsc = [];
            _.forEach(userId, id => {
                var targetObj = _.find(this.state.userList, item => item.userId === id);
                subKeyDsc.push(_.get(targetObj, 'nickName'));
            });
            target[subKey + 'Dsc'] = subKeyDsc;
            this.setState({
                diffConditionLists
            });
        }
    };
    //选中团队
    handleChangeSelectTeam = (key, subKey, index, teamId) => {
        teamId = teamId.sort();
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules');
        var target = _.find(limitRules, limit => limit.limitType === key);
        if (target) {
            //todo 每个路径都要随机出一个数字作为路径的名称
            target[subKey + 'Route'] = teamId.join('');
            target[subKey] = teamId;
            var subKeyDsc = [];
            _.forEach(teamId, id => {
                var targetObj = _.find(this.state.teamList, item => item.group_id === id);
                subKeyDsc.push(_.get(targetObj, 'group_name'));
            });
            target[subKey + 'Dsc'] = subKeyDsc;
            this.setState({
                diffConditionLists
            });
        }
    };
    handleRangeInputChange = (key, subKey, Dsc, e) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules');
        var target = _.find(limitRules, limit => limit.limitType === key);
        if (target) {
            target[subKey] = e.target.value;
            target[subKey + 'Dsc'] = e.target.value + Dsc;
            this.setState({
                diffConditionLists
            });
        }

    };
    handleConditionTitleChange = (e) => {
        var diffConditionLists = this.state.diffConditionLists;
        diffConditionLists['conditionTitle'] = e.target.value;
        this.setState({
            diffConditionLists
        });
    };
    getDiffConditionType = () => {

    };

    renderDiffTypeConditions = () => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules', []);
        return (
            <div className="condition_list_type">
                {_.map(limitRules, (value, index) => {
                    var limitType = value.limitType;
                    var target = this.getConditionRelate(limitType);
                    switch (limitType) {
                        case ALL_COMPONENTS.TIME_PERIOD + '_limit':
                            return (<div className="condition-type-container range-condition-container">
                                <div className="condition-type-title">
                                    {_.get(target, 'name')}
                                    <i className="iconfont icon-delete handle-btn-item"
                                        onClick={this.deleteConditionType.bind(this, limitType)}></i>
                                </div>
                                <div className="condition-type-content">
                                    <Select
                                        value={_.get(value, 'rangeLimit')}
                                        onChange={this.handleChangeRangeLimit.bind(this, limitType, 'rangeLimit', 'inverseCondition', CONDITION_LIMITE)}
                                    >
                                        {_.map(CONDITION_LIMITE, (item, index) => {
                                            return (<Option key={index} value={item.value}>{item.name}</Option>);
                                        })}
                                    </Select>
                                    <Input
                                        value={_.get(value, 'rangeNumber')}
                                        onChange={this.handleRangeInputChange.bind(this, limitType, 'rangeNumber', Intl.get('common.time.unit.day', '天'))}
                                        addonAfter={Intl.get('common.time.unit.day', '天')}/>
                                </div>
                            </div>);
                        case ALL_COMPONENTS.USER_SEARCH + '_limit':
                            return (
                                <div className="condition-type-container user-condition-container">
                                    <div className="condition-type-title">
                                        {_.get(target, 'name')}
                                        <i className="iconfont icon-delete handle-btn-item"
                                            onClick={this.deleteConditionType.bind(this, limitType)}></i>
                                    </div>
                                    <div className="condition-type-content user-range-content">
                                        <Select
                                            value={_.get(value, 'userRange')}
                                            showSearch
                                            mode="multiple"
                                            onChange={this.handleChangeSelectUser.bind(this, limitType, 'userRange', index)}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                            getPopupContainer={() => document.getElementById('add_apply_condition')}
                                        >
                                            {_.map(this.state.userList, (item, index) => {
                                                return <Option value={item.userId} key={index}>{item.nickName}</Option>;
                                            })}
                                        </Select>
                                    </div>
                                </div>
                            );
                        case ALL_COMPONENTS.TEAM_SEARCH + '_limit':
                            return (
                                <div className="condition-type-container user-condition-container">
                                    <div className="condition-type-title">
                                        {_.get(target, 'name')}
                                        <i className="iconfont icon-delete handle-btn-item"
                                            onClick={this.deleteConditionType.bind(this, limitType)}></i>
                                    </div>
                                    <div className="condition-type-content user-range-content">
                                        <Select
                                            value={_.get(value, 'teamRange')}
                                            showSearch
                                            mode="multiple"
                                            onChange={this.handleChangeSelectTeam.bind(this, limitType, 'teamRange', index)}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                            getPopupContainer={() => document.getElementById('add_apply_condition')}
                                        >
                                            {_.map(this.state.teamList, (item, index) => {
                                                return <Option value={item.group_id} key={index}>{item.group_name}</Option>;
                                            })}
                                        </Select>
                                    </div>
                                </div>
                            );
                    }

                })}
            </div>
        );
    };
    //选择了用户筛选，没有选择用户名
    checkUserSearch = (item) => {
        return item.limitType === ALL_COMPONENTS.USER_SEARCH + '_limit' && _.isEmpty(item.userRange);
    };
    checkTeamSearch = (item) => {
        return item.limitType === ALL_COMPONENTS.TEAM_SEARCH + '_limit' && _.isEmpty(item.teamRange);
    };
    checkTimePeriod = (item) => {
        return item.limitType === ALL_COMPONENTS.TIME_PERIOD + '_limit' && (_.isEmpty(item.rangeLimit) || _.isEmpty(item.rangeNumber));
    };
    showErrTip = () => {
        this.setState({
            saveErrMsg: Intl.get('apply.approve.not.full.condition','请完善条件后再保存')
        });
    };
    handleSubmitCondition = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            var submitObj = _.cloneDeep(this.state.diffConditionLists);
            if(_.isEmpty(submitObj.limitRules)){
                this.showErrTip();
                return;
            }
            var checkFlag = true;//对所加的限制条件进行校验，看是否有选择具体的限制值
            _.forEach(_.get(submitObj, 'limitRules'), (item) => {
                var target = this.getConditionRelate(item.limitType);
                if(this.checkUserSearch(item) || this.checkTeamSearch(item) || this.checkTimePeriod(item)){
                    checkFlag = false;
                }else{
                    target.conditionRule(item);//生成随机的流程的key和对应的userIds的数组
                }

            });
            if(checkFlag){
                if (this.props.updateConditionFlowKey) {
                    submitObj.updateConditionFlowKey = this.props.updateConditionFlowKey;
                }
                this.props.saveAddApprovCondition(submitObj);
                this.props.hideRightPanel();
            }else{
                this.showErrTip();
            }

        });
    };

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveErrMsg: '',
        });
    };
    render() {
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        const {getFieldDecorator} = this.props.form;
        var _this = this;
        return (
            <RightPanel showFlag={true} data-tracename="添加条件审批流程" className="add-apply-condition-container">
                <div className="add-apply-condition-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('apply.add.condition.process', '添加条件审批流程')}
                    />
                    <div className="add-apply-form-wrap" style={{'height': divHeight}}>
                        <GeminiScrollbar>
                            <div className="add-apply-form">
                                <Form layout='horizontal' className="add_apply_condition" id="add_apply_condition">

                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('common.definition', '名称')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('condition_name', {
                                            initialValue: _.get(this, 'state.diffConditionLists.conditionTitle'),
                                            rules: [{required: true, message: Intl.get('apply.add.reg.name', '请填写名称')}],
                                        })(
                                            <Input onChange={this.handleConditionTitleChange}/>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        className="form-item-label"
                                        label={Intl.get('apply.add.qualify.condition', '满足条件')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('condition_qualifily')(
                                            <div>
                                                {_this.state.showAddConditionForm ? _this.renderDiffTypeConditions() : null}
                                                {_this.renderDiffCondition()}
                                            </div>
                                        )}
                                    </FormItem>
                                    <div className="submit-button-container">
                                        <SaveCancelButton loading={this.state.isSaving}
                                            saveErrorMsg={this.state.saveErrMsg}
                                            handleSubmit={this.handleSubmitCondition}
                                            handleCancel={this.props.hideRightPanel}
                                            errorShowTime={3000}
                                            hideSaveTooltip={this.hideSaveTooltip}
                                        />
                                    </div>
                                </Form>
                            </div>
                        </GeminiScrollbar>
                    </div>
                </div>
            </RightPanel>
        );
    }
}

AddApplyConditionPanel.defaultProps = {
    hideRightPanel: function() {

    },
    saveAddApprovCondition: function() {

    },
    applyTypeData: {},
    updateConditionObj: {},
    updateConditionFlowKey: '',
    userList: [],
    roleList: [],
    teamList: [],

};
AddApplyConditionPanel.propTypes = {
    hideRightPanel: PropTypes.func,
    saveAddApprovCondition: PropTypes.func,
    applyTypeData: PropTypes.object,
    updateConditionObj: PropTypes.object,
    updateConditionFlowKey: PropTypes.string,
    form: PropTypes.object,
    roleList: PropTypes.array,
    userList: PropTypes.array,
    teamList: PropTypes.array,
};
export default Form.create()(AddApplyConditionPanel);
