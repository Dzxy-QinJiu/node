var React = require('react');
require('./css/index.less');
import SalesCommissionStore from './store/index';
import SalesCommissionActions from './action/index';
import SaleCommissionDetail from './view/sale-commission-detail';
import appAjaxTrans from '../../common/public/ajax/app';
import teamAjaxTrans from '../../common/public/ajax/team';

const LAYOUT_CONSTS = require('LIB_DIR/consts').LAYOUT;
const salesmanAjax = require('../../common/public/ajax/salesman');
//窗口改变的事件emitter
import {resizeEmitter} from 'PUB_DIR/sources/utils/emitters';

import {SearchInput} from 'antc';
import { AntcDatePicker as DatePicker } from 'antc';

const SelectFullWidth = require('CMP_DIR/select-fullwidth');
import RefreshButton from 'CMP_DIR/refresh-button';

const Spinner = require('CMP_DIR/spinner');
import {AntcTable} from 'antc';
import {Row, Col, Checkbox, message} from 'antd';
import SalesCommissionAjax from './ajax/index';
import {handleTableData} from 'CMP_DIR/analysis/export-data-util.js';
import {exportToCsv} from 'LIB_DIR/func';
import AlertTimer from 'CMP_DIR/alert-timer';

const classnames = require('classnames');
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

const responsiveGrid = {
    md: 24,
    lg: 24,
    xl: 12,
    xxl: 12
};

//用于布局的高度
const LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 62 + 16,
    BOTTOM_DISTANCE: 70,
};

const SALES_COMMISSION = {
    TITLE: Intl.get('sales.commission.recalculate', '重新计算提成'),
    SUBMIT: Intl.get('sale.commission.recalculate.submit', '请求处理中...'),
    TIPS: Intl.get('sale.commission.recalculate.tips', '重新计算提成，请于5分钟后查看新的计算结果'),
    WARN: Intl.get('sale.commission.recalculate.warn', '重新计算请求太过频繁，请半小时后再重新计算')
};

class SalesCommission extends React.Component {
    state = {
        containerHeight: $('.row>.col-xs-10') ? ($('.row>.col-xs-10').height() - LAYOUT_CONSTS.TOP_NAV - LAYOUT_CONSTS.PADDING_BOTTOM) : 0,
        appList: [],
        teamList: [],
        userList: [],
        isGetUserSuccess: true,
        ...SalesCommissionStore.getState()
    };

    onStoreChange = () => {
        this.setState(SalesCommissionStore.getState());
    };

    getAppList = () => {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(list => {
            list = _.isArray(list) ? list : [];
            this.setState({appList: list});
        });
    };

    getTeamList = () => {
        teamAjaxTrans.getTeamListAjax().sendRequest().success(list => {
            list = _.isArray(list) ? list : [];
            this.setState({teamList: list});
        });
    };

    getUserList = () => {
        salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
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
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        //窗口大小改变事件
        resizeEmitter.on(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
        SalesCommissionStore.listen(this.onStoreChange);
        this.getTeamList();
        this.getAppList();
        this.getUserList();
        this.getSalesCommissionList();
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        //卸载窗口大小改变事件
        resizeEmitter.removeListener(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
        SalesCommissionActions.setInitialState();//卸载前重置所有数据
        SalesCommissionStore.unlisten(this.onStoreChange);
    }

    resizeHandler = (data) => {
        this.setState({
            containerHeight: data.height,
        });
    };

    // 搜索条件
    searchEvent = () => {
        setTimeout(() => {
            SalesCommissionActions.setInitialPartlyState();
            this.getSalesCommissionList();
        });
    };

    // 选择是否达标
    onSelectedStandardFlagChange = (standardFlag) => {
        SalesCommissionActions.setSelectedStandardFlag(standardFlag);
        setTimeout(() => {
            SalesCommissionActions.setInitialPartlyState();
            this.getSalesCommissionList({remark: this.state.standardFlag});
        });
    };

    // 时间选择
    setSelectDate = (start_time, end_time) => {
        let timeObj = {
            startTime: start_time,
            endTime: end_time
        };
        SalesCommissionActions.setSelectDate(timeObj);
        setTimeout(() => {
            SalesCommissionActions.setInitialPartlyState();
            this.getSalesCommissionList(timeObj);
        });
    };

    getParams = (params) => {
        return {
            page_size: this.state.pageSize,
            sort_field: params && params.sortField || this.state.sortField,
            order: params && params.order || this.state.order,
            id: params && params.lastId || this.state.lastId
        };
    };

    // 获取销售提成列表
    getSalesCommissionList = (queryObj) => {
        let params = this.getParams(queryObj);
        let reqData = {query: {remark: this.state.standardFlag}};// 默认情况下，是显示达标的
        _.extend(reqData.query, this.refs.searchInput.state.formData);
        const from = queryObj && queryObj.startTime || this.state.startTime;
        const to = queryObj && queryObj.endTime || this.state.endTime;
        reqData.rang_params = [{
            name: 'end_time',
            type: 'time',
            from: from,
            to: to
        }];
        SalesCommissionActions.getSalesCommissionList(params, reqData);
    };

    handleScrollBottom = () => {
        this.getSalesCommissionList({
            lastId: this.state.lastId
        });
    };

    showNoMoreDataTip = () => {
        return !this.state.salesCommissionList.loading &&
            this.state.salesCommissionList.data.length >= 10 && !this.state.listenScrollBottom;
    };

    handleTableChange = (pagination, filters, sorter) => {
        const sortOrder = sorter.order || this.state.sortOrder;
        const sortField = sorter.field || this.state.sortField;
        SalesCommissionActions.setSort({sortField, sortOrder});
        setTimeout(() => {
            SalesCommissionActions.setInitialPartlyState();
            this.getSalesCommissionList({
                sort_field: sortField,
                order: sortOrder
            });
        });
    };

    handleRowClick = (record, index) => {
        let userInfo = {
            userId: record.user_id,
            userName: record.user_name
        };
        SalesCommissionActions.getUserInfo(userInfo);
    };

    handleRowClassName = (record, index) => {
        if (record.user_id === this.state.userId) {
            return 'current-row';
        }
        else {
            return '';
        }
    };

    // 重新计算销售提成
    setRecalculateTips = (messageObj) => {
        SalesCommissionActions.setRecalculateTips(messageObj);
    };

    handleRefresh = () => {
        this.setRecalculateTips({message: SALES_COMMISSION.SUBMIT, type: 'info'});
        let queryObj = {
            start_time: this.state.startTime,
            end_time: this.state.endTime
        };
        SalesCommissionAjax.recalculateSaleCommission(queryObj).then((result) => {
            if (result) {
                this.setRecalculateTips({message: SALES_COMMISSION.TIPS, type: 'success'});
                setTimeout(() => {
                    SalesCommissionActions.setInitialPartlyState();
                    this.getSalesCommissionList();
                }, 5 * 60 * 1000);
            } else {
                this.setRecalculateTips({message: SALES_COMMISSION.WARN, type: 'warning'});
            }
        }, () => {
            this.setRecalculateTips({message: SALES_COMMISSION.WARN, type: 'warning'});
        });
    };

    HideRecalculateSalesTips = () => {
        SalesCommissionActions.setRecalculateTips({message: '', type: ''});
    };

    renderSearchSelectCondition = () => {
        let dataSource = this.state.salesCommissionList.data;
        const exportClass = classnames('export-file', {'no-show-export-button': !dataSource.length});
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
                {dataSource.length ? (
                    <div className={exportClass} onClick={this.exportTableData} title={Intl.get('common.export', '导出')}>
                        <i className="iconfont icon-export"></i>
                    </div>) : null}
                <div className="time-select">
                    <DatePicker
                        disableDateAfterToday={true}
                        range="quarter"
                        onSelect={this.setSelectDate}
                    >
                        <DatePicker.Option
                            value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                        <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                    </DatePicker>
                </div>
                <div className="standard-select">
                    <SelectFullWidth
                        value={this.state.standardFlag}
                        onChange={this.onSelectedStandardFlagChange}
                    >
                        <Option value="">{Intl.get('common.all', '全部')}</Option>
                        <Option value="true">{Intl.get('sales.commission.standard', '达标')}</Option>
                        <Option value="false">{Intl.get('sales.commission.substandard', '不达标')}</Option>
                    </SelectFullWidth>
                </div>
                <div className="refresh-commission">
                    <RefreshButton handleRefresh={this.handleRefresh} title={SALES_COMMISSION.TITLE}/>
                    {this.state.recalculateTips.message ? (
                        <AlertTimer
                            time={this.state.recalculateTips.type === 'info' ? 6000 : 3000}
                            message={this.state.recalculateTips.message}
                            type={this.state.recalculateTips.type}
                            showIcon
                            onHide={this.HideRecalculateSalesTips}
                        />
                    ) : null}
                </div>
            </div>
        );
    };

    getSalesTableColumns = () => {
        return [
            {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'user_name',
                className: 'has-filter',
                width: '10%',
                sorter: true,
                key: 'user_name'
            }, {
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                className: 'has-filter',
                width: '10%',
                sorter: true,
                key: 'sales_team'
            }, {
                title: Intl.get('sales.commission.gross.baseline', '毛利基线'),
                dataIndex: 'sales_goal_amount',
                className: 'has-filter number-value',
                width: '15%',
                sorter: true,
                key: 'sales_goal_amount'
            }, {
                title: Intl.get('contract.29', '回款毛利'),
                dataIndex: 'gross_profit',
                className: 'has-filter number-value',
                width: '15%',
                sorter: true,
                key: 'gross_profit'
            }, {
                title: Intl.get('contract.133', '费用'),
                dataIndex: 'cost',
                className: 'has-filter number-value',
                sorter: true,
                width: '10%',
                key: 'cost'
            }, {
                title: Intl.get('sales.commission.sent.commission', '已发提成'),
                dataIndex: 'sent_commission',
                className: 'has-filter number-value',
                width: '15%',
                sorter: true,
                key: 'sent_commission'
            }, {
                title: Intl.get('sales.commission.this.commission', '本次提成'),
                dataIndex: 'commission',
                className: 'has-filter number-value',
                width: '15%',
                sorter: true,
                key: 'commission'
            }, {
                title: Intl.get('sales.commission.grant', '已发放'),
                dataIndex: 'grant',
                className: 'has-filter',
                width: '10%',
                key: 'grant',
                render: (grant, rowData, idx) => {
                    let checkedFlag = grant === 'yes';
                    return (<span>
                        <Checkbox checked={checkedFlag} onChange={this.handleChangeGrant.bind(this, rowData)}/>
                    </span>);
                }
            }
        ];
    };

    // 处理已发放的状态
    handleChangeGrant = (rowData, event) => {
        let grant = event.target.checked === true ? 'yes' : 'no';
        rowData.grant = grant;
        SalesCommissionActions.updateSaleCommission(rowData);
    };

    exportTableData = () => {
        let columns = this.getSalesTableColumns();
        let data = this.state.salesCommissionList.data;
        let exportData = handleTableData(data, columns);
        exportToCsv('sales_commission_table.csv', exportData);
    };

    // 渲染销售提成列表
    renderSalesCommissionTable = () => {
        let columns = this.getSalesTableColumns();
        let dataSource = this.state.salesCommissionList.data;
        let isLoading = this.state.salesCommissionList.loading;
        let doNotShow = false;
        if (isLoading && this.state.lastId === '') {
            doNotShow = true;
        }
        let tableHeight = this.state.containerHeight - LAYOUT_CONSTANTS.TOP_DISTANCE;
        // 上下布局时，同一屏内需要显示列表和明细两个表格，因此需重新计算列表表格的高度，以便能展示开
        if ($(window).width() < Oplate.layout['screen-xxl']) {
            tableHeight /= 2;
        }
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: this.state.salesCommissionList.loading,
            showNoMoreDataTip: this.showNoMoreDataTip()
        };
        return (
            <div className="sales-commission-list-table-wrap scroll-load"

                style={{display: doNotShow ? 'none' : 'block'}}
            >
                <div className="sales-table-content">
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        dataSource={dataSource}
                        columns={columns}
                        onChange={this.handleTableChange}
                        onRowClick={this.handleRowClick}
                        rowClassName={this.handleRowClassName}
                        locale={{emptyText: Intl.get('common.no.data', '暂无数据')}}
                        scroll={{
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
    };

    renderLoadingBlock = () => {
        if (!this.state.salesCommissionList.loading || this.state.lastId) {
            return null;
        }
        return (
            <div className="sales-commission-loading">
                <Spinner/>
            </div>
        );
    };

    renderSaleContent = () => {
        return (
            <div className="sales-content">
                {this.renderSearchSelectCondition()}
                {this.renderLoadingBlock()}
                {this.renderSalesCommissionTable()}
            </div>
        );
    };

    render() {
        const updateSaleGrantErrMsg = this.state.updateSaleGrantErrMsg;
        if (updateSaleGrantErrMsg) {
            message.error(updateSaleGrantErrMsg);
        }
        let height = this.state.containerHeight - LAYOUT_CONSTANTS.TOP_DISTANCE;
        // 上下布局时，同一屏内需要显示列表和明细两个表格，因此需重新计算明细表格的高度，以便能展示开
        if ($(window).width() < Oplate.layout['screen-xxl']) {
            height -= $('.sales-content').height();
        }
        return (
            <div className="sales-commission-panel" style={{height: this.state.containerHeight}}>
                <Row>
                    <Col md={responsiveGrid.md} lg={responsiveGrid.lg} xl={responsiveGrid.xl} xxl={responsiveGrid.xxl}>
                        {this.renderSaleContent()}
                    </Col>
                    <Col md={responsiveGrid.md} lg={responsiveGrid.lg} xl={responsiveGrid.xl} xxl={responsiveGrid.xxl}>
                        <SaleCommissionDetail
                            userId={this.state.userId}
                            startTime={this.state.startTime}
                            endTime={this.state.endTime}
                            userName={this.state.userName}
                            height={height}
                            grantStatus={this.state.grantStatus}
                            appList={this.state.appList}
                            teamList={this.state.teamList}
                            userList={this.state.userList}
                            getUserList={this.getUserList}
                            isGetUserSuccess={this.state.isGetUserSuccess}
                        />
                    </Col>
                </Row>

            </div>
        );
    }
}

module.exports = SalesCommission;
