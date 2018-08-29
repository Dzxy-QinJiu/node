var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * select(下拉选择框)显示、编辑 的组件
 * 可切换状态
 */
require('./css/basic-edit-field.less');
import {Form, Select} from 'antd';
var classNames = require('classnames');
import FieldMixin from '../antd-form-fieldmixin';
var FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';

let BasicEditSelectField = createReactClass({
    displayName: 'BasicEditSelectField',
    mixins: [FieldMixin],

    getDefaultProps: function() {
        return {
            id: '',
            //是否是多选(默认：单选)
            multiple: false,
            //是否是输入框自动提示模式
            combobox: false,
            //是否匹配选项
            filterOption: true,
            //字段
            field: 'role',
            //编辑区的宽度
            width: '100%',
            //无数据时的提示（没有修改权限时提示没有数据）
            noDataTip: '',
            //添加数据的提示（有修改权限时，提示补充数据）
            addDataTip: '',
            //是否有修改权限
            hasEditPrivilege: false,
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
            //编辑按钮的提示文案
            editBtnTip: Intl.get('common.update', '修改'),
            onDisplayTypeChange: function(type) {
            },
            saveEditSelect: function() {
            },
            hideButtonBlock: false,
            hoverShowEdit: true
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
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    },

    handleSubmit: function(e) {
        var validation = this.refs.validation;
        validation.validate((valid) => {
            if (!valid) {
                return;
            }
            Trace.traceEvent(e, '保存对' + this.props.field + '的修改');
            var value = this.state.formData.select;
            var saveObj = {id: this.props.id};
            saveObj[this.props.field] = value;
            this.setState({loading: true});
            const setDisplayState = (displayText) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: value,
                    displayType: 'text',
                    displayText: displayText || ''
                });
            };
            if (value !== this.state.value) {
                this.props.saveEditSelect(saveObj, () => {
                    //如果select是combox格式的这样写就不对
                    let curOptions = _.find(this.state.selectOptions, option => option.props && option.props.value === value);
                    let displayText = _.get(curOptions,'props') ? curOptions.props.children : '';
                    //如果是可以手动输入内容的情况,就用后端提交的
                    if (this.props.combobox){
                        displayText = value;
                    }
                    setDisplayState(displayText);
                }, (errorMsg) => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                    });
                });
            } else {
                setDisplayState(this.state.displayText);
            }
        });
    },

    handleCancel: function(e) {
        Trace.traceEvent(e, '取消对' + this.props.field + '修改');
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
        _.isFunction(this.props.cancelEditField) && this.props.cancelEditField();
    },

    onSelectChange: function(selectVal) {
        var formData = this.state.formData;
        formData.select = selectVal;
        this.setState({
            formData: formData
        });
    },

    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var displayCls = classNames({
            'basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var textBlock = null;
        if (this.state.displayType === 'text') {
            var cls = classNames('edit-container',{
                'hover-show-edit': this.props.hoverShowEdit && this.props.hasEditPrivilege
            });
            if (this.state.displayText) {
                textBlock = (
                    <div className={cls}>
                        <span className="inline-block basic-info-text">
                            {this.state.displayText}
                        </span>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.setEditable.bind(this)}/>) : null
                        }
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


        var selectBlock = this.state.displayType === 'edit' ? (
            <div className="selectWrap" ref="selectWrap" key="select-wrap">
                <Form layout='horizontal' autoComplete="off" style={{width: this.props.width || '100%'}}>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            labelCol={{span: 0}}
                            wrapperCol={{span: 24}}
                            validateStatus={this.renderValidateStyle('select')}
                            help={status.select.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.select.errors && status.select.errors.join(','))}
                        >
                            <Validator rules={this.props.validators}>
                                <Select multiple={this.props.multiple}
                                    combobox={this.props.combobox}
                                    filterOption={this.props.filterOption}
                                    name="select"
                                    className="edit-select-item"
                                    showSearch
                                    optionFilterProp="children"
                                    searchPlaceholder={this.props.placeholder}
                                    placeholder={this.props.placeholder}
                                    notFoundContent={Intl.get('common.no.match', '暂无匹配项')}
                                    value={formData.select}
                                    onChange={this.onSelectChange}>
                                    {this.state.selectOptions}
                                </Select>
                            </Validator>
                        </FormItem>
                    </Validation>
                    <div className="buttons">
                        {!this.props.hideButtonBlock ?
                            <SaveCancelButton loading={this.state.loading}
                                saveErrorMsg={this.state.submitErrorMsg}
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                            /> : null}
                    </div>
                </Form>
            </div>
        ) : null;

        return (
            <div className={displayCls}>
                {textBlock}
                {selectBlock}
            </div>
        );
    },
});

module.exports = BasicEditSelectField;

