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
class AssignClueAndSelectCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curClueDetail: this.props.curClueDetail,
            displayType: "text",
            submitType: "",
            isShowCustomerError:false,
            customer_id:"",//所有要关联客户的id
        }
    };

    isSalesManager() {
        return userData.isSalesManager()
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.curClueDetail.id !== nextProps.curClueDetail.id) {
           this.setState({
               curClueDetail:nextProps.curClueDetail
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
    onCustomerChoosen = (info) => {
        var customer_id = info && info.customer && info.customer.id || '';
        if(customer_id) {
            this.setState({
                customer_id : customer_id,
            });
        }
    };
    hideCustomerError = () =>{
        this.setState({
            isShowCustomerError:false
        })
    };

    renderCustomerBlock() {
        return (
            <div className="select_text_wrap">
                <div className="pull-left form-item-content">
                    <CustomerSuggest
                        required={false}
                        show_error={this.state.isShowCustomerError}
                        onCustomerChoosen={this.onCustomerChoosen}
                        hideCustomerError={this.hideCustomerError}
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
        var $input = $(".ant-select-search__field", this.refs.wrap);
        var input_val = $input[0] && $input.val();
        if (input_val !== undefined) {
            if (!input_val) {
                this.state.customer_id = '';
            } else if (input_val !== this.props.customer_name) {
                this.setState({
                    show_customer_error: true
                });
                return;
            }
        }
        //要提交的数据
        var submitObj = {
            //线索的id
            customer_clue_id: this.state.curClueDetail.id,
            //要关联的客户id
            customer_id: this.state.customer_id,
            //线索的创建时间
            customer_clue_start_time: this.state.curClueDetail.start_time
        };
        console.log(submitObj);
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
                        submitType: 'success'
                    });
                _this.props.onChangeSuccess({
                        user_id: _this.props.user_id,
                        customer_id: _this.state.customer_id,
                        customer_name: _this.state.customer_name,
                        sales_id: _this.state.sales_id,
                        sales_name: _this.state.sales_name,
                        sales_team_id: _this.state.sales_team_id,
                        sales_team_name: _this.state.sales_team_name
                    });

            },
            error: function (xhr) {
                _this.setState({
                    submitType: 'error',
                    error_message: xhr.responseJSON || Intl.get("common.edit.failed", "修改失败")
                });
            }
        });
    };

    renderIndicator() {
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
            return <AlertTimer message={Intl.get("user.edit.success", "修改成功")} type="success" onHide={onSuccessHide}
                               showIcon/>;
        }
        if (this.state.submitType === 'error') {
            return <Alert message={this.state.error_message} type="error" showIcon/>;
        }
    };

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

    renderEditCustomer() {
        const showBtnBool = !/success/.test(this.state.submitType);
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

    renderTextCustomer() {
        //是否有修改线索所属客户的权利
        var canEdit = hasPrivilege("CRM_MANAGER_CUSTOMER_CLUE_ID") || hasPrivilege("CRM_USER_CUSTOMER_CLUE_ID");
        return (
            <div className="user-basic-edit-field">
                <span className="customer-name">{this.props.customer_name}</span>
                {
                    canEdit ? <i className="iconfont icon-update"
                                 onClick={this.changeDisplayCustomerType.bind(this, "select")}></i> : null
                }
            </div>
        )

    };

    renderCustomer() {
        return (
            <div className="user-basic-edit-field">
                <span className="customer-name-lable">{Intl.get("clue.customer.associate.customer", "关联客户")}</span>
                <span className="">
                 {this.state.displayType === 'text' ? this.renderEditCustomer() : this.renderTextCustomer()}
             </span>

            </div>
        );

        if (this.state.displayType === 'text') {
            //是否有修改线索所属客户的权利
            var canEdit = (hasPrivilege("APP_USER_EDIT") || hasPrivilege("CHANGE_USER_CUSTOMER")) && hasPrivilege("CRM_LIST_CUSTOMERS");
            return (
                <div className="user-basic-edit-field">
                    <span className="customer-name-lable">{Intl.get("clue.customer.associate.customer", "关联客户")}</span>
                    <span className="customer-name">{this.props.customer_name}</span>
                    {/*todo 待修改*/}
                    {
                        canEdit || true ? <i className="iconfont icon-update"
                                             onClick={this.changeDisplayCustomerType.bind(this, "select")}></i> : null
                    }
                </div>
            );
        }

        const showBtnBool = !/success/.test(this.state.submitType);
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
                    <span
                        className="pull-left customer-name-lable">{Intl.get("clue.customer.associate.customer", "关联客户")}</span>
                    <span className="pull-left">
                 {this.state.displayType === 'text' ? this.renderTextCustomer() : this.renderEditCustomer()}
             </span>
                </div>
            </div>
        )
    }

}
;
AssignClueAndSelectCustomer.defaultProps = {
    curClueDetail: {}
};
export default AssignClueAndSelectCustomer;