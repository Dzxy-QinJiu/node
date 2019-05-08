/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/29.
 */

import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Form, Input, Menu, Dropdown, Select, DatePicker, Button, Icon, Radio, Checkbox, InputNumber} from 'antd';
const RadioGroup = Radio.Group;
var Option = Select.Option;
const FormItem = Form.Item;
var classNames = require('classnames');
import PropTypes from 'prop-types';
const FORMLAYOUT = {
    PADDINGTOTAL: 60
};
import AlertTimer from 'CMP_DIR/alert-timer';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

import {CONDITION_KEYS} from '../../utils/apply-approve-utils';
const CONDITION_LIMITE = [{
    name: Intl.get('apply.add.condition.larger', '大于'),
    value: '>',
}, {
    name: Intl.get('apply.add.condition.larger.and.equal', '大于等于'),
    value: '>=',
}, {
    name: Intl.get('apply.add.condition.less', '小于'),
    value: '<',
}, {
    name: Intl.get('apply.add.condition.less.and.equal', '小于等于'),
    value: '<=',
}, {
    name: Intl.get('apply.add.condition.equal', '等于'),
    value: '===',
}, {
    name: Intl.get('apply.add.condition.within', '介于'),
    value: '',
}];
require('../../style/add_apply_condition_panel.less');

class AddApplyConditionPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddConditionForm: false,
            diffConditionLists: {
                limitRules: [],
            },//添加的条件审批数据
            applySaveForm: this.props.applySaveForm,
        };
    }

    componentDidMount() {
    }

    handleAddConditionType = (conditionType) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules', []);
        var target = this.getConditionRelate(conditionType);
        limitRules.push({limitType: conditionType, limitTypeDsc: _.get(target, 'name')});
        this.setState({
            showAddConditionForm: true,
            diffConditionLists: diffConditionLists
        });
    };
    getConditionRelate = (conditionType) => {
       var target = _.find(CONDITION_KEYS, item => item.value === conditionType);
       return target;
    };
    getDiffTypeComponents = () => {
        var applySaveForm = this.state.applySaveForm;
        //保存的已经添加的表单，是个数组
        var menus = <Menu>{
            _.map(applySaveForm, (item) => {
                var componentType = item.subComponentType || item.componentType;
                var target = this.getConditionRelate(componentType);
               return <Menu.Item>
                    <a onClick={this.handleAddConditionType.bind(this, componentType)}>{_.get(target,'name')}</a>
                </Menu.Item>;
            })
        }</Menu>;
        return menus;
    };
    renderDiffCondition = () => {
        var menus = this.getDiffTypeComponents();
        return (
            <Dropdown overlay={menus}>
                <a className="ant-dropdown-link" href="#">
                    {Intl.get('apply.add.apply.condition', '添加条件')}
                </a>
            </Dropdown>
        );
    };
    deleteConditionType = (deleteType) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.filter(_.get(diffConditionLists, 'limitRules'), (item) => item.type !== deleteType);
        //如果所有条件都删除完了，要展示添加的提示
        if (_.get(limitRules, 'length')) {
            this.setState({
                showAddConditionForm: false
            });
        }
        this.setState({
            diffConditionLists
        });
    };
    handleChangeRangeLimit = (key, subKey, allType, value) => {
        var diffConditionLists = this.state.diffConditionLists;
        var limitRules = _.get(diffConditionLists, 'limitRules');
        var target = _.find(limitRules, limit => limit.limitType === key);
        if (target) {
            var limitTarget = _.find(allType, limitItem => limitItem.value === value);
            target[subKey] = value;
            target[subKey + 'Dsc'] = _.get(limitTarget, 'name');
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
                {_.map(limitRules, (value) => {
                    var limitType = value.limitType;
                    var target = this.getConditionRelate(limitType);
                    switch (limitType) {
                        case 'timeRange':
                            return (<div className="condition-type-container range-condition-container">
                                <div className="condition-type-title">
                                    {_.get(target,'name')}
                                    <i className="iconfont icon-delete"
                                       onClick={this.deleteConditionType.bind(this, limitType)}></i>
                                </div>
                                <div className="condition-type-content">
                                    <Select
                                        onChange={this.handleChangeRangeLimit.bind(this, limitType, 'rangeLimit', CONDITION_LIMITE)}
                                    >
                                        {_.map(CONDITION_LIMITE, (item, index) => {
                                            return (<Option key={index} value={item.value}>{item.name}</Option>);
                                        })}
                                    </Select>
                                    <Input
                                        onChange={this.handleRangeInputChange.bind(this, limitType, 'rangeNumber', Intl.get('common.time.unit.day', '天'))}
                                        addonAfter={Intl.get('common.time.unit.day', '天')}/>
                                </div>
                            </div>);
                    }
                })}
            </div>
        );
    };
    handleSubmitCondition = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            var submitObj = _.cloneDeep(this.state.diffConditionLists);
            this.props.saveAddApprovCondition(submitObj);
            this.props.hideRightPanel();
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
                                            _this.state.showAddConditionForm ? _this.renderDiffTypeConditions() : _this.renderDiffCondition()
                                        )}
                                    </FormItem>
                                    <div className="submit-button-container">
                                        <Button type="primary" className="submit-btn"
                                                onClick={this.handleSubmitCondition}
                                                disabled={this.state.isSaving} data-tracename="点击保存添加
                                            条件审批申请">
                                            {Intl.get('common.save', '保存')}
                                            {this.state.isSaving ? <Icon type="loading"/> : null}
                                        </Button>
                                        <Button className="cancel-btn" onClick={this.props.hideRightPanel}
                                                data-tracename="点击取消添加条件审批流程按钮">
                                            {Intl.get('common.cancel', '取消')}
                                        </Button>
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
    hideRightPanel: function () {

    },
    saveAddApprovCondition: function () {

    },
    applySaveForm: {}

};
AddApplyConditionPanel.propTypes = {
    hideRightPanel: PropTypes.func,
    saveAddApprovCondition: PropTypes.func,
    applySaveForm: PropTypes.object,


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
export default Form.create()(AddApplyConditionPanel);
