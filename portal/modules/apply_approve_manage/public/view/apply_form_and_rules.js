/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('../style/add_apply_form.less');
import {Tabs, Input,Form,Button} from 'antd';
const TabPane = Tabs.TabPane;
import NoDataIntro from 'CMP_DIR/no-data-intro';
const TAB_KEYS = {
    FORM_CONTENT: '1',//表单内容
    APPLY_RULE: '2'//审批规则
};
import Trace from 'LIB_DIR/trace';
var classNames = require('classnames');
import {
    calculateHeight,
    APPLYAPPROVE_LAYOUT,
    ALL_COMPONENTS,
    ALL_COMPONENTS_TYPE,
    ADDAPPLYFORMCOMPONENTS,
    ROLES_SETTING
} from '../utils/apply-approve-utils';
import ComponentEdit from './basic-components/component-edit';
import ComponentShow from './basic-components/component-show';
import ApplyRulesView from './reg-rules/reg_rules_view';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
var applyApproveManageAction = require('../action/apply_approve_manage_action');
let userData = require('PUB_DIR/sources/user-data');
var uuid = require('uuid/v4');
import ApplyApproveManageStore from '../store/apply_approve_manage_store';
import Spinner from 'CMP_DIR/spinner';
import {getMyTeamTreeAndFlattenList, getTeamTreeMemberLists} from 'PUB_DIR/sources/utils/common-data-util';
class ApplyFormAndRules extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: '',
            isEdittingApplyName: false,//正在修改申请审批的标题
            updateApplyName: '',//修改后标题的名称
            applyTypeData: {},//编辑某个审批的相关数据
            roleList: [],
            userList: [],
            teamList: [],
            ...ApplyApproveManageStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(ApplyApproveManageStore.getState());
    };
    componentDidMount = () => {
        //如果还没有配置过，就只有一个默认的规则
        ApplyApproveManageStore.listen(this.onStoreChange);
        //获取用户列表
        this.getUserList();
        //获取所有团队列表
        this.getTeamList();
        //请求展示内容
        this.getSelfSettingWorkFlow(this.props.applyTypeId);
    };
    //获取团队列表
    getTeamList = () => {
        getMyTeamTreeAndFlattenList(data => {
            this.setState({
                teamList: data.teamList || []
            });
        });
    };
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
                    if (target) {
                        item.save_role_value = target.value;
                    }
                });
                this.setState({
                    userList: _.get(userListObj, 'data'),
                    roleList: _.filter(rolesList, item => item.save_role_value)//暂时把销售角色先去掉
                });
            },
            error: (xhr, textStatus) => {
                this.setState({
                    roleList: [],
                    userList: []
                });
            }
        });
    };
    componentWillUnmount(){
        ApplyApproveManageStore.unlisten(this.onStoreChange);
    }
    //请求并展示审批流程
    getSelfSettingWorkFlow = (recordId) => {
        let submitObj = {page_size: 1, id: recordId};
        let newUserData = userData.getUserData().workFlowConfigs;
        applyApproveManageAction.getSelfSettingWorkFlow(submitObj, (data) => {
            this.changeNewFlow(newUserData,recordId,data);
            if (data[0]) {
                this.setState({
                    applyTypeData: data[0],
                    activeKey: _.get(data[0], 'customiz') ? TAB_KEYS.FORM_CONTENT : TAB_KEYS.APPLY_RULE
                });
            }
        });
    };
    changeNewFlow = (list, id, data) => {
        _.forEach(list, (value) => {
            if (_.get(value, 'id') === id && data[0]) {
                _.extend(value, data[0]);
                return false;
            }
        });
    };
    handleTabChange = (key) => {
        let keyName = key === TAB_KEYS.FORM_CONTENT ? Intl.get('apply.add.form.content', '表单内容') : Intl.get('apply.add.form.regex', '审批规则');
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + keyName);
        this.setState({
            activeKey: key
        });
    };
    renderAddTip = () => {
        return (
            <span>
                {Intl.get('apply.approve.manage.add.from.right', '请从右边添加表单内容')}
            </span>
        );
    };

    renderFormComponents = () => {
        var applyTypeData = this.state.applyTypeData;
        return _.map(applyTypeData.customiz_form, (formItem, key) => {
            //如果是编辑状态
            if (formItem.isEditting) {
                return (
                    <Form>
                        <ComponentEdit
                            form={this.props.form}
                            formItemKey={formItem.key}
                            formItem={formItem}
                            handleCancel={this.handleCancelEditFormItem}
                            handleSubmit={this.handleSubmitInput}
                            componentTemple={true}
                        />
                    </Form>

                );
            } else {
                return (
                    <Form>
                        <ComponentShow
                            form={this.props.form}
                            formItemKey={formItem.key}
                            formItem={formItem}
                            handleRemoveItem={this.removeTargetFormItem}
                            handleEditItem={this.handleEditItem}
                            componentTemple={true}
                        />
                    </Form>

                );
            }
        });
    };
    getTargetFormItem = (formKey) => {
        var customiz_form = _.get(this, 'state.applyTypeData.customiz_form');
        return _.find(customiz_form, item => item.key === formKey);
    };
    //删除某个item
    removeTargetFormItem = (formItem) => {
        var formKey = formItem.key;
        var applyTypeData = this.state.applyTypeData;
        var customiz_form = _.get(applyTypeData, 'customiz_form');
        applyTypeData.customiz_form = _.filter(customiz_form, item => item.key !== formKey);
        this.setState({
            applyTypeData
        });
    };
    //一种是编辑状态的取消，一种是添加的取消
    handleCancelEditFormItem = (formItem) => {
        var formKey = formItem.key;
        var target = this.getTargetFormItem(formKey);
        var applyTypeData = this.state.applyTypeData;
        var customiz_form = _.get(applyTypeData, 'customiz_form');
        //todo 待优化这里的判断
        if (formItem.title) {
            target.isEditting = false;
        } else {
            applyTypeData.customiz_form = _.filter(customiz_form, item => item.key !== formKey);
        }
        this.setState({
            applyTypeData
        });
    };
    handleEditItem = (formItem) => {
        var target = this.getTargetFormItem(formItem.key);
        target.isEditting = true;
        this.setState({
            applyTypeData: this.state.applyTypeData
        });
    };
    handleSubmitInput = (submitData, successFunc, errorFunc) => {
        var target = this.getTargetFormItem(submitData.key);
        delete submitData.key;
        _.mapKeys(submitData, (value, key) => {
            target[key] = value;
        });
        successFunc();
        target.isEditting = false;
        this.setState({
            applyTypeData: this.state.applyTypeData
        });

    };
    renderNodataContent = () => {
        //添加某个流程的时候
        return (
            <NoDataIntro
                showAddBtn={true}
                noDataAndAddBtnTip={Intl.get('apply.approve.manage.no.content', '暂无表单内容')}
                renderAddAndImportBtns={this.renderAddTip}
            />
        );
    };
    renderAddFormContent = () => {
        var applyTypeData = this.state.applyTypeData;
        var hasFormItem = _.get(applyTypeData, 'customiz_form.length');
        var cls = classNames('apply-form-content', {'has-form-item': hasFormItem});
        return (<div className={cls}>
            {hasFormItem ? this.renderFormComponents() : this.renderNodataContent()}
        </div>);
    };
    handleSubmitApproveForm = (e) => {
        e.preventDefault();
        var submitObj = _.cloneDeep(this.state.applyTypeData);
        if (this.validateBeforeSubmit(submitObj)) {
            //不需要把所有的东西都传过去，只传表单相关内容即可，可以把规则先去掉
            if (submitObj.applyRulesAndSetting) {
                delete submitObj.applyRulesAndSetting;
            }
            if (!submitObj.customiz_form){
                submitObj['customiz_form'] = [];
            }
            this.setState({editWorkFlowLoading: true});
            applyApproveManageAction.editSelfSettingWorkFlow(submitObj, () => {
                //userData上的属性也修改
                var targetItem = this.updateUserData();
                if (targetItem) {
                    targetItem.customiz_form = submitObj.customiz_form;
                }
                //保存成功后自动切换到另一个tab
                this.setState({
                    activeKey: TAB_KEYS.APPLY_RULE
                });
            });
        }
    };
    validateBeforeSubmit = (submitObj) => {
        var customiz_form = _.get(submitObj, 'customiz_form');
        //如果有时间相关组件，需要把默认的时间值去掉，要不就会报错
        _.forEach(customiz_form, (item,index) => {
            if (item.component_type === ALL_COMPONENTS.DATETIME){
                delete item.defaultValue;
            }
            //与业务相关的一些组件，字段的key值必须按后端给定的格式传
            //todo 域名申请约定的相关字段 配置完该流程要及时删掉
            // if(index === 1){
            //     item['key'] = 'customer_sign';
            // }
            // if(index === 2){
            //     item['key'] = 'display_name';
            // }
        });
        return !_.includes(_.map(customiz_form, 'isEditting'), true);
    };
    //修改申请审批的名字后保存
    handleSaveApproveTitle = (initialValue) => {
        var updateName = this.state.updateApplyName;
        //如果名字没有修改，不需要发请求保存
        if (_.trim(initialValue) === _.trim(updateName)) {
            this.setState({
                isEdittingApplyName: false,
                updateApplyName: ''
            });
        } else {
            var applyTypeData = this.state.applyTypeData;
            var submitObj = _.cloneDeep(applyTypeData);
            //只提交名字相关的东西，表单和规则不需要提交
            if (submitObj.customiz_form) {
                delete submitObj.customiz_form;
            }
            if (submitObj.applyRulesAndSetting) {
                delete submitObj.applyRulesAndSetting;
            }
            submitObj.description = updateName;
            applyApproveManageAction.editSelfSettingWorkFlow(submitObj, () => {
                //userData上的属性也修改
                var targetItem = this.updateUserData();
                if (targetItem) {
                    targetItem.description = updateName;
                }
                //此页面的名字也需要修改
                applyTypeData.description = updateName;
                this.setState({
                    applyTypeData: applyTypeData,
                    isEdittingApplyName: false,
                    updateApplyName: ''
                });
            });

        }
    };
    //获取目标
    updateUserData = () => {
        var applyLists = userData.getUserData().workFlowConfigs;
        return _.find(applyLists, item => item.type === _.get(this, 'state.applyTypeData.type'));
    };
    handleCancelSaveTitle = () => {
        this.setState({
            isEdittingApplyName: false,
            updateApplyName: ''
        });
    };
    handleAddComponents = (ruleItem) => {
        var applyTypeData = this.state.applyTypeData;
        var customiz_form = _.get(applyTypeData, 'customiz_form', []);
        customiz_form.push({...ruleItem, 'key': ruleItem.key || ruleItem.component_type + '_' + uuid(), 'isEditting': true});
        applyTypeData.customiz_form = customiz_form;
        this.setState({
            applyTypeData: applyTypeData
        });
    };
    renderAddFormRules = () => {
        return (
            <div className="rule-content-wrap">
                {_.map(ADDAPPLYFORMCOMPONENTS, (ruleItem) => {
                    var cls = 'iconfont ' + ruleItem.iconfontCls;
                    return (
                        <span className="rule-content-container"
                            onClick={this.handleAddComponents.bind(this, ruleItem)}>
                            <i className={cls}></i>
                            <span className="rule-cls">{ruleItem.rulename}</span>
                            {ruleItem.placeholder && !ruleItem.notshowInList ?
                                <span className="addition-cls">({ruleItem.placeholder})</span> : null}
                        </span>
                    );
                })}
            </div>
        );
    };
    renderFormContent = () => {
        var applyTypeData = this.state.applyTypeData;
        var hasFormItem = _.get(applyTypeData, 'customiz_form.length');
        return (
            <div className="apply-form-content-wrap"
                style={{height: calculateHeight() - 2 * APPLYAPPROVE_LAYOUT.PADDINGHEIGHT - APPLYAPPROVE_LAYOUT.TABTITLE - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM + 70}}>
                <div className="apply-form-rules">
                    <GeminiScrollbar>
                        {this.renderAddFormRules()}
                    </GeminiScrollbar>
                </div>
                <div className="apply-form-content-container">
                    <GeminiScrollbar>
                        {this.renderAddFormContent()}
                    </GeminiScrollbar>
                    {/*todo 待优化部分*/}
                    {/*保存表单内容*/}
                    {hasFormItem || true ?
                        <div className="change-form-item">
                            <SaveCancelButton
                                loading={this.state.editWorkFlowLoading}
                                handleSubmit={this.handleSubmitApproveForm}
                                saveErrorMsg={this.state.editWorkFlowErrMsg}
                                hideCancelBtns={true}
                            />
                        </div> : null}

                </div>
            </div>
        );
    };
    renderApplyRegex = () => {
        var applyTypeData = this.state.applyTypeData;
        var applyRulesAndSetting = _.get(applyTypeData, 'applyRulesAndSetting');
        if (!_.isEmpty(applyRulesAndSetting)) {
            //如果之前保存过流程的相关配置，后端保存的applyApproveRules是字符串格式的，
            if (_.isString(applyRulesAndSetting.applyApproveRules)){
                applyRulesAndSetting.applyApproveRules = JSON.parse(applyRulesAndSetting.applyApproveRules);
            }
        } else {
            //如果之前没有加过流程，这是默认的流程，默认流程是部门经理审批的
            applyRulesAndSetting = {
                applyApproveRules: {
                    defaultFlow: {
                        bpmnNode: [
                            {
                                name: 'UserTask_1_2',
                                id: 'UserTask_1_2',
                                type: 'UserTask',
                                showName: Intl.get('apply.add.approve.node.team.owner', '部门经理'),
                                candidateApprover: 'teamowner',
                                flowIndex: '1_2'
                            }
                        ],
                        ccPerson: [],//默认
                    }
                },//审批规则
                cancelAfterApprove: false,//撤销权限
                mergeSameApprover: false//其他
            };
        }
        applyTypeData.applyRulesAndSetting = applyRulesAndSetting;
        return (
            <ApplyRulesView
                applyTypeData={applyTypeData}
                updateRegRulesView={this.updateRegRulesView}
                roleList={this.state.roleList}
                userList={this.state.userList}
                teamList={this.state.teamList}
            />
        );
    };
    updateRegRulesView = (updateRules) => {
        //userData上的属性也修改
        var targetItem = this.updateUserData();
        if (targetItem) {
            targetItem.applyRulesAndSetting = updateRules.applyRulesAndSetting;
            targetItem.customiz_user_range = updateRules.customiz_user_range;
            targetItem.customiz_team_range = updateRules.customiz_team_range;
            var applyTypeData = this.state.applyTypeData;
            applyTypeData.applyRulesAndSetting = updateRules.applyRulesAndSetting;
            applyTypeData.customiz_user_range = updateRules.customiz_user_range;
            applyTypeData.customiz_team_range = updateRules.customiz_team_range;
            this.setState({
                applyTypeData: applyTypeData
            });
        }
    };
    renderAddApplyContent = () => {
        return (
            <div className="add-apply-form-content">
                <Tabs defaultActiveKey={TAB_KEYS.FORM_CONTENT}
                    activeKey={this.state.activeKey}
                    onChange={this.handleTabChange}>
                    {/*如果是内置的流程，不需要展示表单内容*/}
                    {_.get(this, 'state.applyTypeData.customiz') ?
                        <TabPane tab={Intl.get('apply.add.form.content', '表单内容')}
                            key={TAB_KEYS.FORM_CONTENT}>
                            {this.renderFormContent()}
                        </TabPane> : null}
                    <TabPane tab={Intl.get('apply.add.form.regex', '审批规则')}
                        key={TAB_KEYS.APPLY_RULE}>
                        {this.renderApplyRegex()}
                    </TabPane>
                </Tabs>
            </div>
        );
    };
    handleClickCloseAddPanel = () => {
        this.props.closeAddPanel();
    };
    //修改自定义流程的标题
    handleEditApplyTitle = (initialApplyTitle) => {
        this.setState({
            isEdittingApplyName: true,
            updateApplyName: initialApplyTitle
        });
    };
    handleApplyTitleChange = (e) => {
        this.setState({
            updateApplyName: e.target.value
        });
    };
    render = () => {
        var applyTypeData = this.state.applyTypeData;
        var initialApplyTitle = _.get(applyTypeData, 'description') || _.get(applyTypeData, 'type');
        if(this.state.getSelfSettingWorkFlowLoading){
            return(
                <div className="load-content">
                    <Spinner />
                </div>);
        }else if(this.state.getSelfSettingWorkFlowErrMsg){
            return(
                <div className="errmsg-wrap">
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{this.state.getSelfSettingWorkFlowErrMsg}</p>
                </div>);
        }else{
            return (
                <div className="add-apply-form-container">
                    <div className="add-apply-form-title">
                        <div className="show-and-edit-approve-type">
                            {this.state.isEdittingApplyName ? <span className="edit-name-container">
                                <Input defaultValue={initialApplyTitle} onChange={this.handleApplyTitleChange}/>
                                <SaveCancelButton
                                    loading={this.state.editApplyTitleLoading}
                                    handleSubmit={this.handleSaveApproveTitle.bind(this, initialApplyTitle)}
                                    handleCancel={this.handleCancelSaveTitle}
                                    saveErrorMsg={this.state.editApplyTitleErrMsg}
                                />

                            </span> : <span className="show-name-container">
                                {initialApplyTitle}
                                {/*如果是内置的流程，不让修改流程的名称*/}
                                {_.get(this, 'state.applyTypeData.customiz') ? <i className="pull-right iconfont icon-update"
                                    onClick={this.handleEditApplyTitle.bind(this, initialApplyTitle)}></i> : null}

                            </span>}

                        </div>
                        <Button className="add-apply-form-back-btn" onClick={this.handleClickCloseAddPanel}>
                            {Intl.get('common.cancel', '取消')}</Button>
                    </div>
                    {this.renderAddApplyContent()}
                </div>
            );
        }
    }
}

ApplyFormAndRules.defaultProps = {
    closeAddPanel: function() {

    },
    applyTypeId: '',
};

ApplyFormAndRules.propTypes = {
    closeAddPanel: PropTypes.func,
    applyTypeId: PropTypes.string,
    form: PropTypes.object,
};
export default Form.create()(ApplyFormAndRules);
