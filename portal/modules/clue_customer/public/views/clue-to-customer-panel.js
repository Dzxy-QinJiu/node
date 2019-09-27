/**
 * 线索转客户的操作面板
 */

require('../css/clue-to-customer-panel.less');
require('MOD_DIR/crm/public/css/contact.less');
import { storageUtil } from 'ant-utils';
import { CLUE_TO_CUSTOMER_VIEW_TYPE } from '../consts';
import userData from 'PUB_DIR/sources/user-data';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { Row, Col, Button, Icon, message, Select } from 'antd';
import ajax from 'ant-ajax';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DetailCard from 'CMP_DIR/detail-card';
//联系人表单
const ContactForm = require('MOD_DIR/crm/public/views/contacts/contact-form');
const CONTACT_OTHER_KEYS = ContactForm.CONTACT_OTHER_KEYS;
//联系人store
const ContactStore = require('MOD_DIR/crm/public/store/contact-store');
const noop = function() {};
import {
    SELECT_TYPE,
} from '../utils/clue-customer-utils';
import {subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';

//视图类型
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

class ClueToCustomerPanel extends React.Component {
    static defaultProps = {
        //面板是否显示
        showFlag: false,
        //当前线索
        clue: {},
        //已存在的客户
        existingCustomers: [],
        //关闭面板按钮点击事件
        hidePanel: noop,
        //显示添加客户面板
        showAddCustomerPanel: noop,
        //合并完成后的回调事件
        onMerged: noop,
        //展示的视图类型
        viewType: CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_LIST,
    };

    static propTypes = {
        showFlag: PropTypes.bool,
        clue: PropTypes.object,
        existingCustomers: PropTypes.array,
        hidePanel: PropTypes.func,
        showAddCustomerPanel: PropTypes.func,
        onMerged: PropTypes.func,
        viewType: PropTypes.string,
    };

    constructor(props) {
        super(props);

        const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));

        this.state = {
            //视图类型
            viewType: this.props.viewType,
            //前一个视图类型
            prevViewType: '',
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
            //客户搜索结果
            customerList: [],
            //是否显示合并到客户后线索将消失的提示
            isShowClueWillDisappearTip: !websiteConfig.no_longer_tips_clue_will_disappear
        };
    }
    componentDidMount() {
        ContactStore.listen(this.onContactStoreChange);
        $(window).on('resize', this.onWindowResize);

        //从线索详情面板点合并到此客户按钮打开线索转客户面板时，直接显示合并界面
        if (this.props.viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_MERGE){
            this.onMergeToCustomerClick(_.get(this, 'props.existingCustomers[0]'));
        }
    }

    componentWillUnmount() {
        ContactStore.unlisten(this.onContactStoreChange);
        $(window).off('resize', this.onWindowResize);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.clue.id !== this.props.clue.id) {
            this.setState({
                viewType: CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_LIST,
            });
        }
    }

    componentDidUpdate() {
        //设置联系人列表容器的高度
        // this.setContactListWrapHeight();
        //调整联系人表单
        // this.adjustContactForm();
    }

    //设置联系人列表容器的高度
    setContactListWrapHeight() {
        const contactListWrap = $('.contact-list-wrap');

        if (contactListWrap.length) {
            const contactListHeight = $('.contact-list').height();
            const contactListWrapMaxHeight = $(window).height() - contactListWrap.offset().top - 60;

            if (contactListHeight > contactListWrapMaxHeight) {
                contactListWrap.height(contactListWrapMaxHeight);
            } else {
                contactListWrap.css('height', 'auto');
            }
        }
    }

    //调整联系人表单
    adjustContactForm = () => {
        const contactForms = $('.crm-contact-form');

        if (contactForms.length) {
            contactForms.each((index, contactForm) => {
                contactForm = $(contactForm);

                //给联系人表单设置折叠效果
                this.setFormHeight(contactForm);

                //隐藏滚动条
                this.hideScrollBar(contactForm);

                //给联系方式后面的删除按钮设置点击事件
                this.setClickEventForContactWayDeleteBtn(contactForm);
            });
        }
    }

    //隐藏滚动条
    hideScrollBar(contactForm) {
        //隐藏滚动条元素
        contactForm.find('.gm-scrollbar').hide();
        //调整滚动条视图元素的样式
        contactForm.find('.gm-scroll-view').css({
            width: 'auto',
            height: 'auto',
            overflow: 'hidden'
        });
    }

    //给联系方式后面的删除按钮设置点击事件
    setClickEventForContactWayDeleteBtn(contactForm) {
        //联系方式后面的删除按钮
        const minusBtn = contactForm.find('.anticon-minus-circle-o:not(.bound)');

        if (minusBtn.length) {
            //点联系方式后面的删除按钮后调整联系人表单
            //因为点删除按钮后不会像点添加按钮后那样触发父组件的更新
            //所以只能用这种手段绑定事件的方式实现
            minusBtn.click(() => {
                setTimeout(() => {
                    //隐藏滚动条
                    this.hideScrollBar(contactForm);

                    //给联系人表单设置折叠效果
                    this.setFormHeight(contactForm);
                });
            });
        }
    }

    //给联系人表单设置合适的高度
    setFormHeight(contactForm) {
        //性别项
        const gendarItem = contactForm.find('.contact-sex-item');

        //计算高度，将性别项连同其下面的表单项排除在高度之外，以达到隐藏这些表单项的效果
        const properHeight = gendarItem.offset().top - contactForm.offset().top; 
        contactForm.height(properHeight);
    }

    //联系人Store变更处理事件
    onContactStoreChange = () => {
        //为了让点击除电话外的其他联系方式后面的添加按钮时，界面上能有变化
        this.setState({});
    };

    onWindowResize = () => {
        this.setState({});
    };

    //获取重复的客户联系人
    getDupCustomerContacts(customer, clue) {
        let dupContacts = [];

        //客户联系人列表
        const customerContacts = customer.contacts;
        //线索联系人列表
        const clueContacts = clue.contacts;

        //遍历客户联系人列表
        _.each(customerContacts, customerContact => {
            //遍历线索联系人列表
            _.some(clueContacts, clueContact => {
                //客户联系人电话和线索联系人电话的合集
                const allPhone = _.concat(customerContact.phone, clueContact.phone);
                //去重后的电话合集
                const uniqPhone = _.uniq(allPhone);
                //电话是否重复
                //如果去重后电话总数少了，说明有重复的电话
                const isPhoneDup = allPhone.length > uniqPhone.length;

                //联系人名是否重复
                //如果线索和客户存在同名联系人，说明联系人重复
                const isContactNameDup = clueContact.name === customerContact.name;

                //联系人名重复或电话重复都认为是联系人重复
                const isContactDup = isContactNameDup || isPhoneDup;

                //如果联系人重复
                if (isContactDup) {
                    let dupContact = {
                        name: customerContact.name,
                        phone: _.clone(customerContact.phone)
                    }; 

                    if (isContactNameDup) {
                        dupContact.name = <span className="high-light">{dupContact.name}</span>;
                    }

                    if (isPhoneDup) {
                        dupContact.phone = _.map(dupContact.phone, item => {
                            if (_.includes(clueContact.phone, item)) {
                                item = <span className="high-light">{item}</span>;
                            }

                            return item;
                        });
                    }

                    dupContacts.push(dupContact);
                }
            });
        });

        return dupContacts;
    }

    //合并到此客户按钮点击事件
    onMergeToCustomerClick = (customer, e) => {
        Trace.traceEvent(e, '点击合并客户面板中的"合并到此客户"按钮');

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

    //获取联系方式对比结果
    getContactWayComparisonResult(customerContact, clueContact) {
        let result = {
            //联系方式是否重复
            isDup: false
        };

        //遍历联系方式类型
        _.each(CONTACT_WAY_TYPE_FIELDS, field => {

            //客户联系人中该联系方式和线索联系人中该联系方式的合集
            const all = _.concat(customerContact[field], clueContact[field]);
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
                            //标记联系方式需要更新
                            if (_.isArray(customerContact.updateFields)) {
                                customerContact.updateFields.push(field);
                            } else {
                                customerContact.updateFields = [field];
                            }

                            //将联系方式设为合并后的联系方式
                            customerContact[field] = contactWayComparisonResult[field].uniqSet;
                        }
                    });

                    //将该线索联系人标记为重复联系人
                    clueContact.isDup = true;

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
        customerContacts = _.concat( noneDupClueContacts, customerContacts);

        let state = {
            customerContacts,
            isConfirmMergeBtnDisabled,
            viewType: CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_MERGE,
        };

        if (this.props.viewType !== CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_MERGE){
            state.prevViewType = this.state.viewType;
        }

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

        if (!contact.updateFields) contact.updateFields = [];
        //在联系人需要更新的字段中加上名称
        contact.updateFields.push('name');

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

    //设置视图类型
    setViewType = (viewType, prevViewType) => {
        let state = {viewType};

        if (!_.isUndefined(prevViewType)) {
            state.prevViewType = prevViewType;
        }

        this.setState(state);
    }

    //处理返回按钮点击事件
    handleGoBack = () => {
        const prevViewType = this.state.prevViewType;

        if (prevViewType) {
            this.setState({
                prevViewType: '',
                viewType: prevViewType,
            });
        } else {
            this.props.hidePanel();
        }
    }

    //合并到客户
    mergeToCustomer = (e) => {
        Trace.traceEvent(e, '点击合并客户面板中的"确认合并"按钮');

        const contacts = this.state.customerContacts;
        var clue = this.props.clue;
        const clueId = clue.id;

        //变化了的联系人（新增或需要更新的）
        const changedContacts = _.filter(contacts, contact => contact.isNew || !_.isEmpty(contact.updateFields));

        //如果没有变化的联系人
        if (_.isEmpty(changedContacts)) {
            //将第一个联系人设置为名字需要更新，以便能合并到客户
            _.set(contacts, '[0].updateFields', ['name']);
        }

        const promises = [];
        let contactErrors = [];

        _.each(contacts, (contact, index) => {
            //如果是新联系人
            if (contact.isNew) {
                let res = this[`form${contact.id}Ref`].handleSubmit();
                if(res.error) {
                    contactErrors.push('true');
                }else {
                    contact = res.data;

                    //联系人表单组件会将当前要添加的联系人设置为默认联系人，不是我们需要的，所以在这里恢复成非默认
                    contact.def_contancts = 'false';

                    const promise = ajax.send({
                        url: `/rest/customer/v3/contacts/lead?clue_id=${clueId}`,
                        type: 'post',
                        data: contact
                    });

                    promises.push(promise);
                }
            } else {
                //遍历需要更新的字段
                _.each(contact.updateFields, field => {

                    const promise = ajax.send({
                        url: `/rest/customer/v3/contacts/property/${field}/lead?clue_id=${clueId}`,
                        type: 'put',
                        data: contact
                    }, `clueToCustomer${index}${field}`);

                    promises.push(promise);
                });

                delete contact.updateFields;
            }
        });

        if(_.get(contactErrors,'[0]')) {
            message.warning(Intl.get('clue.merge.customer.contact.error.tip', '请填写正确的联系方式后，再进行合并'));
            return false;
        }

        $.when(...promises)
            .done(() => {
                message.success(Intl.get('common.merge.success', '合并成功'));
                subtracteGlobalClue(clue);
                this.props.onMerged(this.state.customerId, this.state.customerName);
            })
            .fail(err => {
                const content = _.isArray(err) ? err.join('; ') : err;

                message.error(content);
            });
    }

    //渲染客户列表项
    renderCustomerItem(customer) {
        const clue = this.props.clue;
        const clueName = clue.name;
        let customerName = customer.name;

        if (customerName === clueName) {
            customerName = <span className="high-light">{customerName}</span>;
        } else {
            const startIndex = customerName.indexOf(clueName);

            if (startIndex > -1) {
                const endIndex = startIndex + clueName.length;
                const beginPart = customerName.substr(0, startIndex);
                const endPart = customerName.substr(endIndex);

                customerName = <span>{beginPart}<span className="high-light">{clueName}</span>{endPart}</span>;
            }
        }
        
        const contacts = this.getDupCustomerContacts(customer, clue);

        return (
            <div className="customer-item">
                <div className="customer-info">
                    <div className="customer-name">
                        {customerName}
                    </div>
                    {contacts.length ? (
                        <div className="customer-contacts">
                            {_.map(contacts, contact => {
                                return (
                                    <div className="contact-item">
                                        <div className="contact-name">
                                            {contact.name}
                                        </div>
                                        <div className="contact-phone">
                                            {_.map(contact.phone, (phone, phoneIndex) => {
                                                return (
                                                    <div>
                                                        {phone}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                <Button
                    onClick={this.onMergeToCustomerClick.bind(this, customer)}
                >
                    {Intl.get('common.merge.to.customer', '合并到此客户')}
                </Button>
            </div>
        );
    }

    //渲染相似客户列表
    renderCustomerList() {
        //相似客户列表
        const existingCustomers = this.props.existingCustomers;

        //客户列表标题区域高度
        const titleBlockHeight = 135;
        //转为新客户按钮区域高度
        const convertToNewCustomerBtnBlockHeight = 60;
        //列表容器最大高度
        const listWrapMaxHeight = $(window).height() - titleBlockHeight - convertToNewCustomerBtnBlockHeight;

        return (
            <div className="customer-list">
                <div className="title">
                    <Icon type="exclamation-circle" />
                    {Intl.get('common.has.similar.customers', '有{count}个信息相似的客户', {count: existingCustomers.length})}
                </div>

                <div className="list-wrap" style={{height: listWrapMaxHeight}}>
                    <GeminiScrollbar>
                        {_.map(existingCustomers, customer => {
                            return this.renderCustomerItem(customer);
                        })}
                    </GeminiScrollbar>
                </div>

                <div className="btn-block">
                    <Button onClick={this.props.hidePanel}>{Intl.get('common.cancel', '取消')}</Button>

                    {userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) ? null : (
                        <Button type="primary" onClick={this.props.showAddCustomerPanel}>{Intl.get('common.convert.to.new.customer', '转为新客户')}</Button>
                    )}
                </div>
            </div>
        );
    }

    // 查询客户
    queryCustomer = keyword => {
        //更新输入框内容

        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }

        queryCustomerTimeout = setTimeout(() => {
            const authType = hasPrivilege('CALL_RECORD_VIEW_MANAGER') ? 'manager' : 'user';

            ajax.send({
                url: `/rest/customer/v3/customer/range/${authType}/10/1/start_time/descend`,
                type: 'post',
                data: {
                    query: {
                        name: keyword
                    }
                }
            })
                .done(result => {
                    this.setState({customerList: result.result});
                });
        }, 500);
    }

    // 客户选择触发事件
    onCustomerChoosen = customerId => {
        const customer = _.find(this.state.customerList, item => item.id === customerId);

        this.onMergeToCustomerClick(customer);
    }

    //渲染客户搜索界面
    renderCustomerSearch = () => {
        return (
            <div className="customer-search">
                <Select
                    combobox
                    filterOption={false}
                    placeholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                    optionLabelProp='children'
                    onSearch={this.queryCustomer}
                    onSelect={this.onCustomerChoosen}
                >
                    {this.state.customerList.map((customer, index) => {
                        return <Option key={index} value={customer.id}>{customer.name}</Option>;
                    })}
                </Select>
            </div>
        );
    }

    //合并到已有客户
    mergeToExistingCustomer = () => {
        this.setState({
            viewType: CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_SEARCH,
            prevViewType: this.state.viewType
        });
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
        return (
            <DetailCard
                title={this.renderContactTitle(contact, contactIndex)}
                content={this.renderContactContent(contact)}
            />
        );
    }

    //渲染联系人表单
    renderContactForm(contact) {
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
                    notShowFormItems={NOT_SHOW_FORM_ITEMS}
                    isValidateOnExternal
                    isValidatePhoneOnDidMount={true}
                    hasSaveAndCancelBtn={false}
                    isUseGeminiScrollbar={false}
                />
            </div>
        );
    }

    //取消合并
    handleCancelMerge = () => {
        const prevViewType = this.state.prevViewType;

        if (prevViewType) {
            this.setViewType(prevViewType, '');
        } else {
            this.props.hidePanel();
        }
    }

    //渲染面板标题
    renderPanelTitle() {
        const viewType = this.state.viewType;
        let title = '';
        let opBtnClickHandler = function() {};
        let opBtnText = '';

        if (viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_LIST) {
            title = Intl.get('common.convert.to.customer', '转为客户');
            opBtnText = Intl.get('common.merge.to.other.customer', '合并到其他客户');
            opBtnClickHandler = this.mergeToExistingCustomer;
        } else if (viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_SEARCH) {
            title = Intl.get('common.merge.to.other.customer', '合并到其他客户');
            opBtnText = Intl.get('crm.52', '返回');
            opBtnClickHandler = this.handleGoBack;
        } else if (viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_MERGE) {
            title = Intl.get('common.merge.to.customer', '合并到此客户');
            opBtnText = Intl.get('crm.52', '返回');
            opBtnClickHandler = this.handleGoBack;
        }

        return (
            <div>
                <span className="panel-title">{title}</span>
                <span className="op-btn" onClick={opBtnClickHandler}>{opBtnText}</span>
            </div>
        );
    }

    //不再提示按钮点击事件
    handleNoLongerTipsBtnClick = () => {
        ajax.send({
            url: '/rest/base/v1/user/website/config/personnel',
            type: 'post',
            data: {
                no_longer_tips_clue_will_disappear: true
            }
        })
            .done(result => {
                this.setState({
                    isShowClueWillDisappearTip: false
                });
            })
            .fail(err => {
                message.error(err);
            });
    }

    //渲染客户合并
    renderCustomerMerge() {
        //客户列表标题区域高度
        const titleBlockHeight = 135;
        // 转为客户后，线索相关内容都将转入客户不在提示内容高度
        const clueWillDisappearTipBlockHeight = 40;
        //转为新客户按钮区域高度
        const convertToNewCustomerBtnBlockHeight = 60;
        let contactListWrapMaxHeight = $(window).height() - titleBlockHeight - convertToNewCustomerBtnBlockHeight;
        if(this.state.isShowClueWillDisappearTip) contactListWrapMaxHeight -= clueWillDisappearTipBlockHeight;
        return (
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
                                    return this.renderContactForm(contact);
                                } else {
                                    return this.renderContact(contact, contactIndex);
                                }
                            })}
                        </GeminiScrollbar>
                    </div>
                </div>

                <div className="btn-block">
                    <Button
                        onClick={this.handleCancelMerge}
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
        );
    }

    renderPanelContent() {
        return (
            <div className="right-panel-content">
                <div className="clue-detail-wrap">
                    <div className="panel-content">
                        {this.state.viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_LIST ? this.renderCustomerList() : null}
                        {this.state.viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_SEARCH ? this.renderCustomerSearch() : null}
                        {this.state.viewType === CLUE_TO_CUSTOMER_VIEW_TYPE.CUSTOMER_MERGE ? this.renderCustomerMerge() : null}
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="clue-right-panel clue-to-customer-panel"
                isShowCloseBtn={true}
                onClosePanel={this.props.hidePanel}
                title={this.renderPanelTitle()}
                content={this.renderPanelContent()}
                data-tracename="线索转客户面板"
            />
        );
    }
}

export default ClueToCustomerPanel;
