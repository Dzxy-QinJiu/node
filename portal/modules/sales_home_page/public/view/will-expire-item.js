/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/16.
 */
require("../css/will-expire-customer.less");
import contactItem from "./contact-item";
import CrmRightPanel from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
class WillExpireItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expireItem: this.props.expireItem,
            curShowCustomerId: "",//展示客户详情的客户id
            curShowUserId: "",//展示用户详情的用户id
            isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
            CustomerInfoOfCurrUser: {}//当前展示用户所属客户的详情
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.expireItem.customer_id && nextProps.expireItem.customer_id !== this.state.expireItem.customer_id) {
            this.setState({
                expireItem: nextProps.expireItem
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

    render() {
        var expireItem = this.state.expireItem;
        return (
            <div className="will-expire-container">
                <div className="will-customer-title">
                    <a className="customer-name" onClick={this.openCustomerDetail.bind(this, expireItem.customer_id)}>
                        {expireItem.customer_name}
                    </a>
                </div>
                <div className="will-customer-content">
                    {_.map(expireItem.app_list, (item) => {
                        return (
                            <div className="app-item">
                                <div className="pull-left customer-name">
                                    {item.app_name}
                                </div>
                                <div className="pull-left delay-time">
                                    {moment(item.end_time).format(oplateConsts.DATE_FORMAT)}
                                    {this.props.willExpiredTip}
                                    试用到期停用
                                </div>
                            </div>
                        )
                    })}
                </div>
                <contactItem
                    contactDetail= {"yyy"}
                />
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
            </div>
        )
    }
}
WillExpireItem.defaultProps = {
    expireItem: {},
    willExpiredTip:""

};
export default WillExpireItem;