/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/24.
 */
//个人升级为正式版
import './style.less';
import classNames from 'classnames';
import HocGoodsBuy from 'CMP_DIR/hoc-goods-buy';
const LAYOUT_CONSTS = HocGoodsBuy.LAYOUT_CONSTS;
import {Row, Col} from 'antd';
import PayAjax from 'MOD_DIR/common/public/ajax/pay';
import { getOrganizationInfo } from 'PUB_DIR/sources/utils/common-data-util';
import {checkCurrentVersionType} from 'PUB_DIR/sources/utils/common-method-util';
import { setUserData, getUserData } from 'PUB_DIR/sources/user-data';
import history from 'PUB_DIR/sources/history';
import { paymentEmitter } from 'OPLATE_EMITTER';

const PERSONAL_VERSION_GOODS_TYPE = 'curtao_personal';

//默认商品区域高度
const DEFAULT_HEIGHT = 150;

class OfficialPersonalEdition extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            ...this.getInitialState(),
            listHeight: DEFAULT_HEIGHT,
            discountList: [],//商品折扣信息
            showCountDown: true,
        };
    }

    organization = {};

    componentDidMount() {
        getOrganizationInfo().then((result) => {
            this.organization = result;
        });
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
            //支付渠道列表
            promiseList.push(PayAjax.getPaymentMode());
        }
        //个人正式版商品
        promiseList.push(this.getGoodsList(true));
        if(!this.state.discountList.length) {
            //商品折扣列表
            promiseList.push(PayAjax.getGoodsDiscountList());
        }

        Promise.all(promiseList).then((result) => {
            let goodsList = [], discountList = this.state.discountList;
            let promiseListLength = _.get(promiseList, 'length', 0);

            //promiseListLength等于3
            if(promiseListLength === 3) {
                this.setState({payModeList: _.get(result, '[0]', [])});
                goodsList = _.get(result,'[1].list', []);
                discountList = _.get(result, '[2]', []);
            }
            //promiseListLength等于2
            if(promiseListLength === 2) {
                //判断是支付渠道还是商品折扣
                if(!discountList.length) {
                    goodsList = _.get(result,'[0].list', []);
                    discountList = _.get(result, '[1]', []);
                }else {
                    this.setState({payModeList: _.get(result, '[0]', [])});
                    goodsList = _.get(result,'[1].list', []);
                }

            }
            //promiseListLength等于1
            if(promiseListLength === 1) {
                goodsList = _.get(result,'[0].list', []);
            }

            this.dealGoodsList(goodsList, this.dealDiscountList(_.get(goodsList,'[0].id'), discountList));
        }).catch((errMsg) => {
            this.setState({
                isGetGoodsLoading: false,
                errMsg
            });
        });
    }

    //获取线索量商品
    getGoodsList(isPromiseAll) {
        this.setState({
            isGetGoodsLoading: true,
            errMsg: ''
        });
        let queryObj = {
            type: PERSONAL_VERSION_GOODS_TYPE,
            page_size: 20,
        };
        if(isPromiseAll) {
            return PayAjax.getGoodsList(queryObj);
        }else {
            PayAjax.getGoodsList(queryObj).then((result) => {
                this.dealGoodsList(_.get(result, 'list', []), this.state.discountList);
            }, (errMsg) => {
                this.setState({
                    isGetGoodsLoading: false,
                    errMsg: errMsg
                });
            });
        }
    }

    dealGoodsList = (goodsList, discountList) => {
        let newState = {
            isGetGoodsLoading: false,
            errMsg: ''
        };
        //todo 给下拉加载用时的判断处理，暂时未用到，先注释掉
        /*if(!this.state.last_id) {
            newState.list = list;
        }else {
            newState.list = this.state.list.concat(list);
        }
        newState.total = result.total;
        newState.last_id = newState.list.length ? _.last(newState.list).id : '';
        if (newState.list.length === newState.total){
            newState.listenScrollBottom = false;
        }*/
        if(goodsList.length) {
            //构建个人正版的商品,1个月，3个月，6个月。。。
            let originalList = goodsList[0];
            discountList.push({
                number: 1,
                discount: 1
            });
            //根据折扣信息生成对应商品
            newState.list = _.map(_.orderBy(discountList, ['number'], 'desc'), (discount, index) => {
                //根据折扣信息计算单价
                let price = _.get(originalList,'goods_fee',0) * (+_.get(discount,'discount','0'));
                let number = _.get(discount, 'number', 0);
                return {
                    id: originalList.id,
                    number: number,
                    price,
                    totalPrice: Math.round(price * number),
                    index
                };
            });

            //动态计算商品滚动区域高度
            if(newState.list.length > 4) {
                let row = Math.ceil(newState.list.length / 4);
                let height = row * DEFAULT_HEIGHT;
                let maxScrollHeight = $(window).height() - LAYOUT_CONSTS.TOP_HEIGHT - LAYOUT_CONSTS.DESC_HEIGHT - LAYOUT_CONSTS.BOTTOM_HEIGHT;
                newState.listHeight = height > maxScrollHeight ? maxScrollHeight : height;
            }

            newState.activeGoods = newState.list[0];
            let leadLimit = _.get(originalList,'related_info.lead_limit', '');
            //lead_limit: "1000_1/M"
            newState.count = _.get(leadLimit.split('_'),'[0]',0);
        }

        this.setState(newState);
    };

    //获取商品对应的折扣信息
    dealDiscountList = (goodsId, result) => {
        return _.filter(result, item => item.goods_id === goodsId);
    };

    onClosePanel =() => {
        this.props.onClosePanel && this.props.onClosePanel();
    };

    handleUpgradeEnterprise = () => {
        console.log('点击升级企业版');
    };

    //处理提交的商品信息
    dealSubmitGoodInfo = () => {
        let activeGood = this.state.activeGoods;
        return {
            goods_id: activeGood.id,
            num: activeGood.number
        };
    };

    //支付成功回调
    onPaymentSuccess = (orderInfo) => {
        let _this = this;
        let currentVersionType = checkCurrentVersionType();
        let curOrderInfo = this.state.curOrderInfo;
        let i18Id = 'payment.upgrade.version.success',i18Msg = '您已成功升级为正式版，{time} 到期';
        if(currentVersionType.formal) {//正式
            i18Id = 'payment.renewal.version.success';
            i18Msg = '您已成功续费，{time} 到期';
        }
        //计算到期时间
        let endTime = _.get(this.organization, 'end_time', '');
        if(endTime) {
            endTime = moment(endTime);
        }else {//没有时，从当前时间开始算
            endTime = moment();
        }
        endTime = endTime.add(_.get(curOrderInfo,'goods_num', 0), 'months').valueOf();
        let operateSuccessTipProps = {
            title: Intl.get('payment.success', '支付成功'),
            tip: (
                <ReactIntl.FormattedMessage
                    id={i18Id}
                    defaultMessage={i18Msg}
                    values={{
                        'time': <span className="operate-success-tip-tag">{moment(endTime).format(oplateConsts.DATE_FORMAT)}</span>
                    }}
                />
            ),
            continueText: Intl.get('clue.extract.clue', '提取线索'),
            goText: Intl.get('user.trade.record', '购买记录'),
            continueFn: () => {
                if (_.isFunction(this.props.paramObj.continueFn)) {
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
            countDownMsg: Intl.get('payment.upgrading', '正在升级...'),
            countDownSeconds: 6,
            onCountDownComplete: () => {
                let organization = _.get(getUserData(),'organization', {});
                let originalList = _this.state.list[0];
                let related_info = _.cloneDeep(_.get(originalList, 'related_info', {}));
                //请求组织信息数据
                getOrganizationInfo({
                    update: true
                }).then((result) => {
                    complete(result,{
                        id: _.get(result, 'id', ''),
                        officialName: _.get(result, 'official_name', ''),
                        version: _.get(result, 'version', {}),
                        functions: _.get(result, 'functions', []),
                        endTime: _.get(result, 'end_time', ''),
                        expireAfterDays: _.get(result, 'expire_after_days'),
                    });
                }, () => {
                    let id = _.get(related_info, 'realm_or_group_id', '');
                    delete related_info.realm_or_group_id;
                    complete({end_time: endTime, version: related_info},{
                        id: id,
                        version: related_info,
                    });
                });

                function complete(result, newResult) {
                    organization = _.extend(organization, newResult);
                    //更新组织信息
                    setUserData('organization', organization);
                    paymentEmitter.emit(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, result);
                    if (_.isFunction(_this.props.paramObj.updateVersion)) {
                        _this.props.paramObj.updateVersion(result);
                    }
                    _this.setState({
                        showCountDown: false,//关闭倒计时
                        isShowCloseBtn: true,//显示关闭按钮
                    });
                }
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
        return (
            <Row gutter={4} className="official-goods-content">
                {this.state.list.map((item, index) => {
                    const cls = classNames('goods-item',{
                        'goods-item-active': item.number === this.state.activeGoods.number
                    });
                    const length = this.state.list.length;
                    const isMostFavorable = _.minBy(this.state.list, 'price');
                    return (
                        <Col span={6} key={index}>
                            <div className={cls} onClick={this.handleClickGoodsItem.bind(this, item)}>
                                {isMostFavorable.index === index && length > 1 ? <span className="goods-most-favorable">{Intl.get('goods.price.most.favorable', '最优惠')}</span> : null}
                                <div className="goods-name">
                                    <span>{item.number}{Intl.get('user.apply.detail.delay.month.show', '个月')}</span>
                                </div>
                                <div className="goods-info">
                                    <div className="goods-price-wrapper">
                                        <span className="price-symbol">￥</span>
                                        <span className="goods-price">{item.totalPrice}</span>
                                    </div>
                                    <span className="goods-average">{Intl.get('contract.159', '{num}元',{num: item.price})}/{Intl.get('common.time.unit.month', '月')}</span>
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
        );
    }
}
OfficialPersonalEdition.defaultProps = {
    onClosePanel: function() {},
    paramObj: {}
};
OfficialPersonalEdition.propTypes = {
    onClosePanel: PropTypes.func,
    paramObj: PropTypes.object,
};
module.exports = HocGoodsBuy({
    leftTitle: Intl.get('personal.upgrade.to.official.version', '升级为正式版'),
    // rightTitle: Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版'),
    i18nId: 'clues.extract.count.at.month',
    i18nMessage: '线索推荐每月可提取 {count} 条',
    dataTraceName: '升级个人正式版界面',
})(OfficialPersonalEdition);