var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
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
import {parseAmount} from 'LIB_DIR/func';
import ShearContent from '../shear-content';
var uuid = require('uuid/v4');

const BasicEditField = createReactClass({
    displayName: 'BasicEditField',
    mixins: [FieldMixin],
    propTypes: {
        type: PropTypes.string,
        displayType: PropTypes.string,
        displayText: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
        afterTextTip: PropTypes.string,
        onDisplayTypeChange: PropTypes.func,
        id: PropTypes.string,
        field: PropTypes.string,
        saveEditInput: PropTypes.func,
        cancelEditInput: PropTypes.func,
        onValueChange: PropTypes.func,
        hoverShowEdit: PropTypes.bool,
        hasEditPrivilege: PropTypes.bool,
        editBtnTip: PropTypes.string,
        addDataTip: PropTypes.string,
        noDataTip: PropTypes.string,
        width: PropTypes.number,
        validators: PropTypes.array,
        afterValTip: PropTypes.string,
        placeholder: PropTypes.string,
        hideButtonBlock: PropTypes.string,
        okBtnText: PropTypes.string,
        cancelBtnText: PropTypes.string,
        showPasswordStrength: PropTypes.bool,
        textCut: PropTypes.bool,
        showEditText: PropTypes.bool,
    },
    getDefaultProps: function() {
        return {
            id: '1',
            //类型 input、textarea或password、number
            type: 'input',
            //字段
            field: '',
            //是否有修改权限
            hasEditPrivilege: false,
            //验证条件
            validators: [{}],
            //请填写
            placeholder: '',
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
            cancelEditInput: function() {
            },
            //行数
            rows: 5,
            //是否展示密码强度
            showPasswordStrength: false,
            //属性值后面紧跟的提示信息
            afterValTip: '',
            //保存按钮的文字展示
            okBtnText: '',
            //取消按钮的文字展示
            cancelBtnText: '',
            hoverShowEdit: true,
            //展示内容后面跟的提示信息
            afterTextTip: '',
            //超过3行是否截断
            textCut: false,
            showEditText: false//是否展示成编辑状态
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
            afterTextTip: this.props.afterTextTip || '',
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
            },
            setRandomInputId: uuid(),
            showEditText: this.props.showEditText
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id || !_.isEqual(this.props.value, nextProps.value)) {
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
        if(nextProps.displayType && nextProps.displayType !== this.state.displayType){
            this.setState({displayType: nextProps.displayType});
        }
        this.setState({
            showEditText: nextProps.showEditText
        });
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
                if (this['changeInput' + this.state.setRandomInputId]) {
                    this['changeInput' + this.state.setRandomInputId].focus();
                }
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
            var value = _.trim(this.state.formData.input);
            var saveObj = {
                id: this.props.id
            };
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
        if (_.isFunction(this.props.onDisplayTypeChange)) this.props.onDisplayTypeChange('text');
        if (_.isFunction(this.props.cancelEditInput)) this.props.cancelEditInput();
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
        var showEditText = this.state.showEditText && !this.state.value;//直接展示编辑状态
        if (this.state.displayType === 'text' && !showEditText) {

            var displayText = this.props.type === 'password' ? Intl.get('user.password.tip', '保密中') : this.state.value;
            //如果是数字类型，展示时，千分位加，分隔的处理
            if (this.props.type === 'number' && displayText) {
                displayText = parseAmount(displayText);
            }
            var cls = classNames('edit-container',{
                'hover-show-edit': this.props.hoverShowEdit && this.props.hasEditPrivilege
            });
            if (displayText) {
                let textContent = displayText;
                if (this.props.textCut) {
                    textContent = (
                        <ShearContent>
                            {displayText}
                        </ShearContent>
                    );
                }
                textBlock = (
                    <div className={cls}>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.setEditable.bind(this)}/>) : null}
                        <span className="inline-block basic-info-text">
                            {textContent}{this.props.afterTextTip || ''}
                        </span>
                    </div>);
            } else {
                textBlock = (
                    <span className="inline-block basic-info-text no-data-descr">
                        {this.props.hasEditPrivilege ? (
                            <a onClick={this.setEditable.bind(this)} className="handle-btn-item">{this.props.addDataTip}</a>) : <span className="no-data-descr-nodata">{this.props.noDataTip}</span>}

                    </span>
                );
            }
        }

        var inputBlock = this.state.displayType === 'edit' || showEditText ? (
            <div className="inputWrap" ref="inputWrap">
                <Form layout='horizontal' autoComplete="off" style={{width: this.props.width || '100%'}}>
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
                                        ref={changeInput => this['changeInput' + this.state.setRandomInputId] = changeInput}
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
                                        ref={changeInput => this['changeInput' + this.state.setRandomInputId] = changeInput}     
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
                            okBtnText={this.props.okBtnText}
                            cancelBtnText={this.props.cancelBtnText}
                            hideCancelBtns={showEditText}
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
    },
});

module.exports = BasicEditField;

