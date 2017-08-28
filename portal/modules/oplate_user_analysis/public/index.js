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
import DatePicker from "../../../components/datepicker";
var GeminiScrollbar = require("../../../components/react-gemini-scrollbar");
var AnalysisLayout = require("./utils/analysis-layout");
var OplateUserAnalysisAction = require("./action/oplate-user-analysis.action");
var OplateUserAnalysisAjax = require("./ajax/oplate-user-analysis.ajax");
var OplateUserAnalysisStore = require("./store/oplate-user-analysis.store");
var SummaryNumber = require("./views/summary-number");
var CompositeLine = require("./views/composite-line");
var BarChart = require("./views/bar");
var ScatterChart = require("./views/active-time-scatter");
var AreaLine = require("./views/arealine");
var SingleLineChart = require("./views/single_line");
var emitter = require("./utils/emitter");
var DATE_FORMAT = oplateConsts.DATE_FORMAT;
var Checkbox = require("antd").Checkbox;
var PieChart = require("./views/piechart");
var Retention = require("./views/retention");
var SingleAppBarChart = require("./views/single-app-bar");
import Trace from "LIB_DIR/trace";
import {hasPrivilege} from "CMP_DIR/privilege/checker";
const LEGEND = [{name: Intl.get("common.official", "签约"), key: "formal"},
    {name: Intl.get("common.trial", "试用"), key: "trial"},
    {name: Intl.get("user.type.presented", "赠送"), key: "special"},
    {name: Intl.get("user.type.train", "培训"), key: "training"},
    {name: Intl.get("user.type.employee", "员工"), key: "internal"},
    {name: Intl.get("user.unknown", "未知"), key: "unknown"}];

//用户类型常量
var USER_TYPE_CONSTANTS = {
    "SALES_MANAGER": "salesmanager",
    "SALES_LEADER": "salesleader"
};

// ""表示不确定，member表示要获取成员数据，team表示要获取团队数据
var fetchTeamOrMember = "";

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
        return this.getStoreData();
    },
    getAnalysisDataType: function () {
        let type = "";
        if (hasPrivilege("USER_ANALYSIS_COMMON")) {
            type = "common";
        } else if (hasPrivilege("USER_ANALYSIS_MANAGER")) {
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
    sendChartAjax: function (obj) {
        var currentTab = obj && obj.currentTab || this.state.currentTab;
        var isComposite = obj && 'isComposite' in obj ? obj.isComposite : this.state.isComposite;
        var queryParams = this.getQueryParams(obj);
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
                    OplateUserAnalysisAction.getUserActiveNess("total", this.state.activeNess.dataRange, queryParams);
                    OplateUserAnalysisAction.getUserTypeStatistics("total", queryParams);
                    OplateUserAnalysisAction.getAppStatus("total", queryParams);
                    if (fetchMember) {
                        OplateUserAnalysisAction.getTotalMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getTotalTeam(queryParams);
                    }
                }
                if (shouldViewActiveNessChart) {
                    OplateUserAnalysisAction.getUserActiveTime(queryParams);
                    OplateUserAnalysisAction.getUserLoginLong("total", this.state.loginLong.dataRange, queryParams);
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
                    OplateUserAnalysisAction.getUserActiveNess("added", this.state.activeNess.dataRange, queryParams);
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
                    OplateUserAnalysisAction.getUserActiveNess("expired", this.state.activeNess.dataRange, queryParams);
                    OplateUserAnalysisAction.getUserTypeStatistics("expired", queryParams);
                    OplateUserAnalysisAction.getAppStatus("expired", queryParams);
                    if (fetchMember) {
                        OplateUserAnalysisAction.getExpiredMember(queryParams);
                    } else {
                        OplateUserAnalysisAction.getExpiredTeam(queryParams);
                    }
                }
                if (shouldViewActiveNessChart) {
                    OplateUserAnalysisAction.getUserLoginLong("expired", this.state.loginLong.dataRange, queryParams);
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
        OplateUserAnalysisAction.changeSearchTime({startTime, endTime});
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
        var isComposite = isChoosenAll;
        OplateUserAnalysisAction.changeSelectedApp({selectedApp: appId, isComposite: isComposite});
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
    //总用户统计
    getUserChart: function () {
        if (this.state.isComposite) {
            var list = _.isArray(this.state.userAnalysis.data) ?
                this.state.userAnalysis.data : [];
            return (
                <CompositeLine
                    width={this.chartWidth}
                    list={list}
                    title={Intl.get("user.analysis.total", "用户统计")}
                    height={214}
                    resultType={this.state.userAnalysis.resultType}
                />
            );
        } else {
            return (
                <SingleLineChart
                    width={this.chartWidth}
                    list={this.state.userAnalysis.data}
                    title={Intl.get("user.analysis.total", "用户统计")}
                    legend={LEGEND}
                    resultType={this.state.userAnalysis.resultType}
                />
            );
        }
    },

    // 点击应用地域统计图表，获取对应的地域类型及其分析数据
    getClickZone(zone){
        OplateUserAnalysisAction.setLinkageZone(zone);
        this.getChartData({
            zone: zone
        });
    },

    // 删除地域类型的条件
    deleteZone(){
        OplateUserAnalysisAction.setLinkageZone('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },

    //地域统计
    getZoneChart: function () {
        if (this.state.isComposite) { // 综合应用
            let endDate = this.getEndDateText();
            return (
                <BarChart
                    width={this.chartWidth}
                    list={this.state.zoneAnalysis.data}
                    title={Intl.get("user.analysis.address", "地域统计")}
                    legend={LEGEND}
                    endDate={endDate}
                    resultType={this.state.zoneAnalysis.resultType}
                />
            );
        } else {   // 单个应用
            return (
                <SingleAppBarChart
                    width={this.chartWidth}
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
    getClickTeam(team){
        OplateUserAnalysisAction.setLinkageTeam(team);
        this.getChartData({
            team: team
        });
    },

    // 删除团队类型的条件
    deleteTeam(){
        OplateUserAnalysisAction.setLinkageTeam('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },
    //团队/成员统计
    getTeamChart: function () {
        var endDate = this.getEndDateText();
        var title = this.getTeamChartTitle();
        if (this.state.isComposite) {  // 综合应用
            return (
                <BarChart
                    width={this.chartWidth}
                    list={this.state.teamOrMemberAnalysis.data}
                    title={title}
                    legend={LEGEND}
                    endDate={endDate}
                    resultType={this.state.teamOrMemberAnalysis.resultType}
                />
            );
        } else {  // 单个应用
            return (
                <SingleAppBarChart
                    width={this.chartWidth}
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
    getClickIndustry(industry){
        Trace.traceEvent("用户分析", "点击应用行业统计图表");
        OplateUserAnalysisAction.setLinkageIndustry(industry);
        this.getChartData({
            industry: industry
        });
    },

    // 删除行业类型的条件
    deleteIndustry(){
        OplateUserAnalysisAction.setLinkageIndustry('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
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
            return (
                <BarChart
                    list={this.state.industryAnalysis.data}
                    title={Intl.get("user.analysis.industry", "行业统计")}
                    width={this.chartWidth}
                    height={214}
                    endDate={endDate}
                    xAxisInterval={interval}
                    xAxisLabelAlign={labelAlign}
                    xAxisRotate={rotate}
                    legend={LEGEND}
                    resultType={this.state.industryAnalysis.resultType}
                />
            );
        } else {  // 单个应用
            return (
                <SingleAppBarChart
                    width={this.chartWidth}
                    list={this.state.industryAnalysis.data}
                    title={Intl.get("user.analysis.industry", "行业统计")}
                    height={214}
                    legend={this.state.industryAnalysis.data}
                    resultType={this.state.industryAnalysis.resultType}
                    getClickType={this.getClickIndustry}
                />
            );

        }

    },
    //活跃度周期修改
    activeNessDataRangeChange: function (dataRange) {
        var queryParams = this.getQueryParams();
        OplateUserAnalysisAction.getUserActiveNess(this.state.activeNess.dataType, dataRange, queryParams);
    },
    getActivenessChart: function () {
        return (
            <AreaLine
                list={this.state.activeNess.data}
                title={Intl.get("operation.report.activity", "活跃度")}
                width={this.chartWidth}
                height={240}
                onDataRangeChange={this.activeNessDataRangeChange}
                dataRange={this.state.activeNess.dataRange}
                resultType={this.state.activeNess.resultType}
                dataType={this.state.activeNess.dataType}
                startTime={this.state.startTime}
                endTime={this.state.endTime}
            />
        );
    },
    //活跃时间段
    getActivenessTime: function () {
        return (
            <ScatterChart
                width={this.chartWidth}
                list={this.state.activeTime.data}
                title={Intl.get("oplate.user.analysis.5", "活跃时间段统计")}
                resultType={this.state.activeTime.resultType}
            />
        );
    },
    changeCurrentTab: function (tabName, event) {
        OplateUserAnalysisAction.changeCurrentTab(tabName);
        this.getChartData({
            currentTab: tabName
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
                            <Checkbox defaultChecked={false} onChange={this.toggleFilterParam.bind(this, "customer")}/>
                            <ReactIntl.FormattedMessage id="sales.home.customer"
                                                        defaultMessage="客户"/>
                        </label>
                    </li>
                    <li>
                        <label>
                            <Checkbox defaultChecked={false} onChange={this.toggleFilterParam.bind(this, "internal")}/>
                            <ReactIntl.FormattedMessage id="user.type.employee" defaultMessage="员工"/>
                        </label>
                    </li>
                    <li>
                        <label>
                            <Checkbox defaultChecked={false} onChange={this.toggleFilterParam.bind(this, "special")}/>
                            <ReactIntl.FormattedMessage id="user.type.presented" defaultMessage="赠送"/>
                        </label>
                    </li>
                </ul>
            </div>
        );
    },
    getPieChart: function () {
        return (<PieChart
            data={this.state.loginLong.data}
            title={Intl.get("oplate.user.analysis.6", "登录时长统计")}
            legend={[Intl.get("oplate.user.analysis.7", "时长小于1小时"), Intl.get("oplate.user.analysis.8", "时长大于等于1小时")]}
            height={214}
            resultType={this.state.loginLong.resultType}
        />);
    },
    //渲染用户留存
    getRetentionChart: function () {
        return (<Retention
            data={this.state.retention.data}
            title={Intl.get("oplate.user.analysis.9", "用户留存")}
            height={214}
            resultType={this.state.retention.resultType}
        />);
    },
    //渲染剩余图表
    renderExtraCharts: function () {
        //是否能看到“活跃时间段统计”和“登录时长统计”
        var isComposite = this.state.isComposite;
        var shouldViewActiveNessChart = !isComposite && !this.state.isSalesRole;
        switch (this.state.currentTab) {
            case 'total':
                var chartList = [];
                if (!isComposite) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("operation.report.activity", "活跃度")}>
                            <div className="chart-holder activeness-chart-height">
                                {this.getActivenessChart()}
                            </div>
                        </div>
                    );
                }
                if (shouldViewActiveNessChart) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("oplate.user.analysis.10", "活跃时间段")}>
                            <div className="chart-holder active-time-scatter-height">
                                <div className="title"><ReactIntl.FormattedMessage id="oplate.user.analysis.10"
                                                                                   defaultMessage="活跃时间段"/></div>
                                {this.getActivenessTime()}
                            </div>
                        </div>,
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("oplate.user.analysis.6", "在线时长统计")}>
                            <div className="chart-holder">
                                <div className="title"><ReactIntl.FormattedMessage id="oplate.user.analysis.6"
                                                                                   defaultMessage="在线时长统计"/></div>
                                {this.getPieChart()}
                            </div>
                        </div>
                    );
                }
                return (
                    <div>
                        {chartList}
                    </div>
                );
            case 'added':
                var chartList = [];
                if (!isComposite) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("operation.report.activity", "活跃度")}>
                            <div className="chart-holder">
                                {this.getActivenessChart()}
                            </div>
                        </div>
                    );
                }
                var showRetention = this.judgeShowRetention();
                if (showRetention) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("oplate.user.analysis.9", "用户留存")}>
                            <div className="chart-holder retention_table_chart">
                                <div className="title"><ReactIntl.FormattedMessage id="oplate.user.analysis.9"
                                                                                   defaultMessage="用户留存"/></div>
                                {this.getRetentionChart()}
                            </div>
                        </div>
                    );
                }
                return (
                    <div>
                        {chartList}
                    </div>
                );
            case 'expired':
                var chartList = [];
                if (!isComposite) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("operation.report.activity", "活跃度")}>
                            <div className="chart-holder activeness-chart-height">
                                {this.getActivenessChart()}
                            </div>
                        </div>
                    );
                }
                if (shouldViewActiveNessChart) {
                    chartList.push(
                        <div className="analysis_chart col-md-6 col-sm-12"
                             data-title={Intl.get("oplate.user.analysis.6", "登录时长统计")}>
                            <div className="chart-holder active-time-scatter-height">
                                <div className="title"><ReactIntl.FormattedMessage id="oplate.user.analysis.6"
                                                                                   defaultMessage="在线时长统计"/></div>
                                {this.getPieChart()}
                            </div>
                        </div>
                    );
                }
                return (
                    <div>
                        {chartList}
                    </div>
                );
        }
        return null;
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
    getClickUserType(userType){
        let user_type = this.transUserType(userType);
        OplateUserAnalysisAction.setLinkageUserType(user_type);
        this.getChartData({
            type: user_type
        });
    },
    // 删除用户类型的条件
    deleteUserType(){
        OplateUserAnalysisAction.setLinkageUserType('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },

    // 用户类型统计
    getUserTypePieChar(){
        return (<PieChart
            data={this.state.userType.data}
            legend={_.pluck(this.state.userType.data, 'name')}
            height={214}
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
    getClickAppStatus(appStatus){
        let status = this.transAppStatus(appStatus);
        OplateUserAnalysisAction.setLinkageAppStatus(status);
        this.getChartData({
            status: status
        });
    },

    // 删除应用启停用的条件
    deleteAppStatus(){
        OplateUserAnalysisAction.setLinkageAppStatus('');
        setTimeout(() => {
            this.getChartData();
        }, 0);
    },


    // 应用的启停用状态统计
    getAppStatusPieChar(){
        return (<PieChart
            data={this.state.appStatus.data}
            legend={_.pluck(this.state.appStatus.data, 'name')}
            height={214}
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
            AnalysisLayout.LAYOUTS.BOTTOM -
            (this.state.filterExpanded ? AnalysisLayout.LAYOUTS.FILTER_AREA : 0) -
            (clickType ? AnalysisLayout.LAYOUTS.HEIGHT : 0);
        var windowWidth = $(window).width();
        if (windowWidth >= Oplate.layout['screen-md']) {
            this.chartWidth = Math.floor(($(window).width() - AnalysisLayout.LAYOUTS.LEFT_NAVBAR - AnalysisLayout.LAYOUTS.CHART_LIST_PADDING * 2 - AnalysisLayout.LAYOUTS.CHART_PADDING * 4) / 2);
        } else {
            this.chartWidth = Math.floor($(window).width() - AnalysisLayout.LAYOUTS.LEFT_NAVBAR - AnalysisLayout.LAYOUTS.CHART_LIST_PADDING * 2 - AnalysisLayout.LAYOUTS.CHART_PADDING * 2);
        }

        var leftSpace = AnalysisLayout.LAYOUTS.LEFT_NAVBAR + AnalysisLayout.LAYOUTS.ANALYSIS_MENU;
        var rightSpace = AnalysisLayout.LAYOUTS.RIGHT_PADDING + AnalysisLayout.LAYOUTS.TIME_RANGE_WIDTH;

        var appSelectorMaxWidth = $(window).width() - leftSpace - rightSpace;

        return (
            <div className="oplate_user_analysis"
                 data-tracename="用户分析"
            >
                <TopNav>
                    <AnalysisMenu/>
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
                        <DatePicker
                            disableDateAfterToday={true}
                            range="week"
                            data-tracename="选择日期"
                            onSelect={this.onSelectDate}>
                            <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                            <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                            <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                            <DatePicker.Option
                                value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                            <DatePicker.Option
                                value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                            <DatePicker.Option value="year">{Intl.get("common.time.unit.year", "年")}</DatePicker.Option>
                            <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                        </DatePicker>
                    </div>
                </TopNav>
                {this.renderFilterArea()}
                <div className="summary-numbers">
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate.user.analysis.11", "总用户")}
                        num={this.state.summaryNumbers.data.total}
                        active={this.state.currentTab === 'total'}
                        onClick={this.changeCurrentTab.bind(this, 'total')}/>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate.user.analysis.12", "新增用户")}
                        num={this.state.summaryNumbers.data.added}
                        active={this.state.currentTab === 'added'}
                        onClick={this.changeCurrentTab.bind(this, 'added')}/>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate.user.analysis.13", "过期用户")}
                        num={this.state.summaryNumbers.data.expired}
                        active={this.state.currentTab === 'expired'}
                        onClick={this.changeCurrentTab.bind(this, 'expired')}/>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate.user.analysis.14", "新增过期用户")}
                        num={this.state.summaryNumbers.data.added_expired}
                        active={this.state.currentTab === 'added_expired'}
                        onClick={this.changeCurrentTab.bind(this, 'added_expired')}/>
                </div>
                {/**
                 图表联动的标签显示：用户类型、启停用状态、团队、行业和地域显示数据的条件
                 ×掉后，返回的去掉条件的数据
                 */}
                <div className="show-click-lable">
                    {/**用户类型*/}
                    { this.state.user_type ? (<span className="show-click-type">
                            {Intl.get("oplate.user.type", "用户类型：")}
                            {this.transUserTypeShow(this.state.user_type)}
                            <span className="glyphicon glyphicon-remove"
                                  data-tracename="去掉用户类型的条件"
                                  onClick={this.deleteUserType}
                            ></span>
                        </span>
                    ) : null}
                    {/**应用的启停用状态*/}
                    { this.state.status ? (<span className="show-click-type">
                               {Intl.get("oplate.app.status", "用户状态：")}
                            {this.transAppStatusShow(this.state.status)}
                            <span className="glyphicon glyphicon-remove"
                                  data-tracename="去掉应用启停用的条件"
                                  onClick={this.deleteAppStatus}
                            ></span>
                        </span>
                    ) : null}
                    {/**地域*/}
                    { this.state.zone ? (<span className="show-click-type">
                                {Intl.get("oplate.user.zone", "地域：")}
                            {this.state.zone == 'unknown' ? '未知' : (this.state.zone)}
                            <span className="glyphicon glyphicon-remove"
                                  data-tracename="去掉标签关联的条件"
                                  onClick={this.deleteZone}
                            ></span>
                        </span>
                    ) : null}
                    {/**行业*/}
                    { this.state.industry ? (<span className="show-click-type">
                                {Intl.get("oplate.user.industry", "行业：")}
                            {this.state.industry == 'unknown' ? '未知' : (this.state.industry)}
                            <span className="glyphicon glyphicon-remove"
                                  data-tracename="去掉行业类型的条件"
                                  onClick={this.deleteIndustry}
                            ></span>
                        </span>
                    ) : null}
                    {/**团队*/}
                    { this.state.team ? (<span className="show-click-type">
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
                <div ref="chart_list" style={{height:chartListHeight}}>
                    <GeminiScrollbar>
                        <div className="chart_list">
                            <div>
                                {/**
                                 单个应用时，对应用户类型统计和应用的启停用统计
                                 */}
                                {this.state.isComposite ? null : (
                                    <div className="analysis_chart col-md-6 col-sm-12"
                                         data-title={Intl.get("oplate.user.analysis.user.type", "用户类型")}>
                                        <div className="chart-holder" data-tracename="用户类型统计信息" ref="chartWidthDom">
                                            <div className="title">
                                                {Intl.get("oplate.user.analysis.user.type", "用户类型")}
                                            </div>
                                            {this.getUserTypePieChar()}
                                        </div>
                                    </div>
                                )}
                                {this.state.isComposite ? null : (
                                    <div className="analysis_chart col-md-6 col-sm-12"
                                         data-title={Intl.get("oplate.user.analysis.app.status", "用户状态")}>
                                        <div className="chart-holder" data-tracename="用户状态统计信息" ref="chartWidthDom">
                                            <div className="title">
                                                {Intl.get("oplate.user.analysis.app.status", "用户状态")}
                                            </div>
                                            {this.getAppStatusPieChar()}
                                        </div>
                                    </div>
                                )}
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.total", "用户统计")}>
                                    <div className="chart-holder" data-tracename="用户统计信息" ref="chartWidthDom">
                                        <div
                                            className="title">{fetchTeamOrMember ? Intl.get("user.analysis.total", "用户统计") : ""}</div>
                                        {this.getUserChart()}
                                    </div>
                                </div>
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={this.getTeamChartTitle()}>
                                    <div className="chart-holder" data-tracename="销售团队统计信息">
                                        <div className="title">{this.getTeamChartTitle()}</div>
                                        {this.getTeamChart()}
                                    </div>
                                </div>
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.address", "地域统计")}>
                                    <div className="chart-holder" data-tracename="地域统计信息">
                                        <div
                                            className="title">{fetchTeamOrMember ? Intl.get("user.analysis.address", "地域统计") : ""}</div>
                                        {this.getZoneChart()}
                                    </div>
                                </div>
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.industry", "行业统计")}>
                                    <div className="chart-holder" data-tracename="行业统计信息">
                                        <div
                                            className="title">{fetchTeamOrMember ? Intl.get("user.analysis.industry", "行业统计") : ""}</div>
                                        {this.getIndustryChart()}
                                    </div>
                                </div>
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