//时间范围选择
import DatePicker from "../../../../components/datepicker";
var Alert = require("antd").Alert;
// 加载时的动作显示
var Spinner = require("../../../../components/spinner");
var SelectFullWidth = require("../../../../components/select-fullwidth");
var Select = require("antd").Select;
var Option = Select.Option;
var AppUserUtil = require("../util/app-user-util");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
//用户日志右侧面板常量
var USER_LOG_LAYOUT_CONSTANTS = AppUserUtil.USER_LOG_LAYOUT_CONSTANTS;
var TimeSeriesBarChart = require("../../../../components/timeseries-barchart");
var ShareObj = require("../util/app-id-share-util");
var SingleUserLogAction = require('../action/single_user_log_action');
var SingleUserLogStore = require('../store/single_user_log_store');
var SearchInput = require("../../../../components/searchInput");
var UserAuditLogStore = require("../store/user_audit_log_store");
// 没有数据的提示信息
var NoMoreDataTip = require("../../../../components/no_more_data_tip");
import TimeUtil from '../../../../public/sources/utils/time-format-util';
import {Radio, Checkbox} from 'antd';
const RadioGroup = Radio.Group;

var SingleUserLogBasic = React.createClass({
    getDefaultProps: function () {
        return {
            userId: '1'
        };
    },
    getInitialState: function () {
        return {
            selectValue: 'LoginFrequency',
            checked: true,
            ...this.getStateData()
        };
    },
    onStateChange: function () {
        this.setState(this.getStateData());
    },
    getStateData: function () {
        return SingleUserLogStore.getState();
    },
    getSingleUserLogInfoByApp(userId) {
        let queryObj = {
            user_id: userId
        };
        if (this.state.startTime) {
            queryObj.starttime = this.state.startTime;
        }
        if (this.state.endTime) {
            queryObj.endtime = this.state.endTime
        }
        if (this.state.searchName) {
            queryObj.search = ((this.state.searchName).toString().trim()).toLowerCase()
        }
        if (this.state.typeFilter) {
            queryObj.type_filter = this.state.typeFilter
        }
        SingleUserLogAction.getSingleUserAppList(queryObj);
    },

    componentDidMount: function () {
        SingleUserLogAction.dismiss();
        SingleUserLogStore.listen(this.onStateChange);
        let userId = this.props.userId;
        this.getSingleUserLogInfoByApp(userId);
    },
    componentWillReceiveProps: function (nextProps) {
        var newUserId = nextProps.userId;
        if (this.props.userId != newUserId) {
            setTimeout(() => {
                SingleUserLogAction.changUserIdKeepSearch();
                this.getSingleUserLogInfoByApp(newUserId);
            }, 0);
        }
    },

    componentWillUnmount: function () {
        SingleUserLogStore.unlisten(this.onStateChange);
        UserAuditLogStore.getState().selectAppId = '';
    },

    // 获取单个用户的日志列表
    getSingleUserAuditLogList(queryParams) {
        let queryObj = {
            user_id: this.props.userId,
            appid: queryParams && queryParams.appid ? queryParams.appid : this.state.selectedLogAppId,
            page_size: this.state.pageSize,
            page: queryParams && queryParams.page ? queryParams.page : this.state.curPage
        };
        let starttime = queryParams && 'starttime' in queryParams ? queryParams.starttime : this.state.startTime;
        if (starttime) {
            queryObj.starttime = starttime;
        }

        let endtime = queryParams && 'endtime' in queryParams ? queryParams.endtime : this.state.endTime;
        if (endtime) {
            queryObj.endtime = endtime;
        }
        let search = queryParams && 'search' in queryParams ? queryParams.search : this.state.searchName;
        if (search) {
            queryObj.search = (search.toString().trim()).toLowerCase()
        }
        let type_filter = queryParams && 'type_filter' in queryParams ? queryParams.type_filter : this.state.typeFilter;
        if (type_filter) {
            queryObj.type_filter = type_filter;
        }
        SingleUserLogAction.getSingleAuditLogList(queryObj);
    },

    // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
    getUserLoginInfo(queryParams) {
        let queryObj = {
            user_id: this.props.userId,
            appid: queryParams && 'appid' in queryParams ? queryParams.appid : this.state.selectedLogAppId
        };
        let starttime = queryParams && 'starttime' in queryParams ? queryParams.starttime : this.state.startTime;
        if (starttime) {
            queryObj.starttime = starttime;
        }
        let endtime = queryParams && 'endtime' in queryParams ? queryParams.endtime : this.state.endTime;
        if (endtime) {
            queryObj.endtime = endtime;
        }
        SingleUserLogAction.getUserLoginInfo(queryObj);
    },
    // 搜索处理事件
    handleSearchEvent: function (inputContent) {
        inputContent = inputContent ? inputContent : '';
        if (inputContent.trim() !== this.state.searchName.trim()) {
            SingleUserLogAction.getLogsBySearch();
            SingleUserLogAction.handleSearchEvent(inputContent);
            this.getSingleUserAuditLogList({
                search: inputContent,
                page: 1
            });
        }
    },
    // 改变时间
    onSelectDate: function (startTime, endTime) {
        let timeObj = {
            starttime: startTime,
            endtime: endTime
        };
        SingleUserLogAction.getLogsByTime();
        SingleUserLogAction.changeSearchTime({startTime, endTime});
        this.getSingleUserAuditLogList({
            starttime: startTime,
            endtime: endTime,
            page: 1
        });
        // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
        this.getUserLoginInfo(timeObj);
    },
    // 选择应用
    onSelectedAppChange: function (appid) {
        let appIdObj = {
            appid: appid
        };
        SingleUserLogAction.getLogsByApp();
        SingleUserLogAction.setSelectedAppId(appid);
        this.getSingleUserAuditLogList({
            appid: appid,
            page: 1
        });
        // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
        this.getUserLoginInfo(appIdObj);
    },
    // 时间和应用
    userLogSearchBlock: function () {
        var userAuditLogAppId = UserAuditLogStore.getState().selectAppId;
        var showAppSelect = (ShareObj.share_online_app_id == '' && ShareObj.app_id == '' && userAuditLogAppId == '');
        return (
            <div className="single-user-log-header clearfix">
                { showAppSelect ? (<div className="single-user-log-select-app">
                    <SelectFullWidth
                        showSearch
                        optionFilterProp="children"
                        className="log_select_app"
                        value={this.state.selectedLogAppId}
                        onSelect={this.onSelectedAppChange}
                        minWidth={120}
                        maxWidth={270}
                        notFoundContent={Intl.get("common.not.found", "无法找到")}
                    >
                        { _.isArray(this.state.userOwnAppArray) ? this.state.userOwnAppArray.map(function (item) {
                            return (
                                <Option
                                    value={item.app_id}
                                    key={item.app_id}
                                >
                                    {item.app_name}
                                </Option>
                            )

                        }) : null}
                    </SelectFullWidth>
                </div>) : null}
                <div className="single-user-log-select-time clearfix">
                    <DatePicker
                        disableDateAfterToday={true}
                        range="all"
                        onSelect={this.onSelectDate}>
                        <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                        <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                        <DatePicker.Option value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                        <DatePicker.Option
                            value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                        <DatePicker.Option value="year">{Intl.get("common.time.unit.year", "年")}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                    </DatePicker>
                </div>
            </div>
        );
    },

    //是否显示没有更多数据了
    showNoMoreDataTip: function () {
        return !this.state.appUserListResult &&
            this.state.auditLogList.length >= 10 && !this.state.listenScrollBottom;
    },

    // 日志列表信息
    userLogInformationBlock: function () {
        if (this.state.appUserListResult == "loading" && this.state.curPage == 1) {
            return <Spinner />;
        }
        if (this.state.getUserLogErrorMsg) {
            return (
                <div className="alert-wrap">
                    <Alert
                        message={this.state.getUserLogErrorMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        var auditLogListLength = this.state.auditLogList.length;
        if (auditLogListLength != 0) {
            return (
                <div className="single-user-log-detail-info">
                    {this.state.auditLogList.map(function (userLogInformation, index) {
                        return (
                            <div className="single-user-log-information" key={index}>
                                <p className="single-user-log-time-operation">
                                    <span
                                        className="single-user-log-detail">{moment(userLogInformation.timestamp).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                                </p>
                                <p className="single-user-log-other-information">
                                    <span className="single-user-log-detail">{userLogInformation.operate}</span>
                                </p>
                                <p className="single-user-log-other-information">
                                    <span className="single-user-log-detail">
                                       {userLogInformation.user_ip} {userLogInformation.location} {userLogInformation.area}
                                    </span>
                                    <span className="single-user-log-detail"><ReactIntl.FormattedMessage
                                        id="common.client" defaultMessage="客户端"/>: {userLogInformation.os}</span>
                                </p>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return <div className="alert-wrap">
                <Alert
                    message={Intl.get("common.no.data", "暂无数据")}
                    type="info"
                    showIcon={true}
                />
            </div>;
        }
    },
    // 下拉加载日志列表信息
    handleScrollBarBottom: function () {
        // 判断加载的条件
        if (this.state.curPage <= (Math.ceil(this.state.total / this.state.pageSize))) {
            this.getSingleUserAuditLogList({page: this.state.curPage});
        } else {
            this.setState({
                listenScrollBottom: false
            });
        }
    },

    // 过滤心跳服务
    selectShowLogsType: function (e) {
        var status = e.target.checked;
        SingleUserLogAction.filterType(status);
        this.setState({
            checked: e.target.checked
        }, () => {
            this.getSingleUserAuditLogList({
                type_filter: this.state.typeFilter
            })
        });
    },

    renderLogInformation: function () {
        var scrollBarHeight = $(window).height() -
            USER_LOG_LAYOUT_CONSTANTS.TOP_DELTA -
            USER_LOG_LAYOUT_CONSTANTS.BOTTOM_DELTA -
            USER_LOG_LAYOUT_CONSTANTS.CHART_HEIGHT -
            USER_LOG_LAYOUT_CONSTANTS.LOG_MARGIN_BOTTOM -
            USER_LOG_LAYOUT_CONSTANTS.LOG_TOTAL_BOTTOM;
        return (
            <div style={{height: scrollBarHeight}}>
                {/**搜索框 */}
                <div className="single-log-info-header">
                    <div className="single-user-log-search-content clearfix">
                        <SearchInput
                            searchPlaceHolder={Intl.get("user.search.placeholder", "请输入关键词搜索")}
                            searchEvent={this.handleSearchEvent}
                            ref="search"
                        />
                    </div>
                    <Checkbox
                        title={Intl.get("user.filter.heartbeat.service", "过滤心跳服务")}
                        checked={this.state.checked}
                        onChange={this.selectShowLogsType}
                    />
                </div>
                <div className="log-tips"><ReactIntl.FormattedMessage id="common.operate.record" defaultMessage="操作记录"/>：
                </div>
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                    itemCssSelector=".single-user-log-information"
                >
                    {this.userLogInformationBlock()}
                    <NoMoreDataTip
                        fontSize="12"
                        show={this.showNoMoreDataTip}
                    />
                </GeminiScrollbar>
            </div>
        );
    },

    // 用户登录信息
    renderUserLoginInfo: function () {
        let millisecond = this.state.loginInfo.duration;
        let timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(millisecond/1000));
        let count = this.state.loginInfo.count;
        let avgDuration = 0;
        if (count) {
            let avgTimeObj =  TimeUtil.secondsToHourMinuteSecond(Math.floor(millisecond/ count/1000));
            avgDuration = avgTimeObj.timeDescr;
        }
        return (
            <div className="user-login-info">
                <div className="login-info">
                    <div>
                        <ReactIntl.FormattedMessage
                            id="user.total.login.count"
                            defaultMessage={`总共登录了{count}次。`}
                            values={{'count': <span className="login-stress">{count}</span>}}
                        />
                        {Intl.get("user.login.duration", "在线时长")}：<span className="login-stress">{timeObj.timeDescr}</span>
                    </div>
                    <div>
                        {Intl.get("user.average.login.duration", "平均每次在线时长")}：<span
                        className="login-stress">{avgDuration}</span>
                    </div>
                    {this.state.loginInfo.last != -1 && this.state.loginInfo.first != -1 ? (
                        <div>
                            <div>
                                {Intl.get("user.first.login", "首次登录")}：<span
                                className="login-stress">{this.state.loginInfo.first}</span>
                            </div>
                            <div>
                                {Intl.get("user.last.login", "最近登录")}：<span
                                className="login-stress">{this.state.loginInfo.last}</span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {Intl.get("user.no.login", "用户暂无登录")}!
                        </div>
                    )}
                </div>
            </div>
        )
    },

    renderLoginGraph(){
        if (this.state.loginInfo.isLoading) {
            return <Spinner />;
        }
        if (this.state.loginInfo.errorMsg) {
            return (
                <div className="alert-wrap">
                    <Alert
                        message={this.state.loginInfo.errorMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        return (
            <div className="user-login-graph">
                <div className="duration-chart">
                    <RadioGroup onChange={this.onChange} value={this.state.selectValue}>
                        <Radio value="LoginFrequency"><ReactIntl.FormattedMessage id="user.login.time"
                                                                                  defaultMessage="次数"/></Radio>
                        <Radio value="loginDuration" defaultChecked="true"><ReactIntl.FormattedMessage
                            id="user.duration" defaultMessage="时长"/></Radio>
                    </RadioGroup>
                    {this.state.selectValue == 'loginDuration' ? this.renderLoginDurationGraph() : this.renderFrequencyChart()}
                </div>
            </div>
        );
    },

    // 渲染用户登录时长统计
    renderLoginDurationGraph: function () {
        if (_.isArray(this.state.loginInfo.loginDuration) && !this.state.loginInfo.loginDuration.length) {
            return (
                <div className="alert-wrap">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
        return (
            <TimeSeriesBarChart
                dataList={this.state.loginInfo.loginDuration}
                tooltip={this.durationTooltip}
            />
        )
    },

    // 用户登录时长的统计图的提示信息
    durationTooltip: function (time, sum) {
        let timeObj = TimeUtil.secondsToHourMinuteSecond(sum || 0);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${time}`,
            Intl.get('user.duration', '时长') + ' : ' + `${timeObj.timeDescr}`
        ].join('<br />');
    },

    // 用户登录次数统计图
    renderFrequencyChart: function () {
        if (_.isArray(this.state.loginInfo.loginCount) && !this.state.loginInfo.loginCount.length) {
            return (
                <div className="alert-wrap">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
        return (
            <TimeSeriesBarChart
                dataList={this.state.loginInfo.loginCount}
                tooltip={this.chartFrequencyTooltip}
            />
        )
    },
    // 用户登录次数的统计图的提示信息
    chartFrequencyTooltip: function (time, sum) {
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${time}`,
            Intl.get('user.login.time', '次数') + ' : ' + `${sum}`
        ].join('<br />');
    },

    onChange: function (event) {
        if (event.target.value == 'LoginFrequency') {
            this.setState({
                selectValue: 'LoginFrequency'
            });
        } else {
            this.setState({
                selectValue: 'loginDuration'
            });
        }
    },
    render: function () {
        return (
            <div className="right-panel-audit-log">
                {this.userLogSearchBlock()}
                <div className="user-login">
                    {this.renderUserLoginInfo()}
                    {this.renderLoginGraph()}
                </div>
                <div className="user-log-list">
                    {this.renderLogInformation()}
                </div>

                {
                    this.state.auditLogList.length ? (
                        <div className="total-summary">
                            {Intl.get("common.total.data", "共{num}条数据", {"num": this.state.total})}
                        </div>
                    ) : null
                }
            </div>
        );
    }
});

module.exports = SingleUserLogBasic;