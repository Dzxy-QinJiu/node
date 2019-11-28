/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require('../css/customer-notice-message.less');
import ContactItem from './contact-item';
import {Tag, message, Icon, Button} from 'antd';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import userData from 'PUB_DIR/sources/user-data';
import notificationAjax from 'MOD_DIR/notification/public/ajax/notification-ajax';
import Trace from 'LIB_DIR/trace';
import {getRelativeTime} from 'PUB_DIR/sources/utils/common-method-util';
import {ALL_LISTS_TYPE} from 'PUB_DIR/sources/utils/consts';
import CustomerLabel from 'CMP_DIR/customer_label';
class CustomerNoticeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerNoticeMessage: this.props.customerNoticeMessage,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.customerNoticeMessage.id && nextProps.customerNoticeMessage.id !== this.state.customerNoticeMessage.id) {
            this.setState({
                customerNoticeMessage: nextProps.customerNoticeMessage
            });
        }
    }

    openUserDetail(userId) {
        this.props.openUserDetail(userId);
    }

    openCustomerDetail(customer_id) {
        this.props.openCustomerDetail(customer_id);
    }

    renderTagsContent(customerMessage) {
        return (
            <span>
                <CustomerLabel label={customerMessage.qualify_label} />
                <CustomerLabel label={customerMessage.customer_label} />
                }
            </span>
        );
    }

    renderMessageContent(customerMessage) {
        let showList = [];
        if (_.isArray(customerMessage.detail) && customerMessage.detail.length > 3 && !customerMessage.showMore) {//超过三条时，只展示前三条
            showList = customerMessage.detail.slice(0, 3);
        } else {
            showList = customerMessage.detail;
        }
        return showList.map((item) => {
            let isLoginFailed = item.type === ALL_LISTS_TYPE.LOGIN_FAILED;
            return <div className="system-notice-item">
                <span className="system-notice-time">
                    {getRelativeTime(item.create_time)}
                    {getRelativeTime(item.create_time) ? moment(item.create_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : moment(item.create_time).format(oplateConsts.DATE_TIME_FORMAT)}
                </span>
                <span className="user-name"
                    onClick={this.openUserDetail.bind(this, item.user_id)}>{item.user_name}</span>
                {item.app_name ?
                    <span>{(isLoginFailed ? Intl.get('login.login', '登录') : Intl.get('notification.system.login', '登录了')) + item.app_name}</span> : ''}
                {isLoginFailed ? <span> ,{Intl.get('notification.login.password.error', '报密码或验证码错误')}</span> : null}
            </div>;
        });
    }

    setHandlingFlag(notice, flag) {
        notice.isHandling = flag;
        this.setState({customerNoticeMessage: this.state.customerNoticeMessage});
    }

    //处理系统消息
    handleSystemNotice(notice, e) {
        Trace.traceEvent(e, '处理系统消息');
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
            message.error(errorMsg || Intl.get('notification.system.handle.failed', '将系统消息设为已处理失败'));
        });
    }

    checkMore(notice) {
        notice.showMore = !notice.showMore;
        this.setState({customerNoticeMessage: this.state.customerNoticeMessage});
    }

    render() {
        var customerMessage = this.state.customerNoticeMessage;
        var customer_name = customerMessage.customer_name ? customerMessage.customer_name : customerMessage.name;
        var customer_id = customerMessage.customer_id ? customerMessage.customer_id : customerMessage.id;
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : '';//只可以处理自己的系统消息
        return (
            <div className="customer-notice-message-container customer-detail-item">
                <div className="customer-notice-content">
                    <div className="customer-title">
                        <span className="sale-home-customer-name"
                            onClick={this.openCustomerDetail.bind(this, customer_id)}
                            data-tracename="打开客户详情">
                            {this.props.isRecentLoginCustomer ? this.renderTagsContent(customerMessage) : null}
                            {customer_name}
                        </span>
                        {
                            loginUserId === customerMessage.member_id ?
                                <Button type="primary" className="notice-handled-set"
                                    onClick={this.handleSystemNotice.bind(this, customerMessage)}>
                                    {Intl.get('notification.system.handled.set', '处理')}{customerMessage.isHandling ?
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
                                {customerMessage.showMore ? Intl.get('common.app.status.close', '关闭') : Intl.get('notification.system.more', '展开全部')}
                            </p> : null}
                    </div>}
                </div>
                {_.isArray(customerMessage.contacts) && customerMessage.contacts.length ?
                    <ContactItem contacts={customerMessage.contacts} type='customer' id={customer_id} /> : null}
            </div>
        );
    }
}

CustomerNoticeMessage.defaultProps = {
    noticeType: '',
    customerNoticeMessage: {},
    isRecentLoginCustomer: false,
    openCustomerDetail: function() {

    },
    openUserDetail: function() {

    },
    afterHandleMessage: function() {

    }
};
export default CustomerNoticeMessage;
