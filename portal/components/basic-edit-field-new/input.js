const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * input(输入框)显示、编辑 的组件
 * 可切换状态
 */
require('./css/basic-edit-field.less');
import {Form, Input} from 'antd';
var crypto = require('crypto');
var classNames = require('classnames');
var secretPassword = '';
var FormItem = Form.Item;
import FieldMixin from '../antd-form-fieldmixin/index';
import {PassStrengthBar} from '../password-strength-bar';
import Trace from 'LIB_DIR/trace';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';
import { parseAmount } from 'LIB_DIR/func';

const BasicEditField = React.createClass({
    mixins: [FieldMixin],
    getDefaultProps: function() {
        return {
            id: '1',
            //类型 input、textarea或password、number
            type: 'input',
            //字段
            field: 'email',
            //是否有修改权限
            hasEditPrivilege: false,
            //验证条件
            validators: [{}],
            //请填写
            placeholder: Intl.get('user.email.write.tip', '请填写邮箱'),
            //显示的值
            value: '',
            //input编辑区的宽度
            width: '100%',
            //无数据时的提示（没有修改权限时提示没有数据）
            noDataTip: '',
            //添加数据的提示（有修改权限时，提示补充数据）
            addDataTip: '',
            //编辑按钮的提示文案
            editBtnTip: Intl.get('common.update', '修改'),
            //修改成功
            modifySuccess: function() {
            },
            onDisplayTypeChange: function() {
            },
            onValueChange: function() {
            },
            saveEditInput: function() {
            },
            //行数
            rows: 5,
            //是否展示密码强度
            showPasswordStrength: false,
            //属性值后面紧跟的提示信息
            afterValTip: ''
        };
    },
    getInitialState: function() {
        var type = this.props.type, value = this.props.value;
        if (type === 'password') {
            value = secretPassword;
        }
        return {
            loading: false,
            displayType: this.props.displayType || 'text',
            formData: {
                input: this.props.value
            },
            status: {
                input: {}
            },
            value: value,
            submitErrorMsg: '',
            //密码强度
            passStrength: {
                passBarShow: false
            }
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id) {
            var type = nextProps.type, value = nextProps.value;
            if (type === 'password') {
                value = secretPassword;
            }
            this.setState({
                value: value,
                formData: {
                    input: value
                }
            });
        }
    },
    setEditable: function(e) {
        var formData = this.state.formData;
        formData.input = this.state.value;
        this.setState({
            displayType: 'edit',
            formData: formData,
            passStrength: {
                passBarShow: false
            }
        }, function() {
            var dom = $('input[type="text"],input[type="password"],textarea', this.refs.inputWrap)[0];
            var val = dom.value;
            if (dom.createTextRange) {//IE浏览器
                var range = dom.createTextRange();
                range.moveEnd('character', val.length);
                range.moveStart('character', val.length);
                range.select();
            } else {//非IE浏览器
                dom.setSelectionRange(val.length, val.length);
                dom.focus();
            }
        });
        this.props.onDisplayTypeChange('edit');
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    },
    md5: function(value) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(value);
        return md5Hash.digest('hex');
    },
    handleSubmit: function(e) {
        var validation = this.refs.validation;
        Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
        validation.validate(valid => {
            if (!valid) {
                return;
            }
            var value = this.state.formData.input;
            var saveObj = {};
            //客户详情编辑参数为id
            if (this.props.id) {
                saveObj.id = this.props.id;
            }
            //用户详情编辑参数为user_id
            if (this.props.user_id) {
                saveObj.user_id = this.props.user_id;
            }
            if (this.props.type === 'password') {
                saveObj[this.props.field] = this.md5(value);
            } else {
                saveObj[this.props.field] = value;
            }
            this.setState({loading: true});
            const setDisplayState = () => {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: this.props.type === 'password' ? secretPassword : value,
                    displayType: 'text'
                });
            };
            if ((this.props.type === 'password' && value !== secretPassword)
                || (value !== this.state.value)) {
                this.props.saveEditInput(saveObj, () => {
                    setDisplayState();
                }, errorMsg => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                    });
                });
            } else {
                setDisplayState();
            }
        });
    },
    handleCancel: function(e) {
        var oldValue = this.props.type === 'password' ? secretPassword : this.state.value;
        var formData = this.state.formData;
        var status = this.state.status;
        formData.input = oldValue;
        status.input = {};
        this.setState({
            formData: formData,
            status: status,
            displayType: 'text',
            submitErrorMsg: ''
        });
        this.props.onDisplayTypeChange('text');
        Trace.traceEvent(e, '取消对' + this.props.field + '的修改');
    },
    onFocusInput: function(type, event) {
        if (type === 'password') {
            var currentValue = event.target.value;
            if (currentValue === secretPassword) {
                var formData = this.state.formData;
                formData.input = '';
                this.setState({
                    formData: formData
                });
            }
        }
    },
    onBlurInput: function(type, event) {
        if (type === 'password') {
            var currentValue = event.target.value;
            if (currentValue === '') {
                var formData = this.state.formData;
                formData.input = secretPassword;
                this.setState({
                    formData: formData
                });
            }
        }
    },
    onInputChange: function(e) {
        this.setField.bind(this, 'input', e);
        this.props.onValueChange();
    },
    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var displayCls = classNames({
            'basic-edit-field-input': this.props.type !== 'textarea',
            'basic-edit-field-textarea': this.props.type === 'textarea',
            'basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });
        var textBlock = null;
        if (this.state.displayType === 'text') {
            var displayText = this.props.type === 'password' ? Intl.get('user.password.tip', '保密中') : this.state.value;
            //如果是数字类型，展示时，千分位加，分隔的处理
            if(this.props.type === 'number' && displayText){
                displayText = parseAmount(displayText);
            }
            if (displayText) {
                textBlock = (
                    <div>
                        <span className="inline-block basic-info-text">
                            {displayText}{this.props.afterValTip || ''}
                        </span>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.setEditable.bind(this)}/>) : null}
                    </div>);
            } else {
                textBlock = (
                    <span className="inline-block basic-info-text no-data-descr">
                        {this.props.hasEditPrivilege ? (
                            <a onClick={this.setEditable.bind(this)}>{this.props.addDataTip}</a>) : this.props.noDataTip}

                    </span>
                );
            }
        }

        var inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <Form horizontal autoComplete="off" style={{width: this.props.width || '100%'}}>
                    <input type="password" style={{display: 'none'}} name="input" autoComplete="off"/>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            labelCol={{span: 0}}
                            wrapperCol={{span: 24}}
                            validateStatus={this.renderValidateStyle('input')}
                            help={status.input.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.input.errors && status.input.errors.join(','))}
                        >
                            <Validator rules={this.props.validators}>
                                {this.props.type === 'textarea' ?
                                    <Input name="input"
                                        type={this.props.type}
                                        placeholder={this.props.placeholder}
                                        value={formData.input}
                                        onChange={this.onInputChange}
                                        autoComplete="off"
                                        onFocus={this.onFocusInput.bind(this, this.props.type)}
                                        onBlur={this.onBlurInput.bind(this, this.props.type)}
                                        autosize={{minRows: 2, maxRows: 6}}
                                    />
                                    : <Input name="input"
                                        type={this.props.type}
                                        placeholder={this.props.placeholder}
                                        value={formData.input}
                                        onChange={this.onInputChange}
                                        autoComplete="off"
                                        onFocus={this.onFocusInput.bind(this, this.props.type)}
                                        onBlur={this.onBlurInput.bind(this, this.props.type)}
                                        addonAfter={this.props.afterValTip || ''}
                                    />}
                            </Validator>
                        </FormItem>
                    </Validation>
                    {!this.props.hideButtonBlock ?
                        <SaveCancelButton loading={this.state.loading}
                            saveErrorMsg={this.state.submitErrorMsg}
                            handleSubmit={this.handleSubmit}
                            handleCancel={this.handleCancel}
                        /> : null}
                </Form>
            </div>
        ) : null;

        var passwordStrengthBlock = this.props.showPasswordStrength && this.state.displayType === 'edit' && this.state.formData.input && this.state.passStrength.passBarShow ? (
            <PassStrengthBar passStrength={this.state.passStrength.passStrength}/>
        ) : null;

        return (
            <div className={displayCls}>
                {textBlock}
                {inputBlock}
                {passwordStrengthBlock}
            </div>
        );
    }
});

module.exports = BasicEditField;
