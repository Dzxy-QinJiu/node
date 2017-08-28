import {Alert,message,Button} from "antd";
var LAYOUT = require("../utils/layout");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var NotificationActions = require("../action/notification.action");
var NotificationStore = require("../store/notification.store");
var NotificationUtil = require("../utils/notification.util");
var Spinner = require("../../../../components/spinner");
var immutable = require("immutable");
// 没有消息的提醒
var NoMoreDataTip = require("../../../../components/no_more_data_tip");

var CustomerNotification = React.createClass({
    getInitialState: function () {
        return NotificationStore.getState();
    },
    onStoreChange: function () {
        this.setState(NotificationStore.getState());
    },
    componentDidMount: function () {
        NotificationStore.listen(this.onStoreChange);
        this.loadMessageList();
        $(window).on("resize", this.onStoreChange);
    },
    componentWillUnmount: function () {
        NotificationStore.unlisten(this.onStoreChange);
        $(window).off("resize", this.onStoreChange);
    },
    componentDidUpdate: function (prevProps, prevState) {
        if (!immutable.is(prevState.notificationList, this.state.notificationList)) {
            GeminiScrollbar.scrollTo(this.refs.scrollWrap, 0);
        }
    },
    //消息列表的高度
    getMessageListHeight: function () {
        if (this.state.unreadNum) {
            //去掉全部标记为已读的高度
            return $(window).height() - LAYOUT.BOTTOM - LAYOUT.TOP - LAYOUT.FILTER_HEIGHT;
        } else {
            return $(window).height() - LAYOUT.BOTTOM - LAYOUT.TOP;
        }
    },
    //获取客户提醒出错
    renderMessageError: function () {
        var message = (
            <span>
                <ReactIntl.FormattedMessage
                    id="notification.customer.notification.failed.reload"
                    defaultMessage={`获取客户提醒列表失败，{reload}`}
                    values={{
                        'reload':<a href="javascript:void(0)" onClick={this.loadMessageList}>
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
                     id="notification.has.no.nitification.data.reload"
                     defaultMessage={`暂无客户提醒数据，{reload}`}
                     values={{
                        'reload':<a href="javascript:void(0)" onClick={this.loadMessageList}>
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
        NotificationActions.getCustomerMessageList({
            id: this.state.lastNotificationId,
            page_size: this.state.pageSize
        });
    },
    //渲染消息时间
    renderMessageDate: function (messageObj) {
        var timeTxt = NotificationUtil.formatTime(messageObj.date);
        return (
            <p>{timeTxt}</p>
        );
    },
    //渲染消息主题内容
    renderMessageBody: function (messageObj) {
        /**
         *
         {
              "message": "xx的账号xx在xx将到期，请及时联系客户",
              "date": 1466135390196,
          }

         {
              "message": "客户xxx在xxx添加提醒，xxxxxxx",
              "date": 1466135390196,
          }
         */
        return (
            <div className="message_body">
                {messageObj.message}
            </div>
        );
    },
    //渲染一条消息
    renderMessageItem: function (messageObj, idx) {
        return (
            <li key={idx}>
                {this.renderMessageBody(messageObj)}
                {this.renderMessageDate(messageObj)}
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
        NotificationActions.clearUnreadNum("customer", (result)=> {
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
        if (this.state.notificationListResult === 'loading' && !this.state.lastNotificationId) {
            return (<Spinner/>);
        }
        var containerHeight = this.getMessageListHeight();
        return (
            <div className="notification_customer">
                {
                    this.state.unreadNum ? (
                        <Button className="mark-all-read" type="ghost" onClick={this.markAllAsRead}>
                            {Intl.get("common.all.read", "全部标为已读")}
                        </Button>
                    ) : null
                }
                <div style={{height : containerHeight}}>
                    <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                                     listenScrollBottom={this.state.listenScrollBottom}
                                     itemCssSelector=".message_list>li">
                        {this.renderMessageList()}
                        <NoMoreDataTip
                            fontSize="12"
                            show={this.showNoMoreDataTip}
                        />
                    </GeminiScrollbar>
                </div>
                <div className="summary_info">
                    <ReactIntl.FormattedMessage
                        id="notification.total.customer.alert"
                        defaultMessage={`共{x}条客户提醒`}
                        values={{'x':this.state.notificationCount}}
                    />
                </div>
            </div>
        );
    }
});

module.exports = CustomerNotification;