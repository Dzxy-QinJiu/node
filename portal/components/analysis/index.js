/**
 * 分析组件
 */
require("./style.less");
import LineChart from "../chart/line";
import BarChart from "../chart/bar";
import PieChart from "../chart/pie";
import { AntcBarPieChart, AntcHorizontalStageChart } from "antc";
import Retention from "../chart/retention";
import Funnel from  "../chart/funnel";
import Box from "../chart/box";
import SigningStatistics from "../chart/signing-statistics";
import routeList from "../../modules/common/route";
import ajax from "../../modules/common/ajax";
const Emitters = require("../../public/sources/utils/emitters");
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const appSelectorEmitter = Emitters.appSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;
const DateSelectorUtils = require("../datepicker/utils");
import { getEndDateText } from "./utils";
import { TIME_RANGE, USER_TYPE_LEGEND } from "./consts";
var Spinner = require("../spinner");

//图表类型映射关系
const CHART_TYPE_MAP = {
    box: Box,
    bar: BarChart,
    line: LineChart,
    pie: PieChart,
    bar_pie: AntcBarPieChart,
    retention: Retention,
    funnel: Funnel,
    signingStatistics: SigningStatistics,
    horizontalStage: AntcHorizontalStageChart,
};

const Analysis = React.createClass({
    getDefaultProps() {
        return {
            type: "total",
            valueField: "value",
            sendRequest: true,
            reverseChart: false,
            errAndRightBothShow:false,//出错后的提示和正确时的展示同时显示出来
            notShowLoading:false//不展示loading效果
        };
    },
    getInitialState() {
        const funcName = "get" + TIME_RANGE + "Time";
        //时间对象
        const timeObj = DateSelectorUtils[funcName](true);
        //开始时间
        const startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
        //结束时间
        const endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
        const endDate = getEndDateText();
        return {
            chartData: [],
            app_id: "",
            team_id: "",
            starttime: startTime,
            endtime: endTime,
            resultType: "loading",
            endDate: endDate
        };
    },
    componentWillMount() {
        if (this.props.chartData) return;

        appSelectorEmitter.on(appSelectorEmitter.SELECT_APP, this.onAppChange);
        dateSelectorEmitter.on(dateSelectorEmitter.SELECT_DATE, this.onDateChange);
        teamTreeEmitter.on(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.on(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    },
    componentDidMount() {
        if (this.props.isGetDataOnMount) {
            this.getData();
        }
    },
    componentWillReceiveProps(nextProps) {
        const sendRequest = _.isBoolean(nextProps.sendRequest) ? nextProps.sendRequest: this.props.sendRequest;
        if (
            (nextProps.type != this.props.type && sendRequest)
            ||
            nextProps.startTime !== this.props.startTime
            ||
            nextProps.endTime !== this.props.endTime
        ) {
            this.getData(nextProps);
        }
    },
    componentWillUnmount() {
        appSelectorEmitter.removeListener(appSelectorEmitter.SELECT_APP, this.onAppChange);
        dateSelectorEmitter.removeListener(dateSelectorEmitter.SELECT_DATE, this.onDateChange);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    },
    onAppChange(app_id) {
        this.setState({app_id}, () => {
            this.getData();
        });

        if (app_id.indexOf(",") > -1) app_id = "all";

        localStorage[this.props.localStorageAppIdKey] = app_id;
    },
    onDateChange(starttime, endtime) {
        this.setState({starttime, endtime}, () => {
            this.getData();
        });
    },
    onTeamChange(team_id) {
        this.setState({team_id: team_id, member_id: ""}, () => {
            this.getData();
        });
    },
    onMemberChange(member_id) {
        this.setState({member_id: member_id, team_id: ""}, () => {
            this.getData();
        });
    },
    retryGetData(){
       this.getData();
    },
    getData(props = this.props) {

        this.setState({resultType: "loading"});
        if (_.isFunction(props.processData)){
            props.processData([],"loading");
        }

        const handler = props.handler || ("get" + props.target + "AnalysisData");

        const route = _.find(routeList, item => item.handler === handler);

        let startTime = props.startTime || this.state.starttime;
        let endTime = props.endTime || this.state.endtime;
        const minStartTime = props.minStartTime;
        //选择全部时间时，若指定了最小开始时间，则开始时间设为最新开始时间
        if (minStartTime && !startTime) {
            startTime = minStartTime
        }

        const arg = {
            url: route.path,
            params: {
                type: props.type === "app_id"? this.state.app_id : props.type,
                property: props.property ? props.property : '_null',
            },
            query: {
                starttime: startTime,
                endtime: endTime,
            },
        };

        const storedAppId = localStorage[props.localStorageAppIdKey];
        const appId = this.props.appId || this.state.app_id || storedAppId;
        
        if (appId) {
            arg.query.app_id = appId;
        }
        
        if (this.state.team_id) {
            arg.query.team_id = this.state.team_id;
        }
        
        if (this.state.member_id) {
            arg.query.member_id = this.state.member_id;
        }

        //用户总体活跃数分析接口所需的开始结束时间字段名和其他接口不一样，需要特别处理一下
        if (props.property === "logined_user=active=daily") {
            arg.query.start_time = arg.query.starttime;
            arg.query.end_time = arg.query.endtime;
            delete arg.query.starttime;
            delete arg.query.endtime;
        }

        if (props.query) _.extend(arg.query, props.query);

        //试用用户留存需根据查询时间段确定统计区间是天、周还是月
        if (props.type === "trial" && props.property === "retention") {
            const diffDay = moment(+arg.query.endtime).diff(moment(+arg.query.starttime), "day");

            if (diffDay < 7) {
                arg.query.interval = "daily";
            } else if (diffDay >= 7 && diffDay < 31) {
                arg.query.interval = "weekly";
            } else {
                arg.query.interval = "monthly";
            }
        }

        ajax(arg).then(result => {
            if (_.isFunction(props.processData)){
                result = props.processData(result,"");
            }
            this.setState({ chartData: result, resultType: "",resultErrorMsg:""});
        }, errorMsg => {
            if (_.isFunction(props.processData)){
                props.processData([], "error");
            }
            this.setState({chartData: [], resultType: "error",resultErrorMsg: errorMsg || Intl.get("contract.111", "获取数据失败")});
        });
    },
    //加载完毕后，并且没有出错时
    renderAfterLoadingAndNoErr(chartType, props){
        const dataField = this.props.dataField;
        const dataField2 = this.props.dataField2;
        var initialChartData = this.props.chartData || this.state.chartData;
        let chartData = dataField !== undefined ? initialChartData[dataField] : initialChartData;
        if (chartData && dataField2 !== undefined) chartData = chartData[dataField2];
        if (_.isEmpty(chartData)) {
            return <div className='nodata'>
                {Intl.get("common.no.data", "暂无数据")}
                </div>
        } else {
            return React.createElement(chartType, props, null);
        }
    },
    renderChartContent(chartType, props){
        if (this.state.resultType === "loading"){
            //如果不需要加loading效果
            if (this.props.notShowLoading){
                return React.createElement(chartType, props, null);
            }else{
                return (
                    <div className="loading-wrap">
                        <Spinner/>
                    </div>
                )
            }
        }else if(this.state.resultType === "error") {
            //加载完成，出错的情况
            var errMsg = <div className="err-tip">{this.state.resultErrorMsg}
                <a onClick={this.retryGetData}>
                  {Intl.get("user.info.retry", "请重试")}
               </a>
               </div>;
            if (this.props.errAndRightBothShow) {
                return (
                    <div className="err-tip-content-wrap">
                        {errMsg}
                        {React.createElement(chartType, props, null)}
                    </div>
                )
            } else {
                return (
                    <div className="err-tip-wrap">
                        {errMsg}
                    </div>
                )
            }
        }else{
            return (
                <div style={{height: "100%"}}>
                    {this.renderAfterLoadingAndNoErr(chartType, props)}
                </div>
            );
        }
    },
    render() {
        const props = {
            title: this.props.title || "",
            chartData: this.props.chartData || this.state.chartData,
            app_id: this.state.app_id,
            endDate: this.state.endDate,
            startTime: this.props.startTime || this.state.starttime,
            endTime: this.props.endTime || this.state.endtime,
            resultType: this.state.resultType,
            reverseChart:this.props.reverseChart
        };

        if (this.props.presetLegend === "userType") {
            props.legend = USER_TYPE_LEGEND;
        }

        _.extend(props, this.props);
        if (props.extendLegend) props.legend = props.legend.concat(props.extendLegend);

        if (props.chartHeight) {
            props.height = props.chartHeight;
        }

        const chartType = CHART_TYPE_MAP[props.chartType];
        return (
                <div style={{height:this.props.height}} className="analysis-container">
                    {this.renderChartContent(chartType, props)}
                </div>
        )
    }
});

export default Analysis;
