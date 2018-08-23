/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/26.
 */
import {RightPanel, RightPanelSubmit, RightPanelCancel, RightPanelClose} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from './right_panel_top';
import {Form, Input, Select, DatePicker, Button, Icon} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
import ajax from '../../../crm/common/ajax';
const routes = require('../../../crm/common/route');
var clueCustomerAction = require('../action/clue-customer-action');
import {checkClueName, checkEmail, checkQQ} from '../utils/clue-customer-utils';
var classNames = require('classnames');
import {nameRegex} from 'PUB_DIR/sources/utils/consts';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
const PHONE_INPUT_ID = 'phoneInput';
var CrmAction = require('MOD_DIR/crm/public/action/crm-actions');
import PhoneInput from 'CMP_DIR/phone-input';
var uuid = require('uuid/v4');
import AlertTimer from 'CMP_DIR/alert-timer';
require('../css/add-clues-info.less');
import Trace from 'LIB_DIR/trace';
const DIFCONTACTWAY = {
    PHONE: 'phone',
    EMAIL: 'email',
    QQ: 'qq',
    WECHAT: 'weChat'
};
var initialContact = {
    'name': '',
    'show_contact_item': [{type: DIFCONTACTWAY.PHONE, value: '',randomValue: uuid()}]
};
const CONTACT_WAY_PLACEHOLDER = {
    'phone': Intl.get('clue.add.phone.num', '电话号码'),
    'email': Intl.get('clue.add.email.addr', '邮箱地址'),
    'qq': Intl.get('clue.add.qq.num', 'QQ号码'),
    'weChat': Intl.get('clue.add.wechat.num', '微信号码')
};
// 联系方式的label
const CONTACT_WAY_LABEL = {
    phone: Intl.get('common.phone', '电话'),
    qq: 'Q Q',
    email: Intl.get('common.email', '邮箱'),
    weChat: Intl.get('crm.58', '微信')
};
const FORMLAYOUT = {
    PADDINGTOTAL: 70
};

class ClueAddForm extends React.Component {
    constructor(props) {
        super(props);
        const today = moment().format('YYYY-MM-DD');
        this.state = {
            formData: {
                name: '',//客户名称
                contact_name: '',//联系人
                contacts: [_.cloneDeep(initialContact)],
                clue_source: '',//线索来源
                access_channel: '',//接入渠道
                source: '',//线索描述
                source_time: today,//线索时间，默认：今天
            },
            isSaving: false,
            saveMsg: '',
            saveResult: '',
            newAddClue: {},//新增加的线索
            clueNameExist: false,//线索名称是否存在
            clueCustomerCheckErrMsg: ''//线索名称校验失败
        };
    }
    componentDidMount() {
        $('.contact-containers .ant-form-item-label label').addClass('ant-form-item-required');
    }
    getPhoneFormValue = (form) => {
        return new Promise(resolve => {
            form.validateFields((errs, fields) => {
                resolve({errs, fields});
            });
        });
    };
    //保存结果的处理
    setResultData(saveMsg, saveResult){
        this.setState({
            isSaving: false,
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    }
    afterAddClue = (submitObj) => {
        //如果线索来源或者接入渠道,线索类型加入新的类型
        if (submitObj.clue_source && !_.includes(this.props.clueSourceArray,submitObj.clue_source)){
            _.isFunction(this.props.updateClueSource) && this.props.updateClueSource(submitObj.clue_source);
        }
        if (submitObj.access_channel && !_.includes(this.props.accessChannelArray,submitObj.access_channel)){
            _.isFunction(this.props.updateClueChannel) && this.props.updateClueChannel(submitObj.access_channel);
        }
        if (submitObj.clue_classify && !_.includes(this.props.clueClassifyArray,submitObj.clue_classify)){
            _.isFunction(this.props.updateClueClassify) && this.props.updateClueClassify(submitObj.clue_classify);
        }
    };

    hasContactWay(contactWayArray) {
        return _.find(contactWayArray, item => item);
    }

    // 是否有联系方式的验证
    validateContactIsEmpty(contacts){
        let contactIsEmpty = true;
        _.each(contacts, (contactItem) => {
            if( this.hasContactWay(contactItem.phone) ||
                this.hasContactWay(contactItem.qq) ||
                this.hasContactWay(contactItem.email) ||
                this.hasContactWay(contactItem.weChat)) {
                contactIsEmpty = false;
                return false;
            }
        });
        if (contactIsEmpty) {
            this.setState({
                contactErrMsg: Intl.get('clue.fill.clue.contacts', '请填写线索的联系方式')
            });
        }
        return contactIsEmpty;
    }

    getSubmitObj(values){
        let submitObj = {};
        //去掉values中的key值
        _.forEach(values, (value, key) => {
            if(value){
                if(key === 'source_time'){
                    submitObj[key] = moment(value).valueOf();
                } else if (key === 'contacts'){//联系人的处理
                    let contacts = [];
                    _.each(value, contact => {
                        let submitContact = _.cloneDeep(contact);
                        if(submitContact.name){
                            // 过滤掉空的联系方式
                            submitContact.phone = _ .filter(submitContact.phone, phone => phone);
                            submitContact.qq = _.filter(submitContact.qq, qq => qq);
                            submitContact.email = _.filter(submitContact.email, email => email);
                            submitContact.weChat = _.filter(submitContact.weChat, weChat => weChat);
                            contacts.push(submitContact);
                        }
                    });
                    submitObj[key] = contacts;
                } else if(key !== 'contact_keys'){//去掉用于动态增删联系方式的属性
                    submitObj[key] = value;
                }
            }
        });
        //生成线索客户的用户的id
        if (this.props.appUserId){
            submitObj.app_user_ids = [this.props.appUserId];
            submitObj.app_user_info = [{
                id: this.props.appUserId,
                name: this.props.appUserName
            }];
        }
        //把订单的第一个设置为默认联系人
        if (_.isArray(submitObj.contacts) && submitObj.contacts.length){
            submitObj.contacts[0]['def_contancts'] = 'true';
        }
        return submitObj;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            //是否有联系方式的验证
            if (this.validateContactIsEmpty(values.contacts)){
                return;
            }
            let submitObj = this.getSubmitObj(values);
            let addRoute = _.find(routes, (route) => route.handler === 'addSalesClue');
            this.setState({isSaving: true, saveMsg: '', saveResult: ''});
            ajax({
                url: addRoute.path,
                type: addRoute.method,
                data: submitObj
            }).then(data => {
                if (_.isObject(data) && data.code === 0) {
                    //添加成功
                    this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                    this.setState({
                        newAddClue: data.result
                    });
                    clueCustomerAction.afterAddSalesClue({newCustomer: data.result});
                    this.afterAddClue(submitObj);
                    //线索客户添加成功后的回调
                    _.isFunction(this.props.afterAddSalesClue) && this.props.afterAddSalesClue();
                } else {
                    this.setResultData(Intl.get('crm.154', '添加失败'), 'error');
                }
            }, errorMsg => {
                //添加失败
                this.setResultData(errorMsg || Intl.get('crm.154', '添加失败'), 'error');
            });
    
        });
    };
    //验证客户名是否重复
    checkOnlyClueCustomerName = () => {
        let customerName = $.trim(this.props.form.getFieldValue('name'));
        //满足验证条件后再进行唯一性验证
        if (customerName && nameRegex.test(customerName)) {
            clueCustomerAction.checkOnlyClueName(customerName, (data) => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({
                        clueNameExist: false,
                        clueCustomerCheckErrMsg: data
                    });
                } else {
                    if (_.isObject(data) && data.result === 'true') {
                        this.setState({
                            clueNameExist: false,
                            clueCustomerCheckErrMsg: ''
                        });
                    } else {
                        //已存在
                        this.setState({
                            clueNameExist: true,
                            clueCustomerCheckErrMsg: ''
                        });
                    }
                }
            });
        }
    };

    renderCheckClueNameMsg() {
        if (this.state.clueNameExist) {
            return (<div className="clue-name-repeat">{Intl.get('clue.customer.check.repeat', '该线索名称已存在')}</div>);
        } else if (this.state.clueCustomerCheckErrMsg) {
            return (
                <div className="clue-name-errmsg">{Intl.get('clue.customer.check.only.exist', '线索名称唯一性校验失败')}</div>);
        } else {
            return '';
        }
    }

    renderCheckContactMsg() {
        if (this.state.contactErrMsg) {
            return (
                <div className="clue-contactname-errmsg">
                    {this.state.contactErrMsg}
                </div>
            );
        } else {
            return '';
        }
    }

    handleContactTypeChange = (index, itemIndex, value) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['show_contact_item'][itemIndex]['type'] = value;
        this.setState({
            formData: this.state.formData
        });
    };
    handleChangeContactName = (index, e) => {
        var contacts = this.state.formData.contacts;
        contacts[index]['name'] = e.target.value;
        this.setState({
            formData: this.state.formData,
            contactErrMsg: ''
        });
    };
    checkOnlyContactPhone = (rule, value, callback) => {
        CrmAction.checkOnlyContactPhone(value, data => {
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
    };
    getPhoneInputValidateRules = () => {
        return [{
            validator: (rule, value, callback) => {
                this.checkOnlyContactPhone(rule, value, callback);
            }
        }];
    };
    // 删除联系人
    handleDelContact = (contactKey, index, size) => {
        if(index === 0 && size === 1) retrun;
        const { form } = this.props;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...] 
        let contact_keys = form.getFieldValue('contact_keys');
        // 过滤调要删除的联系人的key
        contact_keys = _.filter(contact_keys, (item,index) => item.key !== contactKey);
        form.setFieldsValue({contact_keys});
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.iconfont.icon-delete'), '删除联系人');
    };

    setContactValue = (index, itemIndex, randomValue, e) => {
        var formData = this.state.formData;
        formData.contacts[index]['show_contact_item'][itemIndex]['value'] = e.target.value;
        this.setState({
            formData: this.state.formData
        });
        var a = {};
        a[randomValue] = e.target.value;
        this.props.form.setFieldsValue(a);
    };
    // 添加联系人
    handleAddContact = () => {
        const { form } = this.props;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...] 
        let contact_keys = form.getFieldValue('contact_keys');
        // 联系人key数组中最后一个联系人的key
        let lastContactKey = _.get(contact_keys,`[${contact_keys.length - 1}].key`) || 0;
        // 新加联系人的key
        let addContactKey = lastContactKey + 1;
        contact_keys.push({ 
            key: addContactKey,
            phone: [{key: 0}],
            qq: [{key: 0}],
            weChat: [{key: 0}],
            email: [{key: 0}]
        });
        form.setFieldsValue({contact_keys});
    };
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
        });
        setTimeout(() => {
            this.props.hideAddForm();
        },1000);

    };
    /**
     * 删除联系方式
     * contactIndex:删除第几个联系人的联系方式
     * contactWay: 删除的哪种联系方式
     * contactWayKey: 删除该key的联系方式
     */
    removeContactWay = (contactIndex, contactWay, contactWayKey) => {
        const { form } = this.props;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...] 
        let contact_keys = form.getFieldValue('contact_keys');
        //contactWayArray: 某个联系人某种联系方式的key数组
        let contactWayArray = contact_keys[contactIndex][contactWay];
        // 过滤调要删除的联系方式的key
        contact_keys[contactIndex][contactWay] = _.filter(contactWayArray, (item,index) => item.key !== contactWayKey);
        form.setFieldsValue({contact_keys});

    };
    /**
     * 添加联系方式
     * contactIndex:给第几个联系人添加联系方式
     * contactWay: 添加的哪种联系方式
     */
    addContactWay = (contactIndex, contactWay) => {
        const { form } = this.props;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...] 
        let contact_keys = form.getFieldValue('contact_keys');
        //contactWayArray: 某个联系人某种联系方式的key数组
        let contactWayArray = contact_keys[contactIndex][contactWay];
        // 当前联系方式key数组中获取最后一个联系方式的key
        let lastContactWayKey = _.get(contactWayArray,`[${contactWayArray.length - 1}].key`) || 0;
        // 新加联系方式的key
        let addContactWayKey = lastContactWayKey + 1;
        contactWayArray.push({ key: addContactWayKey});
        form.setFieldsValue({contact_keys});
    };

    renderDiffContacts(item, index, contact_keys) {
        const size = contact_keys.length;
        const {getFieldDecorator, getFieldValue, getFieldsValue} = this.props.form;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...] 
        const phoneArray = contact_keys[index].phone;
        const qqArray = contact_keys[index].qq;
        const emailArray = contact_keys[index].email;
        const weChatArray = contact_keys[index].weChat;
        const contactKey = item.key;//当前联系人的key
        const delContactCls = classNames('iconfont icon-delete', {
            'disabled': index === 0 && size === 1
        });
        return (
            <div className="contact-wrap" key={`contacts[${contactKey}]`} >
                <FormItem className="contact-name-item">
                    {getFieldDecorator(`contacts[${contactKey}].name`, {
                        rules: [{
                            required: true,
                            message: Intl.get('crm.90', '请输入姓名')
                        }]
                    })(
                        <Input className='contact-name' placeholder={Intl.get('call.record.contacts', '联系人')}/>
                    )}
                    <i className={delContactCls} onClick={this.handleDelContact.bind(this, contactKey, index, size)}/>
                </FormItem>
                <div className="contact-way-item">
                    {_.map(phoneArray, (phone, phoneIndex) => {
                        const phoneKey = `contacts[${contactKey}].phone[${phone.key}]`;
                        return (
                            <div className="contact-item" key={phoneKey}>
                                <PhoneInput
                                    wrappedComponentRef={(inst) => this.phoneInputRefs.push(inst) }
                                    placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                                    validateRules={this.getPhoneInputValidateRules()}
                                    // onChange={this.setContactValue.bind(this, index, phoneKey)}
                                    id={phoneKey}
                                    labelCol={{span: 4}}
                                    wrapperCol={{span: 20}}
                                    colon={false}
                                    form={this.props.form}
                                    label={phoneIndex === 0 ? Intl.get('common.phone', '电话') : ' '}
                                />
                                {this.renderContactWayBtns(index, phoneIndex, phoneArray.length, 'phone', phone.key)}
                            </div>);
                    })}
                    {_.map(qqArray, (qq, qqIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'qq', qq.key, qqIndex, qqArray.length, checkQQ);
                    })}
                    {_.map(emailArray, (email, emailIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'email', email.key, emailIndex, emailArray.length, checkEmail);
                    })}
                    {_.map(weChatArray, (weChat, weChatIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'weChat', weChat.key, weChatIndex, weChatArray.length);
                    })}
                </div>
            </div>
        );
    }
    /**
     *  渲染某一个联系方式
     * contactIndex: 联系人的index
     * contactKey: 联系人的key
     * contactWay: 联系方式
     * contactWayKey: 联系人某联系方式的key
     * contactWayIndex: 联系人某联系方式的index
     * constactWaySize: 联系人某种联系方式的个数
     * validator:验证方法
     * */
    renderContacWayFormItem(contactIndex, contactKey, contactWay, contactWayKey, contactWayIndex, contactWaySize, validator){
        const {getFieldDecorator} = this.props.form;
        // 某个联系人下某个联系方式的ID(例如：contacts[0].qq[0],第一个联系人下的第一个电话)
        const contactWayID = `contacts[${contactKey}].${contactWay}[${contactWayKey}]`;
        let rules = [{required: false}];
        if(validator){
            rules.push({validator: validator});
        }
        return (
            <div className="contact-item" key={contactWayID}>
                <FormItem 
                    label={contactWayIndex === 0 ? CONTACT_WAY_LABEL[contactWay] : ' '}
                    labelCol={{span: 4}}
                    wrapperCol={{span: 20}}
                    colon={false}
                >
                    {getFieldDecorator(contactWayID, {
                        rules: rules,
                    })(
                        <Input className='contact-type-tip' placeholder={CONTACT_WAY_PLACEHOLDER[contactWay]}
                        />
                    ) }
                </FormItem>
                {this.renderContactWayBtns(contactIndex, contactWayIndex, contactWaySize, contactWay, contactWayKey)}
            </div>
        );
    }
    /**
     * 添加、删除联系方式的按钮 
     * contactIndex: 联系人的index
     * contactWayIndex: 联系人某联系方式的index
     * contactWaySize: 联系人某种联系方式的个数
     * contactWay: 联系方式
     * contactWayKey: 联系方式的key
     * */
    renderContactWayBtns = (contactIndex, contactWayIndex, contactWaySize, contactWay, contactWayKey) => {
        return (<div className="contact-way-buttons">
            {contactWayIndex === 0 && contactWaySize === 1 ? null : <div className="clue-minus-button"
                onClick={this.removeContactWay.bind(this, contactIndex, contactWay, contactWayKey)}>
                <Icon type="minus"/>
            </div>}
            {contactWayIndex === contactWaySize - 1 ? (
                <div className="clue-plus-button" onClick={this.addContactWay.bind(this, contactIndex, contactWay)}>
                    <Icon type="plus"/>
                </div>) : null}
        </div>);
    };
    render(){
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 19},
            },
        };
        let formData = this.state.formData;
        var clsContainer = classNames('form-item-label contact-containers', {
            'contact-err-tip': this.state.contactErrMsg
        });
        this.phoneInputRefs = [];
        let saveResult = this.state.saveResult;
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        // 控制联系方式增减的key
        getFieldDecorator('contact_keys', { initialValue: [{
            key: 0,
            phone: [{key: 0}],
            qq: [{key: 0}],
            weChat: [{key: 0}],
            email: [{key: 0}]
        }] 
        });
        const contact_keys = getFieldValue('contact_keys');
        return (
            <RightPanel showFlag={true} data-tracename="添加线索面板" className="sales-clue-add-container">
                <BasicData
                    clueTypeTitle={Intl.get('crm.sales.add.clue', '添加线索')}
                />
                <div className="add-clue-item" style={{'height': divHeight}}>
                    <GeminiScrollbar>
                        <Form horizontal className="sales-clue-form" id="sales-clue-form">
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('clue.analysis.consult.time', '咨询时间')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('source_time', {
                                    rules: [{
                                        required: true,
                                    }],
                                    initialValue: moment()
                                })(
                                    <DatePicker
                                        allowClear={false}
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('clue.customer.clue.name', '线索名称')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true,
                                        message: Intl.get('clue.customer.fillin.clue.name', '请填写线索名称')
                                    }, {validator: checkClueName}]
                                })(
                                    <Input
                                        name="name"
                                        id="name"
                                        placeholder={Intl.get('clue.suggest.input.customer.name', '建议输入客户名称')}
                                        onBlur={() => {
                                            this.checkOnlyClueCustomerName();
                                        }}
                                    />
                                )}
                            </FormItem>
                            {this.renderCheckClueNameMsg()}
                            <FormItem
                                className={clsContainer}
                                label={Intl.get('crm.5', '联系方式')}
                                {...formItemLayout}
                            >
                                <div className="contact-way-container">
                                    {_.map(contact_keys, (item, index) => {
                                        return this.renderDiffContacts(item, index, contact_keys);
                                    })}
                                    <div className="add-contact"
                                        onClick={this.handleAddContact}
                                        data-tracename="添加联系人"
                                    >{Intl.get('crm.detail.contact.add', '添加联系人')}</div>
                                </div>
                            </FormItem>
                            {this.renderCheckContactMsg()}
                            <FormItem
                                className="form-item-label"
                                label={Intl.get('crm.sales.clue.descr', '线索描述')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('source')(
                                    <Input
                                        placeholder={Intl.get('clue.add.customer.need', '请描述一下客户需求')}
                                        name="source"
                                        type="textarea" id="source" rows="3"
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('crm.sales.clue.source', '线索来源')}
                                id="clue_source"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('clue_source')(
                                        <Select
                                            combobox
                                            placeholder={Intl.get('crm.clue.source.placeholder', '请选择或输入线索来源')}
                                            name="clue_source"
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                        >
                                            {
                                                _.isArray(this.props.clueSourceArray) ?
                                                    this.props.clueSourceArray.map((source, idx) => {
                                                        return (<Option key={idx} value={source}>{source}</Option>);
                                                    }) : null
                                            }
                                        </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('crm.sales.clue.access.channel', '接入渠道')}
                                id="access_channel"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('access_channel')(
                                        <Select
                                            combobox
                                            placeholder={Intl.get('crm.access.channel.placeholder', '请选择或输入接入渠道')}
                                            name="access_channel"
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                            value={formData.access_channel}
                                        >
                                            {_.isArray(this.props.accessChannelArray) ?
                                                this.props.accessChannelArray.map((source, idx) => {
                                                    return (<Option key={idx} value={source}>{source}</Option>);
                                                }) : null
                                            }
                                        </Select>
                                    )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('clue.customer.classify', '线索分类')}
                                id="clue_classify"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('clue_classify')(
                                        <Select
                                            combobox
                                            placeholder={Intl.get('crm.clue.classify.placeholder', '请选择或输入线索分类')}
                                            name="clue_classify"
                                            value={formData.clue_classify}
                                            getPopupContainer={() => document.getElementById('sales-clue-form')}
                                        >
                                            {_.isArray(this.props.clueClassifyArray) ?
                                                this.props.clueClassifyArray.map((source, idx) => {
                                                    return (<Option key={idx} value={source}>{source}</Option>);
                                                }) : null
                                            }
                                        </Select>
                                    )}
                            </FormItem>
                            <div className="submit-button-container">
                                <FormItem
                                    wrapperCol={{span: 24}}>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={saveResult === 'error' ? 3000 : 600}
                                                    message={this.state.saveMsg}
                                                    type={saveResult} showIcon
                                                    onHide={this.hideSaveTooltip}/>
                                            ) : ''
                                        }
                                    </div>
                                    <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                        disabled={this.state.isSaving} data-tracename="点击保存添加
                                            线索按钮">
                                        {Intl.get('common.save', '保存')}
                                        {this.state.isSaving ? <Icon type="loading"/> : null}
                                    </Button>
                                    <Button className="cancel-btn" onClick={this.props.hideAddForm}
                                        data-tracename="点击取消添加线索按钮">
                                        {Intl.get('common.cancel', '取消')}
                                    </Button>
                                </FormItem>
                            </div>
                        </Form>
                    </GeminiScrollbar>
                </div>
            </RightPanel>
        );
    }
}
ClueAddForm.defaultProps = {
    defaultClueData: {},
    clueSourceArray: [],
    updateClueSource: function() {

    },
    accessChannelArray: [],
    updateClueChannel: function() {

    },
    clueClassifyArray: [],
    updateClueClassify: function() {

    },
    afterAddSalesClue: function() {

    },
    form: {},
    hideAddForm: function() {

    },
    appUserId: '',
    appUserName: ''

};
ClueAddForm.propTypes = {
    defaultClueData: React.PropTypes.object,
    clueSourceArray: React.PropTypes.object,
    updateClueSource: React.PropTypes.func,
    accessChannelArray: React.PropTypes.object,
    updateClueChannel: React.PropTypes.func,
    clueClassifyArray: React.PropTypes.object,
    updateClueClassify: React.PropTypes.func,
    afterAddSalesClue: React.PropTypes.func,
    form: React.PropTypes.object,
    hideAddForm: React.PropTypes.func,
    appUserId: React.PropTypes.string,
    appUserName: React.PropTypes.string
};
export default Form.create()(ClueAddForm);
