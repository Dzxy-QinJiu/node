require('../css/main-es_VE.less');
var AppUserUtil = require('../util/app-user-util');
var SearchInput = require('../../../../components/searchInput');
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

var AppUserCustomerSwitch = React.createClass({
    searchInputEvent: function(value) {
        AppUserCustomerSwitchActions.setSearchKeyword(value);
    },
    getCustomerId: function() {
        return this.props.params.customerId;
    },
    changeTableHeight: function() {
        this.setState({
            windowHeight: $(window).height()
        });
    },
    componentDidMount: function() {
        $('body').css('overflow', 'hidden');
        $(window).on('resize', this.changeTableHeight);
        AppUserCustomerSwitchStore.listen(this.onStoreChange);
        TableUtil.alignTheadTbody(this.refs.userListTable);
        this.fetchCustomerUserList();
    },
    fetchCustomerUserList: function(obj) {
        var ajaxObj = {
            num: obj ? obj.customerUserPage : this.state.customerUserPage,
            customer_id: this.getCustomerId(),
            keyword: obj ? obj.searchKeyword : this.state.searchKeyword
        };
        AppUserCustomerSwitchActions.getCustomerUserList(ajaxObj);
    },
    componentDidUpdate: function() {
        TableUtil.alignTheadTbody(this.refs.userListTable);
        this.updateJumpPageByJquery();
    },
    componentWillUnmount: function() {
        $('body').css('overflow', 'auto');
        $(window).off('resize', this.changeTableHeight);
        AppUserCustomerSwitchStore.unlisten(this.onStoreChange);
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
    },
    onStoreChange: function() {
        this.setState(
            AppUserCustomerSwitchStore.getState()
        );
    },
    getInitialState: function() {
        return AppUserCustomerSwitchStore.getState();
    },
    back: function() {
        //返回客户列表
        history.pushState({}, '/crm', {});
    },
    showApplyForm: function() {
        this.setState({
            isShowRightPanel: true
        });
    },
    renderLoadingBlock: function() {
        if(this.state.customerUserListResult !== 'loading') {
            return null;
        }
        return (
            <div className="appuser-list-loading-wrap">
                <Spinner />
            </div>
        );
    },
    getAppNameList: function(apps, rowData) {
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
    },
    getTableColumns: function() {
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
                title: Intl.get('common.app.name', '应用名称'),
                dataIndex: 'apps',
                width: '24%',
                key: 'appName',
                render: function(apps, rowData, idx) {
                    return _this.getAppNameList(apps, rowData);
                }
            }
        ];
        return columns;
    },
    //使用jquery更新跳转到的页面，ant-design有bug，！！！
    updateJumpPageByJquery: function() {
        TableUtil.updatePaginationJumpNewPage(this.refs.tableWrap , this.state.customerUserPage);
    },
    onShowSizeChange: function(current , pageSize) {
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
    },
    getPagination: function() {
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
    },
    getRowSelection: function() {
        return {
            type: 'checkbox',
            onSelect: function(currentRow, isSelected, allSelectedRows) {
                AppUserCustomerSwitchActions.setSelectedCustomerUserRows(allSelectedRows);
            },
            onSelectAll: function(isSelectedAll , allSelectedRows) {
                AppUserCustomerSwitchActions.setSelectedCustomerUserRows(allSelectedRows);
            }
        };
    },
    handleTableChange: function(pagination, filters, sorter) {
        AppUserCustomerSwitchActions.setCustomerUserPage(pagination.current);
    },
    componentWillUpdate: function(nextProps, nextState) {
        if (
            (this.state.customerUserPage != nextState.customerUserPage) ||
            (this.state.searchKeyword != nextState.searchKeyword)
        ) {
            this.fetchCustomerUserList(nextState);
        }
    },
    renderTableBlock: function() {
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
    },
    hideRightPanel: function() {
        this.setState({
            isShowRightPanel: false
        });
    },
    //获取邮箱使用的字段
    getEmailDatas: function() {
        var selectedRows = this.state.selectedCustomerUserRows;

        var email_customer_names = [];
        var email_user_names = [];

        if(!_.isArray(selectedRows)) {
            selectedRows = [];
        }
        _.each(selectedRows , (obj) => {
            email_customer_names.push(obj.customer && obj.customer.customer_name || '');
            email_user_names.push(obj.user && obj.user.user_name || '');
        });
        return {
            email_customer_names: email_customer_names.join('、'),
            email_user_names: email_user_names.join('、')
        };
    },
    render: function() {
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
        var emailData = this.getEmailDatas();
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
                            <div className="inline-block add-btn" onClick={this.showApplyForm}>
                                <ReactIntl.FormattedMessage id="user.user.applies" defaultMessage="用户申请" />
                                
                            </div>
                            <div className="inline-block add-btn" onClick={this.back}>
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
                        emailData={emailData}
                    />
                </RightPanel>
            </div>
        );
    }
});

module.exports = AppUserCustomerSwitch;