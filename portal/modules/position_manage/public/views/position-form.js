var React = require('react');
var createReactClass = require('create-react-class');
import {Form, Input, Button, Select, Checkbox } from 'antd';
const Validation = require('rc-form-validation-for-react16');
const FormItem = Form.Item;
const Option = Select.Option;
const Validator = Validation.Validator;
import classNames from 'classnames';
import { RightPanelClose, RightPanelCancel, RightPanelSubmit } from 'CMP_DIR/rightPanel';
import PositionAjax from '../ajax/index';
import PositionStore from '../store/index';
import PositionAction from '../action/index';
import * as LANGLOBAL from '../consts';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
const POSITION_AREA_OPTIONS = {
    CS: 'changsha',
    JN: 'jinan',
    BJ: 'beijing'
};
const BatchPositionForm = createReactClass({
    displayName: 'BatchPositionForm',
    mixins: [Validation.FieldMixin],

    getInitialState: function() {
        return {
            status: {
                phoneOrder: {}
            },
            formData: {
                phoneOrder: '',
                member: '',
                realm_id: ''
            },
            isBindMember: false, // 新添加的座席号是否绑定用户，默认不绑定
            areaValue: 'changsha',
            errMsg: '' // 添加座席号的错误信息
        };
    },

    // 获取组织id
    getOrganizationId(selectValue) {
        let organizationList = PositionStore.getState().realmList;
        return _.chain(organizationList).filter(item => selectValue.indexOf(item.realm_name) > -1).map('realm_id').value();
    },

    componentWillUpdate(nextProps, nextState) {
        let formData = this.state.formData;
        if (formData.realm_id !== nextState.formData.realm_id && nextState.formData.realm_id) {
            let SelectId = this.getOrganizationId(nextState.formData.realm_id)[0];
            PositionAction.getUnbindMemberList({realm: SelectId});
        }
    },

    // 地域的选择
    selectAreaValue(value) {
        let selectOptions = 'changsha';
        if (value === POSITION_AREA_OPTIONS.JN) {
            selectOptions = POSITION_AREA_OPTIONS.JN;
        } else if (value === POSITION_AREA_OPTIONS.BJ) {
            selectOptions = POSITION_AREA_OPTIONS.BJ;
        }
        this.setState({
            areaValue: selectOptions
        });
    },

    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;
        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });
        return classes;
    },

    // 校验输入的座席号（数字即可，对位数没有限制）
    checkPhoneOrder(rule, value, callback) {
        value = _.trim(value);
        if (value) {
            if (/^[0-9]*$/.test(value)) {
                callback();
            } else {
                callback(new Error(LANGLOBAL.POSITION.tips)); // 请输入数字
            }
        } else {
            callback();
        }
    },

    // 关闭添加座席号前，要清空表单中的数据
    resetForm() {
        this.setState({
            areaValue: 'changsha',
            errMsg: '',
            isBindMember: false,
            formData: {
                phoneOrder: ''
            }
        });
    },

    // 获取用户id
    getUnbindMemberId(selectValue) {
        var unbindMemberList = PositionStore.getState().unbindMember.data;
        return _.chain(unbindMemberList).filter(item => selectValue.indexOf(item.nick_name) > -1).map('user_id').value();
    },

    // 提交保存
    handleSubmit() {
        let queryObj = {
            phone_order: this.state.formData.phoneOrder,
            phone_order_location: this.state.areaValue
        };
        if (this.state.isBindMember) {
            queryObj.realm = this.getOrganizationId(this.state.formData.realm_id)[0];
            queryObj.user_id = this.getUnbindMemberId(this.state.formData.member)[0];
        }
        let validation = this.refs.validation;
        validation.validate( (valid) => {
            if (!valid) {
                return;
            } else {
                PositionAjax.addPhoneOrder(queryObj).then( (result) => {
                    if (_.isObject(result) && !_.isEmpty(result)) {
                        PositionAction.addPosition(result);
                        this.props.closeRightPanel();
                    }
                    this.resetForm();
                }, (errMsg) => {
                    this.setState({
                        errMsg: errMsg
                    });
                });
            }
        } );
    },

    // 关闭添加座席号面板
    closeRightPanel() {
        this.props.closeRightPanel();
        this.resetForm();
    },

    // 渲染组织列表
    renderOrganizationOptions() {
        let organizationOption = ''; // 组织列表
        let organizationList = PositionStore.getState().realmList;
        if (_.isArray(organizationList) && organizationList.length > 0) {
            organizationOption = organizationList.map( (item) => {
                return (<Option key={item.realm_id} value={item.realm_name}>
                    {item.realm_name}
                </Option>);
            });
        } else {
            organizationOption = <Option value=''>{LANGLOBAL.ORGANIZATION.option}</Option>;
        }
        return organizationOption;
    },

    //渲染未绑定的用户下拉列表
    renderMemberOptions() {
        //未绑定的用户列表
        var unbindMemberOptions = '';
        var unbindMemberList = PositionStore.getState().unbindMember.data;
        if (_.isArray(unbindMemberList) && unbindMemberList.length > 0) {
            unbindMemberOptions = unbindMemberList.map( (item) => {
                return (<Option key={item.user_id} value={item.nick_name}>
                    {item.nick_name}
                </Option>);
            });
        } else {
            unbindMemberOptions = <Option value=''>{LANGLOBAL.USER.unbind}</Option>;
        } 
        return unbindMemberOptions;
    },

    // 鼠标放在座席号的输入框中
    focusPositionInput() {
        this.setState({
            errMsg: ''
        });
    },

    handleCheckBox(event) {
        this.setState({
            isBindMember: event.target.checked
        });
    },

    render() {
        let formData = this.state.formData;
        let status = this.state.status;
        return (
            <div className='add-position-form'>
                <RightPanelClose onClick={this.closeRightPanel}/>
                <div className='add-position-content'>
                    <Form layout='horizontal' autoComplete='off'>
                        <Validation ref='validation' onValidate={this.handleValidate}>
                            <FormItem
                                label={LANGLOBAL.CITY.area} // 地域
                                id='area'
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                            >
                                <Select
                                    value={this.state.areaValue}
                                    onChange={this.selectAreaValue}
                                >
                                    <Option value={POSITION_AREA_OPTIONS.CS}>
                                        <span>{LANGLOBAL.CITY.cs}</span>
                                    </Option>
                                    <Option value={POSITION_AREA_OPTIONS.JN}>
                                        <span>{LANGLOBAL.CITY.jn}</span>
                                    </Option>
                                    <Option value={POSITION_AREA_OPTIONS.BJ}>
                                        <span>{LANGLOBAL.CITY.bj}</span>
                                    </Option>
                                </Select>
                            </FormItem>
                            <FormItem
                                label={LANGLOBAL.POSITION.number} // 座席号
                                id='phoneOrder'
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('phoneOrder')}
                                help={status.phoneOrder.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.phoneOrder.errors && status.phoneOrder.errors.join(','))}
                            >
                                <Validator rules={[{validator: this.checkPhoneOrder}]}>
                                    <Input name='phoneOrder' id='phoneOrder' value={formData.phoneOrder}
                                        onChange={this.setField.bind(this, 'phoneOrder')}
                                        onFocus ={this.focusPositionInput}
                                    />
                                </Validator>
                            </FormItem>
                            {this.state.errMsg && <div className='has-error-tips'>{this.state.errMsg}</div>}
                            <FormItem wrapperCol={{span: 22}}>
                                <Checkbox
                                    name='isBindMember'
                                    id='isBindMember'
                                    checked={this.state.isBindMember}
                                    onChange={this.handleCheckBox}
                                />
                                <span style={{'fontSize': '14px','color': '#5d5d5d'}}>{LANGLOBAL.USER.bind}</span>
                            </FormItem>
                            {this.state.isBindMember && <FormItem
                                label={LANGLOBAL.ORGANIZATION.select} // 选择组织
                                id='realm_id'
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                            >
                                <Select name='realm_id'
                                    id='realm_id'
                                    placeholder={LANGLOBAL.ORGANIZATION.first} // 请先选择组织
                                    notFoundContent={LANGLOBAL.ORGANIZATION.tips} // 暂无此组织
                                    showSearch
                                    searchPlaceholder={LANGLOBAL.ORGANIZATION.placeholder} // 输入组织名称搜索
                                    value={formData.realm_id}
                                    onChange={this.setField.bind(this, 'realm_id')}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                >
                                    {this.renderOrganizationOptions()}
                                </Select>
                            </FormItem> }
                            {this.state.isBindMember && formData.realm_id && <FormItem
                                label={LANGLOBAL.USER.bind} // 绑定用户
                                id='member'
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                            >
                                <Select name='member'
                                    id='member'
                                    placeholder={LANGLOBAL.USER.first} // 请绑定用户
                                    notFoundContent={LANGLOBAL.USER.tips} // 暂无此用户
                                    showSearch
                                    searchPlaceholder={LANGLOBAL.USER.placeholder} // 输入用户名称搜索
                                    value={formData.member}
                                    onChange={this.setField.bind(this, 'member')}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                >
                                    {this.renderMemberOptions()}
                                </Select>
                            </FormItem>}
                            <FormItem wrapperCol={{span: 22}}>
                                <RightPanelCancel onClick={this.closeRightPanel} >
                                    <ReactIntl.FormattedMessage id='common.cancel' defaultMessage='取消' />
                                </RightPanelCancel>
                                <RightPanelSubmit onClick={this.handleSubmit}>
                                    <ReactIntl.FormattedMessage id='common.save' defaultMessage='保存'/>
                                </RightPanelSubmit>
                            </FormItem>
                        </Validation>
                    </Form>
                </div>
            </div>
        );
    },
});

module.exports = BatchPositionForm;
