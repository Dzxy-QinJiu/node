/**
 * 线索转客户的操作面板
 */

//require('./style.less');
import { Row, Col } from 'antd';
import ajax from 'ant-ajax';
import { RightPanel } from 'CMP_DIR/rightPanel';
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
            })
            .fail(err => {
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
                    <Row>
                        <Col span={12}>
                            {Intl.get('crm.41', '客户名')}
                        </Col>
                        <Col span={12}>
                            {clue.name}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            {Intl.get('call.record.contacts', '联系人')}
                        </Col>
                        <Col span={12}>
                            {_.get(clue, 'contacts[0].name', '')}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            {Intl.get('common.phone', '电话')}
                        </Col>
                        <Col span={12}>
                            {_.get(clue, 'contacts[0].phone[0]', '')}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            {Intl.get('crm.6', '负责人')}
                        </Col>
                        <Col span={12}>
                            {clue.user_name}
                        </Col>
                    </Row>
                </div>
            </RightPanel>
        );
    }
}

export default ClueToCustomerPanel;
