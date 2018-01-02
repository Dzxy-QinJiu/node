/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/30.
 */
import {Row, Col} from "antd";
import BigCalendar from 'react-big-calendar';
import dates from 'date-arithmetic';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
var classNames = require("classnames");
var scheduleManagementEmitter = require("PUB_DIR/sources/utils/emitters").scheduleManagementEmitter;
var startDate = [];
const CALENDAR_LAYOUT = {
    TOPANDBOTTOM: 110
};
var containToday = {
    flag: false
};
class WeekAgendaScheduleLists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            weekLists: this.props.weekLists,
            updateScrollBar: false,
            containToday: containToday.flag,// 今天所在的周  和today这两个状态共同判断给哪一天是今天，给今天加背景颜色
            today: moment().format("dddd")//今天是周几
        };
    };

    switchToday(Week) {
        switch (Week) {
            case Intl.get("schedule.user.time.monday", "星期一"):
                Week = "Mon";
                break;
            case Intl.get("schedule.user.time.tuesday", "星期二"):
                Week = "Tus";
                break;
            case Intl.get("schedule.user.time.wednesday", "星期三"):
                Week = "Wed";
                break;
            case Intl.get("schedule.user.time.thursday", "星期四"):
                Week = "Thur";
                break;
            case Intl.get("schedule.user.time.friday", "星期五"):
                Week = "Fri";
                break;
            case Intl.get("schedule.user.time.saturday", "星期六"):
                Week = "Sat";
                break;
            case Intl.get("schedule.user.time.sunday", "星期日"):
                Week = "Sun";
                break;
            default:
                break;
        }
        return Week;
    };

    componentDidMount() {
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE, this.setUpdateScrollBarFalse);
        //计算出今天是周几
        var weekFormToday = this.switchToday(this.state.today);
        this.setState({
            today: weekFormToday
        });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.weekLists !== this.state.weekLists) {
            this.setState({
                weekLists: nextProps.weekLists
            });
        }
    };

    setUpdateScrollBarTrue = () => {
        this.setState({
            updateScrollBar: true
        })
    };
    setUpdateScrollBarFalse = () => {
        this.setState({
            updateScrollBar: false
        })
    };

    componentWillUnmount() {
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE, this.setUpdateScrollBarFalse);
    };

    //动画执行过程中渲染日程列表
    renderUpdateWeekSchedule() {
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        return (
            <div className="schedule-items-content" style={{height: height}}>
                <div className="schedule-bg-content">
                    {_.map(startDate, (item, key) => {
                        var cls = classNames("schedule-line-grid",
                            {"rbc-today": containToday.flag && key == this.state.today})//给今天的日程加类
                        return (
                            <div className={cls}></div>
                        )
                    })}
                </div>
                {this.renderWeekScheduleList()}
            </div>
        )
    };

    //动画执行完毕后渲染日程列表
    renderWeekSchedule() {
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        return (
            <div className="schedule-items-content" style={{height: height}}>
                <div className="schedule-bg-content">
                    {_.map(startDate, (item, key) => {
                        var cls = classNames("schedule-line-grid",
                            {"rbc-today": containToday.flag && key == this.state.today})
                        return (
                            <div className={cls}></div>
                        )
                    })}
                </div>
                <GeminiScrollBar>
                    {this.renderWeekScheduleList()}
                </GeminiScrollBar>
            </div>
        )
    };

    renderWeekScheduleList() {
        return (
            _.map(this.state.weekLists, (list, key) => {
                return (
                    <div className="event-container">
                        <div className="even-items-wrapper">
                            {list.length ? _.map(list, (item) => {
                                var cls = classNames("iconfont",
                                    {
                                        "icon-schedule-visit": item.type == "visit",
                                        "icon-phone-busy": item.type == "calls",
                                        "icon-schedule-other": item.type == "other"
                                    });
                                var listCls = classNames("list-item", {
                                    "has-handled": item.status == "handle",
                                    "selected-customer": item.customer_id == this.state.curCustomerId
                                });
                                return (
                                    <div className={listCls}
                                         onClick={this.props.showCustomerDetail.bind(this, item.customer_id)}>
                                        <Row>
                                            <Col sm={4}>
                                                <i className={cls}></i>
                                            </Col>
                                            <Col sm={20}>
                                                 <p className="topic-container">
                                                    {item.topic}
                                                </p>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            }) : <div className="no-data-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="31.91" height="32"
                                     viewBox="0 0 31.91 32">
                                    <path id="无数据" className="cls-1"
                                          d="M1139,378h18a4,4,0,0,1,4,4v24a4,4,0,0,1-4,4h-18a4,4,0,0,1-4-4V382A4,4,0,0,1,1139,378Zm0,2h18a2,2,0,0,1,2,2v24a2,2,0,0,1-2,2h-18a2,2,0,0,1-2-2V382A2,2,0,0,1,1139,380Zm2,5h14a1,1,0,0,1,0,2h-14A1,1,0,0,1,1141,385Zm0,5h14a1,1,0,0,1,0,2h-14A1,1,0,0,1,1141,390Zm0,5h14a1,1,0,0,1,0,2h-14A1,1,0,0,1,1141,395Zm15-5h2a8,8,0,0,1,8,8v2a8,8,0,0,1-8,8h-2a8,8,0,0,1-8-8v-2A8,8,0,0,1,1156,390Zm0.71,8.293,9.9,9.9a1,1,0,1,1-1.42,1.415l-9.9-9.9A1,1,0,0,1,1156.71,398.293ZM1157,392a7,7,0,1,1-7,7A7,7,0,0,1,1157,392Zm0,2a5,5,0,1,1-5,5A5,5,0,0,1,1157,394Z"
                                          transform="translate(-1135 -378)"/>
                                </svg>
                                <div>
                                    {Intl.get("schedule.no.item", "无待办")}
                                </div>
                            </div>}

                        </div>
                    </div>
                )
            })
        )
    };

    render() {
        return (
            <div className="week-list-container">
                <div className="week-list-content">
                    <div className="title-wrap">
                        {_.map(startDate, (item, key) => {
                            var cls = classNames("even-title",
                                {"rbc-today": containToday.flag && key == this.state.today})
                            return (
                                <div className={cls}>
                                    {item}
                                </div>
                            )
                        })}
                    </div>
                    {this.state.updateScrollBar ? this.renderUpdateWeekSchedule() : this.renderWeekSchedule()}
                </div>
            </div>
        )
    }
}
;
WeekAgendaScheduleLists.navigate = (date, action) => {
    //前一周，或者后一周
    switch (action) {
        case BigCalendar.Navigate.PREVIOUS:
            return dates.add(date, -1, 'week');

        case BigCalendar.Navigate.NEXT:
            return dates.add(date, 1, 'week');
        default:
            return date;
    }
};
WeekAgendaScheduleLists.title = (date, {formats, culture}) => {
    var startTime = moment(date).startOf("week").format(oplateConsts.DATE_MONTH_DAY_FORMAT);
    var endTime = moment(date).endOf("week").format(oplateConsts.DATE_MONTH_DAY_FORMAT);
    startDate = {
        "Mon": Intl.get("user.time.monday", "周一") + " " + startTime,
        "Tus": Intl.get("user.time.tuesday", "周二") + " " + moment(date).startOf("week").add(1, "days").format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        "Wed": Intl.get("user.time.wednesday", "周三") + " " + moment(date).startOf("week").add(2, "days").format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        "Thur": Intl.get("user.time.thursday", "周四") + " " + moment(date).startOf("week").add(3, "days").format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        "Fri": Intl.get("user.time.friday", "周五") + " " + moment(date).startOf("week").add(4, "days").format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        "Sat": Intl.get("user.time.saturday", "周六") + " " + moment(date).startOf("week").add(5, "days").format(oplateConsts.DATE_MONTH_DAY_FORMAT),
        "Sun": Intl.get("user.time.sunday", "周日") + " " + endTime,
    };
    //如果当前时间是在标题展示那一周的范围之内，就是今天所在的周
    if (moment().valueOf() >= moment(date).startOf("week").valueOf() && moment().valueOf() <= moment(date).endOf("week").valueOf()) {
        containToday.flag = true;
    } else {
        containToday.flag = false;
    }
    return `${startTime} ${Intl.get("contract.83", "至")} ${endTime}`;
};
WeekAgendaScheduleLists.defaultProps = {
    showCustomerDetail: function () {

    }

};
export default WeekAgendaScheduleLists;