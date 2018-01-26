const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
var Form = require("antd").Form;
var FormItem = Form.Item;
var Input = require("antd").Input;
var Button = require("antd").Button;
var Icon = require("antd").Icon;
var Select = require("antd").Select;
var Option = Select.Option;
var ContactUtil = require("../../utils/contact-util");
var ContactAction = require("../../action/contact-action");
var Spinner = require('../../../../../components/spinner');
var Message = require("antd").message;
import PhoneInput from "CMP_DIR/phone-input";
import Trace from "LIB_DIR/trace";
import {isEqualArray} from "LIB_DIR/func";
import CrmAction from "../../action/crm-actions";
var uuid = require("uuid/v4");

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
        var phoneInputIds = _.map(contact.phone, item => {
            return uuid();
        });
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
            errorMsg: '',
            contact: $.extend(true, {}, this.props.contact),
            phoneInputIds: phoneInputIds,
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
            if (type === "phone") {
                _this.state.phoneInputIds.push(uuid());
                _this.setState(_this.state);
            }

            ContactAction.addContactWay(_this.state.contact, type);
            Trace.traceEvent(_this.getDOMNode(), "添加新建联系人的联系方式" + type);
        };
    },

    removeContactWay: function (type, index) {
        var _this = this;
        return function () {
            if (type === "phone") {
                _this.state.phoneInputIds.splice(index, 1);
            }

            Trace.traceEvent(_this.getDOMNode(), "删除新建联系人的联系方式" + type);
            _this.state.contact.contactWayAddObj[type] = _this.state.contact.contactWayAddObj[type].filter((x, idx) => idx != index);
            //删除的变量名
            const delKey = type + index;
            _this.state.formData[delKey] = _this.state.formData[delKey] || "";
            let sortedFormData = [];
            _.each(_this.state.formData, (value, key) => {
                //当变量符合当前删除的类型时
                if (key.indexOf(type) > -1) {
                    //取出变量名中的索引
                    let innerNum = Number(key.replace(type, ""));
                    //将当前类型下的变量按照索引顺序存放到数组中，便于进行item[i] = item[i+1]的操作
                    sortedFormData[innerNum] = {key: key, value: value};
                }
            });
            //将稀疏数组转化为密集数组，并确保每一项的key均包含正确的索引
            sortedFormData = Array.from(sortedFormData, (x, idx) => x ? x : {key: type + idx, value: ""});
            sortedFormData.forEach((item, idx) => {
                let innerNum = idx;
                const propName = type + idx;
                //当前索引的下一个变量
                let nextItem = sortedFormData.find(x => x.key == type + (innerNum + 1));
                //当前变量在要删除的变量索引之后或相等的，将变量的值改为索引加1的变量的值                    
                if ((innerNum >= index) && nextItem) {
                    _this.state.formData[propName] = nextItem.value;
                }
                //将最后一个索引的变量删掉
                if (nextItem === undefined) {
                    delete _this.state.formData[propName];
                }
            })
            _this.setState({
                formData: _this.state.formData,
                contact: _this.state.contact,
                phoneInputIds: _this.state.phoneInputIds
            });
        };
    },

    handleSubmit: function (e) {
        e.preventDefault();
        var validation = this.refs.validation;
        validation.validate(valid => {
            if (this.phoneInputRefs.length) {
                //存在电话输入框时，验证一下填写的电话是否符合要求
                let phoneFormValArray = [];
                _.each(this.phoneInputRefs, item => {
                    phoneFormValArray.push(::this.getPhoneFormValue(item.props.form));
                });
                Promise.all(phoneFormValArray).then(result => {
                    let firstErrorItem = _.find(result, item => item.errs);
                    if (firstErrorItem || !valid) {
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

    getPhoneFormValue: function (form) {
        return new Promise(resolve => {
            form.validateFields((errs, fields) => {
                resolve({errs, fields})
            })
        })
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
        formData.phone = this.props.isMerge ? phoneArray : JSON.stringify(phoneArray);
        formData.qq = this.props.isMerge ? qqArray : JSON.stringify(qqArray);
        formData.weChat = this.props.isMerge ? weChatArray : JSON.stringify(weChatArray);
        formData.email = this.props.isMerge ? emailArray : JSON.stringify(emailArray);

        if (this.props.type === 'add') {
            //显示loading状态
            this.setState({isLoading: true});
            formData.customer_id = this.props.customer_id;
            //添加联系人时，需要将客户名传过去，后端接口中需要
            formData.customer_name = this.props.customer_name;
            if (this.props.contactListLength === 0) {//添加的第一个联系人设为默认联系人
                formData.def_contacts = "true";
            }
            Trace.traceEvent(this.getDOMNode(), "保存新建联系人的信息");
            ContactAction.submitAddContact(formData, (result) => {
                this.afterSubmit(result);
            });
        } else {
            if (this.props.isMerge) {
                Trace.traceEvent(this.getDOMNode(), "保存对当前联系人信息的修改");
                //合并重复客户时的处理
                this.props.updateMergeCustomerContact(formData);
                ContactAction.hideEditContactForm(this.props.contact);
            } else {
                let editType = this.getEditType(formData);
                if (editType) {
                    //显示loading状态
                    this.setState({isLoading: true});
                    ContactAction.submitEditContact(formData, editType, (result) => {
                        this.afterSubmit(result);
                    });
                    Trace.traceEvent(this.getDOMNode(), "保存对当前联系人信息的修改");
                } else {//没有修改时，直接关闭修改按钮即可
                    this.cancel();
                }

            }
        }
    },
    //获取修改的类型，是phone、no_phone还是all
    getEditType: function (formData) {
        let oldData = this.props.contact.contact;
        let isEditPhone = !isEqualArray(JSON.parse(formData.phone), oldData.phone);
        let isEditOtherInfo = false;
        if (formData.name !== oldData.name ||//联系人
            formData.department !== oldData.department ||//部门
            formData.position !== oldData.position ||//职位
            formData.role !== oldData.role ||//角色
            !isEqualArray(JSON.parse(formData.qq), oldData.qq) ||
            !isEqualArray(JSON.parse(formData.email), oldData.email) ||
            !isEqualArray(JSON.parse(formData.weChat), oldData.weChat)) {
            isEditOtherInfo = true;
        }
        //电话和其他信息都有修改
        if (isEditOtherInfo && isEditPhone) {
            return "all";
        } else if (isEditPhone) {
            return "phone";//只修改了电话
        } else if (isEditOtherInfo) {
            return "no_phone"//只修改了除电话以外的信息
        } else {//没有修改
            return "";
        }
    },
    //提交完数据后
    afterSubmit: function (result) {
        this.state.errorMsg = result.errorMsg || '';
        this.state.isLoading = false;
        if (result.errorMsg) {
            Message.error(result.errorMsg);
        } else if (result.contact && result.contact.def_contancts === "true") {
            //只有在客户列表中才有更新列表中联系人的方法
            if(this.props.updateCustomerDefContact){
                //修改默认联系人的信息时，更新列表中的联系人数据
                this.props.updateCustomerDefContact(result.contact);
            }
        }
        this.setState(this.state);
    },

    cancel: function () {
        if (this.props.type === 'add') {
            Trace.traceEvent($(this.getDOMNode()).find(".crm-contact-form-btns .form-cancel-btn"), "取消添加联系人");
            ContactAction.hideAddContactForm();
        } else {
            Trace.traceEvent($(this.getDOMNode()).find(".crm-contact-form-btns .form-cancel-btn"), "取消更改联系人");
            ContactAction.hideEditContactForm(this.props.contact);
        }
    },
    handleSelect: function () {
        Trace.traceEvent(this.getDOMNode(), "新建/修改联系人的角色");
    },
    //获取当前已添加的电话列表
    getCurPhoneArray(){
        let formData = this.state.formData;
        let phoneArray = [];
        _.each(formData, (val, key) => {
            if (key.indexOf("phone") !== -1) {
                phoneArray.push($.trim(val));
            }
        });
        return phoneArray;
    },

    //获取联系人电话验证规则
    getPhoneInputValidateRules() {
        return [{
            validator: (rule, value, callback) => {
                value = $.trim(value);
                if (value) {
                    let phone = value.replace("-", "");
                    let contact = this.props.contact.contact;
                    let phoneArray = contact && _.isArray(contact.phone) ? contact.phone : [];
                    //该联系人原电话列表中不存在该电话
                    if (phoneArray.indexOf(phone) === -1) {
                        //新加、修改后的该联系人电话列表中不存在的电话，进行唯一性验证
                        CrmAction.checkOnlyContactPhone(phone, data => {
                            if (_.isString(data)) {
                                //唯一性验证出错了
                                callback(Intl.get("crm.82", "电话唯一性验证出错了"));
                            } else {
                                if (_.isObject(data) && data.result === "true") {
                                    callback();
                                } else {
                                    //已存在
                                    callback(Intl.get("crm.83", "该电话已存在"));
                                }
                            }
                        });
                    } else {//该联系人员电话列表中已存在该电话
                        //获取当前已添加的电话列表
                        let curPhoneArray = this.getCurPhoneArray();
                        let phoneCount = _.filter(curPhoneArray, (curPhone) => curPhone === phone);
                        if (phoneCount.length > 1) {
                            //该联系人中的电话列表已存在该电话，再添加时（重复添加）
                            callback(Intl.get("crm.83", "该电话已存在"));
                        } else {
                            // 该联系人原本的电话未做修改时（删除原本的，再添加上时）
                            callback();
                        }
                    }
                } else {
                    callback();
                }
            }
        }];
    },

    render: function () {
        var formData = this.state.formData;
        var status = this.state.status;
        var contact = this.state.contact;
        this.phoneInputRefs = [];
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
                    id={_this.state.phoneInputIds[index]}
                    wrappedComponentRef={(inst) => _this.phoneInputRefs.push(inst)}
                    placeholder={Intl.get("crm.95", "请输入联系人电话")}
                    initialValue={formData[phoneKey]}
                    labelCol={{span: 5}}
                    wrapperCol={{span: 19}}
                    key={index}
                    validateRules={_this.getPhoneInputValidateRules()}
                    onChange={_this.setField.bind(_this, phoneKey)}
                    suffix={(
                        <div className="circle-button crm-contact-contactway-minus"
                             onClick={_this.removeContactWay("phone", index)}>
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
                    labelCol={{span: 5}}
                    wrapperCol={{span: 19}}
                    key={index}
                >
                    <Input name={qqKey} value={formData[qqKey]}
                           onChange={_this.setField.bind(_this, qqKey)}
                    />
                    <div className="circle-button crm-contact-contactway-minus"
                         onClick={_this.removeContactWay("qq", index)}>
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
                    labelCol={{span: 5}}
                    wrapperCol={{span: 19}}
                >
                    <Input name={weChatKey} value={formData[weChatKey]}
                           onChange={_this.setField.bind(_this, weChatKey)}
                    />
                    <div className="circle-button crm-contact-contactway-minus"
                         onClick={_this.removeContactWay("weChat", index)}>
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
                    labelCol={{span: 5}}
                    wrapperCol={{span: 19}}
                    key={index}
                >
                    <Input name={emailKey} value={formData[emailKey]}
                           onChange={_this.setField.bind(_this, emailKey)}
                    />
                    <div className="circle-button crm-contact-contactway-minus"
                         onClick={_this.removeContactWay("email", index)}>
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
                <span className="crm-contact-contactway-label">
                    <ReactIntl.FormattedMessage id="common.phone" defaultMessage="电话"/>
                </span>
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
                <span className="crm-contact-contactway-label">
                    <ReactIntl.FormattedMessage id="crm.58" defaultMessage="微信"/>
                </span>
            </div>
        );
        var contactEmailPlus = (
            <div className="crm-contact-contactway-plus" onClick={this.addContactWay("email")}>
                <div className="circle-button">
                    <Icon type="plus"/>
                </div>
                <span className="crm-contact-contactway-label">
                    <ReactIntl.FormattedMessage id="common.email" defaultMessage="邮箱"/>
                </span>
            </div>
        );
        var addContactWayBtns = (
            <div className="crm-contact-contactway-btns">
                <div className="ant-form-item">
                    <label className="ant-col-5">&nbsp;</label>
                    <div className="ant-col-19">
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
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <div className="crm-contact-input-list clearfix">
                            <div className="crm-contact-line"></div>
                            <div className="pull-left crm-contact-form-left col-md-5">
                                <FormItem
                                    label={Intl.get("realm.change.owner.name", "姓名")}
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 19}}
                                    validateStatus={this.renderValidateStyle('name')}
                                    help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                                >
                                    <Validator rules={[{
                                        required: true,
                                        min: 1,
                                        max: 50,
                                        message: Intl.get("crm.contact.name.length", "请输入最多50个字符的姓名")
                                    }]}>
                                        <Input name="name" value={formData.name}
                                               onChange={this.setField.bind(this, 'name')}
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("crm.113", "部门")}
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 19}}
                                    validateStatus={this.renderValidateStyle('department')}
                                    help={status.department.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.department.errors && status.department.errors.join(','))}
                                >
                                    <Validator
                                        rules={[{required: false, min: 1, message: Intl.get("crm.114", "请输入职位")}]}>
                                        <Input name="department" value={formData.department}
                                               onChange={this.setField.bind(this, 'department')}
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("crm.91", "职位")}
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 19}}
                                    validateStatus={this.renderValidateStyle('position')}
                                    help={status.position.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.position.errors && status.position.errors.join(','))}
                                >
                                    <Validator
                                        rules={[{required: false, min: 1, message: Intl.get("crm.114", "请输入职位")}]}>
                                        <Input name="position" value={formData.position}
                                               onChange={this.setField.bind(this, 'position')}
                                        />
                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("user.apply.detail.table.role", "角色")}
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 19}}
                                    validateStatus={this.renderValidateStyle('role')}
                                    help={status.role.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.role.errors && status.role.errors.join(','))}
                                >
                                    <Validator rules={[{required: true, min: 1, message: Intl.get("crm.94", "请输入角色")}]}>
                                        <Select name="role"
                                                value={formData.role ? formData.role : Intl.get("crm.115", "经办人")}
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
                                {this.state.showNeedContact ?
                                    <div className="need-contact"><ReactIntl.FormattedMessage id="crm.116"
                                                                                              defaultMessage="请至少添加一种联系方式"/>
                                    </div> : null}
                            </div>
                        </div>
                        <div className="clearfix crm-contact-form-btns">
                            <Button type="ghost" className="form-cancel-btn btn-primary-cancel"
                                    onClick={this.cancel}
                            ><ReactIntl.FormattedMessage id="common.cancel"
                                                                                      defaultMessage="取消"/></Button>
                            <Button type="primary" className="form-submit-btn btn-primary-sure"
                                    onClick={this.handleSubmit}><ReactIntl.FormattedMessage id="common.save"
                                                                                            defaultMessage="保存"/></Button>
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
