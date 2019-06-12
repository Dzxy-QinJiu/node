/**
 * 线索转客户的操作面板
 */

require('../css/clue-to-customer-panel.less');
import { Row, Col, Button } from 'antd';
import ajax from 'ant-ajax';
import { RightPanel } from 'CMP_DIR/rightPanel';
import ModalDialog from 'CMP_DIR/ModalDialog';
import Spinner from 'CMP_DIR/spinner';
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
            //是否显示loading
            isLoadingShow: true,
            //是否显示合并到此客户对话框
            isMergeToCustomerDialogShow: false,
            //是否显示替换联系人名称对话框
            isReplaceContactNameDialogShow: false,
            //合并到客户的操作区块是否显示
            isMergeCustomerBlockShow: false,
            //已存在的客户们
            existingCustomers: [],
            //要合并到的客户
            toMergeCustomer: {},
            //合并后的客户
            mergedCustomer: {},
            //要操作的联系人的索引
            opContactIndex: -1,
            //要替换成的联系人名称
            replaceName: '',
            //要操作的电话的索引
            opPhoneIndex: -1,
            //要操作的电话
            opPhone: '',
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
                    isLoadingShow: false,
                    isMergeCustomerBlockShow: false,
                    existingCustomers: result.result
                });
            })
            .fail(err => {
            });
    }

    //合并到此客户按钮点击事件
    onMergeToCustomerClick = (customer) => {
        this.setState({
            toMergeCustomer: customer,
            isMergeToCustomerDialogShow: true
        });
    }

    //隐藏合并到此客户对话框
    hideMergeToCustomerDialog = () => {
        this.setState({
            isMergeToCustomerDialogShow: false
        });
    }

    //合并到此客户对话框确定按钮点击事件
    onMergeToCustomerDialogConfirm = () => {
        this.setState({
            isMergeToCustomerDialogShow: false,
            isMergeCustomerBlockShow: true,
        });

        this.setMergedCustomer();
    }

    //替换联系人名称按钮点击事件
    onReplaceContactNameClick = (contactIndex, replaceName) => {
        this.setState({
            isReplaceContactNameDialogShow: true,
            opContactIndex: contactIndex,
            replaceName
        });
    }

    //隐藏替换联系人名称对话框
    hideReplaceContactNameDialog = () => {
        this.setState({
            isReplaceContactNameDialogShow: false
        });
    }

    //替换联系人名称对话框确定按钮点击事件
    onReplaceContactNameDialogConfirm = () => {
        let mergedCustomer = _.cloneDeep(this.state.mergedCustomer);

        _.set(mergedCustomer, 'contacts[' + this.state.opContactIndex + '].name', this.state.replaceName);

        this.setState({
            mergedCustomer,
            isReplaceContactNameDialogShow: false,
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

    //删除电话按钮点击事件
    onDeletePhoneClick = (contactIndex, phoneIndex, phone) => {
        this.setState({
            isDeletePhoneDialogShow: true,
            opContactIndex: contactIndex,
            opPhoneIndex: phoneIndex,
            opPhone: phone
        });
    }

    //隐藏删除电话对话框
    hideDeletePhoneDialog = () => {
        this.setState({
            isDeletePhoneDialogShow: false
        });
    }

    //删除电话对话框确定按钮点击事件
    onDeletePhoneDialogConfirm = () => {
        let mergedCustomer = _.cloneDeep(this.state.mergedCustomer);

        mergedCustomer.contacts[this.state.opContactIndex].phone.splice(this.state.opPhoneIndex, 1);

        this.setState({
            mergedCustomer,
            isDeletePhoneDialogShow: false,
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
                {_.map(customer.contacts, (contact, contactIndex) => {
                    return (
                        <div className="exist-customer">
                            <Row>
                                <Col span={4}>
                                    {Intl.get('call.record.contacts', '联系人')}：
                                </Col>
                                <Col span={20}>
                                    {contact.name}
                                    {contact.replaceName ? (
                                        <span
                                            className="is-replace-contract-name clickable"
                                            onClick={this.onReplaceContactNameClick.bind(this, contactIndex, contact.replaceName)}
                                        >
                                            是否替换为“{contact.replaceName}”
                                        </span>
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
                                                {contact.isDup ? (
                                                    <span className="btn-delete clickable" onClick={this.onDeletePhoneClick.bind(this, contactIndex, phoneIndex, phone)}
                                                    >删除</span>
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

    //渲染添加取消按钮区域
    renderAddCancelBtnBlock() {
        return (
            <div className="btn-block">
                <Button onClick={this.hideMergeCustomerBlock}>{Intl.get('common.cancel', '取消')}</Button>
                <Button type="primary">{Intl.get('common.sure', '确定')}</Button>
            </div>
        );
    }

    //渲染是否合并到此客户对话框
    renderMergeToCustomerDialog() {
        return (
            <ModalDialog
                modalContent={`合并到客户${this.state.toMergeCustomer.name}?`}
                modalShow={this.state.isMergeToCustomerDialogShow}
                container={this}
                hideModalDialog={this.hideMergeToCustomerDialog}
                delete={this.onMergeToCustomerDialogConfirm}
            />
        );
    }

    //渲染是否替换联系人名称对话框
    renderReplaceContactNameDialog() {
        return (
            <ModalDialog
                modalContent={`是否将联系人名称替换为"${this.state.replaceName}"?`}
                modalShow={this.state.isReplaceContactNameDialogShow}
                container={this}
                hideModalDialog={this.hideReplaceContactNameDialog}
                delete={this.onReplaceContactNameDialogConfirm}
            />
        );
    }

    //渲染是否删除电话对话框
    renderDeletePhoneDialog() {
        return (
            <ModalDialog
                modalContent={`是否删除电话"${this.state.opPhone}"?`}
                modalShow={this.state.isDeletePhoneDialogShow}
                container={this}
                hideModalDialog={this.hideDeletePhoneDialog}
                delete={this.onDeletePhoneDialogConfirm}
            />
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
                    {this.state.isLoadingShow ? (
                        <Spinner /> 
                    ) : (
                        <div className="panel-content">
                            {this.renderBasicInfoBlock()}
                            {this.state.existingCustomers.length && !this.state.isMergeCustomerBlockShow ? this.renderExistsCustomerBlock() : null}
                            {this.state.isMergeCustomerBlockShow ? this.renderMergeCustomerBlock() : null}
                            {!this.state.existingCustomers.length && !this.state.isMergeCustomerBlockShow ? this.renderAddCancelBtnBlock() : null}
                        </div>
                    )}
                </div>

                {this.renderMergeToCustomerDialog()}
                {this.renderReplaceContactNameDialog()}
                {this.renderDeletePhoneDialog()}
            </RightPanel>
        );
    }
}

export default ClueToCustomerPanel;
