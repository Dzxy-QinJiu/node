/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/28.
 */
var userData = require("../../../../public/sources/user-data");
var hasPrivilege = require("CMP_DIR/privilege/checker").hasPrivilege;
var clueCustomerAction = require("../action/clue-customer-action");
var SalesSelectField = require("MOD_DIR/crm/public/views/basic_data/sales-select-field");
import {Icon, Alert} from "antd";
import CustomerSuggest from 'MOD_DIR/app_user_manage/public/views/customer_suggest/customer_suggest';
import AlertTimer from 'CMP_DIR/alert-timer';
const RELATEAUTHS = {
    "RELATEALL": "CRM_MANAGER_CUSTOMER_CLUE_ID",
    "RELATESELF": "CRM_USER_CUSTOMER_CLUE_ID"
};
var crmAjax = require("MOD_DIR/crm/public/ajax");
import CrmRightPanel from 'MOD_DIR/crm/public/views/crm-right-panel';
import AppUserManage from "MOD_DIR/app_user_manage/public";
import {RightPanel}  from "CMP_DIR/rightPanel";
class AssignClueAndSelectCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curClueDetail: this.props.curClueDetail,//展示线索的详情
            displayType: "text",//所绑定的客户是在展示状态 edit表示在编辑状态
            submitType: "",//提交后的状态
            isShowCustomerError: false,//是否展示出错
            customer_id: "",//将要关联客户的id
            customer_name: "",//将要关联客户的名字
            relatedCustomer: {},//已经关联上的客户的详情
            relatedCustomerName: "",//已经关联上的客户名称
            relatedCustomerId: "",//已经关联上的客户的id
            error_message: "",//关联客户失败后的信息
            curShowCustomerId: "",
            isShowCustomerUserListPanel: false,
            CustomerInfoOfCurrUser: {},
            //是否显示客户名后面的对号和叉号
            ShowUpdateOrClose : true
        }
    };
    //是否是销售领导
    isSalesManager() {
        return userData.isSalesManager()
    };
    componentDidMount(){
        if (this.state.curClueDetail.id){
            this.queryCustomerByClueId(this.state.curClueDetail.id);
        }
    }
    //根据线索的id查询该线索关联的客户
    queryCustomerByClueId(currentId) {
        if (currentId) {
            crmAjax.queryCustomer({customer_clue_id: currentId}, 1, 1).then((data) => {
                if (data && _.isArray(data.result)) {
                    if (data.result.length) {
                        this.setState({
                            relatedCustomer: data.result[0],
                            relatedCustomerName:data.result[0].name,
                            relatedCustomerId:data.result[0].id
                        });
                    } else {
                        this.setState({
                            relatedCustomer: {},
                            relatedCustomerName:"",
                            relatedCustomerId:""
                        });
                    }
                }
            }, () => {
                this.setState({
                    relatedCustomer: {},
                    relatedCustomerName:"",
                    relatedCustomerId:""
                });
            });
        }
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.curClueDetail.id !== nextProps.curClueDetail.id) {
            this.queryCustomerByClueId(nextProps.curClueDetail.id);
            this.setState({
                curClueDetail: nextProps.curClueDetail
            })
        }
    };

    //把线索客户分配给销售
    distributeCustomerToSale = (submitObj) => {
        var updateObj = {
            "customer_id": submitObj.id,
            "sale_id": submitObj.user_id,
            "sale_name": submitObj.user_name,
            "team_name": submitObj.sales_team,
            "team_id": submitObj.sales_team_id,
        };
        clueCustomerAction.distributeCluecustomerToSale(updateObj, () => {
            clueCustomerAction.afterEditCustomerDetail({
                "user_name": submitObj.user_name,
                "user_id": submitObj.user_id,
                "sales_team": submitObj.sales_team,
                "sales_team_id": submitObj.sales_team_id
            });
            //把分配线索客户设置为text格式
            this.refs.distribute.changeDisplayType("text");
        });
    };
    //客户下拉框中选择客户后
    onCustomerChoosen = (info) => {
        var customer_id = info && info.customer && info.customer.id || '';
        var customer_name = info && info.customer && info.customer.name || '';
        if (customer_id) {
            this.setState({
                customer_id: customer_id,
                customer_name: customer_name,
            });
        }
    };
   //是否显示对号和叉号
    isShowUpdateOrClose = (flag) =>{
        this.setState({
            ShowUpdateOrClose: flag
        })
    };
    hideCustomerError = () => {
        this.setState({
            isShowCustomerError: false
        })
    };
    //搜索客户的下拉框
    renderCustomerBlock() {
        return (
            <div className="select_text_wrap">
                <div className="pull-left form-item-content">
                    <CustomerSuggest
                        customer_id={this.state.relatedCustomerId}
                        customer_name={this.state.relatedCustomerName}
                        keyword={this.state.relatedCustomerName}
                        required={false}
                        show_error={this.state.isShowCustomerError}
                        onCustomerChoosen={this.onCustomerChoosen}
                        hideCustomerError={this.hideCustomerError}
                        isShowUpdateOrClose={this.isShowUpdateOrClose}
                    />
                </div>
            </div>
        );
    };

    //提交关联数据
    submit() {
        if (this.state.submitType === 'loading') {
            return;
        }
        //要提交的数据
        var submitObj = {
            //线索的id
            customer_clue_id: this.state.curClueDetail.id,
            //将要关联的客户id
            id: this.state.customer_id,
            //线索的创建时间
            customer_clue_start_time: this.state.curClueDetail.start_time
        };
        var _this = this;
        this.setState({
            submitType: 'loading'
        });
        var type = "self";
        if (hasPrivilege("CRM_MANAGER_CUSTOMER_CLUE_ID")) {
            type = "all"
        }
        $.ajax({
            url: '/rest/relate_clue_and_customer/' + type,
            dataType: 'json',
            contentType: 'application/json',
            type: 'put',
            data: JSON.stringify(submitObj),
            success: function (bool) {
                _this.setState({
                    error_message: '',
                    submitType: 'success',
                    relatedCustomerName: _this.state.customer_name,
                    relatedCustomerId: _this.state.customer_id
                });
            },
            error: function (xhr) {
                _this.setState({
                    submitType: 'error',
                    relatedCustomerName:"",
                    error_message: xhr.responseJSON || Intl.get("common.edit.failed", "修改失败")
                });
            }
        });
    };
    //渲染提示信息
    renderIndicator() {
        //提交中的状态
        if (this.state.submitType === 'loading') {
            return (<Icon type="loading"/>);
        }
        var _this = this;
        var onSuccessHide = function () {
            _this.setState({
                submitType: '',
                displayType: 'text'
            });
        };
        if (this.state.submitType === 'success') {
            return <AlertTimer message={Intl.get("user.edit.success", "修改成功")} type="success" onHide={onSuccessHide} showIcon/>;
        }
        if (this.state.submitType === 'error') {
            return <Alert message={this.state.error_message} type="error" showIcon/>;
        }
    };
    //修改客户是编辑还是展示的状态
    changeDisplayCustomerType(type) {
        if (this.state.submitType === 'loading') {
            return;
        }
        this.setState({
            displayType: type
        });
        if (type === 'text') {
            this.setState({
                error_message: '',
                submitType: '',
                show_customer_error: false,
                customer_id: this.props.customer_id,
                customer_name: this.props.customer_name
            });
            this.onCustomerChoosen();
        }
    };
    //渲染客户的编辑状态
    renderEditCustomer() {
        const showBtnBool = !/success/.test(this.state.submitType) && this.state.ShowUpdateOrClose;
        return (
            <div className="" ref="wrap">
                {this.renderCustomerBlock()}
                {showBtnBool ? <span className="iconfont icon-choose" onClick={this.submit.bind(this)}></span> : null}
                {showBtnBool ? <span className="iconfont icon-close"
                                     onClick={this.changeDisplayCustomerType.bind(this, "text")}></span> : null}
                {this.renderIndicator()}
            </div>
        );
    };

    clickShowCustomerDetail = (customerId) => {
        this.setState({
            curShowCustomerId: customerId
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
    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false
        })
    };
    renderTextCustomer() {
        //是否有修改线索所属客户的权利
        var canEdit = hasPrivilege("CRM_MANAGER_CUSTOMER_CLUE_ID") || hasPrivilege("CRM_USER_CUSTOMER_CLUE_ID");
        return (
            <div className="user-basic-edit-field">
                <span className="customer-name" onClick={this.clickShowCustomerDetail.bind(this, this.state.relatedCustomerId)}>{this.state.relatedCustomerName}</span>
                {
                    canEdit ? <i className="iconfont icon-update"
                                 onClick={this.changeDisplayCustomerType.bind(this, "select")}></i> : null
                }
            </div>
        )

    };

    render() {
        var curClueDetail = this.state.curClueDetail;
        return (
            <div>
                <div className="sales-assign-wrap">
                    <h5>{Intl.get("cluecustomer.trace.person", "跟进人")}</h5>
                    <div className="sales-assign-content">
                        <SalesSelectField
                            ref="distribute"
                            enableEdit={(hasPrivilege("CLUECUSTOMER_DISTRIBUTE_MANAGER") || (hasPrivilege("CLUECUSTOMER_DISTRIBUTE_USER") && this.isSalesManager())) ? true : false}
                            isMerge={true}
                            updateMergeCustomer={this.distributeCustomerToSale}
                            customerId={curClueDetail.id}
                            userName={curClueDetail.user_name}
                            userId={curClueDetail.user_id}
                            salesTeam={curClueDetail.sales_team}
                            salesTeamId={curClueDetail.sales_team_id}
                            hideSalesRole={true}
                        />
                    </div>
                </div>
                <div className="associate-customer-wrap">
                    <h5>{Intl.get("clue.customer.associate.customer", "关联客户")}</h5>
                    <div className="customer-text-and-edit">
                        {this.state.displayType === 'text' ? this.renderTextCustomer() : this.renderEditCustomer()}
                    </div>
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
            </div>
        )
    }

}
;
AssignClueAndSelectCustomer.defaultProps = {
    curClueDetail: {}
};
export default AssignClueAndSelectCustomer;