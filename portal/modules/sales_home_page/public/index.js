require('./css/index.less');
const Emitters = require('PUB_DIR/sources/utils/emitters');
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;
var getDataAuthType = require('CMP_DIR/privilege/checker').getDataAuthType;
import {Select, message, Alert} from 'antd';
import {AntcTable} from 'antc';
import Trace from 'LIB_DIR/trace';
const Option = Select.Option;
var RightContent = require('../../../components/privilege/right-content');
var SalesHomeStore = require('./store/sales-home-store');
var SalesHomeAction = require('./action/sales-home-actions');
var TopNav = require('../../../components/top-nav');
import DatePicker from '../../../components/datepicker';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import ActiveEmailTip from './views/active-email-tip';
var StatisticTotal = require('./views/statistic-total');
var CrmRightList = require('./views/crm-right-list');
import WillExpiredUsers from './views/will-expire-user-list';
var CustomerAnalysis = require('./views/customer-analysis');
var UserAnalysis = require('./views/user-analysis');
var constantUtil = require('./util/constant');
let showTypeConstant = constantUtil.SHOW_TYPE_CONSTANT;//当前展示的类型常量（销售团队列表、团队成员列表、销售的待办事宜）
var viewConstant = constantUtil.VIEW_CONSTANT;//视图常量
var layoutConstant = constantUtil.LAYOUTS;//布局常量
var Spinner = require('CMP_DIR/spinner');
import classNames from 'classnames';
var scrollTimeout = null;
import { storageUtil } from 'ant-utils';
var pageId = oplateConsts.PAGE_ID.SALES_HOME;
var key = 'hamburger-button-flag';//用于记录展开或者关闭销售团队列表的状态
import history from 'PUB_DIR/sources/history';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {CALL_TYPE_OPTION} from 'PUB_DIR/sources/utils/consts';
import commonDataUtil from 'PUB_DIR/sources/utils/get-common-data-util';
const SORT_ICON_WIDTH = 16;
//延时展示激活邮箱提示框的时间
const DELAY_TIME = 2000;
const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
var SalesHomePage = React.createClass({
    getInitialState: function() {
        SalesHomeAction.setInitState();
        let stateData = SalesHomeStore.getState();
        var isSaleTeamShow = true;
        var flag = storageUtil.local.get(key, pageId);
        if (flag === null) {
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
            phoneSorter: {},//电话的排序对象
            callBackSorter: {}, // 回访的排序对象
            appList: [], //应用数组
            selectedAppId: '' //选中的应用id
        };
    },
    onChange: function() {
        this.setState(SalesHomeStore.getState());
    },
    getDataType: function() {
        if (hasPrivilege('GET_TEAM_LIST_ALL')) {
            return 'all';
        } else if (hasPrivilege('GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS')) {
            return 'self';
        } else {
            return '';
        }
    },
    getAppList() {
        commonDataUtil.getAppList(appList => {
            let selectedAppId = appList.length && appList[0].client_id || '';
            this.setState({appList: appList, selectedAppId: selectedAppId});
        });
    },
    componentDidMount: function() {
        SalesHomeStore.listen(this.onChange);
        let type = this.getDataType();
        //获取统计团队内成员个数的列表
        SalesHomeAction.getTeamMemberCountList();
        SalesHomeAction.getSalesTeamList(type);
        // 获取应用列表
        this.getAppList();
        this.refreshSalesListData();
        this.resizeLayout();
        $(window).resize(() => this.resizeLayout());
        $('.statistic-data-analysis').mousewheel(function() {
            $('.statistic-data-analysis .thumb').show();
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => $('.statistic-data-analysis .thumb').hide(), 300);
        });
        //获取是否能展示邮箱激活提示
        SalesHomeAction.getShowActiveEmailObj();
        //外层父组件加载完成后，再由上到下推出激活邮箱提示框
        setTimeout(() => {
            this.setState({
                isAnimateShow: true
            });
        }, DELAY_TIME);
    },
    resizeLayout: function() {
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
    getWebConfig: function() {
        SalesHomeAction.getWebsiteConfig();
    },
    getListBlockHeight: function() {
        let listHeight = null;

        if (this.state.scrollbarEnabled) {
            listHeight = $(window).height() - layoutConstant.TOP_NAV_H - layoutConstant.TOTAL_H -
                layoutConstant.SELECT_TYPE_H - layoutConstant.BOTTOM;
        }
        return listHeight;
    },
    componentWillUnmount: function() {
        SalesHomeAction.setInitState();
        SalesHomeStore.unlisten(this.onChange);
    },
    //获取查询参数
    getQueryParams: function() {
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
        let authType = 'user';//CALLRECORD_CUSTOMER_PHONE_STATISTIC_USER
        if (hasPrivilege('CALLRECORD_CUSTOMER_PHONE_STATISTIC_MANAGER')) {
            authType = 'manager';
        }
        return authType;
    },
    getPhoneTop10Params: function() {
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
    refreshSalesListData: function(isSwitchTeam) {
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
        SalesHomeAction.setListIsLoading(viewConstant.CALL_BACK);
        //切换团队数据的时候，不用发获取回访的请求
        if (!isSwitchTeam){
            this.getCallBackList();
        }
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
    getPhoneParams: function() {
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
    // 设置获取回访列表的接口参数
    getCallBackList(queryParam) {
        let startTime = this.state.start_time ? this.state.start_time : moment('2010-01-01 00:00:00').valueOf(),
            endTime = this.state.end_time ? this.state.end_time : moment().endOf('day').valueOf();
        let paramsObj = {
            params: {
                start_time: startTime,
                end_time: endTime,
                page_size: 20,
                sort_field: 'call_date',
                sort_order: 'descend',
            },
            query: {
                lastId: queryParam ? queryParam.lastId : '',
                // 电话记录类型
                phone_type: 'all',
            }
        };
        let filterObj = {
            type: 'call_back'
        };
        SalesHomeAction.getCallBackList(paramsObj, filterObj);
    },
    //获取销售列的标题
    getSalesColumnTitle: function() {
        var userType = this.state.userType;
        var label = Intl.get('sales.home.sales', '销售');
        if (userType === 'senior_leader') {
            label = Intl.get('user.sales.team', '销售团队');
        }
        return label;
    },
    getPhoneColumnTitle: function(label, key) {
        let sorter = this.state.phoneSorter;
        let sortIcon = null;
        if (sorter.field === key) {
            if (sorter.order === 'descend') {
                sortIcon = <span className='iconfont icon-xiajiantou phone-sort-icon'/>;
            } else if (sorter.order === 'ascend') {
                sortIcon = <span className='iconfont icon-jiantou-up phone-sort-icon'/>;
            }
        }
        return <span>{label}{sortIcon}</span>;
    },
    getCallBackColumnTitle(label, key) {
        let sorter = this.state.callBackSorter;
        let sortIcon = null;
        if (sorter.field === key) {
            if (sorter.order === 'descend') {
                sortIcon = <span className='iconfont icon-xiajiantou phone-sort-icon'/>;
            } else if (sorter.order === 'ascend') {
                sortIcon = <span className='iconfont icon-jiantou-up phone-sort-icon'/>;
            }
        }
        return <span>{label}{sortIcon}</span>;
    },
    getColumnMinWidth: function(width, key) {
        //正在排序的列宽需加上排序按钮的宽度
        if (this.state.phoneSorter.field === key) {
            width += SORT_ICON_WIDTH;
        }
        return width;
    },
    getPhoneListColumn: function() {
        let col_width = 95, num_col_width = 80;
        let columns = [{
            title: this.getSalesColumnTitle(),
            dataIndex: 'salesName',
            key: 'sales_Name',
            width: num_col_width
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.total.duration', '总时长'), 'totalTimeDescr'),
            dataIndex: 'totalTimeDescr',
            key: 'total_time',
            sorter: function(a, b) {
                return a.totalTime - b.totalTime;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'totalTimeDescr')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.total.connected', '总接通数'), 'calloutSuccess'),
            dataIndex: 'calloutSuccess',
            key: 'callout_success',
            sorter: function(a, b) {
                return a.calloutSuccess - b.calloutSuccess;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'calloutSuccess')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.average.duration', '日均时长'), 'averageTimeDescr'),
            dataIndex: 'averageTimeDescr',
            key: 'average_time',
            sorter: function(a, b) {
                return a.averageTime - b.averageTime;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'averageTimeDescr')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.average.connected', '日均接通数'), 'averageAnswer'),
            dataIndex: 'averageAnswer',
            key: 'average_answer',
            sorter: function(a, b) {
                return a.averageAnswer - b.averageAnswer;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(col_width, 'averageAnswer')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.phone.callin', '呼入次数'), 'callinCount'),
            dataIndex: 'callinCount',
            key: 'callin_count',
            sorter: function(a, b) {
                return a.callinCount - b.callinCount;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'callinCount')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.phone.callin.success', '成功呼入'), 'callinSuccess'),
            dataIndex: 'callinSuccess',
            key: 'callin_success',
            sorter: function(a, b) {
                return a.callinSuccess - b.callinSuccess;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'callinSuccess')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.phone.callin.rate', '呼入接通率'), 'callinRate'),
            dataIndex: 'callinRate',
            key: 'callin_rate',
            sorter: function(a, b) {
                return a.callinRate - b.callinRate;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(col_width, 'callinRate')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.phone.callout', '呼出次数'), 'calloutCount'),
            dataIndex: 'calloutCount',
            key: 'callout_count',
            sorter: function(a, b) {
                return a.calloutCount - b.calloutCount;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(num_col_width, 'calloutCount')
        }, {
            title: this.getPhoneColumnTitle(Intl.get('sales.home.phone.callout.rate', '呼出接通率'), 'calloutRate'),
            dataIndex: 'calloutRate',
            key: 'callout_rate',
            sorter: function(a, b) {
                return a.calloutRate - b.calloutRate;
            },
            className: 'has-filter table-data-align-right',
            width: this.getColumnMinWidth(col_width, 'calloutRate')
        }];
        //当前展示的是客套类型的通话记录时，展示计费时长
        if (this.state.callType === CALL_TYPE_OPTION.APP) {
            columns.push({
                title: this.getPhoneColumnTitle(Intl.get('sales.home.phone.billing.time', '计费时长') + '(min)', 'billingTime'),
                dataIndex: 'billingTime',
                key: 'filling_time',
                sorter: function(a, b) {
                    return a.billingTime - b.billingTime;
                },
                className: 'has-filter table-data-align-right',
                width: this.getColumnMinWidth(120, 'billingTime')
            });
        }
        return columns;
    },
    getCallBackListColumn() {
        let columns = [
            {
                title: this.getCallBackColumnTitle(Intl.get('common.callback.time', '回访时间'), 'call_date'),
                dataIndex: 'call_date',
                width: 100,
                sorter: function(a, b) {
                    return a.call_date - b.call_date;
                },
                className: 'has-sorter table-data-align-right',
                render: (call_date) => {
                    var displayTime = moment(new Date(+call_date)).format(DATE_TIME_FORMAT);
                    return (
                        <div title={displayTime}>
                            {displayTime}
                        </div>
                    );
                }
            },
            {
                title: Intl.get('crm.41', '客户名'),
                dataIndex: 'customer_name',
                width: 100,
                className: 'table-data-align-right',
            },
            {
                title: Intl.get('menu.trace', '跟进记录'),
                dataIndex: 'remark',
                width: 100,
                className: 'table-data-align-right',
            },
            {
                title: Intl.get('common.callback.person', '回访人'),
                dataIndex: 'nick_name',
                width: 100,
                className: 'table-data-align-right',
            }
        ];
        return columns;
    },
    //获取分析图表展示区所需的布局参数
    getChartLayoutParams: function() {
        let chartWidth = 0;
        let chartListHeight = $(window).height() - $('.statistic-total-data').height() - layoutConstant.TOP - layoutConstant.BOTTOM;
        let windowWidth = $(window).width();
        let chartListContainerW = $('.statistic-data-analysis').width() - layoutConstant.CHART_PADDING;
        if (windowWidth >= Oplate.layout['screen-md']) {
            chartWidth = Math.floor(( chartListContainerW - layoutConstant.CHART_PADDING * 4) / 2);
        } else {
            chartWidth = Math.floor(chartListContainerW - layoutConstant.CHART_PADDING * 2);
        }
        return {chartWidth: chartWidth, chartListHeight: chartListHeight};
    },
    //通过销售名称获取对应的Id
    getSaleIdByName: function(name) {
        let teamMemberList = this.state.salesTeamMembersObj.data;
        if (_.isArray(teamMemberList) && teamMemberList.length) {
            let sales = _.find(teamMemberList, member => member.nickName === name);
            return sales ? sales.userId : '';
        } else {
            return '';
        }
    },

    getChangeCallTypeData: function() {
        let queryParams = this.getPhoneParams();
        SalesHomeAction.getSalesPhoneList(queryParams);
        let callTotalAuth = this.getCallTotalAuth();
        let top10Params = this.getPhoneTop10Params();
        //通话总次数、总时长TOP10
        SalesHomeAction.getCallTotalList(callTotalAuth, top10Params);
    },

    // 选择通话类型的值
    selectCallTypeValue(value){
        if (value === CALL_TYPE_OPTION.PHONE) {
            this.state.callType = CALL_TYPE_OPTION.PHONE;
        } else if (value === CALL_TYPE_OPTION.APP) {
            this.state.callType = CALL_TYPE_OPTION.APP;
        } else if (value === CALL_TYPE_OPTION.ALL) {
            this.state.callType = CALL_TYPE_OPTION.ALL;
        }
        this.setState({
            callType: value
        });
        this.getChangeCallTypeData();
        //发送点击事件
        Trace.traceEvent('销售首页', '选择' + value + '类型');
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
                        <span>{Intl.get('user.online.all.type', '全部类型')}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        <span>{Intl.get('call.record.call.center', '呼叫中心')}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        <span>{Intl.get('common.ketao.app', '客套APP')}</span>
                    </Option>
                </Select>
            </div>
        );
    },
    getPhoneTableMinWidth: function() {
        let tableMinWitdh = this.state.callType === CALL_TYPE_OPTION.APP ? 965 : 845;
        //有排序的列，table的宽带需要加上排序按钮的宽度
        if (!_.isEmpty(this.state.phoneSorter)) {
            tableMinWitdh += SORT_ICON_WIDTH;
        }
        return tableMinWitdh;
    },
    //渲染数据分析视图
    renderAnalysisView: function() {
        if (this.state.activeView === viewConstant.CUSTOMER) {
            return (<CustomerAnalysis ref="customerView" startTime={this.state.start_time} endTime={this.state.end_time}
                timeType={this.state.timeType}
                scrollbarEnabled={this.state.scrollbarEnabled}
                currShowSalesTeam={this.state.currShowSalesTeam}
                currShowSalesman={this.state.currShowSalesman}
                originSalesTeamTree={this.state.originSalesTeamTree}
                getSaleIdByName={this.getSaleIdByName}
                getChartLayoutParams={this.getChartLayoutParams}
                updateScrollBar={this.state.updateScrollBar}
                emitters={this.getEmitters()}
                conditions={this.getConditions()}
            />);
        } else if (this.state.activeView === viewConstant.USER) {
            return (<UserAnalysis ref="userView" startTime={this.state.start_time} endTime={this.state.end_time}
                timeType={this.state.timeType}
                scrollbarEnabled={this.state.scrollbarEnabled}
                currShowSalesTeam={this.state.currShowSalesTeam}
                currShowSalesman={this.state.currShowSalesman}
                originSalesTeamTree={this.state.originSalesTeamTree}
                getSaleIdByName={this.getSaleIdByName}
                getChartLayoutParams={this.getChartLayoutParams}
                updateScrollBar={this.state.updateScrollBar}
                emitters={this.getEmitters()}
                conditions={this.getConditions()}
                appList={this.state.appList} 
                selectedAppId={this.state.selectedAppId}                  
            />);
        } else if (this.state.activeView === viewConstant.PHONE) {
            return (<div className="sales-table-container sales-phone-table" ref="phoneList">
                {this.filterCallTypeSelect()}
                <div className="phone-table-block" style={{height: this.getListBlockHeight()}}>
                    <GeminiScrollbar enabled={this.props.scrollbarEnabled} ref="phoneScrollbar">
                        <AntcTable dataSource={this.state.salesPhoneList} columns={this.getPhoneListColumn()}
                            loading={this.state.isLoadingPhoneList}
                            scroll={{x: this.getPhoneTableMinWidth()}}
                            pagination={false} bordered util={{zoomInSortArea: true}}
                            onChange={this.onTableChange}
                        />
                        {/*根据电话的排序的通话次数TOP10*/}
                        {this.renderCallTopTen(this.state.callTotalCountObj, {
                            title: Intl.get('call.analysis.total.count', '通话总次数'),
                            dataKey: 'count'
                        })}
                        {/*根据电话的排序的通话总时长TOP10*/}
                        {this.renderCallTopTen(this.state.callTotalTimeObj, {
                            title: Intl.get('call.analysis.total.time', '通话总时长'),
                            dataKey: 'sum'
                        })}
                    </GeminiScrollbar>
                </div>
            </div>);
        } else if (this.state.activeView === viewConstant.CALL_BACK) {
            let tableClassnames = classNames('callback-table-block',{
                'hide-body': this.state.callBackRecord.page === 1 && this.state.callBackRecord.isLoading,
            });
            // 首次加载时不显示下拉加载状态
            const handleScrollLoading = () => {
                if (this.state.callBackRecord.page === 1) {
                    return false;
                }
                return this.state.callBackRecord.isLoading;
            };
            // 下拉加载数据
            const handleScrollBottom = () => {
                let callBackRecordList = this.state.callBackRecord.dataList, lastId;
                if (_.isArray(callBackRecordList) && callBackRecordList.length > 0) {
                    lastId = callBackRecordList[callBackRecordList.length - 1].id;//最后一个客户的id
                }
                this.getCallBackList({ lastId: lastId });
            };
            // 显示没有更多数据提示
            const showNoMoreDataTip = () => {
                return !this.state.callBackRecord.isLoading &&
                        this.state.callBackRecord.dataList.length >= this.state.callBackRecord.pageSize &&
                        !this.state.callBackRecord.listenScrollBottom;
            };
            const dropLoadConfig = {
                loading: handleScrollLoading(),
                listenScrollBottom: this.state.callBackRecord.listenScrollBottom,
                handleScrollBottom,
                showNoMoreDataTip: showNoMoreDataTip(),
                noMoreDataText: Intl.get('noMoreTip.visitBack', '没有更多回访记录了')
            };
            return (
                <div>
                    <Spinner
                        className={(this.state.callBackRecord.page === 1 && this.state.callBackRecord.isLoading) ? 'spin-fix' : 'hide'}
                    />
                    <div className='sales-table-container'>
                        <div className={tableClassnames} style={{height: this.getListBlockHeight()}}>
                            <AntcTable
                                dropLoad={dropLoadConfig}
                                dataSource={this.state.callBackRecord.dataList}
                                columns={this.getCallBackListColumn()}
                                pagination={false}
                                bordered
                                util={{zoomInSortArea: true}}
                                onChange={this.onCallBackTableChange}
                                scroll={{y: 400}}
                            />
                        </div>
                    </div>
                </div>
            );
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
                title: Intl.get('common.phone', '电话'),
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
                render: function(data) {
                    return <div>{titleObj.dataKey === 'count' ? data : TimeUtil.getFormatTime(data)}</div>;
                }
            }, {
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'customer_name',
                width: '250',
                className: 'table-data-align-left',
                key: 'customer_name'
            }, {
                title: Intl.get('call.record.caller', '呼叫者'),
                dataIndex: 'nick_name',
                width: '70',
                className: 'table-data-align-left',
                key: 'nick_name'
            }
        ];
    },
    onTableChange: function(pagination, filters, sorter) {
        this.setState({phoneSorter: sorter});
    },
    onCallBackTableChange(pagination, filters, sorter) {
        this.setState({callBackSorter: sorter});
    },
    //时间的设置
    onSelectDate: function(startTime, endTime, timeType) {
        let timeObj = {startTime: startTime, endTime: endTime, timeType: timeType};
        SalesHomeAction.changeSearchTime(timeObj);
        SalesHomeAction.resetCallBackRecord();
        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
        setTimeout(() => {
            //刷新统计数据
            this.refreshSalesListData();
            if (this.state.activeView === viewConstant.CUSTOMER) {
                //刷新客户分析数据
                this.refs.customerView.getChartData();
            } else if (this.state.activeView === viewConstant.USER) {
                //刷新用户分析数据
                this.refs.userView.getChartData();
            }
        });
    },
    //切换销售团队、销售时，刷新数据
    refreshDataByChangeSales: function() {
        this.refreshSalesListData(true);
        //刷新统计数据
        if (this.state.activeView === viewConstant.CUSTOMER) {
            //刷新客户分析数据
            this.refs.customerView.getChartData();
        } else if (this.state.activeView === viewConstant.USER) {
            //刷新用户分析数据
            this.refs.userView.getChartData();
        }
    },
    //获取右侧销售团队列表的高度
    getSalesListHeight: function() {
        let salesListHeight = 'auto';
        if (this.state.scrollbarEnabled) {
            salesListHeight = $(window).height() - layoutConstant.TOP - layoutConstant.TITLE_HEIGHT;
        }
        return salesListHeight;
    },
    //获取左侧即将到期客户高度
    getWillExpireUserListHeight: function() {
        let salesListHeight = 'auto';
        if (this.state.scrollbarEnabled) {
            salesListHeight = $(window).height() - layoutConstant.TOP_NAV_H - layoutConstant.EXPIRE_TITLE_H - layoutConstant.BOTTOM;
        }
        return salesListHeight;
    },
    //点击 邮箱激活提示 中的不再提示，隐藏提示框
    hideActiveEmailTip: function() {
        SalesHomeAction.setWebsiteConfig({'setting_notice_ignore': 'yes'}, (errMsg) => {
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
    activeUserEmail: function() {
        if (!this.state.emailShowObj.email) {
            return;
        }
        SalesHomeAction.activeUserEmail((resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get('user.info.active.email', '激活邮件已发送至{email}', {'email': this.state.emailShowObj.email})
                );
            }
        });
    },
    handleCrmTeamListShow: function() {
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
        });
    },
    //跳转到个人信息页面
    jumpToUserInfo: function() {
        history.pushState({}, '/user_info_manage/user_info', {});
    },
    renderWillExpireUser: function() {
        return (
            <WillExpiredUsers
                expireUserLists={this.state.expireUserLists}
                isLoadingExpireUserList={this.state.isLoadingExpireUserList}
                errMsg={this.state.errMsg}
                getWillExpireUserListHeight={this.getWillExpireUserListHeight}
                scrollbarEnabled={this.state.scrollbarEnabled}
                updateScrollBar={this.state.updateScrollBar}
                member_id={this.state.currShowSalesman.userId}
                team_id={this.state.currShowSalesTeam.group_id}
            />
        );
    },
    //获取触发器
    getEmitters: function() {
        return [
            {
                instance: dateSelectorEmitter,
                event: dateSelectorEmitter.SELECT_DATE,
                callbackArgs: [{
                    name: 'starttime',
                }, {
                    name: 'endtime',
                }],
            },
            {
                instance: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: 'team_ids',
                    exclusive: 'member_id'
                }],
            },
            {
                instance: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_MEMBER,
                callbackArgs: [{
                    name: 'member_id',
                    exclusive: 'team_ids'
                }],
            },
        ];
    },
    //获取图表条件
    getConditions: function() {
        return [
            {
                name: 'starttime',
                value: this.state.start_time,
            },
            {
                name: 'endtime',
                value: this.state.end_time,
            },
            {
                name: 'app_id',
                value: 'all',
            },
            {
                name: 'team_ids',
                value: '',
            },
            {
                name: 'member_id',
                value: '',
            },
            {
                name: 'data_type',
                value: this.getDataType(),
                type: 'params',
            },
            {
                name: 'auth_type',
                value: getDataAuthType().toLowerCase(),
                type: 'params',
            }
        ];
    },
    //渲染客户关系首页
    render: function() {
        var crmSaleList = classNames('sale-list-zone', {
            'saleteam-list-show': this.state.isSaleTeamShow && this.state.notfirstLogin,
            'saleteam-list-hide': !this.state.isSaleTeamShow && this.state.notfirstLogin,
        });
        var crmDataZone = classNames('crm-home-data-zone', {
            'data-zone-small': this.state.isSaleTeamShow && this.state.notfirstLogin,
            'data-zone-large': !this.state.isSaleTeamShow && this.state.notfirstLogin,
            'first-login-show': !this.state.isSaleTeamShow && !this.state.notfirstLogin,
            'is-sales-role': (this.state.currShowType === showTypeConstant.SALESMAN && !this.state.currShowSalesman)
        });
        var hamburgerCls = classNames('iconfont', 'icon-hamburger', {
            'is-active': this.state.isSaleTeamShow,
        });
        var title = (this.state.isSaleTeamShow ? Intl.get('sales.homepage.hide.teamlist', '隐藏团队列表') :
            Intl.get('sales.homepage.show.teamlist', '展开团队列表'));
        return (<RightContent>
            <div className="sales_home_content" data-tracename="销售首页">
                <TopNav>
                    <div className="date-range-wrap">
                        <DatePicker
                            disableDateAfterToday={true}
                            range={this.state.timeType}
                            onSelect={this.onSelectDate}>
                            <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                            <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                            <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                            <DatePicker.Option
                                value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                            <DatePicker.Option
                                value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                            <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                            <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                        </DatePicker>
                    </div>
                    {(this.state.currShowType === showTypeConstant.SALESMAN && !this.state.currShowSalesman) ? null :
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
                {this.state.salesTeamListObj.resultType === 'loading' ?
                    <div className="spinner-container">
                        <Spinner/>
                    </div>
                    : <div className="crm-home-container">
                        <div className={crmDataZone}>
                            {/*是否展示邮箱激活或者添加邮箱的提示提示*/}
                            {this.state.emailShowObj.isShowActiveEmail || this.state.emailShowObj.isShowAddEmail ?
                                <ActiveEmailTip
                                    isAnimateShow={this.state.isAnimateShow}
                                    isAnimateHide={this.state.isAnimateHide}
                                    handleClickNoTip={this.hideActiveEmailTip}
                                    activeUserEmail={this.activeUserEmail}
                                    setWebConfigStatus={this.state.setWebConfigStatus}
                                    jumpToUserInfo={this.jumpToUserInfo}
                                    addEmail={this.state.emailShowObj.isShowAddEmail}
                                /> : null}
                            <StatisticTotal
                                customerTotalObj={this.state.customerTotalObj}
                                userTotalObj={this.state.userTotalObj}
                                phoneTotalObj={this.state.phoneTotalObj}
                                callBackRecord={this.state.callBackRecord}
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
                        {!(this.state.currShowType === showTypeConstant.SALESMAN && !this.state.currShowSalesman) ? (
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
