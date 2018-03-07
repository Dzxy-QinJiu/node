var RightContent = require("CMP_DIR/privilege/right-content");
require("./css/index.less");
var TopNav = require("CMP_DIR/top-nav");
import {Collapse} from "antd";
const Panel = Collapse.Panel;
var SalesHomeStore = require("./store/sales-home-store");
var SalesHomeAction = require("./action/sales-home-actions");
import {hasPrivilege} from "CMP_DIR/privilege/checker";
let TimeUtil = require("PUB_DIR/sources/utils/time-format-util");
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
import AppUserLists from "./view/app-user-lists";
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var classNames = require("classnames");
import CustomerRecord from "MOD_DIR/crm/public/views/customer_record";
// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
    PHONE: 'phone',
    APP: 'app'
};
//不同列表的类型
const ALL_LISTS_TYPE = {
    SCHEDULE_TODAY: "schedule_today",//今日计划联系日程列表
    WILL_EXPIRED_SCHEDULE_TODAY: "will_expired_schedule_today",//今日到期的日程
    APP_ILLEAGE_LOGIN: "app_illeage_login",// 停用后登录
    CONCERNED_CUSTOMER_LOGIN: "concerned_customer_login",//关注客户登录
    REPEAT_CUSTOMER: "repeat_customer",//重复客户
    WILL_EXPIRED_ASSIGN_CUSTOMER:"will_expired_assign_customer",//即将到期的签约用户
    WILL_EXPIRED_TRY_CUSTOMER:"will_expired_try_customer"//即将到期的试用用户
};

var SalesHomePage = React.createClass({
    getInitialState: function () {
        return {
            ...SalesHomeStore.getState()
        }
    },
    componentDidMount: function () {
        SalesHomeStore.listen(this.onChange);
        this.getSalesListData();
    },
    componentWillUnmount: function () {
        SalesHomeStore.unlisten(this.onChange);
    },
    onChange: function () {
        this.setState(SalesHomeStore.getState());
    },
    getSalesListData: function () {
        let queryParams = this.getQueryParams();
        let dataType = this.getDataType();
        queryParams.dataType = dataType;
        SalesHomeAction.getCustomerTotal(queryParams);
        //电话统计取今天的开始和结束时间
        let phoneParams = this.getPhoneParams();
        SalesHomeAction.getphoneTotal(phoneParams);
        //获取今日联系的客户
        SalesHomeAction.getTodayContactCustomer(this.state.rangParams, this.state.page_size, this.state.sorter);
        //获取今日的日程列表
        this.getScheduleListToday();
        //获取今日过期的日程列表
        this.getExpiredScheduleList();
        //获取最近登录的客户
        //获取今天的起止时间
        var todayTimeRange = TimeStampUtil.getTodayTimeStamp();
        //默认获取近7天登录的客户
        SalesHomeAction.getRecentLoginCustomer({
            "start_time": todayTimeRange.start_time - 7 * oplateConsts.ONE_DAY_TIME_RANGE,
            "end_time": todayTimeRange.end_time
        });
        //获取近7天登录的客户数量
        SalesHomeAction.getRecentLoginCustomerCount({
            "start_time": todayTimeRange.start_time - 7 * oplateConsts.ONE_DAY_TIME_RANGE,
            "end_time": todayTimeRange.end_time
        });
        //关注客户登录
        this.getConcernedLogin();
        //停用客户登录
        this.getAppIlleageLogin();
        //获取重复客户列表
        this.getRepeatCustomerList();
        //获取即将到期的试用用户
        this.getWillExpireCustomer("试用用户");
        //获取即将到期的签约用户
        this.getWillExpireCustomer("正式用户");
    },
    getWillExpireCustomer: function (tags) {
        SalesHomeAction.getWillExpireCustomer({tags:tags});
    },
    //重复客户列表
    getRepeatCustomerList: function (lastId) {
        var queryObj = {page_size: this.state.page_size};
        if (lastId) {
            queryObj.id = lastId;
        }
        //获取重复客户列表
        SalesHomeAction.getRepeatCustomerList(queryObj);
    },
    //获取今日的日程列表
    getScheduleListToday: function (lastId) {
        var constObj = {
            page_size: this.state.page_size,
            //把今天0点作为判断是否过期的时间点
            start_time: this.state.start_time,
            end_time: this.state.end_time,
        };
        if (lastId) {
            constObj.id = lastId;
        }
        SalesHomeAction.getScheduleList(constObj);
    },
    //停用客户登录
    getAppIlleageLogin: function (lastId) {
        let noticeQueryObj = {
            notice_type: "appIllegal",
            page_size: this.state.page_size,//默认不传是5
        };
        if (lastId) {
            noticeQueryObj.id = lastId;
        }
        //停用客户登录等消息列表
        SalesHomeAction.getSystemNotices(noticeQueryObj, this.state.status, noticeQueryObj.notice_type);
    },
    //关注客户登录
    getConcernedLogin: function (lastId) {
        let noticeQueryObj = {
            notice_type: "concerCustomerLogin",
            page_size: this.state.page_size,//默认不传是5
        };
        if (lastId) {
            noticeQueryObj.id = lastId;
        }
        //获取关注客户登录
        SalesHomeAction.getSystemNotices(noticeQueryObj, this.state.status, noticeQueryObj.notice_type);
    },

    //获取过期日程列表(不包含今天)
    getExpiredScheduleList: function (lastId) {
        var constObj = {
            page_size: this.state.page_size,
            start_time: new Date().getTime() - 2 * 365 * oplateConsts.ONE_DAY_TIME_RANGE,//开始时间传一个两年前的今天,
            //把今天0点作为判断是否过期的时间点
            end_time: TimeStampUtil.getTodayTimeStamp().start_time,//今日早上的零点作为结束时间
            status: false//日程的状态，未完成的日程
        };
        if (lastId) {
            constObj.id = lastId;
        }
        SalesHomeAction.getScheduleList(constObj, "expired");

    },

    //获取查询参数
    getQueryParams: function () {
        let queryParams = {
            urltype: 'v2',
            starttime: this.state.start_time,
            endtime: this.state.end_time
        };
        // todo 待删除
        if (this.state.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.state.currShowSalesman.userId;
        } else if (this.state.currShowSalesTeam) {
            //查看当前选择销售团队内所有成员的统计数据
            queryParams.team_id = this.state.currShowSalesTeam.group_id;
        }
        return queryParams;
    },
    getPhoneParams: function () {
        let phoneParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            deviceType: this.state.callType || CALL_TYPE_OPTION.ALL
        };
        //todo 待删除
        if (this.state.currShowSalesman) {
            //查看当前选择销售的统计数据
            phoneParams.member_ids = this.state.currShowSalesman.userId;
        } else if (this.state.currShowSalesTeam) {
            //查看当前选择销售团队内所有成员的统计数据
            phoneParams.team_ids = this.state.currShowSalesTeam.group_id;
        }
        return phoneParams;
    },
    getDataType: function () {
        if (hasPrivilege("GET_TEAM_LIST_ALL")) {
            return "all";
        } else if (hasPrivilege("GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS")) {
            return "self";
        } else {
            return "";
        }
    },
    // 点击左侧列表中的某个客户
    handleClickCustomerItem: function (selectedCustomer) {
        SalesHomeAction.setSelectedCustomer(selectedCustomer);
    },

    //渲染今日待联系的日程列表
    renderScheduleListToday: function () {
        return (_.map(this.state.scheduleTodayObj.data.list, (scheduleItem) => {
            var cls = classNames("list-item-wrap", {"cur-customer": scheduleItem.customer_id == this.state.selectedCustomerId}
            );
            return (
                <div className={cls} onClick={this.handleClickCustomerItem.bind(this, scheduleItem)}>
                    <div className="item-header">
                        <span className="customer-name-container">{scheduleItem.customer_name}</span>
                        <span className="schedule-tip pull-right">
                            {scheduleItem.allDay ? Intl.get("crm.alert.full.day", "全天") : <span>
                                {moment(scheduleItem.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}-{moment(scheduleItem.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                    </span>}
                    </span>
                    </div>
                    <div className="item-content">
                        <p>
                            {scheduleItem.content}
                        </p>
                    </div>
                </div>
            )
        }))
    },
    //渲染今日过期的日程
    renderExpiredScheduleList: function () {
        return (_.map(this.state.scheduleExpiredTodayObj.data.list, (scheduleItem) => {
            var cls = classNames("list-item-wrap", {"cur-customer": scheduleItem.customer_id == this.state.selectedCustomerId}
            );
            return (
                <div className={cls} onClick={this.handleClickCustomerItem.bind(this, scheduleItem)}>
                    <div className="item-header">
                        <span className="customer-name-container">{scheduleItem.customer_name}</span>
                        <span className="time-tip pull-right">
                            {scheduleItem.allDay ? Intl.get("crm.alert.full.day", "全天") : <span>
                                {moment(scheduleItem.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}-{moment(scheduleItem.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                    </span>}
                    </span>
                    </div>
                    <div className="item-content">
                        <p>
                            {scheduleItem.content}
                        </p>
                    </div>
                </div>
            )
        }))
    },
    //客户停用后登录
    renderAppIllegalCustomer: function () {
        return (_.map(this.state.appIllegalObj.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item)}>
                        <div className="item-header">
                            <span className="customer-name-container">{item.customer_name}</span>
                            <span className="time-tip pull-right">{
                                moment(item.notice_time).fromNow()}</span>
                        </div>
                        <div className="item-content"></div>
                    </div>
                )
            })
        )
    },
    //关注客户登录
    renderConcernedCustomer: function () {
        return (_.map(this.state.concernCustomerObj.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item)}>
                        <div className="item-header">
                            <span className="customer-name-container">{item.customer_name}</span>
                            <span className="time-tip pull-right">{
                                moment(item.notice_time).fromNow()}</span>
                        </div>
                        <div className="item-content"></div>
                    </div>
                )
            })
        )
    },
    //最近登录的客户
    renderRecentLoginCustomer: function () {
        return (_.map(this.state.recentLoginCustomerObj.data.result, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item)}>
                        <div className="item-header">
                            <span className="customer-name-container">{item.customer_name}</span>
                        </div>
                        <div className="item-content"></div>
                    </div>
                )
            })
        )
    },
    //重复的客户
    renderReapeatCustomer: function () {
        return (_.map(this.state.repeatCustomerObj.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item)}>
                        <div className="item-header">
                            <span className="customer-name-container">{item.name}</span>
                        </div>
                        <div className="item-content"></div>
                    </div>
                )
            })
        )
    },
    //即将到期的签约客户
    renderWillExpiredAssignCustomer: function () {
        return (_.map(this.state.willExpiredAssignCustomer.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item)}>
                        <div className="item-header">
                            <span className="customer-name-container">{item.customer_name}</span>
                        </div>
                        <div className="item-content"></div>
                    </div>
                )
            })
        )
    },
    //即将到期的试用客户
    renderWillExpiredTryCustomer: function () {
        return (_.map(this.state.willExpiredTryCustomer.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item)}>
                        <div className="item-header">
                            <span className="customer-name-container">{item.customer_name}</span>
                        </div>
                        <div className="item-content"></div>
                    </div>
                )
            })
        )
    },
    refreshCustomerList: function () {

    },
    handleScrollBarBottom: function (listType) {
        switch (listType) {
            case ALL_LISTS_TYPE.SCHEDULE_TODAY://今日的日程列表
                this.getScrollData(this.state.scheduleTodayObj, this.getScheduleListToday);
                break;
            case  ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY://今日过期的日程
                this.getScrollData(this.state.scheduleExpiredTodayObj, this.getExpiredScheduleList);
                break;
            case ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN://停用客户登录
                this.getScrollData(this.state.appIllegalObj, this.getAppIlleageLogin);
                break;
            case ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN://关注客户登录
                this.getScrollData(this.state.concernCustomerObj, this.getConcernedLogin);
                break;
            case ALL_LISTS_TYPE.REPEAT_CUSTOMER://重复客户登录
                this.getScrollData(this.state.repeatCustomerObj, this.getRepeatCustomerList)
        }
    },
    getScrollData: function (curDataObj, getDataFunction) {
        var length = curDataObj.data.list.length;
        if (length < curDataObj.data.total) {
            var lastId = curDataObj.data.list[length - 1].id;
            getDataFunction(lastId);
        } else if (length == curDataObj.data.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    },


    handleClickCollapse: function () {
        this.setState({
            listenScrollBottom: true
        })
    },


    render: function () {
        var phoneData = this.state.phoneTotalObj.data;
        let time = TimeUtil.secondsToHourMinuteSecond(phoneData.totalTime || 0);
        var text = "sdfsd";
        const fixedHeight = $(window).height() - 38 * 8 - 140;
        return (
            <RightContent>
                <div className="sales_home_content" data-tracename="销售首页">
                    <TopNav>
                        <div className="top_nav_content">
                            <ul>
                                <li>
                                    <div className="statistic-total-content">
                                        <div className="content-left">
                                            <i className="iconfont icon-phone-waiting"></i>
                                        </div>
                                        <div className="content-right">
                                            <p>
                                                {Intl.get("sales.frontpage.connected.today", "今日通话")}
                                            </p>
                                            <p>
                                                <span className="phone-total-count total-data-style">
                                                    {Intl.get("sales.home.count", "{count}个", {"count": phoneData.totalCount})}
                                                </span>
                                                <span className="phone-total-time phone-total-data">
                                {time.hours > 0 ? <span>{time.hours}<span
                                    className="total-data-desc">{Intl.get("user.time.hour", "小时")} </span></span> : null}
                                                    {time.minutes > 0 ? <span>{time.minutes}<span
                                                        className="total-data-desc">{Intl.get("user.time.minute", "分")} </span></span> : null}
                                                    {time.second > 0 ? <span>{time.second}<span
                                                        className="total-data-desc">{Intl.get("user.time.second", "秒")} </span></span> : null}
                                                    {time.timeDescr == 0 ? time.timeDescr : null}
                                        </span>
                                            </p>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="statistic-total-content">
                                        <div className="content-left">
                                            <i className="iconfont icon-phone-waiting"></i>
                                        </div>
                                        <div className="content-right">
                                            <p>{Intl.get("sales.frontpage.contact.today", "今日联系客户")}</p>
                                            <p>
                                                {Intl.get("sales.home.count", "{count}个", {"count": this.state.customerContactTodayObj.data.total})}</p>
                                        </div>

                                    </div>
                                </li>
                                <li>
                                    <div className="statistic-total-content">
                                        <div className="content-left">
                                            <i className="iconfont icon-phone-waiting"></i>
                                        </div>
                                        <div className="content-right">
                                            <p>{Intl.get("sales.frontpage.added.today", "今日新增客户")}</p>
                                            <p>
                                                {Intl.get("sales.home.count", "{count}个", {"count": this.state.customerTotalObj.data.added})}</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </TopNav>
                    <div className="main-content-container">
                        <div className="col-md-4 customer-list-left">
                            <Collapse accordion defaultActiveKey={['1']} onChange={this.handleClickCollapse}>
                                <Panel header={<span>{Intl.get("sales.frontpage.will.contact.today", "今日待联系")}<span
                                    className="panel-header-count">{this.state.scheduleTodayObj.data.total}</span></span>}
                                       key="1">
                                    <div className="today-schedule-container" style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.SCHEDULE_TODAY)}
                                            listenScrollBottom={this.state.listenScrollBottom}>
                                            {this.renderScheduleListToday()}
                                        </GeminiScrollbar>
                                    </div>
                                </Panel>
                                <Panel header={<span>{Intl.get("sales.frontpage.expired.not.contact", "超期未联系")}<span
                                    className="panel-header-count">{this.state.scheduleExpiredTodayObj.data.total}</span></span>}
                                       key="2">
                                    <div
                                        className="today-expired-schedule-container" style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY)}
                                            listenScrollBottom={this.state.listenScrollBottom}>
                                            {this.renderExpiredScheduleList()}
                                        </GeminiScrollbar></div>
                                </Panel>
                                <Panel
                                    header={
                                        <span>{Intl.get("sales.frontpage.will.expired.try.user", "即将到期的试用客户")}<span
                                            className="panel-header-count">{this.state.willExpiredTryCustomer.data.total}</span></span>}
                                    key="3">
                                    <div style={{height: fixedHeight}}>

                                        <GeminiScrollbar
                                            // handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER)}
                                            // listenScrollBottom={this.state.listenScrollBottom}
                                            >
                                        {this.renderWillExpiredTryCustomer()}
                                        </GeminiScrollbar>
                                        </div>
                                </Panel>
                                <Panel header={
                                    <span>{Intl.get("sales.frontpage.will.expired.assgined.user", "即将到期的签约客户")}<span
                                        className="panel-header-count">{this.state.willExpiredAssignCustomer.data.total}</span></span>}
                                       key="4">
                                    <div style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            // handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER)}
                                            // listenScrollBottom={this.state.listenScrollBottom}
                                            >
                                        {this.renderWillExpiredAssignCustomer()}
                                        </GeminiScrollbar></div>
                                </Panel>
                                <Panel header={<span>{Intl.get("sales.frontpage.login.after.stop", "停用后登录")}<span
                                    className="panel-header-count">{this.state.appIllegalObj.data.total}</span></span>}
                                       key="5">
                                    <div style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN)}
                                            listenScrollBottom={this.state.listenScrollBottom}>{this.renderAppIllegalCustomer()}</GeminiScrollbar>
                                    </div>
                                </Panel>
                                <Panel
                                    header={<span>{Intl.get("ketao.frontpage.focus.customer.login", "关注客户登录")}<span
                                        className="panel-header-count">{this.state.concernCustomerObj.data.total}</span></span>}
                                    key="6">
                                    <div style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN)}
                                            listenScrollBottom={this.state.listenScrollBottom}>
                                            {this.renderConcernedCustomer()}
                                        </GeminiScrollbar></div>
                                </Panel>
                                <Panel header={<span>{Intl.get("sales.frontpage.login.recently", "最近登录的客户")}<span
                                    className="panel-header-count">{this.state.recentLoginCustomerObj.data.total}</span></span>}
                                       key="7">
                                    <div style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom}
                                            listenScrollBottom={this.state.listenScrollBottom}>
                                            {this.renderRecentLoginCustomer()}
                                        </GeminiScrollbar>
                                    </div>
                                </Panel>
                                <Panel
                                    header={<span>{Intl.get("sales.frontpage.has.repeat.customer", "您有重复的客户")}<span
                                        className="panel-header-count">{this.state.repeatCustomerObj.data.total}</span></span>}
                                    key="8">
                                    <div style={{height: fixedHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.REPEAT_CUSTOMER)}
                                            listenScrollBottom={this.state.listenScrollBottom}>
                                            {this.renderReapeatCustomer()}
                                        </GeminiScrollbar>
                                    </div>
                                </Panel>
                                {/*<Panel*/}
                                {/*header={<span>{Intl.get("sales.frontpage.contact.customers", "建议您联系以下客户")}<span*/}
                                {/*className="panel-header-count">{this.state.recentLoginCustomerObj.data.total}</span></span>}*/}
                                {/*key="9">*/}
                                {/*<div>{text}</div>*/}
                                {/*</Panel>*/}
                            </Collapse>
                        </div>
                        <div className="col-md-8 customer-content-right">
                            <div className="customer-header-panel">
                                {this.state.selectedCustomer.customer_name || this.state.selectedCustomer.name}
                            </div>
                            <div className="crm-user-content">
                                <GeminiScrollbar>
                                    {this.state.selectedCustomerId ? <AppUserLists
                                        selectedCustomerId={this.state.selectedCustomerId}
                                    /> : null}
                                    {!_.isEmpty(this.state.selectedCustomer) ? <CustomerRecord
                                        curCustomer={this.state.selectedCustomer}
                                        refreshCustomerList={this.state.refreshCustomerList}
                                    /> : null}

                                </GeminiScrollbar>
                            </div>

                        </div>
                    </div>
                </div>
            </RightContent>
        )
    }
});
module.exports = SalesHomePage;