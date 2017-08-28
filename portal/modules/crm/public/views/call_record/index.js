require("./index.scss");
require("../../../../../components/antd-table-pagination/index.scss");
import CallRecordActions from '../../action/call-record-actions';
import CallRecordStore from '../../store/call-record-store';
import Spinner from '../../../../../components/spinner';
import {Alert,Table} from 'antd';
import Utils from '../../utils/call-record-util';
import GeminiScrollBar from '../../../../../components/react-gemini-scrollbar';
import TableUtil from '../../../../../components/antd-table-pagination';
import TimeUtil from '../../../../../public/sources/utils/time-format-util';
var TimeSeriesBarChart = require('../../../../../components/timeseries-barchart');
import DatePicker from "../../../../../components/datepicker";
var scrollBarEmitter = require("../../../../../public/sources/utils/emitters").scrollBarEmitter;
import Trace from "LIB_DIR/trace";
//接听状态
let CALL_STATUS_MAP = {
    'ANSWERED': Intl.get("call.record.state.answer", "已接听"),
    'NO ANSWER': Intl.get("call.record.state.no.answer", "未接听"),
    'BUSY': Intl.get("call.record.state.busy", "用户忙")
};

//计算布局的常量
const LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    PANEL_PADDING: 40,
    TAB_HEIGHT: 53,
    RANGE_HEIGHT: 30,
    CHART_HEIGHT: 217,
    FIXED_THEAD: 50,
    TABLE_MARGIN_BOTTOM: 20,
    SUMMARY: 25
};

//不排序的表格列
const noSortColumns = [
    {
        title: Intl.get("common.login.time", "时间"),
        dataIndex: 'call_date',
        key: 'call_date',
        width: '29%',
        render: function (time) {
            var displayTime = Utils.getDateTimeStr(time);
            return (
                <div title={displayTime}>
                    {displayTime}
                </div>
            );
        }
    }, {
        title: Intl.get("common.phone", "电话"),
        dataIndex: 'dst',
        key: 'dst',
        width: '29%',
    }, {
        title: Intl.get("common.status", "状态"),
        dataIndex: 'disposition',
        key: 'disposition',
        width: '14%',
        render: function (disposition) {
            return <div>{CALL_STATUS_MAP[disposition]}</div>;
        }
    }, {
        title: Intl.get("user.duration", "时长"),
        dataIndex: 'billsec',
        key: 'billsec',
        width: '14%',
        render: function (billsec) {
            return <div>{TimeUtil.getFormatTime(billsec)}</div>;
        }
    }, {
        title: Intl.get("crm.122", "呼叫人"),
        dataIndex: 'nick_name',
        key: 'nick_name',
        width: '14%',
    }
];
//生成排序的column
var sortColumns = $.extend(true, [], noSortColumns);
_.each(sortColumns, function (item) {
    item.sorter = true;
    item.className = 'has-filter';
});


const CallRecord = React.createClass({
    getInitialState() {
        return CallRecordStore.getState();
    },
    componentDidMount() {
        CallRecordStore.listen(this.onStoreChange);
        this.getGraphDataByAjax();
        this.getCallListByAjax();
        TableUtil.zoomInSortArea(this.refs.thead);
    },
    componentWillUnmount() {
        CallRecordStore.unlisten(this.onStoreChange);
        setTimeout(()=> {
            CallRecordActions.resetState();
        });
    },
    componentDidUpdate(prevProps, prevState) {
        if (this.props.curCustomer.id != prevProps.curCustomer.id) {
            var _this = this;
            setTimeout(function () {
                var callRecord = _this.state.callRecord;
                callRecord.page = 1;
                callRecord.data_list = [];
                callRecord.listenScrollBottom = false;
                _this.updateStore({
                    callRecord: callRecord
                }, function () {
                    _this.getGraphDataByAjax();
                    _this.getCallListByAjax();
                });
            });
        }
        TableUtil.zoomInSortArea(this.refs.thead);
    },
    handleScrollBottom() {
        //下拉加载数据
        let callRecordList = this.state.callRecord.data_list, lastId;
        if (_.isArray(callRecordList) && callRecordList.length > 0) {
            lastId = callRecordList[callRecordList.length - 1].id;//最后一个客户的id
        }
        this.getCallListByAjax({lastId: lastId});
    },
    render() {
        var scrollBarHeight = $(window).height() -
            LAYOUT_CONSTANTS.PANEL_PADDING -
            LAYOUT_CONSTANTS.TAB_HEIGHT -
            LAYOUT_CONSTANTS.RANGE_HEIGHT -
            LAYOUT_CONSTANTS.CHART_HEIGHT -
            LAYOUT_CONSTANTS.FIXED_THEAD -
            LAYOUT_CONSTANTS.TABLE_MARGIN_BOTTOM -
            LAYOUT_CONSTANTS.SUMMARY;
        //合并面板，去掉客户选择框的高度
        if (this.props.isMerge) {
            scrollBarHeight = scrollBarHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }

        const total = Intl.get("common.total.data", "共{num}条数据", {num: this.state.callRecord.total});
        return (
            <div className="call_record_wrap" data-tracename="通话记录界面">
                <DatePicker
                    disableDateAfterToday={true}
                    range="month"
                    onSelect={this.onSelectDate}>
                    <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                    <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                    <DatePicker.Option value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                    <DatePicker.Option value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                    <DatePicker.Option value="year">{Intl.get("common.time.unit.year", "年")}</DatePicker.Option>
                    <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                </DatePicker>
                <div className="call_chart">
                    {this.renderCallChart()}
                </div>
                <div className="call_record">
                    <div className="table-thead" ref="thead">
                        <Table
                            dataSource={[]}
                            columns={sortColumns}
                            pagination={false}
                            onChange={this.onSortChange}
                        />
                    </div>
                    <div style={{height:scrollBarHeight}}>
                        {this.renderCallRecordList()}
                    </div>
                    {
                        this.state.callRecord.data_list.length ? (
                            <div className="total_summary">{total}</div>
                        ) : null
                    }
                </div>
            </div>
        );
    },
    onSelectDate(start_time, end_time) {
        var callRecord = this.state.callRecord;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        var _this = this;
        Trace.traceEvent(this.getDOMNode(),"修改时间");
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00', oplateConsts.DATE_TIME_FORMAT).valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf("day").valueOf();
        }
        this.updateStore({
            callRecord: callRecord,
            start_time: start_time,
            end_time: end_time,
        }, function () {
            _this.getGraphDataByAjax();
            _this.getCallListByAjax();
        });
    },
    /**
     * 参数说明，ant-design的table组件
     * @param pagination   分页参数，当前不需要使用分页
     * @param filters      过滤器参数，当前不需要使用过滤器
     * @param sorter       排序参数，当前需要使用sorter
     * {field : 'xxx' //排序字段 , order : 'descend'/'ascend' //排序顺序}
     */
    onSortChange(pagination, filters, sorter) {
        var sort_field = sorter.field;
        var sort_order = sorter.order;
        var _this = this;
        var callRecord = this.state.callRecord;
        callRecord.sort_field = sort_field;
        callRecord.sort_order = sort_order;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        this.updateStore({
            callRecord: callRecord
        }, function () {
            _this.getCallListByAjax();
        });
    },
    updateStore(obj, callback) {
        $.extend(CallRecordStore.state, obj);
        this.setState(CallRecordStore.getState(), ()=> {
            callback && callback();
        });
    },
    //获取请求参数
    getReqParam(obj, prop) {
        var val = obj && prop in obj ? obj[prop] : this.state[prop];
        return val;
    },
    //获取日志列表的请求参数
    getCallListReqParam(obj, prop) {
        var val = obj && prop in obj ? obj[prop] : this.state.callRecord[prop];
        return val;
    },
    //获取电话号码
    getPhoneArray(){
        let curCustomer = this.props.curCustomer, phoneArray = [];
        if (curCustomer && _.isObject(curCustomer)) {
            let contacts = curCustomer.contacts;//联系方式
            if (_.isArray(contacts) && contacts.length > 0) {
                contacts.forEach(contact=> {
                    if (_.isArray(contact.phone) && contact.phone.length) {
                        //合并电话，返回不重复的电话数组
                        phoneArray = _.union(phoneArray, contact.phone);
                    }
                });
            }
        }
        return phoneArray;
    },
    getCallListByAjax(queryParam) {
        let phoneArray = this.getPhoneArray();
        if (_.isArray(phoneArray) && phoneArray.length) {
            CallRecordActions.getRecordList({
                params: {
                    start_time: this.getReqParam(queryParam, 'start_time'),
                    end_time: this.getReqParam(queryParam, 'end_time'),
                    page_size: 20,
                    lastId: queryParam ? queryParam.lastId : "",
                    sort_field: this.getCallListReqParam(queryParam, 'sort_field'),
                    sort_order: this.getCallListReqParam(queryParam, 'sort_order')
                },
                reqData: {
                    dst: phoneArray.join(',')
                }
            }, function () {
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            });
        }

    },
    getGraphDataByAjax(queryParam) {
        let phoneArray = this.getPhoneArray();
        if (_.isArray(phoneArray) && phoneArray.length) {
            CallRecordActions.getRecordGraph({
                params: {
                    start_time: this.getReqParam(queryParam, 'start_time'),
                    end_time: this.getReqParam(queryParam, 'end_time'),
                    interval: 'day'
                },
                reqData: {
                    dst: phoneArray.join(',')
                }
            });
        }
    },
    renderCallChart() {
        if (this.state.callGraph.is_loading) {
            return <Spinner />;
        }
        if (this.state.callGraph.errorMsg) {
            return <div className="alert-wrap">
                <Alert
                    message={this.state.callGraph.errorMsg}
                    type="error"
                    showIcon={true}
                />
            </div>
        }
        if (!this.state.callGraph.data_list.length) {
            return <div className="alert-wrap">
                <Alert
                    message={Intl.get("common.no.data", "暂无数据")}
                    type="info"
                    showIcon={true}
                />
            </div>;
        }
        return (
            <TimeSeriesBarChart
                dataList={this.state.callGraph.data_list}
                tooltip={this.chartTooltip}
            />
        )
    },
    chartTooltip: function (time, sum) {
        const gtime = Intl.get("common.login.time", "时间");
        const duration = Intl.get("crm.112", "通话时长");
        let timeObj = TimeUtil.secondsToHourMinuteSecond(sum || 0);
        return [
            `${gtime}: ${time}`,
            `${duration}: ${timeObj.timeDescr}`
        ].join('<br />');
    },
    renderCallRecordList() {
        return (
            <GeminiScrollBar
                listenScrollBottom={this.state.callRecord.listenScrollBottom}
                handleScrollBottom={this.handleScrollBottom}
                itemCssSelector=".ant-table-tbody .ant-table-row"
            >
                {this.renderCallRecordContent()}
            </GeminiScrollBar>
        );
    },
    renderCallRecordContent() {
        //只有第一页的时候，显示loading和错误信息
        if (this.state.callRecord.page === 1) {
            if (this.state.callRecord.is_loading) {
                return <Spinner />;
            }
            if (this.state.callRecord.errorMsg) {
                return <div className="alert-wrap">
                    <Alert
                        message={this.state.callRecord.errorMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>;
            }
        }
        if (!this.state.callRecord.data_list.length) {
            return <div className="alert-wrap">
                <Alert
                    message={Intl.get("common.no.data", "暂无数据")}
                    type="info"
                    showIcon={true}
                />
            </div>
        }
        return <div className="table-tbody">
            <Table
                dataSource={this.state.callRecord.data_list}
                columns={noSortColumns}
                pagination={false}
            />
        </div>;
    },
    onStoreChange() {
        this.setState(CallRecordStore.getState());
    }
});


export default CallRecord;