/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
require('./style/index.less');
import {Button} from 'antd';
import {AntcTable, SearchInput} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import dealAction from './action';
import dealStore from './store';
import DealForm from './views/deal-form';
import DealDetailPanel from './views/deal-detail-panel';
import {DEAL_STATUS} from 'PUB_DIR/sources/utils/consts';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import Trace from 'LIB_DIR/trace';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import classNames from 'classnames';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import {getMyTeamTreeList} from 'PUB_DIR/sources/utils/get-common-data-util';
import {num as antUtilsNum} from 'ant-utils';

const parseAmount = antUtilsNum.parseAmount;
const PAGE_SIZE = 20;
const TOP_NAV_HEIGHT = 64,//头部导航区高度
    TOTAL_HEIGHT = 40,//总数的高度
    TH_HEIGHT = 50;//表头的高度
class DealList extends React.Component {
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
            },
            searchObj: {
                field: '',
                value: ''
            },
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            curShowCustomerId: '',//当前查看的客户详情
            teamList: []//团队列表（列表中的团队根据团队id获取团队名来展示）
        };
    }

    componentDidMount() {
        dealStore.listen(this.onStoreChange);
        this.getTeamList();
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

    getTeamList() {
        getMyTeamTreeList(data => {
            this.setState({
                teamList: data.teamList
            });
        });
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
    //获取搜索订单的body参数
    getSearchBody() {
        let searchBody = {};
        //客户、负责人、阶段的搜索
        let searchObj = this.state.searchObj;
        if (_.get(searchObj, 'value')) {
            //订单阶段的搜索
            if (_.get(searchObj, 'field') === 'sale_stages') {
                let dealQuery = {};
                dealQuery.sale_stages = searchObj.value;
                if (dealQuery.sale_stages === Intl.get('crm.order.status.won', '赢单')) {
                    dealQuery.sale_stages = DEAL_STATUS.WIN;
                } else if (dealQuery.sale_stages === Intl.get('crm.order.status.lost', '丢单')) {
                    dealQuery.sale_stages = DEAL_STATUS.LOSE;
                }
                searchBody.query = dealQuery;
            } else {
                //客户名、负责人的搜索
                let customerQuery = {};
                customerQuery[searchObj.field] = searchObj.value;
                searchBody.parentQuery = {query: customerQuery};
            }
        }
        return searchBody;
    }

    getDealList() {
        let query = {cursor: true};
        if (_.get(this.state, 'dealListObj.lastId')) {
            query.id = this.state.dealListObj.lastId;
        }
        let body = this.getSearchBody();
        let sorter = this.state.sorter;
        dealAction.getDealList({
            page_size: PAGE_SIZE,
            sort_field: sorter.field,
            sort_order: sorter.order
        }, body, query);
    }

    hideRightPanel = () => {
        this.setState({
            curShowCustomerId: ''
        });
    };

    showCustomerDetail = (deal) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.deal-customer-name'), '查看客户详情');
        this.setState({
            curShowCustomerId: deal.customer_id,
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: deal.customer_id,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.hideRightPanel
            }
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };
    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    getDealColumns() {
        return [
            {
                title: Intl.get('common.belong.customer', '所属客户'),
                dataIndex: 'customer_name',
                sorter: true,
                render: (text, record, index) => {
                    let cls = classNames('deal-customer-name', {
                        'customer-name-active': record.customer_id && record.customer_id === this.state.curShowCustomerId
                    });
                    return text ? (
                        <div className={cls}
                            title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                            onClick={this.showCustomerDetail.bind(this, record)}>
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
                    //有小数的预算，四舍五入精确到毛
                    return parseAmount(formatNumHasDotToFixed(text * 10000, 1));
                }
            },
            {
                title: Intl.get('deal.stage', '阶段'),
                dataIndex: 'sale_stages_num',
                className: 'has-filter',
                sorter: true,
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
                sorter: true,
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
        if ((record.id === this.state.currDeal.id) && this.state.isDetailPanelShow) {
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
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('th.has-sorter'), `订单按 ${sorter.field} - ${sorter.order} 排序`);
        this.setState({sorter}, () => {
            dealAction.setLastDealId('');
            setTimeout(() => {
                this.getDealList();
            });
        });
    };

    rowKey(record, index) {
        return record.id;
    }

    renderDealList() {
        let dealListObj = this.state.dealListObj;
        //初次获取数据时展示loading效果
        if (dealListObj.isLoading && (!_.get(dealListObj, 'list[0]'))) {
            return (<Spinner />);
        } else if (_.get(dealListObj, 'list[0]')) {
            let tableHeight = $('body').height() - TOP_NAV_HEIGHT - TOTAL_HEIGHT;
            return (
                <div className="deal-table-container" style={{height: tableHeight}}>
                    <AntcTable
                        rowKey={this.rowKey}
                        rowClassName={this.handleRowClassName}
                        columns={this.getDealColumns()}
                        loading={dealListObj.isLoading && !dealListObj.lastId}
                        dataSource={dealListObj.list}
                        util={{zoomInSortArea: true}}
                        onChange={this.onTableChange}
                        pagination={false}
                        scroll={{y: tableHeight - TH_HEIGHT}}
                        dropLoad={{
                            listenScrollBottom: dealListObj.listenScrollBottom,
                            handleScrollBottom: this.handleScrollBottom,
                            loading: dealListObj.isLoading,
                            showNoMoreDataTip: this.showNoMoreDataTip(),
                            noMoreDataText: Intl.get('deal.no.more.tip', '没有更多订单了')
                        }}
                    />
                </div>);
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无订单');
            if (dealListObj.errorMsg) {
                noDataTip = dealListObj.errorMsg;
            } else if (this.state.searchObj.value) {
                noDataTip = Intl.get('deal.no.filter.deal', '没有符合条件的订单');
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }

    showDealForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-deal-btn'), '点击添加订单按钮');
        this.setState({isDealFormShow: true});
    };

    hideDealForm = () => {
        this.setState({isDealFormShow: false});
    };

    searchEvent = (value, key) => {
        let searchObj = this.state.searchObj;
        if (searchObj.field !== key || _.trim(value) !== searchObj.value) {
            searchObj.field = key;
            searchObj.value = _.trim(value);
            this.setState({searchObj}, () => {
                dealAction.setLastDealId('');
                setTimeout(() => {
                    this.getDealList();
                });
            });
        }
    };

    render() {
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'customer_name'
            },
            {
                name: Intl.get('deal.stage', '阶段'),
                field: 'sale_stages'
            },
            {
                name: Intl.get('crm.6', '负责人'),
                field: 'user_name'
            }
        ];
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <div className="deal-manage-container" data-tracename="订单管理">
                <TopNav>
                    <div className="deal-search-block">
                        <SearchInput
                            type="select"
                            searchFields={searchFields}
                            searchEvent={this.searchEvent}
                            className="btn-item"
                        />
                    </div>
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
                {/*查看该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel>
            </div>);
    }
}
export default DealList;