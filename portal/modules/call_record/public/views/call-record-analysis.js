/**
 *  显示团队、成员筛选框的判断条件， 114占比显示饼图还是柱状图
 *
 *  this.state.teamList.length == 0 时，是普通销售，不显示筛选框，114展示为饼图
 *  this.state.teamList.length == 1 时，是销售基层领导，只有一个团队，显示成员，114柱状图
 *  this.state.teamList.length > 1 时， 有两个以上的团队，显示团队和成员的筛选框，114柱状图
 * */

import {Table, Icon, Select, Radio, Alert} from "antd";
const Option = Select.Option;
const RadioGroup = Radio.Group;
var RightContent = require("CMP_DIR/privilege/right-content");
var TableUtil = require("CMP_DIR/antd-table-pagination");
var TopNav = require("CMP_DIR/top-nav");
import DatePicker from "CMP_DIR/datepicker";
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import TimeSeriesLinechart from "./charts/call-analysis-trend" ;// 通话分析，趋势图
import CallAnalysisAction from '../action/call-analysis-action';
import CallAnalysisStore from '../store/call-analysis-store';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import rightPanelUtil from "CMP_DIR/rightPanel/index";
const RightPanelClose = rightPanelUtil.RightPanelClose;
import RateBarChart from './charts/team-call-rate';  // 团队，114占比，柱状图
import  PieChart from './charts/saleman-call-rate'; // 个人， 114占比，饼图
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import Trace from "LIB_DIR/trace";
import ScatterChart from 'CMP_DIR/chart/scatter';
import {AntcTable} from "antc";

// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
    PHONE: 'phone',
    APP: 'app'
};

// 用于布局趋势图的宽度
const LAYOUT_WIDTH = {
    ORIGIN_WIDTH: 135,
    RESIZE_WIDTH: 60
};

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 75,
    BOTTOM_DISTANCE: 70
};

const LITERAL_CONSTANT = {
    ALL: Intl.get('common.all', '全部'),
    TEAM: Intl.get('user.user.team', '团队'),
    MEMBER: Intl.get('member.member', '成员')
};
//通话时长和数量的单选按钮值
const CALL_RADIO_VALUES = {
    COUNT: "count",//通话数量
    DURATION: "duration"//通话时长
};

// 趋势图，统计的是近一个月的通话时长和通话数量
const TREND_TIME = 30 * 24 * 60 * 60 * 1000;

const FIRSR_SELECT_DATA = [LITERAL_CONSTANT.TEAM, LITERAL_CONSTANT.MEMBER];

var CallRecordAnalyis = React.createClass({
    //获取初始状态
    getInitialState: function () {
        let callStateData = CallAnalysisStore.getState();
        let trendWidth = $(window).width() - LAYOUT_WIDTH.ORIGIN_WIDTH;
        return {
            ...callStateData,
            callType: CALL_TYPE_OPTION.ALL, // 通话类型
            selectRadioValue: CALL_RADIO_VALUES.COUNT, // 通话趋势图中，时长和数量切换的Radio
            selectedCallInterval: CALL_RADIO_VALUES.COUNT,//通话时段点图中，时长和数量切换的Radio
            trendWidth: trendWidth, // 趋势图的宽度
            firstSelectValue: FIRSR_SELECT_DATA[0], // 第一个选择框的值
            secondSelectValue: LITERAL_CONSTANT.ALL // 第二个选择宽的值，默认是全部的状态
        }
    },

    onStoreChange: function () {
        this.setState(CallAnalysisStore.getState());
    },

    // 根据权限，判断所传字段的值
    getParamByPrivilege() {
        let reqData = {};
        if (hasPrivilege("GET_TEAM_LIST_ALL") || hasPrivilege('GET_TEAM_MEMBERS_ALL')) {
            reqData.type = 'all';
        } else if (hasPrivilege("GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS") || hasPrivilege('GET_TEAM_MEMBERS_MYTEAM_WITH_SUBTEAMS')) {
            reqData.type = 'self';
        }
        return reqData;
    },

    // 获取销售团队和成员数据
    getTeamMemberData() {
        let reqData = this.getParamByPrivilege();
        CallAnalysisAction.getSaleGroupTeams(reqData);
        CallAnalysisAction.getSaleMemberList(reqData);
    },

    componentDidMount: function () {
        CallAnalysisStore.listen(this.onStoreChange);
        this.getTeamMemberData(); //获取销售团队和成员数据
        this.refreshCallAnalysisData(); // 获取趋势图、接通率、TOP10和114占比的数据
        $(window).resize(() => {
            this.setState({
                trendWidth: $('.call-analysis-content').width() - LAYOUT_WIDTH.RESIZE_WIDTH
            });
        });
        TableUtil.zoomInSortArea(this.refs.phoneList);
        TableUtil.alignTheadTbody(this.refs.phoneList);
    },

    // 获取团队或是成员的id
    getTeamOrMemberId(list, selectValue) {
        return _.chain(list).filter(item => selectValue.indexOf(item.name) > -1).pluck("id").value();
    },

    // 获取团队或成员的参数
    getTeamMemberParam() {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list;  // 成员数据
        let secondSelectValue = this.state.secondSelectValue;
        let params = {};
        if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM && this.state.teamList.list.length > 1) { // 团队时
            if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体团队时
                let secondSelectTeamId = this.getTeamOrMemberId(teamList, secondSelectValue);
                params.sales_team_id = secondSelectTeamId.join(',');
            }
        } else { // 成员时
            if (this.state.secondSelectValue == LITERAL_CONSTANT.ALL) { // 全部时
                let userIdArray = _.pluck(this.state.memberList.list, 'id');
                params.user_id = userIdArray.join(',');
            } else if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体成员时
                let secondSelectMemberId = this.getTeamOrMemberId(memberList, secondSelectValue);
                params.user_id = secondSelectMemberId.join(','); // 成员
            }
        }
        return params;
    },

    // post方式，body中的参数
    getCallAnalysisBodyParam(params) {
        let reqBody = {};
        if (this.state.teamList.list.length) {
            reqBody = this.getTeamMemberParam();
        }
        if (params && params.type && params.type != 'all' || this.state.callType != 'all') {
            reqBody.type = params && params.type || this.state.callType
        }
        return reqBody;
    },

    // 通话分析的趋势图
    getCallAnalysisTrendData(reqBody){
        // 通话数量和通话时长的时间参数，统计近一个月(今天往前推30天)的统计
        let trendParams = {
            start_time: (new Date().getTime() - TREND_TIME),
            end_time: new Date().getTime()
        };
        // 获取通话数量和通话时长的趋势图数据
        CallAnalysisAction.getCallCountAndDur(trendParams, reqBody);
    },

    // 通话的接通率
    getCallInfoData(params){
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            type: params && params.type || this.state.callType
        };
        let pathParam = this.getParamByPrivilege();
        if (this.state.teamList.list.length) { // 有团队时（普通销售时没有团队的）
            let teamMemberParam = this.getTeamMemberParam();
            if (teamMemberParam) {
                if (teamMemberParam.sales_team_id) {
                    if (teamMemberParam.sales_team_id.indexOf(',') === -1) {
                        //只有一个团队时，获取团队下的团队/成员的通话记录列表
                        queryParams.team_id = teamMemberParam.sales_team_id;
                    } else {
                        queryParams.team_ids = teamMemberParam.sales_team_id;
                    }
                } else if (teamMemberParam.user_id) {
                    queryParams.member_ids = teamMemberParam.user_id;
                }
            }
        }
        CallAnalysisAction.getCallInfo(pathParam, queryParams);
    },

    // TOP10
    getCallDurTopTen(reqBody) {
        // 通话时长TOP10的列表
        var topParam = {
            start_time: this.state.start_time || moment('2010-01-01 00:00:00').valueOf(),
            end_time: this.state.end_time || moment().endOf("day").valueOf(),
            page_size: 10,
            sort_field: 'billsec',
            sort_order: 'descend'
        };
        CallAnalysisAction.getCallDurTopTen(topParam, reqBody);
    },

    // 114占比，与时间、所选团队和成员有关系
    getCallRate(reqBody) {
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime()
        };
        CallAnalysisAction.getCallRate(queryParams, reqBody);
    },

    // 获取趋势图、接通率、TOP10和114占比的数据
    refreshCallAnalysisData(params) {
        let reqBody = this.getCallAnalysisBodyParam(params);
        this.getCallAnalysisTrendData(reqBody); // 趋势图
        this.getCallInfoData(params); // 接通率
        this.getCallDurTopTen(reqBody); // TOP10
        this.getCallRate(reqBody); // 114占比
        this.getCallRate({...reqBody, filter_invalid_phone: "false"}); //客服电话统计
        this.getCallIntervalData(reqBody);//获取通话时段（数量和时长）的统计数据
    },
    //获取通话时段（数量和时长）的参数
    getCallIntervalParams: function (params) {
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
    },
    //获取通话时段的统计数据
    getCallIntervalData(params){
        let queryParams = this.getCallIntervalParams(params);
        let authType = "user";//CUSTOMER_CALLRECORD_STATISTIC_USER
        if (hasPrivilege("CUSTOMER_CALLRECORD_STATISTIC_MANAGER")) {
            authType = "manager";
        }
        CallAnalysisAction.getCallIntervalData(authType, queryParams);
    },
    componentWillUnmount: function () {
        CallAnalysisStore.unlisten(this.onStoreChange);
    },

    //获取销售列的标题
    getSalesColumnTitle: function () {
        var label = Intl.get("sales.home.sales", "销售");
        if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM && this.state.teamList.list.length > 1) {
            label = Intl.get("user.sales.team", "销售团队");
        }
        return label;
    },
    // 电话接通率的数据
    getPhoneListColumn: function () {
        let columns = [{
            title: this.getSalesColumnTitle(),
            width: 114,
            dataIndex: 'salesName',
            className: 'table-data-align-left',
            key: 'sales_Name'
        }, {
            title: Intl.get("sales.home.total.duration", "总时长"),
            width: 114,
            dataIndex: 'totalTimeDescr',
            key: 'total_time',
            sorter: function (a, b) {
                return a.totalTime - b.totalTime;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.total.connected", "总接通数"),
            width: 114,
            dataIndex: 'calloutSuccess',
            key: 'callout_success',
            sorter: function (a, b) {
                return a.calloutSuccess - b.calloutSuccess;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.average.duration", "日均时长"),
            width: 114,
            dataIndex: 'averageTimeDescr',
            key: 'average_time',
            sorter: function (a, b) {
                return a.averageTime - b.averageTime;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.average.connected", "日均接通数"),
            width: 114,
            dataIndex: 'averageAnswer',
            key: 'average_answer',
            sorter: function (a, b) {
                return a.averageAnswer - b.averageAnswer;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.phone.callin", "呼入次数"),
            width: 114,
            dataIndex: 'callinCount',
            key: 'callin_count',
            sorter: function (a, b) {
                return a.callinCount - b.callinCount;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.phone.callin.success", "成功呼入"),
            width: 114,
            dataIndex: 'callinSuccess',
            key: 'callin_success',
            sorter: function (a, b) {
                return a.callinSuccess - b.callinSuccess;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.phone.callin.rate", "呼入接通率"),
            width: 114,
            dataIndex: 'callinRate',
            key: 'callin_rate',
            sorter: function (a, b) {
                return a.callinRate - b.callinRate;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.phone.callout", "呼出次数"),
            width: 114,
            dataIndex: 'calloutCount',
            key: 'callout_count',
            sorter: function (a, b) {
                return a.calloutCount - b.calloutCount;
            },
            className: 'has-filter table-data-align-right'
        }, {
            title: Intl.get("sales.home.phone.callout.rate", "呼出接通率"),
            width: 114,
            dataIndex: 'calloutRate',
            key: 'callout_rate',
            sorter: function (a, b) {
                return a.calloutRate - b.calloutRate;
            },
            className: 'has-filter table-data-align-right'
        }];
        //当前展示的是客套类型的通话记录时，展示计费时长
        if (this.state.callType == CALL_TYPE_OPTION.APP) {
            columns.push({
                title: Intl.get("sales.home.phone.billing.time", "计费时长(分钟)"),
                dataIndex: 'billingTime',
                key: 'filling_time',
                width: '10%',
                sorter: function (a, b) {
                    return a.billingTime - b.billingTime;
                },
                className: 'has-filter table-data-align-right'
            });
        }
        return columns;
    },

    handleSelect() {
        Trace.traceEvent($(this.getDOMNode()).find(".call-type-select"), '根据通话类型过滤');
    },

    // 通话类型的筛选框
    filterCallTypeSelect(){
        return (
            <div className="call-type-select">
                <SelectFullWidth
                    showSearch
                    value={this.state.callType}
                    onChange={this.selectCallTypeValue}
                    onSelect={this.handleSelect}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        <span>{Intl.get("user.online.all.type", "全部类型")}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        <span>{Intl.get("call.record.call.center", "呼叫中心")}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        <span>{Intl.get("common.ketao.app", "客套APP")}</span>
                    </Option>
                </SelectFullWidth>
            </div>
        );
    },

    // 选择通话类型的值
    selectCallTypeValue(value){
        if (value == CALL_TYPE_OPTION.PHONE) {
            this.state.callType = CALL_TYPE_OPTION.PHONE;
        } else if (value == CALL_TYPE_OPTION.APP) {
            this.state.callType = CALL_TYPE_OPTION.APP;
        } else if (value == CALL_TYPE_OPTION.ALL) {
            this.state.callType = CALL_TYPE_OPTION.ALL;
        }
        this.setState({
            callType: value
        }, () => {
            if (this.state.callType == 'all') {
                this.refreshCallAnalysisData();
            } else {
                this.refreshCallAnalysisData({type: this.state.callType});
            }
        });
    },

    // 切换通话时长和数据，展示的趋势图
    handleSelectRadio(event) {
        if (event.target.value === CALL_RADIO_VALUES.COUNT) {
            Trace.traceEvent(event, '点击通话趋势图中通话数量按钮');
            this.setState({
                selectRadioValue: CALL_RADIO_VALUES.COUNT
            });
        } else {
            Trace.traceEvent(event, '点击趋势图中通话时长按钮');
            this.setState({
                selectRadioValue: CALL_RADIO_VALUES.DURATION
            });
        }
    },

    // 渲染通话数量和通话时长的趋势图
    renderCallTrendChart() {
        if (this.state.callList.loading) {
            return (
                <Spinner />
            );
        }
        let data = this.state.callList.count;
        // 没有数据的提示
        if (_.isArray(data) && !data.length) {
            return (
                <div className="alert-wrap">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
        return (
            <div>
                <div className="duration-count-radio clearfix">
                    <RadioGroup onChange={this.handleSelectRadio} value={this.state.selectRadioValue}>
                        <Radio value="count">{Intl.get('sales.home.call.cout', '通话数量')}</Radio>
                        <Radio value="duration">{Intl.get('call.record.call.duration', '通话时长')}</Radio>
                    </RadioGroup>
                </div>

                {
                    this.state.selectRadioValue === CALL_RADIO_VALUES.COUNT ?
                        // 通话数量
                        this.renderCallChar(this.state.callList.count, this.countTooltip) :
                        // 通话时长
                        this.renderCallChar(this.state.callList.duration, this.durationTooltip)
                }
            </div>
        );
    },
    //切换通话时长和数量，展示的点图
    onChangeCallIntervalRadio(event){
        if (event.target.value === CALL_RADIO_VALUES.COUNT) {
            Trace.traceEvent(event, '点击通话时段点图中的通话数量按钮');
            this.setState({
                selectedCallInterval: CALL_RADIO_VALUES.COUNT
            });
        } else {
            Trace.traceEvent(event, '点击通话时段点图中的通话时长按钮');
            this.setState({
                selectedCallInterval: CALL_RADIO_VALUES.DURATION
            });
        }
    },


    // 渲染通话时段(时长/数量)的统计
    renderCallIntervalChart() {
        if (this.state.callIntervalData.loading) {
            return (
                <Spinner />
            );
        }
        let data = this.state.selectedCallInterval === CALL_RADIO_VALUES.COUNT ? this.state.callIntervalData.countList : this.state.callIntervalData.timeList;
        if (_.isArray(data) && data.length) {
            return (this.state.selectedCallInterval === CALL_RADIO_VALUES.COUNT ?
                <ScatterChart list={data}
                              title={Intl.get("call.record.count", "通话数量统计：")}
                              dataName={Intl.get("sales.home.call.cout", "通话数量")}
                /> :
                <ScatterChart list={data}
                              title={Intl.get("call.record.time", "通话时长统计：")}
                              dataName={Intl.get("call.record.call.duration", "通话时长")}
                              dataType="time"
                />);
        } else {
            if (this.state.callIntervalData.errMsg) {//错误提示
                return (
                    <div className="alert-wrap">
                        <Alert
                            message={this.state.callIntervalData.errMsg}
                            type="error"
                            showIcon={true}
                        />
                    </div>
                );
            } else {
                // 没有数据的提示
                return (
                    <div className="alert-wrap">
                        <Alert
                            message={Intl.get("common.no.data", "暂无数据")}
                            type="info"
                            showIcon={true}
                        />
                    </div>);
            }
        }
    },

    renderCallChar(data, charTips) {
        return (
            <TimeSeriesLinechart
                dataList={data}
                tooltip={charTips}
                width={this.state.trendWidth}
            />
        );
    },

    // 通话时长统计图的提示信息
    durationTooltip: function (time, sum) {
        let timeObj = TimeUtil.secondsToHourMinuteSecond(sum || 0);
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${time}`,
            Intl.get('call.record.call.duration', '通话时长') + ' : ' + `${timeObj.timeDescr}`
        ].join('<br />');
    },

    // 通话数量统计图的提示信息
    countTooltip: function (time, sum) {
        return [
            Intl.get('common.login.time', '时间') + ' : ' + `${time}`,
            Intl.get('sales.home.call.cout', '通话数量') + ' : ' + `${sum}`
        ].join('<br />');
    },

    // TOP10数据列表
    getCallDurTopColumn(){
        return [
            {
                title: Intl.get("common.phone", "电话"),
                dataIndex: 'dst',
                width: '120',
                className: 'table-data-align-right',
                key: 'call_number'
            }, {
                title: Intl.get("call.record.call.duration", "通话时长"),
                dataIndex: 'billsec',
                width: '100',
                className: 'table-data-align-right',
                key: 'holding_time',
                render: function (billsec) {
                    return <div>{TimeUtil.getFormatTime(billsec)}</div>;
                }
            }, {
                title: Intl.get("call.record.customer", "客户"),
                dataIndex: 'customer_name',
                width: '250',
                className: 'table-data-align-left',
                key: 'customer_name'
            }, {
                title: Intl.get("call.record.caller", "呼叫者"),
                dataIndex: 'nick_name',
                width: '70',
                className: 'table-data-align-left',
                key: 'nick_name'
            }
        ];
    },

    // 通话率列表
    renderCallInfo() {
        if (this.state.loading) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        }
        return (
            <AntcTable dataSource={this.state.salesPhoneList}
                       columns={this.getPhoneListColumn()}
                       pagination={false}
                       bordered
            />
        );
    },

    // 渲染单次通话时长为top10的列表
    renderCallDurTopTen(){
        if (this.state.callDurList.loading) {
            return (
                <Spinner />
            );
        }
        if (this.state.callDurList.errMsg) {
            return (
                <div className="alert-wrap">
                    <Alert
                        message={this.state.callDurList.errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        return (
            <AntcTable
                dataSource={this.state.callDurList.data}
                columns={this.getCallDurTopColumn()}
                pagination={false}
                bordered
            />
        );
    },

    // 114占比
    renderCallRateChar(type) {
        if (this.state.callRateList[type].loading) {
            return (
                <div className="call-rate">
                    <Spinner />
                </div>
            );
        }
        else {
            let rateArray = [];
            if (this.state.teamList.list.length) {
                rateArray = _.pluck(this.state.callRateList[type].list, 'rate');
            }
            else { // 普通销售
                rateArray = _.pluck(this.state.callRateList[type].list, 'count');
            }
            // 没有数据的提示
            if (!rateArray.length || _.max(rateArray) == 0) {
                return (
                    <div className="alert-wrap">
                        <Alert
                            message={Intl.get("common.no.data", "暂无数据")}
                            type="info"
                            showIcon={true}
                        />
                    </div>
                );
            }
            else if (this.state.callRateList[type].errMsg) {
                return (
                    <div className="alert-wrap">
                        <Alert
                            message={this.state.callRateList[type].errMsg}
                            type="error"
                            showIcon={true}
                        />
                    </div>
                );
            }
            else {
                return (
                    <div>
                        {this.state.teamList.list.length ? (
                            <RateBarChart
                                dataList={this.state.callRateList[type].list}
                            />
                        ) : (
                            <PieChart
                                dataList={this.state.callRateList[type].list}
                            />
                        )}
                    </div>
                );
            }
        }
    },

    renderCallAnalysisView: function () {
        const tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - $('.duration-count-chart').height() - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        return (<div className="call-table-container" ref="phoneList">
            {/**
             *  通话数量和通话时长的趋势图
             * */}
            <div className="duration-count-chart col-xs-12">
                <div className="trend-chart-title">
                    {Intl.get("call.record.trend.charts", " 近一个月的通话趋势：")}
                </div>
                {this.renderCallTrendChart()}
            </div>

            <div style={{height: tableHeight}}>
                {this.state.salesPhoneList.length && <div className="export-file">
                    <a title={Intl.get("call.time.export.statistic", "点击导出通话时长统计")}
                       href={"/rest/export/call_rate/" + this.state.callType}>
                        <i className="iconfont icon-export"></i>{Intl.get("common.export", "导出")} </a>
                </div>}
                <GeminiScrollBar>
                    <div className="call-info col-xs-12">{this.renderCallInfo()}</div>
                    <div className="col-xs-12">
                        {/**通话率*/}
                        <div className="call-top  col-xs-6">
                            <div className="call-duration-top-ten">
                                <div className="call-duration-title">
                                    {Intl.get("sales.home.call.top.ten", "单次通话时长TOP10：")}
                                </div>
                                {this.renderCallDurTopTen()}
                            </div>
                        </div>
                        {/**TOP10*/}
                        <div className="call-service-rate col-xs-6">
                            <div className="call-rate">
                                <div className="call-rate-title">
                                    {Intl.get("call.record.service.phone.rate", "114占比统计：")}
                                </div>
                                {this.renderCallRateChar("114")}
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12">
                        <div className="call-service-rate col-xs-6">
                            <div className="call-rate">
                                <div className="call-rate-title">
                                    {Intl.get("call.record.servicecall", "客服电话统计：")}
                                </div>
                                {this.renderCallRateChar("service")}
                            </div>
                        </div>
                        <div className="call-interval-block col-xs-6">
                            <div className="call-interval-title">
                                {Intl.get("call.record.interval", "通话时段统计")}
                            </div>
                            <div className="call-interval-radio clearfix">
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
                            {this.renderCallIntervalChart()}
                        </div>
                    </div>
                </GeminiScrollBar>
            </div>
        </div>);
    },
    //时间的设置
    onSelectDate: function (startTime, endTime, timeType) {
        let timeObj = {startTime: startTime, endTime: endTime, timeType: timeType};
        CallAnalysisAction.changeSearchTime(timeObj);
        setTimeout(() => {
            this.refreshCallAnalysisData();
        });
    },

    handleFirstSelect() {
        if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM) {
            Trace.traceEvent($(this.getDOMNode()).find(".team-member-select"), '选择成员过滤');
        } else if (this.state.firstSelectValue == LITERAL_CONSTANT.MEMBER) {
            Trace.traceEvent($(this.getDOMNode()).find(".team-member-select"), '选择团队过滤');
        }

    },

    handleSelectTeamOrMember() {
        if (this.state.teamList.list.length > 1) {
            if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM) {
                Trace.traceEvent($(this.getDOMNode()).find(".team-member-select"), '根据团队过滤');
            } else if (this.state.firstSelectValue == LITERAL_CONSTANT.MEMBER) {
                Trace.traceEvent($(this.getDOMNode()).find(".team-member-select"), '根据成员过滤');
            }
        } else if (this.state.teamList.list.length == 1) {
            Trace.traceEvent($(this.getDOMNode()).find(".team-member-select"), '根据成员过滤');
        }
    },

    // 团队和成员筛选框
    renderTeamMembersSelect() {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list;  // 成员数据

        // 第一个选择框渲染的数据
        let firstOptions = FIRSR_SELECT_DATA.map((item) => {
            return <Option value={item}>{item}</Option>;
        });

        // 第二个选择框的数据
        let secondOptions = [];
        if (teamList.length == 1) { // 只展示成员选择框时
            secondOptions = memberList.map((item) => {
                return <Option value={item.name}>{item.name}</Option>;
            });
        } else if (teamList.length > 1) { // 展示团队和成员
            if (this.state.firstSelectValue == LITERAL_CONSTANT.TEAM) {
                secondOptions = teamList.map((item) => {
                    return <Option value={item.name}>{item.name}</Option>;
                });
            } else if (this.state.firstSelectValue == LITERAL_CONSTANT.MEMBER) {
                secondOptions = memberList.map((item) => {
                    return <Option value={item.name}>{item.name}</Option>;
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
                    >
                        {firstOptions}
                    </SelectFullWidth>
                ) : null }
                <SelectFullWidth
                    multiple
                    value={this.state.secondSelectValue}
                    onChange={this.onSecondSelectChange}
                    className="team-member-select-options"
                    onSelect={this.handleSelectTeamOrMember}
                >
                    {secondOptions}
                </SelectFullWidth>
            </div>
        );
    },

    // 团队和成员框的选择
    handleFirstSelectChange(value) {
        this.setState({
            firstSelectValue: value,
            secondSelectValue: LITERAL_CONSTANT.ALL
        }, () => {
            if (value == LITERAL_CONSTANT.MEMBER) {
                let userIdArray = _.pluck(this.state.memberList.list, 'id');
                this.refreshCallAnalysisData({user_id: userIdArray.join(',')})
            } else {
                this.refreshCallAnalysisData()
            }
        });
    },

    // 第二个选择框，具体的值：全部和多个选择之间的切换显示
    onSecondSelectChange(value) {
        // 处理选择全部和多个的情况
        if (value[0] == LITERAL_CONSTANT.ALL && value.length > 1) {
            value.shift(); // 选择具体的某个成员后或团队时，‘全部’应该删除
        } else if (value[0] != LITERAL_CONSTANT.ALL && _.indexOf(value, LITERAL_CONSTANT.ALL) != -1 || value.length == 0) {
            value = LITERAL_CONSTANT.ALL; // 选择全部时，其他选项应该不显示
        }
        this.setState({
            secondSelectValue: value
        }, () => {
            this.refreshCallAnalysisData();
        });
    },

    render: function () {
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
                        <DatePicker
                            disableDateAfterToday={true}
                            range="day"
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
});

module.exports = CallRecordAnalyis;