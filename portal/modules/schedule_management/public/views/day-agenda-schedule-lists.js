/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/14.
 */
import {Row, Col, Button} from "antd";
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
var classNames = require("classnames");
import userData from "PUB_DIR/sources/user-data";
var user_id = userData.getUserData().user_id;
const LAY_OUT = {
    SCHEDULE_CONTENT_HEIGHT: 600
};
var scheduleManagementEmitter = require("PUB_DIR/sources/utils/emitters").scheduleManagementEmitter;
class DayAgendaScheduleLists extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scheduleList: this.props.scheduleList,
            updateScrollBar: false,
            random:Math.random(),
        };
    };

    componentDidMount() {
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.on(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE,  this.setUpdateScrollBarFalse);
        scheduleManagementEmitter.on(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT,  this.unmout);
    };

    unmout = () => {
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE,  this.setUpdateScrollBarFalse);
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT,  this.unmout);
    };
    setUpdateScrollBarTrue = () => {
        console.log(this.state.random);
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
        console.log("componentWillUnmount",this.state.random);
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE, this.setUpdateScrollBarTrue);
        scheduleManagementEmitter.removeListener(scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE, this.setUpdateScrollBarFalse);
    };

    renderUpdateDaySchedule() {
        var divHeight = LAY_OUT.SCHEDULE_CONTENT_HEIGHT;
        return (
            <div className="schedule-items-content" style={{height: divHeight}}>
                {this.renderDayScheduleList()}
            </div>
        )
    };

    renderDaySchedule() {
        var divHeight = LAY_OUT.SCHEDULE_CONTENT_HEIGHT;
        return (
            <div className="schedule-items-content" style={{height: divHeight}}>
                <GeminiScrollbar>
                    {this.renderDayScheduleList()}
                </GeminiScrollbar>
            </div>
        )
    };

    renderDayScheduleList() {
        return (
            _.map(this.state.scheduleList, (item, index) => {
                var listCls = classNames("list-item", {
                    "has-handled": item.status == "handle",
                    "selected-customer": item.customer_id == this.state.curCustomerId
                });
                var itemCls = classNames("list-item-content", {});
                var iconFontCls = classNames("iconfont", {
                    "icon-phone-busy": item.type == "calls",
                    "icon-schedule-visit": item.type == "visit",
                    "icon-schedule-other": item.type == "other",
                });
                var content = item.status == "handle" ? "已完成" : (
                    item.allDay ? "全天" : moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) + "-" + moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)
                );
                return (
                    <div className={listCls} onClick={this.props.showCustomerDetail.bind(this, item.customer_id)}>
                        <div className={itemCls}>
                            <Row>
                                <Col sm={4}>
                                    <p className="schedule-time-range">{content}</p>
                                    <span className="hidden record-id">{item.id}</span>
                                </Col>
                                <Col sm={9}>
                                    <p className="schedule-customer-name">
                                        <i className={iconFontCls}></i>
                                        {item.customer_name || item.topic}</p>
                                    <span className="hidden record-id">{item.id}</span>
                                </Col>
                                <Col sm={10}>
                                    <div className="schedule-content-wrap">
                                        {user_id == item.member_id && item.status !== "handle" ?
                                            <Button
                                                type="primary"
                                                onClick={this.props.handleScheduleItemStatus.bind(this, item)}>{Intl.get("schedule.list.mark.finish", "标记为完成")}
                                                {this.state.handleStatusLoading && item.id == this.state.isEdittingItemId ?
                                                    <Icon type="loading"/> : null}</Button> : null}
                                        <p className="schedule-content">{item.content}</p>
                                        <span className="hidden record-id">{item.id}</span>

                                    </div>

                                </Col>
                            </Row>
                        </div>
                    </div>
                )
            })
        )
    };

    render() {
        return (
            <div id="content-block" className="content-block">
                <div className="dayagenda-schedule-list"
                >
                    <div className="schedule-title">
                        <Row>
                            <Col sm={4}>
                                <span className="timerange">{Intl.get("common.login.time", "时间")}</span>
                            </Col>
                            <Col sm={9}>
                                    <span className="todo">
                                        {Intl.get("schedule.todo.list", "待办")}
                                    </span>
                            </Col>
                            <Col sm={10}>
                                    <span className="content">
                                        {Intl.get("crm.177", "内容")}
                                    </span>
                            </Col>
                        </Row>
                    </div>
                    {this.state.updateScrollBar ? this.renderUpdateDaySchedule() : this.renderDaySchedule()}
                </div>
            </div>
        )
    }
}
DayAgendaScheduleLists.defaultProps = {
    updateScrollBar: false,
    handleScheduleItemStatus: function () {

    }

};
export default DayAgendaScheduleLists;