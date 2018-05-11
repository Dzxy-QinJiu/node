/**
 * 统计分析筛选组件
 */

import "./style.less";
import AnalysisAppSelector from "../analysis_app_selector";
import DatePicker from "../datepicker";
const Emitters = require("../../public/sources/utils/emitters");
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const appSelectorEmitter = Emitters.appSelectorEmitter;
const DateSelectorUtils = require("../datepicker/utils");
import { TIME_RANGE, STORED_APP_ID_KEY } from "./consts";
import Trace from "LIB_DIR/trace";

const timeRange = "week";

const AnalysisFilter = React.createClass({
    getDefaultProps() {
         return {
            isAppSelectorShow: true,
            selectedApp: localStorage[STORED_APP_ID_KEY],
        };
    },
    componentDidMount() {
        if (this.props.isAutoSelectDate) {
            const funcName = "get" + TIME_RANGE + "Time";
            //时间对象
            const timeObj = DateSelectorUtils[funcName](true);
            //开始时间
            const startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
            //结束时间
            const endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);

            this.onSelectDate(startTime, endTime);
        }
    },
    onSelectDate(startTime, endTime) {
        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    },
    onSelectApp(app_id) {
        appSelectorEmitter.emit(appSelectorEmitter.SELECT_APP, app_id);
        Trace.traceEvent(this.getDOMNode(),"选择应用");
    },
    render() {
        return (
            <div className="analysis-filter">
                {this.props.isAppSelectorShow? (
                <span>
                    <AnalysisAppSelector
                        onSelectApp={this.onSelectApp}
                        maxWidth={200}
                        isSelectFirstApp={this.props.isSelectFirstApp}
                        selectedApp={this.props.selectedApp}
                    />
                </span>
                ) : null}
                <div className="date-selector-wrap">
                    <DatePicker
                        disableDateAfterToday={true}
                        range={timeRange}
                        onSelect={this.onSelectDate}>
                        <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                        <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                        <DatePicker.Option value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                        <DatePicker.Option value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                        <DatePicker.Option value="year">{Intl.get("common.time.unit.year","年")}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                    </DatePicker>
                </div>
            </div>
        );
    }
});

export default AnalysisFilter;
