/**
 * 销售合同基本信息展示及编辑页面
 */

import { Form, Input, Select, Table } from "antd";
const FormItem = Form.Item;
import ValidateMixin from "../../../mixins/ValidateMixin";
import rightPanelUtil from "../../../components/rightPanel";
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import { getTeamName, getLabelName } from "./utils";
import AddBasic from "./add-basic";
import AddProduct from "./add-product";

const DetailBasic = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function() {
        return {
            isBasicInfoEdit: false,
            isAppEdit: false,
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.contract.id !== nextProps.contract.id) {
            this.hideBasicInfoForm();
            this.hideAppForm();
        }
    },
    showBasicInfoForm: function() {
        this.setState({isBasicInfoEdit: true, isAppEdit: false});
    },
    hideBasicInfoForm: function() {
        this.setState({isBasicInfoEdit: false});
    },
    showAppForm: function() {
        this.setState({isAppEdit: true, isBasicInfoEdit: false}, () => {
            this.props.updateScrollBar();
        });
    },
    hideAppForm: function() {
        this.setState({isAppEdit: false}, () => {
            this.props.updateScrollBar();
        });
    },
    getRowKey: function(record, index) {
        return index;
    },
    handleSubmit: function(target) {
        const ref = target === "app" ? "addProduct" : "addBasic";

        this.refs[ref].refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                if (target === "app") {
                    //获取应用数据
                    let products = this.refs.addProduct.state.products;
                    //过滤掉未选择应用的项
                    products = _.filter(products, item => item.name);
                    //获取合同基本信息表单数据
                    this.state.formData = JSON.parse(JSON.stringify(this.props.contract));
                    //将应用数据赋给当前编辑的合同
                    this.state.formData.products = products;
                } else {
                    //获取合同基本信息表单数据
                    this.state.formData = this.refs.addBasic.state.formData;
                }

                this.props.handleSubmit(() => {
                    if (target === "app") {
                        this.hideAppForm();
                    } else {
                        this.hideBasicInfoForm();
                    }
                });
            }
        });
    },
    render: function() {
        const products = this.props.contract.products || [];
        const contract = this.props.contract;

        const columns = [
            {
                title: Intl.get("common.app.name", "应用名称"),
                dataIndex: "name",
                key: "name",
            },
            {
                title: Intl.get("contract.21", "版本号"),
                dataIndex: "version",
                key: "version",
            },
            {
                title: Intl.get("common.app.count", "数量"),
                dataIndex: "num",
                key: "num",
                render: function(text) {
                    return <span>{text}个</span>;
                }
            },
            {
                title: Intl.get("contract.23", "总价"),
                dataIndex: "total_price",
                key: "total_price",
                render: function(text) {
                    return <span>{text}{Intl.get("contract.155", "元")}</span>;
                }
            },
            {
                title: Intl.get("contract.141", "提成比例"),
                dataIndex: "commission_rate",
                key: "commission_rate",
                render: function(text) {
                    return <span>{text ? text + " %" : ""}</span>;
                }
            },
        ];

        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : "";

        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : "";

        const date = contract.date ? moment(contract.date).format(oplateConsts.DATE_FORMAT) : "";

        const isEditBtnShow = !this.state.isBasicInfoEdit && !this.state.isAppEdit && hasPrivilege("OPLATE_CONTRACT_UPDATE");

        return (
            <div className="detail-basic">
                {isEditBtnShow ? (
                    <RightPanelEdit 
                        onClick={this.showBasicInfoForm}
                    />
                ) : null}

                {this.state.isBasicInfoEdit ? (
                    <div>
                        <AddBasic
                            ref="addBasic"
                            contract={this.props.contract}
                            teamList={this.props.teamList}
                            userList={this.props.userList}
                            getUserList={this.props.getUserList}
                            isGetUserSuccess={this.props.isGetUserSuccess}
                        />
                        <div className="op-buttons">
                            <RightPanelCancel onClick={this.hideBasicInfoForm}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit}><ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" /></RightPanelSubmit>
                        </div>
                    </div>
                ) : null}

                {!this.state.isAppEdit && !this.state.isBasicInfoEdit ? (
                    <div className="basic-info"> 
                        <div className="detail-item">
                            {Intl.get("contract.24", "合同号")}:
                            {contract.num}
                        </div>
                        <div className="detail-item">
                            {Intl.get("crm.41", "客户名")}:
                            {contract.customer_name}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.4", "甲方")}:
                            {contract.buyer}
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
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.contract_amount) ? "" : contract.contract_amount.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.26", "成本额")}:
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.cost_price) ? "" : contract.cost_price.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.165", "成本构成")}:
                            {contract.cost_structure}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.27", "合同毛利")}:
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.gross_profit) ? "" : contract.gross_profit.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item half">
                            {Intl.get("contract.28", "回款额")}:
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.total_amount) ? "" : contract.total_amount.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.29", "回款毛利")}:
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.total_gross_profit) ? "" : contract.total_gross_profit.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item half">
                            {Intl.get("contract.30", "应收款")}:
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.total_plan_amount) ? "" : contract.total_plan_amount.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.31", "已开发票额")}:
                            <ReactIntl.FormattedMessage
                                id="contract.159"
                                values={{"num": (isNaN(contract.total_invoice_amount) ? "" : contract.total_invoice_amount.toFixed(2))}}
                                defaultMessage={`{num}元`} />
                        </div>
                        <div className="detail-item" style={{clear: "left"}}>
                            {Intl.get("contract.32", "合同份数")}:
                            <ReactIntl.FormattedMessage
                                id="contract.33"
                                values={{"num": contract.copy_number}}
                                defaultMessage={`{num}份`} />
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.34", "签订时间")}:
                            {date}
                        </div>
                        <div className="detail-item half">
                            {Intl.get("contract.35", "起始时间")}:
                            {start_time}
                        </div>
                        <div className="detail-item">
                            {Intl.get("user.time.end", "到期时间")}:
                            {end_time}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.36", "合同阶段")}:
                            {contract.stage}
                        </div>
                        <div className="detail-item">
                            {Intl.get("contract.164", "签约类型")}:
                            {getLabelName(contract.label)}
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
                        <div className="detail-item">
                            {Intl.get("common.belong.customer", "所属客户")}:
                            {contract.oplate_customer_name}
                        </div>
                    </div>
                ) : null}

                {this.state.isAppEdit ? (
                    <div>
                        <AddProduct
                            ref="addProduct"
                            products={products}
                            appList={this.props.appList}
                            updateScrollBar={this.props.updateScrollBar}
                        />
                        <div className="op-buttons">
                            <RightPanelCancel onClick={this.hideAppForm}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit.bind(this, "app")}><ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" /></RightPanelSubmit>
                        </div>
                    </div>
                ) : null}

                {!this.state.isAppEdit && !this.state.isBasicInfoEdit ? (
                    <div>
                        <Table
                            dataSource={products}
                            columns={columns}
                            rowKey={this.getRowKey}
                            pagination={false}
                        />
                        {hasPrivilege("OPLATE_CONTRACT_UPDATE") ? (
                            <div className="op-buttons">
                                <RightPanelSubmit onClick={this.showAppForm}><ReactIntl.FormattedMessage id="contract.38" defaultMessage="编辑应用" /></RightPanelSubmit>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
});

module.exports = DetailBasic;

