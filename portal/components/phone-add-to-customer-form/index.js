/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/12/3.
 */

require('./index.less');
import CustomerSuggest from '../basic-edit-field-new/customer-suggest';
import SaveCancelButton from '../detail-card/save-cancel-button';
import PhoneInput from '../phone-input';
import {hasPrivilege} from '../privilege/checker';
import {Form, Input, Select} from 'antd';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
const FormItem = Form.Item;
const Option = Select.Option;
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';


class PhoneAddToCustomerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideCustomerRequiredTip: false,
            phoneNum: this.props.phoneNum,
            isSaving: false,
            saveErrorMsg: '',
            selectedCustomer: {},
            //当前选择客户的已有联系人列表
            contactList: [],
            isLoadingContactList: false
        };
    }

    //编辑联系人的电话
    editContactPhone(contact) {
        this.setState({isSaving: true});
        $.ajax({
            url: '/rest/contact',
            dataType: 'json',
            type: 'put',
            data: {
                customer_id: contact.customer_id,
                id: contact.id,
                phone: contact.phone,
                property: 'phone'
            },
            success: data => {
                if (data) {
                    this.setState({isSaving: false});
                    if (_.isFunction(this.props.afterAddToCustomerSuccess)) {
                        this.props.afterAddToCustomerSuccess({
                            ...this.state.selectedCustomer,
                            contact_name: contact.name
                        });
                    }
                } else {
                    this.setState({isSaving: false, saveErrorMsg: Intl.get('common.save.failed', '保存失败')});
                }
            },
            error: xhr => {
                this.setState({isSaving: false, saveErrorMsg: Intl.get('common.save.failed', '保存失败')});
            }
        });
    }

    //添加联系人
    addContact(contact) {
        this.setState({isSaving: true});
        $.ajax({
            url: '/rest/contact',
            dataType: 'json',
            type: 'post',
            data: contact,
            success: data => {
                if (data && _.isArray(data.result) && data.result[0]) {
                    this.setState({isSaving: false});
                    if (_.isFunction(this.props.afterAddToCustomerSuccess)) {
                        this.props.afterAddToCustomerSuccess({
                            ...this.state.selectedCustomer,
                            contact_name: contact.name
                        });
                    }
                } else {
                    this.setState({isSaving: false, saveErrorMsg: Intl.get('common.save.failed', '保存失败')});
                }
            },
            error: xhr => {
                this.setState({isSaving: false, saveErrorMsg: Intl.get('common.save.failed', '保存失败')});
            }
        });
    }

    //电话添加到已有客户上
    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let contact = _.find(this.state.contactList, item => item.name === values.contact);
            //修改客户已有的联系人，添加一个电话
            if (contact) {
                if (_.get(contact, 'phone[0]')) {
                    contact.phone.push(values.phone);
                } else {
                    contact.phone = [values.phone];
                }
                this.editContactPhone(contact);
            } else {//在此客户上添加一个联系人
                let contact = {
                    customer_id: _.get(this.state, 'selectedCustomer.id'),
                    name: values.contact,
                    phone: [values.phone],
                    customer_name: _.get(this.state, 'selectedCustomer.name')
                };
                this.addContact(contact);
            }
        });
    };

    cancelAddToCustomer = () => {
        if (_.isFunction(this.props.cancelAddToCustomer)) {
            this.props.cancelAddToCustomer();
        }
    };
    customerChoosen = (selectedCustomer) => {
        this.setState({
            selectedCustomer: selectedCustomer
        }, () => {
            this.props.form.validateFields(['customer'], {force: true});
        });
        if (selectedCustomer.id) {
            this.getCustomerContacts(selectedCustomer.id);
        }
    }

    getCustomerContacts(customerId) {
        let type = 'user';//CRM_USER_LIST_CONTACTS
        if (hasPrivilege(crmPrivilegeConst.CRM_MANAGER_LIST_CONTACTS)) {
            type = 'manager';
        }
        this.setState({isLoadingContactList: true});
        $.ajax({
            url: `/rest/crm/contact_list/${type}`,
            dataType: 'json',
            type: 'post',
            data: {query: {id: customerId}},
            success: data => {
                let contactList = _.get(data, 'result', []);
                this.setState({contactList, isLoadingContactList: false});
            },
            error: error => {
                this.setState({contactList: [], isLoadingContactList: false});
            }
        });
    }

    hideCustomerRequiredTip = (flag) => {
        this.setState({
            hideCustomerRequiredTip: flag
        }, () => {
            this.props.form.validateFields(['customer'], {force: true});
        });
    };
    checkCustomerName = (rule, value, callback) => {
        value = $.trim(_.get(this.state, 'selectedCustomer.id'));
        if (!value && !this.state.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    };

    //获取联系人电话验证规则
    getPhoneInputValidateRules() {
        return [{
            required: true,
            validator: (rule, value, callback) => {
                value = _.trim(value);
                if (value) {
                    $.ajax({
                        url: '/rest/crm/customer_only/check',
                        dataType: 'json',
                        type: 'get',
                        data: {phone: value},
                        success: function(data) {
                            if (_.isObject(data) && data.result === 'true') {
                                callback();
                            } else {
                                //已存在
                                let customer_name = _.get(data, 'list[0].name', '');
                                customer_name = _.isEmpty(customer_name) ? '' : `"${customer_name}"`;
                                callback(Intl.get('crm.repeat.phone.user', '该电话已被客户{userName}使用',{userName: customer_name}));
                            }
                        },
                        error: function(errorMsg) {
                            //唯一性验证出错了
                            callback(Intl.get('crm.82', '电话号码验证出错'));
                        }
                    });
                } else {
                    callback(Intl.get('crm.95', '请输入联系人电话'));
                }
            }
        }];
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
            colon: false
        };
        return (
            <Form className="add-to-customer-container" id="add-to-customer-form">
                {this.props.hideTitleFlag ? null : (
                    <div className="add-to-customer-label">
                        {Intl.get('crm.add.to.exist.customer', '添加到已有客户')}
                    </div>)}
                <FormItem
                    label={Intl.get('call.record.customer', '客户')}
                    {...formItemLayout}
                    required={true}
                >
                    {getFieldDecorator('customer', {
                        rules: [{validator: this.checkCustomerName}],
                        initialValue: ''
                    })(
                        <CustomerSuggest
                            field='customer'
                            hasEditPrivilege={true}
                            displayType={'edit'}
                            noJumpToCrm={true}
                            noDataTip={Intl.get('clue.has.no.data', '暂无')}
                            hideButtonBlock={true}
                            customerChoosen={this.customerChoosen}
                            required={true}
                            hideCustomerRequiredTip={this.hideCustomerRequiredTip}
                            canCreateCustomer={false}
                            displayText={''}
                            id={''}
                            customer_name={''}
                            customer_id={''}
                            show_error={this.state.isShowCustomerError}
                        />
                    )}
                </FormItem>
                {_.get(this.state, 'selectedCustomer.id') ? (
                    <div className="customer-contact-wrap">
                        <FormItem
                            label={Intl.get('call.record.contacts', '联系人')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('contact', {
                                rules: [{
                                    required: true,
                                    message: _.get(this.state, 'contactList[0]') ? Intl.get('crm.select.add.contact', '请选择或输入联系人名称') : Intl.get('crm.fill.contact.name', '请输入联系人名称')
                                }],
                                initialValue: ''
                            })(
                                <Select size="large" placeholder={Intl.get('crm.select.add.contact', '请选择或添加联系人')}
                                    combobox
                                    getPopupContainer={() => document.getElementById('add-to-customer-form')}
                                    filterOption={(input, option) => ignoreCase(input, option)}
                                >
                                    {_.map(this.state.contactList, (contact, index) => {
                                        return (<Option value={contact.name} key={index}>{contact.name}</Option>);
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <PhoneInput
                            {...formItemLayout}
                            placeholder={Intl.get('crm.95', '请输入联系人电话')}
                            validateRules={this.getPhoneInputValidateRules()}
                            initialValue={this.state.phoneNum}
                            id='phone'
                            label={Intl.get('common.phone', '电话')}
                            form={this.props.form}
                        />
                    </div>) : null}
                <FormItem
                    wrapperCol={{span: 24}}>
                    <SaveCancelButton loading={this.state.isSaving}
                        saveErrorMsg={this.state.saveErrorMsg}
                        handleSubmit={this.handleSubmit}
                        handleCancel={this.cancelAddToCustomer}
                    />
                </FormItem>
            </Form>
        );
    }
}

PhoneAddToCustomerForm.propTypes = {
    hideTitleFlag: PropTypes.bool,//是否隐藏标题
    phoneNum: PropTypes.string,
    form: PropTypes.object,
    afterAddToCustomerSuccess: PropTypes.func,
    cancelAddToCustomer: PropTypes.func,
};

export default Form.create()(PhoneAddToCustomerForm);