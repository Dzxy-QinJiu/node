import ajax from 'ant-ajax';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import DetailCard from 'CMP_DIR/detail-card';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import { Alert, message } from 'antd';

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
                                        key={index}
                                        title={item.goods.name}
                                        content={this.renderCardContent(item)}
                                        isShowToggleBtn={true}
                                        isExpandDetail={true}
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
        return (
            <div className="field-list">
                <div className="field-item">
                    <span className="field-label">{Intl.get('payment.time.of.payment', '付款时间')}：</span>{moment(record.finish_time).format(oplateConsts.DATE_TIME_FORMAT)}
                </div>
                <div className="field-item">
                    <span className="field-label">{Intl.get('payment.amount', '付款金额')}：</span>{record.total_fee} {Intl.get('contract.82', '元')}
                </div>
                <div className="field-item">
                    <span className="field-label">{Intl.get('crm.order.id', '订单编号')}：</span>{record.id}
                </div>
                <div className="field-item">
                    <span className="field-label">{Intl.get('payment.platform', '支付平台')}：</span>{this.renderPayType(record.pay_type)}
                </div>
                <div className="field-item">
                    <span className="field-label">{Intl.get('payment.platform.order.no', '平台订单号')}：</span>{record.trade_no}
                </div>
            </div>
        );
    }

    renderPayType(type) {
        if (type === 'alipay') {
            type = Intl.get('user.trade.payment.alipay','支付宝');
        } else if (type === 'wxpay') {
            type = Intl.get('crm.58', '微信');
        }

        return type;
    }
}

export default PaymentRecords;
