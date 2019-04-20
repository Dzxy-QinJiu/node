var React = require('react');
const PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
import {Col, Form, Input, Icon, Radio, DatePicker} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
var ContactUtil = require('../../utils/contact-util');
var ContactAction = require('../../action/contact-action');
import PhoneInput from 'CMP_DIR/phone-input';
import Trace from 'LIB_DIR/trace';
import {isEqualArray} from 'LIB_DIR/func';
import CrmAction from '../../action/crm-actions';
import {validateRequiredOne, disabledAfterToday} from 'PUB_DIR/sources/utils/common-method-util';

import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import {clueNameContactRule} from 'PUB_DIR/sources/utils/validate-util';
var uuid = require('uuid/v4');
//滚动条
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const CONTACT_ITEMS_HEIGHHT = 300;
function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function(className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}
var ContactForm = createReactClass({
    displayName: 'ContactForm',
    mixins: [Validation.FieldMixin],

    getDefaultProps: function() {
        return {
            contact: ContactUtil.newViewContactObject(),
            type: 'add'
        };
    },
    propTypes: {
        contact: PropTypes.object,
        isMerge: PropTypes.bool,
        type: PropTypes.string,
        customer_id: PropTypes.string,
        customer_name: PropTypes.string,
        contactListLength: PropTypes.number,
        updateMergeCustomerContact: PropTypes.func,
        updateCustomerDefContact: PropTypes.func
    },

    //联系方式的数组展开放到对应的formData中
    formatContact: function(type, contactData, formData, status) {
        if (contactData && _.isArray(contactData)) {
            for (var i = 0, len = contactData.length; i < len; i++) {
                formData[type + i] = contactData[i];
                status[type + i] = {};
            }
        }
    },

    getInitialState: function() {
        var contact = this.props.contact.contact;
        var phoneInputIds = _.isArray(contact.phone) && contact.phone.length ? _.map(contact.phone, item => {
            return uuid();
        }) : [uuid()];
        var formData = {
            id: contact.id,
            customer_id: contact.customer_id,
            name: contact.name,
            position: contact.position,
            role: contact.role || Intl.get('crm.115', '经办人'),
            sex: contact.sex || Intl.get('crm.contact.sex.male', '男'),
            birthday: contact.birthday,
            hobby: contact.hobby,
            remark: contact.remark,
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
            role: {}
        };

        this.formatContact('phone', contact.phone, formData, status);
        this.formatContact('qq', contact.qq, formData, status);
        this.formatContact('weChat', contact.weChat, formData, status);
        this.formatContact('email', contact.email, formData, status);

        return {
            status: status,
            isLoading: false,
            showNeedPhone: false,
            formData: formData,
            errorMsg: '',
            contact: $.extend(true, {}, this.props.contact),
            phoneInputIds: phoneInputIds,
            isValidNameDepartment: true//是否通过姓名和部门必填一项的验证
        };
    },

    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = cx({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    addContactWay: function(type) {
        var _this = this;
        return function() {
            if (type === 'phone') {
                _this.state.phoneInputIds.push(uuid());
                _this.setState(_this.state);
            }

            ContactAction.addContactWay(_this.state.contact, type);
            Trace.traceEvent(ReactDOM.findDOMNode(_this), '添加新建联系人的联系方式' + type);
        };
    },

    removeContactWay: function(type, index) {
        var _this = this;
        return function() {
            if (type === 'phone') {
                _this.state.phoneInputIds.splice(index, 1);
            }

            Trace.traceEvent(ReactDOM.findDOMNode(_this), '删除新建联系人的联系方式' + type);
            _this.state.contact.contactWayAddObj[type] = _this.state.contact.contactWayAddObj[type].filter((x, idx) => idx !== index);
            //删除的变量名
            const delKey = type + index;
            _this.state.formData[delKey] = _this.state.formData[delKey] || '';
            let sortedFormData = [];
            _.each(_this.state.formData, (value, key) => {
                //当变量符合当前删除的类型时
                if (key.indexOf(type) > -1) {
                    //取出变量名中的索引
                    let innerNum = Number(key.replace(type, ''));
                    //将当前类型下的变量按照索引顺序存放到数组中，便于进行item[i] = item[i+1]的操作
                    sortedFormData[innerNum] = {key: key, value: value};
                }
            });
            //将稀疏数组转化为密集数组，并确保每一项的key均包含正确的索引
            sortedFormData = Array.from(sortedFormData, (x, idx) => x ? x : {key: type + idx, value: ''});
            sortedFormData.forEach((item, idx) => {
                let innerNum = idx;
                const propName = type + idx;
                //当前索引的下一个变量
                let nextItem = sortedFormData.find(x => x.key === type + (innerNum + 1));
                //当前变量在要删除的变量索引之后或相等的，将变量的值改为索引加1的变量的值                    
                if ((innerNum >= index) && nextItem) {
                    _this.state.formData[propName] = nextItem.value;
                }
                //将最后一个索引的变量删掉
                if (nextItem === undefined) {
                    delete _this.state.formData[propName];
                }
            });
            _this.setState({
                formData: _this.state.formData,
                contact: _this.state.contact,
                phoneInputIds: _this.state.phoneInputIds
            });
        };
    },

    handleSubmit: function(e) {
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

    getPhoneFormValue: function(form) {
        return new Promise(resolve => {
            form.validateFields((errs, fields) => {
                resolve({errs, fields});
            });
        });
    },

    doSubmit: function() {
        var formData = _.extend({}, this.state.formData);
        var phoneArray = [], qqArray = [], weChatArray = [], emailArray = [];
        for (var key in formData) {
            let contactVal = _.trim(formData[key]);
            if (contactVal) {
                if (key.indexOf('phone') !== -1) {
                    phoneArray.push(contactVal);
                    delete formData[key];
                } else if (key.indexOf('qq') !== -1) {
                    qqArray.push(contactVal);
                    delete formData[key];
                } else if (key.indexOf('weChat') !== -1) {
                    weChatArray.push(contactVal);
                    delete formData[key];
                } else if (key.indexOf('email') !== -1) {
                    emailArray.push(contactVal);
                    delete formData[key];
                }
            }
        }
        //联系人姓名和部门必填一项的验证
        this.validateContactNameDepartment();
        //未通过姓名和部门必填一项的验证
        if (!this.state.isValidNameDepartment) {
            return;
        }
        //过滤出不为空的联系电话
        let hasPhone = _.some(phoneArray, phone => phone);
        //提示电话为必填
        if (!hasPhone) {
            this.setState({showNeedPhone: true});
            return;
        }
        formData.phone = phoneArray;
        if(_.get(qqArray,'[0]')){
            formData.qq = qqArray;
        }
        if(_.get(weChatArray,'[0]')){
            formData.weChat = weChatArray;
        }
        if(_.get(emailArray,'[0]')){
            formData.email = emailArray;
        }
        if(formData.birthday){
            formData.birthday = formData.birthday.valueOf();
        }
        if (this.props.type === 'add') {
            //显示loading状态
            this.setState({isLoading: true});
            formData.customer_id = this.props.customer_id;
            //添加联系人时，需要将客户名传过去，后端接口中需要
            formData.customer_name = this.props.customer_name;
            if (this.props.contactListLength === 0) {//添加的第一个联系人设为默认联系人
                formData.def_contancts = 'true';
            }
            Trace.traceEvent(ReactDOM.findDOMNode(this), '保存新建联系人的信息');
            ContactAction.submitAddContact(formData, (result) => {
                this.afterSubmit(result);
            });
        } else {
            if (this.props.isMerge) {
                Trace.traceEvent(ReactDOM.findDOMNode(this), '保存对当前联系人信息的修改');
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
                    Trace.traceEvent(ReactDOM.findDOMNode(this), '保存对当前联系人信息的修改');
                } else {//没有修改时，直接关闭修改按钮即可
                    this.cancel();
                }

            }
        }
    },

    //获取修改的类型，是phone、no_phone还是all
    getEditType: function(formData) {
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
            return 'all';
        } else if (isEditPhone) {
            return 'phone';//只修改了电话
        } else if (isEditOtherInfo) {
            return 'no_phone';//只修改了除电话以外的信息
        } else {//没有修改
            return '';
        }
    },

    //提交完数据后
    afterSubmit: function(result) {
        this.setState({errorMsg: result.errorMsg || '', isLoading: false});
        if (result.contact && result.contact.def_contancts === 'true') {
            //只有在客户列表中才有更新列表中联系人的方法
            if (_.isFunction(this.props.updateCustomerDefContact)) {
                //修改默认联系人的信息时，更新列表中的联系人数据
                this.props.updateCustomerDefContact(result.contact);
            }
        }
    },

    cancel: function() {
        if (this.props.type === 'add') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.crm-contact-form-btns .form-cancel-btn'), '取消添加联系人');
            ContactAction.hideAddContactForm();
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.crm-contact-form-btns .form-cancel-btn'), '取消更改联系人');
            ContactAction.hideEditContactForm(this.props.contact);
        }
    },

    handleSelect: function() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '新建/修改联系人的角色');
    },

    //获取当前已添加的电话列表
    getCurPhoneArray(){
        let formData = this.state.formData;
        let phoneArray = [];
        _.each(formData, (val, key) => {
            if (key.indexOf('phone') !== -1) {
                phoneArray.push(_.trim(val));
            }
        });
        return phoneArray;
    },

    //获取联系人电话验证规则
    getPhoneInputValidateRules() {
        return [{
            validator: (rule, value, callback) => {
                value = _.trim(value);
                if (value) {
                    if(this.state.showNeedPhone){
                        this.setState({showNeedPhone: false});
                    }
                    let phone = value.replace('-', '');
                    let contact = this.props.contact.contact;
                    let phoneArray = contact && _.isArray(contact.phone) ? contact.phone : [];
                    //该联系人原电话列表中不存在该电话
                    if (phoneArray.indexOf(phone) === -1) {
                        //新加、修改后的该联系人电话列表中不存在的电话，进行唯一性验证
                        CrmAction.checkOnlyContactPhone(phone, data => {
                            if (_.isString(data)) {
                                //唯一性验证出错了
                                callback(Intl.get('crm.82', '电话唯一性验证出错了'));
                            } else {
                                if (_.isObject(data) && data.result === 'true') {
                                    callback();
                                } else {
                                    //已存在
                                    callback(Intl.get('crm.83', '该电话已存在'));
                                }
                            }
                        });
                    } else {//该联系人员电话列表中已存在该电话
                        //获取当前已添加的电话列表
                        let curPhoneArray = this.getCurPhoneArray();
                        let phoneCount = _.filter(curPhoneArray, (curPhone) => curPhone === phone);
                        if (phoneCount.length > 1) {
                            //该联系人中的电话列表已存在该电话，再添加时（重复添加）
                            callback(Intl.get('crm.83', '该电话已存在'));
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

    //联系人名和部门必填一项的验证
    validateContactNameDepartment: function() {
        //是否通过联系人名和部门必填一项的验证
        let isValid = validateRequiredOne(this.state.formData.name, this.state.formData.department);
        this.setState({isValidNameDepartment: isValid});
    },

    //渲染联系人名和部门必填一项的提示
    renderValidNameDepartmentTip: function() {
        if (this.state.isValidNameDepartment) {
            return null;
        } else {
            return <div
                className="validate-error-tip">{Intl.get('crm.contact.name.department', '联系人姓名和部门必填一项')}</div>;
        }
    },

    //添加、删除联系方式的按钮
    renderContactWayBtns(index, size, type){
        return (<div className="contact-way-buttons">
            {index === 0 && index === size - 1 ? null :
                <Icon type="minus-circle-o" theme="outlined" onClick={this.removeContactWay(type, index)}/>
            }
            {index === size - 1 ? <Icon type="plus-circle-o" theme="outlined" onClick={this.addContactWay(type)}/>
                : null}
        </div>);
    },

    /**
     * 电话输入框
     * @param inex: 电话的第几个输入框的索引（从0开始计算）
     * @param size: 共有几个电话
     * @param formData: 联系人的表单数据
     * @param status: 联系人表单数据的验证状态
     */
    renderPhoneInput(index, size, formData, status) {
        const phoneKey = 'phone' + index;
        if (!status[phoneKey]) {
            formData[phoneKey] = '';
            status[phoneKey] = {};
        }
        return (
            <div>
                <PhoneInput
                    id={this.state.phoneInputIds[index]}
                    colon={false}
                    label={index ? ' ' : Intl.get('common.phone', '电话')}
                    wrappedComponentRef={(inst) => this.phoneInputRefs.push(inst)}
                    placeholder={Intl.get('crm.95', '请输入联系人电话')}
                    initialValue={formData[phoneKey]}
                    labelCol={{span: 2}}
                    wrapperCol={{span: 12}}
                    key={index}
                    validateRules={this.getPhoneInputValidateRules()}
                    onChange={this.setField.bind(this, phoneKey)}
                    suffix={this.renderContactWayBtns(index, size, 'phone')}
                />
                {this.state.showNeedPhone && index === 0 ?
                    <div className="validate-error-tip">{Intl.get('crm.95', '请输入联系人电话')} </div> : null}
            </div>
        );
    },

    /**
     * 联系方式输入框
     * @param label:联系方式的描述（QQ、微信、邮箱）
     * @param type:联系方式的类型（qq、weChat、email）
     * @param index: 该类型联系方式的第几个输入框的索引（从0开始计算）
     * @param size: 该类型联系方式共有几个
     * @param formData: 联系人的表单数据
     * @param status: 联系人表单数据的验证状态
     */
    renderContactWayInput(label, type, index, size, formData, status){
        const typeKey = type + index;
        status[typeKey] = {};
        return (
            <FormItem
                colon={false}
                label={index ? ' ' : label}
                labelCol={{span: 2}}
                wrapperCol={{span: 12}}
                key={index}
            >
                <Input name={typeKey} value={formData[typeKey]}
                    onChange={this.setField.bind(this, typeKey)}
                />
                {this.renderContactWayBtns(index, size, type)}
            </FormItem>
        );
    },

    renderContactForm: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var contact = this.state.contact;
        this.phoneInputRefs = [];
        let contactWayAddObj = contact.contactWayAddObj || {};
        return (
            <Form layout='horizontal' style={{height: CONTACT_ITEMS_HEIGHHT}} className="crm-contact-form" autocomplete="off" data-trace="联系人表单">
                <GeminiScrollbar className="srollbar-out-card-style">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            colon={false}
                            label={Intl.get('common.name', '姓名')}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                        >
                            <Col span={12} className="form-col-padding">
                                <FormItem validateStatus={this.renderValidateStyle('name')}
                                    help={status.name.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.name.errors && status.name.errors.join(','))}>
                                    <Validator rules={[clueNameContactRule]}>
                                        <Input name="name" value={formData.name}
                                            autocomplete="off"
                                            placeholder={Intl.get('crm.contact.name.length', '请输入最多50个字符')}
                                            onBlur={this.validateContactNameDepartment.bind(this)}
                                            onChange={this.setField.bind(this, 'name')}
                                        />
                                    </Validator>
                                </FormItem>
                            </Col>
                            <Col span={6} className="form-col-padding">
                                <FormItem>
                                    <Input name="department" value={formData.department}
                                        autocomplete="off"
                                        placeholder={Intl.get('crm.contact.deparment.input', '请输入部门')}
                                        onBlur={this.validateContactNameDepartment.bind(this)}
                                        onChange={this.setField.bind(this, 'department')}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem>
                                    <Input name="position" value={formData.position}
                                        autocomplete="off"
                                        placeholder={Intl.get('crm.114', '请输入职位')}
                                        onChange={this.setField.bind(this, 'position')}
                                    />
                                </FormItem>
                            </Col>
                        </FormItem>
                        {this.renderValidNameDepartmentTip()}
                        <FormItem
                            className="contact-role-item"
                            colon={false}
                            label={Intl.get('user.apply.detail.table.role', '角色')}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                        >
                            <RadioGroup onChange={this.setField.bind(this, 'role')}
                                value={_.get(formData, 'role', Intl.get('crm.115', '经办人'))}>
                                {ContactUtil.roleArray.map(function(role, index) {
                                    return (<Radio value={role} key={index}>{role}</Radio>);
                                })}
                            </RadioGroup>
                        </FormItem>
                        {//电话
                            _.isArray(contactWayAddObj.phone) && contactWayAddObj.phone.length ? contactWayAddObj.phone.map((phone, index) => {
                                return this.renderPhoneInput(index, contactWayAddObj.phone.length, formData, status);
                            }) : [this.renderPhoneInput(0, 1, formData, status)]
                        }
                        {//qq
                            _.isArray(contactWayAddObj.qq) && contactWayAddObj.qq.length ? contactWayAddObj.qq.map((qq, index) => {
                                return this.renderContactWayInput('QQ', 'qq', index, contactWayAddObj.qq.length, formData, status);
                            }) : [this.renderContactWayInput('QQ', 'qq', 0, 1, formData, status)]
                        }
                        {//微信
                            _.isArray(contactWayAddObj.weChat) && contactWayAddObj.weChat.length ? contactWayAddObj.weChat.map((weChat, index) => {
                                return this.renderContactWayInput(Intl.get('crm.58', '微信'), 'weChat', index, contactWayAddObj.weChat.length, formData, status);
                            }) : [this.renderContactWayInput(Intl.get('crm.58', '微信'), 'weChat', 0, 1, formData, status)]
                        }
                        {//邮箱
                            _.isArray(contactWayAddObj.email) && contactWayAddObj.email.length ? contactWayAddObj.email.map((email, index) => {
                                return this.renderContactWayInput(Intl.get('common.email', '邮箱'), 'email', index, contactWayAddObj.email.length, formData, status);
                            }) : [this.renderContactWayInput(Intl.get('common.email', '邮箱'), 'email', 0, 1, formData, status)]
                        }
                        <FormItem
                            className="contact-sex-item"
                            colon={false}
                            label={Intl.get('crm.contact.sex', '性别')}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                        >
                            <Radio.Group onChange={this.setField.bind(this, 'sex')}
                                value={_.get(formData, 'sex', '')}>
                                {_.map(ContactUtil.sexArray, (sex, index) => {
                                    return (<Radio key={index} value={sex}>{sex}</Radio>);
                                })}
                            </Radio.Group>
                        </FormItem>
                        <FormItem
                            className="contact-birthday-item"
                            colon={false}
                            label={Intl.get('crm.contact.birthday', '生日')}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                        >
                            <DatePicker onChange={this.setField.bind(this, 'birthday')}
                                showToday={false} disabledDate={disabledAfterToday}
                                value={formData.birthday ? moment(formData.birthday, 'YYYY-MM-DD') : null}/>
                        </FormItem>
                        <FormItem
                            className="contact-hobby-item"
                            colon={false}
                            label={Intl.get('crm.contact.hobby', '爱好')}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                        >
                            <Input value={_.get(formData, 'hobby', '')}
                                onChange={this.setField.bind(this, 'hobby')}
                                placeholder={Intl.get('crm.contact.hobby.placeholder', '请输入联系人的兴趣爱好')}/>
                        </FormItem>
                        <FormItem
                            className="contact-remark-item"
                            colon={false}
                            label={Intl.get('common.remark', '备注')}
                            labelCol={{span: 2}}
                            wrapperCol={{span: 22}}
                        >
                            <Input.TextArea autosize={{minRows: 2, maxRows: 6}}
                                value={_.get(formData, 'remark', '')}
                                onChange={this.setField.bind(this, 'remark')}
                                placeholder={Intl.get('user.input.remark', '请输入备注')}
                            />
                        </FormItem>
                    </Validation>
                </GeminiScrollbar>
            </Form>
        );
    },

    render: function() {
        return (<DetailCard content={this.renderContactForm()}
            isEdit={true}
            className="contact-form-container"
            loading={this.state.isLoading}
            saveErrorMsg={this.state.errorMsg}
            handleSubmit={this.handleSubmit}
            handleCancel={this.cancel}
        />);
    },
});

module.exports = ContactForm;

