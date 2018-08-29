var React = require('react');
require('./css/index.less');
import CommissionPaymentStore from './store/index';
import CommissionPaymentActions from './action/index';
//窗口改变的事件emitter
import {resizeEmitter} from 'PUB_DIR/sources/utils/emitters';
const SearchInput = require('CMP_DIR/searchInput');
import DatePicker from 'CMP_DIR/datepicker';
const SelectFullWidth = require('CMP_DIR/select-fullwidth');
const Spinner = require('CMP_DIR/spinner');
import { RightPanel } from 'CMP_DIR/rightPanel';
import { AntcTable } from 'antc';
import teamAjaxTrans from '../../common/public/ajax/team';
const salesmanAjax = require('../../common/public/ajax/salesman');
import CommissionRightPanel from './views/right-panel';

const searchFields = [
    {
        name: Intl.get('sales.commission.sale.name', '销售名'),
        field: 'user_name'
    },
    {
        name: Intl.get('user.user.team', '团队'),
        field: 'sales_team'
    }
];

const SALES_ROLE = {
    REPRESENTATIVE: Intl.get('sales.commission.role.representative', '销售代表'),
    MANAGER: Intl.get('sales.commission.role.manager', '销售总经理')
};

//用于布局的高度
const LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 62 + 16,
    BOTTOM_DISTANCE: 70
};

const CommissionPayment = React.createClass({
    getInitialState() {
        return {
            containerHeight: $('.commission-payment-panel').height(),
            teamList: [],
            userList: [],
            currentCommission: {},
            isRightPanelShow: false,
            selectedRowIndex: null, // 点击的行索引
            ...CommissionPaymentStore.getState()
        };
    },
    onStoreChange() {
        this.setState(CommissionPaymentStore.getState());
    },
    getTeamList() {
        teamAjaxTrans.getTeamListAjax().sendRequest().success(list => {
            list = _.isArray(list) ? list : [];
            this.setState({teamList: list});
        });
    },
    getUserList() {
        salesmanAjax.getSalesmanListAjax().addQueryParam({with_ketao_member: true}).sendRequest()
            .success(result => {
                if (_.isArray(result)) {
                    let list = [];
                    result.forEach(item => {
                        if (_.isObject(item)) {
                            list.push({
                                user_id: item.user_info.user_id,
                                nick_name: item.user_info.nick_name,
                                group_id: item.user_groups[0].group_id,
                                group_name: item.user_groups[0].group_name
                            });
                        }
                    });

                    this.setState({
                        isGetUserSuccess: true,
                        userList: list
                    });
                }
            })
            .error(() => {
                this.setState({
                    isGetUserSuccess: false,
                });
            })
            .timeout(() => {
                this.setState({
                    isGetUserSuccess: false,
                });
            });
    },
    componentDidMount() {
        $('body').css('overflow', 'hidden');
        //窗口大小改变事件
        resizeEmitter.on(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
        CommissionPaymentStore.listen(this.onStoreChange);
        this.getTeamList();
        this.getUserList();
        this.getCommissionPaymentList();
    },
    componentWillUnmount(){
        $('body').css('overflow', 'auto');
        //卸载窗口大小改变事件
        resizeEmitter.removeListener(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
        CommissionPaymentStore.unlisten(this.onStoreChange);
    },
    resizeHandler(data) {
        this.setState({
            containerHeight: data.height
        });
    },
    // 搜索条件
    searchEvent() {
        let queryParam = this.refs.searchInput.state.formData;
        setTimeout( () => {
            CommissionPaymentActions.setInitialPartlyState();
            this.getCommissionPaymentList(queryParam);
        } );
    },
    // 选择角色
    onSelectedRoleFlagChange(role) {
        CommissionPaymentActions.onSelectedRoleFlagChange(role);
        setTimeout( () => {
            CommissionPaymentActions.setInitialPartlyState();
            this.getCommissionPaymentList({role: this.state.role});
        } );
    },
    // 时间选择
    setSelectDate(start_time, end_time) {
        let timeObj = {
            startTime: start_time,
            endTime: end_time
        };
        CommissionPaymentActions.setSelectDate(timeObj);
        setTimeout( () => {
            CommissionPaymentActions.setInitialPartlyState();
            this.getCommissionPaymentList(timeObj);
        } );
    },
    getParams(params) {
        return {
            page_size: this.state.pageSize,
            sort_field: params && params.sortField || this.state.sortField,
            order: params && params.order || this.state.order,
            id: params && params.lastId || this.state.lastId
        };
    },
    // 获取提成发放列表
    getCommissionPaymentList(queryObj) {
        let params = this.getParams(queryObj);
        let reqData = { query: {} };
        _.extend(reqData.query , this.refs.searchInput.state.formData);
        if (queryObj && queryObj.role || this.state.role) {
            reqData.query.role = queryObj.role || this.state.role;
        }
        const from = queryObj && queryObj.startTime || this.state.startTime;
        const to = queryObj && queryObj.endTime || this.state.endTime;
        reqData.rang_params = [{
            name: 'grant_time',
            type: 'time',
            from: from,
            to: to
        }];
        CommissionPaymentActions.getCommissionPaymentList(params, reqData);
    },
    handleScrollBottom() {
        this.getCommissionPaymentList({
            lastId: this.state.lastId
        });
    },
    showNoMoreDataTip() {
        return !this.state.commissionPaymentList.loading &&
            this.state.commissionPaymentList.data.length >= 10 && !this.state.listenScrollBottom;
    },
    showRightPanel() {
        this.setState({
            isRightPanelShow: true,
            currentCommission: {}
        });
    },
    hideRightPanel() {
        this.setState({
            isRightPanelShow: false
        });
    },
    renderSearchSelectCondition() {
        return (
            <div className="search-select-condition">
                <div className="search-condition">
                    <SearchInput
                        ref="searchInput"
                        type="select"
                        searchFields={searchFields}
                        searchEvent={this.searchEvent}
                    />
                </div>
                <div className="add-commission-item" title={Intl.get('sales.commission.add.record', '添加提成发放')}
                    onClick ={this.showRightPanel}
                >
                    <span className="iconfont icon-add"/>
                </div>
                <div className="time-select">
                    <DatePicker
                        disableDateAfterToday={true}
                        range="quarter"
                        onSelect={this.setSelectDate}
                    >
                        <DatePicker.Option value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                        <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                    </DatePicker>
                </div>
                <div className="role-select">
                    <SelectFullWidth
                        value={this.state.role}
                        onChange={this.onSelectedRoleFlagChange}
                    >
                        <Option value="">{Intl.get('common.all', '全部')}</Option>
                        <Option value={SALES_ROLE.REPRESENTATIVE}>{SALES_ROLE.REPRESENTATIVE}</Option>
                        <Option value={SALES_ROLE.MANAGER}>{SALES_ROLE.MANAGER}</Option>
                    </SelectFullWidth>
                </div>
            </div>
        );
    },
    getCommissionPaymentTableColumns() {
        return [
            {
                title: Intl.get('sales.commission.grant.time', '发放时间'),
                dataIndex: 'grant_time',
                className: 'has-filter',
                sorter: true,
                key: 'grant_time',
                render: (timestamp) => {
                    return (<span>
                        {moment(timestamp).format(oplateConsts.DATE_FORMAT)}
                    </span>);
                }
            }, {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'user_name',
                className: 'has-filter',
                sorter: true,
                key: 'user_name'
            },{
                title: Intl.get('common.role', '角色'), 
                dataIndex: 'role',
                className: 'has-filter',
                sorter: true,
                key: 'role'
            }, {
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                className: 'has-filter',
                sorter: true,
                key: 'sales_team'
            }, {
                title: Intl.get('sales.commission.amount', '提成金额'),
                dataIndex: 'amount',
                className: 'has-filter',
                sorter: true,
                key: 'amount'
            }, {
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'customer_name',
                className: 'has-filter',
                sorter: true,
                key: 'customer_name'
            }, {
                title: Intl.get('common.remark', '备注'),
                dataIndex: 'remark',
                className: 'has-filter',
                sorter: true,
                key: 'remark'
            }
        ];
    },
    handleTableChange(pagination, filters, sorter) {
        const sortOrder = sorter.order || this.state.sortOrder;
        const sortField = sorter.field || this.state.sortField;
        CommissionPaymentActions.setSort({sortField, sortOrder});
        setTimeout( () => {
            CommissionPaymentActions.setInitialPartlyState();
            this.getCommissionPaymentList({
                sort_field: sortField,
                order: sortOrder
            });
        } );
    },
    handleRowClick(record, rowIndex) {
        this.state.selectedRowIndex = rowIndex;
        this.state.currentCommission = record || {};
        this.state.isRightPanelShow = true;
        this.setState(this.state);
    },
    handleRowClassName(record, rowIndex) {
        if ((rowIndex === this.state.selectedRowIndex) && this.state.isRightPanelShow) {
            return 'current-row';
        }
        else {
            return '';
        }
    },
    // 渲染提成发放列表
    renderCommissionPaymentTable() {
        let columns = this.getCommissionPaymentTableColumns();
        let dataSource = this.state.commissionPaymentList.data;
        let isLoading = this.state.commissionPaymentList.loading;
        let doNotShow = false;
        if (isLoading && this.state.lastId === '') {
            doNotShow = true;
        }
        let tableHeight = this.state.containerHeight - LAYOUT_CONSTANTS.TOP_DISTANCE;
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: this.state.commissionPaymentList.loading,
            showNoMoreDataTip: this.showNoMoreDataTip()
        };
        return (
            <div className="commission-payment-list-table-wrap scroll-load"

                style={{display: doNotShow ? 'none' : 'block'}}
            >
                <div className="commission-payment-table-content" style={{ height: tableHeight}}>
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        dataSource={ dataSource }
                        columns={ columns }
                        onChange={this.handleTableChange}
                        onRowClick={this.handleRowClick}
                        rowClassName={this.handleRowClassName}
                        locale={{ emptyText: Intl.get('common.no.data', '暂无数据') }}
                        scroll={{
                            x: 400,
                            y: (tableHeight > 0 ? tableHeight - LAYOUT_CONSTANTS.BOTTOM_DISTANCE : 550)
                        }}
                        util={{
                            zoomInSortArea: true
                        }}
                        pagination={false}
                        bordered
                    />
                </div>
                {
                    this.state.total ?
                        <div className="summary_info">
                            {Intl.get('sales.commission.record', '共{this.state.total}条提成记录', {'total': this.state.total})}
                        </div> : null
                }

            </div>
        );
    },
    renderLoadingBlock() {
        if (!this.state.commissionPaymentList.loading || this.state.lastId) {
            return null;
        }
        return (
            <div className="commission-payment-loading">
                <Spinner />
            </div>
        );
    },
    renderCommissionContent() {
        return (
            <div className="commission-payment-content">
                {this.renderSearchSelectCondition()}
                {this.renderLoadingBlock()}
                {this.renderCommissionPaymentTable()}
            </div>
        );
    },
    addCommission(commission) {
        CommissionPaymentActions.addCommission(commission);
    },
    refreshCurrentCommission(commission) {
        this.setState({
            currentCommission: commission
        });
        CommissionPaymentActions.refreshCurrentCommission(commission);
    },
    deleteCommission(id) {
        CommissionPaymentActions.deleteCommission(id);
    },
    render() {
        return (
            <div className="commission-payment-panel" style={{height: this.state.containerHeight}}>
                {this.renderCommissionContent()}
                <RightPanel className="right-pannel-commission" showFlag={this.state.isRightPanelShow}>
                    {
                        this.state.isRightPanelShow ? (
                            <CommissionRightPanel
                                commission={this.state.currentCommission}
                                teamList={this.state.teamList}
                                userList={this.state.userList}
                                getUserList={this.getUserList}
                                isGetUserSuccess={this.state.isGetUserSuccess}
                                hideRightPanel={this.hideRightPanel}
                                refreshCurrentCommission={this.refreshCurrentCommission}
                                addCommission={this.addCommission}
                                deleteCommission={this.deleteCommission}
                            />
                        ) : null
                    }
                </RightPanel>
            </div>
        );
    }
});

module.exports = CommissionPayment;
