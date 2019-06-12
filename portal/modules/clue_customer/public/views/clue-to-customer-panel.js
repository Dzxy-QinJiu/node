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
        //面板是否显示
        showFlag: false,
        //关闭面板按钮点击事件
        hidePanel: noop,
        //当前线索
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
            //已存在的客户们
            existingCustomers: [],
            //要合并到的客户
            toMergeCustomer: {},
            //合并后的客户
            mergedCustomer: {},
            //是否显示“合并询问对话框”
            isMergeModalShow: false,
            //合并到客户的操作区块是否显示
            isMergeCustomerBlockShow: false,
        };
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        //console.log(this.props.clue.id , nextProps.clue.id)
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
                    isMergeCustomerBlockShow: false,
                    existingCustomers: result.result
                });
            })
            .fail(err => {
            });
    }

    onMergeToCustomerClick = (customer) => {
        this.setState({
            toMergeCustomer: customer,
            isMergeModalShow: true
        });
    }

    hideModalDialog = () => {
        this.setState({
            isMergeModalShow: false
        });
    }

    onModalDialogConfirm = () => {
        this.setState({
            isMergeModalShow: false,
            isMergeCustomerBlockShow: true,
        });

        this.setMergedCustomer();
    }

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
                    //将该客户联系人标记为重复联系人
                    customerContact.isDup = true;
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
        const noneDupClueContacts = _.filter(clue.contacts, clueContact => !clueContact.isDup);

        //将这些不重复的联系人合并到客户联系人
        mergedCustomer.contacts = _.concat(mergedCustomer.contacts, noneDupClueContacts);

        this.setState({mergedCustomer});
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

                {_.map(this.state.existingCustomers, (customer, index) => {
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
                    <Button onClick={this.hideMergeCustomerBlock}>{Intl.get('common.cancel', '取消')}</Button>
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
                        modalContent={`合并到客户${this.state.toMergeCustomer.name}?`}
                        modalShow={this.state.isMergeModalShow}
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
