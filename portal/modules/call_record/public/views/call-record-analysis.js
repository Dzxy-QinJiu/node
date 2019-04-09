/**
 *  显示团队、成员筛选框的判断条件， 114占比显示饼图还是柱状图
 *
 *  this.state.teamList.length === 0 时，是普通销售，不显示筛选框，114展示为饼图
 *  this.state.teamList.length === 1 时，是销售基层领导，只有一个团队，显示成员，114柱状图
 *  this.state.teamList.length > 1 时， 有两个以上的团队，显示团队和成员的筛选框，114柱状图
 * */

var React = require('react');
import {Select, Radio, Alert, Switch, Checkbox,Icon} from 'antd';
const Option = Select.Option;
const RadioGroup = Radio.Group;
var RightContent = require('CMP_DIR/privilege/right-content');
var TableUtil = require('CMP_DIR/antd-table-pagination');
var TopNav = require('CMP_DIR/top-nav');
import { AntcDatePicker as DatePicker } from 'antc';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import CallAnalysisAction from '../action/call-analysis-action';
import CallAnalysisStore from '../store/call-analysis-store';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import Trace from 'LIB_DIR/trace';
import {AntcTable, AntcCardContainer} from 'antc';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {CALL_TYPE_OPTION} from 'PUB_DIR/sources/utils/consts';
import {handleTableData} from 'CMP_DIR/analysis/export-data-util';
import {MAP_PROVINCE} from 'LIB_DIR/consts';
import {AntcAnalysis} from 'antc';
var hours = _.range(24);
var days = [Intl.get('user.time.sunday', '周日'), Intl.get('user.time.monday', '周一'), Intl.get('user.time.tuesday', '周二'), Intl.get('user.time.wednesday', '周三'), Intl.get('user.time.thursday', '周四'), Intl.get('user.time.friday', '周五'), Intl.get('user.time.saturday', '周六')];
import timeUtil from 'PUB_DIR/sources/utils/time-format-util';
import {getResultType, getErrorTipAndRetryFunction,isOrganizationEefung, isOrganizationCiviw} from 'PUB_DIR/sources/utils/common-method-util';
import {getCallSystemConfig} from 'PUB_DIR/sources/utils/common-data-util';
//地图的formatter
function mapFormatter(obj) {
    let name = Intl.get('oplate_bd_analysis_realm_zone.2', '市区');
    if (MAP_PROVINCE[obj.name]) {
        name = Intl.get('oplate_bd_analysis_realm_zone.1', '省份');
    }
    //todo 该处待修改
    if (isNaN(obj.value) || obj.value === 0){
        return [
            Intl.get('oplate_bd_analysis_realm_industry.6', '个数') + '：' + 0
        ].join('<br/>');
    }else{
        return [
            name + '：' + obj.name,
            Intl.get('oplate_bd_analysis_realm_industry.6', '个数') + '：' + (isNaN(obj.value) ? 0 : obj.value)
        ].join('<br/>');
    }

}
// 用于布局趋势图的宽度
const LAYOUT_WIDTH = {
    ORIGIN_WIDTH: 135,
    RESIZE_WIDTH: 60
};
//用于布局趋势图的高度
const LAYOUT_HEIGHT = {
    ORIGIN_HEIGHT: 100,
    RESIZE_HEIGHT: 300
};

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 65,
    BOTTOM_DISTANCE: 70
};
//图表的高度
const CHART_LAYOUT_HEIGHT = {
    INITIAL_HEIGHT: 350,
    LARGER_HEIGHT: 410,
    MAP_HEIGHT: 600
};

const LITERAL_CONSTANT = {
    ALL: Intl.get('common.all', '全部'),
    TEAM: Intl.get('user.user.team', '团队'),
    MEMBER: Intl.get('member.member', '成员')
};
//通话时长和数量的单选按钮值
const CALL_RADIO_VALUES = {
    COUNT: 'count',//通话数量
    DURATION: 'duration'//通话时长
};
//通话时长描述
const TOOLTIPDESCRIPTION = {
    TIME: Intl.get('common.login.time', '时间'),
    DURATION: Intl.get('call.record.call.duration', '通话时长'),
    TEAMNAME: Intl.get('sales.team.team.name', '团队名称'),
    COUNT: Intl.get('sales.home.call.cout', '通话数量')
};

// 趋势图，统计的是近一个月的通话时长和通话数量
const TREND_TIME = 30 * 24 * 60 * 60 * 1000;

const FIRSR_SELECT_DATA = [LITERAL_CONSTANT.TEAM, LITERAL_CONSTANT.MEMBER];



class CallRecordAnalyis extends React.Component {
    constructor(props) {
        super(props);
        CallAnalysisAction.resetState();
        let callStateData = CallAnalysisStore.getState();
        let trendWidth = $(window).width() - LAYOUT_WIDTH.ORIGIN_WIDTH;

        this.state = {
            ...callStateData,
            callType: CALL_TYPE_OPTION.ALL, // 通话类型
            selectRadioValue: CALL_RADIO_VALUES.COUNT, // 通话趋势图中，时长和数量切换的Radio
            selectedCallInterval: CALL_RADIO_VALUES.COUNT,//通话时段点图中，时长和数量切换的Radio
            trendWidth: trendWidth, // 趋势图的宽度
            trendHeight: LAYOUT_HEIGHT.ORIGIN_HEIGHT,
            firstSelectValue: FIRSR_SELECT_DATA[0], // 第一个选择框的值
            secondSelectValue: LITERAL_CONSTANT.ALL, // 第二个选择宽的值，默认是全部的状态
            switchStatus: false,//是否查看各团队通话趋势图
            filter_phone: false,//是否过滤掉114,
            isShowEffectiveTimeAndCount: false, // 是否展示有效通话时长和有效接通数
        };
    }

    onStoreChange = () => {
        this.setState(CallAnalysisStore.getState());
    };

    // 获取销售团队和成员数据
    getTeamMemberData = () => {
        let reqData = commonMethodUtil.getParamByPrivilege();
        CallAnalysisAction.getSaleGroupTeams(reqData);
        CallAnalysisAction.getSaleMemberList(reqData);
    };

    // 获取订单阶段
    getSalesStageList = () => {
        CallAnalysisAction.getSalesStageList();
    };

    componentDidMount() {
        CallAnalysisStore.listen(this.onStoreChange);
        this.getSalesStageList(); // 获取订单阶段
        this.getTeamMemberData(); //获取销售团队和成员数据
        this.refreshCallAnalysisData(); // 获取趋势图、接通率、TOP10和114占比的数据
        this.getCallSystemConfig(); // 获取组织电话系统配置
        $(window).resize(() => {
            this.setState({
                trendWidth: $('.call-analysis-content').width() - LAYOUT_WIDTH.RESIZE_WIDTH
            });
        });
        TableUtil.zoomInSortArea(this.refs.phoneList);
        TableUtil.alignTheadTbody(this.refs.phoneList);
    }

    // 获取组织电话系统配置
    getCallSystemConfig = () => {
        getCallSystemConfig().then(config => {
            let isShowEffectiveTimeAndCount = _.get(config,'filter_114',false) || _.get(config,'filter_customerservice_number',false);
            this.setState({ isShowEffectiveTimeAndCount });
        });
    };

    // 获取团队或成员的参数
    getTeamMemberParam = (hasReturnType) => {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list; // 成员数据
        let secondSelectValue = this.state.secondSelectValue;
        let params = {};
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && this.state.teamList.list.length > 1) { // 团队时
            if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体团队时
                params.sales_team_id = secondSelectValue.join(',');
            }
        } else { // 成员时
            if (this.state.secondSelectValue === LITERAL_CONSTANT.ALL) { // 全部时
                //如果参数中可以传return_type，就直接传user
                if (hasReturnType) {
                    params.return_type = 'user';
                } else {//参数中没有return_type的，需要把所有的user_id传过去
                    let userIdArray = _.map(this.state.memberList.list, 'id');
                    params.user_id = userIdArray.join(',');
                }
            } else if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体成员时
                params.user_id = secondSelectValue.join(','); // 成员
            }
        }
        return params;
    };

    // post方式，body中的参数
    getCallAnalysisBodyParam = (params) => {
        let reqBody = {};
        if (this.state.teamList.list.length) {
            reqBody = this.getTeamMemberParam();
        }
        if (params) {
            if (params.deviceType && params.deviceType !== 'all') {
                reqBody.deviceType = params && params.deviceType || this.state.callType;
            }
        }
        return reqBody;
    };

    // 通话分析的趋势图
    getCallAnalysisTrendData = (reqBody) => {
        var nowTime = new Date().getTime();
        // 通话数量和通话时长的时间参数，统计近一个月(今天往前推30天)的统计
        let trendParams = {
            start_time: (nowTime - TREND_TIME),
            end_time: nowTime
        };
        // 获取通话数量和通话时长的趋势图数据
        CallAnalysisAction.getCallCountAndDur(trendParams, reqBody);
    };

    setChartContainerHeight = () => {
        //如果选择全部团队或者团队选择的个数大于4个时，把容器的高度撑高
        if ((this.state.secondSelectValue === LITERAL_CONSTANT.ALL && this.state.switchStatus) || (_.isArray(this.state.secondSelectValue) && this.state.secondSelectValue.length > 4)) {
            this.setState({
                trendHeight: LAYOUT_HEIGHT.RESIZE_HEIGHT
            });
        } else {
            this.setState({
                trendHeight: LAYOUT_HEIGHT.ORIGIN_HEIGHT
            });
        }
    };

    //点击切换查看各团队通话趋势图
    handleSwitchChange = (checked) => {
        this.setState({
            switchStatus: checked
        }, () => {
            if (checked) {
                this.setChartContainerHeight();
            }
        });
        if (checked) {
            var reqBody = this.getCallAnalysisBodyParamSeparately();
            this.getCallAnalysisTrendDataSeparately(reqBody);
            Trace.traceEvent('通话分析', '点击开启查看各团队通话趋势图的switch');
        } else {
            this.setState({
                trendHeight: LAYOUT_HEIGHT.ORIGIN_HEIGHT
            });
            let reqBody = this.getCallAnalysisBodyParam();
            this.getCallAnalysisTrendData(reqBody); // 所有团队总趋势图
            Trace.traceEvent('通话分析', '点击关闭查看各团队通话趋势图的switch');
        }
    };

    // 获取团队参数
    getTeamParamSeparately = () => {
        let teamList = this.state.teamList.list; // 团队数据
        let secondSelectValue = this.state.secondSelectValue;
        let params = {};
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && this.state.teamList.list.length > 1) { // 团队时
            if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体团队时
                params.sales_team_id = secondSelectValue.join(',');
            } else {
                params.sales_team_id = _.map(teamList, 'id').join(',');
            }
        }
        return params;
    };

    getCallAnalysisBodyParamSeparately = (params) => {
        let reqBody = {};
        if (this.state.teamList.list.length) {
            reqBody = this.getTeamParamSeparately();
        }
        if (params) {
            if (params.deviceType && params.deviceType !== 'all') {
                reqBody.deviceType = params && params.deviceType || this.state.callType;
            }
        }
        return reqBody;
    };

    //分别获取每个团队的趋势图
    getCallAnalysisTrendDataSeparately = (reqBody) => {
        var nowTime = new Date().getTime();
        // 通话数量和通话时长的时间参数，统计近一个月(今天往前推30天)的统计
        let trendParams = {
            start_time: (nowTime - TREND_TIME),
            end_time: nowTime
        };
        // 获取通话数量和通话时长的趋势图数据
        CallAnalysisAction.getCallCountAndDurSeparately(trendParams, reqBody);
    };

    // 通话的接通率
    getCallInfoData = (params) => {
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            deviceType: params && params.deviceType || this.state.callType,
            filter_phone: this.state.filter_phone,//是否过滤114
        };
        let pathParam = commonMethodUtil.getParamByPrivilege();
        if (this.state.teamList.list.length) { // 有团队时（普通销售时没有团队的）
            let teamMemberParam = this.getTeamMemberParam(true);
            if (teamMemberParam) {
                if (teamMemberParam.sales_team_id) {
                    queryParams.team_ids = teamMemberParam.sales_team_id;
                } else if (teamMemberParam.user_id) {
                    queryParams.member_ids = teamMemberParam.user_id;
                } else if (teamMemberParam.return_type) {
                    queryParams.return_type = teamMemberParam.return_type;
                }
            }
        }
        let type = this.getCallInfoAuth();
        CallAnalysisAction.getCallInfo(pathParam, queryParams, type);
    };

    // TOP10
    getCallDurTopTen = (reqBody) => {
        // 通话时长TOP10的列表
        var topParam = {
            start_time: this.state.start_time || moment('2010-01-01 00:00:00').valueOf(),
            end_time: this.state.end_time || moment().endOf('day').valueOf(),
            page_size: 10,
            sort_field: 'billsec',
            sort_order: 'descend'
        };
        CallAnalysisAction.getCallDurTopTen(topParam, reqBody);// 单次通话时长TOP10
    };

    // 114占比，与时间、所选团队和成员有关系
    getCallRate = (reqBody) => {
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime()
        };
        CallAnalysisAction.getCallRate(queryParams, reqBody);
    };

    // 获取趋势图、接通率、TOP10和114占比的数据
    refreshCallAnalysisData = (params) => {
        let reqBody = this.getCallAnalysisBodyParam(params);
        //如果展示的是每个团队的趋势图，则不需要所有团队的通话时长和数量
        if (!(this.state.switchStatus)) {
            this.getCallAnalysisTrendData(reqBody); // 所有团队总趋势图
        }
        this.getCallInfoData(params); // 接通率
        //获取单次通话时长TOP10的统计数据
        this.getCallDurTopTen(reqBody);
        this.getCallRate({...reqBody, filter_phone: 'false'}); // 114占比
        this.getCallRate({...reqBody, filter_invalid_phone: 'false'}); //客服电话统计
        //获取通话时段（数量和时长）、总次数、总时长的统计数据
        this.getCallIntervalTotalData(reqBody);
        // 获取通话客户的地域和阶段分布
        this.getCallCustomerZoneStage(reqBody);
    };

    //获取通话时段（数量和时长）的参数
    getCallIntervalParams = (params) => {
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            type: params && params.type || this.state.callType,
            filter_phone: false,// 是否过滤114电话号码
            filter_invalid_phone: false//是否过滤客服电话号码
        };
        if (params.sales_team_id) {
            queryParams.team_id = params.sales_team_id;
        } else if (params.user_id) {
            queryParams.member_id = params.user_id;
        }
        return queryParams;
    };

    getCallInfoAuth = () => {
        let authType = 'user';//CUSTOMER_CALLRECORD_STATISTIC_USER
        if (hasPrivilege('CUSTOMER_CALLRECORD_STATISTIC_MANAGER')) {
            authType = 'manager';
        }
        return authType;
    };

    //通话总次数和总时长统计权限
    getCallTotalAuth = () => {
        let authType = 'user';//CALLRECORD_CUSTOMER_PHONE_STATISTIC_USER
        if (hasPrivilege('CALLRECORD_CUSTOMER_PHONE_STATISTIC_MANAGER')) {
            authType = 'manager';
        }
        return authType;
    };

    //获取通话时段、总次数、总时长的统计数据
    getCallIntervalTotalData = (params) => {
        let queryParams = this.getCallIntervalParams(params);
        let authType = this.getCallInfoAuth();
        CallAnalysisAction.getCallIntervalData(authType, queryParams);
        let callTotalAuth = this.getCallTotalAuth();

        //通话总次数、总时长TOP10统计的请求参数和其他统计的略有不同，team_id需要改成team_ids，member_id需要改成member_ids
        let totalListQueryParams = _.cloneDeep(queryParams);
        totalListQueryParams.team_ids = totalListQueryParams.team_id;
        delete totalListQueryParams.team_id;
        totalListQueryParams.member_ids = totalListQueryParams.member_id;
        delete totalListQueryParams.member_id;

        CallAnalysisAction.getCallTotalList(callTotalAuth, totalListQueryParams);//通话总次数、总时长TOP10
    };

    // 通话客户的地域和阶段分布参数
    getZoneStageParams = (params) => {
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            device_type: params && params.type || this.state.callType,
            filter_phone: false,// 是否过滤114电话号码
            filter_invalid_phone: false//是否过滤客服电话号码
        };
        if (params.sales_team_id) {
            queryParams.team_ids = params.sales_team_id;
        } else if (params.user_id) {
            queryParams.member_ids = params.user_id;
        }
        return queryParams;
    };

    // 获取通话客户的地域和阶段分布权限
    getCallCustomerZoneStageAuth = () => {
        let authType = 'self';// CALL_RECORD_VIEW_USER
        if (hasPrivilege('CALL_RECORD_VIEW_MANAGER')) {
            authType = 'all';
        }
        return authType;
    };

    // 获取通话客户的地域和阶段分布
    getCallCustomerZoneStage = (params) => {
        let queryParams = this.getZoneStageParams(params);
        let authType = this.getCallCustomerZoneStageAuth();
        CallAnalysisAction.getCallCustomerZoneStage(authType, queryParams);
    };

    componentWillUnmount() {
        CallAnalysisStore.unlisten(this.onStoreChange);
    }

    //获取销售列的标题
    getSalesColumnTitle = () => {
        var label = Intl.get('sales.home.sales', '销售');
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && this.state.teamList.list.length > 1) {
            label = Intl.get('user.sales.team', '销售团队');
        }
        return label;
    };

    /**
     * 电话接通率的数据
     * @param isExport 是否是导出时调用的，导出时，时长都展示秒数
     */
    getPhoneListColumn = (isExport) => {
        let col_width = 95, num_col_width = 80, col_lg_width = 120;
        let columns = [{
            title: this.getSalesColumnTitle(),
            width: col_width,
            dataIndex: 'name',
            className: 'table-data-align-left',
            key: 'name'
        }, {
            title: Intl.get('sales.home.total.duration', '总时长'),
            width: col_width,
            dataIndex: 'totalTime',
            key: 'total_time',
            sorter: function(a, b) {
                return a.totalTime - b.totalTime;
            },
            className: 'has-filter table-data-align-right',
            render: function(text, record, index){
                return (
                    <span>
                        {TimeUtil.getFormatTime(text)}
                    </span>
                );
            }
        }, {
            title: Intl.get('sales.home.total.connected', '总接通数'),
            width: col_width,
            dataIndex: 'calloutSuccess',
            key: 'callout_success',
            sorter: function(a, b) {
                return a.calloutSuccess - b.calloutSuccess;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get('sales.home.average.duration', '日均时长'),
            width: col_width,
            dataIndex: 'averageTime',
            key: 'average_time',
            sorter: function(a, b) {
                return a.averageTime - b.averageTime;
            },
            className: 'has-filter table-data-align-right',
            render: function(text, record, index){
                return (
                    <span>
                        {TimeUtil.getFormatTime(text)}
                    </span>
                );
            }
        }, {
            title: Intl.get('sales.home.average.connected', '日均接通数'),
            width: col_lg_width,
            dataIndex: 'averageAnswer',
            key: 'average_answer',
            sorter: function(a, b) {
                return a.averageAnswer - b.averageAnswer;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get('sales.home.phone.callin', '呼入次数'),
            width: col_width,
            dataIndex: 'callinCount',
            key: 'callin_count',
            sorter: function(a, b) {
                return a.callinCount - b.callinCount;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get('sales.home.phone.callin.success', '成功呼入'),
            width: col_width,
            dataIndex: 'callinSuccess',
            key: 'callin_success',
            sorter: function(a, b) {
                return a.callinSuccess - b.callinSuccess;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get('sales.home.phone.callin.rate', '呼入接通率'),
            width: col_lg_width,
            dataIndex: 'callinRate',
            key: 'callin_rate',
            sorter: function(a, b) {
                return a.callinRate - b.callinRate;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get('sales.home.phone.callout', '呼出次数'),
            width: col_width,
            dataIndex: 'calloutCount',
            key: 'callout_count',
            sorter: function(a, b) {
                return a.calloutCount - b.calloutCount;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get('sales.home.phone.callout.rate', '呼出接通率'),
            width: col_lg_width,
            dataIndex: 'calloutRate',
            key: 'callout_rate',
            sorter: function(a, b) {
                return a.calloutRate - b.calloutRate;
            },
            className: 'has-filter table-data-align-right'
        }];

        // 展示有效通话时长和有效接通数
        if( this.state.isShowEffectiveTimeAndCount ){
            columns.push({
                title: Intl.get('sales.home.phone.effective.connected', '有效接通数'),
                width: col_lg_width,
                dataIndex: 'effectiveCount',
                key: 'effective_count',
                sorter: function(a, b) {
                    return a.effectiveCount - b.effectiveCount;
                },
                className: 'has-filter table-data-align-right'
            },{
                title: Intl.get('sales.home.phone.effective.time', '有效通话时长'),
                width: col_lg_width,
                dataIndex: 'effectiveTime',
                key: 'effective_time',
                sorter: function(a, b) {
                    return a.effectiveTime - b.effectiveTime;
                },
                className: 'has-filter table-data-align-right',
                render: function(text, record, index){
                    return text === '-' ? text : (
                        <span>
                            {TimeUtil.getFormatTime(text)}
                        </span>
                    );
                }
            });
        }
        //当前展示的是客套类型的通话记录时，展示计费时长
        if (this.state.callType === CALL_TYPE_OPTION.APP) {
            columns.push({
                title: Intl.get('sales.home.phone.billing.time', '计费时长(分钟)'),
                dataIndex: 'billingTime',
                key: 'filling_time',
                width: '10%',
                sorter: function(a, b) {
                    return a.billingTime - b.billingTime;
                },
                className: 'has-filter table-data-align-right'
            });
        }

        //如果选中的是列表中展示的是团队名称时，才展示人均通话时长和通话数
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && this.state.secondSelectValue === LITERAL_CONSTANT.ALL) {
            columns.splice(3, 0, {
                title: Intl.get('call.record.average.call.duration', '人均时长'),
                width: col_width,
                align: 'right',
                dataIndex: 'personAverageTime',
                key: 'person_average_time',
                sorter: function(a, b) {
                    return a.personAverageTime - b.personAverageTime;
                },
                render: function(text, record, index){
                    return (
                        <span>
                            {TimeUtil.getFormatTime(text)}
                        </span>
                    );
                }
            }, {
                title: Intl.get('call.record.average.connected', '人均接通数'),
                width: col_lg_width,
                align: 'right',
                dataIndex: 'personAverageAnswer',
                key: 'person_average_answer',
                sorter: function(a, b) {
                    return a.personAverageAnswer - b.personAverageAnswer;
                },
            },);
        }

        return columns;
    };

    handleSelect = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.call-type-select'), '根据通话类型过滤');
    };

    // 通话类型的筛选框
    filterCallTypeSelect = () => {
        return (
            <div className="call-type-select btn-item">
                <SelectFullWidth
                    showSearch
                    value={this.state.callType}
                    onChange={this.selectCallTypeValue}
                    onSelect={this.handleSelect}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        {Intl.get('user.online.all.type', '全部类型')}
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        {Intl.get('call.record.call.center', '呼叫中心')}
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        {Intl.get('common.ketao.app', '客套APP')}
                    </Option>
                </SelectFullWidth>
            </div>
        );
    };

    // 选择通话类型的值
    selectCallTypeValue = (value) => {
        this.setState({
            callType: value
        }, () => {
            if (this.state.callType === CALL_TYPE_OPTION.ALL) {
                this.refreshCallAnalysisData();
            } else {
                this.refreshCallAnalysisData({deviceType: this.state.callType});
            }
        });
    };

    // 切换通话时长和数据，展示的趋势图
    handleSelectRadio = (event) => {
        if (event.target.value === CALL_RADIO_VALUES.COUNT) {
            Trace.traceEvent('通话分析', '点击通话趋势图中通话数量按钮');
            this.setState({
                selectRadioValue: CALL_RADIO_VALUES.COUNT
            });
        } else {
            Trace.traceEvent('通话分析', '点击趋势图中通话时长按钮');
            this.setState({
                selectRadioValue: CALL_RADIO_VALUES.DURATION
            });
        }
    };

    // 渲染通话数量和通话时长的趋势图
    renderCallTrendChart = () => {
        return (
            <div className="call-trend-container">
                <div className="call-trend-chart">
                    {this.state.switchStatus && this.state.firstSelectValue === LITERAL_CONSTANT.TEAM ?
                        <div>
                            {
                                this.state.selectRadioValue === CALL_RADIO_VALUES.COUNT ?
                                    // 通话数量
                                    this.renderCallChart(this.state.eachTeamCallList.list, this.countTooltip, true, CALL_RADIO_VALUES.COUNT) :
                                    // 通话时长
                                    this.renderCallChart(this.state.eachTeamCallList.list, this.durationTooltip, true, CALL_RADIO_VALUES.DURATION)
                            }
                        </div>
                        : (<div>
                            {
                                this.state.selectRadioValue === CALL_RADIO_VALUES.COUNT ?
                                    // 通话数量
                                    this.renderCallChart(this.state.callList.count, this.countTooltip) :
                                    // 通话时长
                                    this.renderCallChart(this.state.callList.count, this.durationTooltip)
                            }
                        </div>)}
                </div>
                <div className="duration-count-radio clearfix">
                    <RadioGroup onChange={this.handleSelectRadio} value={this.state.selectRadioValue}>
                        <Radio value="count">{Intl.get('sales.home.call.cout', '通话数量')}</Radio>
                        <Radio value="duration">{Intl.get('call.record.call.duration', '通话时长')}</Radio>
                    </RadioGroup>
                </div>
            </div>
        );
    };

    //切换通话时长和数量，展示的点图
    onChangeCallIntervalRadio = (event) => {
        if (event.target.value === CALL_RADIO_VALUES.COUNT) {
            Trace.traceEvent('通话分析', '点击通话时段点图中的通话数量按钮');
            this.setState({
                selectedCallInterval: CALL_RADIO_VALUES.COUNT
            });
        } else {
            Trace.traceEvent('通话分析', '点击通话时段点图中的通话时长按钮');
            this.setState({
                selectedCallInterval: CALL_RADIO_VALUES.DURATION
            });
        }
    };

    getCallCountAndRecordOptions = (data, dataName, dataType) => {
        var options = {
            tooltip: {
                formatter: function(obj) {
                    var weekdaysIndex = obj.seriesIndex;
                    var hour = obj.value[0];
                    var data = obj.value[1];
                    if (dataType === 'time') {
                        //时间格式的需要将秒数转成x小时x分x秒
                        let timeObj = timeUtil.secondsToHourMinuteSecond(data);
                        data = timeObj.timeDescr;
                    }
                    return `${days[weekdaysIndex]}${hour}${Intl.get('crm.75', '点')}
                         <br/>
                         ${dataName}：${data}`;
                }
            },
            singleAxis: [],
            title: [],
        };
        _.each(days, (label, idx) => {
            options.title.push({
                top: (idx + 0.5) * 100 / 10 + '%'
            });
            options.singleAxis.push({
                axisLabel: {
                    show: label === Intl.get('user.time.saturday', '周六') ? true : false,
                },
                top: (idx * 100 / 10 + 5) + '%',
                height: (100 / 10 - 10) + '%'
            });
        });
        return options;
    };

    // 渲染通话时段(时长/数量)的统计
    renderCallIntervalChart = () => {
        var isCallCount = this.state.selectedCallInterval === CALL_RADIO_VALUES.COUNT;
        let data = isCallCount ? this.state.callIntervalData.countList : this.state.callIntervalData.timeList;
        let title = isCallCount ? Intl.get('sales.home.call.cout', '通话数量') : Intl.get('call.record.call.duration', '通话时长');
        let dataType = isCallCount ? '' : 'time';
        //todo 把通话时长数据中的time属性改成count，现在组件默认属性值是count还不支持自定义
        if (!isCallCount) {
            _.each(data, (item) => {
                item.count = item.time;
            });
        }
        var recordCharts = [{
            title: Intl.get('call.record.interval', '通话时段统计'),
            chartType: 'scatter',
            data: data,
            layout: {
                sm: 24,
            },
            option: this.getCallCountAndRecordOptions(data, title, dataType),
            yAxisLabels: days,
            xAxisLabels: hours,
            noExportCsv: true,
            resultType: getResultType(this.state.callIntervalData.loading, this.state.callIntervalData.errMsg),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.callIntervalData.errMsg);
            }
        }];
        return (
            <AntcAnalysis
                charts={recordCharts}
                chartHeight={CHART_LAYOUT_HEIGHT.INITIAL_HEIGHT}
            />
        );
    };

    //近一个月的通话趋势的options
    getCallTrendEchartOptions = (dataList, charTips, isMutileLine, lineType) => {
        return {
            tooltip: {
                trigger: 'axis',
                // 图表中的提示数据信息
                formatter: (params) => {
                    var timeText, count, teamArr;
                    if (_.isArray(params)) {
                        if (params.length === 1) {
                            var params = params[0];
                            timeText = moment(params.name || Date.now()).format(oplateConsts.DATE_FORMAT);
                            count = params.data;
                        } else if (params.length > 1) {
                            timeText = [], count = [], teamArr = [];
                            _.each(params, (paramsItem) => {
                                timeText.push(moment(paramsItem.name || Date.now()).format(oplateConsts.DATE_FORMAT));
                                count.push(paramsItem.data || 0);
                                teamArr.push(paramsItem.seriesName);
                            });
                        }
                        return charTips(timeText, count, teamArr);
                    }
                }
            },
            legend: {
                data: this.getCallTrendLegendData(dataList, isMutileLine)
            },
            grid: {
                x: 50,
                y: 40,
                x2: 30,
                y2: 30,
                borderWidth: 0
            },
            xAxis: [
                {
                    splitLine: false,
                    splitArea: false,
                    axisLabel: {
                        formatter: () => { // 不显示x轴数值
                            return '';
                        }
                    },
                    axisTick: { // x轴不显示刻度
                        show: false
                    },
                    data: this.getCallTrendCategorys(dataList, isMutileLine, lineType),
                }
            ],
            yAxis: [
                {
                    splitLine: false,
                    splitArea: false,
                    axisLabel: {
                        formatter: () => { // 不显示y轴数值
                            return '';
                        }
                    },
                    axisTick: { // y轴不显示刻度
                        show: false
                    }
                }
            ],
            series: this.getCallTrendDataSerise(dataList, isMutileLine, lineType)
        };
    };

    getCallTrendCategorys = (dataList, isMutileLine, lineType) => {
        var data = [];
        var dataList = isMutileLine && dataList[0] ? dataList[0][lineType] : dataList;
        _.each(dataList, (item) => {
            data.push(new Date(item.timestamp));
        });
        return data;
    };

    getCallTrendLegendData = (dataList, isMutileLine) => {
        var data = [];
        if (isMutileLine) {
            data = _.map(dataList, 'teamName');
        }
        return data;
    };

    getCallTrendDataSerise = (dataList, isMutileLine, lineType) => {
        //共同的属性
        var commonObj = {
            data: [],
            type: 'line',
            symbolSize: 6
        };
        if (isMutileLine) {
            var serise = [];
            _.each(dataList, (dataItem) => {
                var seriseItem = $.extend(true, {}, {name: dataItem.teamName}, commonObj);
                _.each(dataItem[lineType], (item) => {
                    seriseItem.data.push(item.count);
                });
                serise.push(seriseItem);
            });
            return serise;
        } else {
            var serise = [$.extend(true, {}, {
                itemStyle: {
                    normal: {
                        color: '#4d96d1'
                    }
                }
            }, commonObj)];
            dataList.forEach((item) => {
                serise[0].data.push(item.count);
            });
        }
        return serise;
    };

    //近一个月的通话趋势
    renderCallChart = (dataList, charTips, isMutileLine, lineType) => {
        var isLoading = this.state.callList.loading || this.state.eachTeamCallList.loading;
        var isError = this.state.callList.errMsg || this.state.eachTeamCallList.errMsg;
        const charts = [{
            title: Intl.get('call.record.trend.charts', ' 近一个月的通话趋势：'),
            chartType: 'line',
            data: dataList,
            layout: {
                sm: 24,
            },
            option: this.getCallTrendEchartOptions(dataList, charTips, isMutileLine, lineType),
            noExportCsv: true,
            resultType: getResultType(isLoading, isError),
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(isError);
            }
        }];

        return (
            <AntcAnalysis
                charts={charts}
                chartHeight={this.state.trendHeight}
            />
        );
    };

    //通话时长统计描述
    getDurationDescription = (item, time, team) => {
        var descriptionArr = [
            TOOLTIPDESCRIPTION.TIME + ' : ' + `${item}`,
            TOOLTIPDESCRIPTION.DURATION + ' : ' + `${time}`,
        ];
        if (team) {
            descriptionArr.push(TOOLTIPDESCRIPTION.TEAMNAME + ' :' + `${team}`);
        }
        return descriptionArr;
    };

    // 通话时长统计图的提示信息
    durationTooltip = (time, sum, teamArr) => {
        if (_.isArray(teamArr)) {
            var returnObj = _.map(time, (item, index) => {
                let timeObj = TimeUtil.secondsToHourMinuteSecond(sum[index] || 0);
                var desObj = this.getDurationDescription(item, timeObj.timeDescr, teamArr[index]);
                return desObj.join(',');
            });
            return returnObj.join('<br />');
        } else {
            let timeObj = TimeUtil.secondsToHourMinuteSecond(sum || 0);
            let desObj = this.getDurationDescription(time, timeObj.timeDescr);
            return desObj.join('<br />');
        }
    };

    //获取通话数量描述
    getCountDescription = (item, sum, team) => {
        var countArr = [
            TOOLTIPDESCRIPTION.TIME + ' : ' + `${item}`,
            TOOLTIPDESCRIPTION.COUNT + ' : ' + `${sum}`,
        ];
        if (team) {
            countArr.push(TOOLTIPDESCRIPTION.TEAMNAME + ' : ' + `${team}`);
        }
        return countArr;
    };

    // 通话数量统计图的提示信息
    countTooltip = (time, sum, teamArr) => {
        if (_.isArray(teamArr)) {
            var returnObj = _.map(time, (item, index) => {
                var desObj = this.getCountDescription(item, sum[index], teamArr[index]);
                return desObj.join(',');
            });
            return returnObj.join('<br />');
        } else {
            var desObj = this.getCountDescription(time, sum);
            return desObj.join('<br />');
        }
    };

    // TOP10数据列表titleObj={title:"通话时长",dataKey:"billsec"}
    getCallDurTopColumn = (titleObj) => {
        return [
            {
                title: Intl.get('common.phone', '电话'),
                dataIndex: 'dst',
                width: '120',
                className: 'table-data-align-right',
                key: 'call_number'
            }, {
                title: titleObj.title,
                dataIndex: titleObj.dataKey,
                width: '100',
                className: 'table-data-align-right',
                key: 'holding_time',
                render: function(data) {
                    return <div>{titleObj.dataKey === 'count' ? data : TimeUtil.getFormatTime(data)}</div>;
                }
            }, {
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'customer_name',
                width: '250',
                className: 'table-data-align-left',
                key: 'customer_name'
            }, {
                title: Intl.get('call.record.caller', '呼叫者'),
                dataIndex: 'nick_name',
                width: '70',
                className: 'table-data-align-left',
                key: 'nick_name'
            }
        ];
    };
    renderRefreshText = () => {
        return (
            <div className="refresh-container">
                <Icon type="reload" onClick={this.getCallInfoData} />
            </div>
        );
    };
    renderFilter114 = () => {
        return (
            <div className="filter-114-wrap">
                <Checkbox onChange={this.onFilter114Change} checked={this.state.filter_phone}>
                    {Intl.get('call.analysis.filter.114', '过滤掉114')}
                </Checkbox>
            </div>
        );
    };


    // 通话率列表
    renderCallInfo = () => {
        var callInfoCharts = [{
            title: Intl.get('call.analysis.call.title', '通话信息'),
            chartType: 'table',
            layout: {
                sm: 24,
            },
            resultType: this.state.loading ? 'loading' : 'suceess',
            data: this.state.salesPhoneList,
            option: {
                pagination: false,
                bordered: true,
                columns: this.getPhoneListColumn(),
            },
            cardContainer: {
                props: {
                    subTitle: this.renderFilter114(),
                    isShowRefreshButton: true,
                    refreshData: this.getCallInfoData
                },
            },
        }];
        return (
            <AntcAnalysis
                charts={callInfoCharts}
                chartHeight='auto'
            />
        );
    };

    /* 渲染单次通话时长、总时长、总次数为top10的列表
     * titleObj={title:"通话时长",dataKey:"billsec"}
     */
    renderCallTopTen = (dataObj, titleObj, chartHeight) => {
        var callTopTenCharts = [{
            title: titleObj.title + 'TOP10',
            chartType: 'table',
            resultType: dataObj.loading ? 'loading' : 'suceess',
            data: dataObj.data,
            layout: {
                sm: 24,
            },
            noExportCsv: true,
            option: {
                pagination: false,
                bordered: true,
                columns: this.getCallDurTopColumn(titleObj)
            }
        }];
        return (
            <div className="call-top  col-xs-6">
                <AntcAnalysis
                    charts={callTopTenCharts}
                    chartHeight={chartHeight}
                />
            </div>
        );
    };

    getOneOneFourAndServiceHasTeamTooltip = () => {
        return {
            show: true,
            formatter: function(obj) {
                var parseText = parseFloat(obj.value[2]);
                var rate = !isNaN(parseText) ? parseText.toFixed(2) + '%' : '';
                return `<div>
                           <span>${(obj.data[0])}</span>  
                           <br/>  
                           <span>${Intl.get('common.app.count', '数量')}:${(obj.data[1])}</span>  
                           <br/>  
                           <span>${Intl.get('oplate_bd_analysis_realm_industry.7', '占比')}:${
                    rate}</span>
                        </div>`;
            }
        };
    };

    //渲染有团队时，114和客服电话分析图的options
    getOneOneFourAndServiceHasTeamOptions = (dataList) => {
        return {
            tooltip: this.getOneOneFourAndServiceHasTeamTooltip(),
            legend: {
                show: true
            },
            color: ['#3398DB'],
            grid: {
                x: 50,
                y: 20,
                x2: 30,
                y2: 30
            },
            yAxis: [
                {
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        formatter: '{value}',
                    }
                }
            ],
            series: [
                {
                    data: dataList.map(x => {
                        return [x.name, x.num, x.rate];
                    })
                }
            ]
        };
    };

    getPieOptions = (dataList) => {
        return {
            tooltip: {
                trigger: 'item',
                formatter: '<div class=\'echarts-tooltip\'>{b} : {c} ({d}%)</div>'
            },
            legend: {
                orient: 'vertical',
                right: '2%',
                top: '2%',
                data: _.map(dataList, 'name')
            },

            series: [
                {
                    radius: '55%',
                    center: ['50%', '60%'],
                    label: {
                        normal: {
                            formatter: '{c}'
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    };

    getPieData = (dataList) => {
        var list = dataList || [];
        var legend = _.map(dataList, 'name') || [];
        return legend.map((legendName, idx) => {
            return {
                name: legendName,
                value: list[idx].num // 注意：饼图中，value是key
            };
        });
    };

    // 114占比和客服电话统计
    renderCallRateChar = (type) => {
        var resultType = getResultType(this.state.callRateList[type].loading, this.state.callRateList[type].errMsg);
        var data = [];
        var title = Intl.get('call.record.service.phone.rate', '114占比统计');
        var callListType = this.state.callRateList[type];
        var dataList = callListType && _.isArray(callListType.list) ? callListType.list : [];
        var height = CHART_LAYOUT_HEIGHT.LARGER_HEIGHT;
        if (type === 'service') {
            title = Intl.get('call.record.servicecall', '客服电话统计：');
            height = CHART_LAYOUT_HEIGHT.INITIAL_HEIGHT;
        }
        if (this.state.teamList.list.length) {
            data = this.state.callRateList[type].list.map(x => {
                return [x.name, x.num, x.rate];
            });
        } else {
            data = this.getPieData(this.state.callRateList[type].list);
        }
        //如果是管理员，展示柱状图
        //如果是普通销售，展示饼状图
        const barCharts = [{
            title: title,
            chartType: 'bar',
            data: dataList,
            layout: {
                sm: 24,
            },
            option: this.getOneOneFourAndServiceHasTeamOptions(dataList),
            noExportCsv: true,
            resultType: resultType,
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.callRateList[type].errMsg);
            }
        }];
        const pieCharts = [{
            title: title,
            chartType: 'pie',
            data: data,
            layout: {
                sm: 24,
            },
            option: this.getPieOptions(dataList),
            noExportCsv: true,
            resultType: resultType,
            errMsgRender: () => {
                return getErrorTipAndRetryFunction(this.state.callRateList[type].errMsg);
            }
        }];
        return (
            <div>
                {this.state.teamList.list.length ? (
                    <AntcAnalysis
                        charts={barCharts}
                        chartHeight={height}
                    />
                ) : (
                    <AntcAnalysis
                        charts={pieCharts}
                        chartHeight={height}
                    />
                )}
            </div>
        );
    };

    getClickMap = (zone) => {
        CallAnalysisAction.showZoneDistribute(zone);
    };

    countTotal = () => {
        var total = 0;
        _.each(this.state.customerData.zoneList, function(obj) {
            total += obj.value;
        });
        if (isNaN(total)) {
            total = 0;
        }
        return total;
    };

    getCustomerZoneOptions = () => {
        var originFormatter = mapFormatter;
        var $tooltipDom = null;
        var _this = this;
        function getTooltipDom() {
            if (!$tooltipDom || !$tooltipDom[0]) {
                $tooltipDom = $(_this.refs.mapChartWrap).find('.echarts-tooltip');
            }
        }
        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: '#0b80e0',
                textStyle: {
                    color: '#fff'
                },
                formatter: function(obj) {
                    getTooltipDom();
                    if (obj.name === Intl.get('china.zone.distribute.south.island', '南海诸岛')) {
                        $tooltipDom.addClass('notshow');
                    } else {
                        $tooltipDom.removeClass('notshow');
                    }
                    var newObj = $.extend(true, {}, obj);
                    newObj.total = _this.countTotal();
                    var html = originFormatter(newObj);
                    return html;
                }
            }
        };
    };

    provinceName = (name) => {
        return MAP_PROVINCE[name];
    };

    renderCustomerZoneDistribute = () => {
        var dataList = this.state.customerData.zoneList;
        var arr = dataList.concat();
        arr.push({
            name: Intl.get('china.zone.distribute.south.island', '南海诸岛'),
            value: 0
        });
        const charts = [{
            title: Intl.get('call.analysis.zone.distrute', '客户的地域分布'),
            chartType: 'map',
            data: arr,
            layout: {
                sm: 24,
            },
            option: this.getCustomerZoneOptions(),
            noExportCsv: true,
            resultType: 'success',
            events: [{
                name: 'click',
                func: this.getClickMap
            }]
        }];
        return (
            <div className="map-distribute">
                <AntcAnalysis
                    charts={charts}
                    chartHeight={CHART_LAYOUT_HEIGHT.MAP_HEIGHT}
                />
            </div>
        );
    };

    renderCustomerPhase = () => {
        var dataList = this.state.customerData.customerPhase;
        var data = this.getPieData(dataList);
        var charts = [
            {
                title: Intl.get('oplate_customer_analysis.customer.stage', '客户阶段统计'),
                chartType: 'pie',
                data: data,
                layout: {
                    sm: 24,
                },
                option: this.getPieOptions(dataList),
                noExportCsv: true,
                resultType: getResultType(this.state.customerData.loading, this.state.customerData.errMsg),
                errMsgRender: () => {
                    return getErrorTipAndRetryFunction(this.state.customerData.errMsg);
                }
            }
        ];
        return (
            <div>
                <AntcAnalysis
                    charts={charts}
                    chartHeight={CHART_LAYOUT_HEIGHT.INITIAL_HEIGHT}
                />
            </div>
        );
    };

    renderOrderPhase = () => {
        var dataList = this.state.customerData.OrderPhase;
        var data = this.getPieData(dataList);
        var charts = [
            {
                title: Intl.get('oplate_customer_analysis.11', '订单阶段统计'),
                chartType: 'pie',
                data: data,
                layout: {
                    sm: 24,
                },
                option: this.getPieOptions(dataList),
                noExportCsv: true,
                resultType: getResultType(this.state.customerData.loading, this.state.customerData.errMsg),
                errMsgRender: () => {
                    return getErrorTipAndRetryFunction(this.state.customerData.errMsg);
                }
            }
        ];
        return (
            <div>
                <AntcAnalysis
                    charts={charts}
                    chartHeight={CHART_LAYOUT_HEIGHT.INITIAL_HEIGHT}
                />
            </div>
        );
    };
    onFilter114Change = (e) => {
        this.setState({filter_phone: e.target.checked},() => {
            this.getCallInfoData();
        });
    };
    renderCallAnalysisView = () => {
        const tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - $('.duration-count-chart').height();
        return (<div className="call-table-container" ref="phoneList">
            {/**
             *  通话数量和通话时长的趋势图
             * */}
            <div className="duration-count-chart col-xs-12">
                <div className="trend-chart-title">
                    {this.state.firstSelectValue === LITERAL_CONSTANT.TEAM ?
                        <div className="each-team-trend">
                            {Intl.get('call.record.all.teams.trend', '查看各团队通话趋势图')}：
                            <Switch checked={this.state.switchStatus} onChange={this.handleSwitchChange}
                                checkedChildren={Intl.get('user.yes', '是')}
                                unCheckedChildren={Intl.get('user.no', '否')}/>
                        </div> : null}
                </div>
                {this.renderCallTrendChart()}
            </div>
            <div style={{height: tableHeight}} className="table-list-containers">
                <GeminiScrollBar>
                    <div className="analysis-wrapper">
                        <div className="call-info col-xs-12">
                            {this.renderCallInfo()}
                        </div>
                        <div className="call-range col-xs-12">
                            {/*根据电话的排序的通话次数TOP10*/}
                            {this.renderCallTopTen(this.state.callTotalCountObj, {
                                title: Intl.get('call.analysis.total.count', '通话总次数'),
                                dataKey: 'count'
                            },'auto')}
                            {/*根据电话的排序的通话总时长TOP10*/}
                            {this.renderCallTopTen(this.state.callTotalTimeObj, {
                                title: Intl.get('call.analysis.total.time', '通话总时长'),
                                dataKey: 'sum'
                            },'auto')}
                        </div>
                        <div className="call-duration col-xs-12">
                            {/*根据电话的排序的单次通话时长TOP10*/}
                            {this.renderCallTopTen(this.state.callDurList, {
                                title: Intl.get('sales.home.call.top.ten', '单次通话时长'),
                                dataKey: 'billsec'
                            },CHART_LAYOUT_HEIGHT.LARGER_HEIGHT)}
                            <div className="call-rate-service-rate col-xs-6 padding-both-none">
                                <div className="call-rate">
                                    {this.renderCallRateChar('114')}
                                </div>
                            </div>
                        </div>
                        <div className="call-rate col-xs-12">
                            <div className="call-service-rate col-xs-6">
                                <div className="call-rate">
                                    {this.renderCallRateChar('service')}
                                </div>
                            </div>
                            <div className="call-interval-block col-xs-6 padding-both-none">
                                {this.renderCallIntervalChart()}
                                <div className="call-interval-radio clearfix btn-item">
                                    <RadioGroup onChange={this.onChangeCallIntervalRadio}
                                        value={this.state.selectedCallInterval}>
                                        <Radio value={CALL_RADIO_VALUES.COUNT}>
                                            {Intl.get('sales.home.call.cout', '通话数量')}
                                        </Radio>
                                        <Radio value={CALL_RADIO_VALUES.DURATION}>
                                            {Intl.get('call.record.call.duration', '通话时长')}
                                        </Radio>
                                    </RadioGroup>
                                </div>

                            </div>
                        </div>
                        <div className="call-stage col-xs-12">
                            <div className="customer-stage-distribute col-xs-6">
                                <div className="call-stage">
                                    {this.renderCustomerPhase()}
                                </div>
                            </div>
                            <div className="call-stage-distribute col-xs-6 padding-both-none">
                                <div className="call-sale">
                                    {this.renderOrderPhase()}
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="call-zone col-xs-6">
                                <div className="call-zone-distribute" ref="mapChartWrap">
                                    {this.renderCustomerZoneDistribute()}
                                </div>
                            </div>
                        </div>

                    </div>
                </GeminiScrollBar>
            </div>
        </div>);
    };

    //时间的设置
    onSelectDate = (startTime, endTime, timeType) => {
        let timeObj = {startTime: startTime, endTime: endTime, timeType: timeType};
        CallAnalysisAction.changeSearchTime(timeObj);
        setTimeout(() => {
            this.refreshCallAnalysisData();
        });
    };

    handleFirstSelect = () => {
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '选择成员过滤');
        } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '选择团队过滤');
        }

    };

    handleSelectTeamOrMember = () => {
        if (this.state.teamList.list.length > 1) {
            if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据团队过滤');
            } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据成员过滤');
            }
        } else if (this.state.teamList.list.length === 1) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据成员过滤');
        }
    };

    // 团队和成员筛选框
    renderTeamMembersSelect = () => {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list; // 成员数据

        // 第一个选择框渲染的数据
        let firstOptions = FIRSR_SELECT_DATA.map((item, index) => {
            return <Option value={item} key={index}>{item}</Option>;
        });

        // 第二个选择框的数据
        let secondOptions = [];
        if (teamList.length === 1) { // 只展示成员选择框时
            secondOptions = memberList.map((item, index) => {
                return <Option value={item.name} key={index}>{item.name}</Option>;
            });
        } else if (teamList.length > 1) { // 展示团队和成员
            if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                secondOptions = teamList.map((item, index) => {
                    return <Option value={item.id} key={index}>{item.name}</Option>;
                });
            } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
                secondOptions = memberList.map((item, index) => {
                    return <Option value={item.id} key={index}>{item.name}</Option>;
                });
            }
        }
        secondOptions.unshift(<Option value={LITERAL_CONSTANT.ALL}>{LITERAL_CONSTANT.ALL}</Option>);

        return (
            <div>
                { teamList.length > 1 ? (
                    <SelectFullWidth
                        defaultValue={FIRSR_SELECT_DATA[0]}
                        onChange={this.handleFirstSelectChange}
                        onSelect={this.handleFirstSelect}
                        className="btn-item"
                    >
                        {firstOptions}
                    </SelectFullWidth>
                ) : null }
                <SelectFullWidth
                    multiple
                    value={this.state.secondSelectValue}
                    onChange={this.onSecondSelectChange}
                    className="team-member-select-options btn-item"
                    onSelect={this.handleSelectTeamOrMember}
                >
                    {secondOptions}
                </SelectFullWidth>
            </div>
        );
    };

    // 团队和成员框的选择
    handleFirstSelectChange = (value) => {
        this.setState({
            firstSelectValue: value,
            secondSelectValue: LITERAL_CONSTANT.ALL
        }, () => {
            if (value === LITERAL_CONSTANT.MEMBER) {
                let userIdArray = _.map(this.state.memberList.list, 'id');
                this.refreshCallAnalysisData({user_id: userIdArray.join(',')});
            } else {
                this.refreshCallAnalysisData();
            }
        });
    };

    // 第二个选择框，具体的值：全部和多个选择之间的切换显示
    onSecondSelectChange = (value) => {
        // 处理选择全部和多个的情况
        if (value[0] === LITERAL_CONSTANT.ALL && value.length > 1) {
            value.shift(); // 选择具体的某个成员后或团队时，‘全部’应该删除
        } else if (value[0] !== LITERAL_CONSTANT.ALL && _.indexOf(value, LITERAL_CONSTANT.ALL) !== -1 || value.length === 0) {
            value = LITERAL_CONSTANT.ALL; // 选择全部时，其他选项应该不显示
        }
        this.setState({
            secondSelectValue: value,
        }, () => {
            this.setChartContainerHeight();
            this.refreshCallAnalysisData();
            if (this.state.switchStatus && this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                var reqBody = this.getCallAnalysisBodyParamSeparately();
                this.getCallAnalysisTrendDataSeparately(reqBody);//每个团队分别的趋势图
            }
        });
    };

    render() {
        return (<RightContent>
            <div className="call-analysis-content" data-tracename="通话分析界面">
                <TopNav>
                    <div className="date-range-wrap">
                        {/**
                         * 通话类型的筛选条件
                         * */}
                        <div>
                            {this.filterCallTypeSelect()}
                        </div>
                        <span className="btn-item">
                            <DatePicker
                                disableDateAfterToday={true}
                                range="day"
                                onSelect={this.onSelectDate}>
                                <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                                <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                                <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                                <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                            </DatePicker>
                        </span>
                        {/**
                         * 团队和成员筛选框
                         * */}
                        <div className="team-member-select">
                            {
                                this.state.teamList.list.length ?
                                    this.renderTeamMembersSelect() :
                                    null
                            }
                        </div>
                    </div>
                    <RightPanelClose onClick={this.props.closeCallAnalysisPanel}/>
                </TopNav>
                <div className="call-data-analysis">
                    {this.renderCallAnalysisView()}
                </div>
            </div>
        </RightContent>);
    }
}
CallRecordAnalyis.propTypes = {
    closeCallAnalysisPanel: PropTypes.func
};
module.exports = CallRecordAnalyis;
