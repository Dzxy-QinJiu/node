var React = require('react');
require('../css/main-es_VE.less');
var AppUserUtil = require('../util/app-user-util');
import {SearchInput} from 'antc';
var AppUserCustomerSwitchActions = require('../action/app-user-customer-switch-actions');
var AppUserCustomerSwitchStore = require('../store/app-user-customer-switch-store');
var TopNav = require('../../../../components/top-nav');
var RightPanel = require('../../../../components/rightPanel').RightPanel;
var RightPanelClose = require('../../../../components/rightPanel').RightPanelClose;
var insertStyle = require('../../../../components/insert-style');
var Spinner = require('../../../../components/spinner');
var TableUtil = require('../../../../components/antd-table-pagination');
import ApplyUser from './v2/apply-user';
var history = require('../../../../public/sources/history');
var Table = require('antd').Table;
var classNames = require('classnames');
import { storageUtil } from 'ant-utils';
var dynamicStyle;
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 113,
    BOTTOM_DISTANCE: 88
};

class AppUserCustomerSwitch extends React.Component {
    state = AppUserCustomerSwitchStore.getState();

    searchInputEvent = (value) => {
        AppUserCustomerSwitchActions.setSearchKeyword(value);
    };

    getCustomerId = () => {
        return this.props.params.customerId;
    };

    changeTableHeight = () => {
        this.setState({
            windowHeight: $(window).height()
        });
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        $(window).on('resize', this.changeTableHeight);
        AppUserCustomerSwitchStore.listen(this.onStoreChange);
        TableUtil.alignTheadTbody(this.refs.userListTable);
        this.fetchCustomerUserList();
    }

    fetchCustomerUserList = (obj) => {
        var ajaxObj = {
            num: obj ? obj.customerUserPage : this.state.customerUserPage,
            customer_id: this.getCustomerId(),
            keyword: obj ? obj.searchKeyword : this.state.searchKeyword
        };
        AppUserCustomerSwitchActions.getCustomerUserList(ajaxObj);
    };

    componentDidUpdate() {
        TableUtil.alignTheadTbody(this.refs.userListTable);
        this.updateJumpPageByJquery();
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        $(window).off('resize', this.changeTableHeight);
        AppUserCustomerSwitchStore.unlisten(this.onStoreChange);
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
    }

    onStoreChange = () => {
        this.setState(
            AppUserCustomerSwitchStore.getState()
        );
    };

    back = () => {
        //返回客户列表
        history.push('/accounts', {});
    };

    showApplyForm = () => {
        this.setState({
            isShowRightPanel: true
        });
    };

    renderLoadingBlock = () => {
        if(this.state.customerUserListResult !== 'loading') {
            return null;
        }
        return (
            <div className="appuser-list-loading-wrap">
                <Spinner />
            </div>
        );
    };

    getAppNameList = (apps, rowData) => {
        var appList = apps.map(function(app, i) {
            return (
                <li key={i}>
                    {app.app_name}
                </li>
            );
        });
        return (
            <ul className="appList">
                {appList}
            </ul>
        );
    };

    getTableColumns = () => {
        var _this = this;
        var columns = [
            {
                title: Intl.get('common.username', '用户名'),
                dataIndex: 'user',
                width: '22%',
                key: 'user_name',
                render: function(user, rowData, idx) {
                    return (
                        <div>
                            {user.user_name}
                            <input type="hidden" className="hidden_user_id" value={user.user_id}/>
                        </div>
                    );
                }
            },
            {
                title: Intl.get('common.belong.customer', '所属客户'),
                dataIndex: 'customer',
                width: '31%',
                key: 'customer_name',
                render: function(customer, rowData, idx) {
                    return (
                        <div>{customer.customer_name}</div>
                    );
                }
            },
            {
                title: Intl.get('common.belong.sales', '所属销售'),
                dataIndex: 'sales',
                width: '23%',
                key: 'sales_name',
                render: function(sales, rowData, idx) {
                    return (
                        <div>{sales.sales_name}</div>
                    );
                }
            },
            {
                title: Intl.get('common.product.name','产品名称'),
                dataIndex: 'apps',
                width: '24%',
                key: 'appName',
                render: function(apps, rowData, idx) {
                    return _this.getAppNameList(apps, rowData);
                }
            }
        ];
        return columns;
    };

    //使用jquery更新跳转到的页面，ant-design有bug，！！！
    updateJumpPageByJquery = () => {
        TableUtil.updatePaginationJumpNewPage(this.refs.tableWrap , this.state.customerUserPage);
    };

    onShowSizeChange = (current, pageSize) => {
        storageUtil.local.set(AppUserUtil.localStorageCustomerViewPageSizeKey , pageSize);
        //改变界面上看到的页数
        AppUserCustomerSwitchActions.setCustomerPageSize(pageSize);
        //计算是否能显示当前页
        var changeToPage = current;
        if(current * pageSize > this.state.customerUserCount) {
            changeToPage = 1;
            AppUserCustomerSwitchActions.setCustomerUserPage(1);
        }
        //重新发请求获取数据
        this.fetchCustomerUserList({
            num: changeToPage
        });
    };

    getPagination = () => {
        var basicConfig = {
            total: this.state.customerUserCount,
            pageSize: this.state.pageSize,
            current: this.state.customerUserPage,
            showSizeChanger: true,
            onShowSizeChange: this.onShowSizeChange
        };
        var page = Math.ceil(basicConfig.total / basicConfig.pageSize);
        if(page > 10) {
            basicConfig.showQuickJumper = true;
        }
        return basicConfig;
    };

    getRowSelection = () => {
        return {
            type: 'checkbox',
            onSelect: function(currentRow, isSelected, allSelectedRows) {
                AppUserCustomerSwitchActions.setSelectedCustomerUserRows(allSelectedRows);
            },
            onSelectAll: function(isSelectedAll , allSelectedRows) {
                AppUserCustomerSwitchActions.setSelectedCustomerUserRows(allSelectedRows);
            }
        };
    };

    handleTableChange = (pagination, filters, sorter) => {
        AppUserCustomerSwitchActions.setCustomerUserPage(pagination.current);
    };

    componentWillUpdate(nextProps, nextState) {
        if (
            (this.state.customerUserPage !== nextState.customerUserPage) ||
            (this.state.searchKeyword !== nextState.searchKeyword)
        ) {
            this.fetchCustomerUserList(nextState);
        }
    }

    renderTableBlock = () => {
        if(this.state.firstLoading) {
            return null;
        }
        var columns = this.getTableColumns();
        var pagination = this.getPagination();
        var rowSelection = this.getRowSelection();
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        dynamicStyle = insertStyle('.app_user_manage_contentwrap .ant-table-body {height:' + tableHeight + 'px;overflow:auto}');
        return (
            <div className="user-list-table-wrap splice-table" ref="tableWrap">
                <Table
                    dataSource={this.state.customerUserList}
                    rowSelection={rowSelection}
                    columns={columns}
                    pagination={pagination}
                    onChange={this.handleTableChange}
                    useFixedHeader
                />
                <div className="summary_info">
                    <ReactIntl.FormattedMessage
                        id="user.total.data"
                        defaultMessage={'共{number}个用户'}
                        values={{
                            'number': this.state.customerUserCount || ' '
                        }}
                    />
                </div>
            </div>
        );
    };

    hideRightPanel = () => {
        this.setState({
            isShowRightPanel: false
        });
    };

    render() {
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
        return (
            <div>
                <div className="app_user_manage_page">
                    <TopNav>
                        <div className="pull-left customer-user-description">
                            {this.props.location.state.customerName}
                            <ReactIntl.FormattedMessage id="user.user.lists" defaultMessage="用户列表" />
                            
                        </div>
                        <div className="pull-right user_manage_filter_block">
                            <div className="inline-block search-input-block customer-switch-search">
                                <SearchInput
                                    searchEvent={this.searchInputEvent}
                                />
                            </div>
                            <div className="inline-block add-btn" onClick={this.showApplyForm} data-tracename="用户详情">
                                <ReactIntl.FormattedMessage id="user.user.applies" defaultMessage="用户申请" />
                                
                            </div>
                            <div className="inline-block add-btn" onClick={this.back} data-tracename="点击返回按钮">
                                <ReactIntl.FormattedMessage id="crm.52" defaultMessage="返回" />
                            </div>
                        </div>
                    </TopNav>
                    <div className="app_user_manage_contentwrap">
                        <div ref="userListTable">
                            {this.renderLoadingBlock()}
                            {this.renderTableBlock()}
                        </div>
                    </div>
                </div>
                <RightPanel className="app_user_manage_rightpanel" showFlag={this.state.isShowRightPanel}>
                    <RightPanelClose onClick={this.hideRightPanel}/>
                    <ApplyUser
                        appList={JSON.parse(storageUtil.local.get('oplateCrmAppList'))}
                        users={this.state.selectedCustomerUserRows}
                        customerId={this.props.params.customerId}
                        cancelApply={this.hideRightPanel}
                    />
                </RightPanel>
            </div>
        );
    }
}

module.exports = AppUserCustomerSwitch;
