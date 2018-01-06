/**
 * 近期登录用户列表
 * Created by wangliping on 2017/8/31.
 */
require("../css/recent-login-user-list.less");
import {Select, Table} from "antd";
import ShareObj from "../util/app-id-share-util";
import SelectFullWidth from "CMP_DIR/select-fullwidth";
import TopNav from "CMP_DIR/top-nav";
import GeminiScrollBar from "CMP_DIR/react-gemini-scrollbar";
import {RightPanelClose} from "CMP_DIR/rightPanel/index";
import DatePicker from "CMP_DIR/datepicker";
import DateSelectorUtils from 'CMP_DIR/datepicker/utils';
import {RightPanel} from "CMP_DIR/rightPanel";
import {topNavEmitter} from "PUB_DIR/sources/utils/emitters";
import {scrollBarEmitter} from "PUB_DIR/sources/utils/emitters";
import {userTypeList, filterTypeList} from "PUB_DIR/sources/utils/consts";
import {getUserByFromUserList, getAppNameList, getAppStatusList, getAccountTypeList, getTimeList } from "../util/app-user-util";
import userAjax from "../ajax/app-user-ajax";
import UserDetail from "./user-detail";
const Option = Select.Option;
import {hasPrivilege} from 'CMP_DIR/privilege/checker';

//用于布局的高度
const LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 130,
    BOTTOM_DISTANCE: 50
};

const PAGE_SIZE = 20;//一页获取20条数据

class RecentLoginUsers extends React.Component {
    constructor(props) {
        super(props);
        let timeRange = this.getTodayTimeRange();
        this.state = {
            selectedAppId: this.props.appList[0] ? this.props.appList[0].app_id : "",
            start_time: timeRange.start_time,
            end_time: timeRange.end_time,
            user_type: "",
            recentLoginUsers: [],
            totalUserSize: 0,
            pageNum: 1,//当前页数（第几页）
            isLoadingUserList: false,//是否正在获取近期登录用户列表
            getUserListErrorMsg: "",//错误提示内容
            listenScrollBottom: true,//是否监听滚动
            isShowUserDetail: false,//是否展示用户详情
            userId: '',//要查看详情的用户id
            curUserDetail: {},//当前要查看的用户详情
            isShownExceptionTab: false,//是否展示异常登录信息
            filter_type: ""  // 是否过期，默认（全部）
        };
    }

    componentDidMount() {
        this.getRecentLoginUsers();
        $(this.refs.recentLoginUsersTable).on("click", "tr", this.onRowClick.bind(this));
    }

    onRowClick(event) {
        let target = event.target;
        if ($(target).closest(".ant-table-selection-column").length) {
            return;
        }
        let user_id = $(event.currentTarget).find(".hidden_user_id").val();
        if (!user_id) {
            return;
        }
        $(event.currentTarget).addClass("current_row").siblings().removeClass("current_row");
        let userObj = getUserByFromUserList(this.state.recentLoginUsers, user_id);
        userObj.isShownExceptionTab = _.find(userObj.apps, app =>{return app.exception_mark_date})? true: false;
        this.setState({
            isShowUserDetail: true,
            userId: user_id,
            curUserDetail: userObj
        });
    }

    closeRightPanel() {
        this.setState({
            isShowUserDetail: false
        });
        $(".recent-login-users-table-wrap .current_row").removeClass("current_row");
    }

    componentWillReceiveProps(nextProps) {
        let oldAppId = this.state.selectedAppId;
        let newAppId = nextProps.appList[0] ? nextProps.appList[0].app_id : "";
        if (oldAppId != newAppId) {
            this.setState({selectedAppId: newAppId}, this.getRecentLoginUsers());
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
            page_num: this.state.pageNum,
            page_size: PAGE_SIZE,
            logins_min: 1
        };
        if (this.state.user_type) {
            paramObj.user_type = this.state.user_type;
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
        if (this.state.pageNum == 1) {
            // 获取第一页数据时，展示等待效果，下拉加载时，不展示
            this.setState({isLoadingUserList: true});
        }
        userAjax.getRecentLoginUsers(params).then((result) => {
            this.handleRecentLoginUsers(result);
        }, (errorMsg) => {
            this.setState({
                isLoadingUserList: false,
                listenScrollBottom: false,
                getUserListErrorMsg: errorMsg || Intl.get("user.list.get.failed", "获取用户列表失败")
            });
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    }

    //获取近期登录用户列表后的处理
    handleRecentLoginUsers(result) {
        let userList = this.state.recentLoginUsers;
        let total = this.state.totalUserSize;
        if (result && _.isArray(result.data)) {
            if (this.state.pageNum == 1) {
                userList = result.data;
            } else {
                userList = userList.concat(result.data);
            }
            this.state.pageNum++;
            total = result.total || 0;
        }
        this.setState({
            isLoadingUserList: false,
            getUserListErrorMsg: "",
            recentLoginUsers: userList,
            totalUserSize: total,
            pageNum: this.state.pageNum,
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
        return appList.map(function (item) {
            return <Option key={item.app_id} value={item.app_id} title={item.app_name}>{item.app_name}</Option>
        });
    }

    onSelectedAppChange(app_id) {
        //设置当前选中应用
        this.setState({
            selectedAppId: app_id,
            pageNum: 1,
        }, () => this.getRecentLoginUsers());
        //当应用列表重新布局的时候，让顶部导航重新渲染
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    }

    handleScrollBottom() {
        this.getRecentLoginUsers();
    }

    getTableColumns() {
        var _this = this;
        var columns = [
            {
                title: Intl.get("common.username", "用户名"),
                dataIndex: 'account_name',
                key: 'account_name',
                width: null,
                className: 'has-filter',
                //sorter: sortable,
                render: function ($1, rowData, idx) {
                    var user_name = rowData.user && rowData.user.user_name || '';
                    var user_id = rowData.user && rowData.user.user_id || '';
                    const isShown = _.find(rowData.apps, app => {
                        return app.user_exception
                    });

                    return (
                        <div title={user_name}>
                            {hasPrivilege("GET_LOGIN_EXCEPTION_USERS") && isShown ? <i className="iconfont icon-warn-icon unnormal-login"
                                          title={Intl.get("user.login.abnormal", "异常登录")}/> : null}
                            {user_name}
                            <input type="hidden" className="hidden_user_id" value={user_id}/>
                        </div>
                    );
                }
            },
            {
                title: Intl.get("common.nickname", "昵称"),
                dataIndex: 'account_nickname',
                key: 'account_nickname',
                width: null,
                className: 'has-filter',
                //sorter: sortable,
                render: function ($1, rowData, idx) {
                    var nick_name = rowData.user && rowData.user.nick_name || '';
                    return (
                        <div title={nick_name}>
                            {nick_name}
                        </div>
                    );
                }
            },
            {
                title: Intl.get("common.belong.customer", "所属客户"),
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: null,
                className: 'has-filter',
                //sorter: sortable,
                render: function ($1, rowData, idx) {
                    var customer_name = rowData.customer && rowData.customer.customer_name || '';
                    return (
                        <div title={customer_name}>{customer_name}</div>
                    );
                }
            },
            {
                title: Intl.get("common.app.name", "应用名称"),
                dataIndex: 'apps',
                key: 'appName',
                width: null,
                render: function (apps, rowData, idx) {
                    return getAppNameList(apps, rowData);
                }
            },
            {
                title: Intl.get("common.status", "状态"),
                dataIndex: 'apps',
                width: Oplate.hideUserManageItem ? '100px' : '75px',
                key: 'status',
                render: function (apps, rowData, idx) {
                    return getAppStatusList(apps, rowData);
                }
            },
            {
                title: Intl.get("common.type", "类型"),
                dataIndex: 'apps',
                width: '75px',
                key: 'accountType',
                render: function (apps, rowData, idx) {
                    return getAccountTypeList(apps, rowData);
                }
            },
            {
                title: Intl.get("user.time.start", "开通时间"),
                dataIndex: 'grant_create_date',
                width: Oplate.hideUserManageItem ? '120px' : '85px',
                key: 'grant_create_date',
                className: 'has-filter',
                //sorter: sortable,
                render: function ($1, rowData, idx) {
                    return getTimeList('create_time', rowData);
                }
            },
            {
                title: Intl.get("user.time.end", "到期时间"),
                dataIndex: 'end_date',
                width: Oplate.hideUserManageItem ? '120px' : '85px',
                key: 'end_date',
                className: 'has-filter',
                //sorter: sortable,
                render: function ($1, rowData, idx) {
                    return getTimeList('end_time', rowData);
                }
            },
            {
                title: Intl.get("common.belong.sales", "所属销售"),
                dataIndex: 'member_name',
                width: '85px',
                key: 'member_name',
                className: 'has-filter',
                //sorter: sortable,
                render: function (sales, rowData, idx) {
                    var sales_name = rowData.sales && rowData.sales.sales_name || '';
                    return (
                        <div title={sales_name}>{sales_name}</div>
                    );
                }
            }, {
                title: Intl.get("user.login.times", "登录次数"),
                dataIndex: 'logins',
                key: 'logins',
                width: '100px',
                className: 'has-filter',
                //sorter: sortable,
                render: function (text, rowData, idx) {
                    let loginCount = 0;
                    if (rowData && _.isArray(rowData.apps) && rowData.apps[0]) {
                        loginCount = rowData.apps[0].logins || 0;
                    }
                    return (
                        <div title={loginCount}>{loginCount} </div>
                    );
                }
            }, {
                title: Intl.get("user.login.days", "登录天数"),
                dataIndex: 'login_day_count',
                key: 'login_day_count',
                width: '100px',
                className: 'has-filter',
                //sorter: sortable,
                render: function (text, rowData, idx) {
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
                title: Intl.get("common.remark", "备注"),
                dataIndex: 'user',
                key: 'description',
                width: null,
                render: function (user, rowData, idx) {
                    return (
                        <div title={user.description}>{user.description}</div>
                    );
                }
            }
        ];
        return columns;
    }

    onSelectDate(start_time, end_time) {
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf("day").valueOf();
        }
        this.setState({start_time: start_time, end_time: end_time, pageNum: 1});
        setTimeout(() => this.getRecentLoginUsers());
    }

    onUserTypeChange(type) {
        this.setState({user_type: type, pageNum: 1});
        setTimeout(() => this.getRecentLoginUsers());
    }
    // 是否过期类型的选择
    onFilterTypeChange(type) {
        this.setState({filter_type: type, pageNum: 1});
        setTimeout(() => this.getRecentLoginUsers());
    }

    render() {
        let divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        let appOptions = this.getAppOptions();
        let columns = this.getTableColumns();
        return (
            <div className="recent-login-users-container" data-tracename="近期登录用户列表">
                <TopNav>
                    <div className="inline-block recent-login-time-select">
                        <DatePicker
                            disableDateAfterToday={true}
                            range="day"
                            onSelect={this.onSelectDate.bind(this)}>
                            <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                            <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                            <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                            <DatePicker.Option
                                value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                            <DatePicker.Option
                                value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                            <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                        </DatePicker>
                    </div>
                    <div className="inline-block recent-login-app-select">
                        <SelectFullWidth
                            optionFilterProp="children"
                            showSearch
                            minWidth={120}
                            value={this.state.selectedAppId}
                            onChange={this.onSelectedAppChange.bind(this)}
                            notFoundContent={!appOptions.length ? Intl.get("user.no.app", "暂无应用") : Intl.get("user.no.related.app", "无相关应用")}
                        >
                            {appOptions}
                        </SelectFullWidth>
                    </div>

                    <div className="inline-block recent-login-type-select">
                        <Select
                            value={this.state.user_type}
                            onChange={this.onUserTypeChange.bind(this)}
                        >
                            {
                                _.map(userTypeList, (userType, idx) => {
                                    return <Option key={idx} value={userType.value}>{userType.name}</Option>
                                })
                            }
                        </Select>
                    </div>
                    <div className="inline-block recent-login-filter-type-select">
                            <SelectFullWidth
                                value={this.state.filter_type}
                                onChange={this.onFilterTypeChange.bind(this)}
                            >
                                {
                                    _.map(filterTypeList, (filterType, index) => {
                                        return <Option key={index} value={filterType.value}>{filterType.name}</Option>
                                    })
                                }
                            </SelectFullWidth>
                    </div>
                    <RightPanelClose title={Intl.get("common.app.status.close", "关闭")}
                                     onClick={this.props.hideRecentLoginPanel}/>
                </TopNav>
                <div className="recent-login-users-table-wrap splice-table">
                    <div className="user-list-thead custom-thead">
                        <Table
                            columns={columns}
                            dataSource={[]}
                            pagination={false}
                        />
                    </div>
                    <div className="user-list-tbody custom-tbody" style={{height: divHeight}}
                         ref="recentLoginUsersTable">
                        <GeminiScrollBar
                            listenScrollBottom={this.state.listenScrollBottom}
                            handleScrollBottom={this.handleScrollBottom.bind(this)}
                            itemCssSelector=".recent-login-users-container .ant-table-tbody>tr"
                        >
                            <Table
                                dataSource={this.state.recentLoginUsers}
                                columns={columns}
                                loading={this.state.isLoadingUserList}
                                pagination={false}
                                locale={{emptyText: this.state.getUserListErrorMsg || Intl.get("common.no.data", "暂无数据")}}
                            />
                        </GeminiScrollBar>
                    </div>
                    {this.state.totalUserSize ?
                        <div className="summary_info">
                            <ReactIntl.FormattedMessage
                                id="user.total.data"
                                defaultMessage={`共{number}个用户`}
                                values={{
                                    'number': this.state.totalUserSize
                                }}
                            />
                        </div> : null
                    }
                </div>
                <RightPanel
                    className="app_user_manage_rightpanel"
                    showFlag={this.state.isShowUserDetail}
                >
                    <UserDetail userId={this.state.userId}
                                appLists={this.state.curUserDetail.apps}
                                isShownExceptionTab={this.state.curUserDetail.isShownExceptionTab}
                                selectedAppId={this.state.selectedAppId}
                                closeRightPanel={this.closeRightPanel.bind(this)}
                    />
                </RightPanel>
            </div>
        );
    }
}

export default RecentLoginUsers;