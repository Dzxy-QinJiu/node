/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
require('../style/index.less');
import dealAction from '../action';
import dealStore from '../store';
import {AntcTable} from 'antc';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {DEAL_STATUS} from 'PUB_DIR/sources/utils/consts';
import Trace from 'LIB_DIR/trace';
import classNames from 'classnames';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import {orderEmitter} from 'PUB_DIR/sources/utils/emitters';
import {num as antUtilsNum} from 'ant-utils';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
const parseAmount = antUtilsNum.parseAmount;
const PAGE_SIZE = 20;
import {getTableContainerHeight} from 'PUB_DIR/sources/utils/common-method-util';
import adaptiveHeightHoc from 'CMP_DIR/adaptive-height-hoc';

class DealTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...dealStore.getState(),
            sorter: {
                field: 'time',//排序字段,默认：创建时间
                order: 'descend'//倒序
            },
            teamList: [],//团队列表（列表中的团队根据团队id获取团队名来展示）
        };
    }

    componentDidMount() {
        dealStore.listen(this.onStoreChange);
        this.getTeamList();
        this.getDealList();
        let _this = this;
        //点击订单列表某一行时打开对应的详情
        $('.deal-manage-content').on('click', 'td.has-filter', function(e) {
            Trace.traceEvent(e, '打开机会详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            let currDeal = _.find(_this.state.dealListObj.list, deal => deal.id === id);
            if (_.isFunction(_this.props.showDetailPanel)) {
                _this.props.showDetailPanel(currDeal);
            }
        });
        orderEmitter.on(orderEmitter.REFRESH_ORDER_LIST, this.refreshOrderList);
    }

    componentWillUnmount() {
        dealAction.setInitData();
        dealStore.unlisten(this.onStoreChange);
        orderEmitter.removeListener(orderEmitter.REFRESH_ORDER_LIST, this.refreshOrderList);
    }

    onStoreChange = () => {
        this.setState(dealStore.getState());
    }

    getTeamList() {
        getMyTeamTreeAndFlattenList(data => {
            this.setState({
                teamList: data.teamList
            });
        });
    }

    getDealList(type) {
        let body = this.props.getSearchBody();
        let sorter = this.state.sorter;
        //‘update’表明此个刷新列表是通过emitter的触发进行的刷新，page_size 需要-1来获取值
        dealAction.getDealList({
            page_size: _.isEqual(type, 'update') ? PAGE_SIZE - 1 : PAGE_SIZE,
            page_num: _.get(this.state, 'dealListObj.pageNum', 1),
            sort_field: sorter.field,
            sort_order: sorter.order
        }, body);
    }

    showCustomerDetail = (customerId) => {
        if (_.isFunction(this.props.showCustomerDetail)) {
            this.props.showCustomerDetail(customerId);
        }
    };

    //刷新订单列表
    refreshOrderList = () => {
        let total = _.get(this.state, 'dealListObj.total', 0);
        let list = _.get(this.state, 'dealListObj.list', []);
        //当前列表长度小于总长度时并且总长度的个数大于20个时，更新列表
        if(list.length <= total && total >= 20) {
            //服务器端有延迟，一秒后再更新
            setTimeout(() => {
                this.getDealList('update');
            }, 1000);
        }
    }

    getDealColumns() {
        return [
            {
                title: Intl.get('common.belong.customer', '所属客户'),
                dataIndex: 'customer_name',
                render: (text, record, index) => {
                    let cls = classNames('deal-customer-name', {
                        'customer-name-active': record.customer_id && record.customer_id === this.props.curShowCustomerId
                    });
                    return text ? (
                        <div className={cls}
                            title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                            onClick={this.showCustomerDetail.bind(this, record.customer_id)}>
                            {text}
                        </div>) : '';
                }
            },
            {
                title: Intl.get('deal.budget', '预算(元)'),
                dataIndex: 'budget',
                width: 110,
                align: 'right',
                sorter: true,
                className: 'has-filter',
                render: (text, record, index) => {
                    //有小数的预算，四舍五入精确到分
                    return text === 0 ? text : parseAmount(formatNumHasDotToFixed(text, 2));
                }
            },
            {
                title: Intl.get('deal.stage', '阶段'),
                dataIndex: 'sale_stages_num',
                className: 'has-filter',
                align: 'left',
                render: (text, record, index) => {
                    let stage = record.sale_stages;
                    if (stage === DEAL_STATUS.LOSE) {
                        stage = Intl.get('crm.order.status.lost', '丢单');
                    } else if (stage === DEAL_STATUS.WIN) {
                        stage = Intl.get('crm.order.status.won', '赢单');
                    }
                    return (
                        <span>
                            {stage}
                            <span className="hidden record-id">{record.id}</span>
                        </span>);
                }
            },
            {
                title: Intl.get('crm.order.expected.deal', '预计成交'),
                dataIndex: 'predict_finish_time',
                className: 'has-filter',
                align: 'left',
                sorter: true,
                render: (text, record, index) => {
                    return text ? moment(+text).format(oplateConsts.DATE_FORMAT) : '';
                }
            },
            {
                title: Intl.get('member.create.time', '创建时间'),
                dataIndex: 'time',
                align: 'left',
                sorter: true,
                className: 'has-filter',
                render: (text, record, index) => {
                    return text ? moment(+text).format(oplateConsts.DATE_FORMAT) : '';
                }
            },
            {
                title: Intl.get('crm.6', '负责人'),
                dataIndex: 'user_name',
                className: 'has-filter',
                render: (text, record, index) => {
                    let teamName = record.sales_team_id ? this.getTeamNameById(record.sales_team_id) : '';
                    if (teamName) {
                        return `${text || ''}(${teamName})`;
                    } else {
                        return text;
                    }
                }
            },
        ];
    }

    getTeamNameById(teamId) {
        let curTeam = _.find(this.state.teamList, team => team.group_id === teamId);
        if (curTeam) {
            return curTeam.group_name || '';
        }
        return '';
    }

    handleScrollBottom = () => {
        this.getDealList();
    }
    showNoMoreDataTip = () => {
        let dealListObj = this.state.dealListObj;
        return !dealListObj.isLoading && !dealListObj.errorMsg &&
            dealListObj.length >= PAGE_SIZE && !dealListObj.listenScrollBottom;
    }
    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.id === this.props.currDeal.id) && this.props.isDetailPanelShow) {
            return 'current-row';
        }
        else {
            return '';
        }
    };
    onTableChange = (pagination, filters, sorter) => {
        let sorterChanged = false;
        if (!_.isEmpty(sorter) && (sorter.field !== this.state.sorter.field || sorter.order !== this.state.sorter.order)) {
            sorterChanged = true;
        }
        if (!sorterChanged) return;
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('th.has-sorter'), `机会按 ${sorter.field} - ${sorter.order} 排序`);
        this.setState({sorter}, () => {
            dealAction.setPageNum(1);
            setTimeout(() => {
                this.getDealList();
            });
        });
    };

    rowKey(record, index) {
        return record.id;
    }

    render() {
        let dealListObj = this.state.dealListObj;
        //初次获取数据时展示loading效果
        if (dealListObj.isLoading && (!_.get(dealListObj, 'list[0]'))) {
            return (<Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')} />);
        } else if (_.get(dealListObj, 'list[0]')) {
            let tableHeight = getTableContainerHeight(this.props.adaptiveHeight);
            return (
                <div className="deal-table-container" style={{height: tableHeight}} data-tracename="机会列表">
                    <AntcTable
                        rowKey={this.rowKey}
                        rowClassName={this.handleRowClassName}
                        columns={this.getDealColumns()}
                        loading={dealListObj.isLoading && !dealListObj.lastId}
                        dataSource={dealListObj.list}
                        util={{zoomInSortArea: true}}
                        onChange={this.onTableChange}
                        pagination={false}
                        scroll={{y: tableHeight}}
                        dropLoad={{
                            listenScrollBottom: dealListObj.listenScrollBottom,
                            handleScrollBottom: this.handleScrollBottom,
                            loading: dealListObj.isLoading,
                            showNoMoreDataTip: this.showNoMoreDataTip(),
                            noMoreDataText: Intl.get('deal.no.more.tip', '没有更多机会了')
                        }}
                    />
                    {dealListObj.total ?
                        <BottomTotalCount totalCount={ <ReactIntl.FormattedMessage
                            id='deal.total.tip'
                            defaultMessage={'共{count}个机会'}
                            values={{
                                'count': dealListObj.total
                            }}
                        />}/> : null
                    }
                </div>);
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无机会');
            if (dealListObj.errorMsg) {
                noDataTip = dealListObj.errorMsg;
            } else if (this.props.searchObj.value) {
                noDataTip = Intl.get('deal.no.filter.deal', '没有符合条件的机会');
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }
}
DealTable.propTypes = {
    currDeal: PropTypes.object,
    searchObj: PropTypes.object,
    curShowCustomerId: PropTypes.string,
    isDetailPanelShow: PropTypes.bool,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func,
    getSearchBody: PropTypes.func,
    adaptiveHeight: PropTypes.number
};
export default adaptiveHeightHoc(DealTable);