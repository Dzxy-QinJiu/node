var Form = require("antd").Form;
var FormItem = Form.Item;
var Validation = require("antd").Validation;
var Validator = Validation.Validator;
var Input = require("antd").Input;
var Button = require("antd").Button;
var Icon = require("antd").Icon;
var Select = require("antd").Select;
var RightPanelReturn = require("../../../../../components/rightPanel").RightPanelReturn;
var Option = Select.Option;
var ContactUtil = require("../../utils/contact-util");
var ValidateUtil = require("../../utils/validate-util");
var ContactAction = require("../../action/contact-action");
var Spinner = require('../../../../../components/spinner');
var Message = require("antd").message;
import PhoneInput from "CMP_DIR/phone-input";
import Trace from "LIB_DIR/trace";

function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function (className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}
var ContactForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function () {
        return {
            contact: ContactUtil.newViewContactObject(),
            type: 'add'
        };
    },
    //联系方式的数组展开放到对应的formData中
    formatContact: function (type, contactData, formData, status) {
        if (contactData && _.isArray(contactData)) {
            for (var i = 0, len = contactData.length; i < len; i++) {
                formData[type + i] = contactData[i];
                status[type + i] = {};
            }
        }
    },
    getInitialState: function () {
        var contact = this.props.contact.contact;
        var formData = {
            id: contact.id,
            customer_id: contact.customer_id,
            name: contact.name,
            position: contact.position,
            role: contact.role,
            //phone: contact.phone,
            //mphone: contact.phone,
            //qq: contact.qq,
            //weChat: contact.weChat,
            //email: contact.email,
            department: contact.department,
            def_contancts: contact.def_contancts
        };
        var status = {
            name: {},
            position: {},
            department: {},
            role: {}
        };

        this.formatContact("phone", contact.phone, formData, status);
        this.formatContact("qq", contact.qq, formData, status);
        this.formatContact("weChat", contact.weChat, formData, status);
        this.formatContact("email", contact.email, formData, status);

        return {
            status: status,
            isLoading: false,
            showNeedContact: false,
            formData: formData,
            errorMsg: ''
        };
    },

    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = cx({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    addContactWay: function (type) {
        var _this = this;
        return function () {
            ContactAction.addContactWay(_this.props.contact, type);
            Trace.traceEvent(_this.getDOMNode(),"添加新建联系人的联系方式" + type);
        };
    },

    removeContactWay: function (type, index) {
        var _this = this;
        return function () {
            Trace.traceEvent(_this.getDOMNode(),"删除新建联系人的联系方式" + type);
            ContactAction.removeContactWay(_this.props.contact, type, index);
            delete _this.state.formData[type + index];
            _this.setState({formData: _this.state.formData});
        };
    },

    handleSubmit: function (e) {
        e.preventDefault();
        var validation = this.refs.validation;
        validation.validate(valid => {
            const phoneInputRef = this.phoneInputRef;

            if (phoneInputRef) {
                //存在电话输入框时，验证一下填写的电话是否符合要求
                phoneInputRef.props.form.validateFields(["phone"], {}, (errors, values) => {
                    if (!valid || errors) {
                        return;
                    } else {
                        this.doSubmit();
                    }
                });
            } else {
                if (!valid) {
                    return;
                } else {
                    this.doSubmit();
                }
            }
        });
    },

    doSubmit: function () {
        var formData = _.extend({}, this.state.formData);
        var phoneArray = [], qqArray = [], weChatArray = [], emailArray = [];
        for (var key in formData) {
            if (key.indexOf("phone") != -1) {
                phoneArray.push($.trim(formData[key]));
                delete formData[key];
            } else if (key.indexOf("qq") != -1) {
                qqArray.push($.trim(formData[key]));
                delete formData[key];
            } else if (key.indexOf("weChat") != -1) {
                weChatArray.push($.trim(formData[key]));
                delete formData[key];
            } else if (key.indexOf("email") != -1) {
                emailArray.push($.trim(formData[key]));
                delete formData[key];
            }
        }

        //提示至少需要添加一种联系方式
        if (phoneArray.concat(qqArray, weChatArray, emailArray).length == 0) {
            this.setState({showNeedContact: true});
            return;
        }

        if (phoneArray.length > 0) {
            formData.phone = this.props.isMerge ? phoneArray : JSON.stringify(phoneArray);
        }
        if (qqArray.length > 0) {
            formData.qq = this.props.isMerge ? qqArray : JSON.stringify(qqArray);
        }
        if (weChatArray.length > 0) {
            formData.weChat = this.props.isMerge ? weChatArray : JSON.stringify(weChatArray);
        }
        if (emailArray.length > 0) {
            formData.email = this.props.isMerge ? emailArray : JSON.stringify(emailArray);
        }

        if (this.props.type === 'add') {
            //显示loading状态
            this.setState({isLoading: true});
            formData.customer_id = this.props.customer_id;
            Trace.traceEvent(this.getDOMNode(),"保存新建联系人的信息");
            ContactAction.submitAddContact(formData, (errorMsg) => {
                this.state.errorMsg = errorMsg || '';
                this.state.isLoading = false;
                if (!errorMsg) {
                    this.props.refreshCustomerList(formData.customer_id);
                } else {
                    Message.error(errorMsg);
                }
                this.setState(this.state);
            });
        } else {
            Trace.traceEvent(this.getDOMNode(),"保存对当前联系人信息的修改");
            if (this.props.isMerge) {
                //合并重复客户时的处理
                this.props.updateMergeCustomerContact(formData);
            } else {
                //显示loading状态
                this.setState({isLoading: true});
                ContactAction.submitEditContact(formData, (errorMsg) => {
                    this.state.errorMsg = errorMsg || '';
                    this.state.isLoading = false;
                    if (!errorMsg) {
                        this.props.refreshCustomerList(formData.customer_id);
                    } else {
                        Message.error(errorMsg);
                    }
                    this.setState(this.state);
                });
            }
        }
    },

    cancel: function () {
        if (this.props.type === 'add') {
            Trace.traceEvent(this.getDOMNode(),"取消保存新建联系人的信息");
            ContactAction.hideAddContactForm();
        } else {
            Trace.traceEvent(this.getDOMNode(),"取消更改当前联系人的信息");
            ContactAction.hideEditContactForm(this.props.contact);
        }
    },
    handleSelect: function () {
        Trace.traceEvent(this.getDOMNode(),"新建/修改联系人的角色");
    },
    render: function () {
        var formData = this.state.formData;
        var status = this.state.status;
        var contact = this.props.contact;
        var _this = this;
        //联系方式的填充及展示
        var contactWayPhone = contact.contactWayAddObj.phone ? contact.contactWayAddObj.phone.map(function (phone, index) {
            var phoneKey = "phone" + index;

            if (!status[phoneKey]) {
                formData[phoneKey] = "";
                status[phoneKey] = {};
            }

            return (
                <PhoneInput
                    wrappedComponentRef={(inst) => _this.phoneInputRef = inst}
                    placeholder={Intl.get("crm.95", "请输入联系人电话")}
                    initialValue={formData[phoneKey]}
                    labelCol={{span:5}}
                    wrapperCol={{span:19}}
                    key={index}
                    onChange={_this.setField.bind(_this, phoneKey)}
                    suffix={(
                        <div className="circle-button crm-contact-contactway-minus"
                             onClick={_this.removeContactWay("phone",index)}>
                            <Icon type="minus"/>
                        </div>
                    )}
                />
            );
        }) : "";
        var contactWayQq = contact.contactWayAddObj.qq ? contact.contactWayAddObj.qq.map(function (qq, index) {
            var qqKey = "qq" + index;
            status[qqKey] = {};
            return (
                <FormItem
                    label="QQ"
                    labelCol={{span:5}}
                    wrapperCol={{span:19}}
                    key={index}
                >
                    <Input name={qqKey} value={formData[qqKey]}
                           onChange={_this.setField.bind(_this, qqKey)}
                           data-tracename="填写新建联系人的QQ"
                    />
                    <div className="circle-button crm-contact-contactway-minus"
                         onClick={_this.removeContactWay("qq",index)}>
                        <Icon type="minus"/>
                    </div>
                </FormItem>
            );
        }) : "";
        var contactWayWechat = contact.contactWayAddObj.weChat ? contact.contactWayAddObj.weChat.map(function (weChat, index) {
            var weChatKey = "weChat" + index;
            status[weChatKey] = {};
            return (
                <FormItem
                    label={Intl.get("crm.58", "微信")}
                    labelCol={{span:5}}
                    wrapperCol={{span:19}}
                >
                    <Input name={weChatKey} value={formData[weChatKey]}
                           onChange={_this.setField.bind(_this, weChatKey)}
                           data-tracename="填写新建联系人的微信"
                    />
                    <div className="circle-button crm-contact-contactway-minus"
                         onClick={_this.removeContactWay("weChat",index)}>
                        <Icon type="minus"/>
                    </div>
                </FormItem>
            );
        }) : "";
        var contactWayEmail = contact.contactWayAddObj.email ? contact.contactWayAddObj.email.map(function (email, index) {
            var emailKey = "email" + index;
            status[emailKey] = {};
            return (
                <FormItem
                    label={Intl.get("common.email", "邮箱")}
                    labelCol={{span:5}}
                    wrapperCol={{span:19}}
                    key={index}
                >
                    <Input name={emailKey} value={formData[emailKey]}
                           onChange={_this.setField.bind(_this, emailKey)}
                           data-tracename="填写新建联系人的邮箱"
                    />
                    <div className="circle-button crm-contact-contactway-minus"
                         onClick={_this.removeContactWay("email",index)}>
                        <Icon type="minus"/>
                    </div>
                </FormItem>
            );
        }) : "";
        //联系方式添加按钮
        var contactPhonePlus = (
            <div className="crm-contact-contactway-plus" onClick={this.addContactWay("phone")}>
                <div className="circle-button">
                    <Icon type="plus"/>
                </div>
                <span className="crm-contact-contactway-label"><ReactIntl.FormattedMessage id="common.phone" defaultMessage="电话" /></span>
            </div>
        );
        var contactQqPlus = (
            <div className="crm-contact-contactway-plus" onClick={this.addContactWay("qq")}>
                <div className="circle-button">
                    <Icon type="plus"/>
                </div>
                <span className="crm-contact-contactway-label">QQ</span>
            </div>
        );
        var contactWeChatPlus = (
            <div className="crm-contact-contactway-plus" onClick={this.addContactWay("weChat")}>
                <div className="circle-button">
                    <Icon type="plus"/>
                </div>
                <span className="crm-contact-contactway-label"><ReactIntl.FormattedMessage id="crm.58" defaultMessage="微信" /></span>
            </div>
        );
        var contactEmailPlus = (
            <div className="crm-contact-contactway-plus" onClick={this.addContactWay("email")}>
                <div className="circle-button">
                    <Icon type="plus"/>
                </div>
                <span className="crm-contact-contactway-label"><ReactIntl.FormattedMessage id="common.email" defaultMessage="邮箱" /></span>
            </div>
        );
        var addContactWayBtns = (
            <div className="crm-contact-contactway-btns">
                <div className="ant-form-item">
                    <label className="col-5">&nbsp;</label>
                    <div className="col-19">
                        {contactPhonePlus}
                        {contactQqPlus}
                        {contactWeChatPlus}
                        {contactEmailPlus}
                    </div>
                </div>
            </div>
        );

        //角色下拉列表
        var roleOptions = ContactUtil.roleArray.map(function (role, index) {
            return (<Option value={role} key={index}>{role}</Option>);
        });

        return (
            <div className="crm-contact-form">
                <Form horizontal>
                    <RightPanelReturn onClick={this.cancel}/>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <div className="crm-contact-input-list clearfix">
                            <div className="crm-contact-line"></div>
                            <div className="pull-left crm-contact-form-left col-md-5">
                                <FormItem
                                    label={Intl.get("realm.change.owner.name", "姓名")}
                                    labelCol={{span:5}}
                                    wrapperCol={{span:19}}
                                    validateStatus={this.renderValidateStyle('name')}
                                    hasFeedback
                                    help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                                >
                                    <Validator rules={[{required: true,min:1, message: Intl.get("crm.90", "请输入姓名")}]}>
                                        <Input name="name" value={formData.name}
                                               onChange={this.setField.bind(this, 'name')}
                                               data-tracename={"新建/修改联系人姓名"}
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("crm.113", "部门")}
                                    labelCol={{span:5}}
                                    wrapperCol={{span:19}}
                                    validateStatus={this.renderValidateStyle('department')}
                                    hasFeedback
                                    help={status.department.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.department.errors && status.department.errors.join(','))}
                                >
                                    <Validator rules={[{required: false,min:1, message: Intl.get("crm.114", "请输入职位")}]}>
                                        <Input name="department" value={formData.department}
                                               onChange={this.setField.bind(this, 'department')}
                                               data-tracename="新建/修改联系人部门"
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("crm.91", "职位")}
                                    labelCol={{span:5}}
                                    wrapperCol={{span:19}}
                                    validateStatus={this.renderValidateStyle('position')}
                                    hasFeedback
                                    help={status.position.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.position.errors && status.position.errors.join(','))}
                                >
                                    <Validator rules={[{required: false,min:1, message: Intl.get("crm.114", "请输入职位")}]}>
                                        <Input name="position" value={formData.position}
                                               onChange={this.setField.bind(this, 'position')}
                                               data-tracename="填写/修改联系人职位"
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("user.apply.detail.table.role", "角色")}
                                    labelCol={{span:5}}
                                    wrapperCol={{span:19}}
                                    validateStatus={this.renderValidateStyle('role')}
                                    hasFeedback
                                    help={status.role.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.role.errors && status.role.errors.join(','))}
                                >
                                    <Validator rules={[{required: true,min:1, message: Intl.get("crm.94", "请输入角色")}]}>
                                        <Select name="role"
                                                value={formData.role?formData.role:Intl.get("crm.115", "经办人")}
                                                onChange={this.setField.bind(this, 'role')}
                                                onSelect={this.handleSelect}
                                        >
                                            {roleOptions}
                                        </Select>
                                    </Validator>
                                </FormItem>
                            </div>
                            <div className="pull-right crm-contact-form-right col-md-7">
                                {contactWayPhone}
                                {contactWayQq}
                                {contactWayWechat}
                                {contactWayEmail}
                                {addContactWayBtns}
                                {this.state.showNeedContact ? <div className="need-contact"><ReactIntl.FormattedMessage id="crm.116" defaultMessage="请至少添加一种联系方式" /></div> : null}
                            </div>
                        </div>
                        <div className="clearfix crm-contact-form-btns">
                            <Button type="ghost" className="form-cancel-btn btn-primary-cancel"
                                    onClick={this.cancel}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></Button>
                            <Button type="primary" className="form-submit-btn btn-primary-sure"
                                    onClick={this.handleSubmit}><ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" /></Button>
                        </div>
                    </Validation>
                </Form>
                {
                    this.state.isLoading ?
                        (<Spinner className="isloading"/>) :
                        (null)
                }
            </div>
        )
    }
});

module.exports = ContactForm;
