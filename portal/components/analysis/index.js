/**
 * 分析组件
 */

import LineChart from '../chart/line';
import BarChart from '../chart/bar';
import Box from '../chart/box';
import SigningStatistics from '../chart/signing-statistics';
import ContractStatistics from '../chart/contract-statistics';
import routeList from '../../modules/common/route';
import ajax from '../../modules/common/ajax';
const Emitters = require('../../public/sources/utils/emitters');
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const appSelectorEmitter = Emitters.appSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;

const DateSelectorUtils = require('../datepicker/utils');
import { getEndDateText } from './utils';
import { TIME_RANGE, USER_TYPE_LEGEND } from './consts';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import * as exportUtil from './export-data-util';
import { capitalizeFirstLetter } from 'LIB_DIR/func';
import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
import { PropTypes } from 'prop-types';

//图表类型映射关系
const CHART_TYPE_MAP = {
    box: Box,
    bar: BarChart,
    line: LineChart,
    signingStatistics: SigningStatistics,
    contractStatistics: ContractStatistics // 合同分析统计表
};

class Analysis extends React.Component {
    static defaultProps = {
        type: 'total',
        valueField: 'value',
        sendRequest: true,
        reverseChart: false
    };

    constructor(props) {
        super(props);
        const funcName = 'get' + TIME_RANGE + 'Time';
        //时间对象
        const timeObj = DateSelectorUtils[funcName](true);
        //开始时间
        const startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
        //结束时间
        const endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
        const endDate = getEndDateText();

        this.state = {
            chartData: [],
            app_id: '',
            team_id: '',
            starttime: startTime,
            endtime: endTime,
            resultType: '',
            endDate: endDate
        };
    }

    componentWillMount() {
        if (this.props.chartData) return;

        appSelectorEmitter.on('appselector.select_app', this.onAppChange);
        dateSelectorEmitter.on(dateSelectorEmitter.SELECT_DATE, this.onDateChange);
        teamTreeEmitter.on(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.on(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    }

    componentDidMount() {
        if (this.props.isGetDataOnMount) {
            this.getData();
        }
    }

    componentWillReceiveProps(nextProps) {
        const sendRequest = _.isBoolean(nextProps.sendRequest) ? nextProps.sendRequest : this.props.sendRequest;
        if (nextProps.type !== this.props.type && sendRequest) {
            this.getData(nextProps);
        }
    }

    componentWillUnmount() {
        appSelectorEmitter.removeListener('appselector.select_app', this.onAppChange);
        dateSelectorEmitter.removeListener(dateSelectorEmitter.SELECT_DATE, this.onDateChange);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    }

    onAppChange = (data) => {
        let { app_id } = data;
        this.setState({app_id}, () => {
            this.getData();
        });

        if (app_id.indexOf(',') > -1) app_id = 'all';

        local.set(this.props.localStorageAppIdKey, app_id);
    };

    onDateChange = (starttime, endtime) => {
        this.setState({starttime, endtime}, () => {
            this.getData();
        });
    };

    onTeamChange = (team_id) => {
        this.setState({team_id: team_id, member_id: ''}, () => {
            this.getData();
        });
    };

    onMemberChange = (member_id) => {
        this.setState({member_id: member_id, team_id: ''}, () => {
            this.getData();
        });
    };

    getAnalysisDataType = () => {
        let authtype = 'common';//USER_ANALYSIS_COMMON
        if (hasPrivilege('USER_ANALYSIS_MANAGER')) {
            authtype = 'manager';
        }
        return authtype;
    };

    getData = (props = this.props) => {

        this.setState({ resultType: 'loading' });

        const handler = 'get' + props.target + 'AnalysisData'; // 对应的方法

        const route = _.find(routeList, item => item.handler === handler);

        let startTime = props.startTime || this.state.starttime;
        let endTime = props.endTime || this.state.endtime;
        const minStartTime = props.minStartTime;
        //选择全部时间时，若指定了最小开始时间，则开始时间设为最新开始时间
        if (minStartTime && !startTime) {
            startTime = minStartTime;
        }

        const arg = {
            url: route.path, // 对应route中url
            params: {
                type: props.type === 'app_id' ? this.state.app_id : props.type,
                property: props.property ? props.property : '_null',
            },
            // 当选全部时间时，接口要求starttime：0，endtime：当前时间戳
            query: {
                starttime: startTime || 0,
                endtime: endTime || new Date().getTime(),
            },
        };

        const storedAppId = local.get(props.localStorageAppIdKey);
        const appId = this.state.app_id || this.props.appId || storedAppId;
        if (appId) {
            arg.query.app_id = appId;
        }
        
        if (this.state.team_id) {
            arg.query.team_id = this.state.team_id;
        }
        
        if (this.state.member_id) {
            arg.query.member_id = this.state.member_id;
        }

        // 用户地域分布和用户行业分布所需的接口，需要区分common（普通权限用户） manager（管理员权限）
        if (props.property === 'zone' || props.property === 'industry' || props.property === 'summary') {
            arg.params.authtype = this.getAnalysisDataType();
        }

        //用户总体活跃数分析接口所需的开始结束时间字段名和其他接口不一样，需要特别处理一下
        if (props.property === 'logined_user=active=daily') {
            arg.query.start_time = arg.query.starttime;
            arg.query.end_time = arg.query.endtime;
            delete arg.query.starttime;
            delete arg.query.endtime;
        }

        if (props.query) _.extend(arg.query, props.query);

        //试用用户留存需根据查询时间段确定统计区间是天、周还是月
        if (props.type === 'trial' && props.property === 'retention') {
            const diffDay = moment(+arg.query.endtime).diff(moment(+arg.query.starttime), 'day');

            if (diffDay < 7) {
                arg.query.interval = 'daily';
            } else if (diffDay >= 7 && diffDay < 31) {
                arg.query.interval = 'weekly';
            } else {
                arg.query.interval = 'monthly';
            }
        }

        ajax(arg).then(result => {
            if (_.isFunction(props.processData)){
                result = props.processData(result);
            }

            this.setState({ chartData: result, resultType: '' });
        }, errorMsg => {
            this.setState({ resultType: 'error' });
        });
    };

    getProcessedData = () => {
        let processedData = this.state.chartData;
        let chartType = this.props.chartType;
        chartType = capitalizeFirstLetter(chartType);
        const funcName = 'handle' + chartType + 'ChartData';
        const valueField = this.props.valueField || 'value';
        const column = this.props.column;

        if (column) {
            processedData = exportUtil.handleTableData(processedData, column);
        } else {
            processedData = exportUtil[funcName](processedData, valueField);
        }

        return processedData;
    };

    render() {
        const props = {
            title: this.props.title || Intl.get('app_operation.31', '统计'),
            chartData: this.props.chartData || this.state.chartData,
            app_id: this.state.app_id,
            endDate: this.state.endDate,
            startTime: this.props.startTime || this.state.starttime,
            endTime: this.props.endTime || this.state.endtime,
            resultType: this.state.resultType,
            reverseChart: this.props.reverseChart,
        };

        if (this.props.presetLegend === 'userType') {
            props.legend = USER_TYPE_LEGEND;
        }

        _.extend(props, this.props);
        if (props.extendLegend) props.legend = props.legend.concat(props.extendLegend);

        const chartType = CHART_TYPE_MAP[props.chartType];

        return React.createElement(chartType, props, null);
    }
}
Analysis.propTypes = {
    chartData: PropTypes.array,
    isGetDataOnMount: PropTypes.bool,
    sendRequest: PropTypes.bool,
    type: PropTypes.string,
    localStorageAppIdKey: PropTypes.string,
    appId: PropTypes.string,
    chartType: PropTypes.string,
    valueField: PropTypes.string,
    column: PropTypes.array,
    title: PropTypes.string,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    reverseChart: PropTypes.bool,
    presetLegend: PropTypes.string,
};
export default Analysis;
