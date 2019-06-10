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
            isModalDialogShow: false
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

    onMergeToCustomerClick = () => {
        this.setState({
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
            isModalDialogShow: false
        });
    }

    render() {
        const clue = this.props.clue;

        return (
            <RightPanel
                className="clue_customer_rightpanel clue-to-customer-panel"
                showFlag={this.props.showFlag}
                data-tracename="线索转客户面板"
            >
                <span className="iconfont icon-close clue-right-btn" onClick={this.props.hidePanel} data-tracename="关闭线索转客户面板"></span>
                <div className="clue-detail-wrap">
                    <div className="panel-content">
                        <Row>
                            <Col span={4}>
                                {Intl.get('crm.41', '客户名')}：
                            </Col>
                            <Col span={4}>
                                {clue.name}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={4}>
                                {Intl.get('call.record.contacts', '联系人')}：
                            </Col>
                            <Col span={4}>
                                {_.get(clue, 'contacts[0].name', '')}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={4}>
                                {Intl.get('common.phone', '电话')}：
                            </Col>
                            <Col span={4}>
                                {_.get(clue, 'contacts[0].phone[0]', '')}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={4}>
                                {Intl.get('crm.6', '负责人')}：
                            </Col>
                            <Col span={12}>
                                {clue.user_name}
                            </Col>
                        </Row>

                        <div className="existing-customer">
                            <b className="title">已存在客户</b>

                            {_.map(this.state.customers, (customer, index) => {
                                return (
                                    <Row>
                                        <Col span={12}>
                                            {customer.name}
                                        </Col>
                                        <Col span={12}>
                                            <span
                                                className="clickable"
                                                onClick={this.onMergeToCustomerClick}
                                            >
                                                是否合并到此客户?
                                            </span>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </div>

                        <Row>
                            <Col span={4}>
                                <Button type="primary">添加</Button>
                            </Col>
                            <Col span={12}>
                                <Button>取消</Button>
                            </Col>
                        </Row>
                    </div>

                    <ModalDialog
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
