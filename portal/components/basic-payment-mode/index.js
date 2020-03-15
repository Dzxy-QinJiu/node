/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/22.
 */
// 基础版的支付方式（微信支付和支付宝支付）
import './style.less';
import { message, Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import classNames from 'classnames';
import Spinner from 'CMP_DIR/spinner';
import CountDown from 'CMP_DIR/countdown';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import PayAjax from 'MOD_DIR/common/public/ajax/pay';
import QrCode from 'qrcode.react';
import Trace from 'LIB_DIR/trace';

const QUERY_STATUS_TIME = 3000;

const PAY_STATUS = {
    UNPAID: 'unpaid',//待支付
    TIMEOUT: 'timeout',//订单超时
};

class BasicPaymentMode extends React.Component {
    constructor(props) {
        super(props);

        this.generatePayMode(props.payModeList);

        this.state = {
            curOrderInfo: this.generateOrder(props.curOrderInfo),
            payMode: props.curOrderInfo.type,
            qrCodeUrlLoading: false,//获取二维码地址加载状态
            qrCodeErrMsg: '',//获取二维码失败提示信息
            payStatus: PAY_STATUS.UNPAID,//订单支付状态，1：已付款，-1：订单超时
        };
    }

    queryStatusTimer = null;

    //支付方式
    PAY_MODE = [];

    componentDidMount() {
        //查询订单状态
        if(this.props.payModeList.length > 0) {
            this.queryOrderStatus();
        }
    }

    componentWillUnmount() {
        //需清除定时查询订单状态的定时器，以防出现问题
        this.queryStatusTimer && clearInterval(this.queryStatusTimer);
        this.queryStatusTimer = null;
        this.PAY_MODE = [];
    }

    generatePayMode(payModeList) {
        _.each(payModeList, mode => {
            this.PAY_MODE.push(mode.type);
        });
    }

    generateOrder(orderInfo) {
        let curOrderInfo = {
            ...orderInfo
        };
        curOrderInfo[`${orderInfo.type}_qrUrl`] = _.get(orderInfo,'code_url','');
        return curOrderInfo;
    }

    //查询订单支付状态
    queryOrderStatus() {
        if(this.queryStatusTimer) clearInterval(this.queryStatusTimer);
        this.queryStatusTimer = setInterval(() => {
            PayAjax.getOrderStatus({
                id: this.state.curOrderInfo.order_id,
                type: this.state.payMode
            }).then((status) => {
                // 返回状态值：（0：待付款，1：付款成功，-1：超时关闭）
                // 0：待付款（不用管）
                // -1：超时关闭（后台关闭订单，需重新生成订单）
                let curOrderInfo = this.state.curOrderInfo;
                if(_.toString(status) === '1') {//付款成功
                    clearInterval(this.queryStatusTimer);
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)), `商品：${curOrderInfo.goods_name} * ${curOrderInfo.goods_num}, 使用${this.state.payMode}支付成功, 订单号：${curOrderInfo.order_id}`);
                    _.isFunction(this.props.onPaymentSuccess) && this.props.onPaymentSuccess(this.state.curOrderInfo);
                }else if(_.toString(status) === '-1') {//超时关闭
                    clearInterval(this.queryStatusTimer);
                    this.handleOrderTimeout();
                }
            });
        }, QUERY_STATUS_TIME);
    }

    //选择支付方式
    handleChangePayMode = (key) => {
        if(key === this.state.payMode) return false;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '切换为' + key + '支付方式');
        let curOrderInfo = this.state.curOrderInfo;
        clearInterval(this.queryStatusTimer);
        this.setState({
            payMode: key
        }, () => {
            //判断是否是超时状态
            if(this.state.payStatus === PAY_STATUS.TIMEOUT) {
                return false;
            }
            // 判断二维码地址是否已经有值了，有了直接查询订单状态
            if(curOrderInfo[`${key}_qrUrl`]) {
                this.queryOrderStatus();
            } else{
                this.getOrderInfo();
            }
        });
    };

    //获取订单信息
    getOrderInfo() {
        let savObj = {
            type: this.state.payMode,
            order_id: this.state.curOrderInfo.order_id,
        };
        this.setState({
            qrCodeUrlLoading: true,
            qrCodeErrMsg: ''
        });
        PayAjax.goodsTrade(savObj).then((res) => {
            this.setState({
                qrCodeUrlLoading: false,
                curOrderInfo: this.generateOrder({
                    ...this.state.curOrderInfo,
                    ...res
                })
            }, () => {
                this.queryOrderStatus();
            });
        }, () => {
            this.setState({
                qrCodeUrlLoading: false,
                qrCodeErrMsg: (
                    <ReactIntl.FormattedMessage
                        id="payment.get.qrcode.faild"
                        defaultMessage="获取失败，请{retry}"
                        values={{
                            retry: <a className="retry-btn" data-tracename="点击重新获取支付二维码按钮" onClick={this.retryGetQrCode}>{Intl.get('common.refresh', '刷新')}</a>
                        }}
                    />
                )
            });
        });
    }

    //重新获取二维码
    retryGetQrCode = () => {
        this.getOrderInfo();
    };

    //重新生成订单
    againCreateOrder = () => {
        let saveObj = {
            type: this.state.payMode,
            ...this.props.dealSubmitGoodInfo()
        };
        this.setState({qrCodeUrlLoading: true, qrCodeErrMsg: ''});
        PayAjax.goodsTrade(saveObj).then((res) => {
            this.setState({
                qrCodeUrlLoading: false,
                curOrderInfo: this.generateOrder(res),
                payStatus: PAY_STATUS.UNPAID
            }, () => {
                this.queryOrderStatus();//查询订单状态
                this.countDownRef.resetTime();//需要重新开始倒计时
            });
        }, () => {
            this.setState({
                qrCodeUrlLoading: false,
                qrCodeErrMsg: (
                    <ReactIntl.FormattedMessage
                        id="payment.again.create.order.faild"
                        defaultMessage={'生成订单失败，{retry}'}
                        values={{
                            'retry': <a className="retry-btn" data-tracename="点击重新生成订单按钮" onClick={this.againCreateOrder}><br/>{Intl.get('payment.again.create.order', '重新生成')}</a>
                        }}
                    />
                )
            });
        });
    };

    //订单超时处理
    handleOrderTimeout = () => {
        let curOrderInfo = this.state.curOrderInfo;
        Trace.traceEvent($(ReactDOM.findDOMNode(this)), `商品：${curOrderInfo.goods_name} * ${curOrderInfo.goods_num}, 此订单已超时，订单号：${curOrderInfo.order_id}`);
        this.setState({
            payStatus: PAY_STATUS.TIMEOUT,
            qrCodeErrMsg: (
                <ReactIntl.FormattedMessage
                    id="payment.order.timeout"
                    defaultMessage={'订单超时，{retry}'}
                    values={{
                        'retry': <a className="retry-btn" data-tracename="点击重新生成订单按钮" onClick={this.againCreateOrder}>{Intl.get('payment.again.create.order', '重新生成')}</a>
                    }}
                />
            )
        });
    };

    handleClickClose = (e) => {
        Trace.traceEvent(e, '关闭订单支付界面');
        this.props.onClosePanel();
    };

    renderPayContent() {
        let payMode = this.state.payMode;
        if(_.includes(this.PAY_MODE, payMode)) {//是支付宝和微信支付方式
            //在切换支付方式时，如果获取支付方式二维码失败，需要给一个占位符，url不能为空
            let url = _.get(this.state.curOrderInfo, `${payMode}_qrUrl`, 'no_code_url');
            return <QrCode size={96} value={url}/>;
        }else {
            return null;
        }
    }

    renderLoadingAndErrMsgBlock() {
        if(this.state.qrCodeUrlLoading) {
            return (
                <div className='qrcode-loading'>
                    <Spinner/>
                </div>
            );
        }else if(this.state.qrCodeErrMsg) {
            return (
                <div className="qrcode-errmsg-tip">
                    <div className="qrcode-errmsg-tip-content">
                        <div><i className="iconfont icon-tips"/></div>
                        {this.state.qrCodeErrMsg}
                    </div>
                </div>
            );
        }else {
            return null;
        }
    }

    //渲染倒计时
    renderCountDownBlock = (time) => {
        let second = parseInt(time % 60); //秒
        let minute = parseInt(time / 60); //分
        return (
            <div className="count-down-content">
                <i className="iconfont icon-alarm-clock"/>：
                <span className="count-down-time">{minute}</span>{Intl.get('user.time.minute', '分')}
                <span className="count-down-time">{second}</span>{Intl.get('user.time.second', '秒')}
            </div>
        );
    };

    renderContent() {
        const qrCls = classNames('basic-payment-qrcode-container',{
            'second-payment-mode': this.props.payModeList.length <= 2
        });
        const curOrderInfo = this.state.curOrderInfo;
        let timeExpire = _.get(curOrderInfo,'time_expire', 0) * 60;
        return (
            <div className="basic-payment-mode-container">
                <div className="order-info-container">
                    <div className="order-info-content">
                        <div className="order-info-item">
                            <span className="order-info-title">{Intl.get('payment.goods.trade.name', '交易商品')}：</span>
                            <span className="order-info-item--content">{curOrderInfo.goods_name} * {curOrderInfo.goods_num}</span>
                        </div>
                        <div className="order-info-item">
                            <span className="order-info-title">{Intl.get('payment.goods.trade.amount', '交易金额')}：</span>
                            <span className="order-info-item--content">{curOrderInfo.total_fee}{Intl.get('contract.82', '元')}</span>
                        </div>
                        <div className="order-info-item">
                            <span className="order-info-title">{Intl.get('payment.goods.trade.time', '下单时间')}：</span>
                            <span className="order-info-item--content">{moment(curOrderInfo.time_stamp).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                        </div>
                        {timeExpire > 0 ? (
                            <div className="order-info-item">
                                <CountDown
                                    ref={(ref => this.countDownRef = ref)}
                                    seconds={timeExpire}
                                    renderContent={this.renderCountDownBlock}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className={qrCls}>
                    <Tabs defaultActiveKey={this.state.payMode} onChange={this.handleChangePayMode}>
                        {
                            this.props.payModeList.map(mode => {
                                return (
                                    <TabPane tab={mode.name} disabled={this.state.qrCodeUrlLoading} key={mode.type}>
                                        <div className="basic-payment-qrcode-wrapper">
                                            <div className="basic-payment-qrcode-content">
                                                <div className="basic-payment-qrcode-box" id="basic-payment-qrcode-box">
                                                    {this.state.payMode === mode.type && !this.state.qrCodeUrlLoading ? this.renderPayContent() : null}
                                                </div>
                                                {this.renderLoadingAndErrMsgBlock()}
                                            </div>
                                            <div className="basic-payment-price">￥<span className="basic-payment-num">{curOrderInfo.total_fee}</span></div>
                                        </div>
                                    </TabPane>
                                );
                            })
                        }
                    </Tabs>

                </div>
            </div>
        );
    }

    render() {
        const title = Intl.get('payment.goods.number', '订单号：{orderNumber}', {orderNumber: _.get(this.state.curOrderInfo, 'order_id', '')});
        return (
            <RightPanelModal
                className="payment-mode-wrapper"
                isShowMadal={this.props.isShowModal}
                isShowCloseBtn={this.props.isShowCloseBtn}
                onClosePanel={this.handleClickClose}
                title={title}
                content={this.renderContent()}
                dataTracename="订单支付"
            />
        );
    }
}
BasicPaymentMode.defaultProps = {
    payModeList: [
        /*{
            name: '支付宝',
            type: 'alipay'
        }*/
    ],//支付渠道，【支付宝，微信，...】
    curOrderInfo: {},//当前订单信息
    isShowCloseBtn: true,//是否显示关闭按钮
    isShowModal: true,
    onPaymentSuccess: function() {},
    dealSubmitGoodInfo: function() {},
    onClosePanel: function() {},
};
BasicPaymentMode.propTypes = {
    payModeList: PropTypes.array,
    curOrderInfo: PropTypes.object,
    isShowCloseBtn: PropTypes.bool,
    isShowModal: PropTypes.bool,
    onPaymentSuccess: PropTypes.func,
    dealSubmitGoodInfo: PropTypes.func,
    onClosePanel: PropTypes.func,
};
module.exports = BasicPaymentMode;