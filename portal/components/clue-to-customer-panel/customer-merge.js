/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by yubin on 2019/11/11.
 *
 * 合并客户面板
 */

import ajax from 'ant-ajax';
import { Button, Row, Col, message } from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { storageUtil } from 'ant-utils';
import { VIEW_TYPE, NOOP } from './consts';
import DetailCard from 'CMP_DIR/detail-card';
//联系人表单
const ContactForm = require('MOD_DIR/crm/public/views/contacts/contact-form');
const CONTACT_OTHER_KEYS = ContactForm.CONTACT_OTHER_KEYS;
//联系人store
const ContactStore = require('MOD_DIR/crm/public/store/contact-store');

const { getLocalWebsiteConfig, setWebsiteConfig } = require('LIB_DIR/utils/websiteConfig');
const websiteConfig = getLocalWebsiteConfig() || {};

//联系方式种类
const CONTACT_WAY_TYPES = [
    {
        field: 'phone',
        name: Intl.get('common.phone', '电话')
    }, 
    {
        field: 'qq',
        name: 'QQ'
    }, 
    {
        field: 'weChat',
        name: Intl.get('crm.58', '微信')
    }, 
    {
        field: 'email',
        name: Intl.get('common.email', '邮箱')
    }
];

//联系方式种类字段
const CONTACT_WAY_TYPE_FIELDS = _.map(CONTACT_WAY_TYPES, 'field');

let queryCustomerTimeout = null;
//联系人不用展示的项
const NOT_SHOW_FORM_ITEMS = [
    CONTACT_OTHER_KEYS.SEX,
    CONTACT_OTHER_KEYS.BIRTHDAY,
    CONTACT_OTHER_KEYS.HOBBY,
    CONTACT_OTHER_KEYS.REMARK
];

class CustomerMerge extends React.Component {
    static defaultProps = {
        //改变视图类型
        prevViewType: '',
        //改变视图类型
        changeViewType: NOOP,
        //关闭面板
        onClose: NOOP,
        //合并后
        onMerged: NOOP,
        //父组件
        parent: null,
        //要合并到的客户
        customer: {},
        //当前线索
        clue: {},
    }

    static propTypes = {
        prevViewType: PropTypes.string,
        changeViewType: PropTypes.func,
        onClose: PropTypes.func,
        onMerged: PropTypes.func,
        parent: PropTypes.object,
        customer: PropTypes.object,
        clue: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.state = {
            //当前操作的客户的id
            customerId: '',
            //当前操作的客户的名称
            customerName: '',
            //当前操作的客户的联系人列表，该列表在合并操作过程中被改变，最终会作为合并后的结果进行提交
            customerContacts: [],
            //当前操作的客户的原始联系人列表，该列表在合并操作过程中不会被改变
            rawCustomerContacts: [],
            //是否禁用“确认合并”按钮
            isConfirmMergeBtnDisabled: false,
            //是否显示合并到客户后线索将消失的提示
            isShowClueWillDisappearTip: !websiteConfig.no_longer_tips_clue_will_disappear
        };
    }

    componentDidMount() {
        this.getCustomerContacts();
    }

    render() {
        return (
            <RightPanelModal
                isShowCloseBtn={true}
                onClosePanel={this.props.onClose}
                title={this.renderPanelTitle()}
                content={this.renderPanelContent()}
            />
        );
    }

    renderPanelTitle() {
        const title = Intl.get('common.merge.to.customer', '合并到此客户');
        const opBtnText = Intl.get('crm.52', '返回');

        return (
            <div>
                <span className="panel-title">{title}</span>
                <span className="op-btn" onClick={this.props.changeViewType.bind(this.props.parent, this.props.prevViewType)}>{opBtnText}</span>
            </div>
        );
    }

    renderPanelContent() {
        //客户列表标题区域高度
        const titleBlockHeight = 135;
        // 转为客户后，线索相关内容都将转入客户不在提示内容高度
        const clueWillDisappearTipBlockHeight = 40;
        //转为新客户按钮区域高度
        const convertToNewCustomerBtnBlockHeight = 60;

        let contactListWrapMaxHeight = $(window).height() - titleBlockHeight - convertToNewCustomerBtnBlockHeight;

        if(this.state.isShowClueWillDisappearTip) contactListWrapMaxHeight -= clueWillDisappearTipBlockHeight;

        return (
            <div className="right-panel-content">
                <div className="customer-merge">
                    <div className="customer-name">
                        {this.state.customerName}
                    </div>
    
                    {this.state.isShowClueWillDisappearTip ? (
                        <div className="clue-will-disappear-tip">
                            <i className="iconfont icon-phone-call-out-tip"></i>
                            <span className="tip-content">
                                {Intl.get('common.after.convert.to.customer.tip', '转为客户后，线索相关内容都将转入客户。')}
                            </span>
                            <span className="no-longer-tips clickable" onClick={this.handleNoLongerTipsBtnClick}>
                                {Intl.get('sale.homepage.no.tip.more', '不再提示')}
                            </span>
                        </div>
                    ) : null}
    
                    <div className="contact-list-wrap">
                        <div className="contact-list" style={{height: contactListWrapMaxHeight}}>
                            <GeminiScrollbar>
                                {_.map(this.state.customerContacts, (contact, contactIndex) => {
                                    if (contact.isNew) {
                                        return this.renderContactForm(this.state.customerContacts, contact);
                                    } else {
                                        return this.renderContact(contact, contactIndex);
                                    }
                                })}
                            </GeminiScrollbar>
                        </div>
                    </div>
    
                    <div className="btn-block">
                        <Button
                            onClick={this.props.changeViewType.bind(this.props.parent, this.props.prevViewType)}
                        >
                            {Intl.get('common.cancel', '取消')}
                        </Button>
    
                        <Button
                            type="primary"
                            onClick={this.mergeToCustomer}
                            disabled={this.state.isConfirmMergeBtnDisabled}
                        >
                            {Intl.get('common.confirm.merge', '确认合并')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    //渲染联系人标题
    renderContactTitle(contact, contactIndex) {
        let iconClassName = 'iconfont icon-contact-default';

        if (contact.def_contancts === 'true') {
            iconClassName += ' is-default-contact';
        }

        return (
            <div className="contact-title">
                <div className="contact-name">
                    <span className={iconClassName}></span>
                    {contact.name}
                </div>

                {contact.replaceName ? (
                    <div className="is-replace-contact-name">
                        {Intl.get('common.modify.name.to', '修改姓名为')}“{contact.replaceName}”？
                        <Button
                            onClick={this.onReplaceContactNameCancelBtnClick.bind(this, contactIndex)}
                        >
                            {Intl.get('common.not.modify', '不修改')}
                        </Button>
                        <Button
                            type="primary"
                            onClick={this.onReplaceContactNameConfirmBtnClick.bind(this, contactIndex, contact.replaceName)}
                        >
                            {Intl.get('common.confirm.modify', '确认修改')}
                        </Button>
                    </div>
                ) : null}
            </div>
        );
    }

    //渲染联系人内容
    renderContactContent(contact) {
        return (
            <div className="contact-content">
                {_.map(CONTACT_WAY_TYPES, type => {
                    const typeName = type.name;
                    const typeField = type.field;

                    return (
                        <Row>
                            <Col span={3}>
                                {typeName}：
                            </Col>
                            <Col span={20}>
                                {_.map(contact[typeField], (item, index) => {
                                    //联系方式是否来自线索的标识
                                    let mark = '';

                                    //当前联系方式在客户中是否存在
                                    const contactWayInCustomer = _.find(this.state.rawCustomerContacts, contact => _.includes(contact[typeField], item));
                                    //当前联系方式在线索中是否存在
                                    const contactWayInClue = _.find(this.props.clue.contacts, contact => _.includes(contact[typeField], item));

                                    //如果当前联系方式在客户中不存在，在线索中存在
                                    if (!contactWayInCustomer && contactWayInClue) {
                                    //显示标识
                                        mark = <span className="clue-mark">（{Intl.get('crm.sales.clue', '线索')}）</span>;
                                    }

                                    return (
                                        <div>
                                            {item}{mark || null}
                                        </div>
                                    );
                                })}
                            </Col>
                        </Row>
                    );
                })}
            </div>
        );
    }

    //渲染联系人
    renderContact(contact, contactIndex) {
        const className = contact.isDup ? '' : 'hide';
        return (
            <DetailCard
                title={this.renderContactTitle(contact, contactIndex)}
                content={this.renderContactContent(contact)}
                className={className}
            />
        );
    }

    //渲染联系人表单
    renderContactForm(contacts, contact) {
        const contactId = contact.id;

        //将联系人对象转换成联系人表单组件需要的形式
        contact = {
            contact,
            contactWayAddObj: {
                phone: !_.isEmpty(contact.phone) ? contact.phone : [''],
                qq: !_.isEmpty(contact.qq) ? contact.qq : [''],
                weChat: !_.isEmpty(contact.weChat) ? contact.weChat : [''],
                email: !_.isEmpty(contact.email) ? contact.email : ['']
            }
        };

        return (
            <div className="crm-pannel-contacts">
                <ContactForm
                    uid={'contact' + contact.id}
                    wrappedComponentRef={ref => this[`form${contactId}Ref`] = ref}
                    type="edit"
                    height='auto'
                    contact={contact}
                    isDynamicAddAdnDelContact
                    getDynamicAddPhones={() => {
                        let phoneArray = [];
                        _.each(contacts, item => {
                            if(item.id !== contactId && this[`form${item.id}Ref`]) {
                                let curPhoneArray = this[`form${item.id}Ref`].getCurPhoneArray();
                                phoneArray = phoneArray.concat(curPhoneArray);
                            }
                        });
                        return phoneArray;
                    }}
                    notShowFormItems={NOT_SHOW_FORM_ITEMS}
                    isValidateOnExternal
                    isValidatePhoneOnDidMount={true}
                    hasSaveAndCancelBtn={false}
                    isUseGeminiScrollbar={false}
                />
            </div>
        );
    }

    //获取客户联系人
    getCustomerContacts() {
        const customer = this.props.customer;

        ajax.send({
            url: `/rest/customer/v3/contacts/${customer.id}`,
        })
            .done(result => {
                this.setState({
                    customerId: customer.id,
                    customerName: customer.name,
                    customerContacts: result,
                    rawCustomerContacts: _.cloneDeep(result)
                }, this.setMergedCustomer);
            })
            .fail(err => {
                message.error(err);
            });
    }

    //设置已合并客户
    setMergedCustomer() {
        //当前线索
        const clue = this.props.clue;

        //线索联系人列表
        const clueContacts = clue.contacts;
        //客户联系人列表
        let customerContacts = _.cloneDeep(this.state.customerContacts);
        //是否禁用“确认合并”按钮
        let isConfirmMergeBtnDisabled = false;

        //遍历客户联系人列表
        _.each(customerContacts, customerContact => {
            //遍历线索联系人列表
            _.some(clueContacts, clueContact => {
                //联系方式对比结果
                const contactWayComparisonResult = this.getContactWayComparisonResult(customerContact, clueContact);

                //联系方式是否重复
                const isContactWayDup = contactWayComparisonResult.isDup;

                //联系人名是否重复
                //如果线索和客户存在同名联系人，说明联系人重复
                const isContactNameDup = clueContact.name === customerContact.name;

                //如果联系方式有重复但名字不重复
                if (isContactWayDup && !isContactNameDup) {
                    //将客户联系人的替换名字设置为线索联系人的名字，以供用户选择
                    customerContact.replaceName = clueContact.name;
                    isConfirmMergeBtnDisabled = true;
                }

                //联系人是否重复
                //联系人名重复或联系方式重复都认为是联系人重复
                const isContactDup = isContactNameDup || isContactWayDup;

                //如果联系人重复
                if (isContactDup) {
                    //遍历联系方式类型
                    _.each(CONTACT_WAY_TYPE_FIELDS, field => {
                        //如果联系方式有不同
                        if (contactWayComparisonResult[field].isDiff) {

                            //将联系方式设为合并后的联系方式
                            customerContact[field] = contactWayComparisonResult[field].uniqSet;
                        }
                    });

                    //将该线索联系人标记为重复联系人
                    clueContact.isDup = true;

                    //将该客户联系人标记为重复联系人
                    customerContact.isDup = true;

                    //中止遍历
                    return true;
                }
            });
        });

        //和客户联系人的名称及电话都不重复的线索联系人
        let noneDupClueContacts = _.filter(clue.contacts, clueContact => !clueContact.isDup);

        //遍历不重复的线索联系人
        _.each(noneDupClueContacts, noneDupClueContact => {
            //添加客户id
            noneDupClueContact.customer_id = this.state.customerId;
            //标记为新联系人
            noneDupClueContact.isNew = true;
        });

        //将这些不重复的联系人合并到客户联系人
        customerContacts = _.concat(noneDupClueContacts, customerContacts);

        let state = {
            customerContacts,
            isConfirmMergeBtnDisabled,
        };

        this.setState(state);
    }

    //替换联系人名称确认按钮点击事件
    onReplaceContactNameConfirmBtnClick = (contactIndex, replaceName) => {
        //客户联系人列表
        let customerContacts = _.cloneDeep(this.state.customerContacts);

        //要更新的联系人
        let contact = customerContacts[contactIndex];

        //替换联系人名称
        contact.name = contact.replaceName;
        //删除暂存的替换名称
        delete contact.replaceName;

        //在联系人需要更新的字段中加上名称

        //是否禁用“确认合并”按钮
        //若客户联系人列表中还有需要处理名称替换的联系人，则禁用“确认合并”按钮
        const isConfirmMergeBtnDisabled = _.some(customerContacts, contact => contact.replaceName);

        this.setState({
            customerContacts,
            isConfirmMergeBtnDisabled
        });
    }

    //替换联系人名称取消按钮点击事件
    onReplaceContactNameCancelBtnClick = contactIndex => {
        //客户联系人列表
        let customerContacts = _.cloneDeep(this.state.customerContacts);

        //要更新的联系人
        let contact = customerContacts[contactIndex];

        //删除暂存的替换名称
        delete contact.replaceName;

        //是否禁用“确认合并”按钮
        //若客户联系人列表中还有需要处理名称替换的联系人，则禁用“确认合并”按钮
        const isConfirmMergeBtnDisabled = _.some(customerContacts, contact => contact.replaceName);

        this.setState({
            customerContacts,
            isConfirmMergeBtnDisabled
        });
    }

    //获取联系方式对比结果
    getContactWayComparisonResult(customerContact, clueContact) {
        let result = {
            //联系方式是否重复
            isDup: false
        };

        //遍历联系方式类型
        _.each(CONTACT_WAY_TYPE_FIELDS, field => {

            //客户联系人中该联系方式和线索联系人中该联系方式的合集
            let all = _.concat(customerContact[field], clueContact[field]);

            //如果是要比较电话，需要将电话中的横线去掉，以免将数字相同只是有的带横线有的不带横线的电话识别为不同的电话
            if (field === 'phone') {
                all = _.map(all, item => item.replace(/-/g, ''));
            }

            //去重后的该联系方式合集
            let uniqSet = _.uniq(all);
            //该联系方式是否重复
            //如果去重后该联系方式总数少了，说明该联系方式有重复
            const isDup = all.length > uniqSet.length;

            //任一联系方式有重复，都表明该联系人的联系方式有重复
            if (isDup) result.isDup = true;

            //该联系方式是否有不同
            const isDiff = _.difference(customerContact[field], clueContact[field]).length || _.difference(clueContact[field], customerContact[field]).length ? true : false;

            //除了当前正在比较的客户联系人外的其他客户联系人相关联系方式的合集
            const otherCustomerContactWay = _.chain(this.state.customerContacts).filter(contact => contact.id !== customerContact.id).map(field).flatten().value();
            
            //在当前客户联系人和线索联系人的相关联系方式的不重复的合集中去掉和其他客户联系人相关联系方式重复的项
            uniqSet = _.filter(uniqSet, item => !_.includes(otherCustomerContactWay, item));
            
            result[field] = {
                isDiff,
                uniqSet
            };
        });

        return result;
    }

    //合并到客户
    mergeToCustomer = (e) => {
        Trace.traceEvent(e, '点击合并客户面板中的"确认合并"按钮');

        //禁用“确认合并”按钮
        this.setState({
            isConfirmMergeBtnDisabled: true
        });

        const contacts = this.state.customerContacts;
        var clue = this.props.clue;
        const clueId = clue.id;
        let contactErrors = [];

        _.each(contacts, (contact, index) => {
            //如果是新联系人
            if (contact.isNew) {
                let res = this[`form${contact.id}Ref`].handleSubmit();
                if(res.error) {
                    contactErrors.push('true');
                }else {
                    let contactFormData = res.data;

                    //联系人表单组件会将当前要添加的联系人设置为默认联系人，不是我们需要的，所以在这里恢复成非默认
                    contactFormData.def_contancts = 'false';
                    contacts[index] = contactFormData;
                }
            }

            delete contact.isDup;
            delete contact.isNew;
        });

        if(_.get(contactErrors,'[0]')) {
            message.warning(Intl.get('clue.merge.customer.contact.error.tip', '请填写正确的联系方式后，再进行合并'));
            return false;
        }

        const customerData = {
            id: this.state.customerId,
            contacts,
        };

        ajax.send({
            url: `/force_use_common_rest/rest/clue/v2/lead_transfer/customer/merge?lead_id=${clueId}`,
            type: 'post',
            data: customerData
        })
            .done(() => {
                message.success(Intl.get('common.merge.success', '合并成功'));

                //执行转化后的处理
                this.props.onMerged(this.state.customerId);
            })
            .fail(err => {
                const content = _.isArray(err) ? err.join('; ') : err;

                message.error(content);
            })
            .always(() => {
                //取消禁用“确认合并”按钮
                this.setState({
                    isConfirmMergeBtnDisabled: false
                });
            });
    }

    //不再提示按钮点击事件
    handleNoLongerTipsBtnClick = () => {
        setWebsiteConfig({
            no_longer_tips_clue_will_disappear: true
        },
        result => {
            this.setState({
                isShowClueWillDisappearTip: false
            });
        },
        err => {
            message.error(err);
        });
    }
}

export default CustomerMerge;
