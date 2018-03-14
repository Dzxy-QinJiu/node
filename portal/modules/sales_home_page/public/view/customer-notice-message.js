/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/13.
 */
var CustomerNoticeMessageStore = require("../store/customer-notice-message-store");
var CustomerNoticeMessageAction = require("../action/customer-notice-message-actions");
//系统消息对应的几种类型
import {SYSTEM_NOTICE_TYPE_MAP, SYSTEM_NOTICE_TYPES, STATUS} from "PUB_DIR/sources/utils/consts"
import userData from "PUB_DIR/sources/user-data";
import {Icon, message} from "antd";
import Trace from "LIB_DIR/trace";
var salesHomeAjax = require("../ajax/sales-home-ajax");
class CustomerNoticeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notice: this.props.curCustomer,
            ...CustomerNoticeMessageStore.getState()
        };
        this.onStoreChange = this.onStoreChange.bind(this);
    };

    componentDidMount() {
        CustomerNoticeMessageStore.listen(this.onStoreChange);
    };

    onStoreChange = () => {
        this.setState(CustomerNoticeMessageStore.getState());
    };

    componentWillUnmount() {
        CustomerNoticeMessageStore.unlisten(this.onStoreChange);
    };

    componentWillReceiveProps(nextProps) {
        if ((nextProps.curCustomer && nextProps.curCustomer.customer_id !== this.state.notice.customer_id)) {
            this.setState({
                notice: nextProps.curCustomer,
            });
        }
    };

    openUserDetail = (user_id) => {
        // if (this.state.curShowCustomerId) {
        //     this.closeRightCustomerPanel();
        // }
        // this.setState({curShowUserId: user_id});
    };

    renderUnHandledNoticeContent(notice) {
        let showList = [];
        if (_.isArray(notice.detail) && notice.detail.length > 3 && !notice.showMore) {//超过三条时，只展示前三条
            showList = notice.detail.slice(0, 3);
        } else {
            showList = notice.detail
        }
        return showList.map((item) => {
            //是否是异地登录的类型
            let isOffsetLogin = (item.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && item.content);
            return <div className="system-notice-item">
                <a onClick={this.openUserDetail.bind(this, item.user_id)}>{item.user_name}</a>
                {isOffsetLogin ? (Intl.get("notification.system.on", "在") + item.content.current_location) : ""}
                {item.app_name ?
                    <span>{Intl.get("notification.system.login", "登录了") + item.app_name}</span> : ""}
                <span
                    className="system-notice-time">{moment(item.create_time).format("YYYY-MM-DD hh:mm:ss")}</span>
            </div>
        })
    };

    checkMore = () => {
        this.state.notice.showMore = !this.state.notice.showMore;
        this.setState({
            notice: this.state.notice
        });
    };
    //处理系统消息
    handleSystemNotice = (notice, e) => {
        Trace.traceEvent(e, "处理系统消息");
        if (notice.isHandling) {
            return;
        }
        this.setHandlingFlag(notice, true);
        salesHomeAjax.handleSystemNotice(notice.id).then(result => {
            this.setHandlingFlag(notice, false);
            if (result) {//处理成功后，将该消息的状态改成已处理
                this.state.notice.hasHandled = true;

            }
        }, errorMsg => {
            this.setHandlingFlag(notice, false);
            message.error(errorMsg || Intl.get("notification.system.handle.failed", "将系统消息设为已处理失败"));
        });
    };

    setHandlingFlag(notice, flag) {
        this.state.notice.isHandling = flag;
        this.setState({
            notice: this.state.notice
        });
    };

    renderNoticeList() {
        var notice = this.state.notice;
        let loginUser = userData.getUserData();
        let loginUserId = loginUser ? loginUser.user_id : "";//只可以处理自己的系统消息
        return (
            <div className="system-notice-content">
                {this.renderUnHandledNoticeContent(notice)}
                {notice.detail.length > 3 ?
                    <a className="notice-detail-more" onClick={this.checkMore.bind(this, notice)}>
                        {notice.showMore ? Intl.get("common.app.status.close", "关闭") : Intl.get("notification.system.more", "更多")}
                    </a> : null}
                {notice.detail.length > 3 && loginUserId === notice.member_id ?
                    <span className="notice-split-line">|</span> : ""}
                {
                    loginUserId === notice.member_id && notice.hasHandled ?
                        <a className="notice-handled-set" onClick={this.handleSystemNotice.bind(this, notice)}>
                            {Intl.get("notification.system.handled.set", "处理")}{notice.isHandling ?
                            <Icon type="loading"/> : null}
                        </a> : notice.hasHandled ? <span>{Intl.get("notification.system.handled", "已处理")}</span> : null
                }
            </div>
        )

    };

    render() {
        return (
            <div className="customer-notice-message-wrap">
                {this.renderNoticeList()}
            </div>
        )
    }
}
export default CustomerNoticeMessage;