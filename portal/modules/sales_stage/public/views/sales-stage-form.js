var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
import { Alert } from 'antd';

var SalesStageStore = require('../store/sales-stage-store');
var Spinner = require('../../../../components/spinner');



/**
 * Created by jinfeng on 2015/12/28.
 */

var Form = require('antd').Form;
var Input = require('antd').Input;
var Button = require('antd').Button;
var Checkbox = require('antd').Checkbox;
var FormItem = Form.Item;

var rightPanelUtil = require('../../../../components/rightPanel/index');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function(className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}

function noop() {
}

var SalesStageForm = createReactClass({
    displayName: 'SalesStageForm',
    mixins: [Validation.FieldMixin],

    getDefaultProps: function() {
        return {
            submitSalesStageForm: noop,
            cancelSalesStageForm: noop,
            salesStageFormShow: false,
            salesStage: {
                id: '',
                name: '',
                index: '',
                description: ''
            }
        };
    },

    getInitialState: function() {
        return {
            status: {
                id: {},
                name: {},
                index: {},
                description: {}
            },
            formData: this.props.salesStage,
            salesStageFormShow: this.props.salesStageFormShow
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if(!this.state.salesStageFormShow) {
            this.refs.validation.reset();
            var stateData = this.getInitialState();
            stateData.formData = nextProps.salesStage;
            stateData.salesStageFormShow = nextProps.salesStageFormShow;
            this.setState(stateData);
        }
    },

    onChange: function() {
        this.setState(SalesStageStore.getState());
    },

    componentWillUnmount: function() {
        SalesStageStore.unlisten(this.onChange);
    },

    componentDidUpdate: function() {
        var _this = this;
        SalesStageStore.listen(_this.onChange);
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
    },

    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = cx({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //取消事件
    handleCancel: function(e) {
        e.preventDefault();
        this.props.cancelSalesStageForm();
    },

    //保存角色信息
    handleSubmit: function(e) {
        e.preventDefault();
        var _this = this;
        var validation = this.refs.validation;
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else {
                _this.props.submitSalesStageForm(_this.state.formData);
            }
        });
    },

    render: function() {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        var errorMsg = this.state.saveStageErrMsg;

        //如果存在添加失败或者修改失败的错误信息，则提示
        const renderErr = () => {
            if (errorMsg) {
                return (
                    <div className="alert-error-msg">
                        <Alert
                            message={errorMsg}
                            type="error"
                            showIcon
                        />
                    </div>
                );
            }
        };
        return (

            <RightPanel showFlag={this.state.salesStageFormShow} data-tracename="添加/编辑销售阶段">
                <RightPanelClose onClick={this.handleCancel} data-tracename="关闭添加/编辑销售阶段"></RightPanelClose>
                <div className="right-form-scroll-div">

                    <Form layout='horizontal' className="form">
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                label={Intl.get('sales.stage.sales.stage', '销售阶段')}
                                id="name"
                                labelCol={{span: 5}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('name')}
                                hasFeedback
                                help={status.name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.name.errors && status.name.errors.join(','))}>
                                <Validator rules={[{required: true, min: 1, max: 20 , message: Intl.get('common.input.character.prompt', '最少1个字符,最多20个字符')}]}>
                                    <Input name="name" id="name" value={formData.name}
                                        onChange={this.setField.bind(this, 'name')}
                                        placeholder={Intl.get('common.required.tip', '必填项*')}
                                        data-tracename="填写/编辑销售阶段"
                                    />
                                </Validator>
                            </FormItem>
                            <div className="sales-stage-table-block-right">
                                {this.state.isSavingSalesStage ? (<div className="sales-stage-block">
                                    <Spinner className="sales-stage-saving"/>
                                </div>) : null}
                                <FormItem
                                    label={Intl.get('common.describe', '描述：')}
                                    id="description"
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={_this.renderValidateStyle('description')}
                                    hasFeedback
                                    help={status.description.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.description.errors && status.description.errors.join(','))}
                                >
                                    <Validator
                                        rules={[{required: true, min: 1, max: 200 , message: Intl.get('authority.input.length.tip', '最少1个字符,最多200个字符')}]}>
                                        <Input name="description" id="description"
                                            value={formData.description}
                                            onChange={_this.setField.bind(_this, 'description')}
                                            type="textarea"
                                            rows="3"
                                            data-tracename="填写/编辑销售阶段描述"
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    wrapperCol={{span: 23}}>
                                    {renderErr()}
                                    <RightPanelCancel onClick={this.handleCancel} data-tracename="取消销售阶段的添加/编辑">
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit} data-tracename="保存销售阶段的添加/编辑">
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                                    </RightPanelSubmit>
                                </FormItem>
                            </div>
                        </Validation>
                    </Form>
                </div>
            </ RightPanel >
        );
    },
});

module.exports = SalesStageForm;

