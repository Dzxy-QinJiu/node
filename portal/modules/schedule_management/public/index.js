/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/8.
 */
require("./css/index.less");
require("react-big-calendar/lib/css/react-big-calendar.css");
import Trace from "LIB_DIR/trace";
import {message, Icon, Button, Alert, Checkbox} from "antd";
const CheckboxGroup = Checkbox.Group;
var scheduleManagementStore = require("./store/schedule-management-store");
var scheduleManagementAction = require("./action/schedule-management-action");
var classNames = require("classnames");
import CrmRightPanel  from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
//天视图组件
import DayAgendaScheduleLists from './views/day-agenda-schedule-lists';
//周视图组件
import WeekAgendaScheduleLists from './views/week-agenda-schedule-list';
import ExpireScheduleLists from './views/expire-schedule-lists';
import BigCalendar from "react-big-calendar";
import moment from "moment";
BigCalendar.momentLocalizer(moment);
const CALENDAR_LAYOUT = {
  TOPANDBOTTOM:50
};
//自定义的点击日程数字后，日程列表的样式
import CustomEvent from "./views/customer-event";
const LESSONESECOND = 24 * 60 * 60 * 1000 - 1000;//之前添加日程时，一天的开始时间是00:00:00 到24:59:59秒，但是这个组件中认为的一天是从第一天的00;00：00 到第二天的00:00：00 。所以存储的全天的日程就被认为少了1000毫秒 但是可以通过加allday这个属性，被分到全天的日程中
const ScheduleManagement = React.createClass({
    getInitialState: function () {
        return {
            rightPanelIsShow: false,//是否展示右侧客户详情
            scheduleTableListTotal: 0,//日程列表是数量
            isShowExpiredPanel: true,//是否展示左侧超时面板
            isFirstLogin: true,//是否是第一次登录的时候
            dayLists: [],//天视图所用的日程数据
            weekLists: [],//周视图所用的日程数据
            calendarLists: [],//右侧日程列表中的日程数据
            curViewName:"day",//当前被按下的视图的名称
            curCustomerId:"",//查看详情的客户的id
            filterScheduleType:"calls,visit,other",//要过滤的日程类型 默认展示全部类型的
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
    //根据不同视图对日程数据进行处理
    handleScheduleData:function (events,viewType) {
        var _this = this;
        if (viewType == "day"){
            this.setState({
                dayLists: events//日视图的数据
            });
        }else if (viewType == "week") {
            var weekScheduleLists = {
                "Mon":[],"Tus":[],"Wed":[],"Thur":[],"Fri":[],"Sat":[],"Sun":[]
            };
            _.map(events, (even)=>{
                //对数据进行处理
                var Week = moment(even.start_time).format('dddd');
                switch (Week){
                    case Intl.get("schedule.user.time.monday", "星期一"): weekScheduleLists.Mon.push(even);
                        break;
                    case Intl.get("schedule.user.time.tuesday", "星期二"): weekScheduleLists.Tus.push(even);
                        break;
                    case Intl.get("schedule.user.time.wednesday", "星期三"): weekScheduleLists.Wed.push(even);
                        break;
                    case Intl.get("schedule.user.time.thursday", "星期四"): weekScheduleLists.Thur.push(even);
                        break;
                    case Intl.get("schedule.user.time.friday", "星期五"): weekScheduleLists.Fri.push(even);
                        break;
                    case Intl.get("schedule.user.time.saturday", "星期六"): weekScheduleLists.Sat.push(even);
                        break;
                    case Intl.get("schedule.user.time.sunday", "星期日"): weekScheduleLists.Sun.push(even);
                        break;
                    default:
                        break;
                }
            });
            this.setState({
                weekLists: weekScheduleLists//周视图的数据
            });
        }else{
            var monthEvent = [];
            //以日程所在天的零点为key，对数据按天进行分组
            var lists = _.groupBy(events, 'DayStart');
            for (var key in lists) {
                var item = lists[key];
                monthEvent.push(
                    {
                        "start": item[0].start,//某个日程的开始时间
                        "end": item[0].end,//某个日程的结束时间
                        "count": item.length >99 ? "99+" :item.length ,
                        "totalCustomerObj": item,
                        "showCustomerDetail":_this.showCustomerDetail,
                    }
                );
            }
            this.setState({
                calendarLists: monthEvent//月视图的数据
            });
        }
    },

    //获取日程列表的方法
    getAgendaData: function (dateObj, viewType) {
        var _this = this;
        var startTime = dateObj.start_time;
        var endTime = dateObj.end_time;
        //如果三个类型都不选，就不用发请求，直接返回空数组
        if(!this.state.filterScheduleType){
            this.handleScheduleData([],viewType);
            return;
        }
        var constObj = {
            page_size: 1000,//现在是把所有的日程都取出来，先写一个比较大的数字，后期可能会改成根据切换的视图类型选择不同的pagesize
            start_time: startTime,
            end_time: endTime,
            sort_field: "start_time",//排序字段 按开始时间排序
            order: "ascend",//排序方式，按升序排列
            type:this.state.filterScheduleType//过滤日程的类型
        };
        $.ajax({
            url: '/rest/get/schedule/list',
            dataType: 'json',
            type: 'get',
            data: constObj,
            success: function (data) {
                var events = _this.processForList(data.list);
                _this.handleScheduleData(events,viewType);
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
                curSchedule.allDay = true;
            }
            //The start date/time of the event. Must resolve to a JavaScript Date object.
            curSchedule.start = new Date(curSchedule.start_time);
            curSchedule.end = new Date(curSchedule.end_time);
            //给每条日程加一个DayStart字段，标识日程所在天的零点
            // 后期要以日程所在天的零点为key，以天为单位进行分组
            curSchedule.DayStart = moment(curSchedule.start_time).startOf("day").valueOf();
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
        //如果点击到更改状态的按钮上，就不用展示客户详情了
        if (event && event.target.className == "ant-btn ant-btn-primary") {
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
        });
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
        });
    },

    renderModalContent: function () {
        return (
            <div>
                <p>{Intl.get("crm.4", "客户名称")}：{this.state.isEdittingItem.customer_name}</p>
                <p>{Intl.get("schedule.management.schedule.content", "日程内容")}：{this.state.isEdittingItem.content}</p>
            </div>
        );
    },
    updateExpiredPanelState: function (newStates) {
        this.setState({
            isShowExpiredPanel: newStates.isShowExpiredPanel,
            isFirstLogin: false,
        });
    },
    //切换不同的视图
    changeView: function (viewName) {
        var preViewName = this.state.curViewName;
        this.state.curViewName = viewName;
        this.setState({
            curViewName:this.state.curViewName
        });
        //如果从月视图点击日期跳转到日视图，也会触发handleNavigateChange，先走changeView方法，这时候取到的日期是上一次的日期，取到的数据是上次的数据，走handleNavigateChange会取到正确的数据，但是不知道两次谁先返回，故会出现错误数据，所以在月视图跳转到日视图的时候，限制值发一次请求就可以了
        if (preViewName === "month" && viewName === "day"){
            return;
        }
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
    //点击 前，后翻页，点击月视图的日期跳转到日视图,或者返回今天的按钮
    handleNavigateChange: function (date) {
        var view = this.state.curViewName;
        //把当前展示视图的时间记录一下
        scheduleManagementStore.setViewDate(moment(date).valueOf());
        var dateObj = this.getDifTypeStartAndEnd(date, view);
        this.getAgendaData(dateObj, view);
    },
    onCheckChange:function (checkedValue) {
        var filterScheduleType = checkedValue.join(",");
        this.setState({
            filterScheduleType:filterScheduleType
        },()=>{
            var viewName = this.state.curViewName;
            var dateObj = this.getDifTypeStartAndEnd(scheduleManagementStore.getViewDate(), viewName);
            //重新获取数据
            this.getAgendaData(dateObj,viewName);
        });
    },
    render: function () {
        //右侧日程列表动画 如果没有超时日程，那么左侧日程列表不显示
        var calendarCls = classNames({
            "initial-calendar-panel": this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "expand-calendar-panel": !this.state.isShowExpiredPanel && !this.state.isFirstLogin,
            "nodata-left-expired-panel": !this.state.isShowExpiredPanel && this.state.isFirstLogin
        });
        var height = $(window).height() - CALENDAR_LAYOUT.TOPANDBOTTOM;
        //月视图顶部标题的日期样式
        var formats = {
            "monthHeaderFormat": (date, culture, localizer) => {
                return localizer.format(date, "YYYY" + Intl.get("common.time.unit.year", "年")+ "MM" + Intl.get("common.time.unit.month", "月"), culture);
            }
        };
        const options = [
            { label: <span><i className="iconfont icon-phone-busy"></i>{Intl.get("schedule.phone.connect","电联")}</span>, value: 'calls' },
            { label: <span><i className="iconfont icon-schedule-visit"></i>{Intl.get("common.visit", "拜访")}</span>, value: 'visit' },
            { label: <span><i className="iconfont icon-schedule-other"></i>{Intl.get("common.others", "其他")}</span>, value: 'other' },
        ];
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
                        <div className="check-group-container">
                            <CheckboxGroup options={options} defaultValue={['calls','visit','other']} onChange={this.onCheckChange} />
                        </div>
                        <BigCalendar
                            events = {this.state.calendarLists}
                            onView = {this.changeView}
                            defaultView = "day"
                            views={{
                                month: true,
                                week: WeekAgendaScheduleLists,
                                day: DayAgendaScheduleLists,
                            }}
                            components={{event:CustomEvent}}
                            messages = {{
                                month:Intl.get("common.time.unit.month", "月"),
                                week:Intl.get("common.time.unit.week", "周"),
                                today:Intl.get("schedule.back.to.today","今"),
                                previous:"<",
                                next:">",
                                allDay:Intl.get("crm.alert.full.day", "全天"),
                                day: Intl.get("common.time.unit.day", "天"),
                            }}
                            scheduleList={this.state.dayLists}//日视图数据
                            weekLists = {this.state.weekLists}
                            handleScheduleItemStatus={this.handleScheduleItemStatus}
                            showCustomerDetail={this.showCustomerDetail}
                            onNavigate = {this.handleNavigateChange}
                            curCustomerId = {this.state.curCustomerId}
                            formats={formats}
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
            </div>
        );
    }
});
module.exports = ScheduleManagement;