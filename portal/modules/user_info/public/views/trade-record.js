/**
 * Created by hzl on 2019/10/23.
 */
import { AntcTable } from 'antc';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
import userInfoAjax from '../ajax/user-info-ajax';

class TradeRecord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: 20,
            loading: false, // 获取交易记录的loading
            tradeRecordList: [], // 交易记录列表
            errorMsg: '', // 获取交易记录失败信息
            sortId: '', // 交易记录最后一条的Id
            total: 0, // 交易记录总数
            listenScrollBottom: true, // 下拉加载
        };
    }

    // 获取用户交易记录
    getUserTradeRecord = (queryObj) => {
        this.setState({
            loading: true
        });
        userInfoAjax.getUserTradeRecord(queryObj).then( (result) => {
            let tradeRecordList = this.state.tradeRecordList;
            tradeRecordList = tradeRecordList.concat(_.get(result, 'data'));
            if (_.get(result, 'total')) {
                this.listenScrollBottom = false;
            } else {
                this.listenScrollBottom = true;
            }
            let length = tradeRecordList.length;
            this.sortId = length > 0 ? tradeRecordList[length - 1].sort_id : '';
            this.total = _.get(result, 'total') || 0;

        }, (errMsg) => {
            this.setState({
                loading: false,
                errorMsg: errMsg,
                listenScrollBottom: false
            });
        } );
    };

    componentDidMount() {
        let queryObj = {
            page_size: 20,
            sort_id: ''
        };
        this.getUserTradeRecord(queryObj);
    }

    componentWillUnmount() {
        this.setState = {
            pageSize: 20,
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
            width: '23%'
        }, {
            title: Intl.get('user.trade.record.time','交易时间'),
            dataIndex: 'finish_time',
            width: '16%',
            render: (text) => {
                return (
                    <div>{moment(text).format(oplateConsts.DATE_TIME_FORMAT)}</div>
                );
            }
        }, {
            title: Intl.get('user.trade.record.product.name','商品名称'),
            dataIndex: 'goods_name',
            width: '21%'
        }, {
            title: Intl.get('user.trade.record.price','价格'),
            dataIndex: 'total_fee',
            width: '16%'
        }, {
            title: Intl.get('user.trade.record.status','交易状态'),
            dataIndex: 'status',
            width: '16%'
        }, {
            title: Intl.get('user.operator','操作人'),
            dataIndex: 'userName',
            width: '15%'
        }];
    };

    handleScrollBottom = () => {
        let queryObj = {
            page_size: 20,
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
                {name: Intl.get('user.trade.record', '交易记录')})
        };
        const tableHeight = this.props.height;
        const total = this.state.total;
        let localeTips = {
            emptyText: this.state.errorMsg || Intl.get('common.no.data.tips', '暂无{name}',
                {name: Intl.get('user.trade.record', '交易记录')})
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
                            {Intl.get('user.trade.record.total','共有{total}条交易记录', {total: total})}
                        </div> : null
                }

            </div>
        );
    };

    render() {
        const height = this.props.height;
        return (
            <div className="trade-record-wrap" style={{height: height}}>
                <GeminiScrollbar>
                    {
                        !this.state.sortId && this.state.loading ?
                            <Spinner/> : (
                                <div className="trade-record-content">
                                    {this.renderUserTradeRecord()}
                                </div>
                            )
                    }
                </GeminiScrollbar>
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