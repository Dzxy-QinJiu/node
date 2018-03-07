require('../css/single-user-log.less');
//时间范围选择
import DatePicker from "../../../../components/datepicker";
var Alert = require("antd").Alert;
// 加载时的动作显示
var Spinner = require("../../../../components/spinner");
var SelectFullWidth = require("../../../../components/select-fullwidth");
var AppUserUtil = require("../util/app-user-util");
//用户日志右侧面板常量
var USER_LOG_LAYOUT_CONSTANTS = AppUserUtil.USER_LOG_LAYOUT_CONSTANTS;
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var SingleUserLogAction = require('../action/single_user_log_action');
var SingleUserLogStore = require('../store/single_user_log_store');
var SearchInput = require("../../../../components/searchInput");
// 没有数据的提示信息
var NoMoreDataTip = require("../../../../components/no_more_data_tip");
import { logTypeList , ALL_LOG_INFO, AUDIT_LOG, HEARTBEAT_LOG, ROLE_AUTH_LOG} from "PUB_DIR/sources/utils/consts";
const AlertTimer = require('CMP_DIR/alert-timer');
import { SELECT_TIME_TIPS, THREE_MONTH_TIME_RANGE, THIRTY_DAY_TIME_RANGE, THIRTY_ONE_DAY_TIME_RANGE } from '../util/consts';

var SingleUserLog = React.createClass({
    getDefaultProps: function () {
        return {
            userId: '1'
        };
    },
    getInitialState: function () {
        return {
            logType: AUDIT_LOG, // 默认显示审计日志类型(全部日志、审计日志、认证授权、心跳服务)
            messageTips: '',
            ...this.getStateData()
        };
    },
    onStateChange: function () {
        this.setState(this.getStateData());
    },
    getStateData: function () {
        return SingleUserLogStore.getState();
    },
    getSingleUserLogInfoByApp(userId, selectedAppId) {
        let queryObj = {
            user_id: userId,
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            page: this.state.curPage
        };
        if (this.state.searchName) {
            queryObj.search = ((this.state.searchName).toString().trim()).toLowerCase()
        }
        if (this.state.typeFilter && this.state.typeFilter!= ALL_LOG_INFO) {
            queryObj.type_filter = this.state.typeFilter.join();
        }
        SingleUserLogAction.getSingleUserAppList(queryObj, selectedAppId);
        if(selectedAppId){
            SingleUserLogAction.setSelectedAppId(selectedAppId);
        }
    },
    componentDidMount: function () {
        SingleUserLogStore.listen(this.onStateChange);
        SingleUserLogAction.resetLogState();
        let userId = this.props.userId;
        this.getSingleUserLogInfoByApp(userId,this.props.selectedAppId);
    },
    componentWillReceiveProps: function (nextProps) {
        var newUserId = nextProps.userId;
        if (this.props.userId != newUserId) {
            setTimeout(() => {
                SingleUserLogAction.changUserIdKeepSearch();
                this.getSingleUserLogInfoByApp(newUserId,nextProps.selectedAppId);
            }, 0);
        }
    },
    componentWillUnmount: function () {
        SingleUserLogStore.unlisten(this.onStateChange);
    },
    getQueryParams(queryParams) {
        return {
            user_id: this.props.userId,
            appid: queryParams && queryParams.appid || this.state.selectedLogAppId,
            page: queryParams && queryParams.page || this.state.curPage,
            page_size: this.state.pageSize,
            starttime: queryParams && queryParams.starttime || this.state.startTime,
            endtime: queryParams && queryParams.endtime || this.state.endTime
        };
    },

    // 获取单个用户的日志列表
    getSingleUserAuditLogList(queryParams) {
        let queryObj = this.getQueryParams(queryParams);
        let search = queryParams && 'search' in queryParams ? queryParams.search : this.state.searchName;
        if (search) {
            queryObj.search = (search.toString().trim()).toLowerCase()
        }
        let type_filter = queryParams && 'type_filter' in queryParams ? queryParams.type_filter : this.state.typeFilter;
        if (type_filter) {
            queryObj.type_filter = type_filter.join();
        }
        // 心跳服务、认证授权
        let log_type = queryParams && 'log_type' in queryParams ? queryParams.log_type : this.state.selectLogType;
        if (log_type) {
            queryObj.log_type = log_type;
        }
        SingleUserLogAction.getSingleAuditLogList(queryObj);
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
    onSelectDate: function (start_time, end_time, range) {
        let startTime = start_time;
        if (Date.now() - THREE_MONTH_TIME_RANGE > start_time) {
            startTime = Date.now() - THREE_MONTH_TIME_RANGE;
            this.state.messageTips = SELECT_TIME_TIPS.range;
        }
        let endTime = end_time;
        if (endTime - startTime > THIRTY_ONE_DAY_TIME_RANGE) {
            startTime = endTime - THIRTY_DAY_TIME_RANGE;
            this.state.messageTips = SELECT_TIME_TIPS.time;
        }
        SingleUserLogAction.resetLogState();
        SingleUserLogAction.changeSearchTime({startTime, endTime, range});
        this.getSingleUserAuditLogList({
            starttime: startTime,
            endtime: endTime,
            page: 1
        });
    },
    // 选择应用
    onSelectedAppChange: function (appid) {
        SingleUserLogAction.resetLogState();
        SingleUserLogAction.setSelectedAppId(appid);
        this.getSingleUserAuditLogList({
            appid: appid,
            page: 1
        });
    },
    renderUserLogSelectInfo() {
        let showAppSelect = this.props.selectedAppId;
        return (
            <div className="log-info-header clearfix">
                <div className="select-time">
                    <DatePicker
                        disableDateAfterToday={true}
                        dateSelectRange={THREE_MONTH_TIME_RANGE}
                        range={this.state.defaultRange}
                        onSelect={this.onSelectDate}
                        start_time={this.state.startTime}
                        end_time ={this.state.endTime}
                    >
                        <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                        <DatePicker.Option value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                    </DatePicker>
                </div>
                <div className="log-type-select">
                    {this.renderAuditLogType()}
                </div>
                <div className="search-content">
                    <SearchInput
                        searchPlaceHolder={Intl.get("user.search.placeholder", "请输入关键词搜索")}
                        searchEvent={this.handleSearchEvent}
                        ref="search"
                    />
                </div>
                { showAppSelect ? null : <div className="select-app">
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
                </div>}
            </div>
        );
    },

    //是否显示没有更多数据了
    showNoMoreDataTip: function () {
        return !this.state.logListLoading &&
            this.state.auditLogList.length >= 10 && !this.state.listenScrollBottom;
    },

    // 日志列表信息
    userLogInformationBlock: function () {
        if (this.state.logListLoading == "loading" && this.state.curPage == 1) {
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
                <div>
                    <div className="time-over-range-tips">
                        {this.renderSelectDateTips()}
                    </div>
                    { this.state.auditLogList.map(function (userLogInformation, index) {
                        return (
                            <div className="log-info-item" key={index}>
                                <p className="operation">
                                    <span className="log-detail">{moment(userLogInformation.timestamp).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                                </p>
                                <p><span className="log-detail">{userLogInformation.operate}</span></p>
                                <p>
                                    <span className="log-detail">{userLogInformation.user_ip }</span>
                                    <span className="log-detail">
                                        {userLogInformation.location} {userLogInformation.area}
                                    </span>
                                    <span className="log-detail">{Intl.get("common.client", "客户端")}: {userLogInformation.os}</span>
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
    onSelectLogType(value) {
        this.state.logType = value;
        SingleUserLogAction.resetLogState();
        SingleUserLogAction.setTypeFilterValue(value);
        if (value == HEARTBEAT_LOG || value == ROLE_AUTH_LOG) {
            this.setState({
                logType: value
            }, () => {
                this.getSingleUserAuditLogList({
                    log_type: this.state.logType
                });
            });
        } else if (value == AUDIT_LOG || value == ALL_LOG_INFO) {
            setTimeout(() => {
                this.getSingleUserAuditLogList({
                    type_filter: this.state.typeFilter,
                });
            });
        }
    },

    // 渲染日志的类型（全部日志、审计日志、认证授权、心跳服务）
    renderAuditLogType() {
        return (
            <SelectFullWidth
                value={this.state.logType}
                onChange={this.onSelectLogType}
            >
                {
                    logTypeList.map((logType, idx) => {
                        return (<Option key={idx} value={logType.value} title={logType.name}> {logType.name} </Option>);
                    })
                }
            </SelectFullWidth>
        );
    },
    renderLogInformation: function () {
        var scrollBarHeight = $(window).height() -
            USER_LOG_LAYOUT_CONSTANTS.TOP_DELTA -
            USER_LOG_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return (
            <div style={{height: scrollBarHeight}} className="log-info">
                {/**搜索框 */}
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

    // 选择时间范围的提示信息
    renderSelectDateTips() {
        let messageTips = this.state.messageTips;
        var hide = () => {
            this.setState({
                messageTips: ''
            });
        };
        if (messageTips) {
            return (
                <AlertTimer
                    time={3000}
                    message={messageTips}
                    type="info"
                    showIcon
                    onHide={hide}
                />
            );
        }
        return null;
    },
    render: function () {
        return (
            <div className="user-log-panel">
                {this.renderUserLogSelectInfo()}
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

module.exports = SingleUserLog;