/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/24.
 */
//个人升级为正式版
import './style.less';
import HocGoodsBuy from 'CMP_DIR/hoc-goods-buy';
import {Row, Col, Button} from 'antd';
/*import RightPanelModal from 'CMP_DIR/right-panel-modal';

class OfficialPersonalEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    //升级为企业版
    handleUpgradeEnterprise = () => {

    };

    onClosePanel = () => {

    };

    renderContent = () => {
        return (
            <div className="goods-container">
                <div className="goods-desc">
                    <i className="iconfont icon-clue-recommend"/>
                    <span className="clue-extract-count-wrapper">
                        <ReactIntl.FormattedMessage
                            id="clues.extract.count.at.month"
                            defaultMessage={'线索推荐每月可提取 {count} 条'}
                            values={{
                                'count': <span className="clue-extract-count">4000</span>
                            }}
                        />
                    </span>
                </div>
                <div className="goods-content">
                    <Row gutter={4}>
                        <Col span={6}>
                            <div className="goods-item goods-item-active">
                                <span className="goods-most-favorable">{Intl.get('goods.price.most.favorable', '最优惠')}</span>
                                <div className="goods-name">
                                    <span>12个月</span>
                                </div>
                                <div className="goods-info">
                                    <div className="goods-price-wrapper">
                                        <span className="price-symbol">￥</span>
                                        <span className="goods-price">360</span>
                                    </div>
                                    <span className="goods-average">30元/月</span>
                                </div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="goods-item">
                                <div className="goods-name">
                                    <span>6个月</span>
                                </div>
                                <div className="goods-info">
                                    <div className="goods-price-wrapper">
                                        <span className="price-symbol">￥</span>
                                        <span className="goods-price">200</span>
                                    </div>
                                    <span className="goods-average">33元/月</span>
                                </div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="goods-item">
                                <div className="goods-name">
                                    <span>3个月</span>
                                </div>
                                <div className="goods-info">
                                    <div className="goods-price-wrapper">
                                        <span className="price-symbol">￥</span>
                                        <span className="goods-price">120</span>
                                    </div>
                                    <span className="goods-average">40元/月</span>
                                </div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="goods-item">
                                <div className="goods-name">
                                    <span>1个月</span>
                                </div>
                                <div className="goods-info">
                                    <div className="goods-price-wrapper">
                                        <span className="price-symbol">￥</span>
                                        <span className="goods-price">50</span>
                                    </div>
                                    <span className="goods-average">50元/月</span>
                                </div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className="goods-item">
                                <div className="goods-name">
                                    <span>1个月</span>
                                </div>
                                <div className="goods-info">
                                    <div className="goods-price-wrapper">
                                        <span className="price-symbol">￥</span>
                                        <span className="goods-price">50</span>
                                    </div>
                                    <span className="goods-average">50元/月</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <Button className="order-submit-btn" type="primary" size="large">{Intl.get('goods.immediate.payment', '立即支付')}</Button>
            </div>
        );
    };

    render() {
        const title = (
            <div className="official-personal-title-wrapper">
                <span>{Intl.get('personal.upgrade.to.official.version', '升级为正式版')}</span>
                <span
                    className="official-personal-title-btn"
                    title={Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版')}
                    data-tracename="点击升级企业版按钮"
                    onClick={this.handleUpgradeEnterprise()}
                >{Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版')}</span>
            </div>
        );
        return (
            <RightPanelModal
                className="official-personal-wrapper"
                isShowMadal={true}
                isShowCloseBtn={true}
                title={title}
                onClosePanel={this.onClosePanel}
                content={this.renderContent()}
                dataTracename="个人升级正式版"
            />
        );
    }
}*/

class OfficialPersonalEdition extends React.Component{

    state = {
        isGetGoodsLoading: false,
        leftTitle: Intl.get('personal.upgrade.to.official.version', '升级为正式版'),
        rightTitle: Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版'),
        i18nId: 'clues.extract.count.at.month',
        i18nMessage: '线索推荐每月可提取 {count} 条',
        count: 4000,
    };

    //获取线索量商品
    getGoodsList() {
        this.setState({
            isGetGoodsLoading: true,
            errMsg: ''
        });
        let queryObj = {
            type: 'lead',
            page_size: 20,
        };
        if (this.state.last_id) {
            queryObj.sort_id = this.state.last_id;
        }
        PayAjax.getGoodsList(queryObj).then((result) => {
            console.log(result);
            let newState = {
                isGetGoodsLoading: false,
                errMsg: ''
            };
            let list = _.isArray(result.list) ? result.list : [];
            if(!this.state.last_id) {
                newState.list = list;
            }else {
                newState.list = this.state.list.concat(list);
            }
            //status: 商品状态（0：停用，1：启用）
            newState.list = _.filter(newState.list, item => item.status);
            newState.total = result.total;
            newState.last_id = newState.list.length ? _.last(newState.list).id : '';
            if (newState.list.length === newState.total){
                newState.listenScrollBottom = false;
            }
            this.setState(newState);
        }, (errMsg) => {
            this.setState({
                isGetGoodsLoading: false,
                errMsg: errMsg || Intl.get('clues.get.goods.faild', '获取商品失败')
            });
        });
    }

    onClosePanel =() => {
        this.props.onClosePanel && this.props.onClosePanel();
    }

    handleUpgradeEnterprise = () => {
        console.log('点击升级企业版');
    };

    render() {
        return (
            <Row gutter={4} className="official-goods-content">
                <Col span={6}>
                    <div className="goods-item goods-item-active">
                        <span className="goods-most-favorable">{Intl.get('goods.price.most.favorable', '最优惠')}</span>
                        <div className="goods-name">
                            <span>12个月</span>
                        </div>
                        <div className="goods-info">
                            <div className="goods-price-wrapper">
                                <span className="price-symbol">￥</span>
                                <span className="goods-price">360</span>
                            </div>
                            <span className="goods-average">30元/月</span>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="goods-item">
                        <div className="goods-name">
                            <span>6个月</span>
                        </div>
                        <div className="goods-info">
                            <div className="goods-price-wrapper">
                                <span className="price-symbol">￥</span>
                                <span className="goods-price">200</span>
                            </div>
                            <span className="goods-average">33元/月</span>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="goods-item">
                        <div className="goods-name">
                            <span>3个月</span>
                        </div>
                        <div className="goods-info">
                            <div className="goods-price-wrapper">
                                <span className="price-symbol">￥</span>
                                <span className="goods-price">120</span>
                            </div>
                            <span className="goods-average">40元/月</span>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="goods-item">
                        <div className="goods-name">
                            <span>1个月</span>
                        </div>
                        <div className="goods-info">
                            <div className="goods-price-wrapper">
                                <span className="price-symbol">￥</span>
                                <span className="goods-price">50</span>
                            </div>
                            <span className="goods-average">50元/月</span>
                        </div>
                    </div>
                </Col>
                <Col span={6}>
                    <div className="goods-item">
                        <div className="goods-name">
                            <span>1个月</span>
                        </div>
                        <div className="goods-info">
                            <div className="goods-price-wrapper">
                                <span className="price-symbol">￥</span>
                                <span className="goods-price">50</span>
                            </div>
                            <span className="goods-average">50元/月</span>
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}
OfficialPersonalEdition.defaultProps = {
    onClosePanel: function() {},
};
OfficialPersonalEdition.propTypes = {
    onClosePanel: PropTypes.func,
};
module.exports = HocGoodsBuy(OfficialPersonalEdition);