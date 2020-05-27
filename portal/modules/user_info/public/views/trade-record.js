/**
 * Created by hzl on 2019/10/23.
 * 购买记录
 */

require('../css/trade-record.less');
import { AntcTable } from 'antc';
import Spinner from 'CMP_DIR/spinner';
import userInfoAjax from '../ajax/user-info-ajax';
import {formatRoundingData} from 'PUB_DIR/sources/utils/common-method-util';
import {TRACE_UNIT} from 'PUB_DIR/sources/utils/consts';
import NoData from 'CMP_DIR/no-data';
import LoadDataError from 'CMP_DIR/load-data-error';
import { isResponsiveDisplay } from 'PUB_DIR/sources/utils/common-method-util';
import DetailCard from 'CMP_DIR/detail-card';

const pageSize = 100;
const tableHeadHeight = 40;
class TradeRecord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: pageSize,
            loading: false, // 获取交易记录的loading
            tradeRecordList: [], // 交易记录列表
            errorMsg: '', // 获取交易记录失败信息
            sortId: '', // 交易记录最后一条的Id
            total: 0, // 交易记录总数
            listenScrollBottom: true // 下拉加载
        };
    }

    // 获取用户交易记录
    getUserTradeRecord = (queryObj) => {
        if (this.state.sortId === '') {
            this.setState({
                loading: true
            });
        }
        let submitObj = {
            page_size: pageSize,
            sort_id: ''
        };
        let sortId = _.get(queryObj, 'sort_id');
        if (sortId) {
            submitObj.sort_id = sortId;
        }
        userInfoAjax.getUserTradeRecord(submitObj).then( (result) => {
            let total = _.get(result, 'total', 0);
            let tradeRecordList = this.state.tradeRecordList;
            tradeRecordList = tradeRecordList.concat(_.get(result, 'list'));
            let length = tradeRecordList.length;
            let sortId = length > 0 ? tradeRecordList[length - 1].id : '';
            let listenScrollBottom = length < total ? true : false;
            this.setState({
                loading: false,
                tradeRecordList: tradeRecordList,
                sortId: sortId,
                total: total,
                listenScrollBottom: listenScrollBottom
            });
        }, (errMsg) => {
            this.setState({
                loading: false,
                errorMsg: errMsg,
                listenScrollBottom: false
            });
        } );
    };

    componentWillMount() {
        this.getUserTradeRecord();
    }

    setInitialData = () => {
        this.setState = {
            pageSize: pageSize,
            loading: false, // 获取交易记录的loading
            tradeRecordList: [], // 交易记录列表
            errorMsg: '', // 获取交易记录失败信息
            sortId: '', // 交易记录最后一条的Id
            total: 0, // 交易记录总数
            listenScrollBottom: true, // 下拉加载
        };
    }

    componentWillUnmount() {
        // 卸载组价后，数据初始化
        this.setInitialData();
    }

    isShowNoMoreDataTips = () => {
        return !this.state.loading &&
            this.state.tradeRecordList.length >= 10 && !this.state.listenScrollBottom;
    }

    getTradeRecordColumns = () => {
        return [{
            title: Intl.get('user.trade.record.order.number','订单号'),
            dataIndex: 'trade_no',
            width: '25%'
        }, {
            title: Intl.get('deal.detail.panel.title','订单详情'),
            dataIndex: 'goods',
            width: '20%',
            render: (text, record) => {
                let type = _.get(text, 'type');
                let name = _.get(text, 'name');
                let num = _.get(record, 'goods_num');
                let unit = type && _.has(TRACE_UNIT, type) ? TRACE_UNIT[type] : '';
                let detail = name + num + unit;
                return (
                    <div className="order-detail">
                        {detail}
                    </div>
                );
            }
        }, {
            title: Intl.get('user.trade.record.time','订单时间'),
            dataIndex: 'finish_time',
            width: '18%',
            align: 'left',
            render: (text) => {
                return (
                    <div>{moment(text).format(oplateConsts.DATE_TIME_FORMAT)}</div>
                );
            }
        },{
            title: Intl.get('crm.contract.money','金额(元)'),
            dataIndex: 'total_fee',
            width: '9%',
            align: 'right',
            render: (text) => {
                return (
                    <div>{formatRoundingData(text, 2)}</div>
                );
            }
        }, {
            title: Intl.get('user.trade.payment.mode','支付方式'),
            dataIndex: 'pay_type',
            width: '9%',
            render: (text) => {
                return (
                    <div>
                        {
                            text === 'alipay' ?
                                Intl.get('user.trade.payment.name','{name}支付', {name: Intl.get('user.trade.payment.alipay','支付宝')}) :
                                Intl.get('user.trade.payment.name','{name}支付', {name: Intl.get('crm.58','微信')})
                        }
                    </div>
                );
            }
        }, {
            title: Intl.get('user.operator','操作人'),
            dataIndex: 'user_name',
            width: '20%'
        }];
    };

    handleScrollBottom = () => {
        this.getUserTradeRecord({sort_id: this.state.sortId});
    };

    renderCardTitle = (item) => {
        return (
            <div className="card-title">
                <span className="title">
                    {Intl.get('user.trade.record.order.number','订单号')}:
                </span>
                <span className="content">
                    {_.get(item, 'trade_no')}
                </span>
            </div>
        );
    };

    renderCardContent = (item) => {
        let type = _.get(item, 'goods.type');
        let name = _.get(item, 'goods.name');
        let num = _.get(item, 'goods_num');
        let unit = type && _.has(TRACE_UNIT, type) ? TRACE_UNIT[type] : '';
        let detail = name + num + unit;
        let totalFee = formatRoundingData(_.get(item, 'total_fee'), 2);
        return (
            <div className="card-content">
                <div className="detail-item detail-import">
                    <span className="detail-num">{detail}</span>
                    <span className="detail-fee">{totalFee}</span>
                </div>
                <div className="detail-item">
                    <span className="title">{Intl.get('user.trade.record.time','订单时间')}:</span>
                    <span className="content">{moment(item.finish_time).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                </div>
                <div className="detail-item">
                    <span className="title">{Intl.get('user.trade.payment.mode','支付方式')}:</span>
                    <span className="content">
                        {
                            _.get(item, 'pay_type') === 'alipay' ?
                                Intl.get('user.trade.payment.name','{name}支付', {name: Intl.get('user.trade.payment.alipay','支付宝')}) :
                                Intl.get('user.trade.payment.name','{name}支付', {name: Intl.get('crm.58','微信')})
                        }
                    </span>
                </div>
                <div className="detail-item">
                    <span className="title">{Intl.get('user.operator','操作人')}:</span>
                    <span className="content">{_.get(item, 'user_name')}</span>
                </div>
            </div>
        );
    }

    // 渲染用户的交易记录
    renderUserTradeRecordTable = () => {
        const columns = this.getTradeRecordColumns();
        const dataSource = this.state.tradeRecordList;
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: this.state.loading,
            showNoMoreDataTip: this.isShowNoMoreDataTips(),
            noMoreDataText: Intl.get('common.no.more.data.tips', '没有更多{name}了',
                {name: Intl.get('user.trade.record', '购买记录')})
        };
        const tableHeight = this.props.height - tableHeadHeight;
        const total = this.state.total;
        let localeTips = {
            emptyText: this.state.errorMsg || Intl.get('common.no.data.tips', '暂无{name}',
                {name: Intl.get('user.trade.record', '购买记录')})
        };
        if (isResponsiveDisplay().isWebSmall) {
            return (
                <div className="user-trade-record-phone-wrap">
                    {
                        _.map(dataSource, item => {
                            return (
                                <DetailCard
                                    title={this.renderCardTitle(item)}
                                    content={this.renderCardContent(item)}
                                />
                            );
                        })
                    }
                </div>
            );
        }
        return (
            <div className="user-trade-record-table-wrap scroll-load">
                <div className="trade-record-table-content" style={{ height: this.props.height }}>
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        dataSource={dataSource}
                        columns={columns}
                        locale={localeTips}
                        util={{ zoomInSortArea: true}}
                        scroll={{ y: tableHeight }}
                        pagination={false}
                    />
                </div>
                {
                    total ?
                        <div className="summary-info">
                            {Intl.get('user.trade.record.total','共有{total}条购买记录', {total: total})}
                        </div> : null
                }
            </div>
        );
    };

    renderUserTradeRecord = () => {
        if (!this.state.sortId && this.state.loading) {
            return (
                <div className="trade-record-loading">
                    <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
                </div>
            );
        } else {
            return this.renderUserTradeRecordContent();
        }
    };

    renderUserTradeRecordContent = () => {
        let tradeRecordList = this.state.tradeRecordList;
        let length = _.get(tradeRecordList, 'length');
        if (length) {
            return this.renderUserTradeRecordTable();
        } else {
            return this.renderNoDataOrLoadError();
        }
    };

    renderNoDataOrLoadError = () => {
        let errorMsg = this.state.errorMsg;
        return (
            <div className="msg-tips" style={{ height: this.props.height }} >
                {
                    errorMsg ? (
                        <LoadDataError
                            retryLoadData={this.getUserTradeRecord}
                        />
                    ) : (
                        <div className="no-data-tips-operate">
                            <NoData
                                textContent={Intl.get('user.trade.no.payment','您还没有购买记录')}
                            />
                        </div>
                    )
                }
            </div>
        );
    };

    render() {
        return (
            <div className="trade-record-wrap">
                {this.renderUserTradeRecord()}
            </div>
        );
    }
}


TradeRecord.propTypes = {
    height: PropTypes.number,
};
export default TradeRecord;