/**
 * 用户分析
 * Created by wangliping on 2016/11/23.
 */
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var OplateUserAnalysisAction = require("../../../oplate_user_analysis/public/action/oplate-user-analysis.action");
var OplateUserAnalysisStore = require("../../../oplate_user_analysis/public/store/oplate-user-analysis.store");
var CompositeLine = require("../../../oplate_user_analysis/public/views/composite-line");
var BarChart = require("../../../oplate_user_analysis/public/views/bar");
var ReverseBarChart = require("../../../oplate_user_analysis/public/views/reverse_bar");
var SingleLineChart = require("../../../oplate_user_analysis/public/views/single_line");
var emitter = require("../../../oplate_user_analysis/public/utils/emitter");
let userData = require("../../../../public/sources/user-data");
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var DATE_FORMAT = oplateConsts.DATE_FORMAT;
let chartLegend = [{name: Intl.get("common.official", "签约"), key: "formal"},
    {name: Intl.get("common.trial", "试用"), key: "trial"},
    {name: Intl.get("user.type.presented", "赠送"), key: "special"},
    {name: Intl.get("user.type.train", "培训"), key: "training"},
    {name: Intl.get("user.type.employee", "员工"), key: "internal"},
    {name: Intl.get("user.unknown", "未知"), key: "unknown"}];
const CHART_HEIGHT = 214;
//用户分析
var UserAnlyis = React.createClass({
    getStateData: function () {
        let stateData = OplateUserAnalysisStore.getState();
        return {
            ...stateData,
            timeType: this.props.timeType,
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            originSalesTeamTree: this.props.originSalesTeamTree
        };
    },
    onStateChange: function () {
        this.setState(this.getStateData());
    },

    getInitialState: function () {
        return this.getStateData();
    },
    componentWillReceiveProps: function (nextProps) {
        let timeObj = {
            timeType: nextProps.timeType,
            startTime: nextProps.startTime,
            endTime: nextProps.endTime,
            originSalesTeamTree: nextProps.originSalesTeamTree
        };
        this.setState(timeObj);
    },
    getDataType: function () {
        if (hasPrivilege("GET_TEAM_LIST_ALL")) {
            return "all";
        } else if (hasPrivilege("GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS")) {
            return "self";
        } else {
            return "";
        }
    },
    getChartData: function () {
        var queryParams = {
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            urltype: 'v2',
            dataType: this.getDataType()
        };
        if (this.props.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.props.currShowSalesman.userId;
        } else if (this.props.currShowSalesTeam) {
            queryParams.team_id = this.props.currShowSalesTeam.group_id;
            //查看当前选择销售团队内所有下级团队/成员的团队新增用户的统计数据
            OplateUserAnalysisAction.getAddedTeam(queryParams);
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            //首次进来时，如果不是销售就获取下级团队/团队成员新增用户的统计数据
            OplateUserAnalysisAction.getAddedTeam(queryParams);
        }
        //获取总的统计分析数据
        //选择天时，不展示趋势图
        if (this.state.timeType != "day") {
            OplateUserAnalysisAction.getAddedSummary(queryParams);
        }
        OplateUserAnalysisAction.getAddedZone(queryParams);
        OplateUserAnalysisAction.getAddedIndustry(queryParams);
    },
    //缩放延时，避免页面卡顿
    resizeTimeout: null,
    //窗口缩放时候的处理函数
    windowResize: function () {
        clearTimeout(this.resizeTimeout);
        //窗口缩放的时候，调用setState，重新走render逻辑渲染
        this.resizeTimeout = setTimeout(() => this.setState(this.getStateData()), 300);
    },
    componentDidMount: function () {
        OplateUserAnalysisStore.listen(this.onStateChange);
        //绑定window的resize，进行缩放处理
        $(window).on('resize', this.windowResize);
        OplateUserAnalysisAction.changeCurrentTab("total");
        this.getChartData();
        $(".statistic-data-analysis .thumb").hide();
    },
    componentWillUnmount: function () {
        OplateUserAnalysisStore.unlisten(this.onStateChange);
        //$('body').css('overflow', 'visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        $(window).off('resize', this.windowResize);
    },
    getStartDateText: function () {
        if (this.state.startTime) {
            return moment(new Date(+this.state.startTime)).format(DATE_FORMAT);
        } else {
            return "";
        }
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
                    height={CHART_HEIGHT}
                    resultType={this.state.userAnalysis.resultType}
                />
            );
        } else {
            return (
                <SingleLineChart
                    width={this.chartWidth}
                    list={this.state.userAnalysis.data}
                    title={Intl.get("user.analysis.total", "用户统计")}
                    legend={[{
                        name: Intl.get("user.analysis.formal", "正式"),
                        key: "formal"
                    }, {name: Intl.get("common.trial", "试用"), key: "trial"}]}
                    resultType={this.state.userAnalysis.resultType}
                />
            );
        }
    },
    //地域统计
    getZoneChart: function () {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        return (
            <BarChart
                width={this.chartWidth}
                list={this.state.zoneAnalysis.data}
                title={Intl.get("user.analysis.address", "地域统计")}
                height={CHART_HEIGHT}
                legend={chartLegend}
                startDate={startDate}
                endDate={endDate}
                showLabel={true}
                resultType={this.state.zoneAnalysis.resultType}
            />
        );
    },

    //获取通过点击统计图中的柱子跳转到用户列表时需传的参数
    getJumpProps: function () {
        let analysis_filter_field = "sales_id", currShowSalesTeam = this.props.currShowSalesTeam;
        //当前展示的是下级团队还是团队内所有成员
        if (currShowSalesTeam) {
            if (_.isArray(currShowSalesTeam.child_groups) && currShowSalesTeam.child_groups.length) {
                //查看当前选择销售团队内所有下级团队新增用户的统计数据
                analysis_filter_field = "team_ids";
            }
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            let originSalesTeamTree = this.state.originSalesTeamTree;
            if (_.isArray(originSalesTeamTree.child_groups) && originSalesTeamTree.child_groups.length) {
                //首次进来时，如果不是销售就获取下级团队新增用户的统计数据
                analysis_filter_field = "team_ids";
            }
        }
        return {
            url: "/user/list",
            query: {
                app_id: "",
                analysis_filter_field: analysis_filter_field
            }
        };
    },
    //团队统计
    getTeamChart: function () {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        //TODO 跳转的处理
        //getJumpProps={this.getJumpProps}
        //getSaleIdByName={this.props.getSaleIdByName}
        return (
            <BarChart
                width={this.chartWidth}
                height={CHART_HEIGHT}
                list={this.state.teamOrMemberAnalysis.data}
                title={Intl.get("user.analysis.team", "团队统计")}
                legend={chartLegend}
                startDate={startDate}
                endDate={endDate}
                resultType={this.state.teamOrMemberAnalysis.resultType}
            />
        );
    },

    getIndustryChart: function () {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        return (
            <ReverseBarChart
                list={this.state.industryAnalysis.data}
                title={Intl.get("user.analysis.industry", "行业统计")}
                width={this.chartWidth}
                height={CHART_HEIGHT}
                startDate={startDate}
                endDate={endDate}
                legend={chartLegend}
                resultType={this.state.industryAnalysis.resultType}
            />
        );
    },
    render: function () {
        let layoutParams = this.props.getChartLayoutParams();
        this.chartWidth = layoutParams.chartWidth;
        //销售不展示团队的数据统计
        let hideTeamChart = userData.hasRole(userData.ROLE_CONSTANS.SALES) || this.props.currShowSalesman;
        return (
            <div className="oplate_user_analysis">
                <div ref="chart_list" style={{height: layoutParams.chartListHeight}}>
                    <GeminiScrollbar enabled={this.props.scrollbarEnabled}>
                        <div className="chart_list">
                            {this.state.timeType != "day" ? (
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.user.add", "用户-新增")}>
                                    <div className="chart-holder" ref="chartWidthDom" data-tracename="用户-新增统计">
                                        <div className="title">{Intl.get("user.analysis.user.add", "用户-新增")}</div>
                                        {this.getUserChart()}
                                    </div>
                                </div>) : null}
                            <div className="analysis_chart col-md-6 col-sm-12"
                                 data-title={Intl.get("user.analysis.location.add", "地域-新增")}>
                                <div className="chart-holder" data-tracename="地域-新增统计">
                                    <div className="title">{Intl.get("user.analysis.location.add", "地域-新增")}</div>
                                    {this.getZoneChart()}
                                </div>
                            </div>
                            <div className="analysis_chart col-md-6 col-sm-12"
                                 data-title={Intl.get("user.analysis.industry.add", "行业-新增")}>
                                <div className="chart-holder" data-tracename="行业-新增统计">
                                    <div className="title">{Intl.get("user.analysis.industry.add", "行业-新增")}</div>
                                    {this.getIndustryChart()}
                                </div>
                            </div>
                            {hideTeamChart ? null : (
                                <div className="analysis_chart col-md-6 col-sm-12"
                                     data-title={Intl.get("user.analysis.team.add","团队-新增")}>
                                    <div className="chart-holder" data-tracename="团队-新增统计">
                                        <div className="title">{Intl.get("user.analysis.team.add", "团队-新增")}</div>
                                        {this.getTeamChart()}
                                    </div>
                                </div>)}
                        </div>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});
//返回react对象
module.exports = UserAnlyis;