require('../css/user-login-analysis.less');
var Spinner = require("../../../../components/spinner");
var SelectFullWidth = require("../../../../components/select-fullwidth");
var TimeSeriesBarChart = require("../../../../components/timeseries-barchart");
var UserLoginAnalysisAction = require('../action/user-login-analysis-action');
var UserLoginAnalysisStore = require('../store/user-login-analysis-store');
import TimeUtil from '../../../../public/sources/utils/time-format-util';
import CardContainer from 'CMP_DIR/card-container'; // 容器

const UserLoginAnalysis = React.createClass({
    getDefaultProps: function() {
        return {
            userId: '1'
        };
    },
    getInitialState: function() {
        return {
            selectValue: 'LoginFrequency',
            ...this.getStateData()
        };
    },
    onStateChange: function() {
        this.setState(this.getStateData());
    },
    getStateData: function() {
        return UserLoginAnalysisStore.getState();
    },
    getUserAnalysisInfo(userId, selectedAppId) {
        UserLoginAnalysisAction.getSingleUserAppList({user_id: userId}, selectedAppId);
        if(selectedAppId){
            UserLoginAnalysisAction.setSelectedAppId(selectedAppId);
        }
    },
    componentDidMount: function() {
        UserLoginAnalysisStore.listen(this.onStateChange);
        UserLoginAnalysisAction.resetState();
        let userId = this.props.userId;
        this.getUserAnalysisInfo(userId, this.props.selectedAppId);
    },
    componentWillReceiveProps: function(nextProps) {
        var newUserId = nextProps.userId;
        if (this.props.userId != newUserId) {
            setTimeout(() => {
                UserLoginAnalysisAction.resetState();
                this.getUserAnalysisInfo(newUserId, nextProps.selectedAppId);
            }, 0);
        }
    },
    componentWillUnmount: function() {
        UserLoginAnalysisStore.unlisten(this.onStateChange);
    },
    getQueryParams(queryParams) {
        let app_id = queryParams && queryParams.appid || this.state.selectedLogAppId;
        const appsArray = this.state.userOwnAppArray;
        const matchAppInfo = _.find(appsArray, appItem => appItem.app_id == app_id);
        let create_time = matchAppInfo && matchAppInfo.create_time || '';
        return {
            user_id: this.props.userId,
            appid: app_id,
            starttime: +create_time,
            endtime: new Date().getTime()
        };
    },
    // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
    getUserAnalysisData(queryParams) {
        let queryObj = this.getQueryParams(queryParams);
        UserLoginAnalysisAction.getUserLoginInfo(queryObj);
        UserLoginAnalysisAction.getUserLoginChartInfo(queryObj);
    },
    // 选择应用
    onSelectedAppChange: function(appid) {
        UserLoginAnalysisAction.resetState();
        UserLoginAnalysisAction.setSelectedAppId(appid);
        // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
        this.getUserAnalysisData({appid: appid});
    },
    // 应用选择框
    renderUserAppsList(){
        let showAppSelect = this.props.selectedAppId;
        return (
            <div className="user-analysis-header clearfix">
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
                        { _.isArray(this.state.userOwnAppArray) ? this.state.userOwnAppArray.map(function(item) {
                            return (
                                <Option value={item.app_id} key={item.app_id}>
                                    {item.app_name}
                                </Option>
                            );
                        }) : null}
                    </SelectFullWidth>
                </div>}
            </div>
        );
    },

    renderLoginFirstLastTime(loginLast, loginFirst) {
        if (!loginLast && !loginFirst) {
            return null;
        } else if (loginLast != -1 || loginFirst != -1) {
            return (
                <div>
                    { loginFirst != -1 ? (
                        <div>
                            {Intl.get("user.first.login", "首次登录")}：<span className="login-stress">{loginFirst}</span>
                        </div>
                    ) : null}
                    { loginLast != -1 ? (
                        <div>
                            {Intl.get("user.last.login", "最近登录")}：<span className="login-stress">{loginLast}</span>
                        </div>
                    ) : null
                    }
                </div>
            );
        } else if (loginLast == -1 && loginFirst == -1) {
            return (
                <div>
                    {Intl.get("user.no.login", "用户暂无登录")}!
                </div>
            );
        }
    },
    // 重新用户登录信息
    retryGetUserLoginInfo() {
        let queryObj = this.getQueryParams();
        UserLoginAnalysisAction.getUserLoginInfo(queryObj);
    },
    // 用户登录信息
    renderUserLoginInfo() {
        let millisecond = this.state.loginInfo.duration;
        let timeObj = {timeDescr: ' '};
        if (millisecond !== '') {
            timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(millisecond/1000));
        }
        let count = this.state.loginInfo.count;
        if (this.state.loginInfo.errorMsg) {
            return (
                <div className="login-info">
                    <div className="alert-tip">
                        {this.state.loginInfo.errorMsg}，
                        <a href="javascript:void(0)" onClick={this.retryGetUserLoginInfo}>{Intl.get("common.retry", "重试")}</a>
                    </div>
                </div>
            );
        }
        if (count || millisecond) {
            return (
                <div className="login-info">
                    <div>
                        {Intl.get("user.login.times", "登录次数")}：<span className="login-stress">{count}</span>
                    </div>
                    { Oplate.hideSomeItem ? null : (
                        <div>
                            {Intl.get("user.login.duration", "在线时长")}：<span className="login-stress">{timeObj.timeDescr}</span>
                        </div>
                    )}
                    { this.renderLoginFirstLastTime(this.state.loginInfo.last, this.state.loginInfo.first)}
                </div>
            );
        } else {
            return null;
        }
    },
    // 重新获取图表数据
    retryGetLoginChart() {
        let queryObj = this.getQueryParams();
        UserLoginAnalysisAction.getUserLoginChartInfo(queryObj);
    },
    renderLoginChart(){
        if (this.state.loginChartInfo.errorMsg) {
            return (
                <div className="login-info">
                    <div className="alert-tip">
                        {this.state.loginChartInfo.errorMsg}，
                        <a href="javascript:void(0)" onClick={this.retryGetLoginChart}>{Intl.get("common.retry", "重试")}</a>
                    </div>
                </div>
            );
        }
        const radioValue = [{value: 'LoginFrequency', name: '次数'}, {value: 'loginDuration', name: '时长'}];
        if(_.isArray(this.state.loginChartInfo.loginDuration) || _.isArray(this.state.loginChartInfo.loginCount)) {
            return (
                <div className="login-chart">
                    {Oplate.hideSomeItem ? (
                        <div className="duration-chart">
                            {this.state.loginChartInfo.count ? (
                                <div className="v8-chart-title"> {Intl.get("user.login.times", "登录次数")}</div>
                            ) : null}
                            {this.renderFrequencyChart()}
                        </div>
                    ) : (
                        <CardContainer
                            radioValue={radioValue}
                            dateRange={this.state.selectValue}
                            onDateRangeChange={this.handleSelectRadio}
                        >
                            <div className="duration-chart">
                                {
                                    this.state.selectValue === 'loginDuration' ?
                                        // 时长
                                        this.renderChart(this.state.loginChartInfo.loginDuration, this.durationTooltip) :
                                        // 次数
                                        this.renderChart(this.state.loginChartInfo.loginCount, this.chartFrequencyTooltip)
                                }
                            </div>
                        </CardContainer>
                    )}
                </div>
            );
        } else {
            return null;
        }

    },

    renderChart(data, charTips) {
        if (_.isArray(data) && data.length) {
            return (
                <TimeSeriesBarChart
                    dataList={data}
                    tooltip={charTips}
                />
            );
        } else {
            return (
                <div className="alert-tip">
                    {Intl.get("common.no.data", "暂无数据")}
                </div>
            );
        }
    },

    // 用户登录时长的统计图的提示信息
    durationTooltip: function(time, sum) {
        let timeObj = TimeUtil.secondsToHourMinuteSecond(sum || 0);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${time}`,
            Intl.get('user.duration', '时长') + ' : ' + `${timeObj.timeDescr}`
        ].join('<br />');
    },

    // 用户登录次数的统计图的提示信息
    chartFrequencyTooltip: function(time, sum) {
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${time}`,
            Intl.get('user.login.time', '次数') + ' : ' + `${sum}`
        ].join('<br />');
    },

    handleSelectRadio: function(dataRange) {
        this.setState({
            selectValue: dataRange
        });
    },

    render: function() {
        let appList = this.renderUserAppsList();
        let LoadingBlock = this.state.isLoading ? (
            <Spinner />
        ) : null;
        let UserLoginBlock = this.state.loginInfo.count === 0 && this.state.loginInfo.duration === 0 ?  <div className="user-no-login">
            {Intl.get('user.no.login.system', '该用户还没有登录过系统')}
        </div> : <div className="user-login-info">
            {this.renderUserLoginInfo()}
            {this.renderLoginChart()}
        </div>;
        return (
            <div className="user-analysis-panel">
                {appList}
                {LoadingBlock}
                {UserLoginBlock}
            </div>
        );
    }
});

module.exports = UserLoginAnalysis;