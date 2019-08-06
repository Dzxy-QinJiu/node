var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * select(下拉选择框)显示、编辑 的组件
 * 可切换状态
 */
require('./css/basic-edit-field.less');
import {Form, Icon, Select} from 'antd';
var classNames = require('classnames');
import FieldMixin from '../antd-form-fieldmixin';
var FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';

let BasicEditSelectField = createReactClass({
    displayName: 'BasicEditSelectField',
    mixins: [FieldMixin],

    getDefaultProps: function() {
        return {
            id: '1',
            //是否是多选(默认：单选)
            multiple: false,
            //是否是输入框自动提示模式
            combobox: false,
            //是否匹配选项
            filterOption: true,
            //字段
            field: 'role',
            //是否能修改
            disabled: false,
            //验证条件
            validators: [{}],
            //请填写
            placeholder: Intl.get('member.select.role', '请选择角色'),
            //显示的值
            value: '',
            //展示内容（非编辑状态）
            displayText: '',
            //下拉列表中的选项
            selectOptions: [],
            //提示文案
            title: Intl.get('common.update', '修改'),
            //修改成功
            modifySuccess: function() {
            },
            onDisplayTypeChange: function(type) {
            },
            onSelectChange: function() {
            },
            cancelEditField: function() {
            },
            saveEditSelect: function() {
            },
            hideButtonBlock: false
        };
    },

    getInitialState: function() {
        return {
            loading: false,
            displayType: this.props.displayType || 'text',
            displayText: this.props.displayText,
            formData: {
                select: this.props.value
            },
            value: this.props.value,
            status: {
                select: {}
            },
            selectOptions: this.props.selectOptions,
            submitErrorMsg: ''
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                loading: false,
                displayText: nextProps.displayText,
                formData: {
                    select: nextProps.value
                },
                value: nextProps.value,
                status: {
                    select: {}
                },
                selectOptions: nextProps.selectOptions,
                submitErrorMsg: ''
            });
        } else {
            this.setState({
                selectOptions: nextProps.selectOptions,
            });
        }
    },

    setEditable: function(e) {
        var formData = this.state.formData;
        formData.select = this.props.value;
        this.setState({
            displayType: 'edit',
            formData: formData
        });
        Trace.traceEvent(e,'点击编辑' + this.props.field);
    },

    handleSubmit: function(e) {
        var validation = this.refs.validation;
        var _this = this;

        validation.validate((valid) => {
            if (!valid) {
                return;
            }
            Trace.traceEvent(e,'保存对' + this.props.field + '的修改');
            var value = this.state.formData.select;
            var user = {id: this.props.id};
            user[this.props.field] = value;
            this.setState({loading: true});
            function setDisplayState() {
                _this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: value,
                    displayType: 'text'
                });
            }

            if (value !== this.state.value) {
                if(_this.props.isMerge){//合并客户面板的处理
                    _this.props.updateMergeCustomer(user);
                    setDisplayState();
                } else {
                    this.props.saveEditSelect(user).then(function(result) {
                        if (result) {
                            setDisplayState();
                            _this.props.modifySuccess(user);
                        }else{
                            _this.setState({
                                loading: false,
                                submitErrorMsg: ( Intl.get('common.edit.failed', '修改失败'))
                            });
                        }

                    }, function(errorObj) {
                        _this.setState({
                            loading: false,
                            submitErrorMsg: errorObj.message || ( Intl.get('common.edit.failed', '修改失败'))
                        });
                    });
                }
            } else {
                setDisplayState();
            }
        });
    },

    handleCancel: function(e) {
        Trace.traceEvent(e,'取消对' + this.props.field + '修改');
        var formData = this.state.formData;
        var status = this.state.status;
        formData.select = this.props.value;
        status.select = {};
        this.setState({
            formData: formData,
            status: status,
            displayType: 'text',
            submitErrorMsg: ''
        });
        this.props.cancelEditField();
    },

    onSelectChange: function(selectVal) {
        this.props.onSelectChange(selectVal);
    },

    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var displayCls = classNames({
            'user-basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var textBlock = this.state.displayType === 'text' ? (
            <div>
                <span className="inline-block">
                    {this.props.displayText}
                </span>
                { this.props.disabled ? null : (
                    <i className="inline-block iconfont icon-update" title={this.props.title}
                        onClick={(e) => {this.setEditable(e);}}/>
                )}
            </div>
        ) : null;

        var errorBlock = this.state.submitErrorMsg ? (
            <div className="has-error"><span className="ant-form-explain">{this.state.submitErrorMsg}</span></div>
        ) : null;

        var buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get('common.update', '修改')} className="inline-block iconfont icon-choose"
                    onClick={(e) => {this.handleSubmit(e);}}/>
                <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close"
                    onClick={(e) => {this.handleCancel(e);}}/>
            </div>
        );

        var selectBlock = this.state.displayType === 'edit' ? (
            <div className="selectWrap" ref="selectWrap" key="select-wrap">
                <Form layout='horizontal' autoComplete="off">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label=""
                            labelCol={{span: 0}}
                            wrapperCol={{span: 24}}
                            validateStatus={this.renderValidateStyle('select')}
                            help={status.select.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.select.errors && status.select.errors.join(','))}
                        >
                            <Validator rules={this.props.validators}>
                                <Select multiple={this.props.multiple}
                                    combobox={this.props.combobox}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                    name="select"
                                    className="edit-select-item"
                                    showSearch
                                    optionFilterProp="children"
                                    searchPlaceholder={this.props.placeholder}
                                    placeholder={this.props.placeholder}
                                    notFoundContent={Intl.get('common.no.match', '暂无匹配项')}
                                    value={formData.select}
                                    onChange={this.onSelectChange}
                                    getPopupContainer={() => document.getElementById('basic-edit-select-wrap')}
                                >
                                    {this.state.selectOptions}
                                </Select>
                            </Validator>
                        </FormItem>
                    </Validation>
                    <div className="buttons">
                        {!this.props.hideButtonBlock ? buttonBlock : null}
                    </div>
                </Form>
                {errorBlock}
            </div>
        ) : null;

        return (
            <div className={displayCls} id="basic-edit-select-wrap">
                {textBlock}
                {selectBlock}
            </div>
        );
    },
});

module.exports = BasicEditSelectField;

