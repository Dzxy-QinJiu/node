require('../../../app_user_manage/public/css/main-zh_CN.less');
import {Alert, Select, message, Icon, Button, Switch } from 'antd';
import LAYOUT from '../utils/layout';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
import notificationAjax from '../ajax/notification-ajax';
// 没有消息的提醒
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
//系统消息对应的几种类型
import {SYSTEM_NOTICE_TYPE_MAP, SYSTEM_NOTICE_TYPES, KETAO_SYSTEM_NOTICE_TYPE_MAP} from 'PUB_DIR/sources/utils/consts';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {RightPanel} from 'CMP_DIR/rightPanel';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import TopNav from 'CMP_DIR/top-nav';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import userData from 'PUB_DIR/sources/user-data';
import {notificationEmitter} from 'PUB_DIR/sources/utils/emitters';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
const Option = Select.Option;
const PAGE_SIZE = 20;
import {STATUS} from 'PUB_DIR/sources/utils/consts';
const classnames = require('classnames');
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { storageUtil } from 'ant-utils';
import ajax from 'ant-ajax';
import {isKetaoOrganizaion} from 'PUB_DIR/sources/utils/common-method-util';

const STATUS_ARRAY = [{
    name: Intl.get('notification.system.untreated', '待处理'),
    value: STATUS.UNHANDLED
}, {
    name: Intl.get('notification.system.handled', '已处理'),
    value: STATUS.HANDLED
}];

const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));

class SystemNotification extends React.Component {
    state = {
        isLoadingSystemNotices: false,//正在获取系统消息
        loadSystemNoticesErrorMsg: '',//获取系统消息的错误提示
        systemNotices: [],//系统消息列表
        totalSize: 0,//系统消息总数
        lastSystemNoticeId: '',//用来下拉加载的当前展示的最后一个通知的id
        listenScrollBottom: false,//是否监听下拉加载
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
        isOpenPopUpNotify: _.get(websiteConfig, 'is_open_pop_up_notify', true), // 是否开启弹窗通知,默认是开启的
    };

    componentDidMount() {
        this.getSystemNotices();
        //新系统消息的监听
        notificationEmitter.on(notificationEmitter.SYSTEM_NOTICE_UPDATED, this.pushDataListener);
        $(window).on('resize', this.resizeWindowHeight);
    }

    componentWillUnmount() {
        //销毁时，删除新系统消息监听器
        notificationEmitter.removeListener(notificationEmitter.SYSTEM_NOTICE_UPDATED, this.pushDataListener);
        $(window).off('resize', this.resizeWindowHeight);
    }

    //监听推送数据
    pushDataListener = (data) => {
        //有数据，将是否展示更新tip
        if (data) {
            this.setState({showUpdateTip: true});
        }
    };

    resizeWindowHeight = () => {
        this.setState(this.state);
    };

    getSystemNotices = () => {
        let queryObj = {
            notice_type: this.state.selectedNoticeType,//通知类型，"":全部类型
            page_size: PAGE_SIZE,//默认不传是5
            id: this.state.lastSystemNoticeId//用来下拉加载的id
        };
        this.setState({isLoadingSystemNotices: true});
        notificationAjax.getSystemNotices(queryObj, this.state.status).then(result => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            let stateData = this.state;
            stateData.isLoadingSystemNotices = false;
            stateData.loadSystemNoticesErrorMsg = '';
            if (result && _.isArray(result.list)) {
                if (stateData.lastSystemNoticeId) {
                    //下拉加载时
                    stateData.systemNotices = this.state.systemNotices.concat(result.list);
                } else {
                    //首次获取数据时
                    stateData.systemNotices = result.list;
                }
                stateData.totalSize = result.total || stateData.systemNotices.length;
                stateData.lastSystemNoticeId = stateData.systemNotices.length ? _.last(stateData.systemNotices).id : '';
            }
            //如果当前已获取的数据还不到总数，继续监听下拉加载，否则不监听下拉加载
            stateData.listenScrollBottom = stateData.totalSize > stateData.systemNotices.length;
            this.setState(stateData);
        }, errorMsg => {
            this.setState({
                isLoadingSystemNotices: false,
                loadSystemNoticesErrorMsg: errorMsg || Intl.get('notification.system.notice.failed', '获取系统消息列表失败')
            });
        });
    };

    //下拉加载
    handleScrollBarBottom = () => {
        if (this.state.totalSize > this.state.systemNotices.length) {
            this.getSystemNotices();
        }
    };

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.isLoadingSystemNotices &&
            this.state.systemNotices.length >= 10 && !this.state.listenScrollBottom;
    };

    openCustomerDetail = (customer_id, index) => {
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
    };

    handleTypeChange = (val) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.notification-type-select'), '类型筛选');
        this.setState({
            selectedNoticeType: val,
            lastSystemNoticeId: '',
            listenScrollBottom: false
        });
        setTimeout(() => {
            this.getSystemNotices();
        });

    };

    handleStatusChange = (status) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.notification-status-select'), '处理/未处理筛选');
        this.setState({
            status: status,
            lastSystemNoticeId: '',
            listenScrollBottom: false
        });
        setTimeout(() => {
            this.getSystemNotices();
        });
    };

    renderHandledNotice = (notice, idx) => {
        //是否是异地登录的类型
        let isOffsetLogin = (notice.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && notice.content);
        // 是否是登录失败
        let isLoginFailed = notice.type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        // 判断是否是客套组织，客套组织有拨打电话失败和提取线索失败的情况
        let isCallFailed = isKetaoOrganizaion() && notice.type === SYSTEM_NOTICE_TYPES.CALL_UP_FAIL;
        let isPullClueFail = isKetaoOrganizaion() && notice.type === SYSTEM_NOTICE_TYPES.PULL_CLUE_FAIL;

        let handleNoticeLiItemClass = classnames({
            'system-notice-handled-item': true,
            'select-li-item': idx === this.state.selectedLiIndex,
        });
        let iconfontClassName = this.getIconFontClassName(notice.type);
        return (
            <li key={idx} className={handleNoticeLiItemClass}>
                <div className="system-notice-title">
                    <i className={iconfontClassName}></i>
                    <div className="system-notice-type">
                        {
                            isKetaoOrganizaion() ? (KETAO_SYSTEM_NOTICE_TYPE_MAP[notice.type]) : (SYSTEM_NOTICE_TYPE_MAP[notice.type])
                        }
                    </div>
                    <div className="customer-name"
                        onClick={this.openCustomerDetail.bind(this, notice.customer_id, idx)}
                    >
                        {notice.customer_name}
                        <i className='iconfont icon-arrow'></i>
                    </div>
                </div>
                <div className="system-notice-descr">
                    {
                        isOffsetLogin ? (Intl.get('notification.system.on', '在') + notice.content.current_location) : ''
                    }
                    {Intl.get('notification.system.use.account', '用账号')}
                    {
                        notice.user_name ? (
                            <a onClick={this.openUserDetail.bind(this, notice.user_id, idx)}>
                                {notice.user_name}
                            </a>) : null
                    }
                    {
                        notice.app_name ?
                            <span>
                                {(isLoginFailed ? Intl.get('login.login', '登录') : Intl.get('notification.system.login', '登录了')) + notice.app_name}
                            </span> : ''
                    }
                    {
                        isLoginFailed ?
                            <span>
                                ,{_.get(notice, 'content.operate_detail', Intl.get('login.username.password.error', '用户名或密码错误'))}
                            </span> : null
                    }
                    {
                        isCallFailed ? <span>
                                ,{_.get(notice, 'content.operate_detail', Intl.get('notification.call.up.failed', '拨打电话失败'))}
                        </span> : null
                    }
                    {
                        isPullClueFail ? <span>
                                ,{_.get(notice, 'content.operate_detail', Intl.get('notification.extract.clue.failed', '提取线索失败'))}
                        </span> : null
                    }
                    <span className="system-notice-time">
                        {'，' + TimeUtil.transTimeFormat(notice.create_time)}
                    </span>
                </div>
            </li>
        );
    };

    renderNoticeList = () => {
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
    };

    closeRightCustomerPanel = () => {
        this.setState({
            curShowCustomerId: '',
            selectedLiIndex: null
        });
        //触发关闭用户详情面板
        userDetailEmitter.emit(userDetailEmitter.CLOSE_USER_DETAIL);

    };

    openUserDetail = (user_id, index) => {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: user_id});
    };

    // 获取通知失败
    getNoticeErrorArray = (notifyType, noticeDetailData) => {
        // 是否是登录失败
        let isLoginFailed = notifyType === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        // 是否是拨打电话失败
        let isCallUpFailed = notifyType === SYSTEM_NOTICE_TYPES.CALL_UP_FAIL;
        // 是否是提取线失败
        let isPullClueFailed = notifyType === SYSTEM_NOTICE_TYPES.PULL_CLUE_FAIL;
        let noticeErrorArray = _.map(noticeDetailData, item => {
            let detailContent = _.get(item, 'content.operate_detail');
            if (!detailContent) {
                if (isLoginFailed) { // 登录失败的处理
                    detailContent = Intl.get('login.username.password.error', '用户名或密码错误');
                } else if (isCallUpFailed) { // 拨打电话失败的处理
                    detailContent = Intl.get('notification.call.up.failed', '拨打电话失败');
                }else if (isPullClueFailed) { // 提取线失败的处理
                    detailContent = Intl.get('notification.extract.clue.failed', '提取线索失败');
                }
            }
            return detailContent;
        });

        return _.uniq(noticeErrorArray);
    };

    // 待处理数据整合,同一个用户登录同一个应用，计算登录次数以及获取最后一次登录时间
    handleNoticeDetailData = (noticeDetail, notifyType) => {
        // 是否是登录失败
        let isLoginFailed = notifyType === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        // 是否是拨打电话失败
        let isCallUpFailed = notifyType === SYSTEM_NOTICE_TYPES.CALL_UP_FAIL;
        // 是否是提取线失败
        let isPullClueFailed = notifyType === SYSTEM_NOTICE_TYPES.PULL_CLUE_FAIL;

        let noticeDetailData = _.cloneDeep(noticeDetail);
        // 登录的用户名 eg: [a, b]
        let userName = _.chain(noticeDetailData).map('user_name').uniq().value();
        // 登录的应用名 eg: ['鹰击', '鹰眼']
        let appName = _.chain(noticeDetailData).map('app_name').uniq().value();
        //登录失败的错误提示信息 eg: ['用户名或密码错误','验证码错误']
        let loginErrorArray = this.getNoticeErrorArray(notifyType, noticeDetailData);

        let userAppArray = [];
        // 可能出现的用户登录应用的情况, eg: [{user_name: a, app_name: '鹰击'},{user_name: a, app_name: '鹰眼'},{user_name: b, app_name: '鹰击'},{user_name: b, app_name: '鹰眼'}]
        // 登录失败的情况，eg:  [{user_name: a, app_name: '鹰击', login_error_msg:'用户名密码错误'},{user_name: a, app_name: '鹰眼', login_error_msg:'用户名密码错误'},{user_name: b, app_name: '鹰击', login_error_msg:'用户名密码错误'},{user_name: b, app_name: '鹰眼', login_error_msg:'验证码错误'}]
        _.each(userName, nameItem => {
            _.each(appName, appItem => {
                if(_.get(loginErrorArray,'[0]')){
                    _.each(loginErrorArray, errorMsg => {
                        userAppArray.push({user_name: nameItem, app_name: appItem, login_error_msg: errorMsg});
                    });
                } else {
                    userAppArray.push({user_name: nameItem, app_name: appItem});
                }
            });
        } );
        let processData = [];
        userAppArray.forEach( (item) => {
            let processObj = {};
            // 同一个用户登录同一个应用（同一种登录错误），次数累加，获取最后一次登录时间
            noticeDetailData.forEach( (noticeItem, index) => {
                let isSame = item.user_name === noticeItem.user_name && item.app_name === noticeItem.app_name;
                // 同类登录失败错误提示的次数累计
                // 注意：_.get(object, path, [defaultValue])，根据 object对象的path路径获取值。 如果解析 value 是 undefined 会以 defaultValue 取代。
                // 如果value有值且为空字符串的话，则_.get(object, 'value')的值是空字符串，
                if(item.login_error_msg){
                    let failedMsg = '';
                    if (isLoginFailed) {
                        failedMsg = _.get(noticeItem, 'content.operate_detail') || Intl.get('login.username.password.error', '用户名或密码错误');
                        isSame = isSame && item.login_error_msg === failedMsg;
                    } else if (isCallUpFailed) {
                        failedMsg = _.get(noticeItem, 'content.operate_detail') || Intl.get('notification.call.up.failed', '拨打电话失败');
                        isSame = isSame && item.login_error_msg === failedMsg;
                    } else if (isPullClueFailed) {
                        failedMsg = _.get(noticeItem, 'content.operate_detail') || Intl.get('notification.extract.clue.failed', '提取线索失败');
                        isSame = isSame && item.login_error_msg === failedMsg;
                    }
                }
                if (isSame) {
                    if (processObj && processObj.app_name) {
                        processObj.login_count += 1;
                        if (processObj.create_time < noticeItem.create_time) {
                            processObj.create_time = noticeItem.create_time;
                        }
                    } else {
                        noticeItem.login_count = 1;
                        //登录失败的具体错误提示
                        if(item.login_error_msg){
                            noticeItem.login_error_msg = item.login_error_msg;
                        }
                        processObj = noticeItem;
                    }
                }
            });
            if (processObj && processObj.app_name) {
                processData.push(processObj);
            }
        } );
        // 按时间逆序排序
        processData = _.sortBy(processData, item => -item.create_time);
        return processData;
    };

    // idx表示的是系统通知的条数
    renderUnHandledNoticeContent = (notice, idx) => {
        let showList = [];
        // 是否是登录失败
        let isLoginFailed = notice.type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        // 是否是拨打电话失败
        let isCallUpFailed = notice.type === SYSTEM_NOTICE_TYPES.CALL_UP_FAIL;
        // 是否是提取线失败
        let isPullClueFailed = notice.type === SYSTEM_NOTICE_TYPES.PULL_CLUE_FAIL;

        if (_.isArray(notice.detail) && notice.detail.length) {
            showList = this.handleNoticeDetailData(notice.detail, notice.type);
        }
        return showList.map((item, index) => {
            //是否是异地登录的类型
            let isOffsetLogin = (item.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && item.content);
            let loginErrMsg = _.get(item, 'login_error_msg');
            let callUpFailedMsg = [];
            if (isCallUpFailed) {
                callUpFailedMsg = loginErrMsg.split(',');
            }
            return (
                <div className="system-notice-item" key={index}>
                    <a onClick={this.openUserDetail.bind(this, item.user_id, index)}>{item.user_name}</a>
                    {
                        isPullClueFailed ? (
                            <span className="system-notice-time">
                                <span>{Intl.get('clue.extract.failed', '提取失败')}</span>
                                <span className="login-count">
                                    {Intl.get('notification.system.count', '{count}次', {count: item.login_count})}
                                </span>
                            </span>
                        ) : null
                    }
                    {
                        isOffsetLogin ? (Intl.get('notification.system.on', '在') + item.content.current_location) : ''
                    }
                    {
                        isCallUpFailed || isPullClueFailed ? null : (
                            item.app_name ?
                                <span>
                                    {
                                        (isLoginFailed ? Intl.get('login.login', '登录') :
                                            Intl.get('notification.system.login', '登录了')) + item.app_name
                                    }
                                </span> : ''
                        )
                    }
                    {
                        isCallUpFailed ? (
                            <span className="system-notice-time">
                                <span>{callUpFailedMsg.slice(0, 1)}</span>
                                <span className="login-count">
                                    {Intl.get('notification.system.count', '{count}次', {count: item.login_count})}
                                </span>
                                {
                                    callUpFailedMsg.length > 1 ? (
                                        <span>，{callUpFailedMsg.slice(1)}</span>
                                    ) : null
                                }

                            </span>
                        ) : null
                    }
                    {
                        (isLoginFailed || isPullClueFailed) && loginErrMsg ?
                            <span>，{loginErrMsg}</span> : null
                    }

                    <span className="system-notice-time">
                        {item.login_count === 1 ? (
                            <span>
                                ，{TimeUtil.transTimeFormat(item.create_time)}
                            </span>
                        ) : (<span>
                            {
                                isPullClueFailed || isCallUpFailed ? null : (
                                    <span className="login-count">
                                        {Intl.get('notification.system.count', '{count}次', {count: item.login_count})}
                                    </span>
                                )
                            }
                            <span>，{Intl.get('notification.system.login.count', '最后一次')}</span>
                            <span className="login-time">{TimeUtil.transTimeFormat(item.create_time)}</span>
                        </span>)}
                    </span>
                </div>
            );
        });
    };

    setHandlingFlag = (notice, flag) => {
        _.some(this.state.systemNotices, item => {
            if (item.id === notice.id) {
                item.isHandling = flag;
            }
        });
        this.setState({systemNotices: this.state.systemNotices});
    };

    //处理系统消息
    handleSystemNotice = (notice, e) => {
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
            if (result) {
                this.setState({
                    systemNotices: this.state.systemNotices,
                    totalSize: this.state.totalSize - 1,
                    handleNoticeMessageSuccessFlag: true
                });
            }
        }, errorMsg => {
            this.setHandlingFlag(notice, false);
            this.setState({
                handleNoticeMessageErrorTips: errorMsg || Intl.get('notification.system.handle.failed', '将系统消息设为已处理失败')
            });
        });
    };

    hideNoticeSuccessTips = () => {
        let systemNotices = this.state.systemNotices;
        //处理成功后，将该消息从未处理消息中删除,随处理失败的提示消失
        systemNotices = _.filter(systemNotices, item => item.id !== this.state.noticeId);
        this.setState({
            handleNoticeMessageSuccessFlag: false,
            systemNotices
        });
    };

    getIconFontClassName = (type) => {
        let iconfontClassName = 'iconfont';
        if (type === SYSTEM_NOTICE_TYPES.FOCUS_CUSTOMER_LOGIN) { // 关注客户登录
            iconfontClassName += ' icon-concern-customer-login';
        } else if (type === SYSTEM_NOTICE_TYPES.DISABLE_CUSTOMER_LOGIN) { // 停用客户登录
            iconfontClassName += ' icon-deactivate-customer-login';
        } else if (type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED) { // 登录失败
            iconfontClassName += ' icon-login-failed';
        } else if (type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN) { // 异地登录
            iconfontClassName += ' icon-remote-login';
        }
        // 客套组织，才有拨打电话失败和提取线索失败
        if (isKetaoOrganizaion()) {
            if (type === SYSTEM_NOTICE_TYPES.CALL_UP_FAIL) { // 拨打电话失败
                iconfontClassName += ' icon-call-failed';
            } else if (type === SYSTEM_NOTICE_TYPES.PULL_CLUE_FAIL) { // 提取线索失败
                iconfontClassName += ' icon-pull-clue-failed';
            }
        }
        return iconfontClassName;
    };

    //未处理的系统消息  idx表示的是共有多少条系统通知
    renderUnHandledNotice = (notice, idx) => {
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : '';//只可以处理自己的系统消息
        let unhandleNoticeLiItemClass = classnames({
            'system-notice-unhandled-item': true,
            'select-li-item': idx === this.state.selectedLiIndex,
        });
        let iconfontClassName = this.getIconFontClassName(notice.type);
        return (
            <li key={idx} className={unhandleNoticeLiItemClass}>
                <div className="system-notice-title">
                    <i className={iconfontClassName}></i>
                    <div className="system-notice-type">
                        {
                            isKetaoOrganizaion() ? (KETAO_SYSTEM_NOTICE_TYPE_MAP[notice.type]) : (SYSTEM_NOTICE_TYPE_MAP[notice.type])
                        }
                    </div>
                    <div className="customer-name"
                        onClick={this.openCustomerDetail.bind(this, notice.customer_id, idx)}
                    >
                        {notice.customer_name}
                        <i className='iconfont icon-arrow'></i>
                    </div>
                </div>
                <div className="system-notice-content">
                    {this.renderUnHandledNoticeContent(notice, idx)}
                    {
                        loginUserId === notice.member_id ?
                            <Button className="notice-handled-set" disabled={this.state.noticeId === notice.id}
                                onClick={this.handleSystemNotice.bind(this, notice)}
                            >
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
                                    onHide={this.hideNoticeSuccessTips}
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
    };

    closeRightUserPanel = () => {
        this.setState({
            curShowUserId: '',
            selectedLiIndex: null
        });
    };

    refreshSystemNotice = () => {
        this.setState({
            lastSystemNoticeId: '',
            showUpdateTip: false
        });
        setTimeout(() => {
            this.getSystemNotices();
        });
    };

    //展示更新提示
    renderUpdateTip = () => {
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
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };
    
    
    handlePopUpNotify = (checked) => {
        ajax.send({
            url: '/rest/base/v1/user/website/config/personnel',
            type: 'post',
            data: {
                is_open_pop_up_notify: checked
            }
        })
            .done(result => {
                this.setState({
                    isOpenPopUpNotify: checked
                });
                websiteConfig.is_open_pop_up_notify = checked;
                storageUtil.local.set('websiteConfig', JSON.stringify(websiteConfig));
            })
            .fail(err => {
                message.error(err);
            });
    };

    render() {
        let containerHeight = $(window).height() - LAYOUT.SUMMARY_H - LAYOUT.TOP;
        let customerOfCurUser = this.state.customerOfCurUser;
        let notifyTitle = this.state.isOpenPopUpNotify ?
            Intl.get('notification.pop.up.notify.title', '{status}弹窗通知', {status: Intl.get('common.app.status.close', '关闭')}) :
            Intl.get('notification.pop.up.notify.title', '{status}弹窗通知', {status: Intl.get('common.app.status.open', '开启')});
        let filterType = SYSTEM_NOTICE_TYPE_MAP;
        if (isKetaoOrganizaion()) {
            filterType = KETAO_SYSTEM_NOTICE_TYPE_MAP;
        }
        return (
            <div className="notification_system" data-tracename="系统消息列表">
                <TopNav>
                    <div className="notification-type-select btn-item">
                        <SelectFullWidth
                            minWidth={60}
                            value={this.state.selectedNoticeType}
                            onChange={this.handleTypeChange}
                        >
                            <Option value="">{Intl.get('user.online.all.type', '全部类型')}</Option>
                            {_.map(filterType, (key, val) => {
                                return (<Option value={val}>{key}</Option>);
                            })}
                        </SelectFullWidth>
                    </div>
                    <div className="notification-status-select btn-item">
                        <Select size="large" value={this.state.status} onChange={this.handleStatusChange}>
                            {STATUS_ARRAY.map((status) => {
                                return (<Option value={status.value} key={status.value}>{status.name}</Option>);
                            })}
                        </Select>
                    </div>
                    <div className="notify-setting">
                        <span className="notify-text">
                            {Intl.get('notification.pop.up.notify', '弹窗通知')}
                        </span>
                        <span className="notify" title={notifyTitle}>
                            <Switch
                                size="small"
                                checked={this.state.isOpenPopUpNotify}
                                onChange={this.handlePopUpNotify}
                            />
                        </span>
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
                        /> : null
                    }
                </RightPanel>
            </div>
        );
    }
}

module.exports = SystemNotification;
