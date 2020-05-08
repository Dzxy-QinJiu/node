var React = require('react');
var RightContent = require('CMP_DIR/privilege/right-content');
require('./css/index.less');
var SalesHomeStore = require('./store/sales-home-store');
var SalesHomeAction = require('./action/sales-home-actions');
import {AntcAnalysis} from 'antc';
import {contractChart} from 'ant-chart-collection';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
let TimeUtil = require('PUB_DIR/sources/utils/time-format-util');
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
var classNames = require('classnames');
import CustomerRepeat from 'MOD_DIR/crm/public/views/customer-repeat';
import {ALL_LISTS_TYPE, ALL_CUSTOMER_LISTS_TYPE, CALL_TYPE_OPTION} from 'PUB_DIR/sources/utils/consts';
import Trace from 'LIB_DIR/trace';
import ScheduleItem from './view/schedule-item';
import CustomerNoticeMessage from './view/customer-notice-message';
import WillExpireItem from './view/will-expire-item';
import NewDistributeCustomer from './view/new-distribute-customer';
import {phoneMsgEmitter, userDetailEmitter,notificationEmitter} from 'PUB_DIR/sources/utils/emitters';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {RightPanel} from 'CMP_DIR/rightPanel';
import {getRelativeTime, getEmailActiveUrl} from 'PUB_DIR/sources/utils/common-method-util';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import Spinner from 'CMP_DIR/spinner';
import SalesClueItem from './view/sales-clue-item';
import {clueStartTime} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils.js';
const LAYOUT_CONSTS = {
    PADDDING_TOP_AND_BOTTOM: 97,
};
var websiteConfig = require('../../../lib/utils/websiteConfig');
var setWebsiteConfig = websiteConfig.setWebsiteConfig;
import AlertTip from 'CMP_DIR/alert-tip';
import eefungCustomerManagerHoc from 'CMP_DIR/eefung-customer-manager-hoc';
import {message, Button} from 'antd';
const DELAY_TIME = 2000;
//即将到期合同合同统计
const EXPIRING_CONTRACT_STATISTICS = 'expiring_contract_statistics';
import publicPrivilegeConst from 'PUB_DIR/privilege-const';

class SalesHomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showCustomerPanel: ALL_LISTS_TYPE.SCHEDULE_TODAY,//默认激活的面板
            isShowRepeatCustomer: false,//是否展示重复客户
            curShowCustomerId: '',//展示客户详情的客户id
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            isAnimateShow: false,//是否动态由上到下推出 激活邮箱提示框
            isAnimateHide: false,//是否动态隐藏 提示框
            isClientAnimateShow: false,//是否动态由上到下推出 设置坐席号提示框
            isClientAnimateHide: false,//是否动态隐藏 提示框
            addListener: false, //是否监听了坐席号配置完成的方法
            ...SalesHomeStore.getState()
        };
    }

    componentDidMount() {
        SalesHomeStore.listen(this.onChange);
        this.getSalesListData();
        //绑定window的resize，进行缩放处理
        $(window).on('resize', this.windowResize);
        //给点击查看客户详情的客户加样式
        //之所以用jquery不用类名加样式，是因为客户会有重复的，通过customerId无法进行判断
        $('.sales_home_content').on('click', '.sale-home-customer-name', function(e) {
            $('.selected-customer-detail-item').removeClass('selected-customer-detail-item');
            $(this).closest('.customer-detail-item').addClass('selected-customer-detail-item');
        });
        //外层父组件加载完成后，再由上到下推出激活邮箱提示框
        setTimeout(() => {
            this.setState({
                isClientAnimateShow: true,
                isAnimateShow: true
            });
        }, DELAY_TIME);
        this.getPhoneInitialed();
        const today = moment();
        SalesHomeAction.getContractExpireRemind({
            starttime: today.valueOf(),
            endtime: today.add(3, 'months').valueOf()
        });
    }

    //缩放延时，避免页面卡顿
    resizeTimeout = null;

    //窗口缩放时候的处理函数
    windowResize = () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            //窗口缩放的时候，调用setState，重新走render逻辑渲染
            this.setState(SalesHomeStore.getState());
        });
    };
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

    componentWillUnmount() {
        $(window).off('resize', this.windowResize);
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
    onChange = () => {
        this.setState(SalesHomeStore.getState());
    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    closeRightCustomerPanel = () => {
        $('.selected-customer-detail-item').removeClass('selected-customer-detail-item');
        this.setState({curShowCustomerId: ''});
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };
    openCustomerOrClueDetail = (schedule) => {
        var showCustomerModal = _.get($('#customer-phone-status-content'),'length',0) > 0;
        var showClueModal = _.get($('#clue_phone_panel_wrap'),'length',0) > 0;
        if (schedule.lead_id){
            //关闭客户详情
            if (showCustomerModal){
                phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_PHONE_PANEL);
            }
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
                clue_params: {
                    currentId: schedule.lead_id,
                    hideRightPanel: this.closeRightCustomerPanel
                }
            });
        }else if (schedule.customer_id){
            //关闭线索详情
            if (showClueModal){
                phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_CLUE_PANEL);
            }
            this.openCustomerDetail(schedule.customer_id);
        }

    };
    openCustomerDetail = (customer_id) => {
        this.setState({curShowCustomerId: customer_id});
        //触发关闭用户详情面板
        userDetailEmitter.emit(userDetailEmitter.CLOSE_USER_DETAIL);
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id,
                curCustomer: this.state.curCustomer,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel.bind(this),
                hideRightPanel: this.closeRightCustomerPanel,
            }
        });
    };

    openUserDetail = (user_id) => {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: user_id});

    };

    getSalesListData = () => {
        let queryParams = this.getQueryParams();
        let dataType = this.getDataType();
        queryParams.dataType = dataType;
        SalesHomeAction.getCustomerTotal(queryParams);
        //电话统计取今天的开始和结束时间
        let phoneParams = this.getPhoneParams();
        SalesHomeAction.getPhoneTotal(phoneParams);
        //获取今日联系的客户
        SalesHomeAction.getTodayContactCustomer(this.getTodayCrmRangParams(), this.state.page_size, this.state.sorter);
        //获取今日的日程列表
        this.getScheduleListToday();
        //获取今日过期的日程列表
        this.getExpiredScheduleList();
        //获取最近登录的客户
        this.getRecentLoginCustomers();
        //关注客户登录
        this.getConcernedLogin();
        //停用客户登录
        this.getAppIlleageLogin();
        //登录失败
        this.getLoginFailedNotices();
        //获取重复客户列表
        this.getRepeatCustomerList();
        //获取呼入未接的电话
        this.getMissCallTypeList();
        //获取十天内即将到期的试用用户
        var todayTimeRange = this.getTodayStartAndEndTime();
        SalesHomeAction.getExpireCustomer({
            tags: Intl.get('common.trial.user', '试用用户'),
            start_time: todayTimeRange.start_time,
            end_time: todayTimeRange.end_time + 9 * oplateConsts.ONE_DAY_TIME_RANGE,
            dataType: ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER
        });
        //获取半年内即将到期的签约用户 30*6是取的半年的数据
        SalesHomeAction.getExpireCustomer(
            {
                tags: Intl.get('common.trial.official', '正式用户'),
                start_time: todayTimeRange.start_time,
                end_time: todayTimeRange.end_time + 30 * 6 * oplateConsts.ONE_DAY_TIME_RANGE,
                dataType: ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER
            }
        );
        //获取过去十天内过期未处理试用客户
        SalesHomeAction.getExpireCustomer({
            tags: Intl.get('common.trial.user', '试用用户'),
            start_time: todayTimeRange.start_time - 10 * oplateConsts.ONE_DAY_TIME_RANGE,
            end_time: todayTimeRange.end_time - oplateConsts.ONE_DAY_TIME_RANGE,
            dataType: ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER
        });
        //获取新分配的客户
        this.getNewDistributeCustomer();
        //获取销售线索列表
        this.getSalesClueLists();
    };

    //获取销售线索列表
    getSalesClueLists = (lastId) => {
        var constObj = {
            salesClueTypeFilter: this.state.salesClueTypeFilter,
            rangParamsSalesClue: this.getCrmSalesClue(),
            page_size: this.state.page_size,
            sorterSalesClue: this.state.sorterSalesClue,
        };
        if (lastId){
            constObj.id = lastId;
        }
        SalesHomeAction.getClueCustomerList(constObj,['customer_id']);
    };

    //获取呼入未接通的电话
    getMissCallTypeList = (lastId) => {
        var constObj = {
            page_size: this.state.page_size,
            start_time: clueStartTime,//开始时间传2010年开始,
            //把今天0点作为判断是否过期的时间点
            end_time: this.getTodayStartAndEndTime().start_time,//今日早上的零点作为结束时间
            status: false,//日程的状态，未完成的日程
            type: 'missed_call'
        };
        if (lastId) {
            constObj.id = lastId;
        }
        SalesHomeAction.getScheduleList(constObj, 'missed_call');
    };

    //获取最近登录的客户
    getRecentLoginCustomers = () => {
        //获取最近登录的客户
        //默认获取近7天登录的客户
        SalesHomeAction.getRecentLoginCustomers({}, this.getTodayCrmLoginRangParams(), this.state.page_size, _.get(this.state,'recentLoginCustomerObj.curPage', 1), this.state.sorterLogin);
    };

    //重复客户列表
    getRepeatCustomerList = (lastId) => {
        var queryObj = {page_size: this.state.page_size};
        if (lastId) {
            queryObj.id = lastId;
        }
        //获取重复客户列表
        SalesHomeAction.getRepeatCustomerList(queryObj);
    };
    //新分配未联系的客户
    getCrmDistributeRangParams = () => {
        return [{
            from: 0,
            to: moment().valueOf(),
            type: 'time',
            name: 'allot_time'
        }];
    };
    //获取销售线索
    getCrmSalesClue = () => {
        return [{//时间范围参数
            from: 0,
            to: moment().valueOf(),
            type: 'time',
            name: 'source_time'
        }];
    };
    //获取新分配但未联系的客户
    getNewDistributeCustomer = () => {
        //客户被分配后是否已联系 allot_no_contact  未联系 : "0" ，已联系 :"1"
        //获取新分配的客户
        SalesHomeAction.getNewDistributeCustomer({allot_no_contact: '0'}, this.getCrmDistributeRangParams(), this.state.page_size, _.get(this.state, 'newDistributeCustomer.curPage', 1), this.state.sorterDistribute);
    };
    getTodayStartAndEndTime = () => {
        return {
            start_time: TimeStampUtil.getTodayTimeStamp().start_time,
            end_time: TimeStampUtil.getTodayTimeStamp().end_time
        };
    };
    getTodayCrmRangParams = () => {
        var todayTimeObj = this.getTodayStartAndEndTime();
        return [{//默认展示今天的数据
            from: todayTimeObj.start_time,
            to: todayTimeObj.end_time,
            type: 'time',
            name: 'last_contact_time'
        }];
    };
    //最近7天登录的客户
    getTodayCrmLoginRangParams = () => {
        var todayTimeObj = this.getTodayStartAndEndTime();
        return [{//默认展示今天的数据
            from: todayTimeObj.start_time - 7 * oplateConsts.ONE_DAY_TIME_RANGE,
            to: todayTimeObj.end_time,
            type: 'time',
            name: 'last_login_time'
        }];

    };

    //获取今日的日程列表
    getScheduleListToday = () => {
        var todayTimeObj = this.getTodayStartAndEndTime();
        var constObj = {
            page_size: 1000,//今天的日程要对取到的数据进行处理，所以不用下拉加载的方式
            status: false,//获取未处理的日程
            start_time: todayTimeObj.start_time,
            end_time: todayTimeObj.end_time,
        };
        SalesHomeAction.getScheduleList(constObj, 'today');
    };

    //停用客户登录
    getAppIlleageLogin = (lastId) => {
        let noticeQueryObj = {
            notice_type: ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN,
            page_size: this.state.page_size,//默认不传是5
        };
        if (lastId) {
            noticeQueryObj.id = lastId;
        }
        //停用客户登录等消息列表
        SalesHomeAction.getSystemNotices(noticeQueryObj, this.state.status, noticeQueryObj.notice_type);
    };

    //获取登录失败的通知
    getLoginFailedNotices = (lastId) => {
        let noticeQueryObj = {
            notice_type: ALL_LISTS_TYPE.LOGIN_FAILED,
            page_size: this.state.page_size,//默认不传是5
        };
        if (lastId) {
            noticeQueryObj.id = lastId;
        }
        //获取登录失败的通知
        SalesHomeAction.getSystemNotices(noticeQueryObj, this.state.status, noticeQueryObj.notice_type);
    };

    //关注客户登录
    getConcernedLogin = (lastId) => {
        let noticeQueryObj = {
            notice_type: ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN,
            page_size: this.state.page_size,//默认不传是5
        };
        if (lastId) {
            noticeQueryObj.id = lastId;
        }
        //获取关注客户登录
        SalesHomeAction.getSystemNotices(noticeQueryObj, this.state.status, noticeQueryObj.notice_type);
    };

    //获取过期日程列表(不包含今天)
    getExpiredScheduleList = (lastId) => {
        var constObj = {
            page_size: this.state.page_size,
            start_time: clueStartTime,//开始时间2010年开始
            //把今天0点作为判断是否过期的时间点
            end_time: this.getTodayStartAndEndTime().start_time,//今日早上的零点作为结束时间
            status: false//日程的状态，未完成的日程
        };
        if (lastId) {
            constObj.id = lastId;
        }
        SalesHomeAction.getScheduleList(constObj, 'expired');
    };

    //获取查询参数
    getQueryParams = () => {
        var todayTimeObj = this.getTodayStartAndEndTime();
        let queryParams = {
            urltype: 'v2',
            starttime: todayTimeObj.start_time,
            endtime: todayTimeObj.end_time
        };
        return queryParams;
    };

    getPhoneParams = () => {
        var todayTimeObj = this.getTodayStartAndEndTime();
        let phoneParams = {
            start_time: todayTimeObj.start_time || 0,
            end_time: todayTimeObj.end_time || moment().toDate().getTime(),
            device_type: this.state.callType || CALL_TYPE_OPTION.ALL
        };
        return phoneParams;
    };

    getDataType = () => {
        if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)) {
            return 'all';
        } else if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS)) {
            return 'self';
        } else {
            return '';
        }
    };

    handleScrollBarBottom = (listType) => {
        switch (listType) {
            case ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY://今日超期的日程
                this.getScrollData(this.state.scheduleExpiredTodayObj, this.getExpiredScheduleList);
                break;
            case ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN://停用客户登录
                this.getScrollData(this.state.appIllegalObj, this.getAppIlleageLogin);
                break;
            case ALL_LISTS_TYPE.LOGIN_FAILED://登录失败的客户
                this.getScrollData(this.state.loginFailedObj, this.getLoginFailedNotices);
                break;
            case ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN://关注客户登录
                this.getScrollData(this.state.concernCustomerObj, this.getConcernedLogin);
                break;
            case ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER://最近7天登录的客户
                this.getScrollData(this.state.recentLoginCustomerObj, this.getRecentLoginCustomers);
                break;
            case ALL_LISTS_TYPE.NEW_DISTRIBUTE_CUSTOMER://新分配的客户
                this.getScrollData(this.state.newDistributeCustomer, this.getNewDistributeCustomer);
                break;
            case ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE://呼入未接通的电话
                this.getScrollData(this.state.missCallObj, this.getMissCallTypeList);
                break;
            case ALL_LISTS_TYPE.SALES_CLUE://销售线索
                this.getScrollData(this.state.salesClueObj, this.getSalesClueLists);
                break;
        }
    };

    getScrollData = (curDataObj, getDataFunction) => {
        var length = curDataObj.data.list.length;
        if (length < curDataObj.data.total) {
            var lastId = curDataObj.data.list[length - 1].id;
            getDataFunction(lastId);
        } else if (length === curDataObj.data.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    };

    //渲染左侧列表
    renderDiffCustomerPanel = () => {
        const contractExpireRemindClassName = classNames('customer-item', {
            'selected-customer-item': this.state.showCustomerPanel === EXPIRING_CONTRACT_STATISTICS
        });

        return (
            <ul>
                {_.map(ALL_CUSTOMER_LISTS_TYPE, (item) => {
                    var cls = classNames('customer-item', {
                        'selected-customer-item': item.value === this.state.showCustomerPanel
                    });
                    //新分配客户，重复客户，您有电话未接听 数量为0 时，不展示左侧标题
                    if (item.value === ALL_LISTS_TYPE.NEW_DISTRIBUTE_CUSTOMER && this.state.newDistributeCustomer.data.list.length === 0) {
                        return;
                    }
                    if (item.value === ALL_LISTS_TYPE.REPEAT_CUSTOMER && this.state.repeatCustomerObj.data.list.length === 0) {
                        return;
                    }
                    if (item.value === ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE && this.state.missCallObj.data.list.length === 0) {
                        return;
                    }
                    return (
                        <li className={cls} onClick={this.handleClickDiffCustomerType.bind(this, item.value)}>
                            <div>
                                <span>{item.name}</span>
                                <span className="data-total">{this.switchDiffCustomerTotalCount(item.value)}</span>
                            </div>
                        </li>
                    );
                })}
                <li className={contractExpireRemindClassName} onClick={this.handleClickDiffCustomerType.bind(this, EXPIRING_CONTRACT_STATISTICS)}>
                    <div>
                        <span>{Intl.get('contract.expire.in.next.three.months', '近三个月到期合同')}</span>
                        <span className="data-total">{this.state.contractExpireRemind.total.toString()}</span>
                    </div>
                </li>
            </ul>
        );
    };

    //渲染右侧客户详情
    renderCustomerContent = () => {
        var rightPanel = null;
        switch (this.state.showCustomerPanel) {
        //今日日程列表
            case ALL_LISTS_TYPE.SCHEDULE_TODAY:
                rightPanel = this.renderScheduleContent(ALL_LISTS_TYPE.SCHEDULE_TODAY);
                break;
            //今日过期日程
            case ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY:
                rightPanel = this.renderScheduleContent(ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY);
                break;
            //即将过期的试用客户
            case ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER:
                rightPanel = this.renderWillExpiredTryAndAssignedCustomer(ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER);
                break;
            case ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER:
                rightPanel = this.renderWillExpiredTryAndAssignedCustomer(ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER);
                break;
            //即将过期的签约客户
            case ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER:
                rightPanel = this.renderWillExpiredTryAndAssignedCustomer(ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER);
                break;
            //停用客户登录
            case ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN:
                rightPanel = this.renderAPPIlleageAndConcernedAndRecentContent(ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN);
                break;
            //登录失败的客户
            case ALL_LISTS_TYPE.LOGIN_FAILED:
                rightPanel = this.renderAPPIlleageAndConcernedAndRecentContent(ALL_LISTS_TYPE.LOGIN_FAILED);
                break;
            //关注客户登录
            case ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN:
                rightPanel = this.renderAPPIlleageAndConcernedAndRecentContent(ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN);
                break;
            //最近X日登录的客户
            case ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER:
                rightPanel = this.renderAPPIlleageAndConcernedAndRecentContent(ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER);
                break;
            //重复客户
            case ALL_LISTS_TYPE.REPEAT_CUSTOMER:
                rightPanel = <CustomerRepeat
                    noNeedClose={true}
                    setInitialRepeatList ={true}
                    initialRepeatObj={this.state.repeatCustomerObj.errMsg || this.state.repeatCustomerObj.data}
                />;
                break;
            //新分配的客户
            case ALL_LISTS_TYPE.NEW_DISTRIBUTE_CUSTOMER:
                rightPanel = this.renderNewDistributeCustomer();
                break;
            case ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE:
                rightPanel = this.renderScheduleContent(ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE);
                break;
            case ALL_LISTS_TYPE.SALES_CLUE:
                rightPanel = this.renderSalesClue();
                break;
            case EXPIRING_CONTRACT_STATISTICS:
                rightPanel = this.renderContractExpireRemind();
                break;
        }
        return rightPanel;
    };

    //渲染近三个月到期合同统计
    renderContractExpireRemind() {
        let chart = contractChart.getContractExpireRemindChart({
            title: Intl.get('contract.expire.in.next.three.months', '近三个月到期合同')
        });
        chart.data = this.state.contractExpireRemind.data;
        chart.resultType = '';

        //表格列
        const columns = _.get(chart, 'option.columns');
        //负责人列索引
        const userNameColumnIndex = _.findIndex(columns, column => column.dataIndex === 'user_name');

        //对于普通销售来说，因为显示的是他自己的数据，所以不需要显示负责人列
        if (userNameColumnIndex !== -1) {
            columns.splice(userNameColumnIndex, 1);
        }

        const charts = [chart];

        return (
            <AntcAnalysis
                charts={charts}
                isUseScrollBar={true}
            />
        );
    }

    //新分配的客户
    renderNewDistributeCustomer = () => {
        var data = this.state.newDistributeCustomer.data.list;
        return (
            <div className="new-distribute-customer-container" ref="tableWrap">
                {this.renderLoadingAndErrAndNodataContent(this.state.newDistributeCustomer)}
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.NEW_DISTRIBUTE_CUSTOMER)}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    {_.map(data, (item) => {
                        return (
                            <NewDistributeCustomer
                                newDistributeCustomer={item}
                                openCustomerDetail={this.openCustomerDetail}
                            />

                        );
                    })}
                </GeminiScrollbar>

            </div>
        );
    };

    //点击左侧不同客户类别的标题
    handleClickDiffCustomerType = (customerType) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.customer-item'), '打开' + customerType + '类型客户面板');
        GeminiScrollbar.scrollTo(this.refs.tableWrap, 0);
        this.setState({
            listenScrollBottom: true,
            showCustomerPanel: customerType,
        });
    };

    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent = (dataObj) => {
        //加载中的样式
        if (dataObj.loading && dataObj.curPage === 1) {
            return (
                <div className="load-content">
                    <Spinner />
                    <p className="abnornal-status-tip">{Intl.get('common.sales.frontpage.loading', '加载中')}</p>
                </div>
            );
        } else if (dataObj.errMsg) {
            //加载完出错的样式
            return (
                <div className="err-content">
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{dataObj.errMsg}</p>
                </div>
            );
        } else if (!dataObj.loading && !dataObj.errMsg && !dataObj.data.list.length) {
            //数据为空的样式
            return (
                <div className="no-data">
                    <i className="iconfont icon-no-data"></i>
                    <p className="abnornal-status-tip">{Intl.get('common.sales.data.no.data', '暂无此类信息')}</p>
                </div>
            );
        } else {
            return null;
        }
    };

    //渲染日程列表
    renderScheduleContent = (scheduleType) => {
        var data = [];
        //今天的日程
        if (scheduleType === ALL_LISTS_TYPE.SCHEDULE_TODAY) {
            data = this.state.scheduleTodayObj.data.list;
            //不是全天日程
            var notFulldaylist = _.filter(data, (item) => {
                return !item.allDay;
            });
            //全天的日程
            var Fulldaylist = _.filter(data, (item) => {
                return item.allDay;
            });
            return (
                <div className="schedule-day-list" data-tracename="今日日程列表" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.scheduleTodayObj)}
                    <GeminiScrollbar>
                        {notFulldaylist.length ? <div
                            className="schedule-list-tip">{Intl.get('sales.frontpage.set.time', '定时')}</div> : null}
                        {_.map(notFulldaylist, (item) => {
                            return (
                                <ScheduleItem
                                    scheduleItemDetail={item}
                                    scheduleType={ALL_LISTS_TYPE.SCHEDULE_TODAY}
                                    isShowTopTitle={false}
                                    isShowScheduleTimerange={true}
                                    openCustomerOrClueDetail={this.openCustomerOrClueDetail}
                                />
                            );
                        })
                        }
                        {Fulldaylist.length ?
                            <div className="schedule-list-tip">{Intl.get('crm.alert.full.day', '全天')}</div> : null}
                        {_.map(Fulldaylist, (item) => {
                            return (
                                <ScheduleItem
                                    scheduleItemDetail={item}
                                    isShowTopTitle={false}
                                    scheduleType={ALL_LISTS_TYPE.SCHEDULE_TODAY}
                                    isShowScheduleTimerange={false}
                                    openCustomerOrClueDetail={this.openCustomerOrClueDetail}
                                />
                            );
                        })
                        }
                    </GeminiScrollbar>
                </div>
            );
        } else if (scheduleType === ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY) {
            //今日超期未联系
            data = this.state.scheduleExpiredTodayObj.data.list;
            return (
                <div className="today-expired-schedule" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.scheduleExpiredTodayObj)}
                    <GeminiScrollbar
                        handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY)}
                        listenScrollBottom={this.state.listenScrollBottom}>
                        {_.map(data, (item) => {
                            return (
                                <ScheduleItem
                                    scheduleType={ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY}
                                    scheduleItemDetail={item}
                                    isShowTopTitle={true}
                                    isShowScheduleTimerange={false}
                                    openCustomerOrClueDetail={this.openCustomerOrClueDetail}
                                />
                            );
                        })}
                    </GeminiScrollbar>
                </div>
            );
        }else if (scheduleType === ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE){
            //呼入未接通电话
            var data = this.state.missCallObj.data.list;
            return (
                <div className="today-expired-schedule" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.missCallObj)}
                    <GeminiScrollbar
                        handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE)}
                        listenScrollBottom={this.state.listenScrollBottom}>
                        {_.map(data, (item) => {
                            return (
                                <ScheduleItem
                                    scheduleType={ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE}
                                    scheduleItemDetail={item}
                                    isShowTopTitle={false}
                                    isShowScheduleTimerange={false}
                                    openCustomerOrClueDetail={this.openCustomerOrClueDetail}
                                />
                            );
                        })}
                    </GeminiScrollbar>
                </div>
            );


        }
    };

    //渲染销售线索
    renderSalesClue = () => {
        var data = _.get(this.state.salesClueObj,'data.list',[]);
        return (
            <div className="sales-clue-container" data-tracename="销售线索">
                {this.renderLoadingAndErrAndNodataContent(this.state.salesClueObj)}
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBarBottom.bind(this, ALL_LISTS_TYPE.SALES_CLUE)}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    {_.map(data, (item) => {
                        return (
                            <SalesClueItem
                                salesClueItemDetail= {item}
                                showFrontPageTip={true}
                                afterRemarkClue={SalesHomeAction.afterRemarkClue}
                                removeClueItem={this.removeClueItem}
                            />
                        );
                    })}
                </GeminiScrollbar>
            </div>
        );
    };
    removeClueItem = (removeItem) => {
        SalesHomeAction.removeClueItem(removeItem);
    };

    afterHandleMessage = (messageObj) => {
        SalesHomeAction.afterHandleMessage(messageObj);
    };

    renderExpiredCustomerContent = (data) => {
        return (
            <GeminiScrollbar>
                {_.map(data, (item, index) => {
                    if (_.isArray(item.customer_list) && item.customer_list.length) {
                        return (
                            <div className="expire-customer-item">
                                <div>
                                    {_.map(item.customer_list, (willExpiredCustomer) => {
                                        return (
                                            <WillExpireItem
                                                expireItem={willExpiredCustomer}
                                                openCustomerDetail={this.openCustomerDetail}
                                                willExpiredTime={getRelativeTime(item.date)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </GeminiScrollbar>
        );

    };

    //渲染即将到期的试用客户和签约客户
    renderWillExpiredTryAndAssignedCustomer = (type) => {
        var data = [];
        if (type === ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER) {
            //十天内即将到期的试用客户
            data = this.state.willExpiredTryCustomer.data.list;
            return (
                <div className="will-expire-assigned-customer-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.willExpiredTryCustomer)}
                    {this.renderExpiredCustomerContent(data)}
                </div>
            );
        } else if (type === ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER) {
            //半年内即将到期的签约客户
            data = this.state.willExpiredAssignCustomer.data.list;
            return (
                <div className="will-expire-try-customer-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.willExpiredAssignCustomer)}
                    {this.renderExpiredCustomerContent(data)}
                </div>
            );
        } else if (type === ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER) {
            //近10天过期未处理试用客户
            data = this.state.hasExpiredTryCustomer.data.list;
            return (
                <div className="has-expired-try-customer-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.hasExpiredTryCustomer)}
                    {this.renderExpiredCustomerContent(data)}
                </div>
            );
        }

    };

    //渲染关注客户，停用后登录和最近登录
    renderFocusAndIlleagalAndRecentContent = (type, data, isRecentLoginCustomer) => {
        return (
            <GeminiScrollbar
                handleScrollBottom={this.handleScrollBarBottom.bind(this, type)}
                listenScrollBottom={this.state.listenScrollBottom}>
                {_.map(data, (item) => {
                    return (
                        <CustomerNoticeMessage
                            noticeType={type}
                            customerNoticeMessage={item}
                            openCustomerDetail={this.openCustomerDetail}
                            openUserDetail={this.openUserDetail}
                            afterHandleMessage={this.afterHandleMessage}
                            isRecentLoginCustomer={isRecentLoginCustomer}
                        />
                    );
                })}
            </GeminiScrollbar>
        );
    };

    //渲染关注客户，停用客户和最近登录的客户情况
    renderAPPIlleageAndConcernedAndRecentContent = (type) => {
        var data = [];
        if (type === ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN) {
            //关注客户登录
            data = this.state.concernCustomerObj.data.list;
            return (
                <div className="concerned-customer-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.concernCustomerObj)}
                    {this.renderFocusAndIlleagalAndRecentContent(ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN, data, false)}
                </div>
            );
        } else if (type === ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN) {
            //停用后登录
            data = this.state.appIllegalObj.data.list;
            return (
                <div className="app-illeage-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.appIllegalObj)}
                    {this.renderFocusAndIlleagalAndRecentContent(ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN, data, false)}
                </div>
            );
        }else if (type === ALL_LISTS_TYPE.LOGIN_FAILED) {
            //登录失败
            data = this.state.loginFailedObj.data.list;
            return (
                <div className="app-illeage-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.loginFailedObj)}
                    {this.renderFocusAndIlleagalAndRecentContent(ALL_LISTS_TYPE.LOGIN_FAILED, data, false)}
                </div>
            );
        } else if (type === ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER) {
            //最近X日登录的客户
            data = this.state.recentLoginCustomerObj.data.list;
            return (
                <div className="recent-login-customer-container" ref="tableWrap">
                    {this.renderLoadingAndErrAndNodataContent(this.state.recentLoginCustomerObj)}
                    {this.renderFocusAndIlleagalAndRecentContent(ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER, data, true)}
                </div>
            );
        }
    };

    //不同类型的客户所对应的数据
    switchDiffCustomerTotalCount = (type) => {
        var total = '';
        switch (type) {
            case ALL_LISTS_TYPE.SCHEDULE_TODAY:
                total = _.get(this.state.scheduleTodayObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY:
                total = _.get(this.state.scheduleExpiredTodayObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER:
                total = _.get(this.state.hasExpiredTryCustomer,'data.total','');
                break;
            case ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER:
                total = _.get(this.state.willExpiredAssignCustomer,'data.total','');
                break;
            case ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN:
                total = _.get(this.state.appIllegalObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.LOGIN_FAILED:
                total = _.get(this.state.loginFailedObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN:
                total = _.get(this.state.concernCustomerObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER:
                total = _.get(this.state.recentLoginCustomerObj, 'data.total', '');
                break;
            case ALL_LISTS_TYPE.REPEAT_CUSTOMER:
                total = _.get(this.state.repeatCustomerObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.NEW_DISTRIBUTE_CUSTOMER:
                total = _.get(this.state.newDistributeCustomer,'data.total','');
                break;
            case ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE:
                total = _.get(this.state.missCallObj,'data.total','');
                break;
            case ALL_LISTS_TYPE.SALES_CLUE:
                total = _.get(this.state.salesClueObj,'data.total','');
                break;
        }
        return total;
    };
    //获取添加坐席号的提示
    getClientAlertTipMessage = () => {
        return (
            <span>
                {commonDataUtil.showDisabledCallTip()}
            </span>
        );
    };
    hideSetClientTip = () => {
        let personnelObj = {};
        personnelObj[oplateConsts.STORE_PERSONNAL_SETTING.SETTING_CLIENT_NOTICE_IGNORE] = 'yes';
        this.setState({
            setWebConfigClientStatus: true
        });
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
                });
            }
        });
    };
    getIsShowAddEmail = () => {
        return _.get(this.state,'emailShowObj.isShowAddEmail');
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
    renderCalloutAlert = () => {
        {/*是否展示设置坐席号的提示*/}
        if (_.get(this.state,'emailShowObj.isShowSetClient')){
            return <AlertTip
                isAnimateShow={this.state.isClientAnimateShow}
                isAnimateHide={this.state.isClientAnimateHide}
                alertTipMessage={this.getClientAlertTipMessage()}
                handleClickNoTip={this.hideSetClientTip}
                setWebConfigStatus={this.state.setWebConfigClientStatus}
            />;
        }else{
            return null;
        }
    };
    renderAddOrActiveEmailAlert = () => {
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
    //试用新版
    tryNewPage = () => {
        if (event) {
            Trace.traceEvent(event, '试用新版');
        }
        this.props.history && this.props.history.push('/home');
    };
    render() {
        var phoneData = this.state.phoneTotalObj.data;
        const rightContentHeight = $(window).height() - LAYOUT_CONSTS.PADDDING_TOP_AND_BOTTOM;
        var cls = classNames('customer-content-right', {
            'has-repeat-customer': this.state.showCustomerPanel === ALL_LISTS_TYPE.REPEAT_CUSTOMER
        });
        let customerOfCurUser = this.state.customerOfCurUser;
        var addOrActiveEmailPrivelege = this.state.emailShowObj.isShowActiveEmail || this.state.emailShowObj.isShowAddEmail;
        return (
            <RightContent>
                <div className="sales_home_content" data-tracename="销售首页">
                    <div className="top_nav_content" data-tracename="顶部区域">
                        <ul>
                            <li>
                                <div className="statistic-total-content">
                                    <div className="content-right">
                                        <span>
                                            {Intl.get('sales.frontpage.connected.range', '今日通话时长')}
                                        </span>
                                        <span className="data-container">
                                            <span className="phone-total-time phone-total-data">
                                                {TimeUtil.getFormatTime(phoneData.totalTime || 0)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </li>
                            {/*对蚁坊组织下的客户经理隐藏今日接通电话统计*/}
                            {this.props.isEefungCustomerManager ? null : (
                                <li>
                                    <div className="statistic-total-content">
                                        <div className="content-right">
                                            <span>
                                                {Intl.get('sales.frontpage.connected.today', '今日接通电话')}
                                            </span>
                                            <span className="data-container">
                                                <span className="phone-total-count total-data-style">
                                                    {phoneData.totalCount}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )}
                            <li>
                                <div className="statistic-total-content">
                                    <div className="content-right">
                                        <span>{Intl.get('sales.frontpage.contact.today', '今日已跟进客户')}</span>
                                        <span className="data-container">
                                            <span>
                                                {this.state.customerContactTodayObj.data.total}
                                            </span>
                                        </span>
                                    </div>

                                </div>
                            </li>
                            <li>
                                <div className="statistic-total-content">
                                    <div className="content-right">
                                        <span>{Intl.get('sales.frontpage.added.today', '今日新增客户')}</span>
                                        <span className="data-container">
                                            <span>
                                                {this.state.customerTotalObj.data.added}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="main-content-container" style={{height: rightContentHeight}}>
                        {/*是否展示邮箱激活或者添加邮箱的提示提示*/}
                        {addOrActiveEmailPrivelege ? this.renderAddOrActiveEmailAlert() : this.renderCalloutAlert()}
                        <div className="customer-list-left" data-tracename="左侧分类tab">
                            {this.renderDiffCustomerPanel()}
                        </div>
                        <div className={cls} data-tracename="右侧详情列表">
                            {this.renderCustomerContent()}
                        </div>
                    </div>
                    {/*该客户下的用户列表*/}
                    <RightPanel
                        className="customer-user-list-panel"
                        showFlag={this.state.isShowCustomerUserListPanel}
                    >
                        { this.state.isShowCustomerUserListPanel ?
                            <AppUserManage
                                customer_id={customerOfCurUser.id}
                                hideCustomerUserList={this.closeCustomerUserListPanel}
                                customer_name={customerOfCurUser.name}
                            /> : null
                        }
                    </RightPanel>
                    <div onClick={this.tryNewPage} className='try-new-btn'>{Intl.get('home.page.try.new', '试用新版')}</div>
                </div>
            </RightContent>
        );
    }
}
SalesHomePage.propTypes = {
    history: PropTypes.obj
};
module.exports = eefungCustomerManagerHoc(SalesHomePage);
