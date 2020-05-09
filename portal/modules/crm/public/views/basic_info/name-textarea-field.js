/**
 * 编辑 客户名 的组件
 *
 */
var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
import {Form, Button, Icon} from 'antd';
let FormItem = Form.Item;
let crypto = require('crypto');
let autosize = require('autosize');
import FieldMixin from '../../../../../components/antd-form-fieldmixin';
import {customerNameRegex} from 'PUB_DIR/sources/utils/validate-util';
let AutosizeTextarea = require('../../../../../components/autosize-textarea');
let CrmAction = require('../../action/crm-actions');
let CrmBasicAjax = require('../../ajax/index');
import Trace from 'LIB_DIR/trace';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {renderCustomerNameMsg} from 'PUB_DIR/sources/utils/common-method-util';
let NameTextareaField = createReactClass({
    displayName: 'NameTextareaField',
    mixins: [FieldMixin],
    propTypes: {
        isMerge: PropTypes.bool,
        customerId: PropTypes.string,
        name: PropTypes.string,
        setEditNameFlag: PropTypes.func,
        updateMergeCustomer: PropTypes.func,
        modifySuccess: PropTypes.func,
        showRightPanel: PropTypes.func,
    },
    getDefaultProps: function() {
        return {
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
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            formData: {
                name: this.props.name
            },
            status: {
                name: {}
            },
            customerNameExist: false,//客户名是否已存在
            existCustomerList: [],//已存在的客户列表
            checkNameError: false,//客户名唯一性验证出错
            submitErrorMsg: ''
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.customerId !== this.state.customerId) {
            //切换客户时，重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.formData.name = nextProps.name;
            this.setState(stateData);
        }
    },

    handleSubmit: function(e) {
        if (this.state.loading) return;
        if (this.state.formData.name === this.props.name) {
            this.props.setEditNameFlag(false);
            return;
        }
        if (this.state.customerNameExist || this.state.checkNameError) return;
        let validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) {
                return;
            }
            Trace.traceEvent(e, '保存对客户名的修改');
            let submitData = {
                id: this.state.customerId,
                type: 'name',
                name: _.trim(this.state.formData.name)
            };
            if (this.props.isMerge) {
                if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(submitData);
                this.props.setEditNameFlag(false);
            } else {
                this.setState({loading: true});
                CrmBasicAjax.updateCustomer(submitData).then(result => {
                    if (result) {
                        this.props.setEditNameFlag(false);
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
            submitErrorMsg: '',
            loading: false
        });
        this.props.setEditNameFlag(false);
        Trace.traceEvent(e, '取消对客户名的修改');
    },

    //客户名格式验证
    checkCustomerName: function(rule, value, callback) {
        value = _.trim(value);
        if (value) {
            if (customerNameRegex.test(value)) {
                callback();
            } else {
                this.setState({submitErrorMsg: ''});
                callback(new Error(Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到25（包括25）之间')));
            }
        } else {
            this.setState({submitErrorMsg: ''});
            callback(new Error(Intl.get('crm.81', '请填写客户名称')));
        }
    },

    //客户名唯一性验证
    checkOnlyCustomerName: function(e) {
        var customerName = _.trim(this.state.formData.name);
        //满足验证条件后再进行唯一性验证
        if (customerName && customerName !== this.props.name && customerNameRegex.test(customerName)) {
            Trace.traceEvent(e, '修改客户名');
            CrmAction.checkOnlyCustomerName(customerName, (data) => {
                let list = _.get(data,'list');
                //客户名是否重复
                let repeatCustomer = _.some(list,{'name': customerName});
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({customerNameExist: false, checkNameError: true});
                } else if (_.isObject(data)) {
                    if (!repeatCustomer) {
                        //不存在
                        this.setState({customerNameExist: false, checkNameError: false, existCustomerList: _.get(data, 'list', [])});
                    } else {
                        //已存在
                        this.setState({customerNameExist: true, checkNameError: false, existCustomerList: _.get(data, 'list', [])});
                    }
                }
            }, this.state.customerId);
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
        }
    },

    render: function() {
        let formData = this.state.formData;
        let status = this.state.status;
        return (
            <Form layout='horizontal' autoComplete="off" data-tracename="客户名" className="name-form">
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
                                onBlur={this.checkOnlyCustomerName}
                                onChange={this.setField.bind(this, 'name')}
                            />
                        </Validator>
                    </FormItem>
                    {renderCustomerNameMsg(this.state.existCustomerList, this.state.checkNameError, _.get(formData, 'name', ''), this.props.showRightPanel)}
                </Validation>
                <SaveCancelButton loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    },
});

module.exports = NameTextareaField;

