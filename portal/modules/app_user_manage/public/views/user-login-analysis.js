var React = require('react');
require('../css/user-login-analysis.less');
var Spinner = require('../../../../components/spinner');
var SelectFullWidth = require('../../../../components/select-fullwidth');
var TimeSeriesBarChart = require('../../../../components/timeseries-barchart');
var UserLoginAnalysisAction = require('../action/user-login-analysis-action');
var UserLoginAnalysisStore = require('../store/user-login-analysis-store');
import TimeUtil from '../../../../public/sources/utils/time-format-util';
import CardContainer from 'CMP_DIR/card-container'; // 容器
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import DetailCard from 'CMP_DIR/detail-card';
import StatusWrapper from 'CMP_DIR/status-wrapper';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var DefaultUserLogoTitle = require('CMP_DIR/default-user-logo-title');
import { AntcChart } from 'antc';
import { Progress } from 'antd';

class UserLoginAnalysis extends React.Component {
    static defaultProps = {
        userId: '1'
    };
        
    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return UserLoginAnalysisStore.getState();
    };

    getUserAnalysisInfo = (userId, selectedAppId) => {
        UserLoginAnalysisAction.getSingleUserAppList({ user_id: userId }, selectedAppId);
        if (selectedAppId) {
            UserLoginAnalysisAction.setSelectedAppId(selectedAppId);
        }
    };

    componentDidMount() {
        UserLoginAnalysisStore.listen(this.onStateChange);
        UserLoginAnalysisAction.resetState();
        let userId = this.props.userId;
        this.getUserAnalysisInfo(userId, this.props.selectedAppId);
    }

    componentWillReceiveProps(nextProps) {
        var newUserId = nextProps.userId;
        if (this.props.userId !== newUserId) {
            setTimeout(() => {
                UserLoginAnalysisAction.resetState();
                this.getUserAnalysisInfo(newUserId, nextProps.selectedAppId);
            }, 0);
        }
    }

    componentWillUnmount() {
        UserLoginAnalysisStore.unlisten(this.onStateChange);
    }

    getQueryParams = (queryParams) => {
        let app_id = queryParams && queryParams.appid || this.state.selectedLogAppId;
        const appsArray = this.state.userOwnAppArray;
        const matchAppInfo = _.find(appsArray, appItem => appItem.app_id === app_id);
        let create_time = matchAppInfo && matchAppInfo.create_time || '';
        return {
            user_id: this.props.userId,
            appid: app_id,
            starttime: +create_time,
            endtime: new Date().getTime()
        };
    };

    // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
    getUserAnalysisData = (queryParams) => {
        let queryObj = this.getQueryParams(queryParams);
        const chartParams = {
            ...queryObj,
            starttime: new Date(moment().subtract(11, 'months').startOf('month')).getTime()
        };
        let reqData = this.getUserLoginScoreParams(queryParams);
        let type = this.getUserLoginType();
        UserLoginAnalysisAction.getUserLoginInfo(queryObj);
        UserLoginAnalysisAction.getUserLoginChartInfo(chartParams);
        UserLoginAnalysisAction.getLoginUserScore(reqData, type);
    };

    // 选择应用
    onSelectedAppChange = (appid) => {
        UserLoginAnalysisAction.resetState();
        UserLoginAnalysisAction.setSelectedAppId(appid);
        // 获取用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录次数统计）
        this.getUserAnalysisData({ appid: appid });
    };

    renderLoginFirstLastTime = (loginLast, loginFirst) => {
        if (!loginLast && !loginFirst) {
            return null;
        } else if (loginLast !== -1 || loginFirst !== -1) {
            return (
                <div>
                    {loginFirst !== -1 ? (
                        <div className="info-item-container">
                            {Intl.get('user.first.login', '首次登录')}：<span className="login-stress">{loginFirst}</span>
                        </div>
                    ) : null}
                    {loginLast !== -1 ? (
                        <div className="info-item-container">
                            {Intl.get('user.last.login', '最近登录')}：<span className="login-stress">{loginLast}</span>
                        </div>
                    ) : null
                    }
                </div>
            );
        } else if (loginLast === -1 && loginFirst === -1) {
            return (
                <div>
                    {Intl.get('user.no.login', '用户暂无登录')}!
                </div>
            );
        }
    };

    // 登录用户分数的参数
    getUserLoginScoreParams = (queryParams) => {
        let queryObj = this.getQueryParams(queryParams);
        return {
            app_id: queryObj.appid,
            account_id: queryObj.user_id
        };
    };

    // 获取登录用户的类型
    getUserLoginType = () => {
        let type = 'self';
        if (hasPrivilege('USER_ANALYSIS_MANAGER')) {
            type = 'all';
        }
        return type;
    };

    // 将小数转化为整数显示
    transScoreInteger = (data) => {
        return Math.round(data * 100);
    };

    // 重新用户登录分数
    retryGetUserLoginScore = () => {
        let reqData = this.getUserLoginScoreParams();
        let type = this.getUserLoginType();
        UserLoginAnalysisAction.getLoginUserScore(reqData, type);
    };

    // 用户分数
    renderUserLoginScore = (app) => {
        let loginScore = _.get(this.state.appUserDataMap, [app.app_id, 'loginScore']) || {};
        if (loginScore.errorMsg) {
            return (
                <div className="login-info">
                    <div className="alert-tip">
                        {loginScore.errorMsg}，
                        <a href="javascript:void(0)" onClick={this.retryGetUserLoginScore}>{Intl.get('common.retry', '重试')}</a>
                    </div>
                </div>
            );
        }
        if (_.get(loginScore.data, 'score') === undefined) {
            return null;
        } else {
            return (
                <div className='login-score'>
                    <div className="score-container total-score">
                        <span className="over-icon">{Intl.get('user.login.total.score', '总分')}</span>
                        <Progress
                            type="circle"
                            width={100}
                            percent={this.transScoreInteger(_.get(loginScore.data, 'score') || 0)}
                            format={percent => `${percent}`}
                        />
                    </div>
                    <ul className="score-container">
                        <li>
                            {Intl.get('user.login.latest.activity.score', '最新活跃度')}:
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'latest_activity_score') || 0)}</span>
                        </li>
                        <li>
                            {Intl.get('user.login.latest.immersion.score', '最新沉浸度')}:
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'latest_immersion_score') || 0)}</span>
                        </li>
                        <li>
                            {Intl.get('user.login.freshness.score', '新鲜度')}:
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'freshness_score') || 0)}</span>
                        </li>
                        <li>
                            {Intl.get('user.login.history.activity.score', '历史活跃度')}:
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'history_activity_score') || 0)}</span>
                        </li>
                        <li>
                            {Intl.get('user.login.history.immersion.score', '历史沉浸度')}:
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'history_immersion_score') || 0)}</span>
                        </li>
                    </ul>
                </div>
            );
        }
    };

    // 重新用户登录信息
    retryGetUserLoginInfo = () => {
        let queryObj = this.getQueryParams();
        UserLoginAnalysisAction.getUserLoginInfo(queryObj);
    };

    // 用户登录信息
    renderUserLoginInfo = (app) => {
        const loginInfo = _.get(this.state.appUserDataMap, [app.app_id, 'loginInfo']) || {};
        let millisecond = loginInfo.duration || '';
        let timeObj = { timeDescr: ' ' };
        if (millisecond !== '') {
            timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(millisecond / 1000));
        }
        let count = loginInfo.count;
        if (loginInfo.errorMsg) {
            return (
                <div className="login-info">
                    <div className="alert-tip">
                        {loginInfo.errorMsg}，
                        <a href="javascript:void(0)" onClick={this.retryGetUserLoginInfo}>{Intl.get('common.retry', '重试')}</a>
                    </div>
                </div>
            );
        }
        if (count || millisecond) {
            return (
                <div className="login-info clearfix">
                    {Oplate.hideSomeItem ? null : (
                        <div className="info-item-container">
                            {Intl.get('user.login.duration', '在线时长')}：<span className="login-stress">{timeObj.timeDescr}</span>
                        </div>
                    )}
                    <div className="info-item-container">
                        {Intl.get('user.login.times', '登录次数')}：<span className="login-stress">{count}</span>
                    </div>

                    {this.renderLoginFirstLastTime(loginInfo.last, loginInfo.first)}
                </div>
            );
        } else {
            return null;
        }
    };

    // 重新获取图表数据
    retryGetLoginChart = () => {
        let queryObj = this.getQueryParams();
        UserLoginAnalysisAction.getUserLoginChartInfo(queryObj);
    };

    renderLoginChart = (app) => {
        const loginChartInfo = _.get(this.state.appUserDataMap, [app.app_id, 'loginChartInfo']);
        if (loginChartInfo.errorMsg) {
            return (
                <div className="login-info">
                    <div className="alert-tip">
                        {loginChartInfo.errorMsg}，
                        <a href="javascript:void(0)" onClick={this.retryGetLoginChart}>{Intl.get('common.retry', '重试')}</a>
                    </div>
                </div>
            );
        }
        const radioValue = [{ value: 'LoginFrequency', name: '次数' }, { value: 'loginDuration', name: '时长' }];
        if (_.isArray(loginChartInfo.loginDuration) || _.isArray(loginChartInfo.loginCount)) {
            return (
                <div className="login-chart">
                    {Oplate.hideSomeItem ? (
                        <div className="duration-chart">
                            {loginChartInfo.count ? (
                                <div className="v8-chart-title"> {Intl.get('user.login.times', '登录次数')}</div>
                            ) : null}
                            {this.renderChart(loginChartInfo.loginCount, this.chartFrequencyTooltip)}
                        </div>
                    ) : (
                        <CardContainer
                            radioValue={radioValue}
                            dateRange={this.state.selectValueMap[app.app_id] || 'LoginFrequency'}
                            onDateRangeChange={this.handleSelectRadio.bind(this, app)}
                            title={Intl.get('user.detail.loginAnalysis.title', '近一年的活跃统计')}
                        >
                            <div className="duration-chart">
                                {
                                    this.state.selectValueMap[app.app_id] === 'loginDuration' ?
                                    // 时长
                                        this.renderChart(loginChartInfo.loginDuration, this.durationTooltip) :
                                    // 次数
                                        this.renderChart(loginChartInfo.loginCount, this.chartFrequencyTooltip)
                                }
                            </div>
                        </CardContainer>
                    )}
                </div>
            );
        } else {
            return null;
        }

    };

    renderChart = (data, charTips) => {
        const calendarHeatMapOption = {
            calendar: [{
                cellSize: [7, 7],
                left: 'center',
                top: 20,
            }],
            tooltip: {
                formatter: charTips
            },
        };

        if (_.isArray(data) && data.length) {
            return (
                <AntcChart
                    resultType=""
                    data={data.map(x => ([moment(x.date).format('YYYY-MM-DD'), x.sum]))}
                    chartType="calendar_heatmap"
                    option={calendarHeatMapOption}
                />

            );
        } else {
            return (
                <div className="alert-tip">
                    {Intl.get('common.no.data', '暂无数据')}
                </div>
            );
        }
    };

    // 用户登录时长的统计图的提示信息
    durationTooltip = (params) => {
        const data = params.data;
        const date = _.first(data);
        const value = _.last(data);
        let timeObj = TimeUtil.secondsToHourMinuteSecond(value || 0);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${date}`,
            Intl.get('user.duration', '时长') + ' : ' + `${timeObj.timeDescr}`
        ].join('<br />');
    };

    // 用户登录次数的统计图的提示信息
    chartFrequencyTooltip = (params) => {
        const data = params.data;
        const date = _.first(data);
        const value = _.last(data);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${date}`,
            Intl.get('user.login.time', '次数') + ' : ' + `${value}`
        ].join('<br />');
    };

    handleSelectRadio = (dataRange) => {
        this.setState({
            selectValue: dataRange
        });
    };

    showAppDetail = (app, isShow) => {
        const showDetailMap = this.state.showDetailMap;
        showDetailMap[app.app_name] = isShow;
        if (isShow) {
            this.getUserAnalysisData({ appid: app.app_id });
        }
        this.setState({
            showDetailMap
        });
    };

    state = {
        selectValue: 'LoginFrequency',
        selectValueMap: {},          
        showDetailMap: {},//是否展示app详情的map
        ...this.getStateData()
    };

    render() {
        const userLoginBlock = (
            <ul>
                {
                    this.state.userOwnAppArray.map((app, index) => {
                        const userInfo = this.state.appUserDataMap[app.app_id] || {};
                        const loading = userInfo.loading;
                        return (
                            <DetailCard
                                key={index}
                                titleBottomBorderNone={!this.state.showDetailMap[app.app_name]}
                                title={(
                                    <div className='title-container'>
                                        <span className="logo-container" title={app.app_name}>
                                            <DefaultUserLogoTitle
                                                nickName={app.app_name}
                                                userLogo={app.app_logo}
                                            />
                                        </span>
                                        <p title={app.app_name}>{app.app_name}</p>
                                        <span className="btn-bar">
                                            {
                                                this.state.showDetailMap[app.app_name] ?
                                                    <span className="iconfont icon-up-twoline" onClick={this.showAppDetail.bind(this, app, false)}></span> :
                                                    <span className="iconfont icon-down-twoline" onClick={this.showAppDetail.bind(this, app, true)}></span>
                                            }
                                        </span>
                                    </div>
                                )}
                                content={
                                    this.state.showDetailMap[app.app_name] ?
                                        (<StatusWrapper
                                            loading={loading}
                                            size='medium'
                                        >
                                            <div className="user-login-info">
                                                {
                                                    !loading && (!_.get(userInfo, 'loginInfo', 'count') && !_.get(userInfo, 'loginInfo', 'duration') ? <div className="user-no-login">
                                                        {Intl.get('user.no.login.system', '该用户还没有登录过系统')}
                                                    </div> : <div>
                                                        {this.renderUserLoginScore(app)}
                                                        {this.renderUserLoginInfo(app)}
                                                        {this.renderLoginChart(app)}
                                                    </div>)
                                                }
                                            </div>
                                        </StatusWrapper>) : null
                                }
                            />
                        );
                    })
                }
            </ul>
        );
        return (
            <StatusWrapper
                loading={this.state.appListLoading}
            >
                <div className="user-analysis-panel" style={{ height: this.props.height }}>
                    <GeminiScrollbar>
                        {userLoginBlock}
                    </GeminiScrollbar>
                </div>
            </StatusWrapper>
        );
    }
}

module.exports = UserLoginAnalysis;
