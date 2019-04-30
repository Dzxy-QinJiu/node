/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/29.
 */

import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Form, Input, Menu, Dropdown, Select, DatePicker, Button, Icon, Radio, Checkbox,InputNumber } from 'antd';
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
const CONDITION_LIMITE = [{
    name: Intl.get('apply.add.condition.larger', '大于'),
    value: '>',
},{
    name: Intl.get('apply.add.condition.larger.and.equal', '大于等于'),
    value: '>=',
},{
    name: Intl.get('apply.add.condition.less', '小于'),
    value: '<',
},{
    name: Intl.get('apply.add.condition.less.and.equal', '小于等于'),
    value: '<=',
},{
    name: Intl.get('apply.add.condition.equal', '等于'),
    value: '===',
},{
    name: Intl.get('apply.add.condition.within', '介于'),
    value: '',
}];
require('../../style/add_apply_condition_panel.less');

class AddApplyConditionPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddConditionForm: false,
            diffConditionLists: {},//添加的条件审批数据
            applySaveForm: this.props.applySaveForm,
        };
    }

    componentDidMount() {
    }

    handleAddConditionType = (conditionType) => {
        var diffConditionLists = this.state.diffConditionLists;
        diffConditionLists[conditionType] = {};
        this.setState({
            showAddConditionForm: true,
            diffConditionLists: diffConditionLists
        });
    };
    renderDiffCondition = () => {
        var applySaveForm = this.state.applySaveForm;
        var rangeCondition = _.some(applySaveForm, item => item.componentType === 'timeRange');
        const menu = (
            <Menu>
                {rangeCondition ? <Menu.Item>
                    <a onClick={this.handleAddConditionType.bind(this, 'timeRange')}>{Intl.get('user.duration', '时长')}</a>
                </Menu.Item> : null}

            </Menu>
        );
        return (
            <Dropdown overlay={menu}>
                <a className="ant-dropdown-link" href="#">
                    {Intl.get('apply.add.apply.condition', '添加条件')}
                </a>
            </Dropdown>
        );
    };
    deleteConditionType = (deleteType) => {
        var diffConditionLists = this.state.diffConditionLists;
        delete diffConditionLists[deleteType];
        //如果所有条件都删除完了，要展示添加的提示
        if (_.isEmpty(diffConditionLists)){
            this.setState({
                showAddConditionForm: false
            });
        }
        this.setState({
            diffConditionLists
        });
    };
    handleChangeRangeLimit = (key, subKey, value) => {
        var diffConditionLists = this.state.diffConditionLists;
        diffConditionLists[key][subKey] = value;
        this.setState({
            diffConditionLists
        });
    };
    handleRangeInputChange = (key, subKey, e) => {
        var diffConditionLists = this.state.diffConditionLists;
        diffConditionLists[key][subKey] = e.target.value;
        this.setState({
            diffConditionLists
        });
    };
    renderDiffTypeConditions = () => {
        var diffConditionLists = this.state.diffConditionLists;
        return (
            <div className="condition_list_type">
                {_.map(diffConditionLists,(value, key) => {
                    switch (key){
                        case 'timeRange':
                            return (<div className="condition-type-container range-condition-container">
                                <div className="condition-type-title">
                                    {Intl.get('user.duration', '时长')}
                                    <i className="iconfont icon-delete" onClick={this.deleteConditionType.bind(this, key)}></i>
                                </div>
                                <div className="condition-type-content">
                                    <Select
                                        onChange={this.handleChangeRangeLimit.bind(this, key, 'range_limit')}
                                        value={_.get(value, 'range_limit')}
                                    >
                                        {_.map(CONDITION_LIMITE,(item,index) => {
                                            return (<Option key={index} value={item.value}>{item.name}</Option>);
                                        })}
                                    </Select>
                                    <Input onChange={this.handleRangeInputChange.bind(this, key, 'range_number')} addonAfter={Intl.get('common.time.unit.day', '天')}/>
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
                                            <Input />
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
                                        <Button type="primary" className="submit-btn" onClick={this.handleSubmitCondition}
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
    hideRightPanel: function() {

    },
    saveAddApprovCondition: function() {

    },
    applySaveForm: {}

};
AddApplyConditionPanel.propTypes = {
    hideRightPanel: PropTypes.func,
    saveAddApproveNode: PropTypes.func,
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
