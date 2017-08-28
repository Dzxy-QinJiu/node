/**
 * 分析组件
 */

import LineChart from "../chart/line";
import BarChart from "../chart/bar";
import PieChart from "../chart/pie";
import Retention from "../chart/retention";
import Funnel from  "../chart/funnel";
import Box from "../chart/box";
import routeList from "../../modules/common/route";
import ajax from "../../modules/common/ajax";
const Emitters = require("../../public/sources/utils/emitters");
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const appSelectorEmitter = Emitters.appSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;
const DateSelectorUtils = require("../datepicker/utils");
import { getEndDateText } from "./utils";
import { TIME_RANGE, USER_TYPE_LEGEND } from "./consts";

//图表类型映射关系
const CHART_TYPE_MAP = {
    box: Box,
    bar: BarChart,
    line: LineChart,
    pie: PieChart,
    retention: Retention,
    funnel: Funnel
};

const Analysis = React.createClass({
    getDefaultProps() {
        return {
            type: "total",
            valueField: "value",
            sendRequest: true,
            reverseChart: false
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
            resultType: "",
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
        if (nextProps.type != this.props.type && sendRequest) {
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
    getData(props = this.props) {

        this.setState({ resultType: "loading" });

        const handler = "get" + props.target + "AnalysisData";

        const route = _.find(routeList, route => route.handler === handler);

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
        const appId = this.state.app_id || storedAppId;
        
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
                result = props.processData(result);
            }

            this.setState({ chartData: result, resultType: "" });
        }, errorMsg => {
            this.setState({ resultType: "error" });
        });
    },
    render() {
        const props = {
            title: this.props.title || Intl.get("app_operation.31", "统计"),
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

        const chartType = CHART_TYPE_MAP[props.chartType];

        return React.createElement(chartType, props, null);
    }
});

export default Analysis;
