/**
 * 近期登录用户列表
 * Created by wangliping on 2017/8/31.
 */
require('../css/recent-login-user-list.less');
import { Select} from 'antd';
import ShareObj from '../util/app-id-share-util';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import { RightPanelClose } from 'CMP_DIR/rightPanel/index';
import { AntcDatePicker as DatePicker } from 'antc';
import DateSelectorUtils from 'CMP_DIR/datepicker/utils';
import { RightPanel } from 'CMP_DIR/rightPanel';
import { topNavEmitter } from 'PUB_DIR/sources/utils/emitters';
import { scrollBarEmitter } from 'PUB_DIR/sources/utils/emitters';
import { userTypeList, filterTypeList } from 'PUB_DIR/sources/utils/consts';
import {
    getUserByFromUserList,
    getAppNameList,
    getAppStatusList,
    getAccountTypeList,
    getTimeList
} from '../util/app-user-util';
import userAjax from '../ajax/app-user-ajax';
const Option = Select.Option;
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { setWebsiteConfig } from 'LIB_DIR/utils/websiteConfig';
import { storageUtil } from 'ant-utils';
import PropTypes from 'prop-types';
import { traversingSelectTeamTree, getRequestTeamIds } from 'PUB_DIR/sources/utils/common-method-util';
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
import { userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';

class RecentLoginUsers extends React.Component {
    constructor(props) {
        super(props);
        let timeRange = this.getTodayTimeRange();
        var teamlists = this.concatTeamList(this.props);
        this.state = {
            ...RecentUserStore.getState(),
            selectedAppId: this.getSelectedAppId(this.props),
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
        };
    }

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        RecentUserStore.listen(this.onStoreChange);
        // 关闭用户详情面板
        emitter.on('user_detail_close_right_panel' , this.closeRightPanel);
        RecentUserAction.getSaleMemberList(commonMethodUtil.getParamByPrivilege());
        this.getRecentLoginUsers();
        $(this.refs.recentLoginUsersTable).on('click', 'tr', this.onRowClick.bind(this));
    }
    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        RecentUserStore.unlisten(this.onStoreChange);
        // 关闭用户详情面板
        emitter.removeListener('user_detail_close_right_panel' , this.closeRightPanel);
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


    closeRightPanel() {
        $('.recent-login-users-table-wrap .current_row').removeClass('current_row');
    }

    getSelectedAppId(props) {
        var selectedAppId = '';
        //上次手动选中的appid
        let websitConfig = JSON.parse(storageUtil.local.get(WEBSITE_CONFIG));
        let localSelectedAppId = websitConfig ? websitConfig[RECENT_LOGIN_USER_SELECTED_APP_ID] : '';
        if (props.selectedAppId) {
            //如果外面选中一个应用，最近登录的用户，默认用此应用
            selectedAppId = props.selectedAppId;
        } else if (localSelectedAppId) {
            //如果外面没有选中应用，但上次在最近登录的用户的应用列表中选中过一个应用，就用上一次选中的应用
            selectedAppId = localSelectedAppId;
        } else {
            //如果上面两种情况都没有，就用应用列表中第一个
            selectedAppId = props.appList[0] ? props.appList[0].app_id : '';
        }
        return selectedAppId;
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
        let newAppId = this.getSelectedAppId(nextProps);
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
        if (this.state.user_type) {
            paramObj.user_type = this.state.user_type;
        }
        //团队筛选的处理
        if (this.state.team_ids) {
            let selectTeamId = this.state.team_ids;
            //实际要传到后端的团队,默认是选中的团队
            let totalRequestTeams = [selectTeamId];
            //跟据实际选中的id，获取包含下级团队的已选团队的列表teamTotalArr
            let teamTotalArr = _.union(teamTotalArr, traversingSelectTeamTree(this.props.teamTreeList, selectTeamId));
            //跟据包含下级团队的所有团队详细的列表teamTotalArr，获取包含所有的团队id的数组totalRequestTeams
            totalRequestTeams = _.union(totalRequestTeams, getRequestTeamIds(teamTotalArr));
            paramObj.team_ids = totalRequestTeams.join(',');
        }
        //销售成员筛选
        if (this.state.selectedSalesId && this.state.selectedSalesId !== ALL_MEMBER_VALUE) {
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
        //设置当前选中应用
        this.setState({
            selectedAppId: app_id,
            lastUserId: '',
        }, () => {
            setWebsiteConfig(obj);
            this.getRecentLoginUsers();
        });
        //当应用列表重新布局的时候，让顶部导航重新渲染
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    }

    handleScrollBottom = () => {
        this.getRecentLoginUsers();
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
                            {hasPrivilege('GET_LOGIN_EXCEPTION_USERS') && isShown ?
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
                className: 'has-filter',
                render: function($1, rowData, idx) {
                    var customer_name = rowData.customer && rowData.customer.customer_name || '';
                    return (
                        <div title={customer_name}>{customer_name}</div>
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
            }, {
                title: Intl.get('user.login.times', '登录次数'),
                dataIndex: 'logins',
                key: 'logins',
                width: '100px',
                className: 'has-filter',
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
        this.setState({ start_time: start_time, end_time: end_time, lastUserId: '' });
        setTimeout(() => this.getRecentLoginUsers());
    }

    onUserTypeChange(type) {
        this.setState({ user_type: type, lastUserId: '' });
        setTimeout(() => this.getRecentLoginUsers());
    }

    // 是否过期类型的选择
    onFilterTypeChange(type) {
        this.setState({ filter_type: type, lastUserId: '' });
        setTimeout(() => this.getRecentLoginUsers());
    }

    // 修改所选中的团队
    onTeamChange(team_ids) {
        this.setState({ team_ids: team_ids, lastUserId: '' });
        setTimeout(() => this.getRecentLoginUsers());
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
                <Select
                    value={this.state.selectedSalesId}
                    onChange={this.onMemberChange}
                    showSearch={true}
                    className="team-member-select-options"
                    filterOption={(input, option) => ignoreCase(input, option)}
                >
                    {
                        memberOptions
                    }
                </Select>
            </div>
        );
    };
    renderRecentLoginHeader(){
        let appOptions = this.getAppOptions();
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
                         * 团队筛选框
                         * */}
                        <div className="inline-block recent-login-filter-type-select btn-item">
                            <SelectFullWidth
                                value={this.state.team_ids}
                                onChange={this.onTeamChange.bind(this)}
                            >
                                {
                                    _.map(this.state.teamlists, (teamItem, index) => {
                                        return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                                    })
                                }
                            </SelectFullWidth>
                        </div>
                        {/**
                         * 成员筛选框
                         * */}
                        {this.renderTeamMembersSelect()}
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
                        {/**
                         * 用户类型筛选框
                         * */}
                        <div className="inline-block recent-login-type-select btn-item">
                            <Select
                                value={this.state.user_type}
                                onChange={this.onUserTypeChange.bind(this)}
                            >
                                {
                                    _.map(userTypeList, (userType, idx) => {
                                        return <Option key={idx} value={userType.value}>{userType.name}</Option>;
                                    })
                                }
                            </Select>
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
        let tableHeight = commonMethodUtil.getTableContainerHeight();
        const columns = this.getTableColumns();

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

    render() {
        return (
            <div className="recent-login-users-container" data-tracename="近期登录用户列表">
                {this.renderRecentLoginHeader()}
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
    hideRecentLoginPanel: PropTypes.func
};
export default RecentLoginUsers;
