require('../css/user-login-analysis.less');
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
import { Progress, Tooltip, Icon, Alert, Select } from 'antd';
const Option = Select.Option;
import PropTypes from 'prop-types';
import {DATE_SELECT} from 'PUB_DIR/sources/utils/consts';

//日历热力图颜色
const CALENDER_COLOR = {
    BORDER: '#A2A2A2',
    CONTENT: '#7190B4'
};

class UserLoginAnalysis extends React.Component {
    static defaultProps = {
        userId: '1'
    };

    static propTypes = {
        userId: PropTypes.string,
        selectedAppId: PropTypes.string,
        height: PropTypes.number,
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return UserLoginAnalysisStore.getState();
    };

    getUserAnalysisInfo = (userId, selectedAppId) => {
        UserLoginAnalysisAction.getSingleUserAppList({ user_id: userId, timeType: 'year' }, selectedAppId);
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
        let lastLoginParams = this.getUserLastLoginParams(queryParams);
        let reqData = this.getUserLoginScoreParams(queryParams);
        let type = this.getUserLoginType();
        UserLoginAnalysisAction.getUserLoginInfo(queryObj);
        // 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
        UserLoginAnalysisAction.getLoginUserActiveStatistics(lastLoginParams, type);
        UserLoginAnalysisAction.getUserLoginChartInfo(lastLoginParams);
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

    // 统计最近登录用户信息的参数
    getUserLastLoginParams = (queryParams) => {
        let app_id = queryParams && queryParams.appid || this.state.selectedLogAppId;
        return {
            user_id: this.props.userId,
            appid: app_id,
            starttime: queryParams && queryParams.starttime || moment().subtract(1, 'year').valueOf(),
            endtime: new Date().getTime()
        };
    }

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
                            <span>{Intl.get('user.login.latest.activity.score', '最新活跃度')}:</span>
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'latest_activity_score') || 0)}
                                <Tooltip trigger="click" title={Intl.get('user.detail.analysis.tip.activity', '最近30天的活跃天数/30。该分项在总分中占比30%')}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
                        </li>
                        <li>
                            <span>{Intl.get('user.login.latest.immersion.score', '最新沉浸度')}:</span>
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'latest_immersion_score') || 0)}
                                <Tooltip trigger="click" title={Intl.get('user.detail.analysis.tip.deep', '最近30天的在线分钟数/(30*24*60)。该分项在总分中占比30%')}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
                        </li>
                        <li>
                            <span>{Intl.get('user.login.freshness.score', '新鲜度')}:</span>
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'freshness_score') || 0)}
                                <Tooltip trigger="click" title={Intl.get('user.detail.analysis.tip.fresh', '距离最近的登录时间。该分项在总分中占比20%')}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
                        </li>
                        <li>
                            <span>{Intl.get('user.login.history.activity.score', '历史活跃度')}:</span>
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'history_activity_score') || 0)}
                                <Tooltip trigger="click" title={Intl.get('user.detail.analysis.tip.historyActivity', '总活跃天数/开通的总天数。该分项在总分中占比10%')}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
                        </li>
                        <li>
                            <span>{Intl.get('user.login.history.immersion.score', '历史沉浸度')}:</span>
                            <span className="login-stress">{this.transScoreInteger(_.get(loginScore.data, 'history_immersion_score') || 0)}
                                <Tooltip trigger="click" title={Intl.get('user.detail.analysis.tip.historyFresh', '总在线分钟数/开通总分钟数。该分项在总分中占比10%')}>
                                    <Icon type="question-circle-o" />
                                </Tooltip>
                            </span>
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
        if (!loginChartInfo) {
            return null;
        }
        if (_.get(loginChartInfo, 'errorMsg')) {
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
                            title=''
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
        //今天
        const today = moment().format(oplateConsts.DATE_FORMAT);
        //六个月前
        const sixMonthAgo = moment().subtract(6, 'months').format(oplateConsts.DATE_FORMAT);

        const range = [sixMonthAgo, today];

        const calendarHeatMapOption = {
            calendar: [{
                cellSize: [13, 13],
                left: 10,
                top: 20,
                range,
                splitLine: {
                    lineStyle: {
                        color: CALENDER_COLOR.BORDER
                    }
                }
            }],
            tooltip: {
                formatter: charTips
            },
            visualMap: {
                inRange: {
                    color: ['#fff', CALENDER_COLOR.CONTENT]
                }
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
        const date = _.first(data.value);
        const value = _.last(data.value);
        const timeObj = TimeUtil.secondsToHourMinuteSecond(value || 0);
        const sumObj = TimeUtil.secondsToHourMinuteSecond(data.monthSum || 0);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${date}`,
            Intl.get('user.duration', '时长') + ' : ' + `${timeObj.timeDescr}`,
            Intl.get('common.the.month.total', '本月合计') + ' : ' + `${sumObj.timeDescr}`
        ].join('<br />');
    };

    // 用户登录次数的统计图的提示信息
    chartFrequencyTooltip = (params) => {
        const data = params.data;
        const date = _.first(data.value);
        const value = _.last(data.value);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${date}`,
            Intl.get('user.login.time', '次数') + ' : ' + `${value}`,
            Intl.get('common.the.month.total', '本月合计') + ' : ' + `${data.monthSum}`
        ].join('<br />');
    };

    handleSelectRadio = (app, dataRange) => {
        const { selectValueMap } = this.state;
        selectValueMap[app.app_id] = dataRange;
        this.setState({
            selectValueMap
        });
    };

    showAppDetail = (app, isShow) => {
        const showDetailMap = this.state.showDetailMap;
        showDetailMap[app.app_id] = isShow;
        if (isShow) {
            this.getUserAnalysisData({ appid: app.app_id });
        }
        this.setState({
            showDetailMap
        });
    };
    handleSelectDate = (app, value) => {
        let starttime = moment().subtract(1, 'year').valueOf();
        if (value === 'month') {
            starttime = moment().subtract(1, 'month').valueOf();
        } else if (value === 'week') {
            starttime = moment().subtract(1, 'week').valueOf();
        }
        let queryObj = this.getUserLastLoginParams({appid: app.app_id, starttime: starttime});
        let type = this.getUserLoginType();
        let reqData = {...queryObj, timeType: value};
        // 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
        UserLoginAnalysisAction.getLoginUserActiveStatistics(reqData, type);
        UserLoginAnalysisAction.getUserLoginChartInfo(reqData);
    };
    // 渲染时间选择框
    renderTimeSelect = (app) => {
        let timeType = _.get(this.state.appUserDataMap, [app.app_id, 'timeType'], 'year');
        let list = _.map(DATE_SELECT, item =>
            <Option value={item.value} key={item.value} title={item.name}>{item.name}</Option>);
        return (
            <div className="last-login-select">
                <div className="last-login-title">
                    <ReactIntl.FormattedMessage
                        id="user.login.last.title"
                        defaultMessage={'{title} 的活跃统计'}
                        values={{
                            'title': <Select
                                style={{ width: 100 }}
                                value={timeType}
                                onChange={this.handleSelectDate.bind(this, app)}
                            >
                                {list}
                            </Select>
                        }}
                    />:
                </div>
            </div>
        );
    };

    // 重新获取用户最近的登录信息（登录时长、登录次数、活跃天数)
    retryGetLastLoginInfo = () => {
        let queryObj = this.getUserLastLoginParams();
        let type = this.getUserLoginType();
        UserLoginAnalysisAction.getLoginUserActiveStatistics(queryObj, type);
    };


    // 渲染用户最近的登录信息（登录时长、登录次数、活跃天数）
    renderLastLoginInfo = (app) => {
        const activeInfo = _.get(this.state.appUserDataMap, [app.app_id, 'activeInfo']);
        if (!activeInfo) {
            return null;
        }
        const count = _.get(activeInfo, 'count', 0);
        const duration = _.get(activeInfo, 'duration', 0);
        const activeDays = _.get(activeInfo, 'activeDays', 0);
        let timeObj = {};
        if (duration) {
            timeObj = TimeUtil.secondsToHourMinuteSecond(Math.floor(duration / 1000));
        }
        if (_.get(activeInfo, 'errorMsg')) {
            return (
                <div className="login-info">
                    <div className="alert-tip">
                        {activeInfo.errorMsg}，
                        <a href="javascript:void(0)" onClick={this.retryGetLastLoginInfo}>
                            {Intl.get('common.retry', '重试')}
                        </a>
                    </div>
                </div>
            );
        }
        return (
            <div className="last-login-info">
                <span>{Intl.get('user.login.times', '登录次数')}:
                    <span className="login-stress">{count || 0 }</span>
                </span>
                <span>，{Intl.get('user.login.days', '活跃天数')}:
                    <span className="login-stress">{activeDays || 0}</span>
                </span>
                <span>，{Intl.get('user.login.duration', '在线时长')}:
                    <span className="login-stress">{timeObj.timeDescr || 0 }</span>
                </span>
            </div>
        );
    };

    // 登录用户活跃统计信息（登录时长，登录次数，活跃天数，热力图）
    renderUserLoginActiveInfo = (app) => {
        return (
            <div>
                {this.renderLastLoginInfo(app)}
                {this.renderLoginChart(app)}
            </div>
        );
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
                    _.map(this.state.userOwnAppArray, (app, index) => {
                        const userInfo = this.state.appUserDataMap[app.app_id] || {};
                        const loading = userInfo.loading;
                        const isLoading = userInfo.isLoading;
                        return (
                            <DetailCard
                                key={index}
                                titleBottomBorderNone={!this.state.showDetailMap[app.app_id]}
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
                                                this.state.showDetailMap[app.app_id] ?
                                                    <span className="iconfont icon-up-twoline" onClick={this.showAppDetail.bind(this, app, false)}></span> :
                                                    <span className="iconfont icon-down-twoline" onClick={this.showAppDetail.bind(this, app, true)}></span>
                                            }
                                        </span>
                                    </div>
                                )}
                                content={
                                    this.state.showDetailMap[app.app_id] ?
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
                                                        <div className="last-login-active-statistics">
                                                            {this.renderTimeSelect(app)}
                                                            <StatusWrapper
                                                                loading={isLoading}
                                                                size='medium'
                                                            >
                                                                {this.renderUserLoginActiveInfo(app)}
                                                            </StatusWrapper>
                                                        </div>
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
                        {_.get(this.state.userOwnAppArray, 'length') > 0 ? userLoginBlock :
                            <div className="alert-container">
                                <Alert
                                    message={Intl.get('common.no.data', '暂无数据')}
                                    type="info"
                                    showIcon={true}
                                />
                            </div>                            
                        }
                    </GeminiScrollbar>
                </div>
            </StatusWrapper>
        );
    }
}

module.exports = UserLoginAnalysis;
