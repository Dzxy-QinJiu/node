/**
 * author:周连毅
 * 说明：统计分析-用户分析
 */
//顶部导航
require("./css/oplate-user-analysis.scss");
var FilterBtn = require("../../../components/filter-btn");
var TopNav = require("../../../components/top-nav");
var AnalysisMenu = require("../../../components/analysis_menu");
var AnalysisAppSelector = require("../../../components/analysis_app_selector");
import { AntcDatePicker } from "antc";
var GeminiScrollbar = require("../../../components/react-gemini-scrollbar");
var AnalysisLayout = require("./utils/analysis-layout");
var OplateUserAnalysisAction = require("./action/oplate-user-analysis.action");
var OplateUserAnalysisAjax = require("./ajax/oplate-user-analysis.ajax");
var OplateUserAnalysisStore = require("./store/oplate-user-analysis.store");
var SummaryNumber = require("./views/summary-number");
var CompositeLine = require("./views/composite-line");
var BarChart = require("./views/bar");
var CloudChart = require("./views/cloud");
var ScatterChart = require("../../../components/chart/scatter");
var AreaLine = require('CMP_DIR/chart/arealine');
var SingleLineChart = require("./views/single_line");
var emitter = require("./utils/emitter");
var DATE_FORMAT = oplateConsts.DATE_FORMAT;
import { Checkbox, Row, Col } from 'antd';
var PieChart = require("./views/piechart");
var Retention = require("./views/retention");
var SingleAppBarChart = require("./views/single-app-bar");
const StackLineChart = require("./views/stack-line");
const AppRecordsListAjax = require("../../app_manage/public/ajax/version-upgrade-log-ajax");
import Trace from "LIB_DIR/trace";
import { hasPrivilege } from "CMP_DIR/privilege/checker";
import CardContainer from "CMP_DIR/card-container";
import {handleUserStatis, handleExportData, handlePieChartData, handleActivelyData, handleActiveTimesData, handleRetentionData, handleAppDownLoadData} from './utils/export-data-util'
const ChinaMap = require('CMP_DIR/china-map'); // 中国地图
var SelectFullWidth = require("../../../components/select-fullwidth");
import ajax from "../../common/ajax";
import routeList from "../../common/route";
const LEGEND = [{ name: Intl.get("common.official", "签约"), key: "formal" },
{ name: Intl.get("common.trial", "试用"), key: "trial" },
{ name: Intl.get("user.type.presented", "赠送"), key: "special" },
{ name: Intl.get("user.type.train", "培训"), key: "training" },
{ name: Intl.get("user.type.employee", "员工"), key: "internal" },
{ name: Intl.get("user.unknown", "未知"), key: "unknown" }];

//用户类型常量
var USER_TYPE_CONSTANTS = {
    "SALES_MANAGER": "salesmanager",
    "SALES_LEADER": "salesleader"
};

//用户状态
var USER_STATUS = [
    { name: "全部", value: "" },
    { name: Intl.get("common.enabled", '启用'), value: "1" },
    { name: Intl.get("common.stop", '停用'), value: "0" },
];
const deviceTypeLegend = [
    { name: "数量", key: "count" }
];
const onlineTimeLegend = [
    { name: "小时数", key: "count" }
];
// ""表示不确定，member表示要获取成员数据，team表示要获取团队数据
var fetchTeamOrMember = "";

//地图的formatter
function mapFormatter(obj) {
    return [
        Intl.get("oplate_bd_analysis_realm_zone.1", "省份") + '：' + obj.name,
        Intl.get("oplate_bd_analysis_realm_industry.6", "个数") + '：' + (isNaN(obj.value) ? 0 : obj.value)
    ].join('<br/>')
}

//登录次数参数
const loginCountsRangeConst = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    {
        "from": 9,
        "to": 14
    },
    {
        "from": 15,
        "to": 25
    },
    {
        "from": 25,
        "to": 50
    },
    {
        "from": 51,
        "to": 100
    },
    {
        "from": 101,
        "to": 200
    },
    {
        "from": 200,
        "to": 10000
    }
];

//在线时长范围
//登录天数参数
const loginDaysRangeConst = [
    [1, 2, 3, 4],
    {
        "from": 5,
        "to": 10
    },
    {
        "from": 11,
        "to": 15
    },
    {
        "from": 16,
        "to": 20
    },
    {
        "from": 21,
        "to": 50
    },
    {
        "from": 51,
        "to": 100
    },
    {
        "from": 100,
        "to": 10000
    }
];
//登录时长参数
const loginTimesRangeConst = [
    {
        "from": 0,
        "to": 1
    },
    {
        "from": 1,
        "to": 5
    },
    {
        "from": 5,
        "to": 10
    },
    {
        "from": 10,
        "to": 10000
    }
];
//对配置的请求参数进行处理
const rangeParamsProcessor = data => {
    let rangeParams = [];
    data.forEach(x => {
        if (Array.isArray(x)) {
            rangeParams.push(...x.map(item => ({
                "from": item,
                "to": item
            })))
        }
        else {
            rangeParams.push(x);
        }
    });
    return rangeParams;
}
const onlineTimeRange = [
    { name: "小时", value: "hourly" },
    { name: "天", value: "daily" },
    { name: "周", value: "weekly" },
    { name: "月", value: "monthly" },
    { name: "季度", value: "quarterly" },
    { name: "年", value: "yearly" }
];

//获取用户类型
function getUserType() {
    var Deferred = $.Deferred();
    if (fetchTeamOrMember) {
        Deferred.resolve(fetchTeamOrMember);
    } else {
        OplateUserAnalysisAjax.getUserType().then(function (user_types) {
            fetchTeamOrMember = user_types.indexOf(USER_TYPE_CONSTANTS.SALES_LEADER) >= 0 || user_types.indexOf(USER_TYPE_CONSTANTS.SALES_MANAGER) >= 0 ? "member" : "team";
            Deferred.resolve(fetchTeamOrMember);
        }, function () {
            fetchTeamOrMember = 'team';
            Deferred.resolve(fetchTeamOrMember);
        });
    }
    return Deferred.promise();
}

//用户分析
var OPLATE_USER_ANALYSIS = React.createClass({
    getStoreData: function () {
        return OplateUserAnalysisStore.getState();
    },
    onStateChange: function () {
        this.setState(this.getStoreData());
    },
    getInitialState: function () {
        return {
            dateRange: 'daily', //日活、周活、月活, 默认日活
            isShowAppDownload: false, // 是否显示下载app统计图, 默认不显示
            selectedUserType: "",
            ...this.getStoreData(),
            selectedOnlineTimeRange: "hourly",
            deviceType: {
                errorMsg: "",
                resultType: "",
                data: []
            },
            activeZone: {
                errorMsg: "",
                resultType: "",
                data: []
            },
            browser: {
                errorMsg: "",
                resultType: "",
                data: []
            },
            userLoginCounts: {
                data: [],
                resultType: "",
                errorMsg: ""
            },
            userLoginTimes: {
                data: [],
                resultType: "",
                errorMsg: ""
            },
            userLoginDays: {
                data: [],
                resultType: "",
                errorMsg: ""
            },
            onlineTime: {
                data: [],
                resultType: "",
                errorMsg: ""
            }
        };
    },
    getAnalysisDataType: function () {
        let type = "common";//USER_ANALYSIS_COMMON
        if (hasPrivilege("USER_ANALYSIS_MANAGER")) {
            type = "manager";
        }
        return type;
    },
    getQueryParams: function (obj) {
        var queryParams = {
            starttime: obj && obj.startTime || this.state.startTime,
            endtime: obj && obj.endTime || this.state.endTime,
            app_id: obj && obj.selectedApp || this.state.selectedApp,
            authType: this.getAnalysisDataType()
        };
        if (!_.isEmpty(this.state.filterParams)) {
            queryParams.tags = this.state.filterParams.join(",");
        }
        if (this.state.user_type) {
            queryParams.type = this.state.user_type;
        }
        if (this.state.status) {
            queryParams.status = this.state.status;
        }
        if (this.state.zone) {
            queryParams.zone = this.state.zone;
        }
        if (this.state.industry) {
            queryParams.industry = this.state.industry;
        }
        if (this.state.team) {
            queryParams.team = this.state.team;
        }
        return queryParams;
    },
    //图表所需参数 (地域、设备、忠诚度)
    getQueryDatas: function (obj) {
        let data = this.getQueryParams(obj);
        const newTypeMap = {
            "total": "all",
            "added": "add",
            "expired": "expired",
            "delay": "delay"
        }        
        data.analysis_type = newTypeMap[this.state.currentTab];
        const params = $.extend(true, {}, data, obj);
        return params;
    },
    // 下载app统计的参数
    getAppsDownloadParams(obj) {
        return {
            start_time: obj && obj.startTime || this.state.startTime,
            end_time: obj && obj.endTime || this.state.endTime,
            app_id: obj && obj.selectedApp || this.state.selectedApp,
            interval: 'day'
        };
    },
    // 获取版本升级记录的参数
    getAppsVersionParams(obj) {
        return {
            appId: obj && obj.selectedApp || this.state.selectedApp,
            page: 1,
            pageSize: 1
        }
    },
    sendChartAjax: function (obj) {
        var currentTab = obj && obj.currentTab || this.state.currentTab;
        var isComposite = obj && 'isComposite' in obj ? obj.isComposite : this.state.isComposite;
        var queryParams = this.getQueryParams(obj);
        this.queryChartsData(queryParams);//获取活跃用户图表数据
        let appsDownloadParams = this.getAppsDownloadParams(obj);
        let appsVersionParams = this.getAppsVersionParams(obj);
        //获取前四个统计数据
        OplateUserAnalysisAction.getSummaryNumbers(queryParams);
        //是否能看到“活跃时间段统计”和“登录时长统计”
        var shouldViewActiveNessChart = !isComposite && !this.state.isSalesRole;
        //是否是获取成员的数据
        var fetchMember = fetchTeamOrMember === "member";
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                OplateUserAnalysisAction.getTotalSummary(queryParams); // 用户统计(综合和单个应用的条件下)
                if (isComposite) {  // 综合条件的地域、行业和团队的统计
                    OplateUserAnalysisAction.getAppsTeam("total", queryParams);
                    OplateUserAnalysisAction.getAppsIndustry("total", queryParams);
                    OplateUserAnalysisAction.getAppsZone("total", queryParams);
                } else { // 单个应用条件下
                    OplateUserAnalysisAction.getTotalZone(queryParams);
                    OplateUserAnalysisAction.getTotalIndustry(queryParams);
                    OplateUserAnalysisAction.getUserActiveNess("total", this.state.activeNess.dateRange, queryParams);
                    OplateUserAnalysisAction.getUserTypeStatistics("total", queryParams);
                    OplateUserAnalysisAction.getAppStatus("total", queryParams);
                    if (fetchMember) {
                        OplateUserAnalysisAction.getTotalMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getTotalTeam(queryParams);
                    }
                    // 应用下载统计
                    if (hasPrivilege("GET_APPLICATION_DOWNLOAD_STATISTIC")) {
                        AppRecordsListAjax.getAppRecordsList(appsVersionParams).then((result) => {
                            if (result && result.total) {
                                this.setState({
                                    isShowAppDownload: true
                                });
                                OplateUserAnalysisAction.getAppsDownloadStatistics(appsDownloadParams);
                            }
                        });
                    }
                }
                if (shouldViewActiveNessChart) {
                    OplateUserAnalysisAction.getUserActiveTime(queryParams);
                    OplateUserAnalysisAction.getUserLoginLong("total", this.state.loginLong.dateRange, queryParams);
                }
                break;
            case 'added':
                OplateUserAnalysisAction.getAddedSummary(queryParams); // 用户统计(综合和单个应用的条件下)
                if (isComposite) {  // 综合条件的地域、行业和团队的统计
                    OplateUserAnalysisAction.getAppsTeam("added", queryParams);
                    OplateUserAnalysisAction.getAppsIndustry("added", queryParams);
                    OplateUserAnalysisAction.getAppsZone("added", queryParams);
                } else {
                    OplateUserAnalysisAction.getAddedZone(queryParams);
                    OplateUserAnalysisAction.getAddedIndustry(queryParams);
                    OplateUserAnalysisAction.getUserActiveNess("added", this.state.activeNess.dateRange, queryParams);
                    OplateUserAnalysisAction.getUserTypeStatistics("added", queryParams);
                    OplateUserAnalysisAction.getAppStatus("added", queryParams);
                    if (fetchMember) {
                        OplateUserAnalysisAction.getAddedMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getAddedTeam(queryParams);
                    }
                }
                var showRetention = this.judgeShowRetention();
                if (showRetention) {
                    OplateUserAnalysisAction.getRetention(queryParams);
                }
                break;
            case 'expired':
                OplateUserAnalysisAction.getExpiredSummary(queryParams); // 用户统计(综合和单个应用的条件下)
                if (isComposite) {  // 综合条件的地域、行业和团队的统计
                    OplateUserAnalysisAction.getAppsTeam("expired", queryParams);
                    OplateUserAnalysisAction.getAppsIndustry("expired", queryParams);
                    OplateUserAnalysisAction.getAppsZone("expired", queryParams);
                } else {
                    OplateUserAnalysisAction.getExpiredZone(queryParams);
                    OplateUserAnalysisAction.getExpiredIndustry(queryParams);
                    OplateUserAnalysisAction.getUserActiveNess("expired", this.state.activeNess.dateRange, queryParams);
                    OplateUserAnalysisAction.getUserTypeStatistics("expired", queryParams);
                    OplateUserAnalysisAction.getAppStatus("expired", queryParams);
                    if (fetchMember) {
                        OplateUserAnalysisAction.getExpiredMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getExpiredTeam(queryParams);
                    }
                }
                if (shouldViewActiveNessChart) {
                    OplateUserAnalysisAction.getUserLoginLong("expired", this.state.loginLong.dateRange, queryParams);
                }
                break;
            case 'added_expired':
                OplateUserAnalysisAction.getAddedExpiredSummary(queryParams); // 用户统计 (综合和单个应用的条件下)
                if (isComposite) {  // 综合条件的地域、行业和团队的统计
                    OplateUserAnalysisAction.getAppsTeam("added_expired", queryParams);
                    OplateUserAnalysisAction.getAppsIndustry("added_expired", queryParams);
                    OplateUserAnalysisAction.getAppsZone("added_expired", queryParams);
                } else {
                    OplateUserAnalysisAction.getAddedExpiredZone(queryParams);
                    OplateUserAnalysisAction.getAddedExpiredIndustry(queryParams);
                    OplateUserAnalysisAction.getUserTypeStatistics("added_expired", queryParams);
                    OplateUserAnalysisAction.getAppStatus("added_expired", queryParams);
                    if (fetchMember) {
                        OplateUserAnalysisAction.getAddedExpiredMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getAddedExpiredTeam(queryParams);
                    }
                }
                break;
        }
    },
    sendExtraChartAjax: function (obj) {
        var currentTab = obj && obj.currentTab || this.state.currentTab;
        var isComposite = obj && 'isComposite' in obj ? obj.isComposite : this.state.isComposite;
        var queryParams = this.getQueryParams(obj);
        var queryData = this.getQueryDatas(obj);//获取活跃用户图表请求参数
        this.queryChartsData(queryData);//获取活跃用户图表数据
    },
    //判断是否显示用户留存
    judgeShowRetention: function () {
        var startTime = this.state.startTime;
        var endTime = this.state.endTime;
        return (endTime - startTime) <= (8 * 24 * 60 * 60 * 1000 - 1) && !this.state.isComposite && !this.state.isSalesRole;
    },
    getChartData: function (obj) {
        getUserType().then(() => {
            this.sendChartAjax(obj);
        });
    },
    //获取活跃用户图表数据
    getExtraChartData: function (obj) {
        getUserType().then(() => {
            this.sendExtraChartAjax(obj);
        });
    },
    //缩放延时，避免页面卡顿
    resizeTimeout: null,
    //窗口缩放时候的处理函数
    windowResize: function () {
        clearTimeout(this.resizeTimeout);
        var _this = this;
        this.resizeTimeout = setTimeout(function () {
            //窗口缩放的时候，调用setState，重新走render逻辑渲染
            _this.setState(OplateUserAnalysisStore.getState());
        }, 300);
    },
    componentDidMount: function () {
        OplateUserAnalysisStore.listen(this.onStateChange);
        $('body').css('overflow', 'hidden');
        //绑定window的resize，进行缩放处理
        $(window).on('resize', this.windowResize);
        this.queryChartsData(this.getQueryDatas());
    },
    componentWillUnmount: function () {
        OplateUserAnalysisStore.unlisten(this.onStateChange);
        $('body').css('overflow', 'visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        $(window).off('resize', this.windowResize);
    },
    onSelectDate: function (startTime, endTime) {
        //如果大于当前时间，则取前一天的23:59:59
        if (endTime > new Date().getTime()) {
            endTime = moment().endOf("day").toDate().getTime();
        }
        OplateUserAnalysisAction.changeSearchTime({ startTime, endTime });
        this.getChartData({
            startTime: startTime,
            endTime: endTime
        });
    },
    /**
     * @param appId 应用id
     * @param isChoosenAll  是否选中的是“全部应用”
     * @param hasAll 是否含有“全部应用”选项
     */
    onSelectApp: function (appId, isChoosenAll, hasAll) {
        if (!appId) {
            OplateUserAnalysisAction.showNoData();
            return;
        }
        this.setState({
            isShowAppDownload: false
        });
        var isComposite = isChoosenAll;
        OplateUserAnalysisAction.changeSelectedApp({ selectedApp: appId, isComposite: isComposite });
        //如果当前是活跃度，选中的是全部应用，则切换回总用户，全部应用的时候不能查活跃度
        this.getChartData({
            selectedApp: appId,
            isComposite: isComposite
        });
        Trace.traceEvent("用户分析", "选择应用");
    },
    getEndDateText: function () {
        if (!this.state.endTime) {
            return moment().format(DATE_FORMAT);
        }
        return moment(new Date(+this.state.endTime)).format(DATE_FORMAT);
    },
    // 统计数据获取失败的提示信息
    renderGetDataErrorMessage(errMessage, retryHandler) {
        return (
            <div className='error-tips-message'>
                {errMessage}
                <a onClick={retryHandler} >{Intl.get("common.retry", "重试")}</a>
            </div>
        );
    },
    // 用户统计获取失败时，重新获取
    retryUserAnalysis() {
        let queryParams = this.getQueryParams();
        let currentTab = this.state.currentTab;
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                OplateUserAnalysisAction.getTotalSummary(queryParams);
                break;
            case 'added':
                OplateUserAnalysisAction.getAddedSummary(queryParams);
                break;
            case 'expired':
                OplateUserAnalysisAction.getExpiredSummary(queryParams);
                break;
            case 'added_expired':
                OplateUserAnalysisAction.getAddedExpiredSummary(queryParams);
                break;
        }
    },
    //总用户统计
    getUserChart: function () {
        if (this.state.isComposite) {
            var list = _.isArray(this.state.userAnalysis.data) ?
                this.state.userAnalysis.data : [];
            if (this.state.userAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.userAnalysis.errorMsg, this.retryUserAnalysis);
            }
            return (
                <CompositeLine
                    width={this.f}
                    list={list}
                    title={Intl.get("user.analysis.total", "用户统计")}
                    height={234}
                    resultType={this.state.userAnalysis.resultType}
                />
            );
        } else {
            if (this.state.userAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.userAnalysis.errorMsg, this.retryUserAnalysis);
            }
            return (
                <SingleLineChart
                    width={this.f}
                    list={this.state.userAnalysis.data}
                    title={Intl.get("user.analysis.total", "用户统计")}
                    legend={LEGEND}
                    resultType={this.state.userAnalysis.resultType}
                />
            );
        }
    },

    // 点击应用地域统计图表，获取对应的地域类型及其分析数据
    getClickZone(zone) {
        OplateUserAnalysisAction.setLinkageZone(zone);
        this.getChartData({
            zone: zone
        });
    },

    // 删除地域类型的条件
    deleteZone() {
        OplateUserAnalysisAction.setLinkageZone('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },

    retryZoneAnalysis() {
        let queryParams = this.getQueryParams();
        let currentTab = this.state.currentTab;
        let isComposite = this.state.isComposite;
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                if (isComposite) {  // 综合条件的地域、行业和团队的统计
                    OplateUserAnalysisAction.getAppsZone("total", queryParams);
                } else { // 单个应用条件下
                    OplateUserAnalysisAction.getTotalZone(queryParams);
                }
                break;
            case 'added':
                if (isComposite) {  // 综合条件的地域的统计
                    OplateUserAnalysisAction.getAppsZone("added", queryParams);
                } else {
                    OplateUserAnalysisAction.getAddedZone(queryParams);
                }
                break;
            case 'expired':
                if (isComposite) {  // 综合条件的地域的统计
                    OplateUserAnalysisAction.getAppsZone("expired", queryParams);
                } else {
                    OplateUserAnalysisAction.getExpiredZone(queryParams);
                }
                break;
            case 'added_expired':
                if (isComposite) {  // 综合条件的地域的统计
                    OplateUserAnalysisAction.getAppsZone("added_expired", queryParams);
                } else {
                    OplateUserAnalysisAction.getAddedExpiredZone(queryParams);
                }
                break;
        }
    },
    //查询图表数据
    queryChartsData: function (data) {
        //只在选择了单个应用时查询数据
        if (data && data.app_id && data.app_id.indexOf(",") < 0) {            
            this.getDeviceTypeData(data);
            this.getBrowserData(data);
            this.getActiveZoneData(data);
            this.getUserLoginCountsData(data);
            this.getUserLoginDaysData(data);
            this.getUserLoginTimesData(data);
            this.getUserOnlineTimeData(data);
        }
    },
    onSelectOnlineTimeRange: function (value) {
        this.setState({
            selectedOnlineTimeRange: value
        }, () => {
            this.getUserOnlineTimeData();
        });        
        
    },
    //响应数据处理函数
    resultHandler: function (dataName, onSuccess) {
        return [
            result => {
                if (result) {
                    if (result.httpCode) {
                        this.setState({
                            [dataName]: {
                                data: [],
                                resultType: "",
                                errorMsg: result.message
                            }
                        });
                        return
                    }
                    else {
                        let data = result;
                        if (_.isFunction(onSuccess)) {
                            data = onSuccess(result);
                        }
                        this.setState({
                            [dataName]: {
                                data,
                                resultType: "",
                                errorMsg: ""
                            }
                        })
                    }
                }                
            }, err => {
                this.setState({
                    [dataName]: {
                        data: [],
                        resultType: "",
                        errorMsg: err.message
                    }
                });
            }
        ]
    },
    // 设备类型统计
    getDeviceTypeData: function (obj) {
        //不传参数则重新获取
        const queryData = this.getQueryDatas(obj);
        if (!queryData || !queryData.authType) {
            return
        }
        const handler = "getDeviceTypeBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            deviceType: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            data: queryData,
        }).then(...this.resultHandler("deviceType"))
    },
    //浏览器分布统计
    getBrowserData: function (obj) {
        //不传参数则重新获取
        const queryData = this.getQueryDatas(obj);
        if (!queryData || !queryData.authType) {
            return
        }
        const handler = "getBrowserBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            browser: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            data: queryData,
        }).then(...this.resultHandler("browser"))
    },
    //获取活跃用户地域统计
    getActiveZoneData: function (obj) {
        //不传参数则重新获取
        const queryData = this.getQueryDatas(obj);
        if (!queryData || !queryData.authType) {
            return
        }
        const handler = "getActiveZoneBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            activeZone: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            data: queryData,
        }).then(...this.resultHandler("activeZone", result => {
            if (result.length > 0) {
                return result.map(x => ({
                    value: x.count,
                    name: x.name
                }));
            }
        }))
    },
    //获取用户登录次数
    getUserLoginCountsData: function (obj) {
        //不传参数则重新获取
        const queryData = this.getQueryDatas(obj);

        if (!queryData || !queryData.authType) {
            return
        }
        const handler = "getUserLoginCountsDataBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            userLoginCounts: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            query: queryData,
            data: rangeParamsProcessor(loginCountsRangeConst)
        }).then(...this.resultHandler("userLoginCounts", result => {
            let loginCountsData = [];
            if (result && result.length > 0 && result.filter(x => x.count > 0).length > 0) {
                loginCountsData = result.filter(x => x.count > 0).map(x => {
                    let key = "";
                    if (x.from != x.to) {
                        if (x.to == 10000) {
                            key = x.from + Intl.get("common.label.times", "次") + "+"
                        }
                        else {
                            key = x.from + Intl.get("common.label.times", "次") + "-" + x.to + Intl.get("common.label.times", "次") + "";
                        }
                    }
                    else {
                        key = x.from + Intl.get("common.label.times", "次") + "";
                    }
                    return [
                        key, x.count + 1
                    ]
                });
            } else {
                loginCountsData = [
                    [Intl.get("common.no.data", "暂无数据"), 5]
                ]
            }
            return loginCountsData;
        }))
    },
    //获取用户登录天数
    getUserLoginDaysData: function (obj) {
        //不传参数则重新获取
        const queryData = this.getQueryDatas(obj);

        if (!queryData || !queryData.authType) {
            return
        }
        const handler = "getUserLoginDaysDataBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            userLoginDays: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            query: queryData,
            data: rangeParamsProcessor(loginDaysRangeConst)
        }).then(...this.resultHandler("userLoginDays", result => {
            let loginDaysData = [];
            if (result && result.length > 0 && result.filter(x => x.count > 0).length > 0) {
                loginDaysData = result.filter(x => x.count > 0).map(x => {
                    let key = "";
                    if (x.from != x.to) {
                        if (x.to == 10000) {
                            key = x.from + Intl.get("common.label.times", "次") + "+"
                        }
                        else {
                            key = x.from + Intl.get("common.label.times", "次") + "-" + x.to + Intl.get("common.label.times", "次") + "";
                        }
                    }
                    else {
                        key = x.from + Intl.get("common.label.times", "次") + "";
                    }
                    return [
                        key, x.count + 1
                    ]
                });
            } else {
                loginDaysData = [
                    [Intl.get("common.no.data", "暂无数据"), 5]
                ]
            }
            return loginDaysData;
        }))
    },
    //获取用户登录时间
    getUserLoginTimesData: function (obj) {
        //不传参数则重新获取
        const queryData = this.getQueryDatas(obj);

        if (!queryData || !queryData.authType) {
            return
        }
        const handler = "getUserLoginTimesDataBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            userLoginTimes: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            query: queryData,
            data: loginTimesRangeConst.map(x => ({
                from: x.from * 60,
                to: x.to * 60
            }))
        }).then(...this.resultHandler("userLoginTimes", result => {
            let loginDaysData = [];
            if (result && result.length > 0 && result.filter(x => x.count > 0).length > 0) {
                loginDaysData = result.filter(x => x.count > 0)
                    .map(x => {
                        let key = "";
                        if (x.from != x.to) {
                            if (x.to == 10000 * 60) {
                                key = x.from / 60 + Intl.get("common.label.hours", "小时") + "+"
                            }
                            else {
                                key = x.from / 60 + Intl.get("common.label.hours", "小时") + "-" + x.to / 60 + Intl.get("common.label.hours", "小时") + "";
                            }
                        }
                        else {
                            key = x.from / 60 + Intl.get("common.label.hours", "小时") + "";
                        }
                        return [
                            key, x.count / 60 + 1
                        ]
                    });
            }
            else {
                loginDaysData = [
                    [Intl.get("common.no.data", "暂无数据"), 5]
                ]
            }
            return loginDaysData;
        }))
    },

    getUserOnlineTimeData: function (obj) {
        //不传参数则重新获取
        const queryData = $.extend({}, this.getQueryDatas(obj), {
            interval: this.state.selectedOnlineTimeRange
        });
        if (!queryData || !queryData.authType) {
            return
        }
        const dateFormatMap = {
            "hourly": "YYYY-MM-DD HH:mm",
            "daily": "YYYY-MM-DD",
            "weekly": "YYYY-MM-DD",
            "monthly": "YYYY-MM",
            "quarterly": "YYYY-MM",
            "yearly": "YYYY"
        }
        const handler = "getUserOnlineTimeDataBy" + queryData.authType;
        const route = _.find(routeList, route => route.handler === handler);
        this.setState({
            onlineTime: {
                data: [],
                resultType: "loading",
                errorMsg: ""
            }
        })
        ajax({
            url: route.path,
            type: route.method,
            data: queryData,
        }).then(...this.resultHandler("onlineTime", result => {
            return result.map(x => ({ name: moment(x.timestamp).format(dateFormatMap[this.state.selectedOnlineTimeRange]), count: parseInt(x.count / 1000 / 60) }))
        }))
    },
    //地域统计
    getZoneChart: function () {
        if (this.state.isComposite) { // 综合应用
            let endDate = this.getEndDateText();
            if (this.state.zoneAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.zoneAnalysis.errorMsg, this.retryZoneAnalysis);
            }
            return (
                <BarChart
                    width={this.f}
                    list={this.state.zoneAnalysis.data}
                    title={Intl.get("user.analysis.address", "地域统计")}
                    legend={LEGEND}
                    endDate={endDate}
                    resultType={this.state.zoneAnalysis.resultType}
                />
            );
        } else {   // 单个应用
            if (this.state.zoneAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.zoneAnalysis.errorMsg, this.retryZoneAnalysis);
            }
            return (
                <SingleAppBarChart
                    width={this.f}
                    list={this.state.zoneAnalysis.data}
                    title={Intl.get("user.analysis.address", "地域统计")}
                    legend={this.state.zoneAnalysis.data}
                    resultType={this.state.zoneAnalysis.resultType}
                    getClickType={this.getClickZone}
                />
            );
        }

    },
    getTeamChartTitle: function () {
        var title = "";
        switch (fetchTeamOrMember) {
            case 'team':
                title = Intl.get("user.analysis.team", "团队统计");
                break;
            case 'member':
                title = Intl.get("oplate.user.analysis.4", "成员统计");
                break;
        }
        return title;
    },
    // 点击应用团队统计图表，获取对应的团队类型及其分析数据
    getClickTeam(team) {
        OplateUserAnalysisAction.setLinkageTeam(team);
        this.getChartData({
            team: team
        });
    },

    // 删除团队类型的条件
    deleteTeam() {
        OplateUserAnalysisAction.setLinkageTeam('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },
    // 团队/成员统计获取失败时，重新获取
    retryTeamOrMemberAnalysis() {
        let queryParams = this.getQueryParams();
        let currentTab = this.state.currentTab;
        let isComposite = this.state.isComposite;
        //是否是获取成员的数据
        let fetchMember = fetchTeamOrMember === "member";
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                if (isComposite) {  // 综合条件的团队的统计
                    OplateUserAnalysisAction.getAppsTeam("total", queryParams);
                } else { // 单个应用条件下;
                    if (fetchMember) {
                        OplateUserAnalysisAction.getTotalMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getTotalTeam(queryParams);
                    }
                }
                break;
            case 'added':
                if (isComposite) {
                    OplateUserAnalysisAction.getAppsTeam("added", queryParams);
                } else {
                    if (fetchMember) {
                        OplateUserAnalysisAction.getAddedMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getAddedTeam(queryParams);
                    }
                }
                break;
            case 'expired':
                if (isComposite) {
                    OplateUserAnalysisAction.getAppsTeam("expired", queryParams);
                } else {
                    if (fetchMember) {
                        OplateUserAnalysisAction.getExpiredMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getExpiredTeam(queryParams);
                    }
                }
                break;
            case 'added_expired':
                if (isComposite) {
                    OplateUserAnalysisAction.getAppsTeam("added_expired", queryParams);
                } else {
                    if (fetchMember) {
                        OplateUserAnalysisAction.getAddedExpiredMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getAddedExpiredTeam(queryParams);
                    }
                }
                break;
        }
    },
    //团队/成员统计
    getTeamChart: function () {
        var endDate = this.getEndDateText();
        var title = this.getTeamChartTitle();
        if (this.state.isComposite) {  // 综合应用
            if (this.state.teamOrMemberAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.teamOrMemberAnalysis.errorMsg, this.retryTeamOrMemberAnalysis);
            }
            return (
                <BarChart
                    width={this.f}
                    list={this.state.teamOrMemberAnalysis.data}
                    title={title}
                    legend={LEGEND}
                    endDate={endDate}
                    resultType={this.state.teamOrMemberAnalysis.resultType}
                />
            );
        } else {  // 单个应用
            if (this.state.teamOrMemberAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.teamOrMemberAnalysis.errorMsg, this.retryTeamOrMemberAnalysis);
            }
            return (
                <SingleAppBarChart
                    width={this.f}
                    list={this.state.teamOrMemberAnalysis.data}
                    title={title}
                    legend={this.state.teamOrMemberAnalysis.data}
                    resultType={this.state.teamOrMemberAnalysis.resultType}
                    getClickType={this.getClickTeam}
                />
            );
        }

    },

    // 点击应用行业统计图表，获取对应的行业类型及其分析数据
    getClickIndustry(industry) {
        Trace.traceEvent("用户分析", "点击应用行业统计图表");
        OplateUserAnalysisAction.setLinkageIndustry(industry);
        this.getChartData({
            industry: industry
        });
    },

    // 删除行业类型的条件
    deleteIndustry() {
        OplateUserAnalysisAction.setLinkageIndustry('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },

    // 行业统计获取失败时，重新获取
    retryIndustryAnalysis() {
        let queryParams = this.getQueryParams();
        let currentTab = this.state.currentTab;
        let isComposite = this.state.isComposite;
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                if (isComposite) {  // 综合条件行业统计
                    OplateUserAnalysisAction.getAppsIndustry("total", queryParams);
                } else { // 单个应用条件下
                    OplateUserAnalysisAction.getTotalIndustry(queryParams);
                }
                break;
            case 'added':
                if (isComposite) {  // 综合条件行业的统计
                    OplateUserAnalysisAction.getAppsIndustry("added", queryParams);
                } else {
                    OplateUserAnalysisAction.getAddedIndustry(queryParams);
                }
                break;
            case 'expired':
                if (isComposite) {  // 综合条件的行业的统计
                    OplateUserAnalysisAction.getAppsIndustry("expired", queryParams);
                } else {
                    OplateUserAnalysisAction.getExpiredIndustry(queryParams);
                }
                break;
            case 'added_expired':
                if (isComposite) {  // 综合条件的行业的统计
                    OplateUserAnalysisAction.getAppsIndustry("added_expired", queryParams);
                } else {
                    OplateUserAnalysisAction.getAddedExpiredIndustry(queryParams);
                }
                break;
        }
    },

    getIndustryChart: function () {
        var endDate = this.getEndDateText();
        let categorys = _.pluck(this.state.industryAnalysis.data, 'name');
        //interval:横坐标的label展示的间隔，labelAlign：横坐标label展示居中还是居左还是居右的设置，rotate:横坐标label倾斜的角度
        let interval = 'auto', labelAlign = 'center', rotate = 0;
        if (_.isArray(categorys)) {
            if (categorys.length <= 12) {
                //行业的种类小于12种时，横坐标展示所有的行业
                interval = 0;
            } else if (categorys.length > 12 && categorys.length <= 25) {
                //行业的种类大于12个小于25个时，横坐标展示所有的行业，避免重叠，需倾斜-30度展示
                interval = 0;
                rotate = -30;
                labelAlign = "left";
            }
        }
        if (this.state.isComposite) { // 综合应用
            if (this.state.industryAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.industryAnalysis.errorMsg, this.retryIndustryAnalysis);
            }
            return (
                <BarChart
                    list={this.state.industryAnalysis.data}
                    title={Intl.get("user.analysis.industry", "行业统计")}
                    width={this.f}
                    height={234}
                    endDate={endDate}
                    xAxisInterval={interval}
                    xAxisLabelAlign={labelAlign}
                    xAxisRotate={rotate}
                    legend={LEGEND}
                    resultType={this.state.industryAnalysis.resultType}
                />
            );
        } else {  // 单个应用
            if (this.state.industryAnalysis.errorMsg) {
                return this.renderGetDataErrorMessage(this.state.industryAnalysis.errorMsg, this.retryIndustryAnalysis);
            }
            return (
                <SingleAppBarChart
                    width={this.chartWidth}
                    list={this.state.industryAnalysis.data}
                    title={Intl.get("user.analysis.industry", "行业统计")}
                    height={234}
                    legend={this.state.industryAnalysis.data}
                    resultType={this.state.industryAnalysis.resultType}
                    getClickType={this.getClickIndustry}
                />
            );

        }

    },
    //活跃度周期修改
    activeNessDataRangeChange: function (dateRange) {
        let queryParams = this.getQueryParams();
        this.setState({
            dateRange: dateRange
        });
        OplateUserAnalysisAction.getUserActiveNess(this.state.activeNess.dataType, dateRange, queryParams);
    },
    // 活跃度获取失败后，重新获取数据
    retryActiveness() {
        let currentTab = this.state.currentTab;
        let queryParams = this.getQueryParams();
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                OplateUserAnalysisAction.getUserActiveNess("total", this.state.dateRange, queryParams);
                break;
            case 'added':
                OplateUserAnalysisAction.getUserActiveNess("added", this.state.dateRange, queryParams);
                break;
            case 'expired':
                OplateUserAnalysisAction.getUserActiveNess("expired", this.state.dateRange, queryParams);
                break;
        }
    },
    getActivenessChart: function (height) {
        if (this.state.activeNess.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.activeNess.errorMsg, this.retryActiveness);
        }
        return (
            <AreaLine
                list={this.state.activeNess.data}
                title={Intl.get("operation.report.activity", "活跃度")}
                width={this.chartWidth}
                height={height}
                dateRange={this.state.activeNess.dateRange}
                resultType={this.state.activeNess.resultType}
                dataType={this.state.activeNess.dataType}
                startTime={this.state.startTime}
                endTime={this.state.endTime}
            />
        );
    },
    // 活跃时间段获取失败，重新获取
    retryActivenessTime() {
        let queryParams = this.getQueryParams();
        OplateUserAnalysisAction.getUserActiveTime(queryParams);
    },
    //活跃时间段
    getActivenessTime: function () {
        if (this.state.activeTime.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.activeTime.errorMsg, this.retryActivenessTime);
        }
        return (
            <ScatterChart
                width={this.chartWidth}
                list={this.state.activeTime.data}
                title={Intl.get("oplate.user.analysis.5", "活跃时间段统计")}
                resultType={this.state.activeTime.resultType}
                dataName={Intl.get("oplate.user.analysis.29", "操作数")}
            />
        );
    },
    changeCurrentTab: function (tabName, event) {
        OplateUserAnalysisAction.changeCurrentTab(tabName);
        this.setState({
            dateRange: 'daily'
        }, () => {
            this.getChartData({
                currentTab: tabName
            });
        });
    },
    toggleFilterBlock: function () {
        OplateUserAnalysisAction.toggleFilterArea();
    },
    toggleFilterParam: function (field, event) {
        OplateUserAnalysisAction.toggleFilterParam({
            field: field,
            checked: event.target.checked
        });
        setTimeout(() => {
            this.getChartData();
        });
    },
    renderFilterArea: function () {
        if (!this.state.filterExpanded) {
            return null;
        }
        return (
            <div className="user_analysis_filter">
                <ul className="list-inline list-unstyled">
                    <li>
                        <label>
                            <Checkbox defaultChecked={false} onChange={this.toggleFilterParam.bind(this, "customer")} />
                            <ReactIntl.FormattedMessage id="sales.home.customer"
                                defaultMessage="客户" />
                        </label>
                    </li>
                    <li>
                        <label>
                            <Checkbox defaultChecked={false} onChange={this.toggleFilterParam.bind(this, "internal")} />
                            <ReactIntl.FormattedMessage id="user.type.employee" defaultMessage="员工" />
                        </label>
                    </li>
                    <li>
                        <label>
                            <Checkbox defaultChecked={false} onChange={this.toggleFilterParam.bind(this, "special")} />
                            <ReactIntl.FormattedMessage id="user.type.presented" defaultMessage="赠送" />
                        </label>
                    </li>
                </ul>
            </div>
        );
    },
    // 在线时长统计获取失败时，重新获取
    retryLoginLong() {
        let currentTab = this.state.currentTab;
        let isComposite = this.state.isComposite;
        let queryParams = this.getQueryParams();
        //是否能看到“活跃时间段统计”和“登录时长统计”
        var shouldViewActiveNessChart = !isComposite && !this.state.isSalesRole;
        //是否是获取成员的数据
        var fetchMember = fetchTeamOrMember === "member";
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                if (shouldViewActiveNessChart) {
                    OplateUserAnalysisAction.getUserLoginLong("total", this.state.loginLong.dateRange, queryParams);
                }
                break;
            case 'expired':
                if (shouldViewActiveNessChart) {
                    OplateUserAnalysisAction.getUserLoginLong("expired", this.state.loginLong.dateRange, queryParams);
                }
                break;
        }
    },

    getPieChart: function () {
        if (this.state.loginLong.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.loginLong.errorMsg, this.retryLoginLong);
        }
        return (<PieChart
            data={this.state.loginLong.data}
            title={Intl.get("oplate.user.analysis.6", "在线时长统计")}
            legend={[Intl.get("oplate.user.analysis.7", "时长小于1小时"), Intl.get("oplate.user.analysis.8", "时长大于等于1小时")]}
            height={234}
            resultType={this.state.loginLong.resultType}
        />);
    },
    // 用户留存获取失败，重新获取
    retryRetention() {
        let queryParams = this.getQueryParams();
        OplateUserAnalysisAction.getRetention(queryParams);
    },

    //渲染用户留存
    getRetentionChart: function () {
        if (this.state.retention.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.retention.errorMsg, this.retryRetention);
        }
        return (<Retention
            data={this.state.retention.data}
            title={Intl.get("oplate.user.analysis.9", "用户留存")}
            height={234}
            resultType={this.state.retention.resultType}
        />);
    },
    // 应用下载app获取失败，重新获取数据
    retryAppDownload() {
        let queryParams = this.getAppsDownloadParams();
        OplateUserAnalysisAction.getAppsDownloadStatistics(queryParams)
    },
    // 折线图需要的数据格式
    getAppDownloadData(downloadData) {
        let series = [];
        let timeArray = _.uniq(_.pluck(downloadData, 'time')); // 时间点
        let timeLength = timeArray.length;
        let groupObj = _.groupBy(downloadData, 'version');
        for (let version in groupObj) { // 遍历某个版本
            let data = [];
            let groupArray = groupObj[version];
            let groupLength = groupArray.length;
            let groupTime = _.pluck(groupArray, 'time');
            if (timeLength == groupLength) { // 当每个时间点都有下载时，直接提取data的值
                data = _.pluck(groupArray, 'count');
            } else { // 当下载的时间的小于时间时，补充0
                let differTime = _.difference(timeArray, groupTime);
                for (let i = 0; i < differTime.length; i++) {
                    groupArray.push({ count: 0, time: differTime[i] });
                }
                let sortGroup = _.sortBy(groupArray, 'time');
                data = _.pluck(sortGroup, 'count');
            }
            let line = {
                name: version,
                type: 'line',
                data: data
            };
            series.push(line);
        }
        return series;
    },
    // 渲染应用各个版本下载版本统计
    getAppsDownloadStatistics() {
        if (this.state.appDownload.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.appDownload.errorMsg, this.retryAppDownload);
        }
        return (<StackLineChart
            list={this.getAppDownloadData(this.state.appDownload.data)}
            legend={this.state.appDownload.data}
            resultType={this.state.appDownload.resultType}
        />);
    },
    //设备类型统计
    getDeviceTypeChart() {
        var endDate = this.getEndDateText();
        //interval:横坐标的label展示的间隔，labelAlign：横坐标label展示居中还是居左还是居右的设置，rotate:横坐标label倾斜的角度
        let interval = 'auto', labelAlign = 'center', rotate = 0;
        if (this.state.deviceType.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.deviceType.errorMsg, this.getDeviceTypeData);
        }
        return (
            <BarChart
                list={this.state.deviceType.data}
                title="设备类型"
                width={this.chartWidth}
                height={234}
                legend={deviceTypeLegend}
                endDate={endDate}
                xAxisInterval={interval}
                xAxisLabelAlign={labelAlign}
                xAxisRotate={rotate}
                resultType={this.state.deviceType.resultType}
            />
        )
    },
    //浏览器分布统计
    getBrowserChart() {
        var endDate = this.getEndDateText();
        //interval:横坐标的label展示的间隔，labelAlign：横坐标label展示居中还是居左还是居右的设置，rotate:横坐标label倾斜的角度
        let interval = 'auto', labelAlign = 'center', rotate = 0;
        if (this.state.browser.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.browser.errorMsg, this.getBrowserData);
        }
        return (
            <BarChart
                list={this.state.browser.data}
                title="设备类型"
                width={this.chartWidth}
                height={234}
                legend={deviceTypeLegend}
                endDate={endDate}
                xAxisInterval={interval}
                xAxisLabelAlign={labelAlign}
                xAxisRotate={rotate}
                resultType={this.state.browser.resultType}
            />
        )
    },
    //活跃用户设备统计
    getActiveZoneChart() {
        if (this.state.activeZone.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.activeZone.errorMsg, this.getActiveZoneData);
        }
        return (
            <ChinaMap
                width={this.f}
                height="546"
                dataList={this.state.activeZone.data}
                formatter={mapFormatter}
            />
        )
    },
    //登录次数
    getUserLoginCounts() {
        if (this.state.userLoginCounts.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.userLoginCounts.errorMsg, this.getUserLoginCountsData);
        }
        return (
            <CloudChart resultType={this.state.userLoginCounts.resultType} data={this.state.userLoginCounts.data} />
        )
    },
    //登录天数
    getUserLoginDays() {
        if (this.state.userLoginDays.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.userLoginDays.errorMsg, this.getUserLoginDaysData);
        }
        return (
            <CloudChart resultType={this.state.userLoginDays.resultType} data={this.state.userLoginDays.data} />
        )
    },
    //登录时间
    getUserLoginTimes() {
        if (this.state.userLoginTimes.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.userLoginTimes.errorMsg, this.getUserLoginTimesData);
        }
        return (
            <CloudChart resultType={this.state.userLoginTimes.resultType} data={this.state.userLoginTimes.data} />
        )
    },
    //用户在线时长
    getOnlineTimeChart() {
        var endDate = this.getEndDateText();
        //interval:横坐标的label展示的间隔，labelAlign：横坐标label展示居中还是居左还是居右的设置，rotate:横坐标label倾斜的角度
        let interval = 'auto', labelAlign = 'center', rotate = 0;
        if (this.state.onlineTime.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.onlineTime.errorMsg, this.getUserOnlineTimeData);
        }
        return (
            <BarChart
                list={this.state.onlineTime.data}
                title="用户在线时长"
                width={this.chartWidth}
                height={234}
                legend={onlineTimeLegend}
                endDate={endDate}
                xAxisInterval={interval}
                xAxisLabelAlign={labelAlign}
                xAxisRotate={rotate}
                resultType={this.state.onlineTime.resultType}
            />
        )
    },
    //渲染剩余图表
    renderExtraCharts: function () {
        //是否能看到“活跃时间段统计”和“登录时长统计”
        var isComposite = this.state.isComposite;
        var shouldViewActiveNessChart = !isComposite && !this.state.isSalesRole;
        const radioValue = [{value: 'daily', name:Intl.get("operation.report.day.active", "日活")},
            {value: 'weekly', name: Intl.get("operation.report.week.active", "周活")},
            {value: 'monthly', name: Intl.get("operation.report.month.active", "月活")}];
        let appDownLoadData = this.getAppDownloadData(this.state.appDownload.data);
        let appTitleName =  _.uniq(_.pluck(this.state.appDownload.data, 'time')); // 时间点
        let chartList = [];
        switch (this.state.currentTab) {
            case 'total':
                if (!isComposite) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                            data-title={Intl.get("operation.report.activity", "活跃度")}>
                            <div className="chart-holder activeness-chart-height">
                                <CardContainer
                                    title={Intl.get("operation.report.activity", "活跃度")}
                                    radioValue={radioValue}
                                    dateRange={this.state.activeNess.dateRange}
                                    onDateRangeChange={this.activeNessDataRangeChange}
                                    exportData={handleActivelyData(this.state.activeNess.data)}
                                    csvFileName="actively_statis.csv"
                                >
                                    {this.getActivenessChart(270)}
                                </CardContainer>
                            </div>
                        </div>
                    );
                }
                if (shouldViewActiveNessChart) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                            data-title={Intl.get("oplate.user.analysis.10", "活跃时间段")}>
                            <div className="chart-holder active-time-scatter-height">
                                <CardContainer 
                                    title={Intl.get("oplate.user.analysis.10", "活跃时间段")}
                                    exportData={handleActiveTimesData(this.state.activeTime.data)}
                                    csvFileName="active_times_statis.csv"
                                >
                                    {this.getActivenessTime()}
                                </CardContainer>
                            </div>
                        </div>,
                        <div className="analysis_chart col-md-6 col-sm-12"
                            data-title={Intl.get("oplate.user.analysis.6", "在线时长统计")}>
                            <div className="chart-holder">
                                <CardContainer
                                    title={Intl.get("oplate.user.analysis.6", "在线时长统计")}
                                    exportData={handlePieChartData(this.state.loginLong.data)}
                                    csvFileName="login_long_statis.csv"
                                >
                                    {this.getPieChart()}
                                </CardContainer>
                            </div>
                        </div>
                    );
                    if (hasPrivilege("GET_APPLICATION_DOWNLOAD_STATISTIC") && this.state.isShowAppDownload) {
                        chartList.push(
                            <div className="analysis_chart col-md-6 col-sm-12"
                                data-title={Intl.get("oplate.user.app.download", "各版本下载统计")}>
                                <div className="chart-holder">
                                    <CardContainer 
                                        title={Intl.get("oplate.user.app.download", "各版本下载统计")}
                                        exportData={handleAppDownLoadData(appDownLoadData, appTitleName)}
                                        csvFileName="app_download_statis.csv"
                                    >
                                        {this.getAppsDownloadStatistics()}
                                    </CardContainer>
                                </div>
                            </div>
                        );
                    }
                }
                break;
            case 'added':
                if (!isComposite) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                            data-title={Intl.get("operation.report.activity", "活跃度")}>
                            <div className="chart-holder">
                                <CardContainer
                                    title={Intl.get("operation.report.activity", "活跃度")}
                                    radioValue={radioValue}
                                    dateRange={this.state.activeNess.dateRange}
                                    onDateRangeChange={this.activeNessDataRangeChange}
                                    exportData={handleActivelyData(this.state.activeNess.data)}
                                    csvFileName="actively_statis.csv"
                                >
                                    {this.getActivenessChart(244)}
                                </CardContainer>
                            </div>
                        </div>
                    );
                }
                var showRetention = this.judgeShowRetention();
                if (showRetention) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("oplate.user.analysis.9", "用户留存")}>
                            <div className="chart-holder retention_table_chart height-fix">
                                <CardContainer 
                                    title={Intl.get("oplate.user.analysis.9", "用户留存")}
                                    exportData={handleRetentionData(this.state.retention.data)}
                                    csvFileName="user_rentention_statis.csv"
                                >
                                    {this.getRetentionChart()}
                                </CardContainer>
                            </div>
                        </div>
                    );
                }
                break;
            case 'expired':
                if (!isComposite) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                            data-title={Intl.get("operation.report.activity", "活跃度")}>
                            <div className="chart-holder expired-activeness-chart-height">
                                <CardContainer
                                    title={Intl.get("operation.report.activity", "活跃度")}
                                    radioValue={radioValue}
                                    dateRange={this.state.activeNess.dateRange}
                                    onDateRangeChange={this.activeNessDataRangeChange}
                                    exportData={handleActivelyData(this.state.activeNess.data)}
                                    csvFileName="actively_statis.csv"
                                >
                                    {this.getActivenessChart(244)}
                                </CardContainer>
                            </div>
                        </div>
                    );
                }
                if (shouldViewActiveNessChart) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("oplate.user.analysis.6", "在线时长统计")}>
                            <div className="chart-holder active-time-scatter-height height-fix">
                                <CardContainer
                                    title={Intl.get("oplate.user.analysis.6", "在线时长统计")}
                                    exportData={handlePieChartData(this.state.loginLong.data)}
                                    csvFileName="login_long_statis.csv"
                                >
                                    {this.getPieChart()}
                                </CardContainer>
                            </div>
                        </div>
                    );
                }
                break;
        }
        const zoneMapClassName = function () {
            //总数和新增延期不显示
            if (this.state.currentTab != "total" && this.state.currentTab != "added_expired") {
                return "analysis_chart col-md-6 col-sm-12"
            }
            else {
                return "analysis_chart col-md-6 col-sm-12 hide"
            }
        };
        //活跃用户统计(只在选择了应用后显示,新增过期用户tab下不显示)
        if (this.state.selectedApp && this.state.selectedApp.indexOf(",") < 0 && this.state.currentTab != "added_expired") {
            chartList.push((
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title={Intl.get("oplate.user.analysis.device", "设备统计")}>
                    <div className="chart-holder">
                        <CardContainer title={Intl.get("oplate.user.analysis.device", "设备统计")}>
                            {this.getDeviceTypeChart()}
                        </CardContainer>
                    </div>
                </div>
            ), (
                    <div className="analysis_chart col-md-6 col-sm-12"
                        data-title={Intl.get("oplate.user.analysis.browser", "浏览器统计")}>
                        <div className="chart-holder">
                            <CardContainer title={Intl.get("oplate.user.analysis.browser", "浏览器统计")}>
                                {this.getBrowserChart()}
                            </CardContainer>
                        </div>
                    </div>
                ), (
                    <div className="analysis_chart col-md-6 col-sm-12"
                        data-title={Intl.get("oplate.user.analysis.loginCounts", "用户访问次数")}>
                        <div className="chart-holder">
                            <CardContainer title={Intl.get("oplate.user.analysis.loginCounts", "用户访问次数")}>
                                {this.getUserLoginCounts()}
                            </CardContainer>
                        </div>
                    </div>
                ), (
                    <div className={zoneMapClassName.call(this)}
                        data-title={Intl.get("oplate_customer_analysis.3", "地域统计")}>
                        <div className="chart-holder zone-fix">
                            <CardContainer title={Intl.get("oplate_customer_analysis.3", "地域统计")}>
                                {this.getActiveZoneChart()}
                            </CardContainer>
                        </div>
                    </div>
                ), (
                    <div className="analysis_chart col-md-6 col-sm-12"
                        data-title={Intl.get("oplate.user.analysis.loginDays", "用户访问天数")}>
                        <div className="chart-holder">
                            <CardContainer title={Intl.get("oplate.user.analysis.loginDays", "用户访问天数")}>
                                {this.getUserLoginDays()}
                            </CardContainer>
                        </div>
                    </div>
                ), (
                    <div className="analysis_chart col-md-6 col-sm-12"
                        data-title={Intl.get("oplate.user.analysis.loginTimes", "用户在线时间")}>
                        <div className="chart-holder">
                            <CardContainer title={Intl.get("oplate.user.analysis.loginTimes", "用户在线时间")}>
                                {this.getUserLoginTimes()}
                            </CardContainer>
                        </div>
                    </div>
                ), (
                    <div className="analysis_chart col-md-6 col-sm-12 charts-select-fix"
                        data-title={Intl.get("oplate.user.analysis.averageLoginTimes", "平均在线时长")}>
                        <SelectFullWidth
                            optionFilterProp="children"
                            showSearch
                            minWidth={120}
                            value={this.state.selectedOnlineTimeRange}
                            onChange={this.onSelectOnlineTimeRange}>
                            {onlineTimeRange.map((item, idx) => (
                                <Option key={idx} value={item.value} title={item.name}>{item.name}</Option>
                            ))}
                        </SelectFullWidth>
                        <div className="chart-holder">
                            <CardContainer title={Intl.get("oplate.user.analysis.averageLoginTimes", "平均在线时长")}>
                                {this.getOnlineTimeChart()}
                            </CardContainer>
                        </div>
                    </div>
                ))
        }
        return (
            <div>
                {chartList}
            </div>
        );
    },
    // 将用户类型转为后端需要的数据格式
    transUserType(userType) {
        var user_type = '';
        if (userType == Intl.get("common.official", '签约')) {
            user_type = Intl.get("common.trial.official", '正式用户');
        } else if (userType == Intl.get("common.trial", '试用')) {
            user_type = Intl.get("common.trial.user", '试用用户');
        } else if (userType == Intl.get("user.type.presented", '赠送')) {
            user_type = 'special';
        } else if (userType == Intl.get("user.type.train", '培训')) {
            user_type = 'training';
        } else if (userType == Intl.get("user.type.employee", '员工')) {
            user_type = 'internal';
        } else if (userType == Intl.get("common.unknown", '未知')) {
            user_type = 'unknown';
        }
        return user_type;
    },

    // 点击用户类型统计图表，获取对应的类型及其分析数据
    getClickUserType(userType) {
        let user_type = this.transUserType(userType);
        OplateUserAnalysisAction.setLinkageUserType(user_type);
        this.getChartData({
            type: user_type
        });
    },
    // 删除用户类型的条件
    deleteUserType() {
        OplateUserAnalysisAction.setLinkageUserType('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },

    // 用户类型统计获取失败时，重新获取
    retryUserType() {
        let currentTab = this.state.currentTab;
        let queryParams = this.getQueryParams();
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                OplateUserAnalysisAction.getUserTypeStatistics("total", queryParams);
                break;
            case 'added':
                OplateUserAnalysisAction.getUserTypeStatistics("added", queryParams);
                break;
            case 'expired':
                OplateUserAnalysisAction.getUserTypeStatistics("expired", queryParams);
                break;
            case 'added_expired':
                OplateUserAnalysisAction.getUserTypeStatistics("added_expired", queryParams);
                break;
        }
    },

    // 用户类型统计
    getUserTypePieChar() {
        if (this.state.userType.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.userType.errorMsg, this.retryUserType);
        }
        return (<PieChart
            data={this.state.userType.data}
            legend={_.pluck(this.state.userType.data, 'name')}
            height={234}
            resultType={this.state.userType.resultType}
            getClickType={this.getClickUserType}
        />);
    },

    // 将应用的状态转为后端需要的数据格式
    transAppStatus(appStatus) {
        var status = '';
        if (appStatus == Intl.get("common.enabled", '启用')) {
            status = '1';
        } else if (appStatus == Intl.get("common.stop", '停用')) {
            status = '0';
        }
        return status;
    },

    // 点击应用状态统计图表，获取对应的类型及其分析数据
    getClickAppStatus(appStatus) {
        let status = this.transAppStatus(appStatus);
        OplateUserAnalysisAction.setLinkageAppStatus(status);
        this.getChartData({
            status: status
        });
    },

    // 删除应用启停用的条件
    deleteAppStatus() {
        OplateUserAnalysisAction.setLinkageAppStatus('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },
    // 应用的起停用状态获取失败时，重新获取
    retryAppStatus() {
        let currentTab = this.state.currentTab;
        let queryParams = this.getQueryParams();
        //看当前是哪个tab，发请求获取相应数据
        switch (currentTab) {
            case 'total':
                OplateUserAnalysisAction.getAppStatus("total", queryParams);
                break;
            case 'added':
                OplateUserAnalysisAction.getAppStatus("added", queryParams);
                break;
            case 'expired':
                OplateUserAnalysisAction.getAppStatus("expired", queryParams);
                break;
            case 'added_expired':
                OplateUserAnalysisAction.getAppStatus("added_expired", queryParams);
                break;
        }
    },

    // 应用的启停用状态统计
    getAppStatusPieChar() {
        if (this.state.appStatus.errorMsg) {
            return this.renderGetDataErrorMessage(this.state.appStatus.errorMsg, this.retryAppStatus);
        }
        return (<PieChart
            data={this.state.appStatus.data}
            legend={_.pluck(this.state.appStatus.data, 'name')}
            height={234}
            resultType={this.state.appStatus.resultType}
            getClickType={this.getClickAppStatus}
        />);
    },

    // 将用户类型的后端数据格式转为界面上可以显示的数据
    transUserTypeShow(userType) {
        var user_type = '';
        if (userType == Intl.get("common.trial.official", '正式用户')) {
            user_type = Intl.get("common.official", '签约');
        } else if (userType == Intl.get("common.trial.user", '试用用户')) {
            user_type = Intl.get("common.trial", '试用');
        } else if (userType == 'special') {
            user_type = Intl.get("user.type.presented", '赠送');
        } else if (userType == 'training') {
            user_type = Intl.get("user.type.train", '培训');
        } else if (userType == 'internal') {
            user_type = Intl.get("user.type.employee", '员工');
        } else if (userType == 'unknown') {
            user_type = Intl.get("common.unknown", '未知');
        }
        return user_type;
    },

    // 将应用的启停用的后端数据格式转为界面上可以显示的数据
    transAppStatusShow(appStatus) {
        var status = '';
        if (appStatus == '1') {
            status = Intl.get("common.enabled", '启用');
        } else if (appStatus == '0') {
            status = Intl.get("common.stop", '停用');
        }
        return status;
    },

    render: function () {
        let clickType = this.state.user_type || this.state.status || this.state.zone || this.state.industy || this.state.zone;
        var chartListHeight = $(window).height() -
            AnalysisLayout.LAYOUTS.TOP -
            AnalysisLayout.LAYOUTS.BOTTOM - 20 -
            (this.state.filterExpanded ? AnalysisLayout.LAYOUTS.FILTER_AREA : 0) -
            (clickType ? AnalysisLayout.LAYOUTS.HEIGHT : 0);
        var windowWidth = $(window).width();
        if (windowWidth >= Oplate.layout['screen-md']) {
            this.f = Math.floor(($(window).width() - AnalysisLayout.LAYOUTS.LEFT_NAVBAR - AnalysisLayout.LAYOUTS.CHART_LIST_PADDING * 2 - AnalysisLayout.LAYOUTS.CHART_PADDING * 4) / 2);
        } else {
            this.f = Math.floor($(window).width() - AnalysisLayout.LAYOUTS.LEFT_NAVBAR - AnalysisLayout.LAYOUTS.CHART_LIST_PADDING * 2 - AnalysisLayout.LAYOUTS.CHART_PADDING * 2);
        }

        var leftSpace = AnalysisLayout.LAYOUTS.LEFT_NAVBAR + AnalysisLayout.LAYOUTS.ANALYSIS_MENU;
        var rightSpace = AnalysisLayout.LAYOUTS.RIGHT_PADDING + AnalysisLayout.LAYOUTS.TIME_RANGE_WIDTH;

        var appSelectorMaxWidth = $(window).width() - leftSpace - rightSpace;
        return (
            <div className="oplate_user_analysis"
                data-tracename="用户分析"
            >
                <TopNav>
                    <AnalysisMenu />
                    <div className="analysis-selector-wrap">
                        <AnalysisAppSelector
                            onSelectApp={this.onSelectApp}
                            maxWidth={appSelectorMaxWidth}
                        />
                    </div>
                    <FilterBtn
                        expanded={this.state.filterExpanded}
                        onClick={this.toggleFilterBlock}
                    />
                    <div className="date-range-wrap">
                        <AntcDatePicker
                            disableDateAfterToday={true}
                            range="week"
                            data-tracename="选择日期"
                            onSelect={this.onSelectDate}>
                            <AntcDatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</AntcDatePicker.Option>
                            <AntcDatePicker.Option
                                value="month">{Intl.get("common.time.unit.month", "月")}</AntcDatePicker.Option>
                            <AntcDatePicker.Option
                                value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="year">{Intl.get("common.time.unit.year", "年")}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</AntcDatePicker.Option>
                        </AntcDatePicker>
                    </div>
                </TopNav>
                {this.renderFilterArea()}
                <div className="summary-numbers">
                    <Row>
                        <Col xs={24} sm={12} md={5}>
                            <SummaryNumber
                                resultType={this.state.summaryNumbers.resultType}
                                desp={Intl.get("oplate.user.analysis.11", "总用户")}
                                num={this.state.summaryNumbers.data.total}
                                active={this.state.currentTab === 'total'}
                                onClick={this.changeCurrentTab.bind(this, 'total')} />
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <SummaryNumber
                                resultType={this.state.summaryNumbers.resultType}
                                desp={Intl.get("oplate.user.analysis.12", "新增用户")}
                                num={this.state.summaryNumbers.data.added}
                                active={this.state.currentTab === 'added'}
                                onClick={this.changeCurrentTab.bind(this, 'added')} />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <SummaryNumber
                                resultType={this.state.summaryNumbers.resultType}
                                desp="延期用户"
                                active={this.state.currentTab === 'delay'}
                                onClick={this.changeCurrentTab.bind(this, 'delay')} />
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <SummaryNumber
                                resultType={this.state.summaryNumbers.resultType}
                                desp={Intl.get("oplate.user.analysis.13", "过期用户")}
                                num={this.state.summaryNumbers.data.expired}
                                active={this.state.currentTab === 'expired'}
                                onClick={this.changeCurrentTab.bind(this, 'expired')} />
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <SummaryNumber
                                resultType={this.state.summaryNumbers.resultType}
                                desp={Intl.get("oplate.user.analysis.14", "新增过期用户")}
                                num={this.state.summaryNumbers.data.added_expired}
                                active={this.state.currentTab === 'added_expired'}
                                onClick={this.changeCurrentTab.bind(this, 'added_expired')} />
                        </Col>
                    </Row>
                </div>
                {/**
                 图表联动的标签显示：用户类型、启停用状态、团队、行业和地域显示数据的条件
                 ×掉后，返回的去掉条件的数据
                 */}
                <div className="show-click-lable">
                    {/**用户类型*/}
                    {this.state.user_type ? (<span className="show-click-type">
                        {Intl.get("oplate.user.type", "用户类型：")}
                        {this.transUserTypeShow(this.state.user_type)}
                        <span className="glyphicon glyphicon-remove"
                            data-tracename="去掉用户类型的条件"
                            onClick={this.deleteUserType}
                        ></span>
                    </span>
                    ) : null}
                    {/**应用的启停用状态*/}
                    {this.state.status ? (<span className="show-click-type">
                        {Intl.get("oplate.app.status", "用户状态：")}
                        {this.transAppStatusShow(this.state.status)}
                        <span className="glyphicon glyphicon-remove"
                            data-tracename="去掉应用启停用的条件"
                            onClick={this.deleteAppStatus}
                        ></span>
                    </span>
                    ) : null}
                    {/**地域*/}
                    {this.state.zone ? (<span className="show-click-type">
                        {Intl.get("oplate.user.zone", "地域：")}
                        {this.state.zone == 'unknown' ? '未知' : (this.state.zone)}
                        <span className="glyphicon glyphicon-remove"
                            data-tracename="去掉标签关联的条件"
                            onClick={this.deleteZone}
                        ></span>
                    </span>
                    ) : null}
                    {/**行业*/}
                    {this.state.industry ? (<span className="show-click-type">
                        {Intl.get("oplate.user.industry", "行业：")}
                        {this.state.industry == 'unknown' ? '未知' : (this.state.industry)}
                        <span className="glyphicon glyphicon-remove"
                            data-tracename="去掉行业类型的条件"
                            onClick={this.deleteIndustry}
                        ></span>
                    </span>
                    ) : null}
                    {/**团队*/}
                    {this.state.team ? (<span className="show-click-type">
                        {Intl.get("oplate.user.team", "团队：")}
                        {this.state.team == 'unknown' ? '未知' : (this.state.team)}
                        <span className="glyphicon glyphicon-remove"
                            data-tracename="去掉团队类型的条件"
                            onClick={this.deleteTeam}
                        ></span>
                    </span>
                    ) : null}
                </div>
                <div>
                </div>
                <div ref="chart_list" style={{ height: chartListHeight }}>
                    <GeminiScrollbar>
                        <div className="chart_list">
                            <div>
                                {/**
                                 单个应用时，对应用户类型统计和应用的启停用统计
                                 */}
                                {this.state.isComposite || this.state.currentTab == "delay" ? null : (
                                    <div className="analysis_chart col-md-6 col-sm-12"
                                         data-title={Intl.get("oplate.user.analysis.user.type", "用户类型")}>
                                        <div className="chart-holder" data-tracename="用户类型统计信息" ref="chartWidthDom">
                                            <CardContainer
                                                title={Intl.get("oplate.user.analysis.user.type", "用户类型")}
                                                exportData={handlePieChartData(this.state.userType.data)}
                                                csvFileName="user_type_statis.csv"
                                            >
                                                {this.getUserTypePieChar()}
                                            </CardContainer>
                                        </div>
                                    </div>
                                )}
                                {this.state.isComposite || this.state.currentTab == "delay" ? null : (
                                    <div className="analysis_chart col-md-6 col-sm-12"
                                         data-title={Intl.get("oplate.user.analysis.app.status", "用户状态")}>
                                        <div className="chart-holder" data-tracename="用户状态统计信息" ref="chartWidthDom">
                                            <CardContainer 
                                                title={Intl.get("oplate.user.analysis.app.status", "用户状态")}
                                                exportData={handlePieChartData(this.state.appStatus.data)}
                                                csvFileName="app_status_statis.csv"
                                            >
                                                {this.getAppStatusPieChar()}
                                            </CardContainer>
                                        </div>
                                    </div>
                                )}
                                {
                                    this.state.currentTab != "delay" ?
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.total", "用户统计")}>
                                    <div className="chart-holder" data-tracename="用户统计信息" ref="chartWidthDom">
                                        <CardContainer
                                            title={fetchTeamOrMember ? Intl.get("user.analysis.total", "用户统计") : ""}
                                            exportData={handleUserStatis(this.state.userAnalysis.data)}
                                            csvFileName="user_statis.csv"
                                        >
                                            {this.getUserChart()}
                                        </CardContainer>
                                    </div>
                                        </div> : null
                                }
                                {
                                    this.state.currentTab != "delay" ?
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={this.getTeamChartTitle()}>
                                    <div className="chart-holder" data-tracename="销售团队统计信息">
                                        <CardContainer
                                            title={this.getTeamChartTitle()}
                                            exportData={handleExportData(this.state.teamOrMemberAnalysis.data)}
                                            csvFileName="team_statis.csv"
                                        >
                                            {this.getTeamChart()}
                                        </CardContainer>
                                    </div>
                                        </div> : null
                                }
                                {
                                    this.state.currentTab == "total" || this.state.currentTab == "added_expired" ?
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.address", "地域统计")}>
                                    <div className="chart-holder" data-tracename="地域统计信息">
                                        <CardContainer
                                            title={fetchTeamOrMember ? Intl.get("user.analysis.address", "地域统计") : ""}
                                            exportData={handleExportData(this.state.zoneAnalysis.data)}
                                            csvFileName="zone_statis.csv"
                                        >
                                            {this.getZoneChart()}
                                        </CardContainer>
                                    </div>
                                        </div> : null
                                }
                                {
                                    this.state.currentTab != "delay" ?
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.industry", "行业统计")}>
                                    <div className="chart-holder" data-tracename="行业统计信息">
                                        <CardContainer
                                            title={fetchTeamOrMember ? Intl.get("user.analysis.industry", "行业统计") : ""}
                                            exportData={handleExportData(this.state.industryAnalysis.data)}
                                            csvFileName="industry_statis.csv"
                                        >
                                            {this.getIndustryChart()}
                                        </CardContainer>
                                    </div>
                                        </div> : null
                                }
                                {/*其余的图表不确定了，需要动态判断*/}
                                {this.renderExtraCharts()}
                            </div>
                        </div>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});
//返回react对象
module.exports = OPLATE_USER_ANALYSIS;