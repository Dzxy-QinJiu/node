/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
require("./scss/index.scss");
require("jquery-ui");
require("fullcalendar");
require("fullcalendar/dist/locale/zh-cn");
require("fullcalendar/dist/fullcalendar.css");
// require("fullcalendar/dist/fullcalendar.print.css");
// require("bootstrap/dist/css/bootstrap.css");
var RightContent = require('CMP_DIR/privilege/right-content');
var FilterBlock = require('CMP_DIR/filter-block');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import Trace from "LIB_DIR/trace";
import {message, Icon, Row, Col, Button, Alert, Input} from "antd";
import AlwaysShowSelect from "CMP_DIR/always-show-select";
var hasPrivilege = require("CMP_DIR/privilege/checker").hasPrivilege;
var scheduleManagementStore = require("./store/schedule-management-store");
var scheduleManagementAction = require("./action/schedule-management-action");
// 没有消息的提醒
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
var Spinner = require("CMP_DIR/spinner");
var classNames = require("classnames");
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import AlertTimer from "CMP_DIR/alert-timer";
import scheduleManagementAjax from "./ajax/schedule-management-ajax";
var DateSelectorUtils = require("CMP_DIR/datepicker/utils");
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
import userData from "PUB_DIR/sources/user-data";
var user_id = userData.getUserData().user_id;
const ScheduleManagement = React.createClass({
    getInitialState: function () {
        return {
            start_time : "",//日程的开始时间
            end_time : "",//日程的结束时间
            status : "",//选择日程的状态
            ...scheduleManagementStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(scheduleManagementStore.getState(),()=>{
            var pageList = this.processForList(this.state.scheduleExpiredList);
            if (pageList){
                this.updateEvents(pageList);
            }
        });
    },
    //获取过期日程列表(不包含今天)
    getScheduleList: function (callback) {
        var constObj = {
            page_size: this.state.pageSize,
            //把今天0点作为判断是否过期的时间点
            start_time: this.state.start_time,
            end_time: this.state.end_time,
            status: this.state.status
        };
        if (this.state.lastScheduleExpiredId) {
            constObj.id = this.state.lastScheduleExpiredId;
        }
        var condition = _.extend({}, constObj);
        // if (filterObj){
        //     _.extend(condition, filterObj);
        // }
        scheduleManagementAction.getScheduleList(condition, callback);
    },
    updateEvents: function (eventsList) {
        //计算今天是周几
        var hiddenDay = _.filter([0, 1, 2, 3, 4, 5, 6], (num) => {
            return num != moment().format("d")
        });
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            // theme: true,
            defaultView: 'agendaDay',//基础天视图, basicDay
            header: {
                left: ' ',
                center: 'prev,title,next,today',
                right: 'month,agendaWeek,agendaDay'
            },
            height: 700,
            contentHeight: 600,
            // allDaySlot:false,//顶部是否显示全天
            // slotEventOverlap:false,//设置事件是否相互遮盖


            // editable: true,
            // eventLimit: true,
            // allDaySlot: true,
            monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            today: ["今天"],
            buttonText: {
                today: '返回今天',
                month: '月',
                week: '周',
                day:'天',
                prev: '<',
                next: '>'
            },
            // hiddenDays: hiddenDay,//隐藏一周的几天,隐藏一周中的某一天或某几天
            defaultdate: moment().format(oplateConsts.DATE_FORMAT),
            events: eventsList,
            //用于渲染内容
            eventRender: function(event, element) {
                element.find(".fc-time").html(moment(event.start).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)+"-"+ moment(event.end).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT));
                //如果是天,就要加上内容
                if (event.dateType == "day"){
                    //加上内容
                    element.find(".fc-title").after(`<span class="fc-content">${event.description}</span>`);
                }

            },
            ////数据绑定上去后添加相应信息在页面上
            eventAfterRender: function (event, element, view) {
                console.log("视图名称",view.name);
            },

            //点击某个具体日期，不包括右上角的时间槽
            // dayClick: function(date, allDay, jsEvent, view) {
            //   alert("111");
            // },
            eventClick: function(event) {
               alert("222");
            },
            //todo 动态把数据取出来 暂时没用到
            /*
            viewDisplay: function (view) {//动态把数据查出，按照月份动态查询
                var viewStart = this.state.start_time;
                var viewEnd = this.state.end_time;
                $("#calendar").fullCalendar('removeEvents');
                $.post("http://www.cnblogs.com/sr/AccessDate.ashx", { start: viewStart, end: viewEnd }, function (data) {
                    var resultCollection = jQuery.parseJSON(data);
                    $.each(resultCollection, function (index, term) {
                        $("#calendar").fullCalendar('renderEvent', term, true);
                    });
                }); //把从后台取出的数据进行封装以后在页面上以fullCalendar的方式进行显示
            },*/
        })
    },
    componentDidMount: function () {
        scheduleManagementStore.listen(this.onStoreChange);
        //获取超时的日程
        this.setState({
            start_time : new Date().getTime()-365*2*24*3600*1000,//开始时间传一个两年前的今天
            end_time : TimeStampUtil.getTodayTimeStamp().start_time,//今日早上的零点作为结束时间
            status : false,//选择日程的状态
        },()=>{
            this.getScheduleList();
        });

        //获取今天的日程
        setTimeout(()=>{
           this.setState({
               start_time : new Date().getTime()-365*2*24*3600*1000,//今日开始时间 TimeStampUtil.getTodayTimeStamp().start_time
               end_time : TimeStampUtil.getTodayTimeStamp().end_time,//今日结束时间
               status : "",//选择日程的状态
               lastScheduleExpiredId:"",//最后一个的id
           },()=>{
               this.getScheduleList((originList)=>{
                   //获取的是今天的日程管理列表
                   var pageList = this.processForList(originList,"day");
                   if (pageList){
                       this.updateEvents(pageList);
                   }
               });
           })
        });




        //you can pass the eventsList as a prop
        // var timeRange = DateSelectorUtils.getTodayTime();
        // var filterObj = {
        //     //把今天0点作为判断是否过期的时间点
        //     start_time:new Date().getTime()-365*2*24*3600*1000,//开始时间传一个两年前的今天
        //     end_time : new Date().setHours(0, 0, 0, 0),
        //     status:false
        // };

    },
    //把数据转换成组件需要的类型
    processForList:function (originList,dateType) {
        if (!_.isArray(originList)) return [];
        let list = _.clone(originList);
        for (let i = 0, len = list.length; i < len; i++) {
            let curSchedule = list[i];
            curSchedule.dateType = dateType;//日期的类型 比如周，天，月
            curSchedule.title = curSchedule.topic;
            curSchedule.start = moment(curSchedule.start_time).format(oplateConsts.DATE_TIME_FORMAT);
            curSchedule.end = moment(curSchedule.end_time).format(oplateConsts.DATE_TIME_FORMAT);
            curSchedule.description = curSchedule.content;
            // curSchedule.allDayDefault = true;
        }
        return list;
    },
    componentDidUpdate: function () {
        this.updateEvents()  //you can pass eventsList as a prop
    },
    componentWillUnmount: function () {
        scheduleManagementStore.unlisten(this.onStoreChange);
    },
    //标记为完成
    handleMarkFinishStatus:function (item) {
        const reqData = {
            id: item.id,
            status: "handle",
        };
        scheduleManagementAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id":item.id,
                };
                scheduleManagementAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list","修改待办事项状态失败"));
            }
        });
    },
    //渲染过期日程列表
    renderExpireListContent: function () {
        //加载出错或者没有数据时
        if (this.state.scheduleExpiredErrMsg && !this.state.isLoadingScheduleExpired) {
            var retry = (
                <span>
                    {this.state.scheduleExpiredErrMsg}，<a href="javascript:void(0)"
                                                          onClick={this.getScheduleList()}>
                    {Intl.get("common.retry", "重试")}
                </a>
                </span>
            );
            return (
                <div className="schedule-list-error">
                    <Alert
                        message={retry}
                        type="error"
                        showIcon={true}
                    />
                </div>
            )
        } else if (!this.state.scheduleExpiredList.length && !this.state.isLoadingScheduleExpired) {
            return (
                <div className="schedule-list-no-data">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else {
            var divHeight = 720;
            return (
                <div className="list-container" style={{height: divHeight}}>
                    <GeminiScrollbar
                        className="scrollbar-container"
                        handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}
                    >
                        {_.map(this.state.scheduleExpiredList, (item) => {
                            var cls = classNames("iconfont", {
                                "icon-visit": item.type == "visit",
                                "icon-phone-busy": item.type == "calls",
                                "": item.type == "other"
                            });
                            return (
                                <div className="list-item">
                                    <h4 className="item-title">
                                    <span>
                                        {moment(item.start_time).format(oplateConsts.DATE_FORMAT)}
                                    </span>
                                    <span className="pull-right">
                                        {moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)} - {moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                                    </span>
                                    </h4>
                                    <p className="item-customer-content">
                                        <i className={cls}></i>
                                        <span>
                                        {item.customer_name}
                                        </span>
                                    </p>
                                    <p className="item-schedule-content">
                                        <span>
                                            <span className="label">{Intl.get("crm.177","内容")}</span>
                                            <span className="content">{item.content}</span>
                                        </span>
                                        {item.socketio_notice ?
                                            <span>
                                                <span className="label">{Intl.get("schedule.list.remind","提醒")}</span>
                                                <span className="content">{moment(item.alert_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</span>
                                            </span>
                                            : null}

                                    </p>
                                    <p className="item-handle-content">
                                        {user_id == item.member_id ?
                                            <Button type="primary" onClick={this.handleMarkFinishStatus.bind(this, item)}>{Intl.get("schedule.list.mark.finish","标记为完成")}
                                                {this.state.handleStatusLoading ?<Icon type="loading"/>:null}</Button> : <span>{Intl.get("schedule.create.person","创建人")}: {item.member_nick}</span>}
                                    </p>
                                </div>
                            )

                        })
                        }
                    </GeminiScrollbar>
                </div>

            )
        }
    },
    handleScrollBarBottom: function () {
        var currListLength = _.isArray(this.state.scheduleExpiredList) ? this.state.scheduleExpiredList.length : 0;
        // 判断加载的条件
        if (currListLength < this.state.scheduleExpiredSize) {
            this.getScheduleList();
        }
    },
    render: function () {
        var cls = classNames("is-loading-schedule-list", {
            "show-spinner": this.state.isLoadingScheduleExpired && !this.state.lastScheduleExpiredId
        });
        // const hide = function () {
        //     //todo 修改
        //     this.setState({handleStatusErrMsg: ""});
        // };
        return (
            <div className="schedule-list-content">
                <div id="expire-list-content">
                    <div className="expire-list-title">
                        {Intl.get("schedule.expired.list", "超时未完成")}
                    </div>
                    <div className="expire-list-content">
                        <div className={cls}>
                            {(this.state.isLoadingScheduleExpired && !this.state.lastScheduleExpiredId) ?
                                <Spinner /> : null}
                        </div>
                        {/*渲染超时未完成日程列表*/}
                        {this.renderExpireListContent()}
                        {/*<AlertTimer time={10000} message={this.state.handleStatusErrMsg} type="error" showIcon*/}
                                    {/*onHide={hide.bind(this)}/>*/}
                    </div>
                </div>
                <div id="calendar">

                </div>
            </div>
        )
    }
});
module.exports = ScheduleManagement;