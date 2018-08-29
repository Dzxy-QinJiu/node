var React = require('react');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * 显示、编辑 的组件
 * 可切换状态
 */
import {Form,Input,Icon} from 'antd';
let FormItem = Form.Item;
let crypto = require('crypto');
let autosize = require('autosize');
import FieldMixin from '../../../../../components/antd-form-fieldmixin';
import {nameRegex} from 'PUB_DIR/sources/utils/consts';
let AutosizeTextarea = require('../../../../../components/autosize-textarea');
let CrmAction = require('../../action/crm-actions');
let CrmBasicAjax = require('../../ajax/index');
import Trace from 'LIB_DIR/trace';

let NameTextareaField = React.createClass({
    mixins: [FieldMixin],
    getDefaultProps: function() {
        return {
            //是否能修改
            disabled: false,
            customerId: '',
            name: '',
            //修改成功
            modifySuccess: function() {
            }
        };
    },
    getInitialState: function() {
        return {
            loading: false,
            displayType: 'text',
            disabled: this.props.disabled,
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            formData: {
                name: this.props.name
            },
            status: {
                name: {}
            },
            submitErrorMsg: ''
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时，重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.formData.name = nextProps.name;
            stateData.disabled = nextProps.disabled;
            this.setState(stateData);
        }
    },
    setEditable: function(e) {
        Trace.traceEvent(e,'点击设置客户名');
        this.setState({displayType: 'edit'});
    },
    //回到展示状态
    backToDisplay: function() {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    },

    handleSubmit: function(e) {
        if (this.state.loading) return;
        if (this.state.formData.name == this.props.name) {
            this.backToDisplay();
            return;
        }
        let validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) {
                return;
            }
            Trace.traceEvent(e,'保存对客户名的修改');
            let submitData = {
                id: this.state.customerId,
                type: 'name',
                name: $.trim(this.state.formData.name)
            };
            if (this.props.isMerge) {
                this.props.updateMergeCustomer(submitData);
                this.backToDisplay();
            } else {
                this.setState({loading: true});
                CrmBasicAjax.updateCustomer(submitData).then(result => {
                    if (result) {
                        this.backToDisplay();
                        //更新列表中的客户名
                        this.props.modifySuccess(submitData);
                    }
                }, errorMsg => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get('crm.169', '修改客户名失败')
                    });
                });
            }
        });
    },


    handleCancel: function(e) {
        let formData = this.state.formData;
        let status = this.state.status;
        formData.name = this.props.name;
        status.name = {};
        this.setState({
            formData: formData,
            status: status,
            displayType: 'text',
            submitErrorMsg: '',
            loading: false
        });
        Trace.traceEvent(e,'取消对客户名的修改');
    },

    //客户名格式验证
    checkCustomerName: function(rule, value, callback) {
        value = $.trim(value);
        if (value) {
            if (nameRegex.test(value)) {
                callback();
            } else {
                this.setState({submitErrorMsg: ''});
                callback(new Error(Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')));
            }
        } else {
            this.setState({submitErrorMsg: ''});
            callback(new Error( Intl.get('crm.81', '请填写客户名称')));
        }
    },
    render: function() {
        let formData = this.state.formData;
        let status = this.state.status;
        let textBlock = this.state.displayType === 'text' ? (
            <div>
                <span className="inline-block">{formData.name}</span>
                {
                    !this.state.disabled ? (
                        <i className="inline-block iconfont icon-update" title={Intl.get('crm.170', '设置客户名')}
                            onClick={(e) => this.setEditable(e)}/>
                    ) : null
                }

            </div>
        ) : null;

        let buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get('common.save', '保存')} className="inline-block iconfont icon-choose" onClick={(e) => {this.handleSubmit(e);}}/>
                <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close" onClick={(e) => {this.handleCancel(e);}}/>
            </div>
        );


        let inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <Form horizontal autoComplete="off">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label=""
                            className="input-customer-name"
                            labelCol={{span: 0}}
                            wrapperCol={{span: 24}}
                            validateStatus={this.renderValidateStyle('name')}
                            help={status.name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.name.errors && status.name.errors.join(','))}
                        >
                            <Validator rules={[{validator: this.checkCustomerName}]}>
                                <AutosizeTextarea name="name" rows="1" value={formData.name} autoComplete="off"
                                    width={300}
                                    onBlur={this.checkOnlyCustomerName}
                                    onChange={this.setField.bind(this, 'name')}
                                />
                            </Validator>
                        </FormItem>
                    </Validation>
                    <div className="buttons">
                        {buttonBlock}
                    </div>
                </Form>
                {this.state.submitErrorMsg ? (
                    <div className="has-error">
                        <span className="ant-form-explain">{this.state.submitErrorMsg}</span>
                    </div>) : null
                }
            </div>
        ) : null;
        return (
            <div data-tracename="客户名">
                {textBlock}
                {inputBlock}
            </div>
        );
    }
});

module.exports = NameTextareaField;

