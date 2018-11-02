/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
require('./style/index.less');
import {AntcTable} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import dealAction from './action';
import dealStore from './store';
const PAGE_SIZE = 20;
const TOP_NAV_HEIGHT = 64, TOTAL_HEIGHT = 40;
class DealManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...dealStore.getState(),
            sort_field: 'time',//排序字段,默认：创建时间
            sort_order: 'descend',//倒序

        };
    }

    componentDidMount() {
        dealStore.listen(this.onStoreChange);
        this.getDealList();
    }

    componentWillUnmount() {
        dealAction.setInitData();
        dealStore.unlisten(this.onStoreChange);
    }

    onStoreChange = () => {
        this.setState(dealStore.getState());
    }

    getDealList() {
        let query = {cursor: true};
        if (_.get(this.state, 'dealListObj.lastId')) {
            query.id = this.state.dealListObj.lastId;
        }
        dealAction.getDealList({
            page_size: PAGE_SIZE,
            sort_field: this.state.sort_field,
            sort_order: this.state.sort_order
        }, {}, query);
    }

    getDealColumns() {
        return [
            {
                title: Intl.get('common.definition', '名称'),
                dataIndex: 'customer_name'
            },
            {
                title: Intl.get('deal.budget', '预算(万)'),
                dataIndex: 'budget',
                width: 90,
                align: 'right'
            },
            {
                title: Intl.get('deal.stage', '阶段'),
                dataIndex: 'sale_stages',
                // width: 150,
            },
            {
                title: Intl.get('crm.order.expected.deal', '预计成交'),
                dataIndex: 'predict_finish_text',
                // width: 100,
                render: function(text, record, index) {
                    return text ? moment(text).format(oplateConsts.DATE_FORMAT) : '';
                }
            },
            {
                title: Intl.get('member.create.time', '创建时间'),
                dataIndex: 'time_text',
                // width: 100,
                render: function(text, record, index) {
                    return text ? moment(text).format(oplateConsts.DATE_FORMAT) : '';
                }
            },
            {
                title: Intl.get('crm.6', '负责人'),
                dataIndex: 'user_name',
                // width: 100,
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

    renderDealList() {
        let dealListObj = this.state.dealListObj;
        if (dealListObj.isLoading && !dealListObj.lastId) {
            return (<Spinner />);
        } else if (_.get(dealListObj, 'list[0]')) {
            let tableHeight = $('body').height() - TOP_NAV_HEIGHT - TOTAL_HEIGHT;
            return (
                <AntcTable
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
                />);
        } else {
            return (
                <NoDataIntro noDataTip={dealListObj.errorMsg || Intl.get('deal.no.data', '暂无订单')}/>);
        }
    }

    render() {
        return (
            <div className="deal-manage-container">
                <TopNav></TopNav>
                <div className="deal-manage-content">
                    {this.renderDealList()}
                </div>

            </div>);
    }
}
export default DealManage;