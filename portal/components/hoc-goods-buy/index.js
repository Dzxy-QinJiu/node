/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/25.
 */
//购买商品界面高阶组件
/*
*  在反向继承方法中，高阶组件可以使用 WrappedComponent 引用，
   这意味着它可以使用 WrappedComponent 的state 、props。生命周期和render方法。
   但它不能保证完整的子组件树被解析。
* */
/*
*  使用方法：
*  HocGoodsBuy({
        leftTitle: Intl.get('personal.upgrade.to.official.version', '升级为正式版'),
        rightTitle: Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版'),
        i18nId: 'clues.extract.count.at.month',
        i18nMessage: '线索推荐每月可提取 {count} 条',
        dataTraceName: '升级个人正式版界面',
  })(OfficialPersonalEdition);
*  在包裹组件里需要写上这些基本的state
    constructor(props) {
        super(props);
        this.state = {
            ...this.getInitialState(),
            count: 4000,
            listHeight: 120,
        }
    }
* */


import './style.less';
import { Button, message, Popover } from 'antd';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import BasicPaymentMode from 'CMP_DIR/basic-payment-mode';
import OperateSuccessTip from 'CMP_DIR/operate-success-tip';
import PayAjax from 'MOD_DIR/common/public/ajax/pay';
import Trace from 'LIB_DIR/trace';

const LAYOUT_CONSTS = {
    TOP_HEIGHT: 70,
    DESC_HEIGHT: 72,
    BOTTOM_HEIGHT: 80
};


const HOCGoodsBuy = (options = {}) => {
    return WrappedComponent => {
        return class extends WrappedComponent {
            static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

            getInitialState() {
                return {
                    isGetGoodsLoading: false,//获取商品加载中
                    showPaymentMode: false,//是否展示支付页面
                    errMsg: '',//错误提示信息
                    list: [],//商品列表
                    last_id: '',
                    total: 0,
                    listenScrollBottom: false,
                    count: 0,
                    curOrderInfo: {},//下单后的信息
                    listHeight: 0,//滚动区域的高度
                    activeGoods: {},//当前选中的商品
                    payModeList: [],//支付渠道,如支付宝，微信
                    isShowCloseBtn: true,//是否显示关闭按钮
                };
            }

            //下拉加载
            handleScrollBarBottom = () => {
                var currListLength = _.isArray(this.state.list) ? this.state.list.length : 0;
                // 判断加载的条件
                if (currListLength < this.state.total && !this.state.isGetGoodsLoading) {
                    this.getGoodsList();
                }
            };

            // 重新获取商品
            retryGetGoodsList = () => {
                this.getPayModeAndGoodsList();
            };

            //下单
            handlePlaceOrder = () => {
                if(!this.state.payModeList.length) {
                    message.warning(Intl.get('payment.goods.no.payment.mod.tip', '您暂时不能购买该商品'));
                    return false;
                }
                if(this.state.isCreateOrdering) {
                    return false;
                }
                let saveObj = {
                    type: _.get(this.state.payModeList,'[0].type','alipay'),
                    ...this.dealSubmitGoodInfo()
                };
                Trace.traceEvent(ReactDOM.findDOMNode(this),'点击立即支付');
                this.setState({isCreateOrdering: true});
                PayAjax.goodsTrade(saveObj).then((res) => {
                    this.setState({
                        isCreateOrdering: false,
                        showPaymentMode: true,//显示付款界面
                        curOrderInfo: res
                    });
                }, (errMsg) => {
                    message.error(errMsg || Intl.get('payment.goods.create.faild', '下单失败'));
                    this.setState({
                        isCreateOrdering: false
                    });
                });
            };

            //点击切换商品
            handleClickGoodsItem = (good) => {
                Trace.traceEvent(ReactDOM.findDOMNode(this), '切换商品');
                this.setState({
                    activeGoods: good
                });
            };

            handlClickClose = () => {
                Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭商品界面');
                this.onClosePanel();
            };

            renderContent = () => {
                if(this.state.isGetGoodsLoading && !this.state.last_id) {
                    return <Spinner/>;
                }else if (this.state.errMsg) {
                    return (
                        <div className="errmsg-container">
                            <span className="errmsg-tip">{this.state.errMsg},</span>
                            <a className="retry-btn" data-tracename="点击重新获取线索量商品按钮" onClick={this.retryGetGoodsList}>
                                {Intl.get('user.info.retry', '请重试')}
                            </a>
                        </div>
                    );
                } else if(_.isEmpty(this.state.list)) {
                    return (
                        <NoDataIntro
                            noDataTip={Intl.get('clues.no.goods.data', '暂无商品')}
                        />
                    );
                }else {
                    const listHeight = this.state.listHeight || $(window).height() - LAYOUT_CONSTS.TOP_HEIGHT - LAYOUT_CONSTS.DESC_HEIGHT - LAYOUT_CONSTS.BOTTOM_HEIGHT;
                    return (
                        <div className="goods-container">
                            <div className="goods-desc">
                                <i className="iconfont icon-clue-recommend"/>
                                <span className="clue-extract-count-wrapper">
                                    <ReactIntl.FormattedMessage
                                        id={options.i18nId}
                                        defaultMessage={options.i18nMessage}
                                        values={{
                                            'count': <span className="clue-extract-count">{this.state.count}</span>
                                        }}
                                    />
                                </span>
                            </div>
                            <div style={{height: listHeight}}>
                                <GeminiScrollbar
                                    handleScrollBottom={this.handleScrollBarBottom}
                                    listenScrollBottom={this.state.listenScrollBottom}
                                >
                                    <div className="goods-content">
                                        {super.render()}
                                    </div>
                                </GeminiScrollbar>
                            </div>
                            {
                                this.state.isGetGoodsLoading ? null : (
                                    <div className="order-submit-btn">
                                        <Button disabled={this.state.isCreateOrdering} loading={this.state.isCreateOrdering} type="primary" size="large" onClick={this.handlePlaceOrder}>{Intl.get('goods.immediate.payment', '立即支付')}</Button>
                                    </div>
                                )
                            }
                        </div>
                    );
                }
            };

            render() {
                if(!this.state.showPaymentMode) {
                    let content = null;
                    let title = '';
                    if(this.state.isPaymentSuccess) {//支付成功
                        content = <OperateSuccessTip
                            showCountDown={this.state.showCountDown}
                            {...this.state.operateSuccessTipProps}
                        />;
                    }else {
                        title = (
                            <div className="hoc-goods-buy-title-wrapper" id="hoc-goods-buy-title-wrapper">
                                <span>{this.state.leftTitle || options.leftTitle}</span>
                                {
                                    options.rightTitle ? (
                                        <Popover
                                            placement="left"
                                            content={Intl.get('payment.please.contact.our.sale', '请联系我们的销售人员进行升级，联系方式：{contact}', {contact: '400-6978-520'})}
                                            trigger="hover"
                                            getPopupContainer={() => {
                                                return document.getElementById('hoc-goods-buy-title-wrapper');
                                            }}
                                        >
                                            <span
                                                className="hoc-goods-buy-title-btn"
                                                title={options.rightTitle}
                                                data-tracename={`点击${options.rightTitle}按钮`}
                                                onClick={this.handleUpgradeEnterprise}
                                            >{options.rightTitle}</span>
                                        </Popover>
                                    ) : null
                                }
                            </div>
                        );
                        content = this.renderContent();
                    }

                    return (
                        <RightPanelModal
                            className="hoc-goods-buy-wrapper"
                            isShowMadal={true}
                            isShowCloseBtn={this.state.isShowCloseBtn}
                            title={title}
                            onClosePanel={this.handlClickClose}
                            content={content}
                            dataTracename={options.dataTraceName}
                        />
                    );
                }else {
                    return <BasicPaymentMode
                        payModeList={this.state.payModeList}
                        curOrderInfo={this.state.curOrderInfo}
                        dealSubmitGoodInfo={this.dealSubmitGoodInfo}
                        onPaymentSuccess={this.onPaymentSuccess}
                        onClosePanel={this.onClosePanel}
                    />;
                }
            }
        };
    };
};

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

HOCGoodsBuy.LAYOUT_CONSTS = LAYOUT_CONSTS;

module.exports = HOCGoodsBuy;