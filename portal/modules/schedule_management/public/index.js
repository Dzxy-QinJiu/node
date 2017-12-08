/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/8.
 */
require("./scss/index.scss");
require("jquery-ui");
require("fullcalendar");
require("fullcalendar/dist/locale/zh-cn");
var language = require("PUB_DIR/language/getLanguage");
if (language.lan() == "es") {
    require("fullcalendar/dist/locale/es");
}else if (language.lan() == "zh"){
    require("fullcalendar/dist/locale/zh-cn");
}else if (language.lan() == "en"){
    require("fullcalendar/dist/locale/en-gb");
}
require("fullcalendar/dist/fullcalendar.css");
import Trace from "LIB_DIR/trace";
import {message, Icon, Row, Col, Button, Alert, Modal} from "antd";
var scheduleManagementStore = require("./store/schedule-management-store");
var scheduleManagementAction = require("./action/schedule-management-action");
// 没有消息的提醒
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
var Spinner = require("CMP_DIR/spinner");
var classNames = require("classnames");
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
var DateSelectorUtils = require("CMP_DIR/datepicker/utils");
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
import userData from "PUB_DIR/sources/user-data";
var user_id = userData.getUserData().user_id;
import CrmRightPanel  from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
const ScheduleManagement = React.createClass({
    getInitialState: function () {
        return {
            expired_start_time: "",//过期日程的开始时间
            expired_end_time: "",//过期日程的结束时间
            expired_status: "",//过期日程的状态
            start_time: "",//日程组件中的开始时间
            end_time: "",//日程组件中的结束时间
            status: "",//选择日程的状态
            rightPanelIsShow: false,//是否展示右侧客户详情
            visibleModal: false,//是否展示标记已完成状态的模态框
            isEdittingItem: {},//当前正在编辑的日程
            ...scheduleManagementStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(scheduleManagementStore.getState(), () => {
            this.updateEvents(this.state.scheduleTableList);
        });
    },
    componentDidMount: function () {
        scheduleManagementStore.listen(this.onStoreChange);
        //获取超时未完成的日程
        this.setState({
            expired_start_time: new Date().getTime() - 365 * 2 * 24 * 3600 * 1000,//开始时间传一个两年前的今天
            expired_end_time: TimeStampUtil.getTodayTimeStamp().start_time,//今日早上的零点作为结束时间
            expired_status: false,//选择日程的状态
        }, () => {
            this.getExpiredScheduleList();
        });
        //获取组件中需要展示的日程
        this.setState({
            start_time: new Date().getTime() - 365 * 2 * 24 * 3600 * 1000,//两年前的某个时间
            end_time: TimeStampUtil.getTodayTimeStamp().end_time,//今日结束时间
        }, () => {
            this.getScheduleList("isScheduleList");
        });
        //给日程列表右上角的视图类型加一下处理,在不同的视图下展示的日程的内容不一样，通过类进行控制内容的展示和隐藏
        $("#calendar").on("click", ".fc-month-button", function () {
            $("#calendar").removeClass("weekView-calendar");
            $("#calendar").removeClass("dayView-calendar");
            $("#calendar").addClass("monthView-calendar");
        });
        $("#calendar").on("click", ".fc-agendaWeek-button", function () {
            $("#calendar").removeClass("monthView-calendar");
            $("#calendar").removeClass("dayView-calendar");
            $("#calendar").addClass("weekView-calendar");
        });
        $("#calendar").on("click", ".fc-agendaDay-button", function () {
            $("#calendar").removeClass("monthView-calendar");
            $("#calendar").removeClass("weekView-calendar");
            $("#calendar").addClass("dayView-calendar");
        });
    },
    //获取过期日程列表(不包含今天)
    getExpiredScheduleList: function () {
        var constObj = {
            page_size: this.state.pageSize,
            //把今天0点作为判断是否过期的时间点
            start_time: this.state.expired_start_time,
            end_time: this.state.expired_end_time,
            status: this.state.expired_status
        };
        if (this.state.lastScheduleExpiredId) {
            constObj.id = this.state.lastScheduleExpiredId;
        }
        scheduleManagementAction.getScheduleList(constObj);
    },
    //获取日程列表
    getScheduleList: function (listType) {
        var constObj = {
            page_size: 1000,//现在是把所有的日程都取出来，先写一个比较大的数字，后期可能会改成根据切换的视图类型选择不同的pagesize
            //把今天0点作为判断是否过期的时间点
            start_time: this.state.start_time,
            end_time: this.state.end_time,
            status: this.state.status
        };
        scheduleManagementAction.getScheduleList(constObj, listType);
    },
    //展示没有数据的提示
    showNoMoreDataTip: function () {
        return !this.state.isLoadingScheduleExpired &&
            this.state.scheduleExpiredList.length >= this.state.scheduleExpiredSize &&
            !this.state.listenScrollBottom;
    },
    updateEvents: function (eventsList) {
        var _this = this;
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            defaultView: 'agendaDay',//基础天视图, 默认展示天视图
            header: {
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
            defaultdate: moment().format(oplateConsts.DATE_FORMAT),
            events: eventsList,
            //用于渲染内容
            eventRender: function (event, element) {
                //展示开始和结束时间
                element.find(".fc-time").html(moment(event.start).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) + "-" + moment(event.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT));
                //如果是天视图,就要加上日程提醒的内容
                if (event.dateType == "day") {
                    //加上内容
                    element.find(".fc-title").after(`<span class="fc-inner-content">${event.description || ""}</span>`);
                    //每条日程加上操作按钮
                    // element.find(".fc-content").append(`<span class="handle-finish-btn">${Intl.get("schedule.list.mark.finish", "标记为完成")}</span>`)
                    //给内容加上title属性
                    var textVal = element.find(".fc-time").text() + " " + element.find(".fc-title").text() + " " + element.find(".fc-inner-content").text() ;
                    element.closest(".fc-event").attr("title",textVal);
                };
                if (event.status == "handle") {
                    //已经处理过的日程，加上特殊的样式标识
                    element.closest(".fc-event").addClass("handle-schedule");
                }
            },
            //在天视图和周视图下，点击某个时间，会有个弹框，可以展示详情，修改状态
            eventClick: function (calEvent, jsEvent, view) {
                // if ($(jsEvent.target).hasClass("handle-finish-btn")) {
                //     return;
                // }
                //如果不是自己建的日程或者日程的状态已经是handle的，不弹出修改状态的对话框
                if (user_id != calEvent.member_id || calEvent.status == "handle") {
                    return;
                };
                //展示模态框，
                _this.setState({
                    visibleModal: true,
                    isEdittingItem: calEvent,
                });
            },
        })
    },

    //把数据转换成组件需要的类型
    processForList: function (originList, dateType) {
        if (!_.isArray(originList)) return [];
        let list = _.clone(originList);
        for (let i = 0, len = list.length; i < len; i++) {
            let curSchedule = list[i];
            // curSchedule.dateType = dateType;//日期的类型 比如周，天，月
            curSchedule.title = curSchedule.topic;
            //之前新建日程的时候，把全天的结束时间设置为23:59:59,所以比0点少1s
            if (curSchedule.end_time - curSchedule.start_time == 86399000) {
                curSchedule.end_time = curSchedule.end_time + 1000;
                curSchedule.allDay = true;
            };
            curSchedule.start = moment(curSchedule.start_time).format(oplateConsts.DATE_TIME_FORMAT);
            curSchedule.end = moment(curSchedule.end_time).format(oplateConsts.DATE_TIME_FORMAT);
            curSchedule.description = curSchedule.content;
            curSchedule.block = true;//为了解决日程的遮挡问题，但好像没效果？？？
        }
        return list;
    },
    componentDidUpdate: function () {
        this.updateEvents(this.state.scheduleTableList);
    },
    componentWillUnmount: function () {
        scheduleManagementStore.unlisten(this.onStoreChange);
    },
    //点击模态框的确认按钮
    handleOk: function () {
        var item = this.state.isEdittingItem;
        const reqData = {
            id: item.id,
            status: "handle",
        };
        scheduleManagementAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id": item.id,
                };
                //修改列表中那条日程的status
                this.state.scheduleTableList.forEach((value, index, array) => {
                    if (value.id == this.state.isEdittingItem.id) {
                        this.state.scheduleTableList[index].status = "handle";
                    }
                });
                this.setState({
                    visibleModal: false,
                    scheduleTableList: this.state.scheduleTableList
                });
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败"));
            }
        });

    },
    //关闭模态框
    handleCancel: function () {
        this.setState({
            visibleModal: false,
        });
    },
    //标记为完成
    handleMarkFinishStatus: function (item) {
        const reqData = {
            id: item.id,
            status: "handle",
        };
        scheduleManagementAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id": item.id,
                };
                scheduleManagementAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败"));
            }
        });
    },
    //查看客户的详情
    showCustomerDetail: function (customer_id) {
        this.setState({
            curCustomerId: customer_id,
            rightPanelIsShow: true
        })
    },
    //关闭右侧客户详情
    hideRightPanel: function () {
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
    //渲染过期日程列表
    renderExpireListContent: function () {
        //加载出错或者没有数据时
        if (this.state.scheduleExpiredErrMsg && !this.state.isLoadingScheduleExpired) {
            var retry = (
                <span>
                    {this.state.scheduleExpiredErrMsg}，<a href="javascript:void(0)"
                                                          onClick={this.getExpiredScheduleList()}>
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
                                        {moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                                            - {moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                                    </span>
                                    </h4>
                                    <p className="item-customer-content">
                                        <i className={cls}></i>
                                        <span onClick={this.showCustomerDetail.bind(this, item.customer_id)}>
                                        {item.customer_name}
                                        </span>
                                    </p>
                                    <p className="item-schedule-content">
                                        <span>
                                            <span className="label">{Intl.get("crm.177", "内容")}</span>
                                            <span className="content">{item.content}</span>
                                        </span>
                                        {item.socketio_notice ?
                                            <span>
                                                <span className="label">{Intl.get("schedule.list.remind", "提醒")}</span>
                                                <span
                                                    className="content">{moment(item.alert_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</span>
                                            </span>
                                            : null}

                                    </p>
                                    <p className="item-handle-content">
                                        {user_id == item.member_id ?
                                            <Button type="primary"
                                                    onClick={this.handleMarkFinishStatus.bind(this, item)}>{Intl.get("schedule.list.mark.finish", "标记为完成")}
                                                {this.state.handleStatusLoading ?
                                                    <Icon type="loading"/> : null}</Button> :
                                            <span>{Intl.get("schedule.create.person", "创建人")}: {item.member_nick}</span>}
                                    </p>
                                </div>
                            )

                        })
                        }
                        <NoMoreDataTip
                            show={this.showNoMoreDataTip}
                        />
                    </GeminiScrollbar>
                </div>

            )
        }
    },

    renderModalContent: function () {
        return (
            <div>
                <p>{Intl.get("crm.4", "客户名称")}：{this.state.isEdittingItem.customer_name}</p>
                <p>{Intl.get("schedule.management.schedule.content", "日程内容")}：{this.state.isEdittingItem.content}</p>
            </div>
        )
    },
    handleScrollBarBottom: function () {
        var currListLength = _.isArray(this.state.scheduleExpiredList) ? this.state.scheduleExpiredList.length : 0;
        // 判断加载的条件
        if (currListLength < this.state.scheduleExpiredSize) {
            this.getExpiredScheduleList();
        }
    },
    render: function () {
        var cls = classNames("is-loading-schedule-list", {
            "show-spinner": this.state.isLoadingScheduleExpired && !this.state.lastScheduleExpiredId
        });
        return (
            <div className="schedule-list-content" data-tracename="日程管理界面">
                <div id="expire-list-content" data-tracename="超时未完成日程界面">
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
                    </div>
                </div>
                <div id="calendar">
                </div>
                <Modal
                    title=""
                    visible={this.state.visibleModal}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText={Intl.get("schedule.list.mark.finish", "标记为完成")}
                    cancelText={Intl.get("config.manage.realm.canceltext", "取消")}
                >
                    <p>
                        {this.state.isEdittingItem ? this.renderModalContent() : null}
                    </p>
                </Modal>
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