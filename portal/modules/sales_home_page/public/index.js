require('./css/index.less');
import callChart from 'MOD_DIR/analysis/public/charts/call';
const Emitters = require('PUB_DIR/sources/utils/emitters');
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;
var getDataAuthType = require('CMP_DIR/privilege/checker').getDataAuthType;
import {Select, message, Alert, Button} from 'antd';
import {AntcTable, AntcAnalysis, AntcCardContainer} from 'antc';
import { processTableChartCsvData } from 'antc/lib/components/analysis/utils';
import Trace from 'LIB_DIR/trace';
const Option = Select.Option;
var RightContent = require('../../../components/privilege/right-content');
var SalesHomeStore = require('./store/sales-home-store');
var SalesHomeAction = require('./action/sales-home-actions');
var TopNav = require('../../../components/top-nav');
import { AntcDatePicker as DatePicker } from 'antc';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
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
import CustomerListPanel from 'MOD_DIR/crm/public/customer-list-panel';
import UserListPanel from 'MOD_DIR/app_user_manage/public/user-list-panel';
import {CALL_TYPE_OPTION} from 'PUB_DIR/sources/utils/consts';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {getEmailActiveUrl} from 'PUB_DIR/sources/utils/common-method-util';
import InviteMember from 'MOD_DIR/invite_member/public';
import AlertTip from 'CMP_DIR/alert-tip';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
import commonSalesHomePrivilegeConst from './privilege-const';
import publicPrivilegeConst from 'PUB_DIR/privilege-const';
import shpPrivilegeConst from './privilege-const';
import analysisPrivilegeConst from '../../analysis/public/privilege-const';

//延时展示激活邮箱提示框的时间
const DELAY_TIME = 2000;
const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
var websiteConfig = require('../../../lib/utils/websiteConfig');
var setWebsiteConfig = websiteConfig.setWebsiteConfig;

//三字符表头宽度
const THERE_CHAR_WIDTH = 80;
//四字符表头宽度
const FOUR_CHAR_WIDTH = 95;
//五字符表头宽度
const FIVE_CHAR_WIDTH = 105;
//六字符表头宽度
const SIX_CHAR_WIDTH = 120;
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
class SalesHomePage extends React.Component {
    constructor(props) {
        super(props);
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

        this.state = {
            ...stateData,
            scrollbarEnabled: false, //是否需要滚动条
            callType: CALL_TYPE_OPTION.ALL, // 通话类型
            isAnimateShow: false,//是否动态由上到下推出 激活邮箱提示框
            isAnimateHide: false,//是否动态隐藏 提示框
            isClientAnimateShow: false,//是否动态由上到下推出 设置坐席号提示框
            isClientAnimateHide: false,//是否动态隐藏 提示框
            isSaleTeamShow: isSaleTeamShow,//右侧销售团队列表是否展示
            notfirstLogin: false,//不是第一次登录，避免初次加载出现滑动的效果
            updateScrollBar: false,//更新滚动条外
            phoneSorter: {},//电话的排序对象
            callBackSorter: {}, // 回访的排序对象
            appList: [], //应用数组
            selectedAppId: '', //选中的应用id
            isShowEffectiveTimeAndCount: false, // 是否展示有效通话时长和有效接通数
            setWebConfigClientStatus: false,//设置不再展示提示添加坐席号的提示
            addListener: false, //是否监听了坐席号配置完成的方法
        };
    }

    onChange = () => {
        this.setState(SalesHomeStore.getState());
    };

    getDataType = () => {
        //这个权限保留了
        if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)) {
            return 'all';
        } else if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS)) {
            return 'self';
        } else {
            return '';
        }
    };

    getAppList = () => {
        commonDataUtil.getAppList(appList => {
            let selectedAppId = appList.length && appList[0].app_id || '';
            this.setState({appList: appList, selectedAppId: selectedAppId});
        });
    };

    // 获取组织电话系统配置
    getCallSystenConfig = () => {
        commonDataUtil.getCallSystemConfig().then(config => {
            let isShowEffectiveTimeAndCount = _.get(config,'filter_114',false) || _.get(config,'filter_customerservice_number',false);
            this.setState({ isShowEffectiveTimeAndCount });
        });
    };

    componentDidMount() {
        SalesHomeStore.listen(this.onChange);
        let type = this.getDataType();
        // 有审批权限时，获取待我审批的邀请成员列表
        if (hasPrivilege(commonSalesHomePrivilegeConst.MEMBER_INVITE_APPLY)) {
            SalesHomeAction.getPendingApproveMemberApplyList();
        }
        //获取统计团队内成员个数的列表
        SalesHomeAction.getTeamMemberCountList();
        SalesHomeAction.getSalesTeamList(type);
        // 获取应用列表
        this.getAppList();
        this.getCallSystenConfig();
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
        //外层父组件加载完成后，再由上到下推出激活邮箱提示框
        setTimeout(() => {
            this.setState({
                isAnimateShow: true,
                isClientAnimateShow: true
            }, () => {
                //触发窗口大小变更事件，以重新计算滚动区域高度
                this.triggerWindowResizeEvent();
            });
        }, DELAY_TIME);
        this.getPhoneInitialed();
    }

    //触发窗口大小变更事件
    triggerWindowResizeEvent() {
        setTimeout(() => {
            //触发窗口大小变更事件，以重新计算图表区域高度，防止出现图表展示不全的情况
            window.dispatchEvent(new Event('resize'));
        }, DELAY_TIME);
    }

    getPhoneInitialed = () => {
        var showSetPhoneTip = oplateConsts.SHOW_SET_PHONE_TIP;
        if (_.isBoolean(showSetPhoneTip)){
            this.finishedInitialPhone(showSetPhoneTip);
        }else{
            this.setState({
                addListener: true
            });
            notificationEmitter.on(notificationEmitter.PHONE_INITIALIZE, this.finishedInitialPhone);
        }
    };

    resizeLayout = () => {
        let scrollbarEnabled;

        //宽屏不出现滚动条
        if ($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x': 'visible',
                'overflow-y': 'visible'
            });
            //窄屏出现滚动条
            scrollbarEnabled = false;
        } else {
            $('body').css({
                'overflow-x': 'hidden',
                'overflow-y': 'hidden'
            });
            scrollbarEnabled = true;
        }

        this.setState({
            scrollbarEnabled,
        });
    };

    //获取个人配置信息
    getWebConfig = () => {
        SalesHomeAction.getWebsiteConfig();
    };

    getListBlockHeight = () => {
        let listHeight = null;

        if (this.state.scrollbarEnabled) {
            listHeight = $(window).height() - layoutConstant.TOP_NAV_H - layoutConstant.TOTAL_H -
                layoutConstant.BOTTOM;
        }
        return listHeight;
    };

    componentWillUnmount() {
        SalesHomeStore.unlisten(this.onChange);
        if (this.state.addListener){
            this.setState({
                addListener: false
            });
            notificationEmitter.removeListener(notificationEmitter.PHONE_INITIALIZE, this.finishedInitialPhone);
        }
    }
    finishedInitialPhone = (showSetPhoneTip) => {
        //获取是否能展示邮箱激活提示或者设置坐席号提示
        SalesHomeAction.getShowActiveEmailOrClientConfig(showSetPhoneTip);
    };

    //获取查询参数
    getQueryParams = () => {
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
    };

    //刷新数据
    refreshSalesListData = (isSwitchTeam) => {
        let queryParams = this.getQueryParams();
        let dataType = this.getDataType();
        queryParams.dataType = dataType;
        if (hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL) || hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF)){
            SalesHomeAction.getCustomerTotal(queryParams);
        }
        if(hasPrivilege(shpPrivilegeConst.GET_USER_STATISTIC_VIEW) || hasPrivilege(shpPrivilegeConst.USER_ANALYSIS_COMMON)){
            SalesHomeAction.getUserTotal(queryParams);
        }
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

        if(hasPrivilege(shpPrivilegeConst.GET_USER_STATISTIC_VIEW)){
            var queryObj = {};
            if (queryParams.member_id) {
                queryObj.member_id = queryParams.member_id;
            }
            if (queryParams.team_id) {
                queryObj.team_id = queryParams.team_id;
            }
            //获取过期用户列表
            SalesHomeAction.getExpireUser(queryObj);
        }
    };

    getPhoneParams = () => {
        let phoneParams = {
            start_time: this.state.start_time || 0,
            end_time: this.state.end_time || moment().toDate().getTime(),
            device_type: this.state.callType || CALL_TYPE_OPTION.ALL,
        };
        if (this.state.currShowSalesman) {
            //查看当前选择销售的统计数据
            phoneParams.member_ids = this.state.currShowSalesman.userId;
            phoneParams.statistics_type = 'user';
        } else if (this.state.currShowSalesTeam) {
            //查看当前选择销售团队内所有成员的统计数据
            phoneParams.team_ids = this.state.currShowSalesTeam.group_id;
        }
        return phoneParams;
    };

    // 设置获取回访列表的接口参数
    getCallBackList = (queryParam) => {
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
            call_back: 'true'
        };
        SalesHomeAction.getCallBackList(paramsObj, filterObj);
    };

    //获取销售列的标题
    getSalesColumnTitle = () => {
        var userType = this.state.userType;
        var label = Intl.get('sales.home.sales', '销售');
        if (userType === 'senior_leader') {
            label = Intl.get('user.sales.team', '销售团队');
        }
        return label;
    };

    getPhoneListColumn = () => {
        let columns = [{
            title: this.getSalesColumnTitle(),
            dataIndex: 'salesName',
            key: 'sales_Name',
            width: THERE_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.total.duration', '总时长'),
            csvTitle: Intl.get('sales.home.total.duration', '总时长'),
            align: 'right',
            dataIndex: 'totalTime',
            key: 'total_time',
            sorter: function(a, b) {
                return a.totalTime - b.totalTime;
            },
            render: function(text, record, index){
                return text === '-' ? text : (
                    <span>
                        {TimeUtil.getFormatTime(text)}
                    </span>
                );
            },
            className: 'has-filter',
            width: THERE_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.total.connected', '总接通数'),
            csvTitle: Intl.get('sales.home.total.connected', '总接通数'),
            dataIndex: 'calloutSuccess',
            key: 'callout_success',
            sorter: function(a, b) {
                return a.calloutSuccess - b.calloutSuccess;
            },
            className: 'has-filter',
            width: FOUR_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.average.duration', '日均时长'),
            csvTitle: Intl.get('sales.home.average.duration', '日均时长'),
            align: 'right',
            dataIndex: 'averageTime',
            key: 'average_time',
            sorter: function(a, b) {
                return a.averageTime - b.averageTime;
            },
            render: function(text, record, index){
                return text === '-' ? text : (
                    <span>
                        {TimeUtil.getFormatTime(text)}
                    </span>
                );
            },
            className: 'has-filter',
            width: FOUR_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.average.connected', '日均接通数'),
            csvTitle: Intl.get('sales.home.average.connected', '日均接通数'),
            dataIndex: 'averageAnswer',
            key: 'average_answer',
            sorter: function(a, b) {
                return a.averageAnswer - b.averageAnswer;
            },
            className: 'has-filter',
            width: FIVE_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.phone.callin', '呼入次数'),
            csvTitle: Intl.get('sales.home.phone.callin', '呼入次数'),
            dataIndex: 'callinCount',
            key: 'callin_count',
            sorter: function(a, b) {
                return a.callinCount - b.callinCount;
            },
            className: 'has-filter',
            width: FOUR_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.phone.callin.success', '成功呼入'),
            csvTitle: Intl.get('sales.home.phone.callin.success', '成功呼入'),
            dataIndex: 'callinSuccess',
            key: 'callin_success',
            sorter: function(a, b) {
                return a.callinSuccess - b.callinSuccess;
            },
            className: 'has-filter',
            width: FOUR_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.phone.callin.rate', '呼入接通率'),
            csvTitle: Intl.get('sales.home.phone.callin.rate', '呼入接通率'),
            align: 'right',
            dataIndex: 'callinRate',
            key: 'callin_rate',
            sorter: function(a, b) {
                return a.callinRate - b.callinRate;
            },
            className: 'has-filter',
            width: FIVE_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.phone.callout', '呼出次数'),
            csvTitle: Intl.get('sales.home.phone.callout', '呼出次数'),
            dataIndex: 'calloutCount',
            key: 'callout_count',
            sorter: function(a, b) {
                return a.calloutCount - b.calloutCount;
            },
            className: 'has-filter',
            width: FOUR_CHAR_WIDTH
        }, {
            title: Intl.get('sales.home.phone.callout.rate', '呼出接通率'),
            csvTitle: Intl.get('sales.home.phone.callout.rate', '呼出接通率'),
            align: 'right',
            dataIndex: 'calloutRate',
            key: 'callout_rate',
            sorter: function(a, b) {
                return a.calloutRate - b.calloutRate;
            },
            className: 'has-filter',
            width: FIVE_CHAR_WIDTH
        }];
        // 展示有效通话时长和有效接通数
        if(this.state.isShowEffectiveTimeAndCount){
            columns.push({
                title: Intl.get('sales.home.phone.effective.connected', '有效接通数'),
                width: FIVE_CHAR_WIDTH,
                dataIndex: 'effectiveCount',
                key: 'effective_count',
                sorter: function(a, b) {
                    return a.effectiveCount - b.effectiveCount;
                },
                className: 'has-filter'
            }, {
                title: Intl.get('sales.home.phone.effective.time', '有效通话时长'),
                width: SIX_CHAR_WIDTH,
                dataIndex: 'effectiveTime',
                key: 'effective_time',
                sorter: function(a, b) {
                    return a.effectiveTime - b.effectiveTime;
                },
                className: 'has-filter',
                render: function(text, record, index){
                    return text === '-' ? text : (
                        <span>
                            {TimeUtil.getFormatTime(text)}
                        </span>
                    );
                }
            });
        }
        //当前展示的是客套类型的通话记录时，展示计费时长
        if (this.state.callType === CALL_TYPE_OPTION.APP) {
            columns.push({
                title: Intl.get('sales.home.phone.billing.time', '计费时长') + '(min)',
                csvTitle: Intl.get('sales.home.phone.billing.time', '计费时长') + '(min)',
                dataIndex: 'billingTime',
                key: 'filling_time',
                sorter: function(a, b) {
                    return a.billingTime - b.billingTime;
                },
                className: 'has-filter',
                width: FOUR_CHAR_WIDTH
            });
        }
        return columns;
    };

    getCallBackListColumn = () => {
        let columns = [
            {
                title: Intl.get('common.callback.time', '回访时间'),
                dataIndex: 'call_date',
                width: FOUR_CHAR_WIDTH,
                align: 'left',
                className: 'has-sorter',
                sorter: function(a, b) {
                    return a.call_date - b.call_date;
                },
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
                width: FOUR_CHAR_WIDTH,
            },
            {
                title: Intl.get('menu.trace', '跟进记录'),
                dataIndex: 'remark',
                width: FOUR_CHAR_WIDTH,
            },
            {
                title: Intl.get('common.callback.person', '回访人'),
                dataIndex: 'nick_name',
                width: FOUR_CHAR_WIDTH,
            }
        ];
        return columns;
    };

    //获取分析图表展示区所需的布局参数
    getChartLayoutParams = () => {
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
    };

    //通过销售名称获取对应的Id
    getSaleIdByName = (name) => {
        let teamMemberList = this.state.salesTeamMembersObj.data;
        if (_.isArray(teamMemberList) && teamMemberList.length) {
            let sales = _.find(teamMemberList, member => member.nickName === name);
            return sales ? sales.userId : '';
        } else {
            return '';
        }
    };

    getChangeCallTypeData = () => {
        let queryParams = this.getPhoneParams();
        SalesHomeAction.getSalesPhoneList(queryParams);
    };

    // 选择通话类型的值
    selectCallTypeValue = (value) => {
        //发送点击事件
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.call-type-select'), '电话统计>选择' + value + '类型');
        this.setState({
            callType: value
        }, () => {
            this.getChangeCallTypeData();
        });
    };

    // 通话类型的筛选框
    filterCallTypeSelect = () => {
        return (
            <div className="call-type-select" data-tracename="电话统计">
                <Select
                    showSearch
                    value={this.state.callType}
                    onChange={this.selectCallTypeValue}
                    filterOption={(input, option) => ignoreCase(input, option)}
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
    };

    getPhoneTableMinWidth = () => {
        let tableMinWitdh = this.state.callType === CALL_TYPE_OPTION.APP ? 965 : 845;
        return tableMinWitdh;
    };

    //渲染数据分析视图
    renderAnalysisView = () => {
        if (this.state.activeView === viewConstant.CUSTOMER) {
            return (<CustomerAnalysis ref="customerView" startTime={this.state.start_time} endTime={this.state.end_time}
                timeType={this.state.timeType}
                scrollbarEnabled={this.state.scrollbarEnabled}
                currShowType={this.state.currShowType}
                currShowSalesTeam={this.state.currShowSalesTeam}
                currShowSalesman={this.state.currShowSalesman}
                originSalesTeamTree={this.state.originSalesTeamTree}
                getSaleIdByName={this.getSaleIdByName}
                emitterConfigList={this.getEmitters()}
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
                emitterConfigList={this.getEmitters()}
                conditions={this.getConditions()}
                appList={this.state.appList} 
                selectedAppId={this.state.selectedAppId}                  
            />);
        } else if (this.state.activeView === viewConstant.PHONE) {
            return (<div className="sales-table-container sales-phone-table" ref="phoneList">
                <div className="phone-table-block" style={{height: this.getListBlockHeight()}}>
                    <GeminiScrollbar enabled={this.state.scrollbarEnabled} ref="phoneScrollbar">
                        <AntcAnalysis
                            charts={this.getPhoneAnalysisCharts()}
                            style={{padding: 0}}
                            isGetDataOnMount={true}
                            conditions={this.getConditions()}
                            emitterConfigList={this.getEmitters()}
                        />
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

            const title = Intl.get('common.callback.analysis', '回访统计');
            const dataSource = this.state.callBackRecord.dataList;
            const columns = this.getCallBackListColumn();

            return (
                <div>
                    <Spinner
                        className={(this.state.callBackRecord.page === 1 && this.state.callBackRecord.isLoading) ? 'spin-fix' : 'hide'}
                    />
                    <div className='sales-table-container'>
                        <div className={tableClassnames} style={{height: this.getListBlockHeight()}}>
                            <AntcCardContainer
                                title={title}
                                csvFileName={title + '.csv'}
                                exportData={processTableChartCsvData.bind(null, {}, {columns, dataSource})}
                            >
                                <AntcTable
                                    dropLoad={dropLoadConfig}
                                    dataSource={dataSource}
                                    columns={columns}
                                    pagination={false}
                                    util={{zoomInSortArea: true}}
                                    onChange={this.onCallBackTableChange}
                                    scroll={{y: 400}}
                                />
                            </AntcCardContainer>
                        </div>
                    </div>
                </div>
            );
        }
    };

    /* 渲染总时长、总次数为top10的列表
     * titleObj={title:"通话时长",dataKey:"billsec"}
     */
    renderCallTopTen = (dataObj, titleObj) => {
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
    };

    // TOP10数据列表
    getCallDurTopColumn = (titleObj) => {
        return [
            {
                title: Intl.get('common.phone', '电话'),
                dataIndex: 'dst',
                width: '120',
                key: 'call_number'
            }, {
                title: titleObj.title,
                dataIndex: titleObj.dataKey,
                width: '100',
                key: 'holding_time',
                align: 'right',
                render: function(data) {
                    return <div>{titleObj.dataKey === 'count' ? data : TimeUtil.getFormatTime(data)}</div>;
                }
            }, {
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'customer_name',
                width: '250',
                key: 'customer_name'
            }, {
                title: Intl.get('call.record.caller', '呼叫者'),
                dataIndex: 'nick_name',
                width: '70',
                key: 'nick_name'
            }
        ];
    };

    onTableChange = (pagination, filters, sorter) => {
        this.setState({phoneSorter: sorter});
    };

    onCallBackTableChange = (pagination, filters, sorter) => {
        this.setState({callBackSorter: sorter});
    };

    //时间的设置
    onSelectDate = (startTime, endTime, timeType) => {
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
    };

    //切换销售团队、销售时，刷新数据
    refreshDataByChangeSales = () => {
        this.refreshSalesListData(true);
        //刷新统计数据
        if (this.state.activeView === viewConstant.CUSTOMER) {
            //刷新客户分析数据
            this.refs.customerView.getChartData();
        } else if (this.state.activeView === viewConstant.USER) {
            //刷新用户分析数据
            this.refs.userView.getChartData();
        }
    };

    //获取右侧销售团队列表的高度
    getSalesListHeight = () => {
        let salesListHeight = 'auto';
        if (this.state.scrollbarEnabled) {
            salesListHeight = $(window).height() - layoutConstant.TOP - layoutConstant.TITLE_HEIGHT;
        }
        return salesListHeight;
    };

    //获取左侧即将到期客户高度
    getWillExpireUserListHeight = () => {
        let salesListHeight = 'auto';
        if (this.state.scrollbarEnabled) {
            salesListHeight = $(window).height() - layoutConstant.TOP_NAV_H - layoutConstant.EXPIRE_TITLE_H - layoutConstant.BOTTOM;
        }
        return salesListHeight;
    };

    //点击 邮箱激活提示 中的不再提示，隐藏提示框
    hideActiveEmailTip = () => {
        //这里是全量设置，必须把之前未改动的地方也加上去
        SalesHomeAction.setWebsiteConfig({'setting_notice_ignore': 'yes'}, (errMsg) => {
            if (errMsg) {
                //设置错误后的提示
                message.error(errMsg);
            } else {
                //设置成功后，隐藏提示框
                this.setState({
                    isAnimateHide: true
                }, () => {
                    //触发窗口大小变更事件，以重新计算滚动区域高度
                    this.triggerWindowResizeEvent();
                });
            }
        });
    };
    hideSetClientTip = () => {
        let personnelObj = {};
        personnelObj[oplateConsts.STORE_PERSONNAL_SETTING.SETTING_CLIENT_NOTICE_IGNORE] = 'yes';
        this.setState({
            setWebConfigClientStatus: true
        },() => {
            setWebsiteConfig(personnelObj,() => {
                this.setState({
                    isClientAnimateHide: true,
                    setWebConfigClientStatus: false
                });
            },(errMsg) => {
                //设置错误后的提示
                this.setState({
                    setWebConfigClientStatus: false
                });
                message.error(errMsg);
            });
        });

    };

    //点击 激活邮箱 按钮
    activeUserEmail = () => {
        if (!this.state.emailShowObj.email) {
            return;
        }
        //将邮箱中激活链接的url传过去，以便区分https://ketao.antfact.com还是https://csm.curtao.com
        let bodyObj = {activate_url: getEmailActiveUrl()};
        SalesHomeAction.activeUserEmail(bodyObj, (resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get('user.info.active.email', '激活邮件已发送至{email}', {'email': this.state.emailShowObj.email})
                );
            }
        });
    };

    handleCrmTeamListShow = (e) => {
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
        if(this.state.isSaleTeamShow === true){
            Trace.traceEvent(e, '隐藏团队列表');
        }else{
            Trace.traceEvent(e, '展示团队列表');
        }
        return e.stopPropagation();
    };

    //跳转到个人信息页面
    jumpToUserInfo = () => {
        history.push('/user-preference', {});
    };

    renderWillExpireUser = () => {
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
    };

    //获取触发器
    getEmitters = () => {
        return [
            {
                emitter: dateSelectorEmitter,
                event: dateSelectorEmitter.SELECT_DATE,
                callbackArgs: [{
                    name: 'starttime',
                }, {
                    name: 'endtime',
                }],
            },
            {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: 'team_ids',
                    exclusive: 'member_id'
                }, {
                    name: 'child_team_ids',
                }],
            },
            {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_MEMBER,
                callbackArgs: [{
                    name: 'member_id',
                    exclusive: 'team_ids'
                }],
            },
        ];
    };

    //获取图表条件
    getConditions = () => {
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
                name: 'child_team_ids',
                value: [],
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
    };

    //获取电话统计图表列表
    getPhoneAnalysisCharts = () => {
        return [{
            title: Intl.get('weekly.report.call.statics', '电话统计'),
            chartType: 'table',
            height: 'auto',
            layout: {
                sm: 24,
            },
            data: this.state.salesPhoneList,
            resultType: this.state.isLoadingPhoneList ? 'loading' : '',
            option: {
                columns: this.getPhoneListColumn(),
                util: {zoomInSortArea: true},
                onChange: this.onTableChange,
            },
            cardContainer: {
                props: {
                    subTitle: this.filterCallTypeSelect(),
                },
            },
        }, 
        //通话总次数TOP10
        callChart.getTotalNumberTop10Chart({
            layout: {sm: 24},
            height: 'auto'
        }),
        //通话总时长TOP10
        callChart.getTotalDurationTop10Chart({
            layout: {sm: 24},
            height: 'auto'
        }),
        ];
    };
    //获取激活邮箱的提示
    getEmailAlertTipMessage = () => {
        if(this.getIsShowAddEmail()){
            return (
                <span>
                    <ReactIntl.FormattedMessage
                        id="sales.add.email.info"
                        defaultMessage={'请到{userinfo}页面添加邮箱，否则将会无法收到客套向您发送的邮件。'}
                        values={{
                            'userinfo': <span className="jump-to-userinfo" onClick={this.jumpToUserInfo}>
                                {Intl.get('user.info.user.info','个人资料')}
                            </span>
                        }}
                    />
                </span>
            );
        }else{
            return(
                <span>
                    <span>
                        {Intl.get('sales.frontpage.active.info','请激活邮箱，以免影响收取审批邮件！')}
                    </span>
                    <Button type="primary" size="small" onClick={this.activeUserEmail}>{Intl.get('sales.frontpage.active.email','激活邮箱')}</Button>
                </span>
            );
        }
    };
    //获取添加坐席号的提示
    getClientAlertTipMessage = () => {
        return (
            <span>
                {commonDataUtil.showDisabledCallTip()}
            </span>
        );
    };
    getIsShowAddEmail = () => {
        return _.get(this.state,'emailShowObj.isShowAddEmail');
    };
    //是否展示邮箱激活或者添加邮箱的提示提示
    renderActiveOrEditAlert = () => {
        return (
            <AlertTip
                clsNames='email-active-wrap'
                alertTipMessage={this.getEmailAlertTipMessage()}
                showNoTipMore={!this.getIsShowAddEmail()}
                isAnimateShow={this.state.isAnimateShow}
                isAnimateHide={this.state.isAnimateHide}
                handleClickNoTip={this.hideActiveEmailTip}
                setWebConfigStatus={this.state.setWebConfigStatus}
            />
        );
    };
    // 是否展示设置坐席号的提示
    renderClientAlert = () => {
        if (_.get(this.state,'emailShowObj.isShowSetClient')){
            return <AlertTip
                alertTipMessage={this.getClientAlertTipMessage()}
                isAnimateShow={this.state.isClientAnimateShow}
                isAnimateHide={this.state.isClientAnimateHide}
                handleClickNoTip={this.hideSetClientTip}
                setWebConfigStatus={this.state.setWebConfigClientStatus}
            />;
        }else{
            return null;
        }
    };
    //试用新版
    tryNewPage = () => {
        if (event) {
            Trace.traceEvent(event, '试用新版');
        }
        this.props.history && this.props.history.push('/home');
    };

    render() {
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
        var showAddOrActiveEmailPrivilege = this.state.emailShowObj.isShowActiveEmail || this.state.emailShowObj.isShowAddEmail;
        return (<RightContent>
            <div className="sales_home_content" data-tracename="销售首页">
                <TopNav>
                    <div className="date-range-wrap btn-item">
                        <DatePicker
                            disableDateAfterToday={true}
                            range={this.state.timeType}
                            onSelect={this.onSelectDate}
                            selectedTimeFormat='int'
                        >
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
                    <InviteMember />
                </TopNav>
                {this.state.salesTeamListObj.resultType === 'loading' ?
                    <div className="spinner-container">
                        <Spinner/>
                    </div>
                    : <div className="crm-home-container">
                        <div className={crmDataZone}>
                            {showAddOrActiveEmailPrivilege ? this.renderActiveOrEditAlert() : this.renderClientAlert()}
                            <StatisticTotal
                                customerTotalObj={this.state.customerTotalObj}
                                userTotalObj={this.state.userTotalObj}
                                phoneTotalObj={this.state.phoneTotalObj}
                                callBackRecord={this.state.callBackRecord}
                                activeView={this.state.activeView}
                            />
                            {/*即将过期的用户列表*/}
                            {hasPrivilege(commonSalesHomePrivilegeConst.GET_USER_STATISTIC_VIEW) ? (
                                <div className="will-expire-user-container">
                                    {this.renderWillExpireUser()}
                                </div>
                            ) : null}
                            <div className="statistic-data-analysis">
                                {this.renderAnalysisView()}
                            </div>
                        </div>
                        {/*除了销售之外*/}
                        {!(this.state.currShowType === showTypeConstant.SALESMAN && !this.state.currShowSalesman) ? (
                            <div className={crmSaleList}>
                                <CrmRightList
                                    currShowType={this.state.currShowType}
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
                                    pendingApproveMemberObj={this.state.pendingApproveMemberObj}
                                    isGetMemberApplyList={this.state.isGetMemberApplyList}
                                />
                            </div>
                        ) : null}
                    </div>}
                <div onClick={this.tryNewPage} className='try-new-btn'>{Intl.get('home.page.try.new', '试用新版')}</div>
            </div>
            <CustomerListPanel/>
            <UserListPanel location='home'/>
        </RightContent>);
    }
}
SalesHomePage.propTypes = {
    history: PropTypes.obj
};
module.exports = SalesHomePage;

