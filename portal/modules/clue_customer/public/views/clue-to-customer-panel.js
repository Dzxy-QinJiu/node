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
            //视图类型
            viewType: VIEW_TYPE.CUSTOMER_LIST,
            //当前操作的客户的id
            customerId: '',
            //当前操作的客户的名称
            customerName: '',
            //当前操作的客户的联系人列表
            customerContacts: [],
        };
    }

    componentDidMount() {
        ContactStore.listen(this.onContactStoreChange);
    }

    componentWillUnmount() {
        ContactStore.unlisten(this.onContactStoreChange);
    }

    onContactStoreChange = () => {
        //为了让点击除电话外的其他联系方式后面的添加按钮时，界面上能有变化
        this.setState({});
    };

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
            });
    }

    //设置已合并客户
    setMergedCustomer() {
        //当前线索
        const clue = this.props.clue;

        //没有当前线索时直接返回
        if (_.isEmpty(clue)) return;

        //线索联系人列表
        const clueContacts = clue.contacts;
        //客户联系人列表
        let customerContacts = _.cloneDeep(this.state.customerContacts);

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
                    //将客户联系人的电话设置为去重后的电话合集
                    customerContact.phone = uniqPhone;
                    //将该客户联系人标记为需要更新电话
                    customerContact.updateFields = ['phone'];

                    //将该线索联系人标记为重复联系人
                    clueContact.isDup = true;

                    //如果电话重复且客户联系人和线索联系人的名字不相同
                    if (isPhoneDup && customerContact.name !== clueContact.name) {
                        //将客户联系人的替换名字设置为线索联系人的名字，以供用户选择
                        customerContact.replaceName = clueContact.name;
                    }

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
        customerContacts = _.concat(customerContacts, noneDupClueContacts);

        this.setState({
            customerContacts,
            viewType: VIEW_TYPE.CUSTOMER_MERGE
        });
    }

    //替换联系人名称按钮点击事件
    onReplaceContactNameClick = (contactIndex, replaceName) => {
        //客户联系人列表
        let customerContacts = _.cloneDeep(this.state.customerContacts);

        //要更新的联系人
        let contact = customerContacts[contactIndex];

        //替换联系人名称
        contact.name = contact.replaceName;
        //删除暂存的替换名称
        delete contact.replaceName;
        //在联系人需要更新的字段中加上名称
        contact.updateFields.push('name');

        this.setState({ customerContacts });
    }

    //设置视图类型
    setViewType = viewType => {
        this.setState({ viewType });
    }

    //合并到客户
    mergeToCustomer = () => {
        const contacts = this.state.customerContacts;
        const clueId = this.props.clue.id;

        _.each(contacts, contact => {
            //如果是新联系人
            if (contact.isNew) {
                contact = _.cloneDeep(this.refs[contact.id].state.formData);
                const fields = ['phone', 'qq', 'weChat', 'email'];

                _.each(contact, (value, key) => {
                    const keyWithoutIndex = key.substr(0, key.length - 1);

                    if (_.includes(fields, keyWithoutIndex)) {
                        if (!contact[keyWithoutIndex]) {
                            contact[keyWithoutIndex] = [value];
                        } else {
                            contact[keyWithoutIndex].push(value);
                        }

                        delete contact[key];
                    }
                });
                //console.log(contact)
                //return

                ajax.send({
                    url: `/rest/customer/v3/contacts/lead?clue_id=${clueId}`,
                    type: 'post',
                    data: contact
                })
                    .done(result => {
                    })
                    .fail(err => {
                    });
            } else {
                //如果没有需要更新的字段，直接返回
                if (_.isEmpty(contact.updateFields)) return;

                //遍历需要更新的字段
                _.each(contact.updateFields, field => {
                    ajax.send({
                        url: `/rest/customer/v3/contacts/property/${field}/lead?clue_id=${clueId}`,
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
                            });
                            */
                        });
                });

                delete contact.updateFields;
            }
        });
    }

    //渲染客户列表
    renderCustomerList() {
        const existingCustomers = this.props.existingCustomers;

        return (
            <div className="customer-list">
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
                    <b>合并到此客户</b>
                    <span className="go-back clickable" onClick={this.setViewType.bind(this, VIEW_TYPE.CUSTOMER_LIST)}>返回</span>
                </div>
                <Row>
                    <Col span={4}>
                        {Intl.get('crm.41', '客户名')}：
                    </Col>
                    <Col span={20}>
                        {this.state.customerName}
                    </Col>
                </Row>
                {_.map(this.state.customerContacts, (contact, contactIndex) => {
                    if (contact.isNew) {
                        return this.renderContactForm(contact);
                    } else {
                        return this.renderContact(contact, contactIndex);
                    }
                })}
                <div className="btn-block">
                    <Button onClick={this.setViewType.bind(this, VIEW_TYPE.CUSTOMER_LIST)}>{Intl.get('common.cancel', '取消')}</Button>
                    <Button type="primary" onClick={this.mergeToCustomer}>确认合并</Button>
                </div>
            </div>
        );
    }

    render() {
        return (
            <RightPanel
                className="clue_customer_rightpanel clue-to-customer-panel"
                showFlag={this.props.showFlag}
                data-tracename="线索转客户面板"
            >
                <span className="iconfont icon-close clue-right-btn" onClick={this.props.hidePanel} data-tracename="关闭线索转客户面板"></span>
                <div className="clue-detail-wrap">
                    <div className="panel-content">
                        {this.state.viewType === VIEW_TYPE.CUSTOMER_LIST ? this.renderCustomerList() : null}
                        {this.state.viewType === VIEW_TYPE.CUSTOMER_MERGE ? this.renderCustomerMerge() : null}
                    </div>
                </div>
            </RightPanel>
        );
    }
}

export default ClueToCustomerPanel;
