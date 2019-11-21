require('../../../../components/antd-table-pagination/index.less');
var Spinner = require('../../../../components/spinner');
import {AntcTable} from 'antc';
import {Tag, Icon, Alert, Button} from 'antd';
var AppUserStore = require('../store/app-user-store');

var AppUserPanelSwitchStore = require('../store/app-user-panelswitch-store');
var AppUserPanelSwitchAction = require('../action/app-user-panelswitch-actions');

var AppUserAction = require('../action/app-user-actions');
var AppUserUtil = require('../util/app-user-util');
var classNames = require('classnames');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var GeminiScrollBar = require('../../../../components/react-gemini-scrollbar');
var batchPushEmitter = require('../../../../public/sources/utils/emitters').batchPushEmitter;
var topNavEmitter = require('../../../../public/sources/utils/emitters').topNavEmitter;
import UserDetailAddAppAction from '../action/v2/user-detail-add-app-actions';
import UserDetailEditAppAction from '../action/v2/user-detail-edit-app-actions';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import language from 'PUB_DIR/language/getLanguage';
import SalesClueAddForm from 'MOD_DIR/clue_customer/public/views/add-clues-form';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import clueCustomerAjax from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
import {commonPhoneRegex, areaPhoneRegex, hotlinePhoneRegex} from 'PUB_DIR/sources/utils/validate-util';
import {isOplateUser, isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';
import { getProductList } from 'PUB_DIR/sources/utils/common-data-util';
import USER_MANAGE_PRIVILEGE from '../privilege-const';
import userData from 'PUB_DIR/sources/user-data';
//异常登录的类型
const EXCEPTION_TYPES = [{
    name: Intl.get('common.all', '全部'),
    value: ''
}, {
    name: Intl.get('user.disable.logon', '停用登录'),
    value: 'app_illegal'
}, {
    name: Intl.get('ketao.frontpage.illegal.location.login', '异地登录'),
    value: 'location_illegal'
}, {
    name: Intl.get('user.frequent.logon', '频繁登录'),
    value: 'login_frequency'
}];

// 自定义属性变量
const CUSTOM_VARIABLES = 'custom_variables';
import {
    removeSpacesAndEnter,
    traversingSelectTeamTree,
    getRequestTeamIds,
    getTableContainerHeight
} from 'PUB_DIR/sources/utils/common-method-util';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';

class UserTabContent extends React.Component {
    state = {
        curShowCustomerId: '', //查看右侧详情的客户id
        clueAddFormShow: false,//是否展示右侧添加线索客户的表单
        defaultClueData: {},//添加线索客户的默认信息
        accessChannelArray: accessChannelArray,//线索渠道
        clueSourceArray: clueSourceArray,//线索来源
        clueClassifyArray: clueClassifyArray,//线索分类
        producingClueCustomerItem: {},//正在生成线索客户的用户
        ...AppUserStore.getState()
    };

    getClueSource = () => {
        clueCustomerAjax.getClueSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索来源出错了 ' + errorMsg);
        });
    };

    getClueChannel = () => {
        clueCustomerAjax.getClueChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索渠道出错了 ' + errorMsg);
        });
    };

    getClueClassify = () => {
        clueCustomerAjax.getClueClassify().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueClassifyArray: _.union(this.state.clueClassifyArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索分类出错了 ' + errorMsg);
        });
    };

    fetchUserList = (obj) => {
        var sortable = this.state.selectedAppId && !this.state.filterRoles.selectedRole;
        var sort_field = '',
            sort_order = '';
        if (obj && 'sort_field' in obj) {
            sort_field = obj.sort_field;
        } else if (sortable) {
            //全部应用、角色过滤 状态下，不添加排序字段
            sort_field = this.state.sort_field;
        }
        if (obj && 'sort_order' in obj) {
            sort_order = obj.sort_order;
        } else if (sortable) {
            //全部应用、角色过滤 状态下，不添加排序字段
            sort_order = this.state.sort_order;
        }

        var ajaxObj = {
            id: _.get(obj, 'lastUserId', this.state.lastUserId),
            app_id: _.get(obj, 'selectedAppId', this.state.selectedAppId),
            keyword: _.get(obj, 'keyword', this.state.keywordValue),
            sort_field: sort_field,
            sort_order: sort_order,
            //按照角色过滤
            role_id: _.get(obj, 'role_id', this.state.filterRoles.selectedRole),
            //这种是从客户界面点击申请新应用、或是查看客户的用户
            customer_id: this.state.customer_id || ''
        };
        var filterFieldMap = this.state.filterFieldMap;
        ajaxObj = $.extend(true, ajaxObj, filterFieldMap);
        if(!isOplateUser()) {
            var uemFilterFieldMap = this.state.uemFilterFieldMap;
            var custom_filter = ajaxObj.custom_filter || {};
            custom_filter = $.extend(true, custom_filter, uemFilterFieldMap);
            if(!_.isEmpty(custom_filter)) {
                let custom_filter_str = '';
                for(var key in custom_filter) {
                    if(custom_filter[key] !== '') {
                        // oatruc: 表示多个查询条件时的分隔符
                        if(custom_filter_str){
                            custom_filter_str += `oatruc${key}:${custom_filter[key]}`;
                        }else {
                            custom_filter_str = `${key}:${custom_filter[key]}`;
                        }
                    }
                }
                ajaxObj.custom_filter = custom_filter_str;
            }
        }
        //团队筛选的处理
        if (_.get(ajaxObj.team_ids, '[0]')) {
            //实际选中的团队列表
            let selectedTeams = ajaxObj.team_ids;
            //实际要传到后端的团队,默认是选中的团队
            let totalRequestTeams = selectedTeams;
            let teamTotalArr = [];
            //跟据实际选中的id，获取包含下级团队的所有已选团队列表teamTotalArr
            _.each(selectedTeams, (teamId) => {
                teamTotalArr = _.union(teamTotalArr, traversingSelectTeamTree(this.state.teamTreeList, teamId));
            });
            //跟据包含下级团队的所有团队详细的列表teamTotalArr，获取包含所有的团队id的数组totalRequestTeams
            totalRequestTeams = _.union(totalRequestTeams, getRequestTeamIds(teamTotalArr));
            ajaxObj.team_ids = totalRequestTeams;
        }
        AppUserAction.getAppUserList(ajaxObj);
    };

    onStoreChange = () => {
        this.setState(AppUserStore.getState());
    };

    onRowClick = (event) => {

        var target = event.target;
        //如果点击到生成线索按钮，不展示客户详情
        if ($(target).closest('.trans-clue-customer').length) {
            return;
        }

        if ($(target).closest('.ant-table-selection-column').length) {
            return;
        }
        var user_id = $(event.currentTarget).find('.hidden_user_id').val();
        if (!user_id) {
            return;
        }
        $(event.currentTarget).addClass('current_row').siblings().removeClass('current_row');
        var userObj = AppUserUtil.getUserByFromUserList(this.state.appUserList, user_id);
        var panelSwitchCurrentView = AppUserPanelSwitchStore.getState().panel_switch_currentView;
        if (panelSwitchCurrentView === 'app') {
            AppUserPanelSwitchAction.cancelAddAppPanel();
            //面板向右滑
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
            UserDetailAddAppAction.resetState();
        } else if (panelSwitchCurrentView === 'editapp') {
            UserDetailEditAppAction.resetState();
            AppUserPanelSwitchAction.cancelEditAppPanel();
        }
        if ($('.user_manage_user_detail_wrap').hasClass('move_left')) {
            $('.user_manage_user_detail_wrap').removeClass('move_left');
        }
        //点击所属客户那一列，只有点击所属客户的客户名 才能展开客户的详情
        if ($(target).closest('.owner-customer-wrap').length) {
            var customer_id = $(event.currentTarget).find('.hidden_customer_id').val();
            //没有所属客户，就把之前展开的所属客户的右侧面板关掉
            if (!customer_id) {
                this.hideRightPanel();
            }
            //关闭已经打开的用户详情
            AppUserAction.closeRightPanel();
            //触发关闭用户详情面板
            userDetailEmitter.emit(userDetailEmitter.CLOSE_USER_DETAIL);
        } else {
            //如果点击除了所属客户列之外的列，要关闭已经打开的客户详情 打开对应的用户详情
            this.hideRightPanel();
            AppUserAction.showUserDetail(userObj);
            let paramObj = {
                selectedAppId: this.state.selectedAppId,
                userConditions: this.state.userConditions,
                userId: _.get(userObj, 'user.user_id'),
                appLists: _.get(userObj, 'apps'),
                isShownExceptionTab: _.get(userObj, 'isShownExceptionTab'),
            };
            //触发打开用户详情面板
            userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, paramObj);

            Trace.traceEvent('已有用户','打开用户详情');

        }
    };

    hideRightPanel = () => {
        this.setState({
            curShowCustomerId: ''
        });
    };

    showCustomerDetail = (customer_id) => {
        this.setState({
            curShowCustomerId: customer_id,
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id,
                curCustomer: this.state.curCustomer,
                userViewShowCustomerUserListPanel: true,
                hideRightPanel: this.hideRightPanel
            }
        });
    };

    //更新用户基本信息
    updateUserInfo = (userInfo) => {
        //从右侧面板更改（昵称，备注），同步到用户列表中
        AppUserAction.updateUserInfo(userInfo);
    };

    //更新客户信息
    updateCustomerInfo = ({tag, customer_id, customer_name, user_id, sales_id, sales_name}) => {
        AppUserAction.updateCustomerInfo({tag, customer_id, customer_name, user_id, sales_id, sales_name});
    };

    //更新单个应用的字段
    updateAppField = (result) => {
        AppUserAction.updateAppField(result);
    };

    //绑定自定义事件
    bindEventEmitter = () => {
        //通过发网络请求更新用户列表
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST, this.fetchUserList);
        //不发请求，更新用户基本信息(备注)
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.UPDATE_USER_INFO, this.updateUserInfo);
        //不发请求，更新用户基本信息(客户)
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.UPDATE_CUSTOMER_INFO, this.updateCustomerInfo);
        //更新一个用户的一个应用成功后，同步列表中的数据
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.UPDATE_APP_INFO, this.updateAppInfo);
        //全部停用之后，更新用户列表中的数据
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.UPDATE_DISABLE_ALL_APPS, this.updateDisableAllApps);
        //添加应用之后，更新用户列表中的数据
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.UPDATE_ADD_APP_INFO, this.updateAddAppInfo);
        //修改单个应用的单个字段
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.UPDATE_APP_FIELD, this.updateAppField);
        //更改用户列表滚动条位置
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.CHANGE_USER_LIST_SCROLL_TOP, this.changeUserListScrollTop);
        //批量推送，修改所属客户，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_CUSTOMER_CHANGE, this.batchPushChangeCustomer);
        //批量推送，修改开通类型，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_GRANT_TYPE, this.batchPushChangeGrantType);
        //批量推送，修改开通状态，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_GRANT_STATUS, this.batchPushChangeGrantStatus);
        //批量推送，修改开通时间，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_GRANT_PERIOD, this.batchPushChangeGrantPeriod);
        //批量推送，批量延期，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_GRANT_DELAY, this.batchPushChangeGrantDelay);
        //批量推送，开通产品，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_GRANT_UPDATE, this.batchPushChangeGrantUpdate);
        //批量推送，添加用户，更新用户列表
        batchPushEmitter.on(batchPushEmitter.TASK_USER_CREATE, this.batchPushChangeUserCreate);
    };

    //添加应用之后，更新用户列表中的数据
    updateAddAppInfo = (updateInfo) => {
        AppUserAction.updateAddAppInfo(updateInfo);
    };

    //全部停用之后，更新用户列表中的数据
    updateDisableAllApps = (updateInfo) => {
        AppUserAction.updateDisableAllApps(updateInfo);
    };

    //更新一个用户的一个应用成功后，同步列表中的数据
    updateAppInfo = (updateInfo) => {
        AppUserAction.updateAppInfo(updateInfo);
    };

    //更改用户列表滚动条位置
    changeUserListScrollTop = (topPx) => {
        if (typeof topPx === 'number' && topPx >= 0 ||
            typeof topPx === 'string' && /^\d+$/.test(topPx)
        ) {
            GeminiScrollBar.scrollTo(this.refs.tableWrap, topPx);
        }
    };

    //批量推送，修改所属客户，更新用户列表
    batchPushChangeCustomer = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeCustomer({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //批量推送，修改用户类型，更新用户列表
    batchPushChangeGrantType = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeGrantType({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //批量推送，修改开通状态，更新用户列表
    batchPushChangeGrantPeriod = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeGrantPeriod({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //批量推送，批量延期，更新用户列表
    batchPushChangeGrantDelay = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeGrantDelay({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //批量推送，修改所属客户，更新用户列表
    batchPushChangeGrantStatus = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeGrantStatus({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //批量推送，开通产品，更新用户列表
    batchPushChangeGrantUpdate = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeGrantUpdate({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //批量推送，添加用户，更新用户列表
    batchPushChangeUserCreate = (taskInfo, taskParams) => {
        AppUserAction.batchPushChangeUserCreate({
            taskInfo: taskInfo,
            taskParams: taskParams
        });
    };

    //解除绑定自定义事件
    unbindEventEmitter = () => {
        //通过发网络请求更新用户列表
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.FETCH_USER_LIST, this.fetchUserList);
        //不发请求，更新用户基本信息(备注)
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.UPDATE_USER_INFO, this.updateUserInfo);
        //不发请求，更新用户基本信息(客户)
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.UPDATE_CUSTOMER_INFO, this.updateCustomerInfo);
        //更新一个用户的一个应用成功后，同步列表中的数据
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.UPDATE_APP_INFO, this.updateAppInfo);
        //全部停用之后，更新用户列表中的数据
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.UPDATE_DISABLE_ALL_APPS, this.updateDisableAllApps);
        //添加应用之后，更新用户列表中的数据
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.UPDATE_ADD_APP_INFO, this.updateAddAppInfo);
        //更改用户列表滚动条位置
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.CHANGE_USER_LIST_SCROLL_TOP, this.changeUserListScrollTop);
        //批量推送，修改所属客户，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_CUSTOMER_CHANGE, this.batchPushChangeCustomer);
        //批量推送，修改开通类型，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_GRANT_TYPE, this.batchPushChangeGrantType);
        //批量推送，修改开通状态，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_GRANT_STATUS, this.batchPushChangeGrantStatus);
        //批量推送，修改开通事件，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_GRANT_PERIOD, this.batchPushChangeGrantPeriod);
        //批量推送，批量延期，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_GRANT_DELAY, this.batchPushChangeGrantDelay);
        //批量推送，开通产品，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_GRANT_UPDATE, this.batchPushChangeGrantUpdate);
        //批量推送，添加用户，更新用户列表
        batchPushEmitter.removeListener(batchPushEmitter.TASK_USER_CREATE, this.batchPushChangeUserCreate);
    };

    changeScrollBarHeight = () => {
        this.setState({});
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        AppUserStore.listen(this.onStoreChange);
        $(this.refs.userListTable).on('click', 'tr', this.onRowClick);
        $(window).on('resize', this.changeScrollBarHeight);
        this.bindEventEmitter();
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
        if (hasPrivilege(USER_MANAGE_PRIVILEGE.CREATE_CLUE)) {
            //获取线索来源
            this.getClueSource();
            //获取线索渠道
            this.getClueChannel();
        }
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        AppUserStore.unlisten(this.onStoreChange);
        $(this.refs.userListTable).off('click', 'tr', this.onRowClick);
        $(window).off('resize', this.changeScrollBarHeight);
        this.unbindEventEmitter();
        AppUserAction.resetState();
    }

    getTableColumns = () => {
        var _this = this;
        var isSelectAllApp = !this.state.selectedAppId;
        var sortable = !isSelectAllApp && !this.state.filterRoles.selectedRole;
        //内容是数字时的样式
        let numClass = classNames('has-filter num-float-right', {'has-sorter': sortable});
        //表头中字的个数设置不同宽度
        const fourWordWidth = 100, twoWordWidth = 50, multiWordWidth = 160, columnWidth = 200;
        let columns = [];
        let isOplate = isOplateUser();
        // oplate类型列
        if(isOplate) {
            columns = [
                {
                    title: Intl.get('common.username', '用户名'),
                    dataIndex: 'account_name',
                    key: 'account_name',
                    width: multiWordWidth,
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    render: function($1, rowData, idx) {
                        var user_name = rowData.user && rowData.user.user_name || '';
                        var user_id = rowData.user && rowData.user.user_id || '';
                        const isShown = _.find(rowData.apps, app => {
                            //只要exception_mark_date存在，就属于异常登录
                            return app.exception_mark_date;
                        });
                        let app = _.isArray(rowData.apps) && rowData.apps[0] ? rowData.apps[0] : {};
                        let contract_tag = app.contract_tag === 'new' ? Intl.get('contract.162', '新签约') :
                            app.contract_tag === 'renew' ? Intl.get('contract.163', '续约') : '';
                        return (
                            <div>
                                <div title={user_name}>
                                    {hasPrivilege(USER_MANAGE_PRIVILEGE.USER_QUERY) && isShown ?
                                        <i className="iconfont icon-warn-icon unnormal-login"
                                            title={Intl.get('user.login.abnormal', '异常登录')}></i> : null}
                                    {rowData.apps[0].qualify_label === 1 ? (
                                        <Tag className="qualified-tag-style">
                                            {Intl.get('common.qualified', '合格')}</Tag>) : null
                                    }
                                    {user_name}
                                    <input type="hidden" className="hidden_user_id" value={user_id}/>
                                </div>
                                <div className="user-list-tags">
                                    {app.create_tag && app.create_tag === 'register' ? <Tag
                                        className="user-tag-style">{Intl.get('oplate.user.register.self', '自注册')}</Tag> : null}
                                    {contract_tag ? <Tag className="user-tag-style">{contract_tag}</Tag> : null}
                                </div>
                            </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.nickname', '昵称'),
                    dataIndex: 'account_nickname',
                    key: 'account_nickname',
                    width: multiWordWidth,
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    render: function($1, rowData, idx) {
                        var nick_name = rowData.user && rowData.user.nick_name || '';
                        return (
                            <div title={nick_name}>
                                {nick_name}
                            </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.belong.customer', '所属客户'),
                    dataIndex: 'customer_name',
                    key: 'customer_name',
                    width: multiWordWidth,
                    className: sortable ? 'has-sorter has-filter owner-customer-wrap' : 'has-filter owner-customer-wrap',
                    render: function($1, rowData, idx) {
                        var customer_name = rowData.customer && rowData.customer.customer_name || '';
                        var customer_id = rowData.customer && rowData.customer.customer_id || '';
                        return (
                            <div title={customer_name} className="owner-customer"
                                onClick={_this.showCustomerDetail.bind(this, customer_id)}
                                data-tracename="点击所属客户列">{customer_name}
                                <input type="hidden" className="hidden_customer_id" value={customer_id}/>
                            </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.product.name', '产品名称'),
                    dataIndex: 'apps',
                    key: 'appName',
                    width: multiWordWidth,
                    render: function(apps, rowData, idx) {
                        return AppUserUtil.getAppNameList(apps, rowData);
                    }
                },
                {
                    title: Intl.get('common.status', '状态'),
                    dataIndex: 'apps',
                    width: twoWordWidth,
                    key: 'status',
                    render: function(apps, rowData, idx) {
                        return AppUserUtil.getAppStatusList(apps, rowData);
                    }
                },
                {
                    title: Intl.get('common.type', '类型'),
                    dataIndex: 'apps',
                    width: twoWordWidth,
                    key: 'accountType',
                    render: function(apps, rowData, idx) {
                        return AppUserUtil.getAccountTypeList(apps, rowData);
                    }
                },
                {
                    title: Intl.get('user.time.start', '开通时间'),
                    dataIndex: 'grant_create_date',
                    width: fourWordWidth,
                    key: 'grant_create_date',
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    sorter: sortable,
                    render: function($1, rowData, idx) {
                        return AppUserUtil.getTimeList('create_time', rowData);
                    }
                },
                {
                    title: Intl.get('user.time.end', '到期时间'),
                    dataIndex: 'end_date',
                    width: fourWordWidth,
                    key: 'end_date',
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    sorter: sortable,
                    render: function($1, rowData, idx) {
                        return AppUserUtil.getTimeList('end_time', rowData);
                    }
                },
                {
                    title: Intl.get('common.belong.sales', '所属销售'),
                    dataIndex: 'member_name',
                    width: fourWordWidth,
                    key: 'member_name',
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    render: function(sales, rowData, idx) {
                        var sales_name = rowData.sales && rowData.sales.sales_name || '';
                        return (
                            <div title={sales_name}>{sales_name}</div>
                        );
                    }
                },
                // {
                //     title: Intl.get('user.login.times', '登录次数'),
                //     dataIndex: 'logins',
                //     key: 'logins',
                //     width: fourWordWidth,
                //     className: numClass,
                //     sorter: sortable,
                //     render: function(text, rowData, idx) {
                //         let loginCount = 0;
                //         if (rowData && _.isArray(rowData.apps) && rowData.apps[0]) {
                //             loginCount = rowData.apps[0].logins || 0;
                //         }
                //         return (
                //             <div className="num-float-right" title={loginCount}>{loginCount} </div>
                //         );
                //     }
                // },
                {
                    title: Intl.get('user.login.days', '活跃天数'),
                    dataIndex: 'login_day_count',
                    key: 'login_day_count',
                    width: fourWordWidth,
                    className: numClass,
                    sorter: sortable,
                    render: function(text, rowData, idx) {
                        let loginDays = 0;
                        if (rowData && _.isArray(rowData.apps) && rowData.apps[0]) {
                            loginDays = rowData.apps[0].login_day_count || 0;
                        }
                        return (
                            <div className="num-float-right" title={loginDays}>{loginDays}</div>
                        );
                    }
                },
                {
                    title: Intl.get('user.login.score', '分数'),
                    dataIndex: 'score',
                    key: 'score',
                    width: fourWordWidth,
                    className: numClass,
                    sorter: sortable,
                    render: (text, rowData, idx) => {
                        let score = Math.round((_.get(rowData.apps[0], 'score') || 0) * 100);
                        return (
                            <div className="num-float-right" title={score}>{score} </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.remark', '备注'),
                    dataIndex: 'user',
                    key: 'description',
                    width: columnWidth,
                    render: function(user, rowData, idx) {
                        //是否展示 生成线索的 按钮，必须要选中某个应用，
                        // create_tag === "register" 表示是自注册的用户
                        // clue_created属性存在，并且为true 表示已经生成过线索客户
                        var isShowTransClueButton = _.isArray(rowData.apps) && rowData.apps.length && rowData.apps[0].create_tag === 'register' && !rowData.apps[0].clue_created && hasPrivilege(USER_MANAGE_PRIVILEGE.CREATE_CLUE) ? true : false;
                        return user ? (
                            <div title={user.description}>
                                {user.description}
                                {isShowTransClueButton ?
                                    <div className="trans-clue-customer">
                                        <Button type="primary"
                                            onClick={_this.transformClueCustomer.bind(this, rowData)}>{Intl.get('app.user.trans.clue.customer', '生成线索')}</Button>
                                    </div>
                                    : null}
                            </div>
                        ) : null;
                    }
                }
            ];
        } else {// uem
            columns = [
                {
                    title: Intl.get('common.username', '用户名'),
                    dataIndex: 'account_name',
                    key: 'account_name',
                    width: multiWordWidth,
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    render: function($1, rowData, idx) {
                        var user_name = rowData.user && rowData.user.user_name || '';
                        var user_id = rowData.user && rowData.user.user_id || '';
                        const isShown = _.find(rowData.apps, app => {
                            //只要exception_mark_date存在，就属于异常登录
                            return app.exception_mark_date;
                        });
                        let app = _.isArray(rowData.apps) && rowData.apps[0] ? rowData.apps[0] : {};
                        let contract_tag = app.contract_tag === 'new' ? Intl.get('contract.162', '新签约') :
                            app.contract_tag === 'renew' ? Intl.get('contract.163', '续约') : '';
                        return (
                            <div>
                                <div title={user_name}>
                                    {hasPrivilege(USER_MANAGE_PRIVILEGE.USER_QUERY) && isShown ?
                                        <i className="iconfont icon-warn-icon unnormal-login"
                                            title={Intl.get('user.login.abnormal', '异常登录')}></i> : null}
                                    {rowData.apps[0].qualify_label === 1 ? (
                                        <Tag className="qualified-tag-style">
                                            {Intl.get('common.qualified', '合格')}</Tag>) : null
                                    }
                                    {user_name}
                                    <input type="hidden" className="hidden_user_id" value={user_id}/>
                                </div>
                                <div className="user-list-tags">
                                    {app.create_tag && app.create_tag === 'register' ? <Tag
                                        className="user-tag-style">{Intl.get('oplate.user.register.self', '自注册')}</Tag> : null}
                                    {contract_tag ? <Tag className="user-tag-style">{contract_tag}</Tag> : null}
                                </div>
                            </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.nickname', '昵称'),
                    dataIndex: 'account_nickname',
                    key: 'account_nickname',
                    width: multiWordWidth,
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    render: function($1, rowData, idx) {
                        var nick_name = rowData.user && rowData.user.nick_name || '';
                        return (
                            <div title={nick_name}>
                                {nick_name}
                            </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.belong.customer', '所属客户'),
                    dataIndex: 'customer_name',
                    key: 'customer_name',
                    width: multiWordWidth,
                    className: sortable ? 'has-sorter has-filter owner-customer-wrap' : 'has-filter owner-customer-wrap',
                    render: function($1, rowData, idx) {
                        var customer_name = rowData.customer && rowData.customer.customer_name || '';
                        var customer_id = rowData.customer && rowData.customer.customer_id || '';
                        return (
                            <div title={customer_name} className="owner-customer"
                                onClick={_this.showCustomerDetail.bind(this, customer_id)}
                                data-tracename="点击所属客户列">{customer_name}
                                <input type="hidden" className="hidden_customer_id" value={customer_id}/>
                            </div>
                        );
                    }
                },
                {
                    title: Intl.get('common.product.name','产品名称'),
                    dataIndex: 'apps',
                    key: 'appName',
                    width: multiWordWidth,
                    render: function(apps, rowData, idx) {
                        return AppUserUtil.getAppNameList(apps, rowData);
                    }
                },
                {
                    title: Intl.get('common.type', '类型'),
                    dataIndex: 'apps',
                    width: twoWordWidth,
                    key: 'accountType',
                    render: function(apps, rowData, idx) {
                        return AppUserUtil.getAccountTypeList(apps, rowData);
                    }
                },
                {
                    title: Intl.get('common.role', '角色'),
                    dataIndex: 'apps',
                    width: twoWordWidth,
                    key: 'role',
                    render: function(apps, rowData, idx) {
                        return AppUserUtil.getRoleList(apps, rowData);
                    }
                },
                {
                    title: Intl.get('user.time.end', '到期时间'),
                    dataIndex: 'end_date',
                    width: fourWordWidth,
                    key: 'end_date',
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    sorter: sortable,
                    render: function($1, rowData, idx) {
                        return AppUserUtil.getTimeList('end_time', rowData);
                    }
                },
                {
                    title: Intl.get('common.belong.sales', '所属销售'),
                    dataIndex: 'member_name',
                    width: fourWordWidth,
                    key: 'member_name',
                    className: sortable ? 'has-sorter has-filter' : 'has-filter',
                    render: function(sales, rowData, idx) {
                        var sales_name = rowData.sales && rowData.sales.sales_name || '';
                        return (
                            <div title={sales_name}>{sales_name}</div>
                        );
                    }
                },
            ];
        }

        //选中应用后，去掉应用列的展示
        if(this.state.selectedAppId){
            // oplate去掉应用列
            if(isOplate) {
                columns = _.filter(columns, item => item.dataIndex !== 'apps');
            }else {// uem去掉应用名称
                columns = _.filter(columns, item => item.key !== 'appName');
                // 加上自定义的属性列custom_variables
                this.getCustomVariableColumns((custom_variables_columns) => {
                    columns = columns.concat(custom_variables_columns);
                });
                columns.push({
                    title: Intl.get('common.remark', '备注'),
                    dataIndex: 'user',
                    key: 'description',
                    width: columnWidth,
                    render: function(user, rowData, idx) {
                        //是否展示 生成线索的 按钮，必须要选中某个应用，
                        // create_tag === "register" 表示是自注册的用户
                        // clue_created属性存在，并且为true 表示已经生成过线索客户
                        var isShowTransClueButton = _.isArray(rowData.apps) && rowData.apps.length && rowData.apps[0].create_tag === 'register' && !rowData.apps[0].clue_created && hasPrivilege(USER_MANAGE_PRIVILEGE.CREATE_CLUE) ? true : false;
                        return user ? (
                            <div title={user.description}>
                                {user.description}
                                {isShowTransClueButton ?
                                    <div className="trans-clue-customer">
                                        <Button type="primary"
                                            onClick={_this.transformClueCustomer.bind(this, rowData)}>{Intl.get('app.user.trans.clue.customer', '生成线索')}</Button>
                                    </div>
                                    : null}
                            </div>
                        ) : null;
                    }
                });
            }
        }
        return columns;
    };

    // 加上自定义的属性列
    getCustomVariableColumns = (cb) => {
        const fourWordWidth = 100;
        getProductList(productList => {
            let selectedApp = productList.find(item => item.id === this.state.selectedAppId);
            // 该应用的自定义属性集合 {key: 描述} 如 {status: 状态}
            let customVariable = _.get(selectedApp, 'custom_variable',{});
            // 自定义属性数组
            let customVariables = [];
            for(let key in customVariable) {
                customVariables.push({
                    // 描述名
                    name: customVariable[key],
                    // 键名
                    value: key,
                });
            }
            let coulmns = _.map(customVariables,item => {
                return {
                    title: item.name,
                    dataIndex: 'apps',
                    key: item.value,
                    width: fourWordWidth,
                    render: function(apps, rowData, idx) {
                        // apps: [{custom_variables: { 'status': '启用' } }]
                        let value = apps[0][CUSTOM_VARIABLES] && apps[0][CUSTOM_VARIABLES][item.value] || '';
                        return (
                            <div title={value}>
                                {value}
                            </div>
                        );
                    }
                };
            });
            if(_.isFunction(cb)) cb(coulmns);
        });
    };

    // 能否添加角色筛选
    hasAddRoleFilter = () => {
        return !this.props.customer_id && !Oplate.hideSomeItem;
    };


    //转化成线索客户
    transformClueCustomer = (item) => {
        var defaultName = item.user.user_name;
        var defaultData = {
            name: Intl.get('clue.customer.register.user', '注册用户') + defaultName,
            clue_source: Intl.get('clue.customer.register.self', '自主注册'),
            access_channel: Intl.get('clue.customer.product.website', '产品网站')
        };
        //对用户的用户名进行校验，因为有的昵称是无, ,
        if (commonPhoneRegex.test(defaultName)
            ||
            areaPhoneRegex.test(defaultName)
            ||
            hotlinePhoneRegex.test(defaultName)) {
            //是用电话号码进行注册的
            defaultData.phone = defaultName;
        } else if (_.indexOf(defaultName, '@') > -1) {
            //是用邮箱进行注册的
            defaultData.email = defaultName;
        }
        this.setState({
            clueAddFormShow: true,
            defaultClueData: defaultData,
            producingClueCustomerItem: item// 正在生成线索客户的用户
        });
    };

    // 委内维拉项目，显示的列表项（不包括类型、所属客户、所属销售）
    getTableColumnsVe = () => {
        return _.filter(this.getTableColumns(), (item) => {
            return item.key !== 'accountType' && item.key !== 'customer_name' && item.key !== 'member_name';
        });
    };

    getRowSelection = () => {
        var justSelected = _.chain(this.state.selectedUserRows)
            .map(function(obj) {
                return obj.user.user_id;
            }).value();
        return {
            type: 'checkbox',
            selectedRowKeys: justSelected,
            onSelect: function(currentRow, isSelected, allSelectedRows) {
                AppUserAction.setSelectedUserRows(allSelectedRows);
            },
            onSelectAll: function(isSelectedAll, allSelectedRows) {
                AppUserAction.setSelectedUserRows(allSelectedRows);
            }
        };

    };

    //获取过滤字段的class
    /**
     * @param field 过滤字段的key user_type outdate user_status
     * @param value 过滤字段的值  xxx
     */
    getFilterFieldClass = (field, value) => {
        var filterFieldMap = this.state.filterFieldMap;
        if (!value) {
            return !filterFieldMap[field] ? 'selected' : '';
        } else {
            return filterFieldMap[field] === value ? 'selected' : '';
        }
    };

    //按照某个筛选条件进行过滤
    /**
     * @param field 过滤字段的key user_type outdate user_status
     * @param value 过滤字段的值  xxx
     */
    toggleSearchField = (field, value) => {
        AppUserAction.toggleSearchField({field, value});
        //页面滚动条置顶，避免重新获取数据之后，接着翻页
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        setTimeout(() => {
            this.fetchUserList();
        });
    };

    //uem获取过字段的class
    getUemFilterFieldClass = (field, value) => {
        var uemFilterFieldMap = this.state.uemFilterFieldMap;
        if (!value) {
            return !uemFilterFieldMap[field] ? 'selected' : '';
        } else {
            return uemFilterFieldMap[field] === value ? 'selected' : '';
        }
    };

    //uem按照某个筛选条件进行过滤
    uemToggleSearchField = (field, value) => {
        AppUserAction.uemToggleSearchField({field, value});
        //页面滚动条置顶，避免重新获取数据之后，接着翻页
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        setTimeout(() => {
            this.fetchUserList();
        });
    };

    renderFilterBlock = () => {
        let renderFilter = null;
        //oplate
        if(isOplateUser()) {
            renderFilter = (
                <div>
                    {this.renderFilterFields()}
                    {this.hasAddRoleFilter() ? this.renderFilterRoles() : null}
                </div>
            );
        }else {
            renderFilter = (
                <div>
                    {this.renderUemFilterFields()}
                </div>
            );
        }
        return (
            <div className="global_filter_adv" ref="filter_adv"
                style={{display: this.state.filterAreaExpanded ? 'block' : 'none'}}>
                {renderFilter}
            </div>
        );
    };

    //渲染过滤字段筛选条件列表
    renderFilterFields = () => {
        //当按照角色筛选的时候，不能再按照其他条件筛选
        return <div style={{display: this.state.filterRoles.selectedRole ? 'none' : 'block'}} data-tracename="应用筛选">
            <dl>
                <dt><ReactIntl.FormattedMessage id="user.overdue.whether" defaultMessage="是否过期" />：</dt>
                <dd>
                    <ul data-tracename="是否过期筛选">
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '')}
                            className={this.getFilterFieldClass('outdate', '')} data-tracename="全部"><ReactIntl.FormattedMessage
                                id="common.all" defaultMessage="全部"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '1')}
                            className={this.getFilterFieldClass('outdate', '1')} data-tracename="过期" ><ReactIntl.FormattedMessage
                                id="user.overdue" defaultMessage="过期"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '0')}
                            className={this.getFilterFieldClass('outdate', '0')} data-tracename="未过期"><ReactIntl.FormattedMessage
                                id="user.overdue.not" defaultMessage="未过期"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '1w')}
                            className={this.getFilterFieldClass('outdate', '1w')} data-tracename="一周内过期"><ReactIntl.FormattedMessage
                                id="user.overdue.one.week" defaultMessage="一周内过期"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', 'is_filter_forever')}
                            className={this.getFilterFieldClass('outdate', 'is_filter_forever')} data-tracename="永不过期">
                            <ReactIntl.FormattedMessage id="user.overdue.not.forever" defaultMessage="永不过期"/></li>
                    </ul>
                </dd>
            </dl>
            {Oplate.hideSomeItem ? null : (
                <dl>
                    <dt><ReactIntl.FormattedMessage id="user.user.type" defaultMessage="用户类型"/>：</dt>
                    <dd>
                        <ul data-tracename="用户类型筛选">
                            <li onClick={this.toggleSearchField.bind(this, 'user_type', '')}
                                className={this.getFilterFieldClass('user_type', '')} data-tracename="全部"><ReactIntl.FormattedMessage
                                    id="common.all" defaultMessage="全部"/></li>
                            {
                                _.map(AppUserUtil.USER_TYPE_VALUE_MAP, (value, KEY) => {
                                    var value = AppUserUtil.USER_TYPE_VALUE_MAP[KEY];
                                    var text = AppUserUtil.USER_TYPE_TEXT_MAP[KEY];
                                    return <li onClick={this.toggleSearchField.bind(this, 'user_type', value)}
                                        className={this.getFilterFieldClass('user_type', value)}>{text}</li>;
                                })
                            }
                            <li onClick={this.toggleSearchField.bind(this, 'user_type', 'unknown')}
                                className={this.getFilterFieldClass('user_type', 'unknown')}><ReactIntl.FormattedMessage
                                    id="common.unknown" defaultMessage="未知"/></li>
                        </ul>
                    </dd>
                </dl>
            )}

            <dl>
                <dt><ReactIntl.FormattedMessage id="user.user.status" defaultMessage="用户状态"/>：</dt>
                <dd>
                    <ul data-tracename="用户状态筛选">
                        <li onClick={this.toggleSearchField.bind(this, 'user_status', '')}
                            className={this.getFilterFieldClass('user_status', '')} data-tracename="全部"><ReactIntl.FormattedMessage
                                id="common.all" defaultMessage="全部"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'user_status', '1')}
                            className={this.getFilterFieldClass('user_status', '1')} data-tracename="启用"><ReactIntl.FormattedMessage
                                id="common.enabled" defaultMessage="启用"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'user_status', '0')}
                            className={this.getFilterFieldClass('user_status', '0')} data-tracename="停用"><ReactIntl.FormattedMessage
                                id="common.stop" defaultMessage="停用"/></li>
                    </ul>
                </dd>
            </dl>
            {/*从客户列表中打开某个客户的用户列表时，不需要下面的筛选项*/}
            {this.props.customer_id ? null : (
                <div>
                    <dl>
                        <dt>{Intl.get('oplate.user.label', '用户标签')}：</dt>
                        <dd>
                            <ul data-tracename="用户标签筛选">
                                <li onClick={this.toggleSearchField.bind(this, 'tag_all', '')}
                                    className={this.getFilterFieldClass('tag_all', '')} data-tracename="全部"><ReactIntl.FormattedMessage
                                        id="common.all" defaultMessage="全部"/></li>
                                <li onClick={this.toggleSearchField.bind(this, 'create_tag', 'register')}
                                    className={this.getFilterFieldClass('create_tag', 'register')} data-tracename="自注册">{Intl.get('oplate.user.register.self', '自注册')}</li>
                                <li onClick={this.toggleSearchField.bind(this, 'qualify_label', '1')}
                                    className={this.getFilterFieldClass('qualify_label', '1')} data-tracename="合格">{Intl.get('common.qualified', '合格')}</li>
                                <li onClick={this.toggleSearchField.bind(this, 'contract_tag', 'new')}
                                    className={this.getFilterFieldClass('contract_tag', 'new')} data-tracename="新签约">{Intl.get('contract.162', '新签约')}</li>
                                <li onClick={this.toggleSearchField.bind(this, 'contract_tag', 'renew')}
                                    className={this.getFilterFieldClass('contract_tag', 'renew')} data-tracename="缴约">{Intl.get('contract.163', '续约')}</li>
                            </ul>
                        </dd>
                    </dl>
                    {Oplate.hideSomeItem ? null : (
                        <dl>
                            <dt><ReactIntl.FormattedMessage id="common.belong.customer" defaultMessage="所属客户"/>：</dt>
                            <dd>
                                <ul data-tracename="所属客户筛选">
                                    <li
                                        onClick={this.toggleSearchField.bind(this, 'customer_unknown', '')}
                                        className={this.getFilterFieldClass('customer_unknown', '')}
                                        data-tracename="全部"
                                    >
                                        <ReactIntl.FormattedMessage id="common.all" defaultMessage="全部"/>
                                    </li>
                                    <li
                                        onClick={this.toggleSearchField.bind(this, 'customer_unknown', 'true')}
                                        className={this.getFilterFieldClass('customer_unknown', 'true')}
                                        data-tracename="未知"
                                    >
                                        <ReactIntl.FormattedMessage id="common.unknown" defaultMessage="未知"/>
                                    </li>
                                </ul>

                            </dd>
                        </dl>
                    )}
                    <dl >
                        <dt><ReactIntl.FormattedMessage id="user.expire.stop" defaultMessage="到期停用"/>：</dt>
                        <dd>
                            <ul data-tracename="到期停用筛选">
                                <li onClick={this.toggleSearchField.bind(this, 'over_draft', '')}
                                    className={this.getFilterFieldClass('over_draft', '')} data-tracename="全部"><ReactIntl.FormattedMessage
                                        id="common.all" defaultMessage="全部"/></li>
                                <li onClick={this.toggleSearchField.bind(this, 'over_draft', 'true')}
                                    className={this.getFilterFieldClass('over_draft', 'true')} data-tracename="是">
                                    <ReactIntl.FormattedMessage id="user.yes" defaultMessage="是"/></li>
                                <li onClick={this.toggleSearchField.bind(this, 'over_draft', 'false')}
                                    className={this.getFilterFieldClass('over_draft', 'false')} data-tracename="否">
                                    <ReactIntl.FormattedMessage id="user.no" defaultMessage="否"/></li>
                            </ul>
                        </dd>
                    </dl>
                    {Oplate.hideSomeItem ? null : this.renderFilterTeamName()}
                    {((language.lan() === 'zh' || language.lan() === 'en') && hasPrivilege(USER_MANAGE_PRIVILEGE.USER_QUERY)) ?
                        (<dl>
                            <dt><ReactIntl.FormattedMessage id="user.login.abnormal" defaultMessage="异常登录"/>：</dt>
                            <dd>
                                <ul data-tracename="异常登陆筛选">
                                    {EXCEPTION_TYPES.map((exceptionObj, index) => {
                                        return (
                                            <li key={index}
                                                onClick={this.toggleSearchField.bind(this, 'exception_type', exceptionObj.value)}
                                                className={this.getFilterFieldClass('exception_type', exceptionObj.value)}
                                                data-tracename={exceptionObj.name}>
                                                {exceptionObj.name}
                                            </li>);
                                    })}
                                </ul>
                            </dd>
                        </dl>)
                        : null}
                </div>)}
        </div>;
    };

    //渲染uem等多虑字段筛选条件列表
    renderUemFilterFields = () => {
        // 固定字段：过期时间，所属客户
        // 动态获取：用户类型(user_type)，角色(role)
        // 选中某个应用时，需要添加上该应用自定义的属性
        let hasUserType = false,
            hasRoleType = false,
            filterRoles = [],
            filterUserTypes = [];
        let custom_variables = _.filter(this.state.userConditions, item => {
            // 是否是当前选中的应用
            if(item.app_id === this.state.selectedAppId) {
                // 当类型为user_type或者role时，不加入自定义筛选属性中
                if (item.key === 'user_type') {// 用户类型
                    if(_.get(item.values, '[0]')) {
                        hasUserType = true;
                        filterUserTypes = item;
                    }
                    return false;
                }
                if(item.key === 'role') {// 角色
                    if(_.get(item.values, '[0]')) {
                        hasRoleType = true;
                        filterRoles = item;
                    }
                    return false;
                }
                return true;
            }else {
                return false;
            }
        });
        return <div data-tracename="应用筛选">
            <dl>
                <dt><ReactIntl.FormattedMessage id="user.overdue.whether" defaultMessage="是否过期"/>：</dt>
                <dd>
                    <ul data-tracename="是否过期筛选">
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '')}
                            className={this.getFilterFieldClass('outdate', '')} data-tracename="全部">
                            <ReactIntl.FormattedMessage
                                id="common.all" defaultMessage="全部"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '1')}
                            className={this.getFilterFieldClass('outdate', '1')} data-tracename="过期">
                            <ReactIntl.FormattedMessage
                                id="user.overdue" defaultMessage="过期"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '0')}
                            className={this.getFilterFieldClass('outdate', '0')} data-tracename="未过期">
                            <ReactIntl.FormattedMessage
                                id="user.overdue.not" defaultMessage="未过期"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', '1w')}
                            className={this.getFilterFieldClass('outdate', '1w')} data-tracename="一周内过期">
                            <ReactIntl.FormattedMessage
                                id="user.overdue.one.week" defaultMessage="一周内过期"/></li>
                        <li onClick={this.toggleSearchField.bind(this, 'outdate', 'is_filter_forever')}
                            className={this.getFilterFieldClass('outdate', 'is_filter_forever')} data-tracename="永不过期">
                            <ReactIntl.FormattedMessage id="user.overdue.not.forever" defaultMessage="永不过期"/></li>
                    </ul>
                </dd>
            </dl>
            {Oplate.hideSomeItem || !hasUserType ? null : (
                <dl>
                    <dt>
                        {
                            filterUserTypes.description ? filterUserTypes.description : <ReactIntl.FormattedMessage id="user.user.type" defaultMessage="用户类型"/>
                        }：
                    </dt>
                    <dd>
                        <ul data-tracename="用户类型筛选">
                            <li onClick={this.uemToggleSearchField.bind(this, 'user_type', '')}
                                className={this.getUemFilterFieldClass('user_type', '')} data-tracename="全部">
                                <ReactIntl.FormattedMessage
                                    id="common.all" defaultMessage="全部"/></li>
                            {
                                _.map(filterUserTypes.values, (value, index) => {
                                    return <li onClick={this.uemToggleSearchField.bind(this, 'user_type', value)}
                                        className={this.getUemFilterFieldClass('user_type', value)}>{value}</li>;
                                })
                            }
                        </ul>
                    </dd>
                </dl>
            )}

            {/*从客户列表中打开某个客户的用户列表时，不需要下面的筛选项*/}
            {this.props.customer_id ? null : (
                <div>
                    {Oplate.hideSomeItem ? null : (
                        <dl>
                            <dt><ReactIntl.FormattedMessage id="common.belong.customer" defaultMessage="所属客户"/>：</dt>
                            <dd>
                                <ul data-tracename="所属客户筛选">
                                    <li
                                        onClick={this.toggleSearchField.bind(this, 'customer_unknown', '')}
                                        className={this.getFilterFieldClass('customer_unknown', '')}
                                        data-tracename="全部"
                                    >
                                        <ReactIntl.FormattedMessage id="common.all" defaultMessage="全部"/>
                                    </li>
                                    <li
                                        onClick={this.toggleSearchField.bind(this, 'customer_unknown', 'true')}
                                        className={this.getFilterFieldClass('customer_unknown', 'true')}
                                        data-tracename="未知"
                                    >
                                        <ReactIntl.FormattedMessage id="common.unknown" defaultMessage="未知"/>
                                    </li>
                                </ul>

                            </dd>
                        </dl>
                    )}
                </div>
            )}
            {/*角色*/}
            {hasRoleType && this.hasAddRoleFilter() ? (
                <dl className="filter_roles">
                    <dt>
                        {filterRoles.description ? filterRoles.description : (<ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>)}：
                    </dt>
                    <dd>
                        <ul data-tracename="角色筛选">
                            <li className={this.getUemFilterFieldClass('role', '')} onClick={this.uemToggleSearchField.bind(this,'role', '')} data-tracename="全部角色">
                                <ReactIntl.FormattedMessage id="common.all" defaultMessage="全部"/></li>
                            {
                                _.map(filterRoles.values,(role, index) => {
                                    return <li className={this.getUemFilterFieldClass('role', role)} key={role}
                                        onClick={this.uemToggleSearchField.bind(this,'role', role)} data-tracename="单个角色">{role}</li>;
                                })
                            }
                        </ul>
                    </dd>
                </dl>
            ) : null}
            {/*其他自定义属性*/}
            {
                _.get(custom_variables,'[0]') ? (
                    _.map(custom_variables, item => {
                        return (
                            <dl>
                                <dt>{item.description || ''}：</dt>
                                <dd>
                                    <ul data-tracename={item.description + '筛选'}>
                                        <li onClick={this.uemToggleSearchField.bind(this, item.key, '')}
                                            className={this.getUemFilterFieldClass(item.key, '')} data-tracename="全部">
                                            <ReactIntl.FormattedMessage
                                                id="common.all" defaultMessage="全部"/></li>
                                        {
                                            _.map(item.values, (value, index) => {
                                                return <li onClick={this.uemToggleSearchField.bind(this, item.key, value)}
                                                    className={this.getUemFilterFieldClass(item.key, value)}>{value}</li>;
                                            })
                                        }
                                    </ul>
                                </dd>
                            </dl>
                        );
                    })
                ) : null
            }
        </div>;
    };

    //针对一个角色id进行过滤
    filterUserByRole = (role_id) => {
        AppUserAction.filterUserByRole(role_id);
        //页面滚动条置顶，避免重新获取数据之后，接着翻页
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        setTimeout(() => {
            this.fetchUserList({
                role_id: role_id
            });
        });
    };

    //重新获取角色筛选信息
    retryLoadRoles = () => {
        AppUserAction.getRolesByAppId(this.state.selectedAppId);
    };

    //渲染筛选的角色
    renderFilterRoles = () => {
        //当含有其他过滤条件时，不能再过滤权限
        //当有关键词时，不能再过滤权限
        //如果用户没有过滤角色的权限，也不能过滤
        var styleObj = {
            display: !this.state.filterRoles.shouldShow || !_.isEmpty(this.state.filterFieldMap) || this.state.keywordValue ? 'none' : 'block'
        };
        var filterRoles = this.state.filterRoles;
        var filterRolesResult = filterRoles.rolesResult;
        var selectedRole = filterRoles.selectedRole;
        if (filterRolesResult === 'loading') {
            return <dl className="filter_roles filter_roles_loading" style={styleObj}>
                <dt>
                    <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>
                    ：
                </dt>
                <dd>
                    <ul>
                        <li>
                            <Icon type="loading"/>
                        </li>
                    </ul>
                </dd>
            </dl>;
        }
        if (filterRolesResult === 'error') {
            return <dl className="filter_roles filter_roles_error" style={styleObj}>
                <dt>
                    <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>：
                </dt>
                <dd>
                    <ul>
                        <li>
                            <Alert message={filterRoles.errorMsg} type="error" showIcon/>，
                            <a href="javascript:void(0)" onClick={this.retryLoadRoles}><ReactIntl.FormattedMessage
                                id="common.retry" defaultMessage="重试"/></a>
                        </li>
                    </ul>
                </dd>
            </dl>;
        }
        var totolClass = classNames({
            selected: selectedRole === ''
        });
        return <dl className="filter_roles" style={styleObj}>
            <dt>
                <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>：
            </dt>
            <dd>
                <ul data-tracename="角色筛选">
                    <li className={totolClass} onClick={this.filterUserByRole.bind(this, '')} data-tracename="全部角色">
                        <ReactIntl.FormattedMessage id="common.all" defaultMessage="全部"/></li>
                    {
                        filterRoles.roles.map((role, index) => {
                            var cls = classNames({
                                selected: role.role_id === selectedRole
                            });
                            return <li className={cls} key={role.role_id}
                                onClick={this.filterUserByRole.bind(this, role.role_id)} data-tracename="单个角色">{role.role_name}</li>;
                        })
                    }
                </ul>
            </dd>
        </dl>;
    };

    //重新获取团队信息
    retryLoadTeams = () => {
        AppUserAction.getTeamLists();
    };

    //按团队搜素
    renderFilterTeamName = () => {
        //团队搜索支持多选
        //关联搜索与团队相关的信息
        var team_ids = this.state.filterFieldMap.team_ids || [];
        //团队搜索展示相关信息
        var filterTeams = this.state.filterTeams;
        //获取团队列表相应的状态 成功 失败 或加载中
        var filterTeamsResult = filterTeams.teamsResult;
        //已选中的团队
        var selectedTeams = filterTeams.selectedTeams;
        if (filterTeamsResult === 'loading') {
            return <dl className="filter_teams filter_teams_loading">
                <dt>
                    <ReactIntl.FormattedMessage id="user.user.team" defaultMessage="团队"/>：
                </dt>
                <dd>
                    <ul>
                        <li>
                            <Icon type="loading"/>
                        </li>
                    </ul>
                </dd>
            </dl>;
        }
        if (filterTeamsResult === 'error') {
            return <dl className="filter_teams filter_teams_error">
                <dt>
                    <ReactIntl.FormattedMessage id="user.user.team" defaultMessage="团队"/>：
                </dt>
                <dd>
                    <ul>
                        <li>
                            <Alert message={filterTeams.errorMsg} type="error" showIcon/>，
                            <a href="javascript:void(0)" onClick={this.retryLoadTeams}><ReactIntl.FormattedMessage
                                id="common.retry" defaultMessage="重试"/></a>
                        </li>
                    </ul>
                </dd>
            </dl>;
        }
        var totolClass = classNames({
            selected: team_ids.length === 0
        });
        return <dl className="filter_teams">
            <dt>
                <ReactIntl.FormattedMessage id="user.user.team" defaultMessage="团队"/>
                ：
            </dt>
            <dd>
                <ul data-tracename="团队筛选">
                    <li className={totolClass} onClick={this.toggleSearchField.bind(this, 'team_ids', '')} data-tracename="全部">
                        <ReactIntl.FormattedMessage id="common.all" defaultMessage="全部"/></li>
                    {
                        filterTeams.teamlists.map((team, index) => {
                            var cls = classNames({
                                selected: team_ids.indexOf(team.group_id) >= 0
                            });
                            return <li className={cls} key={team.group_id}
                                onClick={this.toggleSearchField.bind(this, 'team_ids', team.group_id)} data-tracename="单个团队">{team.group_name}</li>;
                        })
                    }
                </ul>
            </dd>
        </dl>;
    };

    renderLoadingBlock = () => {
        if (this.state.appUserListResult !== 'loading' || this.state.lastUserId) {
            return null;
        }
        return (
            <div className="appuser-list-loading-wrap">
                <Spinner />
            </div>
        );
    };

    handleScrollBottom = () => {
        this.fetchUserList({
            lastUserId: this.state.lastUserId
        });
    };

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.appUserListResult &&
            this.state.appUserList.length >= 10 &&
            !this.state.listenScrollBottom;
    };

    //表格内容改变
    onTableChange = (pagination, filters, sorter) => {
        //后端要的排序数据是asc和desc，ant-design给的数据是ascend和descend
        //将end去掉
        var sortParams = {
            sort_field: sorter.field || '',
            sort_order: sorter.order && sorter.order.replace(/end$/, '') || ''
        };
        AppUserAction.changeTableSort(sortParams);
        AppUserAction.setLastUserId('');
        this.fetchUserList({
            lastUserId: '',
            sort_order: sortParams.sort_order,
            sort_field: sortParams.sort_field
        });
    };

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.key === this.state.detailUser.key) && this.state.isShowRightPanel) {
            return 'current_row';
        }
        else {
            return '';
        }
    };
        //是否可以批量变更
        isShowBatchOperate = () => {
            //当前视图
            let currentView = AppUserUtil.getCurrentView();
            //是否是从某个客户详情中跳转过来的
            let isCustomerDetailJump = currentView === 'user' && this.props.customer_id;
            //管理员：可以进行批量变更，销售：从某个客户详情中跳转过来时，可以批量变更（销售只可以批量操作同一客户下的用户）
            return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || (isSalesRole() && isCustomerDetailJump);
        };

    //渲染表格区域
    renderTableBlock = () => {
        //这里不能return null了，表格的排序会丢失
        var isLoading = this.state.appUserListResult === 'loading';
        var doNotShow = false;
        if (isLoading && !this.state.lastUserId) {
            doNotShow = true;
        }
        var columns = Oplate.hideSomeItem ? this.getTableColumnsVe() : this.getTableColumns();
        if (this.state.selectedAppId === '') {
            columns = _.filter(columns, item => {
                return item.key !== 'logins' && item.key !== 'login_day_count' && item.key !== 'score';
            });
        }
        //管理员可以批量操作
        //销售可以批量操作
        const hasSelectAuth = hasPrivilege(USER_MANAGE_PRIVILEGE.USER_MANAGE);
        //只有oplate的用户才有批量操作
        var rowSelection = hasSelectAuth && isOplateUser() && this.isShowBatchOperate() ? this.getRowSelection() : null;
        var divHeight = getTableContainerHeight() - (this.state.filterAreaExpanded ? $(this.refs.filter_adv).outerHeight() || 0 : 0);
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: this.state.appUserListResult === 'loading',
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('noMoreTip.user', '没有更多用户了')
        };
        return (
            <div className="user-list-table-wrap scroll-load userlist-fix" id="new-table"
                style={{display: doNotShow ? 'none' : 'block'}}>

                <div className="user-list-tbody custom-tbody" style={{height: divHeight}} ref="tableWrap">
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        dataSource={this.state.appUserList}
                        rowSelection={rowSelection}
                        columns={columns}
                        pagination={false}
                        onChange={this.onTableChange}
                        rowClassName={this.handleRowClassName}
                        locale={{
                            filterTitle: Intl.get('common.filter', '筛选'),
                            filterConfirm: Intl.get('common.sure', '确定'),
                            filterReset: Intl.get('user.reset', '重置'),
                            emptyText: this.state.appUserListResult === 'error' ? this.state.getAppUserListErrorMsg || Intl.get('user.list.get.failed', '获取用户列表失败') : Intl.get('common.no.more.user', '没有更多用户了')
                        }}
                        scroll={{x: Oplate.hideSomeItem ? 1030 : (hasSelectAuth ? 1360 : 1340), y: divHeight}}
                        util={{
                            zoomInSortArea: true
                        }}
                    />
                    {
                        this.state.lastUserId && this.state.appUserListResult === 'error' ? (

                            <div className="scroll-loading-data-error">
                                {this.state.getAppUserListErrorMsg || Intl.get('user.scroll.down.failed', '下拉加载用户失败')},
                                <ReactIntl.FormattedMessage
                                    id="user.retry"
                                    defaultMessage={'请{retry}'}
                                    values={{
                                        'retry': <a
                                            onClick={this.handleScrollBottom}><ReactIntl.FormattedMessage
                                                id="common.retry" defaultMessage="重试"/></a>
                                    }}
                                />
                            </div>

                        ) : null
                    }

                </div>
                {this.state.appUserCount ?
                    <BottomTotalCount totalCount={<ReactIntl.FormattedMessage
                        id="user.total.data"
                        defaultMessage={'共{number}个用户'}
                        values={{
                            'number': this.state.appUserCount
                        }}
                    />}/> : null
                }
            </div>
        );
    };

    hideClueAddForm = () => {
        this.setState({
            clueAddFormShow: false
        });
    };

    //更新线索来源列表
    updateClueSource = (newSource) => {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray: this.state.clueSourceArray
        });
    };

    //更新线索渠道列表
    updateClueChannel = (newChannel) => {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray: this.state.accessChannelArray
        });
    };

    //更新线索分类
    updateClueClassify = (newClue) => {
        this.state.clueClassifyArray.push(newClue);
        this.setState({
            clueClassifyArray: this.state.clueClassifyArray
        });
    };

    //线索客户添加完毕后
    afterAddSalesClue = () => {
        AppUserAction.updateUserAppsInfo(this.state.producingClueCustomerItem);
        this.setState({
            producingClueCustomerItem: {}//正在生成线索客户的用户
        });
    };

    render() {
        var appUserId = this.state.producingClueCustomerItem.user ? this.state.producingClueCustomerItem.user.user_id : '';
        var appUserName = _.get(this.state.producingClueCustomerItem, 'user.user_name');
        return (
            <div ref="userListTable">
                {this.renderFilterBlock()}
                {this.renderLoadingBlock()}
                {this.renderTableBlock()}
                {this.state.clueAddFormShow ? (
                    <SalesClueAddForm
                        appUserId={appUserId}
                        appUserName={appUserName}
                        defaultClueData={this.state.defaultClueData}
                        hideAddForm={this.hideClueAddForm}
                        accessChannelArray={this.state.accessChannelArray}
                        clueSourceArray={this.state.clueSourceArray}
                        clueClassifyArray={this.state.clueClassifyArray}
                        updateClueSource={this.updateClueSource}
                        updateClueChannel={this.updateClueChannel}
                        updateClueClassify={this.updateClueClassify}
                        afterAddSalesClue={this.afterAddSalesClue}
                    />
                ) : null}
            </div>
        );
    }
}

UserTabContent.defaultProps = {
    customer_id: '',
};
UserTabContent.propTypes = {
    customer_id: PropTypes.string,

};
module.exports = UserTabContent;
