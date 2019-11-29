require('../css/single-user-log.less');
//时间范围选择
import { AntcDatePicker as DatePicker } from 'antc';
var Alert = require('antd').Alert;
var SelectFullWidth = require('../../../../components/select-fullwidth');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var SingleUserLogAction = require('../action/single_user_log_action');
var SingleUserLogStore = require('../store/single_user_log_store');
import {SearchInput} from 'antc';
// 没有数据的提示信息
var NoMoreDataTip = require('../../../../components/no_more_data_tip');
const AlertTimer = require('CMP_DIR/alert-timer');
import { SELECT_TIME_TIPS, THREE_MONTH_TIME_RANGE, THIRTY_DAY_TIME_RANGE, THIRTY_ONE_DAY_TIME_RANGE } from '../util/consts';
import classNames from 'classnames';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import { AntcTimeLine } from 'antc';
const TOP_PADDING = 40;//top padding for inputs（时间选择框和搜索框高度）
const APP_SELECT_HEIGHT = 40; // 应用选择框的高度
const BOTTOM_TOTAL_HEIGHT = 50; // 记录总条数的高度
import { data as antUtilData } from 'ant-utils';

class SingleUserLog extends React.Component {
    static defaultProps = {
        userId: '1'
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return {
            appTerminalType: '', // 应用终端类型，默认全部
            ...SingleUserLogStore.getState()
        };
    };

    getSingleUserLogInfoByApp = (userId, selectedAppId, appLists) => {
        let queryObj = {
            user_id: userId,
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            page: 1,
            type_filter: this.state.typeFilter.join()
        };
        if (this.state.searchName) {
            queryObj.search = _.trim(this.state.searchName.toString().toLowerCase());
        }
        SingleUserLogAction.getSingleUserAppList(queryObj, selectedAppId, appLists);
        if (selectedAppId) {
            SingleUserLogAction.setSelectedAppId(selectedAppId);
        }
    };

    componentDidMount() {
        SingleUserLogStore.listen(this.onStateChange);
        SingleUserLogAction.resetLogState();
        let userId = this.props.userId;
        if (this.props.operatorRecordDateSelectTime) {
            SingleUserLogAction.changeSearchTime(this.props.operatorRecordDateSelectTime);
            setTimeout(() => {
                this.singleUserLogQuery(userId, this.props);
            });
        } else {
            this.getSingleUserLogInfoByApp(userId, this.props.selectedAppId, this.props.appLists);
        }
    }

    singleUserLogQuery = (userId, props) => {
        if (props.selectedAppId) {
            this.getSingleUserLogInfoByApp(userId, props.selectedAppId, this.props.appLists);
        } else {
            this.getSingleUserLogInfoByApp(userId, props.selectedAppId, props.appLists);
        }
    };

    componentWillReceiveProps(nextProps) {
        var newUserId = nextProps.userId;
        // 切换用户或是this.props.selectedAppId是空时，表示全部产品下，查看操作记录，需要比较应用列表
        if (this.props.userId !== newUserId || this.props.selectedAppId === '' && !antUtilData.isEqualArray(nextProps.appLists, this.props.appLists)) {
            setTimeout(() => {
                SingleUserLogAction.changUserIdKeepSearch();
                this.singleUserLogQuery(newUserId, nextProps);
            }, 0);
        }
    }

    componentWillUnmount() {
        SingleUserLogStore.unlisten(this.onStateChange);
    }

    getQueryParams = (queryParams) => {
        return {
            user_id: this.props.userId,
            appid: (queryParams && queryParams.appid) || this.state.selectedLogAppId,
            page: queryParams && queryParams.page || this.state.curPage,
            page_size: this.state.pageSize,
            starttime: queryParams && queryParams.starttime || this.state.startTime,
            endtime: queryParams && queryParams.endtime || this.state.endTime
        };
    };

    // 获取单个用户的日志列表
    getSingleUserAuditLogList = (queryParams) => {
        let queryObj = this.getQueryParams(queryParams);
        let search = queryParams && 'search' in queryParams ? queryParams.search : this.state.searchName;
        if (search) {
            queryObj.search = _.trim(search.toString().toLowerCase());
        }
        else {
            //参数不能为空
            queryObj.search = '';
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
        // 多终端类型 TODO 参数传值待定
        let appTerminalType = _.get(queryParams, 'appTerminalType') || this.state.appTerminalType;
        if (appTerminalType) {
            queryObj.terminal = appTerminalType;
        }

        SingleUserLogAction.getSingleAuditLogList(queryObj);
    };

    // 搜索处理事件
    handleSearchEvent = (inputContent) => {
        inputContent = inputContent ? inputContent : '';
        if (_.trim(inputContent) !== _.trim(this.state.searchName)) {
            SingleUserLogAction.getLogsBySearch();
            SingleUserLogAction.handleSearchEvent(inputContent);
            this.getSingleUserAuditLogList({
                search: inputContent,
                page: 1
            });
        }
    };

    // 改变时间
    onSelectDate = (start_time, end_time, range) => {
        let startTime = start_time;
        let messageTips = '';
        if (Date.now() - THREE_MONTH_TIME_RANGE > start_time) {
            startTime = Date.now() - THREE_MONTH_TIME_RANGE;
            messageTips = SELECT_TIME_TIPS.range;
        }
        let endTime = end_time;
        if (endTime - startTime > THIRTY_ONE_DAY_TIME_RANGE) {
            startTime = endTime - THIRTY_DAY_TIME_RANGE;
            messageTips = SELECT_TIME_TIPS.time;
        }
        SingleUserLogAction.resetLogState();
        SingleUserLogAction.changeSearchTime({ startTime, endTime, range });
        this.getSingleUserAuditLogList({
            starttime: startTime,
            endtime: endTime,
            messageTips: messageTips,
            page: 1,
            appid: this.state.selectedLogAppId
        });
    };

    // 选择应用
    onSelectedAppChange = (appid) => {
        SingleUserLogAction.resetLogState();
        SingleUserLogAction.setSelectedAppId(appid);
        this.getSingleUserAuditLogList({
            appid: appid,
            page: 1
        });
    };
    // 应用下拉框的选择
    getAppOptions = () => {
        var list = _.map(this.state.userOwnAppArray, function(item) {
            return <Option
                key={item.app_id}
                value={item.app_id}
                title={item.app_name}
            >
                {item.app_name}
            </Option>;
        });
        const appIds = _.map(this.state.userOwnAppArray, x => x.app_id);
        let value = '';
        if (_.isArray(appIds)) {
            value = appIds.join(',');
        }
        list.unshift(
            <Option
                value={value}
                key="all"
                title={Intl.get('user.product.all','全部产品')}
            >
                {Intl.get('user.product.all','全部产品')}
            </Option>);
        return list;
    };

    // 筛选终端类型
    onSelectTerminalsUserType = (value) => {
        this.setState({
            appTerminalType: value
        }, () => {
            this.getSingleUserAuditLogList({
                appTerminalType: value
            });
        });
    };

    // 渲染多终端类型
    renderAppTerminalsType = () => {
        let selectAppTerminals = this.state.selectAppTerminals;
        return (
            <SelectFullWidth
                className="select-app-terminal-type btn-item"
                value={this.state.appTerminalType}
                onChange={this.onSelectTerminalsUserType}
            >
                {
                    selectAppTerminals.map((terminalType, idx) => {
                        return (<Option key={idx} value={terminalType.id}> {terminalType.name} </Option>);
                    })
                }
            </SelectFullWidth>
        );
    };

    renderUserLogSelectInfo = () => {
        let showAppSelect = this.props.selectedAppId;
        const appOptions = this.getAppOptions();
        return (
            <div className="log-info-header clearfix">
                {showAppSelect ? null : <div className="select-app">
                    <SelectFullWidth
                        showSearch
                        optionFilterProp="children"
                        className="log_select_app"
                        value={this.state.selectedLogAppId}
                        onSelect={this.onSelectedAppChange}
                        minWidth={120}
                        maxWidth={270}
                        notFoundContent={Intl.get('common.not.found', '无法找到')}
                    >
                        {appOptions}
                    </SelectFullWidth>
                </div>}
                {
                    _.get(this.state.selectAppTerminals, 'length') ? (
                        this.renderAppTerminalsType()
                    ) : null
                }
                <div className="select-time">
                    <DatePicker
                        disableDateAfterToday={true}
                        dateSelectRange={THREE_MONTH_TIME_RANGE}
                        range={this.state.defaultRange}
                        onSelect={this.onSelectDate}
                        start_time={this.state.startTime}
                        end_time={this.state.endTime}
                    >
                        <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                        <DatePicker.Option value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                    </DatePicker>
                </div>
                <div className="search-content">
                    <SearchInput
                        searchPlaceHolder={Intl.get('user.search.placeholder', '请输入关键词搜索')}
                        searchEvent={this.handleSearchEvent}
                        ref="search"
                    />
                </div>
            </div>
        );
    };

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.logListLoading &&
            this.state.auditLogList.length >= 10 && !this.state.listenScrollBottom;
    };

    //展开收起操作详情
    toggleOperateDetail = (userLog) => {
        SingleUserLogAction.toggleOperateDetail(userLog);
    };

    renderTimeLineItem = (item) => {
        let operateClass = classNames('iconfont', {
            'icon-down-twoline': !item.detailShow,
            'icon-up-twoline': item.detailShow
        });
        let operateTitle = item.detailShow ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');
        return (
            <dl>
                <dd>
                    <p>
                        {item.operate}
                        {item.operate_detail ? (
                            <span
                                className={operateClass}
                                title={operateTitle}
                                onClick={this.toggleOperateDetail.bind(this, item)}
                            />) : null}
                    </p>
                </dd>
                {item.detailShow ? (
                    <dd>
                        {item.operate_detail}
                    </dd>) : null}
                <dd className="hightlight">
                    {item.user_ip ? `ip: ${item.user_ip}` : null} {item.location} {item.area}
                    <br />
                    {Intl.get('common.client', '客户端')}:  {item.os}
                </dd>
                <dt>{moment(item.timestamp).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    // 日志列表信息
    userLogInformationBlock = (height) => {
        if (this.state.logListLoading === 'loading' && this.state.curPage === 1) {
            return <StatusWrapper loading={true} height={height} />;
        }
        if (this.state.getUserLogErrorMsg) {
            return (
                <div className="alert-container">
                    <Alert
                        message={this.state.getUserLogErrorMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        var auditLogListLength = this.state.auditLogList.length;
        if (auditLogListLength !== 0) {
            return (
                <div>
                    <div className="time-over-range-tips">
                        {this.renderSelectDateTips()}
                    </div>
                    <AntcTimeLine
                        className="icon-blue"
                        data={this.state.auditLogList}
                        groupByDay={true}
                        timeField="timestamp"
                        contentRender={this.renderTimeLineItem}
                        dot={<span className="iconfont icon-foot"></span>}
                    />
                </div>
            );
        } else {
            return <div className="alert-container">
                <Alert
                    message={Intl.get('common.no.audit', '暂无操作记录')}
                    type="info"
                    showIcon={true}
                />
            </div>;
        }
    };

    // 下拉加载日志列表信息
    handleScrollBarBottom = () => {
        // 判断加载的条件
        if (this.state.curPage <= (Math.ceil(this.state.total / this.state.pageSize))) {
            this.getSingleUserAuditLogList({ page: this.state.curPage });
        } else {
            this.setState({
                listenScrollBottom: false
            });
        }
    };

    renderLogInformation = () => {
        let scrollBarHeight = this.props.height - TOP_PADDING;
        if (this.props.selectedAppId === '') { // 全部应用下，需要显示应用选择框
            scrollBarHeight -= APP_SELECT_HEIGHT; // 应用选择框的高度
        }
        let length = _.get(this.state.auditLogList, 'length', 0);
        if (length) {
            scrollBarHeight -= BOTTOM_TOTAL_HEIGHT;
        }

        return (
            <div style={{ height: scrollBarHeight }} className="log-info">
                {/**搜索框 */}
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                    itemCssSelector=".single-user-log-information"
                >
                    {this.userLogInformationBlock(scrollBarHeight)}
                    <NoMoreDataTip
                        fontSize="12"
                        show={this.showNoMoreDataTip}
                        message={Intl.get('common.no.more.user.log', '没有更多日志了')}
                    />
                </GeminiScrollbar>
            </div>
        );
    };

    // 选择时间范围的提示信息
    renderSelectDateTips = () => {
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
    };

    state = {
        messageTips: '',
        ...this.getStateData()
    };

    render() {
        return (
            <div className="user-log-panel">
                {this.renderUserLogSelectInfo()}
                <div className="user-log-list">
                    {this.renderLogInformation()}
                </div>
                {
                    this.state.auditLogList.length ? (
                        <div className="total-summary">
                            {Intl.get('common.total.data', '共{num}条数据', { 'num': this.state.total })}
                        </div>
                    ) : null
                }
            </div>
        );
    }
}
SingleUserLog.propTypes = {
    userId: PropTypes.string,
    selectedAppId: PropTypes.string,
    appLists: PropTypes.array,
    height: PropTypes.number,
    operatorRecordDateSelectTime: PropTypes.object
};
module.exports = SingleUserLog;
