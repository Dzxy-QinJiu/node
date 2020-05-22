var language = require('../../../public/language/getLanguage');
require('./css/main-zh_CN.less');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/main-es_VE.less');
}
import RecentLoginUsersPanel from './views/recent-login-user-list';
import {RightPanelReturn} from 'CMP_DIR/rightPanel';

var RightPanel = require('../../../components/rightPanel').RightPanel;
var AppUserStore = require('./store/app-user-store');
var AppUserPanelSwitchStore = require('./store/app-user-panelswitch-store');
var AppUserAction = require('./action/app-user-actions');

var AppUserUtil = require('./util/app-user-util');

var UserView = require('./views/user-view');
import AddOrEditUser from './views/v2/add-or-edit-user';

var UserAuditLog = require('./views/user-audit-log-show-user-detail');

import {Icon, Button, Popover, message} from 'antd';
import {SearchInput, AntcSelect} from 'antc';
const Option = AntcSelect.Option;

var classNames = require('classnames');
import BatchChangeUser from './views/batch-change-user';

var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var ShareObj = require('./util/app-id-share-util');
var FilterBtn = require('../../../components/filter-btn');
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
var SelectFullWidth = require('../../../components/select-fullwidth');
import ApplyUser from './views/v2/apply-user';
import { topNavEmitter, selectedAppEmitter } from 'PUB_DIR/sources/utils/emitters';
import queryString from 'query-string';
import {RETRY_GET_APP} from './util/consts';
import Trace from 'LIB_DIR/trace';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import {getIntegrationConfig, getProductList, uniqueObjectOfArray} from 'PUB_DIR/sources/utils/common-data-util';
import {isOplateUser, isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import IntegrateConfigView from './views/integrate-config/index';
import TopNav from 'CMP_DIR/top-nav';
import ImportUser from './views/import';
import {XLS_FILES_TYPE_RULES} from 'PUB_DIR/sources/utils/consts';
import userData from 'PUB_DIR/sources/user-data';
import BackMainPage from 'CMP_DIR/btn-back';
import userManagePrivilege from './privilege-const';
import commonPrivilegeConst from 'MOD_DIR/common/public/privilege-const';
import SelectAppTerminal from 'CMP_DIR/select-app-terminal';

const UPLOAD_USER_TIPS = {
    EXIST: 'data exist', // （用户名、邮箱 ）已存在
    ILLEGAL: 'data illegal', // （用户名、邮箱、手机号）不合法
    UNEXIST: 'data unexist' // 客户名称不匹配
};

/*用户管理界面外层容器*/
class AppUserManage extends React.Component {

    getStoreData = () => {
        var AppUserStoreData = AppUserStore.getState();
        var AppUserPanelSwitchStoreData = AppUserPanelSwitchStore.getState();
        return {
            ...AppUserStoreData,
            ...AppUserPanelSwitchStoreData
        };
    };
    //获取初始状态
    state = {
        ...this.getStoreData(),
        customer_name: this.props.customer_name,//从客户页面跳转过来传过的客户名字
        isGettingIntegrateType: true,//正在获取集成类型
        getItegrateTypeError: false,//获取集成类型是否出错
        isShowAddProductView: false,//添加产品的配置视图
        isShowImportUserPanel: false, // 是否显示导入用户模板， 默认false
        previewList: [], //预览列表
        uploadUserAppId: '', // 上传用户选择的应用id
        isImportUserDataSuccess: false, // 导入用户数据是否成功，默认false
        importUserFlag: false
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
        if (currentView === 'user') {
            //获取产品的集成类型
            this.getIntegrationConfig(this.getUserViewData);
        } else if (currentView === 'active' && this.props.location) {
            //点击活跃用户tab页的时候，需要查询团队列表
            //查询团队列表
            AppUserAction.getTeamLists();
        }
        //记住上一次路由
        this.prevRoutePath = currentView;

    }

    getIntegrationConfig(getUserDataCallback) {
        this.setState({isGettingIntegrateType: true});
        getIntegrationConfig().then(resultObj => {
            let integrationType = _.get(resultObj, 'type');
            //集成类型不存在或集成类型为uem时，
            if (!integrationType || integrationType === INTEGRATE_TYPES.UEM) {
                // 获取用户查询的条件列表
                AppUserAction.getUserCondition();
                //获取已集成的产品列表
                getProductList(productList => {
                    //有产品时，直接获取用户列表并展示
                    if (_.get(productList, '[0]')) {
                        this.setState({
                            isShowAddProductView: false,
                            isGettingIntegrateType: false,
                            getItegrateTypeError: false
                        });
                        _.isFunction(getUserDataCallback) && getUserDataCallback();
                    } else {//没有产品时，展示添加产品及配置界面
                        this.setState({
                            isShowAddProductView: true,
                            isGettingIntegrateType: false,
                            getItegrateTypeError: false
                        });
                    }
                });
            } else {//集成类型为：oplate或matomo时，直接获取用户列表并展示
                this.setState({
                    isShowAddProductView: false,
                    isGettingIntegrateType: false,
                    getItegrateTypeError: false
                });
                _.isFunction(getUserDataCallback) && getUserDataCallback();
            }
        }, errorMsg => {
            this.setState({isShowAddProductView: false, isGettingIntegrateType: false, getItegrateTypeError: true});
        });
    }

    getUserViewData = () => {
        if (this.props.location) {
            const query = queryString.parse(this.props.location.search);
            //从销售首页，点击试用用户和正式用户过期用户数字跳转过来
            var app_id = this.props.location.state && this.props.location.state.app_id;
            var _this = this;
            //有客户名时，直接按照客户名查询，应用选中全部
            if (_.get(this.props.history, 'action') === 'PUSH') {
                //查询团队列表
                AppUserAction.getTeamLists();
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
                    AppUserAction.setSelectedAppId({appId: query.app_id, appList: this.state.appList});
                    const filterField = query.analysis_filter_field;
                    const filterValue = query.analysis_filter_value;
                    delete query.analysis_filter_field;
                    delete query.analysis_filter_value;

                    for (let key in query) {
                        AppUserAction.toggleSearchField({field: key, value: query[key]});
                    }

                    if (filterField === 'team_ids') {
                        if (filterValue === 'unknown') {
                            AppUserAction.toggleSearchField({field: 'is_filter_unknown_team', value: true});
                        }
                        AppUserAction.getTeamLists(teams => {
                            const team = _.find(teams, item => item.group_name === filterValue);
                            const teamId = team && team.group_id || '';
                            AppUserAction.toggleSearchField({field: filterField, value: teamId});
                            setTimeout(() => {
                                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST);
                            });
                        });
                    } else if (filterField === 'sales_id') {
                        //通过销售首页点击团队成员统计图转过来的，查看某个销售对应的用户列表
                        AppUserAction.toggleSearchField({field: filterField, value: filterValue});
                        setTimeout(() => {
                            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST);
                        });
                    }
                } else {
                    //列表面板参数
                    const paramObj = this.props.listPanelParamObj;

                    //若存在列表面板参数，说明是在列表面板中打开
                    if (paramObj) {
                        //根据面板条件查询用户
                        AppUserAction.getAppUserList(paramObj);

                        _.each(paramObj, (value, key) => {
                            //保存查询条件，以便下拉加载时能根据同样的条件查询
                            AppUserAction.toggleSearchField({field: key, value});
                        });
                    } else {
                        //查询所有用户
                        AppUserAction.getAppUserList();
                    }

                    //查询团队列表
                    AppUserAction.getTeamLists();
                }
            }
        } else if (this.props.customer_id) {
            //在客户详情中查看某个客户下的用户
            var customer_id = this.props.customer_id;
            //按照客户名进行查询
            AppUserAction.getAppUserList({
                //传递客户id
                customer_id: customer_id,
            });
        } else if (currentView === 'active' && this.props.location) {
            //点击活跃用户tab页的时候，需要查询团队列表
            //查询团队列表
            AppUserAction.getTeamLists();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.customer_id && this.state.customer_id !== nextProps.customer_id) {
            this.getIntegrationConfig(() => {
                this.setState({
                    customer_id: nextProps.customer_id,
                    customer_name: nextProps.customer_name
                });
                AppUserAction.getAppUserList({
                    //传递客户id
                    customer_id: nextProps.customer_id,
                    page_size: nextProps.user_size
                });
            });
        }
    }

    componentDidUpdate() {
        //如果当前路由是用户，上一次路由是用户审批时，重新获取应用列表
        var currentRoutePath = AppUserUtil.getCurrentView();
        if (currentRoutePath === 'user' && this.prevRoutePath && this.prevRoutePath !== 'user') {
            this.getIntegrationConfig(() => {
                //获取全部应用
                AppUserAction.getAppList();
                //查询团队列表
                AppUserAction.getTeamLists();
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
                if (_.isFunction(this.refs.searchInput.closeSearchInput)) {
                    this.refs.searchInput.closeSearchInput();
                }
            });
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
    handleClickRetryAppLists = () => {
        //获取所有应用
        AppUserAction.getAppList();
    };
    getAppOptions = () => {
        var appList = _.cloneDeep(this.state.appList);
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
        if (!appList.length) {
            var clickMsg = Intl.get('app.user.manager.click.get.app', '点击获取应用');
            if (this.state.appListErrorMsg) {
                clickMsg = Intl.get('app.user.failed.get.apps', '获取失败') + '，' + clickMsg;
            } else {
                clickMsg = Intl.get('user.no.product','暂无产品') + '，' + clickMsg;
            }
            list.unshift(<Option value={RETRY_GET_APP} key={RETRY_GET_APP} className="retry-get-applist-container">
                <div className="retry-get-appList" onClick={this.handleClickRetryAppLists}>
                    {clickMsg}
                </div>
            </Option>);
        }
        list.unshift(<Option value="" key="all" title={Intl.get('user.product.all','全部产品')}><ReactIntl.FormattedMessage
            id="'user.product.all" defaultMessage="全部产品"/></Option>);
        return list;
    };

    onSelectedAppChange = (app_id, app_name) => {
        //如果点击的是获取全部应用
        if (app_id === RETRY_GET_APP) {
            return;
        }
        //原来的应用id
        const oldSelectAppId = this.state.selectedAppId;
        //设置当前选中应用
        AppUserAction.setSelectedAppId({appId: app_id, appList: this.state.appList});
        selectedAppEmitter.emit(selectedAppEmitter.CHANGE_SELECTED_APP, '');
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
        if (_.trim(keyword) !== _.trim(this.state.keywordValue)) {
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
        return hasPrivilege(userManagePrivilege.USER_MANAGE) && !this.state.customer_id;
    };

    //销售选择用户的提示
    getUserRowsTooltip = () => {
        return (
            <span>
                <span>{Intl.get('user.user.list.click', '请在用列表中点击')}</span>
                <span className="checkbox-style-icon"/>
                <span>{Intl.get('user.user.list.select', '选择用户')}</span>
            </span>);
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
                    <i className="iconfont icon-piliangcaozuo"/>
                </div>;
            }
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block add-btn-mini gray">
                    <i className="iconfont icon-piliangcaozuo"/>
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
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || (isSalesRole() && isCustomerDetailJump);
    };

    //显示批量操作按钮
    getBatchOperateBtn = () => {
        //管理员直接显示
        //销售需要从某个客户详情中跳转过来时，才可以展示
        if (this.isShowBatchOperateBtn()) {
            //如果选择了用户，直接显示
            if (this.state.selectedUserRows.length) {
                return <div className="inline-block btn-item">
                    <Button onClick={this.showBatchOperate}>
                        {Intl.get('user.batch.change', '批量变更')}
                    </Button></div>;
            }
            //没有选择用户，加一个提示
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block add-btn-common gray btn-item">
                    <Button disabled>
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
        if (hasPrivilege(commonPrivilegeConst.USER_APPLY_APPROVE) && this.state.customer_id) {
            //选中了用户直接显示
            if (this.state.selectedUserRows.length) {
                return (
                    <div className="inline-block add-btn-common btn-item" onClick={this.showApplyUserForm}>
                        <Button>{Intl.get('user.product.open','开通产品')}</Button>
                    </div>);
            }
            //没选中用户加提示
            return (
                <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                    <div className="inline-block add-btn-common gray btn-item">
                        <Button disabled>
                            {Intl.get('user.product.open','开通产品')}
                        </Button>
                    </div>
                </Popover>);
        }
        return null;
    };

    //显示缩放时候的开通应用按钮
    getApplyUserBtnMini = () => {
        if (hasPrivilege(commonPrivilegeConst.USER_APPLY_APPROVE) && this.state.customer_id) {
            if (this.state.selectedUserRows.length) {
                return <div className="inline-block  add-btn-mini" onClick={this.showApplyUserForm}>
                    <i className="iconfont icon-shenqing"/>
                </div>;
            }
            return <Popover placement="left" content={this.getUserRowsTooltip()} title={null}>
                <div className="inline-block  add-btn-mini gray">
                    <i className="iconfont icon-shenqing"/>
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

    //关闭属于某个客户的用户列表
    hideCustomerUserList = () => {
        this.props.hideCustomerUserList();
        //清空数据
        AppUserAction.setInitialData();
    };

    // 导入用户面板
    showImportUserRightPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-item'), '点击导入按钮');
        this.setState({
            isShowImportUserPanel: true
        });
    };
    
    // 关闭导入用户面板
    closeImportUserRightPanel = () => {
        let importUserFlag = false;
        if (this.state.isImportUserDataSuccess) {
            importUserFlag = true;
        }
        this.setState({
            isShowImportUserPanel: false,
            previewList: [],
            uploadUserAppId: '',
            importUserFlag: importUserFlag
        });
    };

    onUserImport = (list) => {
        this.setState({
            previewList: list,
        });
    };

    getSelectAppId = (app_id) => {
        this.setState({
            uploadUserAppId: app_id
        });
    };

    doImportAjax = (successCallback,errCallback) => {
        $.ajax({
            url: '/rest/confirm/user/upload/' + this.state.uploadUserAppId,
            dataType: 'json',
            type: 'post',
            data: {list: JSON.stringify(this.state.previewList)},
            success: (data) => {
                if (data) {
                    this.setState({
                        isImportUserDataSuccess: true
                    });
                }
                _.isFunction(successCallback) && successCallback();
            },
            error: (errorMsg) => {
                this.setState({
                    isImportUserDataSuccess: false
                });
                _.isFunction(errCallback) && errCallback(errorMsg);
            }
        });
    };
    // 获取登录用户的角色，只有管理员和销售有权限导入
    // 管理员可以导入不匹配的客户，销售不可以导入匹配的客户
    getLoginUserRole = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN); // 返回true，说明是管理员，否则是销售
    };
    // 处理导入用户错误信息
    handleImportUserInfo = (errors, errorType) => {
        let isManager = this.getLoginUserRole();
        let isError = _.find(errors, item => item.field === errorType);
        let cls = classNames({
            'repeat-item-name': isError && errorType !== 'customer_name',
            'item-tips': isError && errorType === 'customer_name' && isManager,
            'sales-import-item-tips': isError && errorType === 'customer_name' && !isManager,
        });
        let tipsMessage = '';
        if (isError) {
            if (errorType === 'user_name') {
                tipsMessage = isError.detail === UPLOAD_USER_TIPS.EXIST ?
                    Intl.get('common.is.existed', '用户名已存在') : Intl.get('user.import.username.no.match.rule', '用户名不符合规则');
            } else if (errorType === 'phone') {
                tipsMessage = isError.detail === UPLOAD_USER_TIPS.ILLEGAL ? Intl.get('user.import.phone.no.match.rule', '手机号不符合规则') : '';
            }else if (errorType === 'email') {
                tipsMessage = isError.detail === UPLOAD_USER_TIPS.EXIST ?
                    Intl.get('common.email.is.existed', '邮箱已存在') : Intl.get('user.import.email.no.match.rule', '邮箱不符合规则');
            } else if (errorType === 'customer_name') {
                if (isError.detail === UPLOAD_USER_TIPS.UNEXIST) {
                    if (isManager) {
                        tipsMessage = Intl.get('user.import.customer.no.match', '未找到用户所属客户，可能没有此客户或客户名不一致。您可以修改数据后再导入，或者直接导入，导入后手动添加所属客户');
                    } else {
                        tipsMessage = Intl.get('user.import.no.match.customer.tips', '未找到用户所属客户，可能没有此客户或客户名不一致，请修改数据后重新导入');
                    }
                } else {
                    tipsMessage = Intl.get('user.import.no.match.customer.tips', '未找到用户所属客户，可能没有此客户或客户名不一致，请修改数据后重新导入');
                }
            }
        }
        return {cls: cls, tipsMessage: tipsMessage};
    };
    // 删除不合法的信息
    deleteImportUser = (index) => {
        let previewList = this.state.previewList;
        previewList.splice(index, 1);
        this.setState({
            previewList: previewList
        });
    };

    getUserPrevList = () => {
        let previewList = [{
            title: Intl.get('common.username', '用户名'),
            dataIndex: 'user_name',
            width: '10%',
            render: (username, rowData, idx) => {
                let errors = _.get(rowData, 'errors', []); // 错误信息
                let userObj = _.get(errors, 'length') ? this.handleImportUserInfo(errors, 'user_name') : '';
                return (
                    <span className={userObj.cls} title={userObj.tipsMessage}>{username}</span>
                );
            }
        }, {
            title: Intl.get('common.nickname', '昵称'),
            dataIndex: 'nickname',
            width: '10%',
        }, {
            title: Intl.get('user.phone', '手机号'),
            dataIndex: 'phone',
            width: '10%',
            render: (phone, rowData, idx) => {
                let errors = _.get(rowData, 'errors', []); // 错误信息
                let phoneObj = _.get(errors, 'length') ? this.handleImportUserInfo(errors, 'phone') : '';
                return (
                    <span className={phoneObj.cls} title={phoneObj.tipsMessage}>{phone}</span>
                );
            }
        }, {
            title: Intl.get('common.email', '邮箱'),
            dataIndex: 'email',
            width: '10%',
            render: (email, rowData, idx) => {
                let errors = _.get(rowData, 'errors', []); // 错误信息
                let emailObj = _.get(errors, 'length') ? this.handleImportUserInfo(errors, 'email') : '';
                return (
                    <span className={emailObj.cls} title={emailObj.tipsMessage}>{email}</span>
                );
            }
        }, {
            title: Intl.get('common.belong.customer', '所属客户'),
            dataIndex: 'customer_name',
            width: '20%',
            render: (customerName, rowData, idx) => {
                let errors = _.get(rowData, 'errors', []); // 错误信息
                let customerNameObj = _.get(errors, 'length') ? this.handleImportUserInfo(errors, 'customer_name') : '';
                return (
                    <span className={customerNameObj.cls} title={customerNameObj.tipsMessage}>{customerName}</span>
                );
            }
        }, {
            title: Intl.get('common.type', '类型'),
            dataIndex: 'user_type',
            width: '10%'
        }, {
            title: Intl.get('user.time.start', '开通时间'),
            dataIndex: 'begin_time',
            width: '10%',
            render: (beginTime) => {
                return (
                    <span>{moment(new Date(beginTime)).format(oplateConsts.DATE_FORMAT)}</span>
                );
            }
        }, {
            title: Intl.get('user.time.end', '到期时间'),
            dataIndex: 'end_time',
            width: '10%',
            render: (endTime) => {
                return (
                    <span>{moment(new Date(endTime)).format(oplateConsts.DATE_FORMAT)}</span>
                );
            }
        }, {
            title: Intl.get('common.remark', '备注'),
            dataIndex: 'remark',
            width: '10%'
        }];

        let errors = [];
        _.each(this.state.previewList, (item) => {
            if (item.errors) {
                errors = _.concat(errors, item.errors);
            }
        });
        errors = uniqueObjectOfArray(errors);
        let length = _.get(errors, 'length');
        let noMatchCustomer = _.find(errors, item => item.field === 'customer_name');
        let isShowOperateColumn = false;
        if (length) {
            if (length > 1) {
                isShowOperateColumn = true;
            } else{
                if (noMatchCustomer) {
                    isShowOperateColumn = false;
                } else {
                    isShowOperateColumn = true;
                }
            }
        }
        if (isShowOperateColumn) {
            previewList.push(
                {
                    title: Intl.get('common.operate', '操作'),
                    width: '60px',
                    render: (text, rowData, idx) => {
                        //是否在导入预览列表上可以删除
                        const isDeleteBtnShow = isShowOperateColumn;
                        return (
                            <span className="cus-op">
                                {isDeleteBtnShow ? (
                                    <i className="order-btn-class iconfont icon-delete handle-btn-item "
                                        onClick={this.deleteImportUser.bind(this, idx)}
                                        data-tracename="删除导入的用户数据"
                                        title={Intl.get('common.delete', '删除')}/>
                                ) : null}
                            </span>
                        );
                    }
                }
            );
        }
        return previewList;
    };

    uniqueArray = (arr) => {
        let unique = []; // 去重后的数组
        for(let item1 of arr){ //循环arr数组对象的内容
            let flag = true; //建立标记，判断数据是否重复，true为不重复
            for(let item2 of unique){ // 循环新数组的内容
                if(item1.field === item2.field && item1.data === item2.data){ //让arr数组对象的内容与新数组的内容作比较，相同的话，改变标记为false
                    flag = false;
                }
            }
            if(flag){ //判断是否重复
                unique.push(item1); //不重复的放入新数组。
            }
        }
        return unique;
    };

    // 筛选终端类型
    onSelectTerminalsType = (value) => {
        //设置当前选中应用的多终端信息
        AppUserAction.setSelectedAppTerminals(value,);
        //延迟搜索，等待界面改变多终端参数
        setTimeout(() => {
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST, {terminal_id: value});
        });
    }

    // 渲染多终端类型
    renderAppTerminalsType = () => {
        return (
            <SelectAppTerminal
                appTerminals={this.state.selectedAppTerminals}
                handleSelectedTerminal={this.onSelectTerminalsType.bind(this)}
                className="btn-item"
                isNeedTerminalId={true}
            />
        );
    }

    //渲染按钮区域
    renderTopNavOperation = () => {
        var currentView = AppUserUtil.getCurrentView();
        var appOptions = this.getAppOptions();
        var topNavRightClass = classNames({
            'pull-right': true,
            'user_manage_filter_block': true,
            'btn-item-container': true,
            'none': currentView !== 'user'
        });
        var topNavLeftClass = classNames({
            'pull-left': true,
            'user_manage_return_block': true
        });
        return (<ButtonZones>{/*如果是从客户页面跳转过来的，增加一个返回按钮*/}
            {this.state.customer_id ?
                <div className={topNavLeftClass}>
                    <BackMainPage className="customer_user_back" handleBackClick={this.hideCustomerUserList}></BackMainPage>
                    <div className="customer_name_wrap">
                        {Intl.get('crm.customer.user', '{customer}客户的用户', {'customer': this.state.customer_name})}
                    </div>
                </div>
                : null}
            <div className={topNavRightClass} data-tracename="已有用户">
                <div className="inline-block btn-item">
                    <SelectFullWidth
                        optionFilterProp="children"
                        showSearch
                        minWidth={120}
                        value={this.state.selectedAppId}
                        onChange={this.onSelectedAppChange}
                        notFoundContent={!appOptions.length ? Intl.get('user.no.product','暂无产品') : Intl.get('user.no.related.product','无相关产品')}
                    >
                        {appOptions}
                    </SelectFullWidth>
                </div>
                {
                    _.get(this.state.selectedAppTerminals, 'length') ? (
                        this.renderAppTerminalsType()
                    ) : null
                }
                {/*如果是从客户界面点击过来的，不要显示搜索框*/}
                {/*如果是按照角色筛选，则不能再按照关键字搜索了*/}
                {
                    this.state.customer_id || this.state.filterRoles.selectedRole ? null : (
                        <div className="inline-block  user_manage_droplist btn-item">
                            <SearchInput
                                ref="searchInput"
                                type="input"
                                searchPlaceHolder={Intl.get('user.search.placeholder', '请输入关键词搜索')}
                                searchEvent={this.onSearchInputChange}
                            />
                        </div>
                    )
                }
                {
                    this.state.selectedAppId ? <FilterBtn
                        expanded={this.state.filterAreaExpanded}
                        onClick={this.toggleFilterArea}
                        className="inline-block app_user_filter_btn  btn-item"
                    /> : null
                }
                {//只有oplate的用户才可以进行添加、申请等操作
                    isOplateUser() ? (
                        <span>
                            <PrivilegeChecker
                                onClick={this.addAppUser}
                                check={this.addUserBtnCheckun}
                                className="inline-block add-btn-common btn-item">
                                <Button><ReactIntl.FormattedMessage id="user.user.add" defaultMessage="添加用户"/></Button>
                            </PrivilegeChecker>
                            {this.getApplyUserBtn()}
                            {this.getBatchOperateBtn()}
                            <PrivilegeChecker
                                onClick={this.addAppUser}
                                check={this.addUserBtnCheckun}
                                title={Intl.get('user.user.add', '添加用户')}
                                className="inline-block add-btn-mini">
                                <Icon type="plus"/>
                            </PrivilegeChecker>
                            {this.getApplyUserBtnMini()}
                            {this.getBatchOperateBtnMini()}
                        </span>) : null}
                { // uem 可以导入用户
                    isOplateUser() ? null : (
                        <span>
                            <PrivilegeChecker
                                onClick={this.showImportUserRightPanel}
                                check={userManagePrivilege.USER_MANAGE}
                                className="inline-block  btn-item">
                                <Button>{Intl.get('user.import.user', '导入用户')}</Button>
                            </PrivilegeChecker>
                        </span>
                    )
                }
            </div>
        </ButtonZones>);
    };

    // 关闭批量变更面板
    closeBatchChangePanel() {
        AppUserAction.closeBatchChangePanel();
    }

    render() {
        var currentView = AppUserUtil.getCurrentView();
        var rightPanelView = null;
        let appList = _.cloneDeep(this.state.appList);
        if ( this.state.isShowBatchChangePanel || this.state.rightPanelType === 'applyUser') {
            appList = _.filter(appList, item => item.status);
        }

        if (this.state.isShowRightPanel) {
            switch (this.state.rightPanelType) {
                case 'addOrEditUser':
                    rightPanelView = (
                        <AddOrEditUser 
                            operation_type={this.state.appUserFormType}
                        />
                    );
                    break;
                case 'applyUser':
                    //应用列表
                    var appListTransform = _.map(appList, obj => {
                        return {
                            client_id: obj.app_id,
                            client_name: obj.app_name,
                            client_image: obj.app_logo,
                        };
                    });
                    rightPanelView = (
                        <ApplyUser
                            appList={appListTransform}
                            users={this.state.selectedUserRows}
                            customerId={this.state.customer_id}
                            cancelApply={AppUserAction.closeRightPanel}
                        />
                    );
                    break;
            }
        }

        var showView = null;
        switch (currentView) {
            case 'user':
                if (this.state.isGettingIntegrateType) {
                    showView = (<Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>);
                } else if (this.state.getItegrateTypeError) {
                    showView = (<NoDataIntro noDataTip={Intl.get('user.list.get.failed', '获取用户列表失败')}/>);
                } else if (this.state.isShowAddProductView) {
                    // 只有管理员可以接入用户，其他不可以
                    let isManager = this.getLoginUserRole();
                    showView = isManager ? (<IntegrateConfigView/>) :
                        (<NoDataIntro noDataTip={Intl.get('app.manege.access.no.amdin.tip', '暂无用户，请联系管理员接入用户')}/>);
                } else {
                    showView = (<UserView 
                        customer_id={this.state.customer_id}
                        importUserFlag={this.state.importUserFlag}
                    />);
                }
                break;
            case 'log':
                showView = (<UserAuditLog/>);
                break;
            case 'active':
                showView = (
                    <RecentLoginUsersPanel
                        teamlists={this.state.filterTeams.teamlists}
                        teamTreeList={this.state.teamTreeList}
                        selectedAppId={this.state.selectedAppId}
                        appList={this.state.appList}
                    />
                );
                break;
        }
        //是否显示“过滤”按钮
        const cls = classNames('app_user_manage_rightpanel white-space-nowrap right-panel', {
            'detail-v3-panel': this.state.rightPanelType === 'detail',
        });
        //用户列表中，如果集成类型还未获取回来或获取出错或还未配置集成类型时，不展示头部导航和按钮区
        let isHideTopNavBtn = AppUserUtil.getCurrentView() === 'user' && (
            this.state.isGettingIntegrateType ||
            this.state.getItegrateTypeError ||
            this.state.isShowAddProductView);
        
        return (
            <div>
                <div className="app_user_manage_page table-btn-fix" data-tracename="用户管理">
                    { isHideTopNavBtn ? (
                        <div className='app-user-nodata-topnav'><TopNav/></div>
                    ) : this.renderTopNavOperation()}

                    <div className="app_user_manage_contentwrap">
                        {
                            showView
                        }
                    </div>

                </div>
                {
                    this.state.isShowBatchChangePanel ? (
                        <BatchChangeUser
                            multiple={true}
                            initialUser={this.state.selectedUserRows}
                            appList={appList}
                            closeRightPanel={this.closeBatchChangePanel}
                        />
                    ) : null
                }
                {
                    this.state.isShowRightPanel ? (
                        <RightPanel className={cls}
                            showFlag={this.state.isShowRightPanel}>
                            {
                                rightPanelView
                            }
                        </RightPanel>
                    ) : null
                }

                <ImportUser
                    uploadActionName='users'
                    importType={Intl.get('sales.home.user', '用户')}
                    templateHref='/rest/import/user/download_template'
                    uploadHref='/rest/user/upload/'
                    appList={this.state.appList}
                    previewList={this.state.previewList}
                    showFlag={this.state.isShowImportUserPanel}
                    getItemPrevList={this.getUserPrevList}
                    getSelectAppId={this.getSelectAppId}
                    closeTemplatePanel={this.closeImportUserRightPanel}
                    onItemListImport={this.onUserImport}
                    doImportAjax={this.doImportAjax}
                    regRules={XLS_FILES_TYPE_RULES}
                    importFileTips={Intl.get('user.import.user.toplimit', '每次导入上限为300个用户')}
                />
            </div>
        );
    }
}

AppUserManage.propTypes = {
    customer_name: PropTypes.string,
    location: PropTypes.obj,
    listPanelParamObj: PropTypes.obj,
    history: PropTypes.obj,
    customer_id: PropTypes.string,
    user_size: PropTypes.number,
    hideCustomerUserList: PropTypes.func
};
module.exports = AppUserManage;

