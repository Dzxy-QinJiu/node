import {Alert,Icon,Pagination,Select,message,Button} from "antd";
var LAYOUT = require("../utils/layout");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var NotificationActions = require("../action/notification.action");
var NotificationStore = require("../store/notification.store");
var NotificationUtil = require("../utils/notification.util");
var Spinner = require("../../../../components/spinner");
var SearchInput = require("../../../../components/searchInput");
var notificationEmitter = require("../../../../public/sources/utils/emitters").notificationEmitter;
var immutable = require("immutable");
// 没有消息的提醒
var NoMoreDataTip = require("../../../../components/no_more_data_tip");


//状态常量
var STATUS = {
    //未处理
    UNCONSUMED: 'false',
    //批准
    APPROVED: 'pass',
    //驳回
    REJECTED: 'reject',
    //撤销
    CANCEL: 'cancel'
};

//消息类型
var MSG_TYPES = {
    //申请消息
    APPLY: 'apply',
    //审批消息
    REPLY: 'reply'
};
//消息分类
let notificationType = [{key: "", value: Intl.get("notification.all.infor", "全部申请消息")},
    {key: "apply_user_official", value: Intl.get("notification.apply.user.official", "申请正式用户")},
    {key: "apply_app_official", value: Intl.get("notification.apply.app.official", "已有用户申请正式用户")},
    {key: "apply_user_trial", value: Intl.get("common.apply.user.trial", "申请试用用户")},
    {key: "apply_app_trial", value: Intl.get("common.apply.app.trial", "已有用户申请试用用户")},
    {key: "apply_grant_delay", value: Intl.get("common.apply.grant.delay", "用户申请延期")}];

//用户申请消息
var UserApplyView = React.createClass({
    //获取默认属性
    getDefaultProps: function () {
        return {
            messageObj: {}
        };
    },
    //渲染消息时间
    renderMessageDate: function (messageObj) {
        var timeTxt = NotificationUtil.formatTime(messageObj.date);
        return (
            <p>{timeTxt}</p>
        );
    },
    //渲染消息内容
    renderMessageBody: function (messageObj) {
        if (messageObj.relate_type == MSG_TYPES.APPLY) {
            return this.renderMessageUnconsumed(messageObj);
        }
        return this.renderMessageConsumed(messageObj);
    },
    //备注
    renderCommentBlock: function (messageObj, idx) {
        var comment = '';
        if (messageObj.relate_type == MSG_TYPES.APPLY) {
            comment = messageObj.message && messageObj.message.remark || '';
        } else {
            comment = messageObj.approval_comment || '';
        }
        if (!comment) {
            return null;
        }
        return (<div className="message-comment">
            <ReactIntl.FormattedMessage id="common.remark" defaultMessage="备注"/>：{comment} </div>);
    },
    //待审批类型的消息
    renderMessageUnconsumed: function (messageObj) {
        var commentBlock = this.renderCommentBlock(messageObj);//申请的备注
        var userBlock = this.renderUserBlock(messageObj);//申请的用户名
        var customerBlock = this.renderCustomerBlock(messageObj);//给哪个客户申请的用户
        let userType = this.renderUserType(messageObj);//用户类型：试用用户、正式用户
        return (
            <div className="message_body">
                <div className="message-title">{messageObj.message_topic || ""}</div>
                <div className="message-content">
                    <ReactIntl.FormattedMessage
                        id="notification.apply.for.customer"
                        defaultMessage={`{producer_name}给客户{customer}申请了{userType}{userBlock}`}
                        values={{
                            'producer_name':messageObj.producer_name || '',
                            'customer':customerBlock,
                            'userType':userType,
                            'userBlock':userBlock
                        }}
                    />
                </div>
                {commentBlock}
            </div>
        );
    },
    //用户类型
    renderUserType: function (messageObj) {
        if (_.isObject(messageObj) && _.isObject(messageObj.message)) {
            return messageObj.message.tag;
        }
        return " ";
    },
    //渲染用户名
    renderUserBlock: function (messageObj) {
        var message = messageObj.message || {};
        var user_names = message.user_names || ('"' + message.user_name + '"') || "";
        if (_.isEmpty(user_names)) {
            return null;
        }
        if (/^\[.*\]$/.test(user_names)) {
            user_names = user_names.substring(1, user_names.length - 1);
        }
        return user_names;
    },
    //已审批类型的消息
    renderMessageConsumed: function (messageObj) {
        var commentBlock = this.renderCommentBlock(messageObj);
        var userBlock = this.renderUserBlock(messageObj);
        var approvalText = "";
        if (messageObj.approval_state == STATUS.APPROVED) {
            approvalText = Intl.get("notification.approved", "批准");
        } else if (messageObj.approval_state == STATUS.REJECTED) {
            approvalText = Intl.get("common.apply.reject", "驳回");
        } else if (messageObj.approval_state == STATUS.CANCEL) {
            approvalText = Intl.get("user.apply.detail.modal.ok", "撤销");
        }
        var customerBlock = this.renderCustomerBlock(messageObj);
        let userType = this.renderUserType(messageObj);//用户类型：试用用户、正式用户
        return (
            <div className="message_body">
                <div className="message-title">{messageObj.message_topic || ""} ({approvalText})</div>
                <div className="message-content">
                    <ReactIntl.FormattedMessage
                        id="notification.approval.for.producer"
                        defaultMessage={`{approval_person}{approvalText}了{producer_name}给客户{customerBlock}申请的{userType} {userBlock}`}
                        values={{
                           'approval_person':messageObj.approval_person || '',
                           'approvalText':approvalText,
                           'producer_name':messageObj.approval_state == STATUS.CANCEL?'':messageObj.producer_name || '',
                           'customerBlock':customerBlock,
                           'userType':userType,
                           'userBlock':userBlock
                        }}
                    />
                </div>
                {commentBlock}
            </div>
        );
    },
    //客户区块
    renderCustomerBlock: function (messageObj) {
        if (messageObj.message && messageObj.message.customer_name) {
            return messageObj.message.customer_name
        }
        return null;
    },
    render: function () {
        var messageObj = this.props.messageObj;
        return (
            <div>
                {this.renderMessageBody(messageObj)}
                {this.renderMessageDate(messageObj)}
            </div>
        );

    }
});

var ApplyForNotification = React.createClass({
    getInitialState: function () {
        return {
            noticeType: "",//消息类型
            searchContent: "",
            showUpdateTip: false,//是否展示更新tip
            ...NotificationStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(NotificationStore.getState());
    },
    componentDidMount: function () {
        NotificationStore.listen(this.onStoreChange);
        //新的申请审批消息的监听
        notificationEmitter.on(notificationEmitter.APPLY_UPDATED, this.pushDataListener);
        this.loadMessageList();
        $(window).on("resize", this.onStoreChange);
    },
    componentWillUnmount: function () {
        NotificationStore.unlisten(this.onStoreChange);
        //销毁时，删除申请审批消息监听器
        notificationEmitter.removeListener(notificationEmitter.APPLY_UPDATED, this.pushDataListener);
        $(window).off("resize", this.onStoreChange);
    },
    //监听推送数据
    pushDataListener: function (data) {
        //有数据，将是否展示更新tip
        if (data) {
            this.setState({showUpdateTip: true});
        }
    },
    refreshPage: function () {
        NotificationActions.resetLastNotificationId();
        setTimeout(()=> {
            this.loadMessageList();
        });
    },
    //展示更新提示
    getUpdateTip: function () {
        if (this.state.showUpdateTip) {
            return (<div className="apply-notice-update">
                <ReactIntl.FormattedMessage
                    id="notification.update"
                    defaultMessage={`数据已更新，是否{refresh}`}
                    values={{
                    'refresh': <a href="javascript:void(0)" onClick={this.refreshPage}>
                                <ReactIntl.FormattedMessage id="common.refresh" defaultMessage="刷新"/>
                               </a>
                            }}
                />
            </div> );
        }
        return null;
    },
    //消息列表的高度
    getMessageListHeight: function () {
        return $(window).height() - LAYOUT.BOTTOM - LAYOUT.TOP - LAYOUT.FILTER_HEIGHT;
    },
    //获取申请消息出错
    renderMessageError: function () {
        var message = (
            <span>
                <ReactIntl.FormattedMessage
                    id="notification.get.apply.list.failed.reload"
                    defaultMessage={`获取申请列表失败,{reload}`}
                    values={{
                        'reload': <a href="javascript:void(0)" onClick={this.loadMessageList}>
                                     <ReactIntl.FormattedMessage id="common.get.again" defaultMessage="重新获取"/>
                                 </a>
                            }}
                />
            </span>
        );
        return (<Alert
            message={message}
            type="error"
            showIcon={true}
        />);
    },
    renderMessageNodata: function () {
        var message = (
            <span>
                 <ReactIntl.FormattedMessage
                     id="notification.has.no.apply.data.reload"
                     defaultMessage={`暂无申请消息数据,{reload}`}
                     values={{
                        'reload': <a href="javascript:void(0)" onClick={this.loadMessageList}>
                                     <ReactIntl.FormattedMessage id="common.get.again" defaultMessage="重新获取"/>
                                  </a>
                            }}
                 />
            </span>
        );
        return (<Alert
            message={message}
            type="info"
            showIcon={true}
        />);
    },
    //获取消息列表
    loadMessageList: function () {
        NotificationActions.getApplyForMessageList({
            id: this.state.lastNotificationId,
            page_size: this.state.pageSize,
            notice_type: this.state.noticeType,
            keyword: this.state.searchContent
        }, ()=> {
            if (!this.state.lastNotificationId) {
                //查看第一次加载的消息后去掉刷新数据的提示
                this.setState({
                    showUpdateTip: false
                });
            }
        });
    },

    //渲染一条消息
    renderMessageItem: function (messageObj, idx) {
        var ItemView;
        switch (messageObj.relate_type) {
            case MSG_TYPES.APPLY:
            case MSG_TYPES.REPLY:
                ItemView = (<UserApplyView messageObj={messageObj}/>);
                break;
            default:
                ItemView = null;
        }
        return (
            <li key={idx}>
                {ItemView}
            </li>
        );
    },
    //渲染消息列表
    renderMessageList: function () {
        if (this.state.notificationListResult === 'error') {
            return this.renderMessageError();
        }
        if (this.state.notificationCount <= 0) {
            return this.renderMessageNodata();
        }
        var _this = this;
        return (
            <ul className="list-unstyled message_list">
                {
                    _this.state.notificationList.map(function (messageObj, idx) {
                        return _this.renderMessageItem(messageObj, idx);
                    })
                }
            </ul>
        );
    },

    handleSelectChange: function (value) {
        NotificationActions.handleSelectChange();
        GeminiScrollbar.scrollTo(this.refs.scrollWrap, 0);
        this.setState({noticeType: value}, function () {
            //获取分类列表
            this.loadMessageList();
        });
    },

    searchEvent: function (searchContent) {
        NotificationActions.searchEvent();
        GeminiScrollbar.scrollTo(this.refs.scrollWrap, 0);
        searchContent = searchContent ?searchContent.trim() : '';
        if (searchContent != this.state.searchContent) {
            //搜索内容的设置
            this.setState({
                searchContent: searchContent
            }, function () {
                //根据搜索内容获取消息列表
                this.loadMessageList();
            });
        }
    },
    //下拉加载
    handleScrollBarBottom: function () {
        var currListLength = _.isArray(this.state.notificationList) ? this.state.notificationList.length : 0;
        // 判断加载的条件
        if (currListLength <= this.state.notificationCount) {
            this.loadMessageList();
        }
    },

    //是否显示没有更多数据了
    showNoMoreDataTip: function () {
        return !this.state.notificationListResult &&
            this.state.notificationList.length >= 10 && !this.state.listenScrollBottom;
    },
    //全部标为已读的处理
    markAllAsRead: function () {
        //清除未读数
        NotificationActions.clearUnreadNum("apply", (result)=> {
            if (result.error) {
                //全部标为已读操作失败
                message.error(result.clearTip);
            } else {
                //全部标为已读操作成功
                message.success(result.clearTip);
            }
        });
    },
    render: function () {
        //渲染loading状态
        let containerHeight = this.getMessageListHeight();
        return (
            <div className="notification_applyfor">
                <div className="notification-filter-div">
                    <Select size="large" value={this.state.noticeType} onChange={this.handleSelectChange}>
                        {notificationType.map(notification=> <Option
                            value={notification.key}>{notification.value}</Option>)}
                    </Select>
                    <div className="search-notification-container">
                        <SearchInput searchPlaceHolder={Intl.get("notification.search.placeholder", "审批人/申请人/客户/用户/应用")}
                                     searchEvent={this.searchEvent}/>
                    </div>
                    {this.state.unreadNum ? (
                        <Button className="mark-all-read" type="ghost" onClick={this.markAllAsRead}>
                            {Intl.get("common.all.read", "全部标为已读")}
                        </Button>) : null}
                    {this.getUpdateTip()}
                </div>
                {this.state.notificationListResult === 'loading' && !this.state.lastNotificationId ? (
                    <Spinner/>) : (<div className="notification_apply_message">
                        <div style={{height : containerHeight}} ref="scrollWrap">
                            <GeminiScrollbar
                                handleScrollBottom={this.handleScrollBarBottom}
                                listenScrollBottom={this.state.listenScrollBottom}
                                itemCssSelector=".message_list>li"
                            >
                                {this.renderMessageList()}
                                <NoMoreDataTip
                                    fontSize="12"
                                    show={this.showNoMoreDataTip}
                                />
                            </GeminiScrollbar>
                        </div>
                        <div className="summary_info">
                            <ReactIntl.FormattedMessage
                                id="notification.total.info"
                                defaultMessage={`共{x}条消息`}
                                values={{
                                     'x':this.state.notificationCount
                                     }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }
});

module.exports = ApplyForNotification;