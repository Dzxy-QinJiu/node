require("./css/index.less");
import {Table, Icon, Select, message} from "antd";
import {AntcTable} from "antc";
import Trace from "LIB_DIR/trace";
const Option = Select.Option;
var RightContent = require("../../../components/privilege/right-content");
var SalesHomeStore = require("./store/sales-home-store");
var SalesHomeAction = require("./action/sales-home-actions");
var TopNav = require("../../../components/top-nav");
import DatePicker from "../../../components/datepicker";
import {hasPrivilege} from "CMP_DIR/privilege/checker";
import ActiveEmailTip from "./views/active-email-tip";
var StatisticTotal = require("./views/statistic-total");
var CrmRightList = require("./views/crm-right-list");
import WillExpiredUsers from "./views/will-expire-user-list";
var CustomerAnalysis = require("./views/customer-analysis");
var UserAnalysis = require("./views/user-analysis");
var constantUtil = require("./util/constant");
let showTypeConstant = constantUtil.SHOW_TYPE_CONSTANT;//当前展示的类型常量（销售团队列表、团队成员列表、销售的待办事宜）
var viewConstant = constantUtil.VIEW_CONSTANT;//视图常量
var layoutConstant = constantUtil.LAYOUTS;//布局常量
var Spinner = require("CMP_DIR/spinner");
import classNames from "classnames";
var scrollTimeout = null;
var storageUtil = require("LIB_DIR/utils/storage-util.js");
var pageId = oplateConsts.PAGE_ID.SALES_HOME;
var key = "hamburger-button-flag";//用于记录展开或者关闭销售团队列表的状态
import history from 'PUB_DIR/sources/history';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import GeminiScrollbar from "CMP_DIR/react-gemini-scrollbar";
import {CALL_TYPE_OPTION} from "PUB_DIR/sources/utils/consts";
const SORT_ICON_WIDTH = 16;
//延时展示激活邮箱提示框的时间
const DELAY_TIME = 2000;
var SalesHomePage = React.createClass({
    getInitialState: function () {
        SalesHomeAction.setInitState();
        let stateData = SalesHomeStore.getState();
        var isSaleTeamShow = true;
        var flag = storageUtil.local.get(key, pageId);
        if (flag == null) {
            storageUtil.local.set(key, true, pageId);
            isSaleTeamShow = true;
        } else {
            isSaleTeamShow = flag;
        }
        return {
            ...stateData,
            scrollbarEnabled: false, //是否需要滚动条
            callType: CALL_TYPE_OPTION.ALL, // 通话类型
            isAnimateShow: false,//是否动态由上到下推出 激活邮箱提示框
            isAnimateHide: false,//是否动态隐藏 提示框
            isSaleTeamShow: isSaleTeamShow,//右侧销售团队列表是否展示
            notfirstLogin: false,//不是第一次登录，避免初次加载出现滑动的效果
            updateScrollBar: false,//更新滚动条外
            phoneSorter: {}//电话的排序对象
        }
    },
    onChange: function () {
        this.setState(SalesHomeStore.getState());
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
    componentDidMount: function () {
        SalesHomeStore.listen(this.onChange);
        let type = this.getDataType();
        //获取统计团队内成员个数的列表
        SalesHomeAction.getTeamMemberCountList();
        SalesHomeAction.getSalesTeamList(type);
        this.refreshSalesListData();
        this.resizeLayout();
        //获取个人配置信息
        this.getWebConfig();
        $(window).resize(() => this.resizeLayout());
        $(".statistic-data-analysis").mousewheel(function () {
            $(".statistic-data-analysis .thumb").show();
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => $(".statistic-data-analysis .thumb").hide(), 300);
        });
        //获取用户的个人信息
        SalesHomeAction.getUserInfo();
        //外层父组件加载完成后，再由上到下推出激活邮箱提示框
        setTimeout(() => {
            this.setState({
                isAnimateShow: true
            });
        }, DELAY_TIME)
    },
    resizeLayout: function () {
        //宽屏不出现滚动条
        if ($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            //窄屏出现滚动条
            this.state.scrollbarEnabled = false;
        } else {
            $('body').css({
                'overflow-x': 'hidden',
                'overflow-y': 'hidden'
            });
            this.state.scrollbarEnabled = true;
        }
        this.setState({
            scrollbarEnabled: this.state.scrollbarEnabled
        });
    },
    //获取个人配置信息
    getWebConfig: function () {
        SalesHomeAction.getWebsiteConfig();
    },
    getPhoneListBlockHeight: function () {
        let phoneListHeight = null;
        if (this.state.scrollbarEnabled) {
            phoneListHeight = $(window).height() - layoutConstant.TOP_NAV_H - layoutConstant.TOTAL_H -
                layoutConstant.SELECT_TYPE_H - layoutConstant.BOTTOM;
        }
        return phoneListHeight
    },
    componentWillUnmount: function () {
        SalesHomeAction.setInitState();
        SalesHomeStore.unlisten(this.onChange);
    },
    //获取查询参数
    getQueryParams: function () {
        let queryParams = {
            urltype: 'v2',
            starttime: this.state.start_time,
            endtime: this.state.end_time
        };
        if (this.state.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.state.currShowSalesman.userId;
        } else if (this.state.currShowSalesTeam) {
            //查看当前选择销售团队内所有成员的统计数据
            queryParams.team_id = this.state.currShowSalesTeam.group_id;
        }
        return queryParams;
    },
    //通话总次数和总时长统计权限
    getCallTotalAuth(){
        let authType = "user";//CALLRECORD_CUSTOMER_PHONE_STATISTIC_USER
        if (hasPrivilege("CALLRECORD_CUSTOMER_PHONE_STATISTIC_MANAGER")) {
            authType = "manager";
        }
        return authType;
    },
    getPhoneTop10Params: function () {
        let queryParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            type: this.state.callType,
            filter_phone: false,// 是否过滤114电话号码
            filter_invalid_phone: false//是否过滤客服电话号码
        };
        if (this.state.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.state.currShowSalesman.userId;
        } else if (this.state.currShowSalesTeam) {
            //查看当前选择销售团队内所有成员的统计数据
            queryParams.team_id = this.state.currShowSalesTeam.group_id;
        }
        return queryParams;
    },
    //刷新数据
    refreshSalesListData: function () {
        let queryParams = this.getQueryParams();
        let dataType = this.getDataType();
        queryParams.dataType = dataType;
        SalesHomeAction.getCustomerTotal(queryParams);
        SalesHomeAction.getUserTotal(queryParams);
        //获取销售(团队)-电话列表
        SalesHomeAction.setListIsLoading(viewConstant.PHONE);
        //电话统计取“全部”时，开始时间传0，结束时间传当前时间
        let phoneParams = this.getPhoneParams();
        SalesHomeAction.getSalesPhoneList(phoneParams);
        let callTotalAuth = this.getCallTotalAuth();
        let top10Params = this.getPhoneTop10Params();
        //通话总次数、总时长TOP10
        SalesHomeAction.getCallTotalList(callTotalAuth, top10Params);
        var queryObj = {};
        if (queryParams.member_id) {
            queryObj.member_id = queryParams.member_id;
        }
        if (queryParams.team_id) {
            queryObj.team_id = queryParams.team_id;
        }
        //获取过期用户列表
        SalesHomeAction.getExpireUser(queryObj);
    },
    getPhoneParams: function () {
        let phoneParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            deviceType: this.state.callType || CALL_TYPE_OPTION.ALL
        };
        if (this.state.currShowSalesman) {
            //查看当前选择销售的统计数据
            phoneParams.member_ids = this.state.currShowSalesman.userId;
        } else if (this.state.currShowSalesTeam) {
            //查看当前选择销售团队内所有成员的统计数据
            phoneParams.team_ids = this.state.currShowSalesTeam.group_id;
        }
        return phoneParams;
    },
    //获取销售列的标题
    getSalesColumnTitle: function () {
        var userType = this.state.userType;
        var label = Intl.get("sales.home.sales", "销售");
        if (userType == "senior_leader") {
            label = Intl.get("user.sales.team", "销售团队");
        }
        return label;
    },
    getPhoneColumnTitle: function (label, key) {
        let sorter = this.state.phoneSorter;
        let sortIcon = null;
        if (sorter.field === key) {
            if (sorter.order === "descend") {
                sortIcon = <span className='iconfont icon-xiajiantou phone-sort-icon'/>;
            } else if (sorter.order === "ascend") {
                sortIcon = <span className='iconfont icon-jiantou-up phone-sort-icon'/>;
            }
        }
        return <span>{label}{sortIcon}</span>;
    },
    getColumnMinWidth: function (width, key) {
        //正在排序的列宽需加上排序按钮的宽度
        if (this.state.phoneSorter.field === key) {
            width += SORT_ICON_WIDTH;
        }
        return width;
    },
    getPhoneListColumn: function () {
        let col_width = 95, num_col_width = 80;
        let columns = [{
            title: this.getSalesColumnTitle(),
            dataIndex: 'salesName',
            key: 'sales_Name',
            width: num_col_width
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.total.duration", "总时长"), "totalTimeDescr"),
            dataIndex: 'totalTimeDescr',
            key: 'total_time',
            sorter: function (a, b) {
                return a.totalTime - b.totalTime;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'totalTimeDescr')
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.total.connected", "总接通数"), "calloutSuccess"),
            dataIndex: 'calloutSuccess',
            key: 'callout_success',
            sorter: function (a, b) {
                return a.calloutSuccess - b.calloutSuccess;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, "calloutSuccess")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.average.duration", "日均时长"), "averageTimeDescr"),
            dataIndex: 'averageTimeDescr',
            key: 'average_time',
            sorter: function (a, b) {
                return a.averageTime - b.averageTime;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, "averageTimeDescr")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.average.connected", "日均接通数"), "averageAnswer"),
            dataIndex: 'averageAnswer',
            key: 'average_answer',
            sorter: function (a, b) {
                return a.averageAnswer - b.averageAnswer;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(col_width, "averageAnswer")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.phone.callin", "呼入次数"), "callinCount"),
            dataIndex: 'callinCount',
            key: 'callin_count',
            sorter: function (a, b) {
                return a.callinCount - b.callinCount;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, "callinCount")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.phone.callin.success", "成功呼入"), "callinSuccess"),
            dataIndex: 'callinSuccess',
            key: 'callin_success',
            sorter: function (a, b) {
                return a.callinSuccess - b.callinSuccess;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, "callinSuccess")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.phone.callin.rate", "呼入接通率"), "callinRate"),
            dataIndex: 'callinRate',
            key: 'callin_rate',
            sorter: function (a, b) {
                return a.callinRate - b.callinRate;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(col_width, "callinRate")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.phone.callout", "呼出次数"), "calloutCount"),
            dataIndex: 'calloutCount',
            key: 'callout_count',
            sorter: function (a, b) {
                return a.calloutCount - b.calloutCount;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, "calloutCount")
        }, {
            title: this.getPhoneColumnTitle(Intl.get("sales.home.phone.callout.rate", "呼出接通率"), "calloutRate"),
            dataIndex: 'calloutRate',
            key: 'callout_rate',
            sorter: function (a, b) {
                return a.calloutRate - b.calloutRate;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(col_width, "calloutRate")
        }];
        //当前展示的是客套类型的通话记录时，展示计费时长
        if (this.state.callType == CALL_TYPE_OPTION.APP) {
            columns.push({
                title: this.getPhoneColumnTitle(Intl.get("sales.home.phone.billing.time", "计费时长") + "(min)", "billingTime"),
                dataIndex: 'billingTime',
                key: 'filling_time',
                width: '10%',
                sorter: function (a, b) {
                    return a.billingTime - b.billingTime;
                },
                className: 'has-filter table-data-align-right',
                width: this.getColumnMinWidth(120, "billingTime")
            });
        }
        return columns;
    },
    //获取分析图表展示区所需的布局参数
    getChartLayoutParams: function () {
        let chartWidth = 0;
        let chartListHeight = $(window).height() - $(".statistic-total-data").height() - layoutConstant.TOP - layoutConstant.BOTTOM;
        let windowWidth = $(window).width();
        let chartListContainerW = $(".statistic-data-analysis").width() - layoutConstant.CHART_PADDING;
        if (windowWidth >= Oplate.layout['screen-md']) {
            chartWidth = Math.floor(( chartListContainerW - layoutConstant.CHART_PADDING * 4) / 2);
        } else {
            chartWidth = Math.floor(chartListContainerW - layoutConstant.CHART_PADDING * 2);
        }
        return {chartWidth: chartWidth, chartListHeight: chartListHeight}
    },
    //通过销售名称获取对应的Id
    getSaleIdByName: function (name) {
        let teamMemberList = this.state.salesTeamMembersObj.data;
        if (_.isArray(teamMemberList) && teamMemberList.length) {
            let sales = _.find(teamMemberList, member => member.nickName == name);
            return sales ? sales.userId : "";
        } else {
            return "";
        }
    },

    getChangeCallTypeData: function () {
        let queryParams = this.getPhoneParams();
        SalesHomeAction.getSalesPhoneList(queryParams);
        let callTotalAuth = this.getCallTotalAuth();
        let top10Params = this.getPhoneTop10Params();
        //通话总次数、总时长TOP10
        SalesHomeAction.getCallTotalList(callTotalAuth, top10Params);
    },

    // 选择通话类型的值
    selectCallTypeValue(value){
        if (value == CALL_TYPE_OPTION.PHONE) {
            this.state.callType = CALL_TYPE_OPTION.PHONE;
        } else if (value == CALL_TYPE_OPTION.APP) {
            this.state.callType = CALL_TYPE_OPTION.APP;
        } else if (value == CALL_TYPE_OPTION.ALL) {
            this.state.callType = CALL_TYPE_OPTION.ALL;
        }
        this.setState({
            callType: value
        });
        this.getChangeCallTypeData();
        //发送点击事件
        Trace.traceEvent("销售首页", "选择" + value + "类型");
    },

    // 通话类型的筛选框
    filterCallTypeSelect(){
        return (
            <div className="call-type-select">
                <Select
                    showSearch
                    value={this.state.callType}
                    onChange={this.selectCallTypeValue}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        <span>{Intl.get("user.online.all.type", "全部类型")}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        <span>{Intl.get("call.record.call.center", "呼叫中心")}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        <span>{Intl.get("common.ketao.app", "客套APP")}</span>
                    </Option>
                </Select>
            </div>
        );
    },
    getPhoneTableMinWidth: function () {
        let tableMinWitdh = this.state.callType == CALL_TYPE_OPTION.APP ? 965 : 845;
        //有排序的列，table的宽带需要加上排序按钮的宽度
        if (!_.isEmpty(this.state.phoneSorter)) {
            tableMinWitdh += SORT_ICON_WIDTH;
        }
        return tableMinWitdh;
    },
    //渲染数据分析视图
    renderAnalysisView: function () {
        if (this.state.activeView == viewConstant.CUSTOMER) {
            return (<CustomerAnalysis ref="customerView" startTime={this.state.start_time} endTime={this.state.end_time}
                                      timeType={this.state.timeType}
                                      scrollbarEnabled={this.state.scrollbarEnabled}
                                      currShowSalesTeam={this.state.currShowSalesTeam}
                                      currShowSalesman={this.state.currShowSalesman}
                                      originSalesTeamTree={this.state.originSalesTeamTree}
                                      getSaleIdByName={this.getSaleIdByName}
                                      getChartLayoutParams={this.getChartLayoutParams}
                                      updateScrollBar={this.state.updateScrollBar}
            />);
        } else if (this.state.activeView == viewConstant.USER) {
            return (<UserAnalysis ref="userView" startTime={this.state.start_time} endTime={this.state.end_time}
                                  timeType={this.state.timeType}
                                  scrollbarEnabled={this.state.scrollbarEnabled}
                                  currShowSalesTeam={this.state.currShowSalesTeam}
                                  currShowSalesman={this.state.currShowSalesman}
                                  originSalesTeamTree={this.state.originSalesTeamTree}
                                  getSaleIdByName={this.getSaleIdByName}
                                  getChartLayoutParams={this.getChartLayoutParams}
                                  updateScrollBar={this.state.updateScrollBar}
            />);
        } else if (this.state.activeView == viewConstant.PHONE) {
            return (<div className="sales-table-container sales-phone-table" ref="phoneList">
                {this.filterCallTypeSelect()}
                <div className="phone-table-block" style={{height: this.getPhoneListBlockHeight()}}>
                    <GeminiScrollbar enabled={this.props.scrollbarEnabled} ref="phoneScrollbar">
                        <AntcTable dataSource={this.state.salesPhoneList} columns={this.getPhoneListColumn()}
                                   loading={this.state.isLoadingPhoneList}
                                   scroll={{x: this.getPhoneTableMinWidth()}}
                                   pagination={false} bordered util={{zoomInSortArea: true}}
                                   onChange={this.onTableChange}
                        />
                        {/*根据电话的排序的通话次数TOP10*/}
                        {this.renderCallTopTen(this.state.callTotalCountObj, {
                            title: Intl.get("call.analysis.total.count", "通话总次数"),
                            dataKey: "count"
                        })}
                        {/*根据电话的排序的通话总时长TOP10*/}
                        {this.renderCallTopTen(this.state.callTotalTimeObj, {
                            title: Intl.get("call.analysis.total.time", "通话总时长"),
                            dataKey: "sum"
                        })}
                    </GeminiScrollbar>
                </div>
            </div>);
        }
    },
    /* 渲染总时长、总次数为top10的列表
     * titleObj={title:"通话时长",dataKey:"billsec"}
     */
    renderCallTopTen(dataObj, titleObj){
        return (
            <div className="call-duration-top-ten">
                <div className="call-duration-title">
                    {titleObj.title}TOP10:
                </div>
                {dataObj.loading ? <Spinner /> : dataObj.errMsg ? (
                    <div className="alert-wrap">
                        <Alert
                            message={titleObj.errMsg}
                            type="error"
                            showIcon={true}
                        />
                    </div>
                ) : <AntcTable
                    dataSource={dataObj.data}
                    columns={this.getCallDurTopColumn(titleObj)}
                    pagination={false}
                    bordered
                />}
            </div>
        );
    },
    // TOP10数据列表
    getCallDurTopColumn(titleObj){
        return [
            {
                title: Intl.get("common.phone", "电话"),
                dataIndex: 'dst',
                width: '120',
                className: 'table-data-align-right',
                key: 'call_number'
            }, {
                title: titleObj.title,
                dataIndex: titleObj.dataKey,
                width: '100',
                className: 'table-data-align-right',
                key: 'holding_time',
                render: function (data) {
                    return <div>{titleObj.dataKey === "count" ? data : TimeUtil.getFormatTime(data)}</div>;
                }
            }, {
                title: Intl.get("call.record.customer", "客户"),
                dataIndex: 'customer_name',
                width: '250',
                className: 'table-data-align-left',
                key: 'customer_name'
            }, {
                title: Intl.get("call.record.caller", "呼叫者"),
                dataIndex: 'nick_name',
                width: '70',
                className: 'table-data-align-left',
                key: 'nick_name'
            }
        ];
    },
    onTableChange: function (pagination, filters, sorter) {
        this.setState({phoneSorter: sorter});
    },
    //时间的设置
    onSelectDate: function (startTime, endTime, timeType) {
        let timeObj = {startTime: startTime, endTime: endTime, timeType: timeType};
        SalesHomeAction.changeSearchTime(timeObj);
        setTimeout(() => {
            //刷新统计数据
            this.refreshSalesListData();
            if (this.state.activeView == viewConstant.CUSTOMER) {
                //刷新客户分析数据
                this.refs.customerView.getChartData();
            } else if (this.state.activeView == viewConstant.USER) {
                //刷新用户分析数据
                this.refs.userView.getChartData();
            }
        });
    },
    //切换销售团队、销售时，刷新数据
    refreshDataByChangeSales: function () {
        //刷新统计数据
        this.refreshSalesListData();
        if (this.state.activeView == viewConstant.CUSTOMER) {
            //刷新客户分析数据
            this.refs.customerView.getChartData();
        } else if (this.state.activeView == viewConstant.USER) {
            //刷新用户分析数据
            this.refs.userView.getChartData();
        }
    },
    //获取右侧销售团队列表的高度
    getSalesListHeight: function () {
        let salesListHeight = "auto";
        if (this.state.scrollbarEnabled) {
            salesListHeight = $(window).height() - layoutConstant.TOP - layoutConstant.TITLE_HEIGHT;
        }
        return salesListHeight;
    },
    //获取左侧即将到期客户高度
    getWillExpireUserListHeight: function () {
        let salesListHeight = "auto";
        if (this.state.scrollbarEnabled) {
            salesListHeight = $(window).height() - layoutConstant.TOP_NAV_H - layoutConstant.EXPIRE_TITLE_H - layoutConstant.BOTTOM;
        }
        return salesListHeight;
    },
    //点击 邮箱激活提示 中的不再提示，隐藏提示框
    hideActiveEmailTip: function () {
        SalesHomeAction.setWebsiteConfig({"setting_notice_ignore": "yes"}, (errMsg) => {
            if (errMsg) {
                //设置错误后的提示
                message.error(errMsg);
            } else {
                //设置成功后，隐藏提示框
                this.setState({
                    isAnimateHide: true
                });
            }
        });
    },
    //点击 激活邮箱 按钮
    activeUserEmail: function () {
        if (this.state.emailEnable) {
            return;
        }
        SalesHomeAction.activeUserEmail((resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get("user.info.active.email", "激活邮件已发送至{email}", {"email": this.state.email})
                );
            }
        });
    },
    handleCrmTeamListShow: function () {
        this.setState({
            isSaleTeamShow: !this.state.isSaleTeamShow,
            notfirstLogin: true,
            updateScrollBar: true
        }, () => {
            var flag = this.state.isSaleTeamShow;
            storageUtil.local.set(key, flag, pageId);
            //展开、关闭团队列表的时间未1s,所以需要加1s的延时后更新滚动条才起作用
            setTimeout(() => {
                this.refs.phoneScrollbar && this.refs.phoneScrollbar.update();
            }, 1000);
        })
    },
    //跳转到个人信息页面
    jumpToUserInfo: function () {
        history.pushState({}, "/user_info_manage/user_info", {});
    },
    renderWillExpireUser: function () {
        return (
            <WillExpiredUsers
                expireUserLists={this.state.expireUserLists}
                isLoadingExpireUserList={this.state.isLoadingExpireUserList}
                errMsg={this.state.errMsg}
                getWillExpireUserListHeight={this.getWillExpireUserListHeight}
                scrollbarEnabled={this.state.scrollbarEnabled}
                updateScrollBar={this.state.updateScrollBar}
            />
        )
    },
    //渲染客户关系首页
    render: function () {
        var crmSaleList = classNames("sale-list-zone", {
            'saleteam-list-show': this.state.isSaleTeamShow && this.state.notfirstLogin,
            'saleteam-list-hide': !this.state.isSaleTeamShow && this.state.notfirstLogin,
        });
        var crmDataZone = classNames("crm-home-data-zone", {
            "data-zone-small": this.state.isSaleTeamShow && this.state.notfirstLogin,
            "data-zone-large": !this.state.isSaleTeamShow && this.state.notfirstLogin,
            "first-login-show": !this.state.isSaleTeamShow && !this.state.notfirstLogin,
            "is-sales-role": (this.state.currShowType == showTypeConstant.SALESMAN && !this.state.currShowSalesman)
        });
        var hamburgerCls = classNames("iconfont", "icon-hamburger", {
            "is-active": this.state.isSaleTeamShow,
        });
        var title = (this.state.isSaleTeamShow ? Intl.get("sales.homepage.hide.teamlist", "隐藏团队列表") :
            Intl.get("sales.homepage.show.teamlist", "展开团队列表"));
        {/*不显示激活邮箱提示的情况
         1.正在加载个人配置信息时或者加载出错时，不展示
         2.手动设置过不再提醒的用户，不展示
         3.正在加载个人邮箱信息或加载出错或邮箱已经激活的用户，不展示
         */
        }
        var ActiveEmailHideFlag =
            ((this.state.getWebConfigStatus === "loading" || this.state.getWebConfigStatus === "error")
            || (this.state.getWebConfigObj && this.state.getWebConfigObj.setting_notice_ignore == "yes") || (this.state.emailEnable));
        return (<RightContent>
            <div className="sales_home_content" data-tracename="销售首页">
                <TopNav>
                    <div className="date-range-wrap">
                        <DatePicker
                            disableDateAfterToday={true}
                            range="day"
                            onSelect={this.onSelectDate}>
                            <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                            <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                            <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                            <DatePicker.Option
                                value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                            <DatePicker.Option
                                value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                            <DatePicker.Option value="year">{Intl.get("common.time.unit.year", "年")}</DatePicker.Option>
                            <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                        </DatePicker>
                    </div>
                    {(this.state.currShowType == showTypeConstant.SALESMAN && !this.state.currShowSalesman) ? null :
                        <div className="crm-home-teamlist-show-flag">
                        <span className={hamburgerCls} onClick={this.handleCrmTeamListShow} title={title}>
                        </span>
                        </div>}
                    {
                        //<div className="crm-home-add-btn">
                        //    <span className="iconfont icon-add-btn"/>
                        //</div>
                    }
                </TopNav>
                {this.state.salesTeamListObj.resultType == "loading" ?
                    <div className="spinner-container">
                        <Spinner/>
                    </div>
                    : <div className="crm-home-container">
                        <div className={crmDataZone}>
                            {/*邮箱是否已经激活*/}
                            {ActiveEmailHideFlag ? null :
                                <ActiveEmailTip
                                    isAnimateShow={this.state.isAnimateShow}
                                    isAnimateHide={this.state.isAnimateHide}
                                    handleClickNoTip={this.hideActiveEmailTip}
                                    activeUserEmail={this.activeUserEmail}
                                    setWebConfigStatus={this.state.setWebConfigStatus}
                                    jumpToUserInfo={this.jumpToUserInfo}
                                    hasNoEmail={this.state.hasNoEmail}
                                />
                            }
                            <StatisticTotal
                                customerTotalObj={this.state.customerTotalObj}
                                userTotalObj={this.state.userTotalObj}
                                phoneTotalObj={this.state.phoneTotalObj}
                                activeView={this.state.activeView}
                            />
                            {/*即将过期的用户列表，所有角色都会展示*/}
                            <div className="will-expire-user-container">
                                {this.renderWillExpireUser()}
                            </div>
                            <div className="statistic-data-analysis">
                                {this.renderAnalysisView()}
                            </div>


                        </div>
                        {/*除了销售之外*/}
                        {!(this.state.currShowType == showTypeConstant.SALESMAN && !this.state.currShowSalesman) ? (
                            <div className={crmSaleList}>
                                <CrmRightList currShowType={this.state.currShowType}
                                              salesTeamListObj={this.state.salesTeamListObj}
                                              originSalesTeamTree={this.state.originSalesTeamTree}
                                              scrollbarEnabled={this.state.scrollbarEnabled}
                                              currShowSalesTeam={this.state.currShowSalesTeam}
                                              currShowSalesman={this.state.currShowSalesman}
                                              getSalesListHeight={this.getSalesListHeight}
                                              refreshDataByChangeSales={this.refreshDataByChangeSales}
                                              salesTeamMembersObj={this.state.salesTeamMembersObj}
                                              updateScrollBar={this.state.updateScrollBar}
                                              salesCallStatus={this.state.salesCallStatus}
                                              teamMemberCountList={this.state.teamMemberCountList}
                                />
                            </div>
                        ) : null}
                    </div>}

            </div>
        </RightContent>);
    }
});

module.exports = SalesHomePage;