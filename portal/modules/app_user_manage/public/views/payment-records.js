require('../css/user-login-analysis.less');
import ajax from 'ant-ajax';
import CardContainer from 'CMP_DIR/card-container'; // 容器
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import DetailCard from 'CMP_DIR/detail-card';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import { Alert, message } from 'antd';
import classNames from 'classnames';
import userManagePrivilege from '../privilege-const';

class PaymentRecords extends React.Component {
    state = {
        paymentRecordList: []
    };

    componentDidMount() {
        //获取付费记录
        this.getPaymentRecordList();
    }

    getPaymentRecordList = () => {
        ajax.send({
            url: '/rest/base/v1/realm/pay/tradeorders',
            query: {user_id: this.props.userId, page_size: 1000}
        })
            .done(result => {
                this.setState({ paymentRecordList: result.list });
            })
            .fail(err => {
                message.error(err);
            });
    };

    render() {
        return (
            <StatusWrapper>
                <div className="payment-records-panel" style={{ height: this.props.height }}>
                    <GeminiScrollbar>
                        {_.isEmpty(this.state.paymentRecordList) ? (
                            <div className="alert-container">
                                <Alert
                                    message={Intl.get('common.no.data', '暂无数据')}
                                    type="info"
                                    showIcon={true}
                                />
                            </div>
                        ) : (
                            <div>
                                {_.map(this.state.paymentRecordList, (item, index) => (
                                    <DetailCard
                                        className=""
                                        key={index}
                                        titleBottomBorderNone={false}
                                        title={item.goods.name}
                                        content={this.renderCardContent(item)}
                                        isShowToggleBtn={true}
                                        isExpandDetail={true}
                                        isMutipleCard={true}
                                    />
                                ))}
                            </div>
                        )}
                    </GeminiScrollbar>
                </div>
            </StatusWrapper>
        );
    }

    renderCardContent(record) {
        const platform = _.find(record.pay_response, item => item.type === record.pay_type);
        const platformOrderId = _.get(platform, 'order_id', '');

        return (
            <div className="field-list">
                <div className="field-item">
                    付款时间：{record.finish_time}
                </div>
                <div className="field-item">
                    付款金额：{record.total_fee}
                </div>
                <div className="field-item">
                    订单编号：{record.trade_no}
                </div>
                <div className="field-item">
                    支付平台：{record.pay_type}
                </div>
                <div className="field-item">
                    平台订单号：{platformOrderId}
                </div>
            </div>
        );
    }
}

export default PaymentRecords;
