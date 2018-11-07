/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
require('./style/index.less');
import {Button} from 'antd';
import {AntcTable} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import dealAction from './action';
import dealStore from './store';
import DealForm from './views/deal-form';
import DealDetailPanel from './views/deal-detail-panel';

const PAGE_SIZE = 20;
const TOP_NAV_HEIGHT = 64,//头部导航区高度
    TOTAL_HEIGHT = 40,//总数的高度
    TH_HEIGHT = 50;//表头的高度
class DealManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...dealStore.getState(),
            sort_field: 'time',//排序字段,默认：创建时间
            sort_order: 'descend',//倒序
            isDealFormShow: false,//是否展示添加订单面版
            isDetailPanelShow: false,//是否展示订单详情
            currDeal: {},//当前查看详情的订单
            sorter: {
                field: 'time',
                order: 'descend'
            }
        };
    }

    componentDidMount() {
        dealStore.listen(this.onStoreChange);
        this.getDealList();
        let _this = this;
        //点击订单列表某一行时打开对应的详情
        $('.deal-manage-content').on('click', 'td.has-filter', function(e) {
            Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.ant-table-tbody'), '打开订单详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            _this.showDetailPanel(id);
        });
    }

    componentWillUnmount() {
        dealAction.setInitData();
        dealStore.unlisten(this.onStoreChange);
    }

    onStoreChange = () => {
        this.setState(dealStore.getState());
    }

    showDetailPanel(id) {
        let currDeal = _.find(this.state.dealListObj.list, deal => deal.id === id);
        if (currDeal) {
            this.setState({currDeal, isDetailPanelShow: true});
        }
    }

    hideDetailPanel = () => {
        this.setState({currDeal: {}, isDetailPanelShow: false});
    }

    getDealList() {
        let query = {cursor: true};
        if (_.get(this.state, 'dealListObj.lastId')) {
            query.id = this.state.dealListObj.lastId;
        }
        let sorter = this.state.sorter;
        dealAction.getDealList({
            page_size: PAGE_SIZE,
            sort_field: sorter.field,
            sort_order: sorter.order
        }, {}, query);
    }

    getDealColumns() {
        return [
            {
                title: Intl.get('common.definition', '名称'),
                dataIndex: 'customer_name',
                className: 'has-filter',
                sorter: true,
            },
            {
                title: Intl.get('deal.budget', '预算(万)'),
                dataIndex: 'budget',
                width: 110,
                align: 'right',
                // sorter: true,
                className: 'has-filter'
            },
            {
                title: Intl.get('deal.stage', '阶段'),
                dataIndex: 'sale_stages',
                className: 'has-filter',
                render: (text, record, index) => {
                    return (
                        <span>
                            {text}
                            <span className="hidden record-id">{record.id}</span>
                        </span>);
                }
            },
            {
                title: Intl.get('crm.order.expected.deal', '预计成交'),
                dataIndex: 'predict_finish_text',
                className: 'has-filter',
                // sorter: true,
            },
            {
                title: Intl.get('member.create.time', '创建时间'),
                dataIndex: 'time_text',
                // sorter: true,
                className: 'has-filter',
            },
            {
                title: Intl.get('crm.6', '负责人'),
                dataIndex: 'user_name',
                className: 'has-filter',
            },
        ];
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
        if ((record.id === this.state.currDeal.id) && this.state.isDetailPanelShow) {
            return 'current-row';
        }
        else {
            return '';
        }
    };
    onTableChange = (pagination, filters, sorter) => {
        let sorterChanged = false;
        let sorterObj = _.cloneDeep(sorter);
        if (sorterObj.field === 'predict_finish_text') {
            sorterObj.field = 'predict_finish_time';
        } else if (sorterObj.field === 'time_text') {
            sorterObj.field = 'time';
        }
        if (!_.isEmpty(sorterObj) && (sorterObj.field !== this.state.sorter.field || sorterObj.order !== this.state.sorter.order)) {
            sorterChanged = true;
        }
        if (!sorterChanged) return;
        let dealListObj = this.state.dealListObj;
        dealListObj.lastId = '';
        this.setState({sorter: sorterObj, dealListObj}, () => {
            this.getDealList(true);
        });
    };

    rowKey(record, index) {
        return record.id;
    }

    renderDealList() {
        let dealListObj = this.state.dealListObj;
        if (dealListObj.isLoading && !dealListObj.lastId) {
            return (<Spinner />);
        } else if (_.get(dealListObj, 'list[0]')) {
            let tableHeight = $('body').height() - TOP_NAV_HEIGHT - TOTAL_HEIGHT - TH_HEIGHT;
            return (
                <div className="deal-table-container" style={{height: tableHeight}}>
                    <AntcTable
                        rowKey={this.rowKey}
                        rowClassName={this.handleRowClassName}
                        columns={this.getDealColumns()}
                        dataSource={dealListObj.list}
                        util={{zoomInSortArea: true}}
                        onChange={this.onTableChange}
                        pagination={false}
                        scroll={{y: tableHeight}}
                        dropLoad={{
                            listenScrollBottom: dealListObj.listenScrollBottom,
                            handleScrollBottom: this.handleScrollBottom,
                            loading: dealListObj.isLoading === 'loading',
                            showNoMoreDataTip: this.showNoMoreDataTip(),
                            noMoreDataText: Intl.get('deal.no.more.tip', '没有更多订单了')
                        }}
                    />
                </div>);
        } else {
            return (
                <NoDataIntro noDataTip={dealListObj.errorMsg || Intl.get('deal.no.data', '暂无订单')}/>);
        }
    }

    showDealForm = () => {
        this.setState({isDealFormShow: true});
    }
    hideDealForm = () => {
        this.setState({isDealFormShow: false});
    }

    render() {
        return (
            <div className="deal-manage-container">
                <TopNav>
                    <PrivilegeChecker check="CUSTOMER_ADD">
                        <Button className='btn-item add-deal-btn' onClick={this.showDealForm}>
                            {Intl.get('crm.161', '添加订单')}
                        </Button>
                    </PrivilegeChecker>
                </TopNav>
                <div className="deal-manage-content">
                    {this.renderDealList()}
                    {_.get(this.state, 'dealListObj.total') ?
                        <div className="summary_info">
                            <ReactIntl.FormattedMessage
                                id="deal.total.tip"
                                defaultMessage={'共{count}个订单'}
                                values={{
                                    'count': _.get(this.state, 'dealListObj.total')
                                }}
                            />
                        </div> : null
                    }
                </div>
                {this.state.isDetailPanelShow ? (
                    <DealDetailPanel currDeal={this.state.currDeal} hideDetailPanel={this.hideDetailPanel}/>
                ) : this.state.isDealFormShow ? (
                    <DealForm hideDealForm={this.hideDealForm}/>
                ) : null}
            </div>);
    }
}
export default DealManage;