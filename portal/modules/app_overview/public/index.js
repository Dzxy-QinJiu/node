/**
 * 应用概览页组成一个大的组件
 * 通过调用应用ID（app_id),查看每个应用的情况
 */
require('./css/app-overview.less');
import AppUserInfo from 'CMP_DIR/app-overview/app-user-info'; // 当前在线、今日上线、用户总数和新增用户的总数据
import CardContainer from 'CMP_DIR/card-container'; // 容器
import AppUserRate from 'CMP_DIR/app-overview/app-user-rate';
const AreaLine = require('CMP_DIR/chart/arealine'); // 活跃度
const ChinaMap = require('CMP_DIR/china-map'); // 中国地图
import { Table, Row, Col} from 'antd';
const GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import AppOverViewActions from './action/app-overview-actions';
import AppOverViewStore from './store/app-overview-store';
const history = require('PUB_DIR/sources/history');
const AppUserAction = require('../../app_user_manage/public/action/app-user-actions');
const AppOverViewAjax = require('./ajax/app-overview-ajax');
const Spinner = require('CMP_DIR/spinner');
const TimeStampUtil = require('PUB_DIR/sources/utils/time-stamp-util');
const AppUserUtil = require('../../app_user_manage/public/util/app-user-util');
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import { storageUtil } from 'ant-utils';

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 30,
    BOTTOM_DISTANCE: 35
};
//地图的formatter
function mapFormatter(obj) {
    return [
        Intl.get('oplate_bd_analysis_realm_zone.1','省份') + '：' + obj.name ,
        Intl.get('oplate_bd_analysis_realm_industry.6','个数') + '：' + (isNaN(obj.value) ? 0 : obj.value)
    ].join('<br/>');
}

const LAST_SELECT_APPS_KEY = 'app_over_view_app_id';

const ORIGINAL_DATA = {
    active: 0,
    percent: 0
};

const AppOverView = React.createClass({
    getInitialState() {
        return {
            app_id: '',
            appList: '',
            weeklyActiveRate: ORIGINAL_DATA, // 本周的活跃率和活跃数
            monthlyActiveRate: ORIGINAL_DATA, // 本月的活跃率和活跃数
            ...AppOverViewStore.getState()
        };
    },
    onStoreChange() {
        this.setState(
            AppOverViewStore.getState()
        );
    },
    componentDidMount() {
        AppOverViewStore.listen(this.onStoreChange);
        $('body').css('overflow', 'hidden');
        //绑定window的resize，进行缩放处理
        $(window).on('resize', this.windowResize);
        AppOverViewAjax.getAppList().then( (result) => {
            let appList = _.isArray(result) ? result : [];
            let storageValue = JSON.parse(storageUtil.local.get(AppUserUtil.saveSelectAppKeyUserId));
            let app_id = storageValue && storageValue[LAST_SELECT_APPS_KEY] ? storageValue[LAST_SELECT_APPS_KEY ] : '';
            if (!app_id) {
                app_id = appList[0] ? appList[0].app_id : '';
            }
            this.setState({
                app_id: app_id,
                appList: appList
            }, () => {
                this.getAppData();
            });
        } );
    },
    //缩放延时，避免页面卡顿
    resizeTimeout: null,
    //窗口缩放时候的处理函数
    windowResize(){
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout( () => {
            //窗口缩放的时候，调用setState，重新走render逻辑渲染
            this.setState(AppOverViewStore.getState());
        });
    },
    componentWillUnmount() {
        AppOverViewStore.unlisten(this.onStoreChange);
        $('body').css('overflow', 'visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        $(window).off('resize', this.windowResize);
    },
    getAppData() {
        this.getAppUserCount(); // 获取用户数量
        this.getAppActiveNess( this.state.activeNess.dateRange, TimeStampUtil.getNearlyMonthTimeStamp()); // 活跃度（默认是日活）
        this.getActiveUserAndRate(); // 获取今日、本周和本月的活跃数和活跃率
        this.getAddedUserTeam(this.state.teamAnalysis.dateRange, TimeStampUtil.getTodayTimeStamp()); // 新增用户的团队（默认的是今日）
        this.getUserZone(this.state.zoneAnalysis.dateRange, TimeStampUtil.getNearlyWeekTimeStamp()); // 用户的地域统计（默认的是新增用户）
    },
    // 用户总数、新增用户数、活跃度、新增用户（团队和地域）共同的参数
    getCommonQueryParams() {
        let type = 'common';//USER_ANALYSIS_COMMON
        if (hasPrivilege('USER_ANALYSIS_MANAGER')) {
            type = 'manager';
        }
        let queryParams = {
            app_id: this.state.app_id,
            authType: type
        };
        return queryParams;
    },
    // 今日上线的参数
    getTodayOnlineParams() {
        let timeStamp = TimeStampUtil.getTodayTimeStamp();
        return {
            app_id: this.state.app_id,
            login_begin_date: timeStamp.start_time,
            login_end_date: timeStamp.end_time,
            page_num: 1,
            page_size: 1,
            logins_min: 1
        };
    },
    // 获取数据所需参数
    getQueryParams(timeStamp) {
        let queryParams = this.getCommonQueryParams();
        queryParams.starttime = timeStamp.start_time;
        queryParams.endtime = timeStamp.end_time;
        return queryParams;
    },
    // 获取当前在线、今日上线、用户总数和新增用户的数量
    getAppUserCount() {
        AppOverViewActions.getOnlineUserList(1, 1, {client_id: this.state.app_id}); // 当前在线用户数
        AppOverViewActions.getRecentLoginUsers(this.getTodayOnlineParams()); // 今日上线用户数
        let userCountParams = this.getQueryParams(TimeStampUtil.getNearlyWeekTimeStamp());
        AppOverViewActions.getUserTypeStatistics('total', userCountParams); // 用户总数
        AppOverViewActions.getAddedUserTypeStatistics('added', userCountParams); // 新增用户
    },
    // 获取活跃度
    getAppActiveNess(getAppActiveNess, timeStamp) {
        let activeParams = this.getQueryParams(timeStamp);
        AppOverViewActions.getUserActiveNess('total', getAppActiveNess, activeParams);
    },
    commonActiveUserRate(timeStamp, dateRange) {
        let queryParams = this.getQueryParams(timeStamp);
        AppOverViewAjax.getUserActiveNess('total', dateRange, queryParams).then( (result) => {
            if (_.isArray(result) && result.length) {
                let resData = result[0].datas && _.isArray(result[0].datas) && result[0].datas[0];
                if (dateRange == 'weekly') {
                    this.setState({
                        weeklyActiveRate: resData
                    });
                } else if (dateRange == 'monthly') {
                    this.setState({
                        monthlyActiveRate: resData
                    });
                }
            }
        } );
    },
    // 获取今日、本周和本月的活跃数和活跃度
    getActiveUserAndRate() {
        this.commonActiveUserRate(TimeStampUtil.getThisWeekTimeStamp(), 'weekly');
        this.commonActiveUserRate(TimeStampUtil.getThisMonthTimeStamp(), 'monthly');
    },
    // 新增用户的团队统计
    getAddedUserTeam(dateRange, timeStamp) {
        let queryParams = this.getQueryParams(timeStamp);
        AppOverViewActions.getAddedTeam(dateRange, queryParams);
    },
    // 用户的地域统计(新增用户)
    getUserZone(dateRange, timeStamp) {
        let queryParams = this.getQueryParams(timeStamp);
        AppOverViewActions.getAddedZone(dateRange, queryParams);
    },
    //  查看当前在线的用户详情
    handleViewCurOnlineDetail() {
        // 跳转到在线用户列表
        history.pushState({
            client_id: this.state.app_id
        } , '/online/list' ,{});
    },
    // 查看今日上线的用户详情
    handleViewTodayUserDetail() {
        // 跳转到今日上线用户界面
        history.pushState({} , '/user/list' ,{});
        AppUserAction.setRecentLoginPanelFlag(true);
    },
    // 查看用户总数的详情
    handleViewTotalUserDetail() {
        // 跳转到用户列表
        history.pushState({
            app_id: this.state.app_id,
            page_size: 20
        } , '/user/list' ,{});
    },
    // 当前在线、今日上线、用户总数和新增用户的总数据
    renderAppUserInfo() {
        const curOnLine = [{ count: this.state.curOnlineNumber, name: '在线'}]; // 当前在线数据
        const todayOnLine = [{count: this.state.todayUserLine, name: '日活'}]; // 今日上线数据
        const userTotal = this.state.userType.data; // 用户总数数据
        const addNewUser = this.state.newUserType.data; // 新增用户数据
        return (
            <div className="clearfix">
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <AppUserInfo title="当前在线" content={curOnLine} viewDetail={this.handleViewCurOnlineDetail}/>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <AppUserInfo title="今日上线" content={todayOnLine} viewDetail={this.handleViewTodayUserDetail} />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <AppUserInfo title="用户总数" content={userTotal} viewDetail={this.handleViewTotalUserDetail}/>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <AppUserInfo title="新增用户" content={addNewUser}/>
                    </Col>
                </Row>
            </div>
        );
    },
    //  活跃度切换条件时，获取对应的时间
    activeNessTimeStamp(dateRange) {
        if (dateRange == 'daily') {
            return TimeStampUtil.getNearlyMonthTimeStamp();
        } else if (dateRange == 'weekly') {
            return TimeStampUtil.getNearlyQuarterTimeStamp();
        } else if (dateRange == 'monthly') {
            return TimeStampUtil.getNearlyYearTimeStamp();
        }
    },
    // 活跃度中日活、周活和月活的切换
    activeDataRangeChange(dateRange) {
        let timeStamp = this.activeNessTimeStamp(dateRange);
        this.getAppActiveNess(dateRange, timeStamp);
    },
    // 活跃度和活跃率的数据处理
    handleRateData(activeRate) {
        let activeRateObj = {active: 0, percent: 0};
        if (activeRate) {
            activeRateObj.active = activeRate.active || 0;
            activeRateObj.percent = activeRate.percent || 0;
        }
        return activeRateObj;
    },
    // 活跃度
    renderAppUserActive() {
        let todayActiveRate = this.handleRateData(this.state.todayActiveRate);
        let weeklyActiveRate = this.handleRateData(this.state.weeklyActiveRate);
        let monthlyActiveRate = this.handleRateData(this.state.monthlyActiveRate);
        const appUserRate = [{active: todayActiveRate.active, date: '今日', percent: todayActiveRate.percent},
            {active: weeklyActiveRate.active, date: '本周', percent: weeklyActiveRate.percent},
            {active: monthlyActiveRate.active, date: '本月', percent: monthlyActiveRate.percent}
        ];
        const radioValue = [{value: 'daily', name: '日活'}, {value: 'weekly', name: '周活'},{value: 'monthly', name: '月活'}];
        let timeObj = this.activeNessTimeStamp(this.state.activeNess.dateRange);
        return (
            <CardContainer
                title='活跃度'
                radioValue={radioValue}
                dateRange={this.state.activeNess.dateRange}
                onDateRangeChange={this.activeDataRangeChange}
            >
                <div className="active-chart">
                    <AreaLine
                        list={this.state.activeNess.data}
                        dateRange={this.state.activeNess.dateRange}
                        resultType={this.state.activeNess.resultType}
                        dataType={this.state.activeNess.dataType}
                        startTime={timeObj.start_time}
                        endTime={timeObj.end_time}
                        height={310}
                    />
                </div>
                <div className="user-rate">
                    {appUserRate.map( (userRate) => {
                        return <div>
                            <AppUserRate appUserRate={userRate}/>
                        </div>;
                    } )}
                </div>
            </CardContainer>
        );
    },
    // 新增用户,团队分布table列
    getAddNewUserColumns() {
        return [{title: '团队', dataIndex: 'name', key: 'team'},
            {title: '试用', dataIndex: 'count', key: 'count', className: 'text-align-right', width: '50'},
            {title: '签约', dataIndex: 'official', key: 'official', className: 'text-align-right', width: '50'}
        ];
    },
    // 新增用户的团队切换条件时，获取对应的时间
    teamTimeStamp(dateRange) {
        if (dateRange == 'today') {
            return TimeStampUtil.getTodayTimeStamp();
        } else if (dateRange == 'week') {
            return TimeStampUtil.getThisWeekTimeStamp();
        } else if (dateRange == 'month') {
            return TimeStampUtil.getThisMonthTimeStamp();
        }
    },
    // 新增用户切换：今天、本周和本月
    newUserTeamRangeChange(dateRange) {
        let timeStamp = this.teamTimeStamp(dateRange);
        this.getAddedUserTeam(dateRange, timeStamp);
    },
    // 新增用户的团队试用和签约的用户数
    renderAddNewUser() {
        const radioValue = [{value: 'today', name: '今日'}, {value: 'week', name: '本周'},{value: 'month', name: '本月'}];
        const columns = this.getAddNewUserColumns();
        const data = this.state.teamAnalysis.data;
        return (
            <CardContainer
                title='新增用户'
                radioValue={radioValue}
                dateRange={this.state.teamAnalysis.dateRange}
                onDateRangeChange={this.newUserTeamRangeChange}
            >
                <div className="add-new-user-table">
                    {this.state.teamAnalysis.resultType == 'loading' ? (
                        <div className="loadwrap">
                            <Spinner/>
                        </div>
                    ) : (
                        <Table columns={columns} dataSource={data} pagination={{pageSize: 12}}/>
                    )}
                </div>
            </CardContainer>
        );
    },
    // 用户地图,用户的地域分布，table列
    getUserAreaNumber() {
        return [
            {title: '地域', dataIndex: 'name', key: 'name'}, {title: '用户数', dataIndex: 'value', key: 'value', className: 'text-align-right', width: '60'}];
    },
    //计算图表的尺寸
    getChartDimension() {
        var windowWidth = $(window).width() * 0.7 * 0.7;
        var windowHeight = $(window).height() * 0.4;
        return {
            //地图的宽度
            chinaMapWidth: windowWidth,
            //地图的高度
            chinaMapHeight: windowHeight
        };
    },
    // 新增用户、在线用户和全部用户切换，发送的请求
    userZone(dateRange) {
        if (dateRange == 'online') { // 在线用户的数据是假数据，需要根据条件更换（****）
            AppOverViewActions.getOnLineUserZone(dateRange, {client_id: this.state.app_id, select_mode: 'grouping'});
        } else if (dateRange == 'total') {
            let queryParams = this.getCommonQueryParams();
            queryParams.status = 1;
            AppOverViewActions.getTotalZone(dateRange, queryParams);
        } else if (dateRange == 'added') {
            this.getUserZone(dateRange, TimeStampUtil.getNearlyWeekTimeStamp());
        }
    },
    // 用户地图的切换：新增用户、在线用户和全部用户
    userZoneRangeChange(dateRange) {
        this.userZone(dateRange);
    },
    // 用户地图
    renderUserMap() {
        const radioValue = [{value: 'added', name: '新增用户'},
            {value: 'online', name: '在线用户'},
            {value: 'total', name: '全部用户'}
        ];
        const columns = this.getUserAreaNumber();
        const data = this.state.zoneAnalysis.data;
        //图表信息
        let chartInfo = this.getChartDimension();
        //地图的宽度
        let chinaMapWidth = chartInfo.chinaMapWidth;
        //地图的高度
        let chinaMapHeight = chartInfo.chinaMapHeight;
        return (
            <CardContainer
                title='用户地图'
                radioValue={radioValue}
                dateRange={this.state.zoneAnalysis.dateRange}
                onDateRangeChange={this.userZoneRangeChange}
            >
                <div className="user-map-distribute cleardfix" ref="chartmap">
                    <div className="map-distribute">
                        <ChinaMap width={chinaMapWidth} dataList={data} formatter={mapFormatter}/>
                    </div>
                    <div className="user-area-number-table cleardfix">
                        {this.state.zoneAnalysis.resultType == 'loading' ? (
                            <div className="loadwrap">
                                <Spinner/>
                            </div>
                        ) : (
                            <Table columns={columns} dataSource={data} pagination={{pageSize: 12}}/>
                        )}
                    </div>
                </div>
            </CardContainer>
        );
    },
    // 新增用户和用户地图
    renderNewUserAndMap() {
        return (
            <Row gutter={16}>
                <Col className="add-new-user" xs={24} sm={24} md={24}>
                    {this.renderAddNewUser()}
                </Col>
                <Col className="user-map" xs={24} sm={24} md={24}>
                    {this.renderUserMap()}
                </Col>
            </Row>
        );
    },
    onSelectedAppChange(app_id) {
        AppOverViewActions.resetData();
        if (app_id) {
            let obj = AppUserUtil.getLocalStorageObj(LAST_SELECT_APPS_KEY,app_id );
            storageUtil.local.set(AppUserUtil.saveSelectAppKeyUserId, JSON.stringify(obj));
        }
        //设置当前选中应用
        this.setState({
            app_id: app_id,
            weeklyActiveRate: ORIGINAL_DATA, // 本周的活跃率和活跃数
            monthlyActiveRate: ORIGINAL_DATA
        }, () => this.getAppData());
    },
    // 应用列表
    getAppOptions() {
        var appList = this.state.appList;
        if (!_.isArray(appList) || !appList.length) {
            appList = [];
        }
        return appList.map( (item) => {
            return <Option key={item.app_id} value={item.app_id} title={item.app_name}>{item.app_name}</Option>;
        });
    },
    render() {
        let divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        let appOptions = this.getAppOptions();
        return (
            <div className="app-over-view">
                <div className="app-over-view-header">
                    <div className="app-select">
                        <SelectFullWidth
                            optionFilterProp="children"
                            showSearch
                            minWidth={120}
                            value={this.state.app_id}
                            onChange={this.onSelectedAppChange.bind(this)}
                            notFoundContent={!appOptions.length ? Intl.get('user.no.app', '暂无应用') : Intl.get('user.no.related.app', '无相关应用')}
                        >
                            {appOptions}
                        </SelectFullWidth>
                    </div>
                </div>
                <GeminiScrollbar style={{ height: divHeight }}>
                    <div className="app-over-view-page clearfix">
                        <div className="user-info">{this.renderAppUserInfo()}</div>
                        <div className="user-active">{this.renderAppUserActive()}</div>
                        <div className="user-distribute">{this.renderNewUserAndMap()}</div>
                    </div>
                </GeminiScrollbar>
            </div>

        );
    }
});

module.exports = AppOverView;