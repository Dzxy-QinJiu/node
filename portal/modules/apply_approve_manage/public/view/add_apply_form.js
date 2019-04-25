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
import {calculateHeight, APPLYAPPROVE_LAYOUT,ALL_COMPONENTS, ALL_COMPONENTS_TYPE} from '../utils/apply-approve-utils';
import InputEdit from './input-components/input-edit';
import InputShow from './input-components/show-input';
import ApplyRules from './reg-rules/view';
class AddApplyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.FORM_CONTENT,//当前选中的TAB
            applyTypeData: _.cloneDeep(this.props.applyTypeData),//编辑某个审批的类型
            addApplyRules: [
                {
                    'rulename': Intl.get('apply.rule.text', '文字输入'),
                    'iconfontCls': 'icon-fuwu',
                    'defaultPlaceholder': Intl.get('apply.rule.within.32', '32个字符以内'),
                    'componentType': ALL_COMPONENTS.INPUT
                },
                {
                    'rulename': Intl.get('apply.rule.textare', '多行文字输入'),
                    'iconfontCls': 'icon-fuwu',
                    'defaultPlaceholder': Intl.get('apply.rule.over.32', '32个字符以上'),
                    'componentType': ALL_COMPONENTS.INPUT,
                    'type': ALL_COMPONENTS_TYPE.TEXTAREA
                },
                {
                    'rulename': Intl.get('apply.rule.number', '数字输入'),
                    'iconfontCls': 'icon-fuwu',
                    'defaultPlaceholder': Intl.get('apply.rule.limit.int', '仅限整数')
                },
                {
                    'rulename': Intl.get('apply.rule.count', '金额输入'),
                    'iconfontCls': 'icon-fuwu',
                    'defaultPlaceholder': Intl.get('apply.rule.allow.point', '允许小数点')
                },
                {'rulename': Intl.get('apply.rule.hour', '时长输入'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.radio', '单选'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.check', '多选'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.date', '日期选择'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.date.and.time', '日期+时间选择'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.period', '周期选择'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.customer', '客户选择'), 'iconfontCls': 'icon-fuwu'},
                {'rulename': Intl.get('apply.rule.production', '产品配置'), 'iconfontCls': 'icon-fuwu'}
            ]
        };
    }

    onStoreChange = () => {

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
        return _.map(applyTypeData.formContent, (formItem) => {
            if (formItem.componentType === 'Input') {
                //如果是编辑状态
                if (formItem.isEditting) {
                    return (
                        <InputEdit
                            formItem={formItem}
                            handleCancel = {this.removeTargetFormItem}
                            handleSubmit = {this.handleSubmitInput}
                        />
                    );
                } else {
                    return (
                        <InputShow
                            formItem={formItem}
                            handleRemoveItem = {this.removeTargetFormItem}
                            handleEditItem={this.handleEditItem}
                        />
                    );
                }
            }
        });
    };
    getTargetFormItem = (formKey) => {
        var formContent = _.get(this, 'state.applyTypeData.formContent');
        return _.find(formContent, item => item.key === formKey);
    };
    //删除某个item
    removeTargetFormItem = (formItem) => {
        var formKey = formItem.key;
        var formContent = _.get(this, 'state.applyTypeData.formContent');
        var applyTypeData = this.state.applyTypeData;
        applyTypeData.formContent = _.filter(formContent, item => item.key !== formKey);
        this.setState({
            applyTypeData: this.state.applyTypeData
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
        var hasFormItem = _.get(applyTypeData, 'formContent.length');
        var cls = classNames('apply-form-content',{'has-form-item': hasFormItem});
        return (<div className={cls}>
            {hasFormItem ? this.renderFormComponents() : this.renderNodataContent()}
        </div>);

    };
    handleAddComponents = (ruleItem) => {
        var applyTypeData = this.state.applyTypeData;
        var componentType = ruleItem.componentType;
        if (componentType === 'Input') {
            var formContent = _.get(applyTypeData, 'formContent', []);
            formContent.push({...ruleItem, 'key': formContent.length, 'isEditting': true});
            applyTypeData.formContent = formContent;
            this.setState({
                applyTypeData: applyTypeData
            });
        }
    };
    renderAddFormRules = () => {
        var addApplyRules = this.state.addApplyRules;
        return (
            <div className="rule-content-wrap">
                {_.map(addApplyRules, (ruleItem) => {
                    var cls = 'iconfont ' + ruleItem.iconfontCls;
                    return (
                        <span className="rule-content-container"
                            onClick={this.handleAddComponents.bind(this, ruleItem)}>
                            <i className={cls}></i>
                            <span className="rule-cls">{ruleItem.rulename}</span>
                            {ruleItem.defaultPlaceholder ?
                                <span className="addition-cls">({ruleItem.defaultPlaceholder})</span> : null}
                        </span>
                    );
                })}
            </div>
        );
    };
    renderFormContent = () => {
        return (
            <div className="apply-form-content-wrap"
                style={{height: calculateHeight() - 2 * APPLYAPPROVE_LAYOUT.PADDINGHEIGHT - APPLYAPPROVE_LAYOUT.TABTITLE - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM}}>
                <div className="apply-form-rules">
                    {this.renderAddFormRules()}
                </div>
                <div className="apply-form-content-container">
                    {this.renderAddFormContent()}
                </div>
            </div>
        );
    };
    renderApplyRegex = () => {
        var applyTypeData = _.get(this, 'state.applyTypeData');
        return (
            <ApplyRules
                applyTypeData = {applyTypeData}
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
        return (
            <div className="add-apply-form-container">
                <div className="add-apply-form-title">
                    <div className="show-and-edit-approve-type">
                        {_.get(this, 'state.applyTypeData.applyType')}
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