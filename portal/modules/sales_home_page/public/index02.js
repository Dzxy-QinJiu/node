var RightContent = require("CMP_DIR/privilege/right-content");
require("./css/index.less");
var TopNav = require("CMP_DIR/top-nav");
import {Collapse, Alert} from "antd";
const Panel = Collapse.Panel;
var SalesHomeStore = require("./store/sales-home-store");
var SalesHomeAction = require("./action/sales-home-actions");
import {hasPrivilege} from "CMP_DIR/privilege/checker";
let TimeUtil = require("PUB_DIR/sources/utils/time-format-util");
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
import AppUserLists from "./view/app-user-lists";
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var classNames = require("classnames");
import CustomerRecord from "./view/customer-record";
var Spinner = require("CMP_DIR/spinner");
import CustomerRepeat from "MOD_DIR/crm/public/views/customer-repeat";
import {ALL_LISTS_TYPE} from "PUB_DIR/sources/utils/consts";
import Trace from "LIB_DIR/trace";
import CustomerNoticeMessage from "./view/customer-notice-message";
// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
    PHONE: 'phone',
    APP: 'app'
};
const LAYOUT_CONSTS = {
    PADDDING_TOP_AND_BOTTOM: 97,
    EACH_PANNEL_HEIGHT: 39,
    RIGHT_CUSTOMER_TITLE_HEIGHT: 40,
    RIGHT_CUSTOMER_USER_HEIGHT: 240,
    RIGHT_NOTICE_MESSAGE_HEIGHT:100,
    EACH_PANNEL_BORDER_WIDTH: 1
};

var SalesHomePage = React.createClass({
    getInitialState: function () {
        return {
            showCollapsePanel: '1',//默认打开的面板
            isShowRepeatCustomer: false,//是否展示重复客户
            ...SalesHomeStore.getState()
        }
    },
    componentDidMount: function () {
        SalesHomeStore.listen(this.onChange);
        this.getSalesListData();
        $(".customer-list-left").on("click", ".repeat-customer-panel.panel-header-count", function (e) {
            $(".repeat-customer-panel.panel-header-count").closest(".ant-collapse-header").next(".ant-collapse-content").hide();
        })
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
        //获取三天内即将到期的试用用户
        this.getWillExpireCustomer({
            tags: "试用用户",
            start_time: todayTimeRange.start_time,
            end_time: todayTimeRange.end_time + 2 * oplateConsts.ONE_DAY_TIME_RANGE
        });
        //获取半年内即将到期的签约用户
        this.getWillExpireCustomer(
            {
                tags: "正式用户",
                start_time: todayTimeRange.start_time,
                end_time: todayTimeRange.end_time + 183 * oplateConsts.ONE_DAY_TIME_RANGE
            }
        );
    },
    getWillExpireCustomer: function (queryObj) {
        SalesHomeAction.getWillExpireCustomer(queryObj);
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
            notice_type: ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN,
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
            notice_type: ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN,
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
        return queryParams;
    },
    getPhoneParams: function () {
        let phoneParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            deviceType: this.state.callType || CALL_TYPE_OPTION.ALL
        };
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
    handleClickCustomerItem: function (selectedCustomer, panelType) {
        //不在展示重复客户列表
        this.setState({isShowRepeatCustomer: false});
        var itemObj = {
            selectedObj: selectedCustomer,
            selectedPanel: panelType//点击客户所在的面板
        };
        SalesHomeAction.setSelectedCustomer(itemObj);
    },

    //渲染今日待联系的日程列表
    renderScheduleListToday: function (panelType) {
        if (this.state.scheduleTodayObj.loading && this.state.scheduleTodayObj.curPage == 1) {
            return (
                <div>
                    <Spinner/>
                </div>
            )
        } else if (this.state.scheduleTodayObj.errMsg) {
            //加载完成，出错的情况
            var errMsg = <span>{this.state.scheduleTodayObj.errMsg}
                <a onClick={this.getScheduleListToday}>
                        <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
                        </a>
                         </span>;
            return (
                <div className="alert-wrap">
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        } else if (!this.state.scheduleTodayObj.data.list.length && !this.state.scheduleTodayObj.loading) {
            //加载完成，没有数据的情况
            return (
                <div className="show-no-schedule">
                    <Alert
                        message={Intl.get("common.no.data", "暂无数据")}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else if (this.state.scheduleTodayObj.data.list.length) {
            return (_.map(this.state.scheduleTodayObj.data.list, (scheduleItem) => {
                var cls = classNames("list-item-wrap",
                    {"cur-customer": scheduleItem.customer_id == this.state.selectedCustomerId && panelType == this.state.selectedCustomerPanel}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, scheduleItem, panelType)}
                         data-tracename="点击今日待联系的客户">
                        <div className="item-header" data-tracename="今日待联系客户名称">
                            <span className="customer-name-container">{scheduleItem.customer_name}</span>
                            <span className="schedule-tip pull-right">
                            {scheduleItem.allDay ? moment(scheduleItem.start_time).format(oplateConsts.DATE_FORMAT) :
                                <span>
                                {moment(scheduleItem.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}-{moment(scheduleItem.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                    </span>}
                    </span>
                        </div>
                        <div className="item-content" data-tracename="今日待联系日程内容">
                            <p>
                                {scheduleItem.content}
                            </p>
                        </div>
                    </div>
                )
            }))
        }
    },
    //渲染今日过期的日程
    renderExpiredScheduleList: function (panelType) {
        return (_.map(this.state.scheduleExpiredTodayObj.data.list, (scheduleItem) => {
            var cls = classNames("list-item-wrap", {"cur-customer": scheduleItem.customer_id == this.state.selectedCustomerId}
            );
            return (
                <div className={cls} onClick={this.handleClickCustomerItem.bind(this, scheduleItem, panelType)}
                     data-tracename="点击查看今日超期日程客户详情">
                    <div className="item-header" data-tracename="超期日程客户">
                        <span className="customer-name-container">{scheduleItem.customer_name}</span>
                        <span className="time-tip pull-right">
                            {scheduleItem.allDay ? moment(scheduleItem.start_time).format(oplateConsts.DATE_FORMAT) :
                                <span>
                                {moment(scheduleItem.start_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}-{moment(scheduleItem.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}
                    </span>}
                    </span>
                    </div>
                    <div className="item-content" data-tracename="超期日程内容">
                        <p>
                            {scheduleItem.content}
                        </p>
                    </div>
                </div>
            )
        }))
    },
    //客户停用后登录
    renderAppIllegalCustomer: function (panelType) {
        return (_.map(this.state.appIllegalObj.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item, panelType)}
                         data-tracename="查看停用后登录的客户">
                        <div className="item-header" data-tracename="停用后登录客户名称">
                            <span className="customer-name-container">{item.customer_name}</span>
                            <span className="time-tip pull-right">{
                                moment(item.notice_time).fromNow()}</span>
                        </div>
                    </div>
                )
            })
        )
    },
    //关注客户登录
    renderConcernedCustomer: function (panelType) {
        return (_.map(this.state.concernCustomerObj.data.list, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item, panelType)}
                         data-tracename="查看关注登录客户详情">
                        <div className="item-header" data-tracename="关注客户登录">
                            <span className="customer-name-container">{item.customer_name}</span>
                            <span className="time-tip pull-right">{
                                moment(item.notice_time).fromNow()}</span>
                        </div>
                    </div>
                )
            })
        )
    },
    //最近登录的客户
    renderRecentLoginCustomer: function (panelType) {
        return (_.map(this.state.recentLoginCustomerObj.data.result, (item) => {
                var cls = classNames("list-item-wrap", {"cur-customer": item.customer_id == this.state.selectedCustomerId}
                );
                return (
                    <div className={cls} onClick={this.handleClickCustomerItem.bind(this, item, panelType)}
                         data-tracename="查看最近登录客户详情">
                        <div className="item-header" data-tracename="最近登录客户">
                            <span className="customer-name-container">{item.customer_name}</span>
                        </div>
                    </div>
                )
            })
        )
    },
    //即将到期的签约客户
    renderWillExpiredAssignCustomer: function (panelType) {
        return (_.map(this.state.willExpiredAssignCustomer.data.list, (item) => {
                return (
                    _.map(item.customer_list, (customerItem) => {
                        var cls = classNames("list-item-wrap", {"cur-customer": customerItem.customer_id == this.state.selectedCustomerId}
                        );
                        return (
                            <div className={cls}
                                 onClick={this.handleClickCustomerItem.bind(this, customerItem, panelType)}
                                 data-tracename="查看即将到期的签约客户详情">
                                <div className="item-header" data-tracename="即将到期的签约客户">
                                    <span className="customer-name-container">{customerItem.customer_name}</span>
                                    <span
                                        className="time-tip pull-right">{moment(item.date).format(oplateConsts.DATE_FORMAT)}</span>
                                </div>
                            </div>
                        )
                    })
                )
            })
        )
    },
    //即将到期的试用客户
    renderWillExpiredTryCustomer: function (panelType) {
        return (_.map(this.state.willExpiredTryCustomer.data.list, (item) => {
                return (
                    _.map(item.customer_list, (customerItem) => {
                        var cls = classNames("list-item-wrap", {"cur-customer": customerItem.customer_id == this.state.selectedCustomerId}
                        );
                        return (
                            <div className={cls}
                                 onClick={this.handleClickCustomerItem.bind(this, customerItem, panelType)}
                                 data-tracename="查看即将到期的试用客户详情">
                                <div className="item-header" data-tracename="即将到期的试用客户">
                                    <span className="customer-name-container">{customerItem.customer_name}</span>
                                    <span
                                        className="time-tip pull-right">{moment(item.date).format(oplateConsts.DATE_FORMAT)}</span>
                                </div>
                            </div>
                        )
                    })
                )
            })
        )
    },
    handleScrollBarBottom: function (listType) {
        switch (listType) {
            case ALL_LISTS_TYPE.SCHEDULE_TODAY://今日的日程列表
                this.getScrollData(this.state.scheduleTodayObj, this.getScheduleListToday);
                break;
            case  ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY://今日超期的日程
                this.getScrollData(this.state.scheduleExpiredTodayObj, this.getExpiredScheduleList);
                break;
            case ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN://停用客户登录
                this.getScrollData(this.state.appIllegalObj, this.getAppIlleageLogin);
                break;
            case ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN://关注客户登录
                this.getScrollData(this.state.concernCustomerObj, this.getConcernedLogin);
                break;
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

    //点击收起面板
    handleClickCollapse: function (argument) {
        Trace.traceEvent($(this.getDOMNode()).find(".ant-collapse-header"), "打开不同类型客户面板");
        if (argument) {
            this.setState({
                listenScrollBottom: true,
                isShowRepeatCustomer: false,
                showCollapsePanel: argument
            })

        } else {
            this.setState({
                isShowRepeatCustomer: false,
            })
        }

    },
    //点击展示重复客户列表
    handleShowRepeatCustomer: function () {
        this.setState({
            isShowRepeatCustomer: true,
        });
    },
    //渲染消息列表
    renderCustomerNoticeMessage: function () {
        return (
            <CustomerNoticeMessage
                curCustomer={this.state.selectedCustomer}
            />
        )
    },
    //渲染右侧客户详情
    renderCustomerContentDetail: function (rightContentHeight) {
        var rightHeight = "";
        if (this.state.selectedCustomer.customer_name || this.state.selectedCustomer.name) {
            rightHeight = rightContentHeight - LAYOUT_CONSTS.RIGHT_CUSTOMER_TITLE_HEIGHT;
        } else {
            rightHeight = rightContentHeight
        }
        var userLeftTopHeight = "";
        if (this.state.selectedCustomerPanel === ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN || this.state.selectedCustomerPanel === ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN){
            userLeftTopHeight = LAYOUT_CONSTS.RIGHT_NOTICE_MESSAGE_HEIGHT;
        }else{
            userLeftTopHeight = LAYOUT_CONSTS.RIGHT_CUSTOMER_USER_HEIGHT;
        }
        {/*右侧左上角根据左边不同的panel的类别，展示不同的面板
         * 重复客户类型  --- 展示重复客户列表
         * 停用后登录，关注客户登录 --- 展示系统消息
         * 其他的 --- 展示用户列表
         * 右上角的联系人和左下角的跟进记录是一直保留的*/
        }
        return (
            <div>
                {this.state.selectedCustomer.customer_name || this.state.selectedCustomer.name ?
                    <div className="customer-header-panel">
                        {this.state.selectedCustomer.customer_name || this.state.selectedCustomer.name}
                    </div> : null}
                <div className="crm-user-content">
                    <div className="crm-user-left col-md-7 col-sm-12">
                        {/*用户列表和系统消息
                         关注客户和停用客户登录展示系统消息
                         */}
                        <div className="user-list-container" style={{height: userLeftTopHeight}}>
                            <GeminiScrollbar>
                                {this.state.selectedCustomerPanel === ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN || this.state.selectedCustomerPanel === ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN ? this.renderCustomerNoticeMessage() : (this.state.selectedCustomerId ?
                                    <AppUserLists
                                        selectedCustomerId={this.state.selectedCustomerId}
                                        curCustomer={this.state.selectedCustomer}
                                    /> : null)}
                            </GeminiScrollbar>
                        </div>
                        {/*跟进记录*/}
                        <div className="record-trace-container" style={{height: rightHeight - userLeftTopHeight}}>
                            {!_.isEmpty(this.state.selectedCustomer) ? <CustomerRecord
                                curCustomer={this.state.selectedCustomer}
                                refreshCustomerList={function () {
                                }}
                                wrapHeight={rightHeight - userLeftTopHeight}
                            /> : null}
                        </div>
                    </div>
                    <div className="crm-user-right col-md-5 col-sm-12">

                    </div>
                </div>
            </div>
        )
    },

    render: function () {
        var phoneData = this.state.phoneTotalObj.data;
        let time = TimeUtil.secondsToHourMinuteSecond(phoneData.totalTime || 0);
        const fixedHeight = $(window).height() - LAYOUT_CONSTS.EACH_PANNEL_HEIGHT * this.state.showCollapsPanelCount - LAYOUT_CONSTS.PADDDING_TOP_AND_BOTTOM + 1 * LAYOUT_CONSTS.EACH_PANNEL_BORDER_WIDTH;
        const rightContentHeight = $(window).height() - LAYOUT_CONSTS.PADDDING_TOP_AND_BOTTOM + 4 * LAYOUT_CONSTS.EACH_PANNEL_BORDER_WIDTH;
        var repeatCls = classNames("reapeat-customer-header",
            {"repeat-customer-active": this.state.isShowRepeatCustomer}
        );
        return (
            <RightContent>
                <div className="sales_home_content" data-tracename="销售首页">
                    <TopNav>
                        <div className="top_nav_content" data-tracename="顶部区域">
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
                        <div className="col-md-4 customer-list-left" data-tracename="客户分类">
                            <Collapse accordion defaultActiveKey={['1']}
                                      activeKey={[this.state.showCollapsePanel]}
                                      onChange={this.handleClickCollapse}
                                      data-tracename="点击左侧列表不同种类的标题栏"
                            >
                                <Panel header={<span>{Intl.get("sales.frontpage.will.contact.today", "今日待联系")}<span
                                    className="panel-header-count">{this.state.scheduleTodayObj.data.total}</span></span>}
                                       key="1"
                                       data-tracename="今日待联系日程"
                                >
                                    <div className="today-schedule-container items-customer-container"
                                         style={{height: fixedHeight}}
                                    >
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.SCHEDULE_TODAY)}
                                            listenScrollBottom={this.state.listenScrollBottom}>
                                            {this.renderScheduleListToday(ALL_LISTS_TYPE.SCHEDULE_TODAY)}
                                        </GeminiScrollbar>
                                    </div>
                                </Panel>
                                {this.state.scheduleExpiredTodayObj.data.total ?
                                    <Panel header={<span>{Intl.get("sales.frontpage.expired.not.contact", "超期未联系")}<span
                                        className="panel-header-count">{this.state.scheduleExpiredTodayObj.data.total}</span></span>}
                                           key="2">
                                        <div
                                            className="today-expired-schedule-container items-customer-container"
                                            style={{height: fixedHeight}}
                                        >
                                            <GeminiScrollbar
                                                handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY)}
                                                listenScrollBottom={this.state.listenScrollBottom}>
                                                {this.renderExpiredScheduleList(ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY)}
                                            </GeminiScrollbar></div>
                                    </Panel> : null}

                                {this.state.willExpiredTryCustomer.data.total ? <Panel
                                    header={
                                        <span>{Intl.get("sales.frontpage.will.expired.try.user", "即将到期的试用客户")}<span
                                            className="panel-header-count">{this.state.willExpiredTryCustomer.data.total}</span></span>}
                                    key="3">
                                    <div className="items-customer-container"
                                         style={{height: fixedHeight}}
                                    >

                                        <GeminiScrollbar
                                            // handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER)}
                                            // listenScrollBottom={this.state.listenScrollBottom}
                                        >
                                            {this.renderWillExpiredTryCustomer(ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER)}
                                        </GeminiScrollbar>
                                    </div>
                                </Panel> : null}
                                {this.state.willExpiredAssignCustomer.data.total ?
                                    <Panel header={
                                        <span>{Intl.get("sales.frontpage.will.expired.assgined.user", "即将到期的签约客户")}<span
                                            className="panel-header-count">{this.state.willExpiredAssignCustomer.data.total}</span></span>}
                                           key="4">
                                        <div className="items-customer-container"
                                             style={{height: fixedHeight}}
                                        >
                                            <GeminiScrollbar
                                                // handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER)}
                                                // listenScrollBottom={this.state.listenScrollBottom}
                                            >
                                                {this.renderWillExpiredAssignCustomer(ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER)}
                                            </GeminiScrollbar></div>
                                    </Panel> : null}

                                {this.state.appIllegalObj.data.total ?
                                    <Panel header={<span>{Intl.get("sales.frontpage.login.after.stop", "停用后登录")}<span
                                        className="panel-header-count">{this.state.appIllegalObj.data.total}</span></span>}
                                           key="5">
                                        <div className="items-customer-container"
                                             style={{height: fixedHeight}}
                                        >
                                            <GeminiScrollbar
                                                handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN)}
                                                listenScrollBottom={this.state.listenScrollBottom}>{this.renderAppIllegalCustomer(ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN)}</GeminiScrollbar>
                                        </div>
                                    </Panel> : null}

                                {this.state.concernCustomerObj.data.total ?
                                    <Panel
                                        header={<span>{Intl.get("ketao.frontpage.focus.customer.login", "关注客户登录")}<span
                                            className="panel-header-count">{this.state.concernCustomerObj.data.total}</span></span>}
                                        key="6">
                                        <div className="items-customer-container"
                                             style={{height: fixedHeight}}
                                        >
                                            <GeminiScrollbar
                                                handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN)}
                                                listenScrollBottom={this.state.listenScrollBottom}>
                                                {this.renderConcernedCustomer(ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN)}
                                            </GeminiScrollbar></div>
                                    </Panel> : null}

                                {this.state.recentLoginCustomerObj.data.total > 0 ?
                                    <Panel header={<span>{Intl.get("sales.frontpage.login.recently", "近X日登录的客户")}<span
                                        className="panel-header-count">{this.state.recentLoginCustomerObj.data.total}</span></span>}
                                           key="7">
                                        <div className="items-customer-container"
                                             style={{height: fixedHeight}}
                                        >
                                            {/*<GeminiScrollbar*/}
                                            {/*handleScrollBottom={this.handleScrollBarBottom}*/}
                                            {/*listenScrollBottom={this.state.listenScrollBottom}>*/}

                                            {this.renderRecentLoginCustomer(ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER)}
                                            {/*</GeminiScrollbar>*/}
                                        </div>
                                    </Panel> : null}
                            </Collapse>
                            <div className={repeatCls} onClick={this.handleShowRepeatCustomer}
                                 data-tracename="点击查看重复客户">
                                    <span>
                                        <span>{Intl.get("sales.frontpage.has.repeat.customer", "您有重复的客户")}</span>
                                        <span
                                            className="repeat-customer-panel-header-count">{this.state.repeatCustomerObj.data.total}</span>
                                    </span>
                            </div>
                        </div>
                        <div className="col-md-8 customer-content-right" data-tracename="客户详情"
                             style={{height: rightContentHeight}}>
                            {this.state.isShowRepeatCustomer ? <CustomerRepeat noNeedClose={true}/> :
                                this.renderCustomerContentDetail(rightContentHeight)
                            }
                        </div>
                    </div>
                </div>
            </RightContent>
        )
    }
});
module.exports = SalesHomePage;