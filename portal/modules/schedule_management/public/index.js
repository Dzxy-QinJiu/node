/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/8.
 */
require("./css/index.less");
require("react-big-calendar/lib/css/react-big-calendar.css");
import Trace from "LIB_DIR/trace";
import {message, Icon, Button, Alert} from "antd";
var scheduleManagementStore = require("./store/schedule-management-store");
var scheduleManagementAction = require("./action/schedule-management-action");
var classNames = require("classnames");
import CrmRightPanel  from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
//天视图组件
import DayAgendaScheduleLists from './views/day-agenda-schedule-lists';
import ExpireScheduleLists from './views/expire-schedule-lists';
import BigCalendar from "react-big-calendar";
import moment from "moment";
BigCalendar.momentLocalizer(moment);
const CALENDAR_LAYOUT = {
  TOPANDBOTTOM:80
};
const LESSONESECOND = 24 * 60 * 60 * 1000 - 1000;//之前添加日程时，一天的开始时间是00:00:00 到24:59:59秒，但是这个组件中认为的一天是从第一天的00;00：00 到第二天的00:00：00 。所以存储的全天的日程就被认为少了1000毫秒 但是可以通过加allday这个属性，被分到全天的日程中
const ScheduleManagement = React.createClass({
    getInitialState: function () {
        return {
            rightPanelIsShow: false,//是否展示右侧客户详情
            scheduleTableListTotal: 0,//日程列表是数量
            isShowExpiredPanel: true,//是否展示左侧超时面板
            isFirstLogin: true,//是否是第一次登录的时候
            dayLists: [],//天视图所用的日程数据
            calendarLists: [],//右侧日程列表中的日程数据
            curViewName:"day",//当前被按下的视图的名称
            ...scheduleManagementStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(scheduleManagementStore.getState());
    },
    componentDidMount: function () {
        scheduleManagementStore.listen(this.onStoreChange);
        //获取今天要展示的数据
        var startTime = moment().startOf('day').valueOf();
        var endTime = moment().endOf('day').valueOf();
        //获取日程数据 第一个参数是开始和结束时间 第二个参数是视图类型
        this.getAgendaData({start_time: startTime, end_time: endTime}, "day");
    },
    //获取日程列表的方法
    getAgendaData: function (dateObj, viewType) {
        var _this = this;
        var startTime = dateObj.start_time;
        var endTime = dateObj.end_time;
        var constObj = {
            page_size: 1000,//现在是把所有的日程都取出来，先写一个比较大的数字，后期可能会改成根据切换的视图类型选择不同的pagesize
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
                var events = _this.processForList(data.list);
                if (viewType == "day"){
                    _this.setState({
                        dayLists: events//日试图的数据
                    })
                }else{
                    _this.setState({
                        calendarLists: events//周和月视图的数据
                    })

                }
            },
            error: function (errorMsg) {
                message.error(Intl.get("schedule.get.schedule.list.failed", "获取日程管理列表失败"));
            }
        });
    },

    //把数据转换成组件需要的类型
    processForList: function (originList) {
        if (!_.isArray(originList)) return [];
        let list = _.clone(originList);
        for (let i = 0, len = list.length; i < len; i++) {
            let curSchedule = list[i];
            curSchedule.title = curSchedule.topic;
            //之前新建日程的时候，把全天的结束时间设置为23:59:59,所以比0点少1s
            if (curSchedule.end_time - curSchedule.start_time == LESSONESECOND) {
                curSchedule.end_time = curSchedule.end_time + 1000;
                curSchedule.allDay = true;
            };
            //The start date/time of the event. Must resolve to a JavaScript Date object.
            curSchedule.start = new Date(curSchedule.start_time);
            curSchedule.end = new Date(curSchedule.end_time);
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
                //标记为完成后，把样式改成标记完成的样式
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
    //切换不同的视图
    changeView: function (viewName) {
        //获取当前视图的开始和结束时间
        var dateObj = this.getDifTypeStartAndEnd(scheduleManagementStore.getViewDate(), viewName);
        //获取日程数据
        this.getAgendaData(dateObj, viewName);
    },
    //获取不同视图的开始和结束时间
    getDifTypeStartAndEnd: function (date, view) {
        var dateObj = {
            start_time: "",
            end_time: ""
        };
        switch (view) {
            case 'day':
                dateObj.start_time = moment(date).startOf("day").valueOf();
                dateObj.end_time = moment(date).endOf("day").valueOf();
                break;
            case 'week':
                dateObj.start_time = moment(date).startOf("week").valueOf();
                dateObj.end_time = moment(date).endOf("week").valueOf();
                break;
            case 'month':
                dateObj.start_time = moment(date).startOf("month").valueOf();
                dateObj.end_time = moment(date).endOf("month").valueOf();
                break;
        }
        return dateObj;
    },
    //点击 前，后翻页，或者返回今天的按钮
    handleNavigateChange: function (date, view) {
        //把当前展示视图的时间记录一下
        scheduleManagementStore.setViewDate(moment(date).valueOf());
        var dateObj = this.getDifTypeStartAndEnd(date, view);
        this.getAgendaData(dateObj, view);
    },
    render: function () {
        //右侧日程列表动画 如果没有超时日程，那么左侧日程列表不显示
        var calendarCls = classNames({
            "initial-calendar-panel": this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "expand-calendar-panel": !this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "nodata-left-expired-panel": !this.state.isShowExpiredPanel && this.state.isFirstLogin
        });
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        return (
            <div data-tracename="日程管理界面" className="schedule-list-content">
                <ExpireScheduleLists
                    isShowExpiredPanel={this.state.isShowExpiredPanel}
                    isFirstLogin={this.state.isFirstLogin}
                    updateExpiredPanelState={this.updateExpiredPanelState}
                    showCustomerDetail={this.showCustomerDetail}
                />
                <div id="calendar-wrap" className={calendarCls} data-tracename="日程列表界面">
                    <div id="calendar" style={{height:height}}>
                        <BigCalendar
                            events = {this.state.calendarLists}
                            onView = {this.changeView}
                            defaultView = "day"
                            views={{
                                month: true,
                                week: true,
                                day: DayAgendaScheduleLists,
                            }}
                            messages = {{
                                month:Intl.get("common.time.unit.month", "月"),
                                week:Intl.get("common.time.unit.week", "周"),
                                today:Intl.get("schedule.back.to.today","返回今天"),
                                previous:"<",
                                next:">",
                                allDay:Intl.get("crm.alert.full.day", "全天"),
                                day: Intl.get("common.time.unit.day", "天"),
                            }}
                            scheduleList={this.state.dayLists}
                            handleScheduleItemStatus={this.handleScheduleItemStatus}
                            showCustomerDetail={this.showCustomerDetail}
                            onNavigate = {this.handleNavigateChange}
                            onSelectEvent={(data)=>{
                                this.setState({
                                    curCustomerId: data.customer_id,
                                    rightPanelIsShow: true
                                });
                            }}
                            popup={true}//月视图有多个的时候，可以点击后出弹框
                        />
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