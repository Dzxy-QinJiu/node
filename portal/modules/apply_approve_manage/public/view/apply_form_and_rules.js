/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('../style/add_apply_form.less');
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import NoDataIntro from 'CMP_DIR/no-data-intro';
const TAB_KEYS = {
    FORM_CONTENT: '1',//表单内容
    APPLY_RULE: '2'//审批规则
};
import Trace from 'LIB_DIR/trace';
var classNames = require('classnames');
import {calculateHeight, APPLYAPPROVE_LAYOUT, ALL_COMPONENTS, ALL_COMPONENTS_TYPE, ADDAPPLYFORMCOMPONENTS} from '../utils/apply-approve-utils';
import InputEdit from './input-components/input-edit';
import InputShow from './input-components/show-input';
import ApplyRulesView from './reg-rules/reg_rules_view';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
var applyApproveManageAction = require('../action/apply_approve_manage_action');
class AddApplyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.FORM_CONTENT,//当前选中的TAB
            applyTypeData: _.cloneDeep(this.props.applyTypeData),//编辑某个审批的类型
            //某个申请的审批规则及相关配置
            applyRulesAndSetting: {
                applyApproveRules: {
                    defaultFlow: {
                        bpmnNode: [
                            // {
                            //     name: 'UserTask_1_0',
                            //     id: 'UserTask_1_0',
                            //     type: 'UserTask',
                            //     next: 'UserTask_1_2',
                            //     showName: `填写${_.get(this, 'props.applyTypeData.applyType')}`,
                            //     flowIndex: '1_0'
                            // },
                            {
                                name: 'UserTask_1_2',
                                id: 'UserTask_1_2',
                                type: 'UserTask',
                                showName: '部门经理',
                                candidateApprover: 'teamowner',
                                flowIndex: '1_2'
                            }
                        ],
                        ccPerson: [],//默认抄送人
                    }
                },//审批规则
                //抄送人
                ccInformation: 'apply',//抄送通知
                cancelAfterApprove: false,//撤销权限
                mergeSameApprover: false//其他
            },
        };
    }

    //根据审批流程的id获取已保存的表单，这样在写审批规则的时候就根据表单写规则
    getSavedComponentsByApplyId = (applyId) => {
        var allFormLists = [{
            applyId: '111111111111',
            applySaveForm: [{
                id: 'XXX',
                title: '时长组件',
                is_required: false,
                component_type: 'timeRange',
                keys: ['timeRange'],
                subKeys: ['starttime', 'endtime', 'total_range']
            }],
        },{
            applyId: '222222222222222222',
            applySaveForm: [{
                id: 'XXX',
                title: '时长组件',
                is_required: false,
                component_type: 'timeRange',
                keys: ['timeRange'],
                subKeys: ['starttime', 'endtime', 'total_range']
            }],
        },{
            applyId: '333333333333333333',
            applySaveForm: [{
                id: 'XXX',
                title: '时长组件',
                is_required: false,
                component_type: 'timeRange',
                keys: ['timeRange'],
                subKeys: ['starttime', 'endtime', 'total_range']
            }],
        },{
            applyId: '444444444444444',
            applySaveForm: [{
                id: 'XXX',
                title: '金额组件',
                is_required: false,
                component_type: 'InputNumber',
                subComponentType: 'money',
                keys: ['value']
            }],
        }];
        var target = _.find(allFormLists, item => item.applyId === applyId);
        return _.get(target,'applySaveForm');

    };

    onStoreChange = () => {

    };
    componentDiDMount = () => {
        //todo 需要在这里发请求取表单和审批规则
        //如果还没有配置过，就只有一个默认的规则

    };
    handleTabChange = (key) => {
        let keyName = key === TAB_KEYS.FORM_CONTENT ? '表单内容' : '审批规则';
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
        return _.map(applyTypeData.customiz_form, (formItem,key) => {
            // if (formItem.component_type === 'Input') {
            //如果是编辑状态
            if (formItem.isEditting) {
                return (
                    <InputEdit
                        key={formItem.key}
                        formItem={formItem}
                        handleCancel={this.handleCancelEditFormItem}
                        handleSubmit={this.handleSubmitInput}
                    />
                );
            } else {
                return (
                    <InputShow
                        key={formItem.key}
                        formItem={formItem}
                        handleRemoveItem={this.removeTargetFormItem}
                        handleEditItem={this.handleEditItem}
                    />
                );
            }
            // }
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
        if (formItem.title){
            target.isEditting = false;
        }else{
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
    handleSubmitApproveForm = () => {
        var applyTypeData = this.state.applyTypeData;
        var customiz_form = _.get(applyTypeData, 'customiz_form');
        if (!_.includes(_.map(customiz_form,'isEditting'), true)){
            var applyTypeData = this.state.applyTypeData;
            applyApproveManageAction.editSelfSettingWorkFlow(applyTypeData,() => {
                //保存成功后自动切换到另一个tab
                this.setState({
                    activeKey: TAB_KEYS.APPLY_RULE
                });
            });
        }
    }

    ;
    handleAddComponents = (ruleItem) => {
        var applyTypeData = this.state.applyTypeData;
        var component_type = ruleItem.component_type;
        // if (_.includes(['Input','InputNumber'], component_type)){
        var customiz_form = _.get(applyTypeData, 'customiz_form', []);
        var keysArr = _.map(customiz_form,'key');
        var formContentKey = 0;
        if (keysArr.length){
            formContentKey = parseInt(_.max(keysArr)) + 1;
        }
        customiz_form.push({...ruleItem, 'key': formContentKey, 'isEditting': true});
        applyTypeData.customiz_form = customiz_form;
        this.setState({
            applyTypeData: applyTypeData
        });
        // }
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
        var applyTypeData = this.props.applyTypeData;
        var hasFormItem = _.get(applyTypeData, 'customiz_form.length');
        return (
            <div className="apply-form-content-wrap"
                style={{height: calculateHeight() - 2 * APPLYAPPROVE_LAYOUT.PADDINGHEIGHT - APPLYAPPROVE_LAYOUT.TABTITLE - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM}}>
                <div className="apply-form-rules">
                    {this.renderAddFormRules()}
                </div>
                <div className="apply-form-content-container">
                    <GeminiScrollbar>
                        {this.renderAddFormContent()}
                    </GeminiScrollbar>
                    {/*todo 待优化部分*/}
                    {/*{hasFormItem || true ? */}
                        <div className="save-cancel-container">
                        <SaveCancelButton
                            loading={this.state.editWorkFlowLoading}
                            handleSubmit={this.handleSubmitApproveForm}
                            saveErrorMsg={this.state.editWorkFlowErrMsg}
                            hideCancelBtns={true}
                        />
                    </div>
                        // : null}

                </div>
            </div>
        );
    };
    renderApplyRegex = () => {
        var applyRulesAndSetting = _.get(this, 'state.applyRulesAndSetting');
        return (
            <ApplyRulesView
                applyTypeData={this.state.applyTypeData}
                applyRulesAndSetting={applyRulesAndSetting}
            />
        );
    };
    renderAddApplyContent = () => {
        return (
            <div className="add-apply-form-content">
                <Tabs defaultActiveKey={TAB_KEYS.FORM_CONTENT}
                    activeKey={this.state.activeKey}
                    onChange={this.handleTabChange}>
                    <TabPane tab={Intl.get('apply.add.form.content', '表单内容')}
                        key={TAB_KEYS.FORM_CONTENT}>
                        {this.renderFormContent()}
                    </TabPane>
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
    render = () => {
        var applyTypeData = this.state.applyTypeData;
        return (
            <div className="add-apply-form-container">
                <div className="add-apply-form-title">
                    <div className="show-and-edit-approve-type">
                        {_.get(applyTypeData, 'description') || _.get(applyTypeData, 'type')}
                        <i className="pull-right iconfont icon-update"></i>
                    </div>
                    <i className="pull-right iconfont icon-close" onClick={this.handleClickCloseAddPanel}></i>
                </div>
                {this.renderAddApplyContent()}
            </div>
        );
    }
}

AddApplyForm.defaultProps = {
    closeAddPanel: function() {

    },
    applyTypeData: {}
};

AddApplyForm.propTypes = {
    closeAddPanel: PropTypes.func,
    applyTypeData: PropTypes.object
};
export default AddApplyForm;