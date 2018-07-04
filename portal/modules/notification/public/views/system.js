require('../../../app_user_manage/public/css/main-zh_CN.less');
import {Alert, Select, message, Icon, Button} from 'antd';
import LAYOUT from '../utils/layout';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
import notificationAjax from '../ajax/notification-ajax';
// 没有消息的提醒
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
//系统消息对应的几种类型
import {SYSTEM_NOTICE_TYPE_MAP, SYSTEM_NOTICE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {RightPanel} from 'CMP_DIR/rightPanel';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import TopNav from 'CMP_DIR/top-nav';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import userData from 'PUB_DIR/sources/user-data';
import UserDetail from '../../../app_user_manage/public/views/user-detail';
import {notificationEmitter} from 'PUB_DIR/sources/utils/emitters';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
const Option = Select.Option;
const PAGE_SIZE = 20;
import {STATUS} from 'PUB_DIR/sources/utils/consts';
const classnames = require('classnames');
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
const STATUS_ARRAY = [{
    name: Intl.get('notification.system.untreated', '待处理'),
    value: STATUS.UNHANDLED
}, {
    name: Intl.get('notification.system.handled', '已处理'),
    value: STATUS.HANDLED
}];
let SystemNotification = React.createClass({
    getInitialState: function() {
        return {
            isLoadingSystemNotices: false,//正在获取系统消息
            loadSystemNoticesErrorMsg: '',//获取系统消息的错误提示
            systemNotices: [],//系统消息列表
            totalSize: 0,//系统消息总数
            lastSystemNoticeId: '',//用来下拉加载的当前展示的最后一个通知的id
            listenScrollBottom: true,//是否监听下拉加载
            selectedNoticeType: '',//当前选中的要查看的通知类型
            curShowCustomerId: '',//展示客户详情的客户id
            curShowUserId: '',//展示用户详情的用户id
            status: STATUS.UNHANDLED,//未处理，handled:已处理
            showUpdateTip: false, //是否展示有新数据刷新的提示
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            selectedLiIndex: null,
            handleNoticeMessageSuccessFlag: false, // 处理通知成功的信息提示
            handleNoticeMessageErrorTips: '', // 处理通知失败的信息提示
            noticeId: '', // 点击处理通知的id
        };
    },
    componentDidMount: function() {
        this.getSystemNotices();
        //新系统消息的监听
        notificationEmitter.on(notificationEmitter.SYSTEM_NOTICE_UPDATED, this.pushDataListener);
        $(window).on('resize', this.resizeWindowHeight);
    },

    componentWillUnmount: function() {
        //销毁时，删除新系统消息监听器
        notificationEmitter.removeListener(notificationEmitter.SYSTEM_NOTICE_UPDATED, this.pushDataListener);
        $(window).off('resize', this.resizeWindowHeight);
    },
    //监听推送数据
    pushDataListener: function(data) {
        //有数据，将是否展示更新tip
        if (data) {
            this.setState({showUpdateTip: true});
        }
    },
    resizeWindowHeight: function() {
        this.setState(this.state);
    },
    getSystemNotices: function() {
        let queryObj = {
            notice_type: this.state.selectedNoticeType,//通知类型，"":全部类型
            page_size: PAGE_SIZE,//默认不传是5
            id: this.state.lastSystemNoticeId//用来下拉加载的id
        };
        this.setState({isLoadingSystemNotices: true});
        notificationAjax.getSystemNotices(queryObj, this.state.status).then(result => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.state.isLoadingSystemNotices = false;
            this.state.loadSystemNoticesErrorMsg = '';
            if (result && _.isArray(result.list)) {
                if (this.state.lastSystemNoticeId) {
                    //下拉加载时
                    this.state.systemNotices = this.state.systemNotices.concat(result.list);
                } else {
                    //首次获取数据时
                    this.state.systemNotices = result.list;
                }
                this.state.totalSize = result.total || this.state.systemNotices.length;
                this.state.lastSystemNoticeId = this.state.systemNotices.length ? _.last(this.state.systemNotices).id : '';
            }
            //如果当前已获取的数据还不到总数，继续监听下拉加载，否则不监听下拉加载
            this.state.listenScrollBottom = this.state.totalSize > this.state.systemNotices.length;
            this.setState(this.state);
        }, errorMsg => {
            this.setState({
                isLoadingSystemNotices: false,
                loadSystemNoticesErrorMsg: errorMsg || Intl.get('notification.system.notice.failed', '获取系统消息列表失败')
            });
        });
    },
    //下拉加载
    handleScrollBarBottom: function() {
        if (this.state.totalSize > this.state.systemNotices.length) {
            this.getSystemNotices();
        }
    },
    //是否显示没有更多数据了
    showNoMoreDataTip: function() {
        return !this.state.isLoadingSystemNotices &&
            this.state.systemNotices.length >= 10 && !this.state.listenScrollBottom;
    },
    openCustomerDetail: function(customer_id, index) {
        if (this.state.curShowUserId) {
            this.closeRightUserPanel();
        }
        this.setState({
            curShowCustomerId: customer_id,
            selectedLiIndex: index
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightCustomerPanel
            }
        });
    },
    handleTypeChange: function(val) {
        Trace.traceEvent($(this.getDOMNode()).find('.notification-type-select'), '类型筛选');
        this.setState({
            selectedNoticeType: val,
            lastSystemNoticeId: ''
        });
        setTimeout(() => {
            this.getSystemNotices();
        });

    },
    handleStatusChange: function(status) {
        Trace.traceEvent($(this.getDOMNode()).find('.notification-status-select'), '处理/未处理筛选');
        this.setState({
            status: status,
            lastSystemNoticeId: ''
        });
        setTimeout(() => {
            this.getSystemNotices();
        });
    },
    renderHandledNotice: function(notice, idx) {
        //是否是异地登录的类型
        let isOffsetLogin = (notice.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && notice.content);
        let isLoginFailed = notice.type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        let handleNoticeLiItemClass = classnames({
            'system-notice-handled-item': true,
            'select-li-item': idx === this.state.selectedLiIndex,
        });
        let iconfontClassName = this.getIconFontClassName(notice.type);
        return (
            <li key={idx} className={handleNoticeLiItemClass} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <div className="system-notice-title">
                    <i className={iconfontClassName}></i>
                    <div className="system-notice-type">
                        {SYSTEM_NOTICE_TYPE_MAP[notice.type]}
                        <i className='iconfont icon-arrow'></i>
                    </div>
                    <div className="customer-name" onClick={this.openCustomerDetail.bind(this, notice.customer_id, idx)}>{notice.customer_name}</div>
                </div>
                <div className="system-notice-descr">
                    {isOffsetLogin ? (Intl.get('notification.system.on', '在') + notice.content.current_location) : ''}
                    {Intl.get('notification.system.use.account', '用账号')}
                    {notice.user_name ? (
                        <a onClick={this.openUserDetail.bind(this, notice.user_id, idx)}>{notice.user_name}</a>) : null}
                    {notice.app_name ?
                        <span>{(isLoginFailed ? Intl.get('login.login', '登录') : Intl.get('notification.system.login', '登录了')) + notice.app_name}</span> : ''}
                    {isLoginFailed ? <span> ,{Intl.get('notification.login.password.error', '报密码或验证码错误')}</span> : null}
                    <span className="system-notice-time">
                        {',' + TimeUtil.transTimeFormat(notice.create_time)}
                    </span>
                </div>
            </li>
        );
    },
    renderNoticeList: function() {
        let systemNotices = this.state.systemNotices;
        if (this.state.isLoadingSystemNotices && !this.state.lastSystemNoticeId) {//等待状态
            return <Spinner/>;
        } else if (_.isArray(systemNotices) && systemNotices.length) {//系统消息列表
            return (<div>
                <ul className="system_message_list">
                    {this.state.systemNotices.map((notice, idx) => {
                        return this.state.status === STATUS.UNHANDLED ?
                            this.renderUnHandledNotice(notice, idx)
                            : this.renderHandledNotice(notice, idx);
                    })}
                </ul>
                <NoMoreDataTip
                    fontSize="12"
                    show={this.showNoMoreDataTip}
                    message={Intl.get('common.no.more.system.message','没有更多系统消息了')}
                />
            </div>);
        } else if (this.state.loadSystemNoticesErrorMsg) {//错误提示
            return ( <Alert
                message={this.state.loadSystemNoticesErrorMsg}
                type="error"
                showIcon={true}
            />);
        } else {//暂无数据
            return (<Alert
                message={Intl.get('notification.has.no.system.data', '暂无系统消息数据')}
                type="info"
                showIcon={true}
            />);
        }
    },
    closeRightCustomerPanel: function() {
        this.setState({
            curShowCustomerId: '',
            selectedLiIndex: null
        });
    },
    openUserDetail: function(user_id, index) {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        this.setState({
            curShowUserId: user_id,
            selectedLiIndex: index
        });
    },
    handleNoticeDetailData(noticeDetail) {
        let noticeDetailData = _.cloneDeep(noticeDetail);
        let userName = _.chain(noticeDetailData).map('user_name').uniq().value();
        let appName = _.chain(noticeDetailData).map('app_name').uniq().value();
        let userAppArray = [];
        userName.forEach( (nameItem) => {
            appName.forEach( (appItem) => {
                userAppArray.push({user_name: nameItem, app_name: appItem});
            });
        } );
        let processData = [];
        userAppArray.forEach( (item) => {
            let processObj = {};
            noticeDetailData.forEach( (noticeItem, index) => {
                if (item.user_name === noticeItem.user_name && item.app_name === noticeItem.app_name) {
                    if (processObj && processObj.app_name) {
                        processObj.login_count += 1;
                        if (processObj.create_time < noticeItem.create_time) {
                            processObj.create_time = noticeItem.create_time;
                        }
                    } else {
                        noticeItem.login_count = 1;
                        processObj = noticeItem;
                    }
                }
            } );
            if (processObj && processObj.app_name) {
                processData.push(processObj);
            }
        } );
        return processData;
    },
    // idx表示的是系统通知的条数
    renderUnHandledNoticeContent: function(notice, idx) {
        let showList = [];
        if (_.isArray(notice.detail) && notice.detail.length) {
            showList = this.handleNoticeDetailData(notice.detail);
        }
        return showList.map((item, index) => {
            //是否是异地登录的类型
            let isOffsetLogin = (item.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && item.content);
            let isLoginFailed = item.type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
            return <div className="system-notice-item" key={index}>
                <a onClick={this.openUserDetail.bind(this, item.user_id, index)}>{item.user_name}</a>
                {isOffsetLogin ? (Intl.get('notification.system.on', '在') + item.content.current_location) : ''}
                {item.app_name ?
                    <span>{(isLoginFailed ? Intl.get('login.login', '登录') : Intl.get('notification.system.login', '登录了')) + item.app_name}</span> : ''}
                {isLoginFailed ? <span> ,{Intl.get('notification.login.password.error', '报密码或验证码错误')},</span> : null}
                <span className="system-notice-time">
                    {item.login_count === 1 ? TimeUtil.transTimeFormat(item.create_time) : (<span>
                        <ReactIntl.FormattedMessage id="notification.system.login.count"
                            defaultMessage={'{count}次,最后一次'}
                            values={{count: <span className="login-count">{item.login_count}</span>}}/>
                        <span className="login-time">{TimeUtil.transTimeFormat(item.create_time)}</span>
                    </span>)}
                </span>
            </div>;
        });
    },
    setHandlingFlag: function(notice, flag) {
        _.some(this.state.systemNotices, item => {
            if (item.id === notice.id) {
                item.isHandling = flag;
            }
        });
        this.setState({systemNotices: this.state.systemNotices});
    },
    //处理系统消息
    handleSystemNotice: function(notice, e) {
        Trace.traceEvent(e, '处理系统消息');
        if (notice.isHandling) {
            return;
        }
        this.setHandlingFlag(notice, true);
        this.setState({
            noticeId: notice.id
        });
        notificationAjax.handleSystemNotice(notice.id).then(result => {
            this.setHandlingFlag(notice, false);
            if (result) {//处理成功后，将该消息从未处理消息中删除
                this.state.systemNotices = _.filter(this.state.systemNotices, item => item.id !== notice.id);
                this.setState({systemNotices: this.state.systemNotices, totalSize: this.state.totalSize - 1});
                this.setState({
                    handleNoticeMessageSuccessFlag: true
                });
            }
        }, errorMsg => {
            this.setHandlingFlag(notice, false);
            this.setState({
                handleNoticeMessageErrorTips: errorMsg || Intl.get('notification.system.handle.failed', '将系统消息设为已处理失败')
            });
        });
    },
    handleMouseEnter(event) {
        if (event.target.className === 'system-notice-unhandled-item') {
            $('.system-notice-unhandled-item').addClass('system-notice-hover-item');
        } else if (event.target.className === 'system-notice-handled-item') {
            $('.system-notice-handled-item').addClass('system-notice-hover-item');
        }
    },
    handleMouseLeave(event) {
        if (event.target.className === 'system-notice-unhandled-item') {
            $('.system-notice-unhandled-item').removeClass('system-notice-hover-item');
        } else if (event.target.className === 'system-notice-handled-item') {
            $('.system-notice-handled-item').removeClass('system-notice-hover-item');
        }
    },
    hideNoticeSuccessTips() {
        this.setState({
            handleNoticeMessageSuccessFlag: false
        });
    },
    getIconFontClassName(type) {
        let iconfontClassName = 'iconfont';
        if (type === 'concerCustomerLogin') { // 关注客户登录
            iconfontClassName += ' icon-concern-customer-login';
        } else if (type === 'appIllegal') { // 停用客户登录
            iconfontClassName += ' icon-deactivate-customer-login';
        } else if (type === 'loginFailed') { // 登录失败
            iconfontClassName += ' icon-login-failed';
        } else if (type === 'illegalLocation') { // 异地登录
            iconfontClassName += ' icon-remote-login';
        }
        return iconfontClassName;
    },
    //未处理的系统消息  idx表示的是共有多少条系统通知
    renderUnHandledNotice: function(notice, idx) {
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : '';//只可以处理自己的系统消息
        let unhandleNoticeLiItemClass = classnames({
            'system-notice-unhandled-item': true,
            'select-li-item': idx === this.state.selectedLiIndex,
        });
        let noticeDetailClass = classnames({
            'notice-detail-more': true,
            'show-handle-button-detail': loginUserId === notice.member_id
        });
        let iconfontClassName = this.getIconFontClassName(notice.type);
        return (
            <li key={idx} className={unhandleNoticeLiItemClass} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <div className="system-notice-title">
                    <i className={iconfontClassName}></i>
                    <div className="system-notice-type">
                        {SYSTEM_NOTICE_TYPE_MAP[notice.type]}
                        <i className='iconfont icon-arrow'></i>
                    </div>
                    <div className="customer-name" onClick={this.openCustomerDetail.bind(this, notice.customer_id, idx)}>{notice.customer_name}</div>
                </div>
                <div className="system-notice-content">
                    {this.renderUnHandledNoticeContent(notice, idx)}
                    {
                        loginUserId === notice.member_id ?
                            <Button className="notice-handled-set" onClick={this.handleSystemNotice.bind(this, notice)}>
                                {Intl.get('notification.system.handled.set', '处理')}{notice.isHandling ?
                                    <Icon type="loading"/> : null}
                            </Button> : null
                    }
                    {this.state.noticeId === notice.id ? (
                        <div className="handle-notice-tips">
                            {this.state.handleNoticeMessageSuccessFlag ? (
                                <AlertTimer
                                    message={Intl.get('notification.system.handled.success', '处理成功')}
                                    type="success"
                                    time={3000}
                                    showIcon
                                    onHide={this.hideNoticeSuccessTips()}
                                />
                            ) : null}
                            {this.state.handleNoticeMessageErrorTips ? (
                                <Alert
                                    message={Intl.get('notification.system.handled.error', '处理失败')}
                                    description={this.state.handleNoticeMessageErrorTips}
                                    type="error"
                                    showIcon
                                    closable
                                >
                                </Alert>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </li>
        );
    },
    closeRightUserPanel: function() {
        this.setState({
            curShowUserId: '',
            selectedLiIndex: null
        });
    },
    refreshSystemNotice: function() {
        this.setState({
            lastSystemNoticeId: '',
            showUpdateTip: false
        });
        setTimeout(() => {
            this.getSystemNotices();
        });
    },
    //展示更新提示
    renderUpdateTip: function() {
        if (this.state.showUpdateTip && this.state.status === STATUS.UNHANDLED) {//在未处理列表下，有新数据推送过来时
            return (<div className="system-notice-update">
                <ReactIntl.FormattedMessage
                    id="notification.update"
                    defaultMessage={'数据已更新，是否{refresh}'}
                    values={{
                        'refresh': <a href="javascript:void(0)" onClick={this.refreshSystemNotice}>
                            <ReactIntl.FormattedMessage id="common.refresh" defaultMessage="刷新"/>
                        </a>
                    }}
                />
            </div> );
        }
        return null;
    },
    ShowCustomerUserListPanel: function(data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    },
    closeCustomerUserListPanel: function() {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },
    render: function() {
        let containerHeight = $(window).height() - LAYOUT.SUMMARY_H - LAYOUT.TOP;
        let customerOfCurUser = this.state.customerOfCurUser;
        let customerUserSize = customerOfCurUser && _.isArray(customerOfCurUser.app_user_ids) ? customerOfCurUser.app_user_ids.length : 0;
        return (
            <div className="notification_system" data-tracename="系统消息列表">
                <TopNav>
                    <div className="notification-type-select">
                        <SelectFullWidth
                            minWidth={60}
                            value={this.state.selectedNoticeType}
                            onChange={this.handleTypeChange}
                        >
                            <Option value="">{Intl.get('user.online.all.type', '全部类型')}</Option>
                            {_.map(SYSTEM_NOTICE_TYPE_MAP, (key, val) => {
                                return (<Option value={val}>{key}</Option>);
                            })}
                        </SelectFullWidth>
                    </div>
                    <div className="notification-status-select">
                        <Select size="large" value={this.state.status} onChange={this.handleStatusChange}>
                            {STATUS_ARRAY.map((status) => {
                                return (<Option value={status.value} key={status.value}>{status.name}</Option>);
                            })}
                        </Select>
                    </div>
                </TopNav>
                {this.renderUpdateTip()}
                <div style={{height: containerHeight}}>
                    <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}
                        itemCssSelector=".system_message_list>li">
                        {this.renderNoticeList()}
                    </GeminiScrollbar>
                </div>
                {this.state.totalSize ?
                    <div className="summary_info">
                        {Intl.get('notification.total.system.notice', '共{x}条系统消息', {x: this.state.totalSize})}
                    </div> : null
                }
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
                            user_size={customerUserSize}
                        /> : null
                    }
                </RightPanel>
                {
                    this.state.curShowUserId ?
                        <RightPanel className="app_user_manage_rightpanel white-space-nowrap right-pannel-default"
                            showFlag={this.state.curShowUserId}>
                            <UserDetail userId={this.state.curShowUserId}
                                closeRightPanel={this.closeRightUserPanel}/>
                        </RightPanel>
                        : null
                }
            </div>
        );
    }
});

module.exports = SystemNotification;