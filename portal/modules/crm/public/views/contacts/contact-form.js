import {Col, Form, Input, Icon, Radio, DatePicker} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
require('../../css/contact-form.less');
var ContactUtil = require('../../utils/contact-util');
var ContactAction = require('../../action/contact-action');
import PhoneInput from 'CMP_DIR/phone-input';
import Trace from 'LIB_DIR/trace';
import {isEqualArray} from 'LIB_DIR/func';
import CrmAction from '../../action/crm-actions';
import {validateRequiredOne, disabledAfterToday} from 'PUB_DIR/sources/utils/common-method-util';

import DetailCard from 'CMP_DIR/detail-card';
import { clueNameContactRule, emailRegex, qqRegex, checkWechat } from 'PUB_DIR/sources/utils/validate-util';
var uuid = require('uuid/v4');
//滚动条
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const CONTACT_ITEMS_HEIGHHT = 301;


// 生成联系方式最基本的数据结构
function generatorBDS(value) {
    return {
        id: uuid(),
        value: value || ''
    };
}

// 联系方式键值映射
const CONTACT_WAY_KEYS_MAP = {
    PHONE: 'phone',
    QQ: 'qq',
    WE_CHAT: 'weChat',
    EMAIL: 'email'
};
//其他项键值映射
const CONTACT_OTHER_KEYS = {
    NAME: 'name',//联系人姓名
    DEPARTMENT: 'department',//部门
    POSITION: 'position',//职位
    ROLE: 'role', //角色
    SEX: 'sex',//性别
    BIRTHDAY: 'birthday',//生日
    HOBBY: 'hobby',//爱好
    REMARK: 'remark',//备注
};

class ContactForm extends React.Component {
    constructor(props) {
        super(props);

        const contact = this.props.contact.contact;
        const formData = {
            id: contact.id,
            customer_id: contact.customer_id,
            name: contact.name,
            position: contact.position,
            role: contact.role || Intl.get('crm.115', '经办人'),
            sex: contact.sex || Intl.get('crm.contact.sex.male', '男'),
            birthday: contact.birthday,
            hobby: contact.hobby,
            remark: contact.remark,
            department: contact.department,
            def_contancts: contact.def_contancts
        };

        this.formatContact(CONTACT_WAY_KEYS_MAP.PHONE, contact.phone, formData);
        this.formatContact(CONTACT_WAY_KEYS_MAP.QQ, contact.qq, formData);
        this.formatContact(CONTACT_WAY_KEYS_MAP.WE_CHAT, contact.weChat, formData);
        this.formatContact(CONTACT_WAY_KEYS_MAP.EMAIL, contact.email, formData);

        this.state = {
            isLoading: false,
            showNeedPhone: false,
            formData: formData,
            errorMsg: '',
            contact: $.extend(true, {}, this.props.contact),
            isValidNameDepartment: true//是否通过姓名和部门必填一项的验证
        };
    }

    //组件装载后验证完毕
    isValidatedPhoneOnDidMount = false;

    componentDidMount() {
        //如果需要在组件装载后立即校验电话输入框中的内容是否符合规则
        if (this.props.isValidatePhoneOnDidMount) {
            this.props.form.validateFields(() => {
                this.isValidatedPhoneOnDidMount = true;
            });
        }
    }

    componentWillUnmount() {
        this.isValidatedPhoneOnDidMount = false;
    }

    handleSubmit = (e) => {
        e && e.preventDefault();
        let saveObj = {
            error: false,
            data: {}
        };
        this.props.form.validateFields((error) => {
            if (error) {
                saveObj.error = true;
            } else {
                let res = this.doSubmit();
                if(_.isObject(res)) {
                    saveObj.data = res;
                }else {
                    saveObj.error = true;
                }
            }
        });
        return saveObj;
    };

    doSubmit() {
        var formData = this.props.form.getFieldsValue();
        var stateFormData = _.cloneDeep(this.state.formData);
        var phoneArray = [], qqArray = [], weChatArray = [], emailArray = [];
        for (var key in formData) {
            let contactVal = _.trim(formData[key]);
            if (key.indexOf(CONTACT_WAY_KEYS_MAP.PHONE) !== -1) {
                if(contactVal) phoneArray.push(contactVal);
                delete formData[key];
                delete stateFormData[CONTACT_WAY_KEYS_MAP.PHONE];
            } else if (key.indexOf(CONTACT_WAY_KEYS_MAP.QQ) !== -1) {
                if(contactVal) qqArray.push(contactVal);
                delete formData[key];
                delete stateFormData[CONTACT_WAY_KEYS_MAP.QQ];
            } else if (key.indexOf(CONTACT_WAY_KEYS_MAP.WE_CHAT) !== -1) {
                if(contactVal) weChatArray.push(contactVal);
                delete formData[key];
                delete stateFormData[CONTACT_WAY_KEYS_MAP.WE_CHAT];
            } else if (key.indexOf(CONTACT_WAY_KEYS_MAP.EMAIL) !== -1) {
                if(contactVal) emailArray.push(contactVal);
                delete formData[key];
                delete stateFormData[CONTACT_WAY_KEYS_MAP.EMAIL];
            }
        }
        //联系人姓名和部门必填一项的验证
        let isValid = this.validateContactNameDepartment(true);
        //未通过姓名和部门必填一项的验证
        if (!isValid) {
            return false;
        }
        let hasPhone = _.some(phoneArray, phone => phone);
        //提示电话为必填
        if (!hasPhone) {
            this.setState({showNeedPhone: true});
            return false;
        }
        formData.phone = _.uniq(phoneArray);
        if(_.get(qqArray,'[0]')){
            formData.qq = _.uniq(qqArray);
        }
        if(_.get(weChatArray,'[0]')){
            formData.weChat = _.uniq(weChatArray);
        }
        if(_.get(emailArray,'[0]')){
            formData.email = _.uniq(emailArray);
        }
        if(formData.birthday){
            formData.birthday = formData.birthday.valueOf();
        }

        formData = {...stateFormData, ...formData};

        // 如果在外部调用handleSubmit()了,返回数据
        if(this.props.isValidateOnExternal) {
            return formData;
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
    }

    //获取修改的类型，是phone、no_phone还是all
    getEditType(formData) {
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
    }

    //提交完数据后
    afterSubmit(result) {
        this.setState({errorMsg: result.errorMsg || '', isLoading: false});
        if (result.contact && result.contact.def_contancts === 'true') {
            //只有在客户列表中才有更新列表中联系人的方法
            if (_.isFunction(this.props.updateCustomerDefContact)) {
                //修改默认联系人的信息时，更新列表中的联系人数据
                this.props.updateCustomerDefContact(result.contact);
            }
        }
    }

    cancel = () => {
        if (this.props.type === 'add') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.crm-contact-form-btns .form-cancel-btn'), '取消添加联系人');
            ContactAction.hideAddContactForm();
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.crm-contact-form-btns .form-cancel-btn'), '取消更改联系人');
            ContactAction.hideEditContactForm(this.props.contact);
        }
    };

    //联系方式的数组展开放到对应的formData中
    formatContact(type, contactData, formData) {
        formData[type] = [];
        if (_.isArray(contactData) && _.get(contactData, 'length') > 0) {
            for (var i = 0, len = contactData.length; i < len; i++) {
                formData[type].push(generatorBDS(contactData[i]));
            }
        }else {
            formData[type].push(generatorBDS());
        }
    }

    addContactWay(type) {
        var _this = this;
        return function() {
            let formData = _this.state.formData;
            formData[type].push(generatorBDS());
            _this.setState({formData});

            // ContactAction.addContactWay(_this.state.contact, type);
            Trace.traceEvent(ReactDOM.findDOMNode(_this), '添加新建联系人的联系方式' + type);
        };
    }

    removeContactWay(type, index) {
        var _this = this;
        return function() {
            let formData = _this.state.formData;
            formData[type].splice(index, 1);

            Trace.traceEvent(ReactDOM.findDOMNode(_this), '删除新建联系人的联系方式' + type);
            // _this.state.contact.contactWayAddObj[type] = _this.state.contact.contactWayAddObj[type].filter((x, idx) => idx !== index);
            _this.setState({
                formData: _this.state.formData,
                contact: _this.state.contact
            });
        };
    }

    //获取当前已添加的电话列表
    getCurPhoneArray(){
        let values = this.props.form.getFieldsValue();
        let phoneArray = [];
        _.each(values, (val, key) => {
            if (val && key.indexOf(CONTACT_WAY_KEYS_MAP.PHONE) !== -1) {
                phoneArray.push(_.trim(val.replace('-', '')));
            }
        });
        return phoneArray;
    }

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
                    let phoneArray = [];
                    //是动态增删联系人时，需要获取其他联系人的电话
                    if(this.props.isDynamicAddAdnDelContact) {
                        //获取动态添加的其他联系人里的电话
                        if(_.isFunction(this.props.getDynamicAddPhones)) {
                            phoneArray = this.props.getDynamicAddPhones();
                        }
                    }else {
                        let contact = this.props.contact.contact;
                        phoneArray = contact && _.isArray(contact.phone) ? contact.phone : [];
                    }
                    //获取当前已添加的电话列表
                    let curPhoneArray = this.getCurPhoneArray();
                    let phoneCount = _.filter(curPhoneArray, (curPhone) => curPhone === phone);
                    //如果需要在组件装载后立即校验电话输入框中的内容是否符合规则
                    if (this.props.isValidatePhoneOnDidMount && !this.isValidatedPhoneOnDidMount) {
                        //用于绕过下面的判断逻辑，直接抵达发请求验证电话是否已存在的地方
                        phoneArray = phoneCount = [];
                    }

                    //（动态增删联系人时，是其他联系人的电话列表）该联系人原电话列表中不存在该电话
                    if (phoneArray.indexOf(phone) === -1) {
                        // TODO 判断当前添加的电话列表中是否已存在该电话
                        if (phoneCount.length > 1) {
                            //当前添加的电话列表已存在该电话，再添加时（重复添加）
                            callback(Intl.get('crm.83', '该电话已存在'));
                        } else {
                            //新加、修改后的该联系人电话列表中不存在的电话，进行唯一性验证
                            CrmAction.checkOnlyContactPhone(phone, data => {
                                if (_.isString(data)) {
                                    //唯一性验证出错了
                                    callback(Intl.get('crm.82', '电话号码验证出错'));
                                } else {
                                    if (_.isObject(data) && data.result === 'true') {
                                        callback();
                                    } else {
                                        //已存在
                                        let customer_name = _.get(data, 'list[0].name', '');
                                        customer_name = _.isEmpty(customer_name) ? '' : `"${customer_name}"`;
                                        callback(Intl.get('crm.repeat.phone.user', '该电话已被客户{userName}使用',{userName: customer_name}));
                                    }
                                }
                            });
                        }
                    } else {
                        //（动态增删联系人时，是其他联系人的电话列表）
                        if(this.props.isDynamicAddAdnDelContact) {
                            phoneCount = _.filter(phoneArray, (curPhone) => curPhone === phone);
                            //其他联系人中的电话列表已存在该电话，再添加时（重复添加）
                            if(phoneCount.length > 0) {
                                callback(Intl.get('crm.83', '该电话已存在'));
                            }else {//不存在时
                                callback();
                            }
                        }else {
                            //该联系人员电话列表中已存在该电话
                            if (phoneCount.length > 1) {
                                //该联系人中的电话列表已存在该电话，再添加时（重复添加）
                                callback(Intl.get('crm.83', '该电话已存在'));
                            } else {
                                // 该联系人原本的电话未做修改时（删除原本的，再添加上时）
                                callback();
                            }
                        }
                    }
                } else {
                    callback();
                }
            }
        }];
    }

    //联系人名和部门必填一项的验证
    validateContactNameDepartment = (needReturn) => {
        if(this.props.isRequiredContactName) {
            //是否通过联系人名和部门必填一项的验证
            let formData = this.props.form.getFieldsValue(['name', 'department']);
            let isValid = validateRequiredOne(formData.name, formData.department);
            this.setState({isValidNameDepartment: isValid});
            if(needReturn) return isValid;
        }else {
            if(needReturn) return true;
        }
    };

    //渲染联系人名和部门必填一项的提示
    renderValidNameDepartmentTip = () => {
        if (this.state.isValidNameDepartment) {
            return null;
        } else {
            return <div className="validate-error-tip">{Intl.get('crm.contact.name.department', '联系人姓名和部门必填一项')}</div>;
        }
    };

    //添加、删除联系方式的按钮
    renderContactWayBtns(index, size, type){
        return (<div className="contact-way-buttons">
            {index === 0 && index === size - 1 ? null :
                <Icon type="minus-circle-o" theme="outlined" onClick={this.removeContactWay(type, index)}/>
            }
            {index === size - 1 ? <Icon type="plus-circle-o" theme="outlined" onClick={this.addContactWay(type)}/>
                : null}
        </div>);
    }

    /**
     * 电话输入框
     * @param index: 电话的第几个输入框的索引（从0开始计算）
     * @param size: 共有几个电话
     * @param formData: 联系人的表单数据
     */
    renderPhoneInput(index, size, formData) {
        const phoneKey = CONTACT_WAY_KEYS_MAP.PHONE;
        const curPhone = formData[phoneKey][index];
        return (
            <div key={curPhone.id}>
                <PhoneInput
                    form={this.props.form}
                    id={phoneKey + curPhone.id}
                    colon={false}
                    label={index ? ' ' : Intl.get('common.phone', '电话')}
                    placeholder={Intl.get('crm.95', '请输入联系人电话')}
                    initialValue={curPhone.value}
                    labelCol={{span: 3}}
                    wrapperCol={{span: 12}}
                    key={curPhone.id}
                    validateRules={this.getPhoneInputValidateRules()}
                    suffix={this.renderContactWayBtns(index, size, CONTACT_WAY_KEYS_MAP.PHONE)}
                    required={true}
                />
                {this.state.showNeedPhone && index === 0 ?
                    <div className="validate-error-tip">{Intl.get('crm.95', '请输入联系人电话')} </div> : null}
            </div>
        );
    }

    /**
     * 联系方式输入框
     * @param options: {}
     *        label:联系方式的描述（QQ、微信、邮箱）
     *        type:联系方式的类型（qq、weChat、email）
     *        index: 该类型联系方式的第几个输入框的索引（从0开始计算）
     *        size: 该类型联系方式共有几个
     *        rules: 该类型联系方式的验证规则
     *        placeholder: 该类型联系方式的placeholder
     *        formData: 联系人的表单数据
     */
    renderContactWayInput(options){
        const curContactWay = options.formData[options.type][options.index];
        let {getFieldDecorator} = this.props.form;
        return (
            <FormItem
                colon={false}
                label={options.index ? ' ' : options.label}
                labelCol={{span: 3}}
                wrapperCol={{span: 12}}
                key={curContactWay.id}
            >
                {
                    getFieldDecorator(options.type + curContactWay.id, {
                        initialValue: curContactWay.value,
                        rules: _.get(options,'rules',[])
                    })(
                        <Input
                            placeholder={_.get(options,'placeholder','')}
                        />
                    )
                }
                {this.renderContactWayBtns(options.index, options.size, options.type)}
            </FormItem>
        );
    }

    renderContactWayBlock(type) {
        let formData = this.state.formData;
        let wayOptions = {
            label: '',
            type,
            size: formData[type].length,
            formData
        };
        switch (type) {
            case CONTACT_WAY_KEYS_MAP.QQ:
                wayOptions.label = 'QQ';
                wayOptions.placeholder = Intl.get('member.input.qq', '请输入QQ号');
                wayOptions.rules = [{
                    message: Intl.get('common.correct.qq', '请输入正确的QQ号'),
                    pattern: qqRegex,
                }];
                break;
            case CONTACT_WAY_KEYS_MAP.WE_CHAT:
                wayOptions.label = Intl.get('crm.58', '微信');
                wayOptions.placeholder = Intl.get('member.input.wechat', '请输入微信号');
                wayOptions.rules = [{validator: checkWechat}];
                break;
            case CONTACT_WAY_KEYS_MAP.EMAIL:
                wayOptions.label = Intl.get('common.email', '邮箱');
                wayOptions.placeholder = Intl.get('member.input.email', '请输入邮箱');
                wayOptions.rules = [{
                    message: Intl.get('user.email.validate.tip','请输入正确格式的邮箱'),
                    pattern: emailRegex
                }];
                break;
            default:
                break;
        }
        return _.map(formData[type], (contact, index) => {
            let options = {...wayOptions, index};
            return this.renderContactWayInput(options);
        });
    }

    renderContactFormItems() {
        var formData = this.state.formData;
        let {getFieldDecorator} = this.props.form;
        const formLayout = {
            labelCol: {span: 3},
            wrapperCol: {span: 21}
        };
        const formContent = (
            <div>
                <FormItem
                    colon={false}
                    label={Intl.get('common.name', '姓名')}
                    {...formLayout}
                    className="contact-name-wrapper"
                    required={this.props.isRequiredContactName}
                >
                    <Col span={11} className="form-col-padding">
                        <FormItem>
                            {
                                getFieldDecorator('name', {
                                    initialValue: _.get(formData, 'name', ''),
                                    rules: [clueNameContactRule]
                                })(
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        autocomplete="off"
                                        placeholder={Intl.get('crm.contact.name.length', '请输入最多50个字符')}
                                        onBlur={this.validateContactNameDepartment.bind(this)}
                                    />
                                )
                            }
                        </FormItem>
                    </Col>
                    <Col span={6} className="form-col-padding">
                        <FormItem>
                            {
                                getFieldDecorator('department', {
                                    initialValue: _.get(formData, 'department', ''),
                                })(
                                    <Input
                                        value={formData.department}
                                        autocomplete="off"
                                        placeholder={Intl.get('crm.contact.deparment.input', '请输入部门')}
                                        onBlur={this.validateContactNameDepartment.bind(this)}
                                    />
                                )
                            }
                        </FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem>
                            {
                                getFieldDecorator('position', {
                                    initialValue: _.get(formData, 'position', ''),
                                })(
                                    <Input
                                        value={formData.position}
                                        autocomplete="off"
                                        placeholder={Intl.get('crm.114', '请输入职位')}
                                    />
                                )
                            }
                        </FormItem>
                    </Col>
                </FormItem>
                {this.renderValidNameDepartmentTip()}
                <div className="contact-other-item-wrapper">
                    {_.includes(this.props.notShowFormItems, CONTACT_OTHER_KEYS.ROLE) ? null : (
                        <FormItem
                            className="contact-role-item"
                            colon={false}
                            label={Intl.get('user.apply.detail.table.role', '角色')}
                            {...formLayout}
                        >
                            {
                                getFieldDecorator('role', {
                                    initialValue: _.get(formData, 'role', ''),
                                })(
                                    <RadioGroup
                                        value={_.get(formData, 'role', Intl.get('crm.115', '经办人'))}>
                                        {ContactUtil.roleArray.map(function(role, index) {
                                            return (<Radio value={role} key={index}>{role}</Radio>);
                                        })}
                                    </RadioGroup>
                                )
                            }
                        </FormItem>
                    )}
                    {//电话
                        _.map(formData[CONTACT_WAY_KEYS_MAP.PHONE], (contact, index) => {
                            return this.renderPhoneInput(index, formData[CONTACT_WAY_KEYS_MAP.PHONE].length, formData);
                        })
                    }
                    <div style={{display: this.props.isContactWayExpanded ? 'block' : 'none'}}>
                        {/*qq*/}
                        {this.renderContactWayBlock(CONTACT_WAY_KEYS_MAP.QQ)}
                        {/*微信*/}
                        {this.renderContactWayBlock(CONTACT_WAY_KEYS_MAP.WE_CHAT)}
                        {/*邮箱*/}
                        {this.renderContactWayBlock(CONTACT_WAY_KEYS_MAP.EMAIL)}

                        {_.includes(this.props.notShowFormItems, CONTACT_OTHER_KEYS.SEX) ? null : (
                            <FormItem
                                className="contact-sex-item"
                                colon={false}
                                label={Intl.get('crm.contact.sex', '性别')}
                                {...formLayout}
                            >
                                {
                                    getFieldDecorator('sex', {
                                        initialValue: _.get(formData, 'sex', '')
                                    })(
                                        <Radio.Group
                                        >
                                            {_.map(ContactUtil.sexArray, (sex, index) => {
                                                return (<Radio key={index} value={sex}>{sex}</Radio>);
                                            })}
                                        </Radio.Group>
                                    )
                                }
                            </FormItem>)}
                        {_.includes(this.props.notShowFormItems, CONTACT_OTHER_KEYS.BIRTHDAY) ? null : (
                            <FormItem
                                className="contact-birthday-item"
                                colon={false}
                                label={Intl.get('crm.contact.birthday', '生日')}
                                {...formLayout}
                            >
                                {
                                    getFieldDecorator('birthday', {
                                        initialValue: formData.birthday ? moment(formData.birthday, 'YYYY-MM-DD') : null
                                    })(
                                        <DatePicker
                                            showToday={false}
                                            disabledDate={disabledAfterToday}
                                        />
                                    )
                                }
                            </FormItem>
                        )}
                        {_.includes(this.props.notShowFormItems, CONTACT_OTHER_KEYS.HOBBY) ? null : (
                            <FormItem
                                className="contact-hobby-item"
                                colon={false}
                                label={Intl.get('crm.contact.hobby', '爱好')}
                                {...formLayout}
                            >
                                {
                                    getFieldDecorator('hobby', {
                                        initialValue: _.get(formData, 'hobby', '')
                                    })(
                                        <Input
                                            value={_.get(formData, 'hobby', '')}
                                            placeholder={Intl.get('crm.contact.hobby.placeholder', '请输入联系人的兴趣爱好')}
                                        />
                                    )
                                }
                            </FormItem>
                        )}
                        {_.includes(this.props.notShowFormItems, CONTACT_OTHER_KEYS.REMARK) ? null : (
                            <FormItem
                                className="contact-remark-item"
                                colon={false}
                                label={Intl.get('common.remark', '备注')}
                                {...formLayout}
                            >
                                {
                                    getFieldDecorator('remark', {
                                        initialValue: _.get(formData, 'remark', '')
                                    })(
                                        <Input.TextArea
                                            autosize={{minRows: 2, maxRows: 6}}
                                            placeholder={Intl.get('user.input.remark', '请输入备注')}
                                        />
                                    )
                                }
                            </FormItem>
                        )}
                    </div>
                </div>
            </div>
        );
        if(this.props.isUseGeminiScrollbar) {
            return (
                <GeminiScrollbar className="srollbar-out-card-style">
                    {formContent}
                </GeminiScrollbar>
            );
        }else {
            return formContent;
        }
    }

    renderContactForm = () => {
        return (
            <Form key={this.props.uid} layout='horizontal' style={{height: this.props.height}} className="crm-contact-form" autocomplete="off" data-trace="联系人表单">
                {this.renderContactFormItems()}
            </Form>
        );
    };

    render() {
        return (
            <DetailCard
                content={this.renderContactForm()}
                isEdit={this.props.hasSaveAndCancelBtn}
                className="contact-form-container"
                loading={this.state.isLoading}
                saveErrorMsg={this.state.errorMsg}
                handleSubmit={this.handleSubmit}
                handleCancel={this.cancel}
            />
        );
    }
}
ContactForm.defaultProps = {
    contact: ContactUtil.newViewContactObject(),
    type: 'add',
    uid: '',
    //是否在组件装载完后立即对电话输入框中的内容进行校验
    isValidatePhoneOnDidMount: false,
    // 是否在外部进行验证
    isValidateOnExternal: false,
    height: CONTACT_ITEMS_HEIGHHT,
    //是否有提交保存按钮（默认显示）
    hasSaveAndCancelBtn: true,
    //不显示的formItem数组，如['remark', 'sex', 'birthday']
    notShowFormItems: [],
    //联系人名称是否必填（默认必填）
    isRequiredContactName: true,
    //展示qq，邮箱，微信，是给添加客户用的
    isContactWayExpanded: true,
    //是否使用滚动条（默认使用）
    isUseGeminiScrollbar: true,
    //是否动态增删联系人，需与getDynamicAddPhones方法配合使用，具体看crm-add-form组件使用
    isDynamicAddAdnDelContact: false,
};
ContactForm.propTypes = {
    form: PropTypes.object,
    contact: PropTypes.object,
    isMerge: PropTypes.bool,
    uid: PropTypes.string,
    //是否在组件装载完后立即对电话输入框中的内容进行校验
    isValidatePhoneOnDidMount: PropTypes.bool,
    type: PropTypes.string,
    customer_id: PropTypes.string,
    customer_name: PropTypes.string,
    contactListLength: PropTypes.number,
    updateMergeCustomerContact: PropTypes.func,
    updateCustomerDefContact: PropTypes.func,
    getDynamicAddPhones: PropTypes.func,
    isValidateOnExternal: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hasSaveAndCancelBtn: PropTypes.bool,
    notShowFormItems: PropTypes.array,
    isRequiredContactName: PropTypes.bool,
    isContactWayExpanded: PropTypes.bool,
    isUseGeminiScrollbar: PropTypes.bool,
    isDynamicAddAdnDelContact: PropTypes.bool,
};

let ContactFormWrapper = Form.create()(ContactForm);
ContactFormWrapper.CONTACT_WAY_KEYS_MAP = CONTACT_WAY_KEYS_MAP;
ContactFormWrapper.CONTACT_OTHER_KEYS = CONTACT_OTHER_KEYS;

module.exports = ContactFormWrapper;

