/**
 * 线索转客户的操作面板
 */

require('../css/clue-to-customer-panel.less');
import { Row, Col, Button } from 'antd';
import ajax from 'ant-ajax';
import { RightPanel } from 'CMP_DIR/rightPanel';
import ModalDialog from 'CMP_DIR/ModalDialog';
import { AUTHS } from 'MOD_DIR/crm/public/utils/crm-util';
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
const authType = hasPrivilege(AUTHS.GETALL) ? 'manager' : 'user';
const noop = function() {};

class ClueToCustomerPanel extends React.Component {
    static defaultProps = {
        showFlag: false,
        hidePanel: noop,
        clue: {}
    };

    static propTypes = {
        showFlag: PropTypes.bool,
        hidePanel: PropTypes.func,
        clue: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            customers: [],
            currentCustomer: {},
            isModalDialogShow: false,
            isMergeCustomerBlockShow: false,
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.clue.id !== nextProps.clue.id) {
            this.getCustomer(nextProps);
        }
    }

    //获取客户信息
    getCustomer(props) {
        const customerName = props.clue.name;

        ajax.send({
            url: `/rest/customer/v3/customer/range/${authType}/20/1/start_time/descend`,
            type: 'post',
            data: {
                query: {
                    name: customerName
                }
            }
        })
            .done(result => {
                this.setState({
                    customers: result.result
                });
            })
            .fail(err => {
            });
    }

    onMergeToCustomerClick = (customer) => {
        this.setState({
            currentCustomer: customer,
            isModalDialogShow: true
        });
    }

    hideModalDialog = () => {
        this.setState({
            isModalDialogShow: false
        });
    }

    onModalDialogConfirm = () => {
        this.setState({
            isModalDialogShow: false,
            isMergeCustomerBlockShow: true,
        });
    }

    hideMergeCustomerBlock = () => {
        this.setState({
            isMergeCustomerBlockShow: false,
        });
    }

    //渲染基本信息区块
    renderBasicInfoBlock() {
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
    renderExistsCustomerBlock() {
        return (
            <div className="exists-customer-block">
                <div className="title">
                    <b>已存在客户</b>
                </div>

                {_.map(this.state.customers, (customer, index) => {
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
                                    是否合并到此客户?
                                </span>
                            </Col>
                        </Row>
                    );
                })}
            </div>
        );
    }

    //渲染合并客户区块
    renderMergeCustomerBlock() {
        //当前线索
        const clue = this.props.clue;

        //没有当前线索时直接返回
        if (_.isEmpty(clue)) return;

        //要合并到的客户
        const customer = _.cloneDeep(this.state.currentCustomer);

        //所有联系人
        const allContacts = _.concat(customer.contacts, clue.contacts);
        //不重复的联系人
        const uniqContacts = _.uniqBy(allContacts, 'name');
        //重复的联系人
        const dupContacts = _.differenceBy(allContacts, uniqContacts);

        //如果没有重复的联系人
        if (_.isEmpty(dupContacts)) {
            //所有客户联系人电话
            const allCustomerContactPhone = _.map(customer.contacts, 'phone');
            //所有线索联系人电话
            const allClueContactPhone = _.map(clue.contacts, 'phone');
            //所有电话
            let allPhone = _.concat(allCustomerContactPhone, allClueContactPhone);
            //将二维数组展平
            allPhone = _.flatten(allPhone);
            //不重复的电话
            const uniqPhone = _.uniq(allPhone);
            //重复的电话
            const dupPhone = _.differenceBy(allPhone, uniqPhone);


            //如果没有重复的电话
            if (_.isEmpty(dupPhone)) {
                //将所有联系人设为客户联系人
                customer.contacts = allContacts;
            } else {
                _.each(dupPhone, phone => {
                    //客户联系人
                    let customerContact = _.find(customer.contacts, item => _.includes(item.phone, phone));
                    //线索联系人
                    const clueContact = _.find(clue.contacts, item => _.includes(item.phone, phone));

                    //如果有重复电话的客户联系人和线索联系人的名字不相同
                    if (customerContact.name !== clueContact.name) {
                        //将线索联系人的名字设置为客户联系人的替换名字
                        customerContact.replaceName = clueContact.name;
                    }
                });
            }
        } else {
            //将和客户联系人重复的线索联系人的电话合并到客户联系人
            //并将该客户联系人标记为重复联系人
            _.each(dupContacts, contact => {
                //客户联系人
                let customerContact = _.find(customer.contacts, item => item.name === contact.name);
                //线索联系人
                const clueContact = _.find(clue.contacts, item => item.name === contact.name);
                //将线索联系人的电话合并到客户联系人
                customerContact.phone = _.concat(customerContact.phone, clueContact.phone);
                //对合并后的电话去重
                customerContact.phone = _.uniq(customerContact.phone);
                //标记为重复联系人
                customerContact.isDup = true;
            });
        }

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
                {_.map(customer.contacts, contact => {
                    return (
                        <div className="exist-customer">
                            <Row>
                                <Col span={4}>
                                    {Intl.get('call.record.contacts', '联系人')}：
                                    {contact.replaceName ? (
                                        <span>是否替换为{contact.replaceName}</span>
                                    ) : null}
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
                                        return (
                                            <div>
                                                {phone}
                                                {contact.isDup ? (
                                                    <span>删除</span>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </Col>
                            </Row>
                        </div>
                    );
                })}
                <div className="btn-block">
                    <Button>{Intl.get('common.cancel', '取消')}</Button>
                    <Button type="primary">{Intl.get('common.sure', '确定')}</Button>
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
                        {this.renderBasicInfoBlock()}
                        {this.state.isMergeCustomerBlockShow ? this.renderMergeCustomerBlock() : this.renderExistsCustomerBlock()}
                    </div>

                    <ModalDialog
                        modalContent={`合并到客户${this.state.currentCustomer.name}?`}
                        modalShow={this.state.isModalDialogShow}
                        container={this}
                        hideModalDialog={this.hideModalDialog}
                        delete={this.onModalDialogConfirm}
                    />
                </div>
            </RightPanel>
        );
    }
}

export default ClueToCustomerPanel;
