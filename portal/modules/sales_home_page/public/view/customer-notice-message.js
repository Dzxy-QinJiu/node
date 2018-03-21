/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require("../css/customer-notice-message.less");
import {AntcTable} from "antc";
import ContactItem from "./contact-item";
import {Tag} from "antd";
import crmUtil from "MOD_DIR/crm/public/utils/crm-util";
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

    getListColumn() {
        var columns = [{
            title: Intl.get("common.app", "应用"),
            width: '240px',
            dataIndex: 'app_name',
        }, {
            title: this.props.tableTitleTip,
            render: (text, row, index) => {
                var newUserDetailData = _.values(_.groupBy(row.user_detail, (item) => {
                    return item.user_id;
                }));
                var userDetailData = [];
                for (var i = 0; i < newUserDetailData.length; i++) {
                    userDetailData.push({
                        user_id: newUserDetailData[i][0].user_id,
                        user_name: newUserDetailData[i][0].user_name,
                        login_detail: newUserDetailData[i]
                    })
                }
                return (
                    <div className="login-detail-container">
                        {_.map(userDetailData, (item) => {
                            return (
                                <div className="login-detail-item">
                                    <div className="login-detail-name">
                                        <a onClick={this.openUserDetail.bind(this, item.user_id)}
                                           data-tracename="打开用户详情">{item.user_name}</a>
                                    </div>
                                    <div className="login-detail-content">
                                        {_.map(item.login_detail, (loginItem) => {
                                            return (
                                                <div>
                                                    {moment(loginItem.create_time).format(oplateConsts.DATE_TIME_FORMAT)}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        },];
        return columns;
    }
    ;

    openCustomerDetail(customer_id) {
        this.props.openCustomerDetail(customer_id);
    };

    renderTagsContent(customerMessage) {
        return (
            <span>
                {customerMessage.customer_label ? (
                    <Tag
                        className={crmUtil.getCrmLabelCls(customerMessage.customer_label)}>
                        {customerMessage.customer_label.substr(0, 1)}</Tag>) : null
                }
                {customerMessage.qualify_label ? (
                    <Tag className={crmUtil.getCrmLabelCls(customerMessage.qualify_label)}>
                        {customerMessage.qualify_label == 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                            customerMessage.qualify_label == 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ""}</Tag>) : null}
            </span>
        )
    };

    render() {
        var message = this.state.customerNoticeMessage;
        var newContentData = _.values(_.groupBy(message.detail, (item) => {
            return item.app_id;
        }));
        var data = [];
        for (var i = 0; i < newContentData.length; i++) {
            data.push({
                app_id: newContentData[i][0].app_id,
                app_name: newContentData[i][0].app_name,
                user_detail: newContentData[i]
            })
        }
        var customer_name = message.customer_name ? message.customer_name : message.name;
        var customer_id = message.customer_id ? message.customer_id : message.id;
        return (
            <div className="customer-notice-message-container">
                <div className="customer-notice-content">
                    <div className="customer-title">
                        <a className="customer-name" onClick={this.openCustomerDetail.bind(this, customer_id)}
                           data-tracename="打开客户详情">
                            {this.props.isRecentLoginCustomer ? this.renderTagsContent(message) : null}
                            {customer_name}
                        </a>
                        {message.last_login_time ? <span
                            className="login-time">{moment(message.last_login_time).format(oplateConsts.DATE_TIME_FORMAT)}</span> : null}

                    </div>
                    {this.props.isRecentLoginCustomer ? null : <div className="customer-content">
                        <AntcTable dataSource={data}
                                   columns={this.getListColumn()}
                                   pagination={false}
                                   bordered/>
                    </div>}
                </div>
                <div>
                    {this.props.isRecentLoginCustomer ?
                        <ContactItem contacts={message.contacts} callNumber={this.props.callNumber}
                                     errMsg={this.props.errMsg}/> : null}
                </div>
            </div>
        )
    }
}

CustomerNoticeMessage.defaultProps = {
    customerNoticeMessage: {},
    tableTitleTip: "",//table的标题
    isRecentLoginCustomer: false,
    openCustomerDetail: function () {

    },
    openUserDetail: function () {

    }
};
export default CustomerNoticeMessage;
