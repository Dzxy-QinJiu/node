/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require("../css/customer-notice-message.less");
import {AntcTable} from "antc";
import ContactItem from "./contact-item";
import CrmRightPanel from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
class CustomerNoticeMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerNoticeMessage: this.props.customerNoticeMessage,
            curShowCustomerId: "",//展示客户详情的客户id
            curShowUserId: "",//展示用户详情的用户id
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情

        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.customerNoticeMessage.id && nextProps.customerNoticeMessage.id !== this.state.customerNoticeMessage.id) {
            this.setState({
                customerNoticeMessage: nextProps.customerNoticeMessage
            })
        }
    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false
        })
    };
    closeRightCustomerPanel = () => {
        this.setState({curShowCustomerId: ""});
    };
    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });

    };
    openCustomerDetail = (customer_id) => {
        if (this.state.curShowUserId) {
            this.closeRightUserPanel();
        }
        this.setState({curShowCustomerId: customer_id});
    };
    openUserDetail = (user_id) => {
        if (this.state.curShowCustomerId) {
            this.closeRightCustomerPanel();
        }
        this.setState({curShowUserId: user_id});
    };
    closeRightUserPanel= ()=> {
    this.setState({curShowUserId: ""});
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
                                        <a onClick={this.openUserDetail.bind(this, item.user_id)}>{item.user_name}</a>

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
                        <a className="customer-name" onClick={this.openCustomerDetail.bind(this, message.customer_id)}>
                            {message.customer_name}
                        </a>

                    </div>
                    {this.props.isRecentLoginCustomer ? null : <div className="customer-content">
                        <AntcTable dataSource={data}
                                   columns={this.getListColumn()}
                                   pagination={false}
                                   bordered/>
                    </div>}
                </div>
                {
                    this.state.curShowCustomerId ? <CrmRightPanel
                        currentId={this.state.curShowCustomerId}
                        showFlag={true}
                        hideRightPanel={this.closeRightCustomerPanel}
                        ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                        refreshCustomerList={function () {
                        }}
                    /> : null
                }
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={this.state.CustomerInfoOfCurrUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={this.state.CustomerInfoOfCurrUser.name}
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
        )
    }
}

CustomerNoticeMessage.defaultProps = {
    customerNoticeMessage: {},
    tableTitleTip: "",//table的标题
    isRecentLoginCustomer: false,

};
export default CustomerNoticeMessage;
