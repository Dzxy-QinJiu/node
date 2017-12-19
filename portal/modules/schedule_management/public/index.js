/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/8.
 */
require("./css/index.less");
require("jquery-ui");
require("fullcalendar");
require("fullcalendar/dist/locale/zh-cn");
var language = require("PUB_DIR/language/getLanguage");
if (language.lan() == "es") {
    require("fullcalendar/dist/locale/es");
} else if (language.lan() == "zh") {
    require("fullcalendar/dist/locale/zh-cn");
} else if (language.lan() == "en") {
    require("fullcalendar/dist/locale/en-gb");
}
require("fullcalendar/dist/fullcalendar.css");
import Trace from "LIB_DIR/trace";
import {message, Icon, Button, Alert} from "antd";
var scheduleManagementStore = require("./store/schedule-management-store");
var scheduleManagementAction = require("./action/schedule-management-action");
var classNames = require("classnames");
import CrmRightPanel  from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
import Translate from 'PUB_DIR/intl/i18nTemplate';
//天视图组件
import DayAgendaScheduleLists from './views/day-agenda-schedule-lists';
import ExpireScheduleLists from './views/expire-schedule-lists';
var scheduleManagementEmitter = require("PUB_DIR/sources/utils/emitters").scheduleManagementEmitter;
const ScheduleManagement = React.createClass({
    getInitialState: function () {
        return {
            rightPanelIsShow: false,//是否展示右侧客户详情
            scheduleTableList: [],//右侧日程列表中的日程数据
            scheduleTableListTotal: 0,//日程列表是数量
            isShowExpiredPanel: true,//是否展示左侧超时面板
            isFirstLogin: true,//是否是第一次登录的时候
            ...scheduleManagementStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(scheduleManagementStore.getState());
    },
    addEventListener: function () {
        var _this = this;
        //给日程列表右上角的视图类型加一下处理,在不同的视图下展示的日程的内容不一样，通过类进行控制内容的展示和隐藏
        $("#calendar").on("click", ".fc-month-button", function () {
            //unmount是避免在切换天视图的过程中，内存中会有多个天视图，同时接到SET_UPDATE_SCROLL_BAR_TRUE，切换不同的视图会报错
            scheduleManagementEmitter.emit(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT);
            $("#calendar").removeClass("weekView-calendar");
            $("#calendar").removeClass("dayView-calendar");
            $("#calendar").addClass("monthView-calendar");
            Trace.traceEvent($(_this.getDOMNode()).find(".fc-month-button"), "点击切换月视图按钮");
        });
        $("#calendar").on("click", ".fc-agendaWeek-button", function () {
            scheduleManagementEmitter.emit(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT);
            $("#calendar").removeClass("monthView-calendar");
            $("#calendar").removeClass("dayView-calendar");
            $("#calendar").addClass("weekView-calendar");
            Trace.traceEvent($(_this.getDOMNode()).find(".fc-agendaWeek-button"), "点击切换周视图按钮");
        });
        $("#calendar").on("click", ".fc-agendaDay-button", function () {
            scheduleManagementEmitter.emit(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT);
            $("#calendar").removeClass("monthView-calendar");
            $("#calendar").removeClass("weekView-calendar");
            $("#calendar").addClass("dayView-calendar");
            Trace.traceEvent($(_this.getDOMNode()).find(".fc-agendaWeek-button"), "点击切换天视图按钮");
        });
        $("#calendar").on("click", ".fc-header-toolbar .fc-prev-button", function () {
            Trace.traceEvent($(_this.getDOMNode()).find(".fc-prev-button"), "点击切换前翻按钮");
            scheduleManagementEmitter.emit(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT);
        });
        $("#calendar").on("click", ".fc-header-toolbar .fc-next-button", function () {
            Trace.traceEvent($(_this.getDOMNode()).find(".fc-next-button"), "点击切换后翻按钮");
            scheduleManagementEmitter.emit(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT);
        });

    },
    componentDidMount: function () {
        scheduleManagementStore.listen(this.onStoreChange);
        this.addEventListener();
        this.updateEvents();
    },
    updateEvents: function () {
        var _this = this;
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            defaultView: 'agendaDay',//基础天视图, 默认展示天视图
            header: {
                left: "",//即使为空也要加
                center: 'prev,title,next,today',
                right: 'month,agendaWeek,agendaDay'
            },
            height: 700,
            contentHeight: 600,
            monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            today: ["今天"],
            buttonText: {
                today: '返回今天',
                month: '月',
                week: '周',
                day: '天',
                prev: '<',
                next: '>'
            },
            defaultdate: moment().format(oplateConsts.DATE_FORMAT),//默认时间
            events: function (start, end, timezone, callback) {
                var view = $('#calendar').fullCalendar('getView');
                var viewName = view.name;
                var startTime = Date.parse(new Date($.fullCalendar.formatDate(start, "YYYY-MM-DD HH:mm:ss")));
                var endTime = Date.parse(new Date($.fullCalendar.formatDate(end, "YYYY-MM-DD HH:mm:ss")));
                var constObj = {
                    page_size: 1000,//现在是把所有的日程都取出来，先写一个比较大的数字，后期可能会改成根据切换的视图类型选择不同的pagesize
                    //把今天0点作为判断是否过期的时间点
                    start_time: startTime,
                    end_time: endTime,
                    sort_field: "start_time",//排序字段 按开始时间排序
                    order: "ascend"//排序方式，按升序排列
                };
                $.ajax({
                    url: '/rest/get/schedule/list',
                    dataType: 'json',
                    type: 'get',
                    data: constObj,
                    success: function (data) {
                        var events = _this.processForList(data.list, viewName);
                        if (!events.length){
                            //如果左侧没有数据，则左侧面板不展示
                            _this.setState({
                                isShowExpiredPanel:false
                            });
                        }
                        callback(events);
                    },
                    error: function (errorMsg) {
                        message.error(Intl.get("schedule.get.schedule.list.failed", "获取日程管理列表失败"));
                    }
                });
            },
            //用于渲染内容
            eventRender: function (event, element) {
                //展示开始和结束时间
                element.find(".fc-time").html(moment(event.start).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) + "-" + moment(event.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT));
                //周和月视图，用title展示日程的信息
                //todo 下个版本的周和月视图会改掉，这里暂时先这样展示
                if (event.dateType == "agendaWeek" || "month") {
                    var textVal = element.find(".fc-time").text() + " " + element.find(".fc-title").text() + " " + element.find(".fc-inner-content").text();
                    element.closest(".fc-event").attr("title", textVal);
                }
            },
            eventAfterAllRender: function (view) {
                //过滤数据
                var currentTime = $('#calendar').fullCalendar('getDate').format(oplateConsts.DATE_FORMAT);
                //某一天的开始和结束时间 结束时间用moment算出来的是23：59：59，但是组件中全天的时间默认值是第二天的00:00:00
                //所以之前对endtime的处理都加了1000秒
                var startTime =  moment(currentTime).startOf("day").toDate().getTime();
                var endTime = moment(currentTime).endOf("day").toDate().getTime() + 1000;
                var scheduleList = _.filter(_this.state.scheduleTableList, (list) => {
                    return list.start_time >= startTime && list.end_time <= endTime;
                });
                //天视图的时候，用自己写的展示样式
                if (view.name == "agendaDay") {
                    if (!_this.state.haveAddListener){
                        $("#calendar").on("click", ".fc-today-button", function () {
                            scheduleManagementEmitter.emit(scheduleManagementEmitter.SCHEDULE_TABLE_UNMOUNT);
                        });
                        _this.setState({"haveAddListener":true});
                    }
                    $("#calendar .fc-view.fc-agendaDay-view table tbody").html("").css({"display": "block"});
                    ReactDOM.render(
                        <Translate Template={<DayAgendaScheduleLists
                            scheduleList={scheduleList}
                            handleScheduleItemStatus={_this.handleScheduleItemStatus}
                            showCustomerDetail={_this.showCustomerDetail}
                        />}></Translate>,
                        $("#calendar .fc-view.fc-agendaDay-view table tbody")[0]
                    );
                }
            }
        })
    },

    //把数据转换成组件需要的类型
    processForList: function (originList, dateType) {
        if (!_.isArray(originList)) return [];
        let list = _.clone(originList);
        for (let i = 0, len = list.length; i < len; i++) {
            let curSchedule = list[i];
            curSchedule.dateType = dateType;//日期的类型 比如周，天，月
            curSchedule.title = curSchedule.topic;
            //之前新建日程的时候，把全天的结束时间设置为23:59:59,所以比0点少1s
            if (curSchedule.end_time - curSchedule.start_time == 86399000) {
                curSchedule.end_time = curSchedule.end_time + 1000;
                curSchedule.allDay = true;
            }
            ;
            curSchedule.start = moment(curSchedule.start_time).format(oplateConsts.DATE_TIME_FORMAT);
            curSchedule.end = moment(curSchedule.end_time).format(oplateConsts.DATE_TIME_FORMAT);
            curSchedule.description = curSchedule.content;
        }
        //状态是已完成的日程
        var hasFinishedList = _.filter(list, (item) => {
            return item.status == "handle";
        });
        //未完成的日程
        var notFinishedList = _.filter(list, (item) => {
            return item.status == "false";
        });
        //不是全天日程
        var notFulldaylist = _.filter(notFinishedList, (item) => {
            return !item.allDay;
        });
        //全天的日程
        var Fulldaylist = _.filter(notFinishedList, (item) => {
            return item.allDay;
        });
        //对日程数据进行排序，把全天的放在最上面，已完成的放在最下面
        var sortedList = _.flatten([Fulldaylist, notFulldaylist, hasFinishedList]);
        this.setState({
            scheduleTableList: sortedList,
        });
        return sortedList;
    },
    componentWillUnmount: function () {
        scheduleManagementStore.unlisten(this.onStoreChange);
    },
    //点击日程列表中的标记为完成
    handleScheduleItemStatus: function (item, event) {
        const reqData = {
            id: item.id,
            status: "handle",
        };
        scheduleManagementAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id": item.id,
                };
                $(event.target).closest(".list-item").removeClass("selected-customer").addClass("has-handled").find("button").hide();
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败"));
            }
        });
    },
    //查看客户的详情
    showCustomerDetail: function (customer_id, event) {
        //加上背景颜色
        $(event.target).closest(".list-item").addClass("selected-customer");
        //如果点击到更改状态的按钮上，就不用展示客户详情了
        if (event.target.className == "ant-btn ant-btn-primary") {
            return;
        }
        this.setState({
            curCustomerId: customer_id,
            rightPanelIsShow: true
        });
    },
    //关闭右侧客户详情
    hideRightPanel: function () {
        $(".list-item.selected-customer").removeClass("selected-customer");
        this.setState({
            curCustomerId: "",
            rightPanelIsShow: false
        })
    },
    ShowCustomerUserListPanel: function (data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });
    },
    closeCustomerUserListPanel() {
        this.setState({
            isShowCustomerUserListPanel: false
        })
    },

    renderModalContent: function () {
        return (
            <div>
                <p>{Intl.get("crm.4", "客户名称")}：{this.state.isEdittingItem.customer_name}</p>
                <p>{Intl.get("schedule.management.schedule.content", "日程内容")}：{this.state.isEdittingItem.content}</p>
            </div>
        )
    },
    updateExpiredPanelState: function (newStates) {
        this.setState({
            isShowExpiredPanel: newStates.isShowExpiredPanel,
            isFirstLogin: false,
        })
    },
    render: function () {
        //右侧日程列表动画 如果没有超时日程，那么左侧日程列表不显示
        var calendarCls = classNames({
            "initial-calendar-panel": this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "expand-calendar-panel": !this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "nodata-left-expired-panel": !this.state.isShowExpiredPanel && this.state.isFirstLogin
        });
        return (
            <div data-tracename="日程管理界面" className="schedule-list-content">
                <ExpireScheduleLists
                    isShowExpiredPanel={this.state.isShowExpiredPanel}
                    isFirstLogin={this.state.isFirstLogin}
                    updateExpiredPanelState={this.updateExpiredPanelState}
                    showCustomerDetail={this.showCustomerDetail}
                />
                <div id="calendar-wrap" className={calendarCls} data-tracename="日程列表界面">
                    <div id="calendar">
                    </div>
                </div>
                {/*右侧客户详情*/}
                {this.state.rightPanelIsShow ? (
                    <CrmRightPanel
                        showFlag={this.state.rightPanelIsShow}
                        currentId={this.state.curCustomerId}
                        hideRightPanel={this.hideRightPanel}
                        refreshCustomerList={function () {
                        }}
                        ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                    />) : null}
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={this.state.CustomerInfoOfCurrUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={this.state.CustomerInfoOfCurrUser.name}
                        /> : null
                    }
                </RightPanel>
            </div>
        )
    }
});
module.exports = ScheduleManagement;