/**
 * 线索转客户的操作面板
 */

require('../css/clue-to-customer-panel.less');
require('MOD_DIR/crm/public/css/contact.less');
import { Row, Col, Button, Icon, message } from 'antd';
import ajax from 'ant-ajax';
import { RightPanel } from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DetailCard from 'CMP_DIR/detail-card';
//联系人表单
const ContactForm = require('MOD_DIR/crm/public/views/contacts/contact-form');
//联系人store
const ContactStore = require('MOD_DIR/crm/public/store/contact-store');
const noop = function() {};
//视图类型
const VIEW_TYPE = {
    //相似客户列表视图
    CUSTOMER_LIST: 'customer_list',
    //合并客户视图
    CUSTOMER_MERGE: 'customer_merge'
};

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
        viewType: '',
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

        this.state = {
            //视图类型
            viewType: this.props.viewType || VIEW_TYPE.CUSTOMER_LIST,
            //当前操作的客户的id
            customerId: '',
            //当前操作的客户的名称
            customerName: '',
            //当前操作的客户的联系人列表
            customerContacts: [],
            //是否禁用“确认合并”按钮
            isConfirmMergeBtnDisabled: false
        };
    }
    componentDidMount() {
        ContactStore.listen(this.onContactStoreChange);
        $(window).on('resize', this.onWindowResize);
    }
    componentWillMount(){
        if (this.props.viewType){
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
                viewType: VIEW_TYPE.CUSTOMER_LIST,
            });
        }
    }

    componentDidUpdate() {
        //设置联系人列表容器的高度
        this.setContactListWrapHeight(); 
        //调整联系人表单
        this.adjustContactForm();
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
    onMergeToCustomerClick = customer => {
        ajax.send({
            url: `/rest/customer/v3/contacts/${customer.id}`,
        })
            .done(result => {
                this.setState({
                    customerId: customer.id,
                    customerName: customer.name,
                    customerContacts: result
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
            const uniqSet = _.uniq(all);
            //该联系方式是否重复
            //如果去重后该联系方式总数少了，说明该联系方式有重复
            const isDup = all.length > uniqSet.length;

            //任一联系方式有重复，都表明该联系人的联系方式有重复
            if (isDup) result.isDup = true;

            //该联系方式是否有不同
            const isDiff = _.difference(customerContact[field], clueContact[field]).length || _.difference(clueContact[field], customerContact[field]).length ? true : false;

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

        this.setState({
            customerContacts,
            isConfirmMergeBtnDisabled,
            viewType: VIEW_TYPE.CUSTOMER_MERGE
        });
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
    setViewType = viewType => {
        if (this.props.viewType){
            this.props.hidePanel();
        }else{
            this.setState({ viewType });
        }

    }

    //合并到客户
    mergeToCustomer = () => {
        const contacts = this.state.customerContacts;
        const clueId = this.props.clue.id;

        //变化了的联系人（新增或需要更新的）
        const changedContacts = _.filter(contacts, contact => contact.isNew || !_.isEmpty(contact.updateFields));

        if (!_.isEmpty(changedContacts)) {
            const promises = [];

            _.each(contacts, (contact, index) => {
                //如果是新联系人
                if (contact.isNew) {
                    contact = _.cloneDeep(this.refs[contact.id].state.formData);

                    //联系人表单组件会将当前要添加的联系人设置为默认联系人，不是我们需要的，所以在这里恢复成非默认
                    contact.def_contancts = 'false';

                    if (contact.birthday) {
                        //将moment格式的值转为时间戳
                        contact.birthday = contact.birthday.valueOf();
                    }

                    _.each(contact, (value, key) => {
                        const keyWithoutIndex = key.substr(0, key.length - 1);

                        if (_.includes(CONTACT_WAY_TYPE_FIELDS, keyWithoutIndex)) {
                            if (!contact[keyWithoutIndex]) {
                                contact[keyWithoutIndex] = [value];
                            } else {
                                contact[keyWithoutIndex].push(value);
                            }

                            delete contact[key];
                        }
                    });

                    const promise = ajax.send({
                        url: `/rest/customer/v3/contacts/lead?clue_id=${clueId}`,
                        type: 'post',
                        data: contact
                    });

                    promises.push(promise);
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

            $.when(...promises)
                .done(() => {
                    message.success(Intl.get('common.merge.success', '合并成功'));

                    this.props.onMerged(this.state.customerId, this.state.customerName);
                })
                .fail(err => {
                    const content = _.isArray(err) ? err.join('; ') : err;

                    message.error(content);
                });
        }
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
        const titleBlockHeight = 45;
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
                    <Button type="primary" onClick={this.props.showAddCustomerPanel}>{Intl.get('common.convert.to.new.customer', '转为新客户')}</Button>
                </div>
            </div>
        );
    }

    //渲染联系人标题
    renderContactTitle(contact, contactIndex) {
        let iconClassName = 'iconfont icon-contact-default is-default-contact';

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
        //当前操作的客户
        const curCustomer = _.find(this.props.existingCustomers, customer => customer.id === this.state.customerId);

        //当前操作的客户的联系人中和要渲染的联系人相同的联系人
        const curCustomerContact = _.find(curCustomer.contacts, customerContact => customerContact.name === contact.name);

        //当前线索的联系人中和要渲染的联系人相同的联系人
        const curClueContact = _.find(this.props.clue.contacts, clueContact => clueContact.name === contact.name);

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

                                    //当前操作的客户的联系人中和要渲染的联系人相同的联系人的联系方式
                                    const curCustomerContactWay = _.get(curCustomerContact, typeField);

                                    //当前线索的联系人中和要渲染的联系人相同的联系人的联系方式
                                    const curClueContactWay = _.get(curClueContact, typeField);


                                    //如果当前联系方式在客户中不存在，在线索中存在
                                    if (!_.includes(curCustomerContactWay, item) && _.includes(curClueContactWay, item)) {
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
                    ref={ref => {this.refs[contactId] = ref;}}
                    type="edit"
                    contact={contact}
                />
            </div>
        );
    }

    //渲染客户合并
    renderCustomerMerge() {
        return (
            <div className="customer-merge">
                <div className="title">
                    <span
                        className="go-back clickable"
                        onClick={this.setViewType.bind(this, VIEW_TYPE.CUSTOMER_LIST)}
                    >
                        <i className="iconfont icon-left-arrow"/> {Intl.get('crm.52', '返回')}
                    </span>
                </div>

                <div className="customer-name">
                    {this.state.customerName}
                </div>

                <div className="contact-list-wrap">
                    <div className="contact-list">
                        {_.map(this.state.customerContacts, (contact, contactIndex) => {
                            if (contact.isNew) {
                                return this.renderContactForm(contact);
                            } else {
                                return this.renderContact(contact, contactIndex);
                            }
                        })}
                    </div>
                </div>

                <div className="btn-block">
                    <Button
                        onClick={this.setViewType.bind(this, VIEW_TYPE.CUSTOMER_LIST)}
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

    render() {
        return (
            <RightPanel
                className="clue-right-panel clue-to-customer-panel"
                showFlag={this.props.showFlag}
                data-tracename="线索转客户面板"
            >
                <span className="iconfont icon-close clue-right-btn" onClick={this.props.hidePanel} data-tracename="关闭线索转客户面板"></span>
                <div className="right-panel-content">
                    <div className="clue-detail-wrap">
                        <div className="panel-content">
                            {this.state.viewType === VIEW_TYPE.CUSTOMER_LIST ? this.renderCustomerList() : null}
                            {this.state.viewType === VIEW_TYPE.CUSTOMER_MERGE ? this.renderCustomerMerge() : null}
                        </div>
                    </div>
                </div>
            </RightPanel>
        );
    }
}

export default ClueToCustomerPanel;
