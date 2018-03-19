/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require("../css/customer-notice-message.less");
import {AntcTable} from "antc";
import ContactItem from "./contact-item";
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
                                        {item.user_name}
                                    </div>
                                    <div className="login-detail-content">
                                        {   _.map(item.login_detail, (loginItem) => {
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
        return (
            <div className="customer-notice-message-container">
                <div className="customer-notice-content">
                    <div className="customer-title">
                        {message.customer_name}
                    </div>
                    {this.props.isRecentLoginCustomer ? null : <div className="customer-content">
                        <AntcTable dataSource={data}
                                   columns={this.getListColumn()}
                                   pagination={false}
                                   bordered/>
                    </div>}
                </div>
            </div>
        )
    }
}

CustomerNoticeMessage.defaultProps = {
    customerNoticeMessage: {},
    tableTitleTip: "",//table的标题
    isRecentLoginCustomer: false,

};
export default CustomerNoticeMessage;
