/**
 * 近期登录用户列表
 * Created by wangliping on 2017/8/31.
 */
require('../css/recent-login-user-list.less');
import ShareObj from '../util/app-id-share-util';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import { RightPanelClose } from 'CMP_DIR/rightPanel/index';
import { AntcDatePicker as DatePicker, AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import DateSelectorUtils from 'antc/lib/components/datepicker/utils';
import { RightPanel } from 'CMP_DIR/rightPanel';
import { topNavEmitter, selectedAppEmitter, scrollBarEmitter,
    userDetailEmitter, phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import { userTypeList, filterTypeList } from 'PUB_DIR/sources/utils/consts';
import {
    getUserByFromUserList,
    getAppNameList,
    getAppStatusList,
    getAccountTypeList,
    getTimeList
} from '../util/app-user-util';
import userAjax from '../ajax/app-user-ajax';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { setWebsiteConfig } from 'LIB_DIR/utils/websiteConfig';
import { storageUtil } from 'ant-utils';
import PropTypes from 'prop-types';
import { traversingSelectTeamTree, getRequestTeamIds,
    approveAppConfigTerminal} from 'PUB_DIR/sources/utils/common-method-util';
import RecentUserStore from '../store/recent-user-store';
const RecentUserAction = require('../action/recent-user-action');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
//存储个人配置的key
const WEBSITE_CONFIG = oplateConsts.STORE_PERSONNAL_SETTING.WEBSITE_CONFIG;
//个人配置中存储的近期登录用户列表选择的应用id
const RECENT_LOGIN_USER_SELECTED_APP_ID = oplateConsts.STORE_PERSONNAL_SETTING.RECENT_LOGIN_USER_SELECTED_APP_ID;
const PAGE_SIZE = 20;//一页获取20条数据
const ALL_MEMBER_VALUE = 'ALL_MEMBER';
import {isEqualArray} from 'LIB_DIR/func';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
import { AntcTable } from 'antc';
import userManagePrivilege from '../privilege-const';
import SelectAppTerminal from 'CMP_DIR/select-app-terminal';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import Spinner from 'CMP_DIR/spinner';
import RefreshButton from 'CMP_DIR/refresh-button';
import adaptiveHeightHoc from 'CMP_DIR/adaptive-height-hoc';
import {isKetaoOrganizaion} from 'PUB_DIR/sources/utils/common-method-util';

class RecentLoginUsers extends React.Component {
    constructor(props) {
        super(props);
        let timeRange = this.getTodayTimeRange();
        var teamlists = this.concatTeamList(props);
        const selectedAppInfo = this.getSelectedAppObj(props);
        this.state = {
            ...RecentUserStore.getState(),
            selectedAppId: _.get(selectedAppInfo, 'selectedAppId'),
            selectedAppTerminals: _.get(selectedAppInfo, 'selectedAppTerminals'),
            teamlists: teamlists,
            start_time: timeRange.start_time,
            end_time: timeRange.end_time,
            user_type: '',
            recentLoginUsers: [],
            totalUserSize: 0,
            lastUserId: '',//用于下拉加载的userId
            isLoadingUserList: false,//是否正在获取近期登录用户列表
            getUserListErrorMsg: '',//错误提示内容
            listenScrollBottom: true,//是否监听滚动
            isShownExceptionTab: false,//是否展示异常登录信息
            filter_type: '', // 是否过期，默认（全部）
            team_ids: '', //默认选中的团队(全部)
            selectedSalesId: [ALL_MEMBER_VALUE],
            selectedTeamIds: [], // 所选团队以及下级团队id
            terminal_id: '', // 默认选中全部终端类型
            curShowCustomerId: '', //查看右侧详情的客户id
        };
    }

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        RecentUserStore.listen(this.onStoreChange);
        // 关闭用户详情面板
        userDetailEmitter.on(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL, this.closeRightPanel);
        RecentUserAction.getSaleMemberList(commonMethodUtil.getParamByPrivilege());
        this.getRecentLoginUsers();
        $(this.refs.recentLoginUsersTable).on('click', 'tr', this.onRowClick.bind(this));
    }
    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        RecentUserStore.unlisten(this.onStoreChange);
        // 关闭用户详情面板
        userDetailEmitter.removeListener(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL, this.closeRightPanel);
    }
    onStoreChange = () => {
        var stateData = RecentUserStore.getState();
        this.setState(stateData);
    };
    onRowClick(event) {
        let target = event.target;
        if ($(target).closest('.ant-table-selection-column').length) {
            return;
        }
        let user_id = $(event.currentTarget).find('.hidden_user_id').val();
        if (!user_id) {
            return;
        }
        $(event.currentTarget).addClass('current_row').siblings().removeClass('current_row');
        //点击所属客户那一列，只有点击所属客户的客户名 才能展开客户的详情
        if ($(target).closest('.owner-customer-wrap').length) {
            const customer_id = $(event.currentTarget).find('.hidden_customer_id').val();
            // 有客户id，打开客户详情
            if (customer_id) {
                this.showCustomerDetail(customer_id);
            }
        } else {
            let userObj = getUserByFromUserList(this.state.recentLoginUsers, user_id);
            userObj.isShownExceptionTab = _.find(userObj.apps, app => {
                return app.exception_mark_date;
            }) ? true : false;

            let paramObj = {
                selectedAppId: this.state.selectedAppId,
                isShownExceptionTab: _.get(userObj, 'isShownExceptionTab'),
                appLists: _.get(userObj, 'apps'),
                userId: user_id
            };
            //触发打开用户详情面板
            userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, paramObj);
        }
    }


    closeRightPanel() {
        $('.recent-login-users-table-wrap .current_row').removeClass('current_row');
    }

    getSelectedAppObj(props) {
        let selectedAppId = '';
        // 客套组织下，直接显示客套产品
        if (isKetaoOrganizaion()) {
            let ketaoId = _.get(window, 'Oplate.clientId'); // 客套id
            let ketaoApp = _.find(props.appList, app => app.app_id === ketaoId);
            if (!_.isEmpty(ketaoApp)) {
                selectedAppId = ketaoId;
            } else {
                selectedAppId = _.get(props.appList, '[0]..app_id');
            }
        } else {
            //上次手动选中的appid
            let websitConfig = JSON.parse(storageUtil.local.get(WEBSITE_CONFIG));
            let localSelectedAppId = websitConfig ? websitConfig[RECENT_LOGIN_USER_SELECTED_APP_ID] : '';
            // 判断记住的应用，在应用列表中，是否还存在，若存在，则使用,否则，不用
            let matchAppList = _.find(props.appList, app => app.app_id === localSelectedAppId);
            if (props.selectedAppId) {
                //如果外面选中一个应用，最近登录的用户，默认用此应用
                selectedAppId = props.selectedAppId;
            } else if (matchAppList) {
                //如果外面没有选中应用，但上次在最近登录的用户的应用列表中选中过一个应用，就用上一次选中的应用
                selectedAppId = localSelectedAppId;
            } else {
                //如果上面两种情况都没有，就用应用列表中第一个
                selectedAppId = props.appList[0] ? props.appList[0].app_id : '';
            }
        }
        let selectedAppTerminals = approveAppConfigTerminal(selectedAppId, props.appList);
        this.setState({selectedAppTerminals});
        return {selectedAppId, selectedAppTerminals};
    }
    concatTeamList(props){
        var teamList = [{group_id: '', group_name: Intl.get('user.list.all.teamlist', '全部团队')}];
        if (_.isArray(props.teamlists)){
            teamList = _.concat(teamList,props.teamlists);
        }
        return _.uniq(teamList);
    }

    componentWillReceiveProps(nextProps) {
        let oldAppId = this.state.selectedAppId;
        let selectedAppInfo = this.getSelectedAppObj(nextProps);
        let newAppId = _.get(selectedAppInfo, 'selectedAppId');
        if (oldAppId !== newAppId) {
            this.setState({ selectedAppId: newAppId },
                () => {
                    this.getRecentLoginUsers();
                }
            );
        }
        if (_.isArray(nextProps.teamlists) && !isEqualArray(nextProps.teamlists, this.props.teamlists)){
            this.setState({
                teamlists: this.concatTeamList(nextProps)
            });

        }
    }

    getTodayTimeRange() {
        //默认展示今天的时间
        let timeRange = DateSelectorUtils.getTodayTime();
        return {
            start_time: DateSelectorUtils.getMilliseconds(timeRange.start_time),
            end_time: DateSelectorUtils.getMilliseconds(timeRange.end_time, true)
        };
    }

    getParamsObj() {
        let paramObj = {
            app_id: this.state.selectedAppId,
            login_begin_date: this.state.start_time,
            login_end_date: this.state.end_time,
            page_size: PAGE_SIZE
        };
        if (this.state.lastUserId) {
            paramObj.id = this.state.lastUserId;
        }
        let userType = this.state.user_type;
        if (userType) {
            if (userType === 'valid') { // 排除配置ip和员工所传字段
                paramObj.active_type = userType;
            } else { // 其他用户类型（试用、签约、赠送、培训、员工）
                paramObj.user_type = userType;
            }

        }
        //团队筛选的处理
        if (this.state.team_ids) {
            paramObj.team_ids = this.state.selectedTeamIds.join(',');
        }
        //销售成员筛选
        if (this.state.selectedSalesId && this.state.selectedSalesId !== ALL_MEMBER_VALUE) {
            delete paramObj.team_ids;
            paramObj.sales_id = this.state.selectedSalesId;
        }
        if (this.state.filter_type) {
            paramObj.outdate = this.state.filter_type;
            if (this.state.filter_type === '1') {
                paramObj.end_date = this.state.end_time;
            } else if (this.state.filter_type === '0') {
                paramObj.start_date = this.state.end_time;
            }
        }
        // 多终端参数
        if (this.state.terminal_id) {
            paramObj.terminal_id = this.state.terminal_id;
        }
        return paramObj;
    }

    getRecentLoginUsers() {
        let params = this.getParamsObj();
        if (!this.state.lastUserId) {
            // 获取第一页数据时，展示等待效果，下拉加载时，不展示
            this.setState({ isLoadingUserList: true });
        }
        userAjax.getRecentLoginUsers(params).then((result) => {
            this.handleRecentLoginUsers(result);
        }, (errorMsg) => {
            this.setState({
                isLoadingUserList: false,
                listenScrollBottom: false,
                getUserListErrorMsg: errorMsg || Intl.get('user.list.get.failed', '获取用户列表失败')
            });
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    }

    //获取近期登录用户列表后的处理
    handleRecentLoginUsers(result) {
        let userList = this.state.recentLoginUsers;
        let total = this.state.totalUserSize;
        let lastUserId = this.state.lastUserId;
        if (result && _.isArray(result.data)) {
            if (!this.state.lastUserId) {
                userList = result.data;
            } else {
                userList = userList.concat(result.data);
            }
            lastUserId = _.get(userList, `[${userList.length - 1}].user.user_id`, '');
            total = result.total || 0;
        }

        this.setState({
            isLoadingUserList: false,
            getUserListErrorMsg: '',
            recentLoginUsers: userList,
            totalUserSize: total,
            lastUserId: lastUserId,
            listenScrollBottom: total > userList.length
        });
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
    }

    getAppOptions() {
        var appList = this.props.appList;
        if (!_.isArray(appList) || !appList.length) {
            if (_.isArray(ShareObj.share_app_list) && ShareObj.share_app_list.length) {
                appList = ShareObj.share_app_list;
            } else {
                appList = [];
            }
        }
        return appList.map(function(item) {
            return <Option key={item.app_id} value={item.app_id} title={item.app_name}>{item.app_name}</Option>;
        });
    }

    onSelectedAppChange(app_id) {
        var configKey = RECENT_LOGIN_USER_SELECTED_APP_ID;
        var obj = {};
        obj[configKey] = app_id;
        let selectedAppTerminals = approveAppConfigTerminal(app_id, this.props.appList);
        selectedAppEmitter.emit(selectedAppEmitter.CHANGE_SELECTED_APP, '');
        //设置当前选中应用
        this.setState({
            selectedAppId: app_id,
            lastUserId: '',
            selectedAppTerminals: selectedAppTerminals,
            terminal_id: ''
        }, () => {
            // 客套组织下，直接显示客套产品，所以不用存储
            if (!isKetaoOrganizaion()) {
                setWebsiteConfig(obj);
            }
            this.getRecentLoginUsers();
        });
        //当应用列表重新布局的时候，让顶部导航重新渲染
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    }

    handleScrollBottom = () => {
        this.getRecentLoginUsers();
    }

    hideRightPanel = () => {
        this.setState({
            curShowCustomerId: ''
        }, () => {
            this.closeRightPanel();
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
                userViewShowCustomerUserListPanel: true,
                hideRightPanel: this.hideRightPanel
            }
        });
    }

    getTableColumns() {
        return [
            {
                title: Intl.get('common.username', '用户名'),
                dataIndex: 'account_name',
                key: 'account_name',
                width: '100px',
                className: 'has-filter',
                render: function($1, rowData, idx) {
                    var user_name = rowData.user && rowData.user.user_name || '';
                    var user_id = rowData.user && rowData.user.user_id || '';
                    const isShown = _.find(rowData.apps, app => {
                        return app.user_exception;
                    });

                    return (
                        <div title={user_name}>
                            {hasPrivilege(userManagePrivilege.USER_QUERY) && isShown ?
                                <i className="iconfont icon-warn-icon unnormal-login"
                                    title={Intl.get('user.login.abnormal', '异常登录')} /> : null}
                            {user_name}
                            <input type="hidden" className="hidden_user_id" value={user_id} />
                        </div>
                    );
                }
            },
            {
                title: Intl.get('common.nickname', '昵称'),
                dataIndex: 'account_nickname',
                key: 'account_nickname',
                width: '100px',
                className: 'has-filter',
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
                width: '100px',
                className: 'has-filter owner-customer-wrap',
                render: ($1, rowData, idx) => {
                    const customer_name = _.get(rowData, 'customer.customer_name', '');
                    const customer_id = _.get(rowData, 'customer.customer_id', '');
                    return (
                        <div
                            title={customer_name}
                            className="owner-customer"
                            data-tracename="点击所属客户列"
                        >
                            {customer_name}
                            <input type="hidden" className="hidden_customer_id" value={customer_id}/>
                        </div>
                    );
                }
            },
            {
                title: Intl.get('common.product.name','产品名称'),
                dataIndex: 'apps',
                key: 'appName',
                width: '100px',
                render: function(apps, rowData, idx) {
                    return getAppNameList(apps, rowData);
                }
            },
            {
                title: Intl.get('common.status', '状态'),
                dataIndex: 'apps',
                width: Oplate.hideUserManageItem ? '100px' : '75px',
                key: 'status',
                render: function(apps, rowData, idx) {
                    return getAppStatusList(apps, rowData);
                }
            },
            {
                title: Intl.get('common.type', '类型'),
                dataIndex: 'apps',
                width: '75px',
                key: 'accountType',
                render: function(apps, rowData, idx) {
                    return getAccountTypeList(apps, rowData);
                }
            },
            {
                title: Intl.get('user.time.start', '开通时间'),
                dataIndex: 'grant_create_date',
                width: Oplate.hideUserManageItem ? '120px' : '85px',
                key: 'grant_create_date',
                className: 'has-filter',
                render: function($1, rowData, idx) {
                    return getTimeList('create_time', rowData);
                }
            },
            {
                title: Intl.get('user.time.end', '到期时间'),
                dataIndex: 'end_date',
                width: Oplate.hideUserManageItem ? '120px' : '85px',
                key: 'end_date',
                className: 'has-filter',
                render: function($1, rowData, idx) {
                    return getTimeList('end_time', rowData);
                }
            },
            {
                title: Intl.get('common.belong.sales', '所属销售'),
                dataIndex: 'member_name',
                width: '85px',
                key: 'member_name',
                className: 'has-filter',
                render: function(sales, rowData, idx) {
                    var sales_name = rowData.sales && rowData.sales.sales_name || '';
                    return (
                        <div title={sales_name}>{sales_name}</div>
                    );
                }
            },
            {
                title: Intl.get('user.login.duration', '在线时长'),
                dataIndex: 'online_time',
                width: '85px',
                key: 'online_time',
                className: 'has-filter',
                render: (billsec, rowData, idx) => {
                    let onLineTime = 0;
                    if (rowData && _.isArray(rowData.apps) && rowData.apps[0]) {
                        // 后面返回的单位是毫秒，先转成秒，使用公共的方法
                        onLineTime = (rowData.apps[0].online_time || 0) / 1000;
                    }
                    return (
                        <div>{TimeUtil.getFormatTime(onLineTime)}</div>
                    );
                }
            },
            {
                title: Intl.get('user.login.times', '登录次数'),
                dataIndex: 'logins',
                key: 'logins',
                className: 'has-filter',
                width: '100px',
                align: 'right',
                render: function(text, rowData, idx) {
                    let loginCount = 0;
                    if (rowData && _.isArray(rowData.apps) && rowData.apps[0]) {
                        loginCount = rowData.apps[0].logins || 0;
                    }
                    return (
                        <div title={loginCount}>{loginCount} </div>
                    );
                }
            }, {
                title: Intl.get('user.login.days', '活跃天数'),
                dataIndex: 'login_day_count',
                key: 'login_day_count',
                width: '100px',
                className: 'has-filter',
                align: 'right',
                render: function(text, rowData, idx) {
                    let loginDays = 0;
                    if (rowData && _.isArray(rowData.apps) && rowData.apps[0]) {
                        loginDays = rowData.apps[0].login_day_count || 0;
                    }
                    return (
                        <div title={loginDays}>{loginDays}</div>
                    );
                }
            },
            {
                title: Intl.get('common.remark', '备注'),
                dataIndex: 'user',
                key: 'description',
                width: '100px',
                render: function(user, rowData, idx) {
                    return (
                        <div title={user.description}>{user.description}</div>
                    );
                }
            }
        ];
    }

    onSelectDate(start_time, end_time) {
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        this.setState({
            start_time: start_time,
            end_time: end_time,
            lastUserId: '',
        }, () => {
            this.getRecentLoginUsers();
        });
    }

    onUserTypeChange(type) {
        this.setState({
            user_type: type,
            lastUserId: '',
        }, () => {
            this.getRecentLoginUsers();
        });
    }

    // 是否过期类型的选择
    onFilterTypeChange(type) {
        this.setState({
            filter_type: type,
            lastUserId: '',
        }, () => {
            this.getRecentLoginUsers();
        });
    }

    // 修改所选中的团队
    onTeamChange(team_ids) {
        let selectedTeamIds = [team_ids];
        if (team_ids) {
            //跟据实际选中的id，获取包含下级团队的已选团队的列表teamTotalArr
            let teamTotalArr = _.union([], traversingSelectTeamTree(this.props.teamTreeList, team_ids));
            //跟据包含下级团队的所有团队详细的列表teamTotalArr，获取包含所有的团队id的数组totalRequestTeams
            selectedTeamIds = _.union(selectedTeamIds, getRequestTeamIds(teamTotalArr));
            RecentUserAction.getSelectedTeamSalesMembers({selectedTeamIds: selectedTeamIds, teamLists: _.get(this.props, 'teamlists', [])} );
            // 若是选中成员后，再次切换团队，则需要将成员显示为选中团队下全部成员
            if (this.state.selectedSalesId) {
                this.setState({
                    selectedSalesId: ALL_MEMBER_VALUE
                });
            }
        } else { // 切换到全部团队的情况
            RecentUserAction.getSelectedTeamSalesMembers();
        }

        this.setState({
            team_ids: team_ids,
            lastUserId: '',
            selectedTeamIds: selectedTeamIds
        }, () => {
            this.getRecentLoginUsers();
        });
    }

    onMemberChange = (value) => {
        this.setState({
            selectedSalesId: value,
            lastUserId: ''
        }, () => {
            this.getRecentLoginUsers();
        });
    };
    // 团队和成员筛选框
    renderTeamMembersSelect = () => {
        let memberList = this.state.memberList.data;
        let memberOptions = memberList.map((item, index) => {
            return <Option value={item.id} key={index}>{item.name}</Option>;
        });
        memberOptions.unshift(
            <Option value={ALL_MEMBER_VALUE} key={ALL_MEMBER_VALUE}>
                {Intl.get('common.memeber.all', '全部成员')}
            </Option>
        );
        return (
            <div className="team-member-select inline-block btn-item">
                <AntcSelect
                    value={this.state.selectedSalesId}
                    onChange={this.onMemberChange}
                    showSearch={true}
                    className="team-member-select-options"
                    filterOption={(input, option) => ignoreCase(input, option)}
                >
                    {
                        memberOptions
                    }
                </AntcSelect>
            </div>
        );
    };

    // 筛选终端类型
    onSelectTerminalsType = (value) => {
        this.setState({
            terminal_id: value,
            lastUserId: ''
        }, () => {
            this.getRecentLoginUsers();
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

    handleRefresh = () => {
        this.setState({
            lastUserId: ''
        }, () => {
            this.getRecentLoginUsers();
        });
    }

    renderRecentLoginHeader(){
        let appOptions = this.getAppOptions();
        let memberList = this.state.memberList.data; // 成员数据
        let teamlists = this.state.teamlists; // 团队数据
        let userTypeSelectedList = _.concat(userTypeList, {name: Intl.get('analysis.exclude.ip.staff', '排除配置ip和员工'), value: 'valid'});
        return (
            <div className="recent_login_header-wrap">
                <ButtonZones>
                    <div className="btn-item-container">
                        <div className="inline-block recent-login-time-select btn-item">
                            <DatePicker
                                disableDateAfterToday={true}
                                range="day"
                                onSelect={this.onSelectDate.bind(this)}>
                                <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                                <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                                <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                            </DatePicker>
                        </div>
                        {/**
                         * 团队筛选框 由于teamlists团队数据中，包括全部团队数据，所以需要判断是否大于>2
                         * */}
                        {
                            _.get(teamlists, 'length', 0) > 2 ? (
                                <div className="inline-block recent-login-filter-type-select btn-item">
                                    <SelectFullWidth
                                        value={this.state.team_ids}
                                        onChange={this.onTeamChange.bind(this)}
                                    >
                                        {
                                            _.map(teamlists, (teamItem, index) => {
                                                return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                                            })
                                        }
                                    </SelectFullWidth>
                                </div>
                            ) : null
                        }

                        {/**
                         * 成员筛选框
                         * */}
                        {_.get(memberList, 'length', 0) > 1 ? this.renderTeamMembersSelect() : null}
                        {/**
                         * 应用筛选框
                         * */}
                        <div className="inline-block recent-login-app-select btn-item">
                            <SelectFullWidth
                                optionFilterProp="children"
                                showSearch
                                minWidth={120}
                                value={this.state.selectedAppId}
                                onChange={this.onSelectedAppChange.bind(this)}
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
                        {/**
                         * 用户类型筛选框
                         * */}
                        <div className="inline-block recent-login-type-select btn-item">
                            <SelectFullWidth
                                minWidth={120}
                                value={this.state.user_type}
                                onChange={this.onUserTypeChange.bind(this)}
                            >
                                {
                                    _.map(userTypeSelectedList, (userType, idx) => {
                                        return <Option key={idx} value={userType.value}>{userType.name}</Option>;
                                    })
                                }
                            </SelectFullWidth>
                        </div>
                        {/**
                         * 用户状态筛选框
                         * */}
                        <div className="inline-block btn-item select-init-width">
                            <SelectFullWidth
                                value={this.state.filter_type}
                                onChange={this.onFilterTypeChange.bind(this)}
                            >

                                {
                                    _.map(filterTypeList, (filterType, index) => {
                                        return <Option key={index} value={filterType.value}>{filterType.name}</Option>;
                                    })
                                }
                            </SelectFullWidth>
                        </div>
                        <RefreshButton
                            handleRefresh={this.handleRefresh}
                            className="btn-item"
                        />
                    </div>
                </ButtonZones>
            </div>
        );
    }

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.isLoadingUserList &&
            this.state.recentLoginUsers.length >= 10 && !this.state.listenScrollBottom;
    };

    renderTableContent = () => {
        const isLoading = this.state.isLoadingUserList;
        let doNotShow = false;
        if (isLoading && this.state.lastUserId === '') {
            doNotShow = true;
        }
        let tableHeight = commonMethodUtil.getTableContainerHeight(this.props.adaptiveHeight);
        let columns = this.getTableColumns();
        // 用户类型筛选后，在指定的类型下，不显示类型列
        if (this.state.user_type !== '') {
            columns = _.filter(columns, item => {
                return item.key !== 'accountType';
            });
        }

        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: isLoading,
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('common.no.more.user', '没有更多用户了')
        };
        return (
            <div
                className="user-list-table-wrap scroll-load"
                id="new-table"
                style={{ display: doNotShow ? 'none' : 'block' }}
            >
                <div style={{ height: tableHeight }} ref="recentLoginUsersTable">
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        util={{
                            zoomInSortArea: true
                        }}
                        dataSource={this.state.recentLoginUsers}
                        columns={columns}
                        pagination={false}
                        rowClassName={this.handleRowClassName}
                        locale={{ emptyText: this.state.getUserListErrorMsg || Intl.get('user.active.no.data.tips', '暂无活跃用户')}}
                        scroll={{ x: 800, y: tableHeight }}
                    />
                </div>
                {this.state.totalUserSize ?
                    <BottomTotalCount totalCount={<ReactIntl.FormattedMessage
                        id="user.total.data"
                        defaultMessage={'共{number}个用户'}
                        values={{
                            'number': this.state.totalUserSize
                        }}
                    />}/> : null
                }
            </div>
        );
    };

    renderLoadingBlock = () => {
        if (this.state.isLoadingUserList) {
            return (
                <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
            );
        } else {
            return null;
        }
    };

    render() {
        return (
            <div className="recent-login-users-container" data-tracename="近期登录用户列表">
                {this.renderRecentLoginHeader()}
                {this.renderLoadingBlock()}
                <div className="recent-login-users-table-wrap">
                    {this.renderTableContent()}
                </div>
            </div>
        );
    }
}
RecentLoginUsers.propTypes = {
    teamlists: PropTypes.array,
    teamTreeList: PropTypes.array,
    selectedAppId: PropTypes.string,
    appList: PropTypes.array,
    hideRecentLoginPanel: PropTypes.func,
    adaptiveHeight: PropTypes.number
};
export default adaptiveHeightHoc(RecentLoginUsers);
