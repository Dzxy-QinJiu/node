/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-insterest-column.less';
import classNames from 'classnames';
import {Alert, Icon, Button} from 'antd';
import {STATUS} from 'PUB_DIR/sources/utils/consts';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
// 没有消息的提醒
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import userData from 'PUB_DIR/sources/user-data';
import AlertTimer from 'CMP_DIR/alert-timer';
import Trace from 'LIB_DIR/trace';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
import notificationAjax from 'MOD_DIR/notification/public/ajax/notification-ajax';
import ColumnItem from './column-item';
import {getColumnHeight} from './common-util';
import NoDataIntro from 'CMP_DIR/no-data-intro';
class MyInsterestColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //用来下拉加载的id
            lastSystemNoticeId: '',
            isLoadingSystemNotices: false,
            loadSystemNoticesErrorMsg: '',
            systemNotices: [],
            totalSize: 0,
        };
    }

    componentDidMount() {
        this.getMyInsterestSystemNotice();
    }

    getMyInsterestSystemNotice() {
        let queryObj = {
            notice_type: 'concerCustomerLogin',//关注客户登录系统通知
            page_size: 20,
            id: this.state.lastSystemNoticeId//用来下拉加载的id
        };
        this.setState({isLoadingSystemNotices: true});
        notificationAjax.getSystemNotices(queryObj, STATUS.UNHANDLED).then(result => {
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
    }

    //下拉加载
    handleScrollBarBottom = () => {
        if (this.state.totalSize > this.state.systemNotices.length) {
            this.getMyInsterestSystemNotice();
        }
    };

    renderInterestContent() {
        return (
            <div className='my-insterest-content' style={{height: getColumnHeight()}}>
                <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                    itemCssSelector=".my-insterest-content .system_message_list >li">
                    {this.renderNoticeList()}
                </GeminiScrollbar>
            </div>);
    }

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.isLoadingSystemNotices &&
            this.state.systemNotices.length >= 10 && !this.state.listenScrollBottom;
    };


    renderNoticeList = () => {
        let systemNotices = this.state.systemNotices;
        if (this.state.isLoadingSystemNotices && !this.state.lastSystemNoticeId) {//等待状态
            return <Spinner/>;
        } else if (_.isArray(systemNotices) && systemNotices.length) {//系统消息列表
            let customerOfCurUser = this.state.customerOfCurUser;
            return (<div>
                <ul className="system_message_list">
                    {_.map(this.state.systemNotices, (notice, idx) => {
                        return this.renderUnHandledNotice(notice, idx);
                    })}
                </ul>
                <NoMoreDataTip
                    fontSize="12"
                    show={this.showNoMoreDataTip}
                    message={Intl.get('common.no.more.system.message', '没有更多系统消息了')}
                />
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
                {
                    this.state.curShowUserId ?
                        <RightPanel
                            className="app_user_manage_rightpanel white-space-nowrap right-pannel-default right-panel detail-v3-panel"
                            showFlag={this.state.curShowUserId}>
                            <UserDetail userId={this.state.curShowUserId}
                                closeRightPanel={this.closeRightUserPanel}/>
                        </RightPanel>
                        : null
                }
            </div>);
        } else if (this.state.loadSystemNoticesErrorMsg) {//错误提示
            return (
                <NoDataIntro
                    noDataTip={this.state.loadSystemNoticesErrorMsg}
                />);
        } else {//暂无数据
            return (
                <NoDataIntro
                    noDataTip={Intl.get('common.no.data', '暂无数据')}
                />);
        }
    };
    closeRightCustomerPanel = () => {
        this.setState({
            curShowCustomerId: '',
            selectedLiIndex: null
        });
    };

    openUserDetail = (user_id, idx) => {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        this.setState({
            curShowUserId: user_id,
            selectedLiIndex: idx
        });
    };
    closeRightUserPanel = () => {
        this.setState({
            curShowUserId: '',
            selectedLiIndex: null
        });
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

    renderUnHandledNoticeContent = (notice, idx) => {
        //最后一条关注客户的登录信息
        let showItem = {};
        const detailLength = _.get(notice, 'detail.length');
        if (detailLength) {
            notice.detail = _.sortBy(notice.detail, 'creat_time');
            showItem = _.first(notice.detail);
        }
        let titleTip = _.get(showItem, 'user_name', '');
        if (showItem.app_name) {
            titleTip += Intl.get('notification.system.login', '登录了') + showItem.app_name;
        }
        return (
            <div className="system-notice-item"
                title={titleTip}>
                < span className="system-notice-time">
                    {TimeUtil.transTimeFormat(showItem.create_time)}
                </span>
                <a onClick={this.openUserDetail.bind(this, showItem.user_id, idx)}>{showItem.user_name}</a>
                {showItem.app_name ?
                    <span>{Intl.get('notification.system.login', '登录了') + showItem.app_name}</span> : ''}
            </div>);
    };

    setHandlingFlag = (notice, flag) => {
        _.some(this.state.systemNotices, item => {
            if (item.id === notice.id) {
                item.isHandling = flag;
            }
        });
        this.setState({systemNotices: this.state.systemNotices});
    };
    //未处理的系统消息
    renderUnHandledNotice = (notice, idx) => {
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : '';//只可以处理自己的系统消息
        let unhandleNoticeLiItemClass = classNames({
            'system-notice-unhandled-item': true,
            'select-li-item': idx === this.state.selectedLiIndex,
        });
        return (
            <li key={idx} className={unhandleNoticeLiItemClass}>
                <div className="system-notice-title">
                    <div className="customer-name" title={notice.customer_name}
                        onClick={this.openCustomerDetail.bind(this, notice.customer_id, idx)}>
                        <i className='iconfont icon-concern-customer-login'/>{notice.customer_name}
                    </div>
                </div>
                <div className="system-notice-content">
                    {this.renderUnHandledNoticeContent(notice, idx)}
                    <div className='notice-handle-wrap'>
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
                </div>
            </li>
        );
    };

    render() {
        return (
            <ColumnItem contianerClass='my-insterest-wrap'
                title={Intl.get('home.page.my.interest', '我的关注')}
                content={this.renderInterestContent()}
                width='25%'
            />);
    }
}
export default MyInsterestColumn;