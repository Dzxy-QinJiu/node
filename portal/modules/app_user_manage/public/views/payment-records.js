import ajax from 'ant-ajax';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import DetailCard from 'CMP_DIR/detail-card';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import { Alert, message } from 'antd';

class PaymentRecords extends React.Component {
    state = {
        loading: true,
        paymentRecordList: [],
        total: 0
    };

    componentDidMount() {
        //获取付费记录
        this.getPaymentRecordList();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.userId !== nextProps.userId) {
            this.getPaymentRecordList(nextProps);
        }
    }

    getPaymentRecordList = (props = this.props) => {
        this.setState({ loading: true });

        ajax.send({
            url: '/rest/base/v1/realm/pay/tradeorders',
            query: {user_id: props.userId, page_size: 1000}
        })
            .done(result => {
                const paymentRecordList = _.map(result.list, (item, index) => {
                    item.isExpand = index === 0;
                    return item;
                });

                this.setState({ loading: false, paymentRecordList, total: result.total });
            })
            .fail(err => {
                message.error(err);
            });
    };

    render() {
        return (
            <StatusWrapper
                loading={this.state.loading}
            >
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
                                <div className="total">
                                    {Intl.get('crm.14', '共{count}条记录', {count: this.state.total})}
                                </div>
                                {_.map(this.state.paymentRecordList, (item, index) => (
                                    <DetailCard
                                        key={index}
                                        title={item.goods.name}
                                        content={this.renderCardContent(item)}
                                        isShowToggleBtn={true}
                                        isExpandDetail={item.isExpand}
                                        handleToggleDetail={(isExpand) => {
                                            let paymentRecordList = _.cloneDeep(this.state.paymentRecordList);
                                            paymentRecordList[index].isExpand = isExpand;
                                            this.setState({ paymentRecordList });
                                        }}
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

                {record.isExpand ? (
                    <div>
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
                ) : null}
            </div>
        );
    }

    renderPayType(type) {
        if (type === 'alipay') {
            type = <span><i className="iconfont icon-alipay" />{Intl.get('user.trade.payment.alipay','支付宝')}</span>;
        } else if (type === 'wxpay') {
            type = <span><i className="iconfont icon-wxpay" />{Intl.get('crm.58', '微信')}</span>;
        }

        return type;
    }
}

export default PaymentRecords;
