/**
 * Created by hzl on 2019/10/23.
 */
require('../css/trade-record.less');
import { AntcTable } from 'antc';
import Spinner from 'CMP_DIR/spinner';
import userInfoAjax from '../ajax/user-info-ajax';
import {formatRoundingData} from 'PUB_DIR/sources/utils/common-method-util';
const pageSize = 100;
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
        userInfoAjax.getUserTradeRecord(queryObj).then( (result) => {
            let total = _.get(result, 'total') || 0;
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
        let queryObj = {
            page_size: pageSize,
            sort_id: ''
        };
        this.getUserTradeRecord(queryObj);
    }

    componentWillUnmount() {
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
            dataIndex: 'goods_name',
            width: '20%'
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
        let queryObj = {
            page_size: pageSize,
            sort_id: this.state.sortId
        };
        this.getUserTradeRecord(queryObj);
    };

    // 渲染用户的交易记录
    renderUserTradeRecord = () => {
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
        const tableHeight = this.props.height;
        const total = this.state.total;
        let localeTips = {
            emptyText: this.state.errorMsg || Intl.get('common.no.data.tips', '暂无{name}',
                {name: Intl.get('user.trade.record', '购买记录')})
        };
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

    render() {
        const height = this.props.height;
        return (
            <div className="trade-record-wrap" style={{height: height}}>
                {
                    !this.state.sortId && this.state.loading ?
                        <Spinner/> : (
                            <div className="trade-record-content">
                                {this.renderUserTradeRecord()}
                            </div>
                        )
                }
            </div>
        );
    }
}


TradeRecord.defaultProps = {
};

TradeRecord.propTypes = {
    height: PropTypes.number,
};
export default TradeRecord;