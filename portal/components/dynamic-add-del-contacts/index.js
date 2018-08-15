/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/15.
 * 动态增删联系人的组件
 */
require('./index.less');
import {emailRegex, qqRegex} from 'PUB_DIR/sources/utils/consts';
import PhoneInput from 'CMP_DIR/phone-input';
import classNames from 'classnames';
import {Form, Input, Icon} from 'antd';
const FormItem = Form.Item;
const DIFCONTACTWAY = {
    PHONE: 'phone',
    EMAIL: 'email',
    QQ: 'qq',
    WECHAT: 'weChat'
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

class DynamicAddDelContacts extends React.Component {

    checkQQ = (rule, value, callback) => {
        value = $.trim(value);
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
        value = $.trim(value);
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
     */
    removeContactWay = (contactIndex, contactWay, contactWayKey) => {
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
        const delContactCls = classNames('iconfont icon-delete', {
            'disabled': index === 0 && size === 1
        });
        return (
            <div className="contact-wrap" key={`contacts[${contactKey}]`}>
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
                                    placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                                    validateRules={this.props.phoneOnlyOneRules}
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
                        return this.renderContacWayFormItem(index, contactKey, 'qq', qq.key, qqIndex, qqArray.length, this.checkQQ);
                    })}
                    {_.map(emailArray, (email, emailIndex) => {
                        return this.renderContacWayFormItem(index, contactKey, 'email', email.key, emailIndex, emailArray.length, this.checkEmail);
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
    renderContacWayFormItem(contactIndex, contactKey, contactWay, contactWayKey, contactWayIndex, contactWaySize, validator) {
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
            {contactWayIndex === 0 && contactWaySize === 1 ? null : (
                <div className="clue-minus-button"
                    onClick={this.removeContactWay.bind(this, contactIndex, contactWay, contactWayKey)}>
                    <Icon type="minus"/>
                </div>)}
            {contactWayIndex === contactWaySize - 1 ? (
                <div className="clue-plus-button" onClick={this.addContactWay.bind(this, contactIndex, contactWay)}>
                    <Icon type="plus"/>
                </div>) : null}
        </div>);
    };

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        // 控制联系方式增减的key
        getFieldDecorator('contact_keys', {
            initialValue: [{
                key: 0,
                phone: [{key: 0}],
                qq: [{key: 0}],
                weChat: [{key: 0}],
                email: [{key: 0}]
            }]
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
const PropTypes = React.PropTypes;
DynamicAddDelContacts.propTypes = {
    form: PropTypes.object,
    phoneOnlyOneRules: PropTypes.array
};
DynamicAddDelContacts.defaultProps = {
    form: {},
    phoneOnlyOneRules: [],//电话唯一性的验证
};
export default DynamicAddDelContacts;


