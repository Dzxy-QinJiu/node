var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/15.
 * 动态增删联系人的组件
 */
require('./index.less');
import PropTypes from 'prop-types';
import {emailRegex, qqRegex, checkWechat} from 'PUB_DIR/sources/utils/validate-util';
import PhoneInput from 'CMP_DIR/phone-input';
import classNames from 'classnames';
import {Form, Input, Icon} from 'antd';
const FormItem = Form.Item;
const CONTACT_WAY_PLACEHOLDER = {
    'phone': Intl.get('clue.add.phone.num', '电话号码'),
    'email': Intl.get('clue.add.email.addr', '邮箱地址'),
    'qq': Intl.get('clue.add.qq.num', 'QQ号码'),
    'weChat': Intl.get('clue.add.wechat.num', '微信号码'),
};
// 联系方式的label
const CONTACT_WAY_LABEL = {
    phone: Intl.get('common.phone', '电话'),
    qq: 'QQ',
    email: Intl.get('common.email', '邮箱'),
    weChat: Intl.get('crm.58', '微信')
};

class DynamicAddDelContacts extends React.Component {

    checkQQ = (rule, value, callback) => {
        value = _.trim(value);
        if (value) {
            if (qqRegex.test(value)) {
                callback();
            } else {
                callback(new Error(Intl.get('common.correct.qq', '请输入正确的QQ号')));
            }
        } else {
            callback();
        }
    }


    checkEmail = (rule, value, callback) => {
        value = _.trim(value);
        if (value) {
            if (emailRegex.test(value)) {
                callback();
            } else {
                callback(new Error(Intl.get('common.correct.email', '请输入正确的邮箱')));
            }
        } else {
            callback();
        }
    }

    // 删除联系人
    handleDelContact = (contactKey, index, size) => {
        if (index === 0 && size === 1) retrun;
        const {form} = this.props;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...]
        let contact_keys = form.getFieldValue('contact_keys');
        // 过滤调要删除的联系人的key
        contact_keys = _.filter(contact_keys, (item, index) => item.key !== contactKey);
        form.setFieldsValue({contact_keys});

    };

    // 添加联系人
    handleAddContact = () => {
        const {form} = this.props;
        // contact_keys：记录所有联系人所有联系方式的key数组对象
        // [{ key: 0,
        //    phone:[{key:0}],
        //    qq:[{key:0}],
        //    weChat:[{key:0}],
        //    email:[{key:0}]
        // },...]
        let contact_keys = form.getFieldValue('contact_keys');
        // 联系人key数组中最后一个联系人的key
        let lastContactKey = _.get(contact_keys, `[${contact_keys.length - 1}].key`) || 0;
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

    /**
     * 删除联系方式
     * contactIndex:删除第几个联系人的联系方式
     * contactWay: 删除的哪种联系方式
     * contactWayKey: 删除该key的联系方式
     * phoneKey: 电话的id值，专用于电话的删除操作
     */
    removeContactWay = (contactIndex, contactWay, contactWayKey, phoneKey) => {
        const {form} = this.props;
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
        contact_keys[contactIndex][contactWay] = _.filter(contactWayArray, (item, index) => item.key !== contactWayKey);
        form.setFieldsValue({contact_keys});
        if(phoneKey) this.props.onRemovePhoneInput(phoneKey);
    };
    /**
     * 添加联系方式
     * contactIndex:给第几个联系人添加联系方式
     * contactWay: 添加的哪种联系方式
     */
    addContactWay = (contactIndex, contactWay) => {
        const {form} = this.props;
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
        let lastContactWayKey = _.get(contactWayArray, `[${contactWayArray.length - 1}].key`) || 0;
        // 新加联系方式的key
        let addContactWayKey = lastContactWayKey + 1;
        contactWayArray.push({key: addContactWayKey});
        form.setFieldsValue({contact_keys});
    };

    renderDuplicateWarning = (phoneId) => {
        let duplicateWarning = this.props.phoneDuplicateWarning;
        let warningMsg = _.map(duplicateWarning, item => {
            let {id, warning} = item;
            if(_.isEqual(phoneId, id)) {
                return (
                    <div className='phone-validate-error'>
                        {warning}
                    </div>
                );
            }
        });
        return _.isEmpty(warningMsg) ? null : warningMsg;
    };

    renderDiffContacts(item, index, contact_keys) {
        const size = contact_keys.length;
        const {getFieldDecorator} = this.props.form;
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
        const delContactCls = classNames('iconfont icon-delete handle-btn-item', {
            'disabled': index === 0 && size === 1
        });
        const validateContactName = this.props.validateContactName;
        let {isShowPosition,validatePositionName} = this.props;
        var contactCls = classNames('contact-name-item',{
            'show-position': isShowPosition
        });
        return (
            <div className="contact-wrap" key={`contacts[${contactKey}]`}>
                <FormItem className={contactCls}>
                    {getFieldDecorator(`contacts[${contactKey}].name`, {
                        initialValue: item.name,
                        rules: _.get(validateContactName,'[0]') ? validateContactName : [{
                            required: true,
                            message: Intl.get('crm.90', '请输入姓名')
                        }],
                    })(
                        <Input className='contact-name' placeholder={Intl.get('call.record.contacts', '联系人')}/>
                    )}
                </FormItem>
                {isShowPosition ?
                    <FormItem className='contact-position-item'>
                        {getFieldDecorator(`contacts[${contactKey}].position`, {
                            initialValue: item.position,
                            rules: _.get(validatePositionName,'[0]') ? validatePositionName : [],
                        })(
                         <Input placeholder={Intl.get('member.position.name.placeholder', '请输入职务名称')}/>
                        )}
                    </FormItem>
                    : null}
                <i className={delContactCls} onClick={this.handleDelContact.bind(this, contactKey, index, size)}/>
                <div className="contact-way-item">
                    {_.map(phoneArray, (phone, phoneIndex) => {
                        const phoneKey = `contacts[${contactKey}].phone[${phone.key}]`;
                        return (
                            <div className="contact-item" key={phoneKey}>
                                <PhoneInput
                                    initialValue={phone.value}
                                    placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                                    validateRules={this.props.phoneOnlyOneRules}
                                    id={phoneKey}
                                    labelCol={{span: 4}}
                                    wrapperCol={{span: 20}}
                                    colon={false}
                                    form={this.props.form}
                                    label={phoneIndex === 0 ? Intl.get('common.phone', '电话') : ' '}
                                    handleInputChange={this.setPhoneValue.bind(this, phoneKey)}
                                />
                                {this.renderContactWayBtns(index, phoneIndex, phoneArray.length, 'phone', phone.key, phoneKey)}
                                {this.renderDuplicateWarning(phoneKey)}
                            </div>);
                    })}
                    {_.map(qqArray, (qq, qqIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'qq', qq.key, qq.value, qqIndex, qqArray.length, this.checkQQ);
                    })}
                    {_.map(emailArray, (email, emailIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'email', email.key, email.value, emailIndex, emailArray.length, this.checkEmail);
                    })}
                    {_.map(weChatArray, (weChat, weChatIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'weChat', weChat.key, weChat.value, weChatIndex, weChatArray.length, checkWechat);
                    })}
                </div>
            </div>
        );
    }
    handleInputChange = (e) => {
        var value = _.trim(e.target.value);
        if (value){
            this.props.hideContactRequired();
        }
    };
    setPhoneValue = (phoneKey, obj) => {
        if (_.get(obj,'target.value','')){
            this.props.hideContactRequired();
        }
        let change = {
            key: phoneKey,
            value: _.trim(_.get(obj,'target.value',''))
        };
        this.props.onPhoneChange(change);
    };

    /**
     *  渲染某一个联系方式
     * contactIndex: 联系人的index
     * contactKey: 联系人的key
     * contactWay: 联系方式
     * contactWayKey: 联系人某联系方式的key
     * contactWayValue: 某联系方式的初始值
     * contactWayIndex: 联系人某联系方式的index
     * constactWaySize: 联系人某种联系方式的个数
     * validator:验证方法
     * */
    renderContacWayFormItem(contactIndex, contactKey, contactWay, contactWayKey, contactWayValue, contactWayIndex, contactWaySize, validator) {
        const {getFieldDecorator} = this.props.form;
        // 某个联系人下某个联系方式的ID(例如：contacts[0].qq[0],第一个联系人下的第一个电话)
        const contactWayID = `contacts[${contactKey}].${contactWay}[${contactWayKey}]`;
        let rules = [{required: false}];
        if (validator) {
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
                        initialValue: contactWayValue,
                        rules: rules,
                    })(
                        <Input className='contact-type-tip' placeholder={CONTACT_WAY_PLACEHOLDER[contactWay]} onChange={this.handleInputChange}
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
     * phoneKey: 电话的id, 专用于电话修改时的传参
     * */
    renderContactWayBtns = (contactIndex, contactWayIndex, contactWaySize, contactWay, contactWayKey, phoneKey) => {
        return (<div className="contact-way-buttons">
            {contactWayIndex === 0 && contactWaySize === 1 ? null : (
                <div className="clue-minus-button"
                    onClick={this.removeContactWay.bind(this, contactIndex, contactWay, contactWayKey, phoneKey)}>
                    <Icon type="minus"/>
                </div>)}
            {contactWayIndex === contactWaySize - 1 ? (
                <div className="clue-plus-button" onClick={this.addContactWay.bind(this, contactIndex, contactWay)}>
                    <Icon type="plus"/>
                </div>) : null}
        </div>);
    };
    //获取初始化的数据
    getInitalContacts() {
        // 添加时，默认只展示一个空联系人
        let initialContacts = [{
            key: 0,
            phone: [{key: 0}],
            qq: [{key: 0}],
            weChat: [{key: 0}],
            email: [{key: 0}]
        }];
        if (this.props.contacts) {//编辑时，传入的已有contacts
            initialContacts = _.map(this.props.contacts, (contact, index) => {
                let initContact = {
                    key: index,
                    name: contact.name,
                    phone: [{key: 0}],
                    qq: [{key: 0}],
                    weChat: [{key: 0}],
                    email: [{key: 0}]
                };
                if (_.get(contact, 'phone[0]')) {
                    initContact.phone = _.map(contact.phone, (phone, phoneIndex) => {
                        return {key: phoneIndex, value: phone};
                    });
                }
                if (_.get(contact, 'qq[0]')) {
                    initContact.qq = _.map(contact.qq, (qq, qqIndex) => {
                        return {key: qqIndex, value: qq};
                    });
                }
                if (_.get(contact, 'weChat[0]')) {
                    initContact.weChat = _.map(contact.weChat, (weChat, weChatIndex) => {
                        return {key: weChatIndex, value: weChat};
                    });
                }
                if (_.get(contact, 'email[0]')) {
                    initContact.email = _.map(contact.email, (email, emailIndex) => {
                        return {key: emailIndex, value: email};
                    });
                }
                return initContact;
            });
        }
        return initialContacts;
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        // 控制联系方式增减的key
        getFieldDecorator('contact_keys', {
            initialValue: this.getInitalContacts()
        });
        const contact_keys = getFieldValue('contact_keys');
        return (
            <div className="contact-way-container">
                {_.map(contact_keys, (item, index) => {
                    return this.renderDiffContacts(item, index, contact_keys);
                })}
                <div className="add-contact"
                    onClick={this.handleAddContact}>{Intl.get('crm.detail.contact.add', '添加联系人')}</div>
            </div>);
    }
}
DynamicAddDelContacts.propTypes = {
    form: PropTypes.object,
    phoneOnlyOneRules: PropTypes.array,
    phoneDuplicateWarning: PropTypes.array,
    contacts: PropTypes.array,//编辑时，传入的已有联系人列表
    validateContactName: PropTypes.array,
    validatePositionName: PropTypes.array,
    hideContactRequired: PropTypes.func,
    onPhoneChange: PropTypes.func,
    onRemovePhoneInput: PropTypes.func,
    isShowPosition: PropTypes.boolean
};
DynamicAddDelContacts.defaultProps = {
    form: {},
    phoneOnlyOneRules: [],//电话唯一性的验证
    phoneDuplicateWarning: [], //电话与已有电话相同时提示，用于线索中电话的处理
    validateContactName: [],
    validatePositionName: [],
    hideContactRequired: function() {
    },
    onPhoneChange: function() {},//当电话修改时的回调
    onRemovePhoneInput: function() {},//当删除联系方式时的回调
    isShowPosition: false
};
export default DynamicAddDelContacts;


