/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require("../css/customer-notice-message.less");
import ContactItem from "./contact-item";
import {Tag, message, Icon, Button} from "antd";
import crmUtil from "MOD_DIR/crm/public/utils/crm-util";
import userData from "PUB_DIR/sources/user-data";
import notificationAjax from "MOD_DIR/notification/public/ajax/notification-ajax";
import Trace from "LIB_DIR/trace";
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
var TimeUtil = require("PUB_DIR/sources/utils/time-format-util");
class CustomerNoticeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerNoticeMessage: this.props.customerNoticeMessage,
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.customerNoticeMessage.id && nextProps.customerNoticeMessage.id !== this.state.customerNoticeMessage.id) {
            this.setState({
                customerNoticeMessage: nextProps.customerNoticeMessage
            })
        }
    };

    openUserDetail(userId) {
        this.props.openUserDetail(userId);
    };

    openCustomerDetail(customer_id) {
        this.props.openCustomerDetail(customer_id);
    };

    renderTagsContent(customerMessage) {
        return (
            <span>
                {customerMessage.customer_label ? (
                    <Tag
                        className={crmUtil.getCrmLabelCls(customerMessage.customer_label)}>
                        {customerMessage.customer_label}</Tag>) : null
                }
                {customerMessage.qualify_label ? (
                    <Tag className={crmUtil.getCrmLabelCls(customerMessage.qualify_label)}>
                        {customerMessage.qualify_label == 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                            customerMessage.qualify_label == 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ""}</Tag>) : null}
            </span>
        )
    };

    renderMessageContent(customerMessage) {
        let showList = [];
        if (_.isArray(customerMessage.detail) && customerMessage.detail.length > 3 && !customerMessage.showMore) {//超过三条时，只展示前三条
            showList = customerMessage.detail.slice(0, 3);
        } else {
            showList = customerMessage.detail;
        };
        return showList.map((item) => {
            return <div className="system-notice-item">
                <span className="system-notice-time">
                    {this.getRelativeTime(item.create_time)}
                    {this.getRelativeTime(item.create_time) ? moment(item.create_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : moment(item.create_time).format(oplateConsts.DATE_TIME_FORMAT)}
                </span>
                <span className="user-name"
                      onClick={this.openUserDetail.bind(this, item.user_id)}>{item.user_name}</span>
                {item.app_name ?
                    <span>{Intl.get("notification.system.login", "登录了") + item.app_name}</span> : ""}
            </div>
        })
    };

    setHandlingFlag(notice, flag) {
        notice.isHandling = flag;
        this.setState({customerNoticeMessage: this.state.customerNoticeMessage});
    };

    //处理系统消息
    handleSystemNotice(notice, e) {
        Trace.traceEvent(e, "处理系统消息");
        if (notice.isHandling) {
            return;
        }
        this.setHandlingFlag(notice, true);
        notificationAjax.handleSystemNotice(notice.id).then(result => {
            this.setHandlingFlag(notice, false);
            if (result) {//处理成功后，将该消息从未处理消息中删除
                var messageObj = {
                    noticeType: this.props.noticeType,
                    noticeId: notice.id
                };
                this.props.afterHandleMessage(messageObj);
            }
        }, errorMsg => {
            this.setHandlingFlag(notice, false);
            message.error(errorMsg || Intl.get("notification.system.handle.failed", "将系统消息设为已处理失败"));
        });
    };

    checkMore(notice) {
        notice.showMore = !notice.showMore;
        this.setState({customerNoticeMessage: this.state.customerNoticeMessage});
    };

    getRelativeTime(time) {
        var relativeTime = "";
        var todayStartTime = TimeStampUtil.getTodayTimeStamp().start_time;
        var todayEndTime = TimeStampUtil.getTodayTimeStamp().end_time;
        if (time >= todayStartTime && time <= todayEndTime) {
            relativeTime = Intl.get("user.time.today", "今天");
        } else if (time >= todayStartTime - 1 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime - 1 * oplateConsts.ONE_DAY_TIME_RANGE) {
            relativeTime = Intl.get("user.time.yesterday", "昨天");
        } else if (time >= todayStartTime - 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime - 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
            relativeTime = Intl.get("sales.frontpage.before.yesterday", "前天")
        }
        return relativeTime;
    };

    render() {
        var customerMessage = this.state.customerNoticeMessage;
        var customer_name = customerMessage.customer_name ? customerMessage.customer_name : customerMessage.name;
        var customer_id = customerMessage.customer_id ? customerMessage.customer_id : customerMessage.id;
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : "";//只可以处理自己的系统消息
        return (
            <div className="customer-notice-message-container">
                <div className="customer-notice-content">
                    <div className="customer-title">
                        <span className="customer-name" onClick={this.openCustomerDetail.bind(this, customer_id)}
                              data-tracename="打开客户详情">
                            {this.props.isRecentLoginCustomer ? this.renderTagsContent(customerMessage) : null}
                            {customer_name}
                        </span>
                        {
                            loginUserId === customerMessage.member_id ?
                                <Button type="primary" className="notice-handled-set"
                                        onClick={this.handleSystemNotice.bind(this, customerMessage)}>
                                    {Intl.get("notification.system.handled.set", "处理")}{customerMessage.isHandling ?
                                    <Icon type="loading"/> : null}
                                </Button> : null
                        }
                        {customerMessage.last_login_time ? <span
                            className="login-time">{moment(customerMessage.last_login_time).format(oplateConsts.DATE_TIME_FORMAT)}</span> : null}

                    </div>
                    {this.props.isRecentLoginCustomer ? null : <div className="customer-content">
                        {this.renderMessageContent(customerMessage)}
                        {customerMessage.detail.length > 3 ?
                            <p className="notice-detail-more" onClick={this.checkMore.bind(this, customerMessage)}>
                                {customerMessage.showMore ? Intl.get("common.app.status.close", "关闭") : Intl.get("notification.system.more", "展开全部")}
                            </p> : null}
                    </div>}
                </div>
                {this.props.isRecentLoginCustomer ?
                    <ContactItem contacts={customerMessage.contacts} callNumber={this.props.callNumber}
                                 errMsg={this.props.errMsg}/> : null}
            </div>
        )
    }
}

CustomerNoticeMessage.defaultProps = {
    noticeType: "",
    customerNoticeMessage: {},
    tableTitleTip: "",//table的标题
    isRecentLoginCustomer: false,
    openCustomerDetail: function () {

    },
    openUserDetail: function () {

    },
    afterHandleMessage: function () {

    }
};
export default CustomerNoticeMessage;
