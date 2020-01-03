/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/25.
 */
//购买线索量界面
import './style.less';
import { Col, Row, InputNumber } from 'antd';
import classNames from 'classnames';
import HocGoodsBuy from 'CMP_DIR/hoc-goods-buy';
import PayAjax from 'MOD_DIR/common/public/ajax/pay';
import history from 'PUB_DIR/sources/history';
import { paymentEmitter } from 'OPLATE_EMITTER';

const CLUE_GOODS_LIST_MAP = [1,2,5];
const AUTO_SETTING_KEY = 'autoSetting';
const CLUE_GOODS_TYPE = 'clue';

class PurchaseLeads extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            ...this.getInitialState(),
            listHeight: 120,
            inputNumber: 1,//输入的线索量份数
            showCountDown: true,
        };
    }

    componentDidMount() {
        this.getPayModeAndGoodsList();
    }

    //获取支付渠道和商品列表
    getPayModeAndGoodsList() {
        this.setState({
            isGetGoodsLoading: true,
            errMsg: ''
        });
        let promiseList = [];
        if(!this.state.payModeList.length) {
            promiseList.push(PayAjax.getPaymentMode());
        }
        promiseList.push(this.getGoodsList(true));

        Promise.all(promiseList).then((result) => {
            if(!this.state.payModeList.length) {
                this.setState({payModeList: result[0]});
                this.dealGoodsList(result[1]);
            }else {
                this.dealGoodsList(result[0]);
            }

        }).catch((errMsg) => {
            this.setState({
                isGetGoodsLoading: false,
                errMsg
            });
        });
    }

    //获取线索量商品
    getGoodsList(isPromiseAll) {
        let queryObj = {
            type: CLUE_GOODS_TYPE,
            page_size: 20,
        };
        if (this.state.last_id) {
            queryObj.sort_id = this.state.last_id;
        }
        if(isPromiseAll) {
            return PayAjax.getGoodsList(queryObj);
        }else {
            PayAjax.getGoodsList(queryObj).then((result) => {
                this.dealGoodsList(result);
            }, (errMsg) => {
                this.setState({
                    isGetGoodsLoading: false,
                    errMsg: errMsg
                });
            });
        }
    }

    dealGoodsList(result) {
        let newState = {
            isGetGoodsLoading: false,
            errMsg: ''
        };
        let list = _.isArray(result.list) ? result.list : [];
        if(list.length) {
            //构建线索量的商品,1份，2份，5份。。。
            let originalList = list[0];
            newState.list = _.map(CLUE_GOODS_LIST_MAP, item => {
                return {
                    num: item,
                    id: originalList.id,
                    type: originalList.type,
                    clue_number: _.get(originalList,'number', 0) * item,
                };
            });
            newState.activeGoods = newState.list[0];
            newState.count = _.get(originalList,'number', 0);
        }
        this.setState(newState);
    }

    onClosePanel =() => {
        this.props.onClosePanel && this.props.onClosePanel();
    };

    handleUpgradeEnterprise = () => {
        console.log('点击升级企业版');
    };

    onLeadsCountChange = (value) => {
        value = _.trim(value,'-') || 1;
        value = value < 0 ? 1 : value;
        value = parseInt(value > 100 ? 100 : value);
        this.setState({
            inputNumber: value
        });
    };

    //处理提交的商品信息
    dealSubmitGoodInfo = () => {
        let activeGood = this.state.activeGoods;
        let good = {};
        //判断是否是自己手动输入的份数
        if(_.has(activeGood,'key') && _.isEqual(activeGood.key, AUTO_SETTING_KEY)) {
            good = {
                goods_id: activeGood.id,
                num: parseInt(this.state.inputNumber)
            };
        }else {
            good = {
                goods_id: activeGood.id,
                num: parseInt(activeGood.num)
            };
        }
        return good;
    };

    //支付成功回调
    onPaymentSuccess = (orderInfo) => {
        let _this = this;
        let operateSuccessTipProps = {
            title: Intl.get('payment.success', '支付成功'),
            tip: (
                <ReactIntl.FormattedMessage
                    id="payment.add.clue.extracted.number"
                    defaultMessage={'您已成功增加{count}条线索提取量'}
                    values={{
                        'count': <span className="operate-success-tip-tag">{_.get(orderInfo, 'goods_num', 1) * this.state.count}</span>
                    }}
                />
            ),
            continueText: Intl.get('clue.extract.clue', '提取线索'),
            goText: Intl.get('user.trade.record', '购买记录'),
            continueFn: () => {
                if (_.isFunction(_this.props.paramObj.continueFn)) {
                    _this.props.paramObj.continueFn(orderInfo);
                }
                _this.onClosePanel();
            },
            goFn: () => {
                history.push('/user-preference',{
                    show_pay_record: true
                });
                _this.onClosePanel();
            },
            countDownMsg: Intl.get('payment.find.result', '正在查询支付结果...'),
            countDownSeconds: 6,
            onCountDownComplete: () => {
                let activeGoods = _this.state.activeGoods;
                let clue_number = _.get(activeGoods, 'clue_number', 0);
                const result = {count: clue_number};
                paymentEmitter.emit(paymentEmitter.ADD_CLUES_PAYMENT_SUCCESS, result);
                //更新线索量信息
                if (_.isFunction(_this.props.paramObj.updateCluesCount)) {
                    _this.props.paramObj.updateCluesCount(result);
                }
                _this.setState({
                    showCountDown: false,//关闭倒计时
                    isShowCloseBtn: true,//显示关闭按钮
                });
            }
        };
        this.setState({
            showPaymentMode: false,
            isPaymentSuccess: true,
            isShowCloseBtn: false,
            operateSuccessTipProps
        });
    };

    render() {
        let autoSettingCls = classNames('goods-item',{
            'goods-item-active': this.state.activeGoods.key === AUTO_SETTING_KEY
        });
        return (
            <Row gutter={4} className="leads-goods-content">
                {this.state.list.map((item, index) => {
                    const cls = classNames('goods-item',{
                        'goods-item-active': item.num === this.state.activeGoods.num
                    });
                    return (
                        <Col span={6} key={index}>
                            <div className={cls} onClick={this.handleClickGoodsItem.bind(this, item)}>
                                <div className="goods-info">
                                    <div className="goods-count-wrapper">
                                        <span className="goods-count">{item.num}</span>
                                        <span className="goods-unit">{Intl.get('clues.leads.part', '份')}</span>
                                    </div>
                                    <span className="goods-total">{item.clue_number} {Intl.get('clues.leads.strip', '条')}</span>
                                </div>
                            </div>
                        </Col>
                    );
                })}
                <Col span={6}>
                    <div className={autoSettingCls} onClick={this.handleClickGoodsItem.bind(this, {
                        key: 'autoSetting',
                        id: this.state.list[0].id,
                        clue_number: _.get(this.state.list, '[0].number', 0) * this.state.inputNumber
                    })}>
                        <div className="goods-info">
                            {this.state.inputNumber > 1 || this.state.activeGoods.key === AUTO_SETTING_KEY ? (
                                <InputNumber
                                    defaultValue={1}
                                    min={1}
                                    max={100}
                                    formatter={value => `${value}${Intl.get('clues.leads.part', '份')}`}
                                    parser={value => value.replace(Intl.get('clues.leads.part', '份'), '')}
                                    precision={0}
                                    value={this.state.inputNumber || 1}
                                    onChange={this.onLeadsCountChange}
                                />
                            ) : <span>{Intl.get('clues.leads.integer.range', '1~100整数')}</span>}
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}

PurchaseLeads.defaultProps = {
    onClosePanel: function() {},
    paramObj: {}
};
PurchaseLeads.propTypes = {
    onClosePanel: PropTypes.func,
    paramObj: PropTypes.object,
};

module.exports = HocGoodsBuy({
    leftTitle: Intl.get('goods.increase.clues', '增加线索量'),
    // rightTitle: Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版'),
    i18nId: 'clues.extract.count.at.part',
    i18nMessage: '线索提取量每份 {count} 条',
    dataTraceName: '购买线索量界面',
})(PurchaseLeads);
