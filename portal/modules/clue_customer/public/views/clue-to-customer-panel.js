/**
 * 线索转客户的操作面板
 */

require('../css/clue-to-customer-panel.less');
require('MOD_DIR/crm/public/css/contact.less');
import { Row, Col, Button } from 'antd';
import ajax from 'ant-ajax';
import { RightPanel } from 'CMP_DIR/rightPanel';
//联系人表单
const ContactForm = require('MOD_DIR/crm/public/views/contacts/contact-form');
const noop = function() {};

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
        showAddCustomerPanel: noop
    };

    static propTypes = {
        showFlag: PropTypes.bool,
        clue: PropTypes.object,
        existingCustomers: PropTypes.array,
        hidePanel: PropTypes.func,
        showAddCustomerPanel: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.state = {
            //合并到客户的操作区块是否显示
            isMergeCustomerBlockShow: false,
            //要合并到的客户
            toMergeCustomer: {},
            //合并后的客户
            mergedCustomer: {},
            //要操作的联系人的索引
            opContactIndex: -1,
            //要操作的电话的索引
            opPhoneIndex: -1,
            //要操作的电话
            opPhone: '',
            //要修改的联系人
            contactsToModify: [],
            //要添加的联系人
            contactsToAdd: [],
        };
    }

    //合并到此客户按钮点击事件
    onMergeToCustomerClick = customer => {
        ajax.send({
            url: `/rest/customer/v3/contacts/${customer.id}`,
        })
            .done(result => {
                this.setState({
                    toMergeCustomer: customer,
                }, this.setMergedCustomer);
            })
            .fail(err => {
            });
    }

    //替换联系人名称按钮点击事件
    onReplaceContactNameClick = (contactIndex, replaceName) => {
        let mergedCustomer = _.cloneDeep(this.state.mergedCustomer);
        let contactsToModify = _.cloneDeep(this.state.contactsToModify);
        let contact = mergedCustomer.contacts[contactIndex];

        //替换联系人名称
        contact.name = replaceName;
        contact.customer_id = mergedCustomer.id;
        contact.modifyField = 'name';
        delete contact.replaceName;
        contactsToModify.push(contact);

        this.setState({
            mergedCustomer,
            contactsToModify
        });
    }

    //隐藏合并客户操作区块
    hideMergeCustomerBlock = () => {
        this.setState({
            isMergeCustomerBlockShow: false,
        });
    }

    //设置已合并客户
    setMergedCustomer() {
        //当前线索
        const clue = this.props.clue;

        //没有当前线索时直接返回
        if (_.isEmpty(clue)) return;

        //合并后的客户
        let mergedCustomer = _.cloneDeep(this.state.toMergeCustomer);
        let contactsToModify = _.cloneDeep(this.state.contactsToModify);
        let contactsToAdd = _.cloneDeep(this.state.contactsToAdd);

        //遍历客户联系人
        _.each(mergedCustomer.contacts, customerContact => {
            //遍历线索联系人
            _.some(clue.contacts, clueContact => {
                //客户联系人电话和线索联系人电话的合集
                const allPhone = _.concat(customerContact.phone, clueContact.phone);
                //去重后的电话合集
                const uniqPhone = _.uniq(allPhone);

                //如果存在同名联系人，说明联系人重复
                if (clueContact.name === customerContact.name) {
                    //将客户联系人的电话设置为去重后的电话合集
                    customerContact.phone = uniqPhone;
                    //将该客户联系人标记为需要更新电话
                    customerContact.modifyField = 'phone';
                    //设置客户id
                    customerContact.customer_id = mergedCustomer.id;

                    //加入需要更新的联系人列表
                    contactsToModify.push(customerContact);

                    //将该线索联系人标记为重复联系人
                    clueContact.isDup = true;

                    //中止遍历
                    return true;
                //如果电话重复
                } else if (allPhone.length > uniqPhone.length) {
                    //将客户联系人的电话设置为去重后的电话合集
                    customerContact.phone = uniqPhone;
                    //将该客户联系人标记为重复联系人
                    customerContact.isDup = true;
                    //将该线索联系人标记为重复联系人
                    clueContact.isDup = true;
                    
                    //如果有重复电话的客户联系人和线索联系人的名字不相同
                    if (customerContact.name !== clueContact.name) {
                        //将线索联系人的名字设置为客户联系人的替换名字
                        customerContact.replaceName = clueContact.name;
                    }

                    //中止遍历
                    return true;
                }
            });
        });

        //和客户联系人的名称及电话都不重复的线索联系人
        let noneDupClueContacts = _.filter(clue.contacts, clueContact => !clueContact.isDup);

        _.each(noneDupClueContacts, noneDupClueContact => {
            //添加客户id
            noneDupClueContact.customer_id = mergedCustomer.id;
            //标记为新联系人
            noneDupClueContact.isNew = true;
        });

        //将这些不重复的联系人合并到客户联系人
        mergedCustomer.contacts = _.concat(mergedCustomer.contacts, noneDupClueContacts);

        //将这些不重复的联系人合并到要添加的联系人列表
        contactsToAdd = _.concat(contactsToAdd, noneDupClueContacts);

        this.setState({
            mergedCustomer,
            contactsToModify,
            contactsToAdd,
            isMergeCustomerBlockShow: true,
        });
    }

    //合并到客户
    mergeToCustomer = () => {
        const clueId = this.props.clue.id;
        const contactsToModify = this.state.contactsToModify;
        const contactsToAdd = this.state.contactsToAdd;

        if (!_.isEmpty(contactsToModify)) {
            _.each(contactsToModify, contact => {
                const type = contact.modifyField;
                delete contact.modifyField;
                ajax.send({
                    url: `/rest/customer/v3/contacts/property/${type}/lead?clue_id=${clueId}`,
                    type: 'put',
                    data: contact
                })
                    .done(result => {
                    })
                    .fail(err => {
                        /*
                        this.setState({
                            isShowClueToCustomerPanel: false,
                            isShowAddCustomerPanel: true,
                            existingCustomers: []
                        });
                        */
                    });
            });
        }
    }

    //渲染添加新客户区块
    renderAddCustomerBlock() {
        const clue = this.props.clue;

        return (
            <div className="basic-info-block">
                <Row>
                    <Col span={4}>
                        {Intl.get('crm.41', '客户名')}：
                    </Col>
                    <Col span={20}>
                        {clue.name}
                    </Col>
                </Row>
                {_.map(clue.contacts, contact => {
                    return (
                        <div>
                            <Row>
                                <Col span={4}>
                                    {Intl.get('call.record.contacts', '联系人')}：
                                </Col>
                                <Col span={20}>
                                    {contact.name}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={4}>
                                    {Intl.get('common.phone', '电话')}：
                                </Col>
                                <Col span={20}>
                                    {_.map(contact.phone, phone => {
                                        return <div>{phone}</div>;
                                    })}
                                </Col>
                            </Row>
                        </div>
                    );
                })}
                <Row>
                    <Col span={4}>
                        {Intl.get('crm.6', '负责人')}：
                    </Col>
                    <Col span={20}>
                        {clue.user_name}
                    </Col>
                </Row>
            </div>
        );
    }

    //渲染已存在客户区块
    renderExistingCustomersBlock() {
        const existingCustomers = this.props.existingCustomers;

        return (
            <div className="exists-customer-block">
                <div className="title">
                    <b>{Intl.get('common.has.similar.customers', '有{count}个信息相似的客户', {count: existingCustomers.length})}</b>
                </div>

                {_.map(existingCustomers, (customer, index) => {
                    return (
                        <Row>
                            <Col span={12}>
                                {customer.name}
                            </Col>
                            <Col span={12}>
                                <span
                                    className="clickable"
                                    onClick={this.onMergeToCustomerClick.bind(this, customer)}
                                >
                                    合并到此客户
                                </span>
                            </Col>
                        </Row>
                    );
                })}

                <div className="btn-block">
                    <Button onClick={this.props.hidePanel}>{Intl.get('common.cancel', '取消')}</Button>
                    <Button type="primary" onClick={this.props.showAddCustomerPanel}>{Intl.get('common.convert.to.new.customer', '转为新客户')}</Button>
                </div>
            </div>
        );
    }

    //渲染联系人
    renderContact(contact, contactIndex) {
        return (
            <div className="exist-customer">
                <Row>
                    <Col span={4}>
                        {Intl.get('call.record.contacts', '联系人')}：
                    </Col>
                    <Col span={20}>
                        {contact.name}
                        {contact.replaceName ? (
                            <div>
                                修改姓名为“{contact.replaceName}”？
                                <Button
                                    type="primary"
                                    onClick={this.onReplaceContactNameClick.bind(this, contactIndex, contact.replaceName)}
                                >
                                确认修改
                                </Button>
                                <Button
                                    onClick={this.onReplaceContactNameClick.bind(this, contactIndex, contact.replaceName)}
                                >
                                不修改
                                </Button>
                            </div>
                        ) : null}
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>
                        {Intl.get('common.phone', '电话')}：
                    </Col>
                    <Col span={20}>
                        {_.map(contact.phone, (phone, phoneIndex) => {
                            return (
                                <div>
                                    {phone}
                                </div>
                            );
                        })}
                    </Col>
                </Row>
            </div>
        );
    }

    //渲染联系人表单
    renderContactForm(contact, contactIndex) {
        contact = {contact};

        return (
            <div className="crm-pannel-contacts">
                <ContactForm
                    type="edit"
                    contact={contact}
                />
            </div>
        );
    }

    //渲染合并客户区块
    renderMergeCustomerBlock() {
        const customer = this.state.mergedCustomer;

        return (
            <div className="merge-customer-block">
                <div className="title">
                    <b>合并到此客户</b>
                    <span className="go-back clickable" onClick={this.hideMergeCustomerBlock}>返回</span>
                </div>
                <Row>
                    <Col span={4}>
                        {Intl.get('crm.41', '客户名')}：
                    </Col>
                    <Col span={20}>
                        {customer.name}
                    </Col>
                </Row>
                {_.map(customer.contacts, (contact, contactIndex) => {
                    if (contact.isNew) {
                        return this.renderContactForm(contact, contactIndex);
                    } else {
                        return this.renderContact(contact, contactIndex);
                    }
                })}
                <div className="btn-block">
                    <Button onClick={this.hideMergeCustomerBlock}>{Intl.get('common.cancel', '取消')}</Button>
                    <Button type="primary" onClick={this.mergeToCustomer}>确认合并</Button>
                </div>
            </div>
        );
    }

    render() {
        //相似客户区块是否显示
        const isExistingCustomersBlockShow = this.props.existingCustomers.length && !this.state.isMergeCustomerBlockShow;
        //合并客户区块是否显示
        const isMergeCustomerBlockShow = this.state.isMergeCustomerBlockShow;

        return (
            <RightPanel
                className="clue_customer_rightpanel clue-to-customer-panel"
                showFlag={this.props.showFlag}
                data-tracename="线索转客户面板"
            >
                <span className="iconfont icon-close clue-right-btn" onClick={this.props.hidePanel} data-tracename="关闭线索转客户面板"></span>
                <div className="clue-detail-wrap">
                    <div className="panel-content">
                        {isExistingCustomersBlockShow ? this.renderExistingCustomersBlock() : null}
                        {isMergeCustomerBlockShow ? this.renderMergeCustomerBlock() : null}
                    </div>
                </div>
            </RightPanel>
        );
    }
}

export default ClueToCustomerPanel;
