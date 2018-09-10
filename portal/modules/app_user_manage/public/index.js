var React = require('react');
var language = require('../../../public/language/getLanguage');
require('./css/main-zh_CN.less');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/main-es_VE.less');
}
import RecentLoginUsersPanel from './views/recent-login-user-list';
import { RightPanelReturn } from 'CMP_DIR/rightPanel';
var RightPanel = require('../../../components/rightPanel').RightPanel;
//顶部导航
var TopNav = require('../../../components/top-nav');

var AppUserStore = require('./store/app-user-store');
var AppUserPanelSwitchStore = require('./store/app-user-panelswitch-store');
var AppUserAction = require('./action/app-user-actions');
var AppUserUtil = require('./util/app-user-util');

var UserView = require('./views/user-view');
var UserDetail = require('./views/user-detail');
import AddOrEditUser from './views/v2/add-or-edit-user';
var UserAuditLog = require('./views/user-audit-log-show-user-detail');

var Select = require('antd').Select;
var Icon = require('antd').Icon;
import {SearchInput} from 'antc';
var Option = Select.Option;
var classNames = require('classnames');
import UserDetailAddApp from './views/user-detail-add-app';
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var ShareObj = require('./util/app-id-share-util');
var FilterBtn = require('../../../components/filter-btn');
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
var SelectFullWidth = require('../../../components/select-fullwidth');
var Popover = require('antd').Popover;
import { Button } from 'antd';
import ApplyUser from './views/v2/apply-user';
var topNavEmitter = require('../../../public/sources/utils/emitters').topNavEmitter;
import queryString from 'query-string';

/*用户管理界面外层容器*/
class AppUserManage extends React.Component {
    getStoreData = () => {
        var AppUserStoreData = AppUserStore.getState();
        var AppUserPanelSwitchStoreData = AppUserPanelSwitchStore.getState();
        return {
            ...AppUserStoreData,
            ...AppUserPanelSwitchStoreData,
            customer_name: this.props.customer_name//从客户页面跳转过来传过的客户名字
        };
    };

    onStoreChange = () => {
        this.setState(this.getStoreData());
    };

    //记住上一次路由
    prevRoutePath = null;

    componentDidMount() {
        AppUserStore.listen(this.onStoreChange);
        AppUserPanelSwitchStore.listen(this.onStoreChange);
        //当前视图
        var currentView = AppUserUtil.getCurrentView();
        //获取所有应用
        AppUserAction.getAppList();
        if (currentView === 'user' && this.props.location) {
            const query = queryString.parse(this.props.location.search);
            //从销售首页，点击试用用户和正式用户过期用户数字跳转过来
            var app_id = this.props.location.state && this.props.location.state.app_id;
            var _this = this;
            //有客户名时，直接按照客户名查询，应用选中全部
            if (this.props.history.action === 'PUSH') {
                //针对不同情况，查询用户列表
                if (app_id) {
                    //从销售首页点击过期用户数字跳转过来时，有app_id
                    var reqObj = {
                        app_id: app_id,
                        user_type: _this.props.location.state && _this.props.location.state.user_type,
                        start_date: _this.props.location.state && _this.props.location.state.start_date,
                        end_date: _this.props.location.state && _this.props.location.state.end_date,
                        page_size: _this.props.location.state && _this.props.location.state.page_size,
                        sales_id: _this.props.location.state && _this.props.location.state.sales_id,
                        team_ids: _this.props.location.state && _this.props.location.state.team_ids,
                        stopScroll: true
                    };
                    AppUserAction.getAppUserList(reqObj);
                } else {
                    //顶部不同tab之间切换时
                    //查询所有用户
                    AppUserAction.getAppUserList();
                }
            } else {
                //如果是从统计分析点击某个图转过来的
                if (query.analysis_filter_field) {
                    AppUserAction.setSelectedAppId(query.app_id);
                    const filterField = query.analysis_filter_field;
                    const filterValue = query.analysis_filter_value;
                    delete query.analysis_filter_field;
                    delete query.analysis_filter_value;

                    for (let key in query) {
                        AppUserAction.toggleSearchField({ field: key, value: query[key] });
                    }

                    if (filterField === 'team_ids') {
                        if (filterValue === 'unknown') {
                            AppUserAction.toggleSearchField({ field: 'is_filter_unknown_team', value: true });
                        }
                        AppUserAction.getTeamLists(teams => {
                            const team = _.find(teams, item => item.group_name === filterValue);
                            const teamId = team && team.group_id || '';
                            AppUserAction.toggleSearchField({ field: filterField, value: teamId });
                            setTimeout(() => {
                                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST);
                            });
                        });
                    } else if (filterField === 'sales_id') {
                        //通过销售首页点击团队成员统计图转过来的，查看某个销售对应的用户列表
                        AppUserAction.toggleSearchField({ field: filterField, value: filterValue });
                        setTimeout(() => {
                            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST);
                        });
                    }
                } else {
                    // 点击刷新按钮时
                    //查询所有用户
                    AppUserAction.getAppUserList();
                    //查询团队列表
                    AppUserAction.getTeamLists();
                }
            }
        } else if (currentView === 'user' && this.props.customer_id) {
            //在客户详情中查看某个客户下的用户
            var customer_id = this.props.customer_id;
            //按照客户名进行查询
            AppUserAction.getAppUserList({
                //传递客户id
                customer_id: customer_id,
            });
        }
        //记住上一次路由
        this.prevRoutePath = currentView;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.customer_id && this.state.customer_id !== nextProps.customer_id) {
            this.setState({
                customer_id: nextProps.customer_id,
                customer_name: nextProps.customer_name
            });
            AppUserAction.getAppUserList({
                //传递客户id
                customer_id: nextProps.customer_id,
                page_size: nextProps.user_size
            });
        }
    }

    componentDidUpdate() {
        //如果当前路由是用户，上一次路由是用户审批时，重新获取应用列表
        var currentRoutePath = AppUserUtil.getCurrentView();
        if (currentRoutePath === 'user' && this.prevRoutePath && this.prevRoutePath !== 'user') {
            //获取全部应用
            AppUserAction.getAppList();
            //查询所有用户
            let quryObj = {
                app_id: ShareObj.app_id || ''
            };
            //如果有选择的应用，则默认按创建时间排序
            if (ShareObj.app_id) {//用户列表，选择某个应用后，切换到审计日志再回来时，列表需要排序
                quryObj.sort_field = 'grant_create_date';
                quryObj.sort_order = 'desc';
            }
            AppUserAction.changeTableSort(quryObj);
            AppUserAction.getAppUserList(quryObj);
            //顶部导航输入框的值清空
            this.refs.searchInput.refs.searchInput.value = '';
        }
        this.prevRoutePath = AppUserUtil.getCurrentView();
    }

    componentWillUnmount() {
        AppUserStore.unlisten(this.onStoreChange);
        AppUserPanelSwitchStore.unlisten(this.onStoreChange);
        ShareObj.app_id = '';
        ShareObj.share_app_list = [];
    }

    addAppUser = (e) => {
        Trace.traceEvent(e, '添加用户');
        AppUserAction.showAppUserForm();
        return e.stopPropagation();
    };

    //显示用户表单
    showAddUserForm = () => {
        AppUserAction.showAppUserForm();
    };

    getAppOptions = () => {
        var appList = this.state.appList;
        if (!_.isArray(appList) || !appList.length) {
            if (_.isArray(ShareObj.share_app_list) && ShareObj.share_app_list.length) {
                appList = ShareObj.share_app_list;
            } else {
                appList = [];
            }
        }
        var list = appList.map(function(item) {
            return <Option key={item.app_id} value={item.app_id} title={item.app_name}>{item.app_name}</Option>;
        });
        list.unshift(<Option value="" key="all" title={Intl.get('user.app.all', '全部应用')}><ReactIntl.FormattedMessage
            id="user.app.all" defaultMessage="全部应用" /></Option>);
        return list;
    };

    onSelectedAppChange = (app_id, app_name) => {
        //原来的应用id
        const oldSelectAppId = this.state.selectedAppId;
        //设置当前选中应用
        AppUserAction.setSelectedAppId(app_id);
        //用户列表滚动条置顶
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.CHANGE_USER_LIST_SCROLL_TOP, 0);
        //当前用户有按照角色筛选的权限,如果有app_id，获取该应用对应角色信息
        if (app_id && this.state.filterRoles.shouldShow) {
            AppUserAction.getRolesByAppId(app_id);
        }
        //延迟搜索，等待界面改变搜索参数
        setTimeout(() => {
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST);
        });
        this.appsSelectorLayout();
    };

    //显示申请用户的表单
    showApplyUserForm = () => {
        AppUserAction.showApplyUserForm();
    };

    searchTimeout = null;

    doSearch = (obj) => {
        clearTimeout(this.searchTimeout);
        var _this = this;
        this.searchTimeout = setTimeout(function() {
            //搜索参数
            var queryObj = {
                //从第一页开始查
                id: '',
                keyword: obj.keyword || ''
            };
            //清空下拉加载的用户id
            AppUserAction.setLastUserId('');
            //滚动条置顶
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.CHANGE_USER_LIST_SCROLL_TOP, 0);
            //查询列表
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST, queryObj);
        }, 500);
    };

    onSearchInputChange = (keyword) => {
        keyword = keyword ? keyword : '';
        if (keyword.trim() !== this.state.keywordValue.trim()) {
            AppUserAction.keywordValueChange(keyword);
            this.doSearch({
                keyword: keyword
            });
        }
    };

    //切换筛选状态
    toggleFilterArea = (e) => {
        Trace.traceEvent(e, '点击筛选按钮');
        AppUserAction.toggleFilterExpanded();
    };

    //是否有添加用户按钮
    addUserBtnCheckun = () => {
        return hasPrivilege('APP_USER_ADD') && !this.state.customer_id;
    };

    //销售选择用户的提示
    getUserRowsTooltip = () => {
        return <span><ReactIntl.FormattedMessage id="user.user.list.click" defaultMessage="请在用户列表中点击" /><i
            className="iconfont icon-radio"
            style={{ fontSize: '20px', verticalAlign: 'middle', position: 'relative', top: '-3px' }} /><ReactIntl.FormattedMessage
            id="user.user.list.select" defaultMessage="选择用户" /></span>;
    };

    //发邮件使用的参数
    getEmailData = () => {
        var selectedRows = this.state.selectedUserRows;

        var email_customer_names = [];
        var email_user_names = [];

        if (!_.isArray(selectedRows)) {
            selectedRows = [];
        }
        _.each(selectedRows, (obj) => {
            email_customer_names.push(obj.customer && obj.customer.customer_name || '');
            email_user_names.push(obj.user && obj.user.user_name || '');
        });
        return {
            email_customer_names: email_customer_names.join('、'),
            email_user_names: email_user_names.join('、')
        };
    };

    showBatchOperate = (e) => {
        Trace.traceEvent(e, '已有用户-批量变更');
        AppUserAction.showBatchOperate();
    };

    //获取缩放时候的批量操作按钮
    getBatchOperateBtnMini = () => {
        if (this.isShowBatchOperateBtn()) {
            if (this.state.selectedUserRows.length) {
                return <div className="inline-block add-btn-mini" onClick={this.showBatchOperate}>
                    <i className="iconfont icon-piliangcaozuo" />
                </div>;
            }
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block add-btn-mini gray">
                    <i className="iconfont icon-piliangcaozuo" />
                </div>
            </Popover>;
        }
        return null;
    };

    //是否显示批量变更按钮
    isShowBatchOperateBtn = () => {
        //当前视图
        let currentView = AppUserUtil.getCurrentView();
        //是否是从某个客户详情中跳转过来的
        let isCustomerDetailJump = currentView === 'user' && this.props.customer_id;
        //管理员：可以进行批量变更，销售：从某个客户详情中跳转过来时，可以批量变更（销售只可以批量操作同一客户下的用户）
        return hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.ADMIN) || (isCustomerDetailJump && hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES));
    };

    //显示批量操作按钮
    getBatchOperateBtn = () => {
        //管理员直接显示
        //销售需要从某个客户详情中跳转过来时，才可以展示
        if (this.isShowBatchOperateBtn()) {
            //如果选择了用户，直接显示
            if (this.state.selectedUserRows.length) {
                return <div className="inline-block">
                    <Button className="btn-item" onClick={this.showBatchOperate}>
                        {Intl.get('user.batch.change', '批量变更')}
                    </Button></div>;
            }
            //没有选择用户，加一个提示
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block add-btn-common gray">
                    <Button className="btn-item">
                        {Intl.get('user.batch.change', '批量变更')}
                    </Button>
                </div>
            </Popover>;
        }
        return null;
    };

    //显示申请用户按钮
    getApplyUserBtn = () => {
        //销售显示开通应用
        if (hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES) && this.state.customer_id) {
            //选中了用户直接显示
            if (this.state.selectedUserRows.length) {
                return <div className="inline-block add-btn-common " onClick={this.showApplyUserForm}>
                    <Button className="btn-item"><ReactIntl.FormattedMessage id="user.app.open" defaultMessage="开通应用" /></Button>
                </div>;
            }
            //没选中用户加提示
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block   gray">
                    <span><ReactIntl.FormattedMessage id="user.app.open" defaultMessage="开通应用" /></span>
                </div>
            </Popover>;
        }
        return null;
    };

    //显示缩放时候的开通应用按钮
    getApplyUserBtnMini = () => {
        if (hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES) && this.state.customer_id) {
            if (this.state.selectedUserRows.length) {
                return <div className="inline-block  add-btn-mini" onClick={this.showApplyUserForm}>
                    <i className="iconfont icon-shenqing" />
                </div>;
            }
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block  add-btn-mini gray">
                    <i className="iconfont icon-shenqing" />
                </div>
            </Popover>;
        }
        return null;
    };

    //当应用列表重新布局的时候，让顶部导航重新渲染
    appsSelectorLayout = () => {
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    };

    showRecentLoginPanel = (e) => {
        Trace.traceEvent(e, '打开查看近期登陆用户列表');
        AppUserAction.setRecentLoginPanelFlag(true);
    };

    hideRecentLoginPanel = (e) => {
        Trace.traceEvent(e, '关闭查看近期登录用户列表');
        AppUserAction.setRecentLoginPanelFlag(false);
    };

    //关闭属于某个客户的用户列表
    hideCustomerUserList = () => {
        this.props.hideCustomerUserList();
        //清空数据
        AppUserAction.setInitialData();
    };

    //获取初始状态
    state = this.getStoreData();

    render() {
        var currentView = AppUserUtil.getCurrentView();
        var appOptions = this.getAppOptions();
        var rightPanelView = null;
        if (this.state.isShowRightPanel) {
            switch (this.state.rightPanelType) {
                case 'detail':
                    rightPanelView = (
                        <UserDetail userId={this.state.detailUser.user.user_id}
                            appLists={this.state.detailUser.apps}
                            isShownExceptionTab={this.state.detailUser.isShownExceptionTab}
                            selectedAppId={this.state.selectedAppId}

                        />
                    );
                    break;
                case 'addOrEditUser':
                    rightPanelView = (
                        <AddOrEditUser operation_type={this.state.appUserFormType} />
                    );
                    break;
                case 'batch':
                    rightPanelView = (
                        <div className="full_size wrap_padding">
                            <UserDetailAddApp multiple={true} initialUser={this.state.selectedUserRows} />
                        </div>
                    );
                    break;
                case 'applyUser':
                    //发邮件使用的数据
                    var emailData = this.getEmailData();
                    //应用列表
                    var appListTransform = this.state.appList.map((obj) => {
                        return {
                            client_id: obj.app_id,
                            client_name: obj.app_name,
                            client_image: obj.app_logo
                        };
                    });
                    rightPanelView = (
                        <ApplyUser
                            appList={appListTransform}
                            users={this.state.selectedUserRows}
                            customerId={this.state.customer_id}
                            cancelApply={AppUserAction.closeRightPanel}
                            emailData={emailData}
                        />
                    );
            }
        }
        var topNavRightClass = classNames({
            'pull-right': true,
            'user_manage_filter_block': true,
            'none': currentView !== 'user'
        });
        var topNavLeftClass = classNames({
            'pull-left': true,
            'user_manage_return_block': true
        });

        var showView = null;
        switch (currentView) {
            case 'user':
                showView = (<UserView customer_id={this.state.customer_id} />);
                break;
            case 'log':
                showView = (<UserAuditLog />);
                break;
        }
        //是否显示“过滤”按钮
        var showFilterBtn = this.state.selectedAppId;
        const cls = classNames('app_user_manage_rightpanel white-space-nowrap right-panel', {
            'detail-v3-panel': this.state.rightPanelType === 'detail'
        });
        return (
            <div>
                <div className="app_user_manage_page table-btn-fix" data-tracename="用户管理">
                    <TopNav>
                        <TopNav.MenuList />
                        {/*如果是从客户页面跳转过来的，增加一个返回按钮*/}
                        {this.state.customer_id ?
                            <div className={topNavLeftClass}>
                                <RightPanelReturn onClick={this.hideCustomerUserList} />
                                <div className="customer_name_wrap">
                                    {Intl.get('crm.customer.user', '{customer}客户的用户', { 'customer': this.state.customer_name })}
                                </div>
                            </div>
                            : null}
                        <div className={topNavRightClass} data-tracename="已有用户">
                            {
                                showFilterBtn ? <FilterBtn
                                    expanded={this.state.filterAreaExpanded}
                                    onClick={this.toggleFilterArea}
                                    className="inline-block app_user_filter_btn"
                                /> : null
                            }
                            <div className="inline-block btn-item">
                                <SelectFullWidth
                                    optionFilterProp="children"
                                    showSearch
                                    minWidth={120}
                                    value={this.state.selectedAppId}
                                    onChange={this.onSelectedAppChange}
                                    notFoundContent={!appOptions.length ? Intl.get('user.no.app', '暂无应用') : Intl.get('user.no.related.app', '无相关应用')}
                                >
                                    {appOptions}
                                </SelectFullWidth>
                            </div>
                            {/*如果是从客户界面点击过来的，不要显示搜索框*/}
                            {/*如果是按照角色筛选，则不能再按照关键字搜索了*/}
                            {
                                this.state.customer_id || this.state.filterRoles.selectedRole ? null : (
                                    <div className="inline-block btn-item user_manage_droplist">
                                        <SearchInput
                                            ref="searchInput"
                                            type="input"
                                            searchPlaceHolder={Intl.get('user.search.placeholder', '请输入关键词搜索')}
                                            searchEvent={this.onSearchInputChange}
                                        />
                                    </div>
                                )
                            }
                            {!Oplate.hideSomeItem && !this.state.customer_id ?
                                <PrivilegeChecker
                                    onClick={this.showRecentLoginPanel}
                                    check="APP_USER_LIST"
                                    className="inline-block recent-login-btn btn-item float-r btn-m-r-2">
                                    <span className="iconfont icon-online recent-login-user-btn" title="查看近期登录用户列表" />
                                </PrivilegeChecker> : null}
                            <PrivilegeChecker
                                onClick={this.addAppUser}
                                check={this.addUserBtnCheckun}
                                className="inline-block add-btn-common">
                                <Button className="btn-item"><ReactIntl.FormattedMessage id="user.user.add" defaultMessage="添加用户" /></Button>
                            </PrivilegeChecker>
                            {this.getApplyUserBtn()}
                            {this.getBatchOperateBtn()}
                            <PrivilegeChecker
                                onClick={this.addAppUser}
                                check={this.addUserBtnCheckun}
                                title={Intl.get('user.user.add', '添加用户')}
                                className="inline-block add-btn-mini">
                                <Icon type="plus" />
                            </PrivilegeChecker>
                            {this.getApplyUserBtnMini()}
                            {this.getBatchOperateBtnMini()}
                        </div>
                    </TopNav>
                    <div className="app_user_manage_contentwrap">
                        {
                            showView
                        }
                    </div>

                </div>
                <RightPanel className={cls}
                    showFlag={this.state.isShowRightPanel}>
                    {
                        rightPanelView
                    }
                </RightPanel>
                <RightPanel
                    className="recent_login_users_panel"
                    showFlag={this.state.isShowRecentLoginPanel}
                    data-tracename="查看近期登录用户列表"
                >
                    {this.state.isShowRecentLoginPanel ? (<RecentLoginUsersPanel
                        teamlists={this.state.filterTeams.teamlists}
                        teamTreeList={this.state.teamTreeList}
                        selectedAppId={this.state.selectedAppId}
                        appList={this.state.appList}
                        hideRecentLoginPanel={this.hideRecentLoginPanel} />) : null}
                </RightPanel>
            </div>
        );
    }
}

module.exports = AppUserManage;

