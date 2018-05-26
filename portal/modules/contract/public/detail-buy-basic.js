/**
 * 采购合同基本信息展示及编辑页面
 */

import rightPanelUtil from "../../../components/rightPanel";
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import { getTeamName } from "./utils";
import AddBuyBasic from "./add-buy-basic";

const DetailBuyBasic = React.createClass({
    getInitialState: function() {
        return {
            isFormShow: false,
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.contract.id !== nextProps.contract.id) {
            this.hideForm();
        }
    },
    showForm: function() {
        this.setState({isFormShow: true});
    },
    hideForm: function() {
        this.setState({isFormShow: false});
    },
    handleSubmit: function() {
        this.refs.addBuyBasic.refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                //获取合同基本信息表单数据
                this.state.formData = this.refs.addBuyBasic.state.formData;
                this.props.handleSubmit(() => {
                    this.hideForm();
                });
            }
        });
    },
    render: function() {
        const contract = this.props.contract;

        const date = contract.date ? moment(contract.date).format(oplateConsts.DATE_FORMAT) : "";

        const isEditBtnShow = !this.state.isFormShow && hasPrivilege("OPLATE_CONTRACT_UPDATE");

        return (
            <div className="detail-basic">
                {isEditBtnShow ? (
                    <RightPanelEdit 
                        onClick={this.showForm}
                    />
                ) : null}

                {this.state.isFormShow ? (
                    <div>
                        <AddBuyBasic
                            ref="addBuyBasic"
                            contract={this.props.contract}
                            teamList={this.props.teamList}
                            userList={this.props.userList}
                            getUserList={this.props.getUserList}
                            isGetUserSuccess={this.props.isGetUserSuccess}
                        />
                        <div className="op-buttons">
                            <RightPanelCancel onClick={this.hideForm}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit}><ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" /></RightPanelSubmit>
                        </div>
                    </div>
                ) : (
                    <div className="basic-info"> 
                        <div className="detail-item">
                            {Intl.get("contract.24", "合同号")}:
                            {contract.num}
                        </div>
                        <div className="detail-item">
                            {Intl.get("crm.6", "负责人")}:
                            {contract.user_name}
                        </div>
                        <div className="detail-item">
                            {Intl.get("crm.113", "部门")}:
                            {contract.sales_team || getTeamName(this.props.teamList, contract.sales_team_id)}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.25", "合同额")}:
                            {contract.contract_amount}
                            <ReactIntl.FormattedMessage id="contract.159" defaultMessage="元" />
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.34", "签订时间")}:
                            {date}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.36", "合同阶段")}:
                            {contract.stage}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.37", "合同类型")}:
                            {contract.category}
                        </div>
                        <div className="detail-item">
                            {Intl.get("common.remark", "备注")}:
                            <div className="remarks">
                                {contract.remarks}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
});

module.exports = DetailBuyBasic;

