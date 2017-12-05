//日期格式
export const DATE_FORMAT = oplateConsts.DATE_FORMAT;
import Intl from "../../public/intl/intl";

//操作名称
export const OPERATE = {
    add: Intl.get("sales.team.add.sales.team", "添加"),
    update: Intl.get("contract.5", "更新"),
    delete: Intl.get("common.delete", "删除"),
};

//合同类型
export const PRODUCT = Intl.get("contract.6", "产品合同");
export const PROJECT = Intl.get("contract.7", "项目合同");
export const SERVICE = Intl.get("contract.8", "服务合同");
export const PURCHASE = Intl.get("contract.9", "采购合同");
export const CATEGORY = [PRODUCT, PROJECT, SERVICE, PURCHASE];

//搜索字段
export const SEARCH_FIELD = [Intl.get("crm.41", "客户名"), Intl.get("crm.6", "负责人")];

//合同阶段
export const STAGE_AUDIT = Intl.get("contract.10", "审核");
export const STAGE_ARCHIVE = Intl.get("contract.11", "归档");
export const STAGE_SCRAP = Intl.get("contract.12", "报废");
export const CONTRACT_STAGE = [STAGE_AUDIT, STAGE_ARCHIVE, STAGE_SCRAP];

//合同签约类型
export const LABEL_NEW_SIGNING = {
    name: Intl.get("contract.162", "新签约"),
    value: "new",
};
export const LABEL_RENEWAL = {
    name: Intl.get("contract.163", "续约"),
    value: "extension",
};
export const CONTRACT_LABEL = [LABEL_NEW_SIGNING, LABEL_RENEWAL];

//报告类型
export const REPORT_TYPE = [Intl.get("contract.13", "日报"), Intl.get("contract.14", "周报"), Intl.get("contract.15", "月报"), Intl.get("contract.16", "年报"), Intl.get("contract.17", "专报")];

//服务类型
export const REPORT_SERVICE = Intl.get("contract.18", "报告服务");
export const DATA_SERVICE = Intl.get("contract.19", "数据服务");
export const COLLECTION_SERVICE = Intl.get("contract.20", "采集服务");
export const SERVICE_TYPE = [REPORT_SERVICE, DATA_SERVICE, COLLECTION_SERVICE];

//费用类型
export const COST_TYPE = [Intl.get("contract.130", "交际费"), Intl.get("contract.131", "市内交通费"), Intl.get("contract.132", "售前技术支持费")];

//合同表格基本信息列
const CONTRACT_BASE_COLUMNS = [
    {
        title: Intl.get("contract.24", "合同号"),
        dataIndex: "num",
    },
    {
        title: Intl.get("common.belong.customer", "所属客户"),
        dataIndex: "customer_name",
    },
    {
        title: Intl.get("crm.6", "负责人"),
        dataIndex: "user_name",
    },
    {
        title: Intl.get("crm.113", "部门"),
        dataIndex: "sales_team",
    },
    {
        title: Intl.get("contract.34", "签订时间"),
        dataIndex: "date",
    },
];

//合同表格扩展信息列
const CONTRACT_EXTEND_COLUMNS = [
    {
        title: Intl.get("contract.120", "开始时间"),
        dataIndex: "start_time",
    },
    {
        title: Intl.get("contract.105", "结束时间"),
        dataIndex: "end_time",
    },
    {
        title: Intl.get("contract.37", "合同类型"),
        dataIndex: "category",
    },
    {
        title: Intl.get("contract.36", "合同阶段"),
        dataIndex: "stage",
    },
];

//合同表格财务基本信息列
export const CONTRACT_FINANCIAL_BASE_COLUMNS = [
    {
        title: Intl.get("contract.25", "合同额"),
        dataIndex: "contract_amount",
    },
    {
        title: Intl.get("contract.121", "合同成本"),
        dataIndex: "cost_price",
    },
    {
        title: Intl.get("contract.27", "合同毛利"),
        dataIndex: "gross_profit",
    },
    {
        title: Intl.get("common.gross_profit_rate", "毛利率"),
        dataIndex: "gross_profit_rate",
    },
];

//合同表格财务扩展信息列
const CONTRACT_FINANCIAL_EXTEND_COLUMNS = [
    {
        title: Intl.get("contract.28", "回款额"),
        dataIndex: "total_amount",
    },
    {
        title: Intl.get("contract.29", "回款毛利"),
        dataIndex: "total_gross_profit",
    },
    {
        title: Intl.get("contract.30", "应收款"),
        dataIndex: "total_plan_amount",
    },
    {
        title: Intl.get("contract.31", "已开发票额"),
        dataIndex: "total_invoice_amount",
    },
];

//合同表格列
export const CONTRACT_COLUMNS = CONTRACT_BASE_COLUMNS
    .concat(CONTRACT_EXTEND_COLUMNS)
    .concat(CONTRACT_FINANCIAL_BASE_COLUMNS)
    .concat(CONTRACT_FINANCIAL_EXTEND_COLUMNS);

//回款表格列
export const REPAYMENT_COLUMNS = CONTRACT_BASE_COLUMNS.concat(CONTRACT_FINANCIAL_BASE_COLUMNS).concat([
    {
        title: Intl.get("contract.165", "成本构成"),
        dataIndex: "cost_structure",
    },
    {
        title: Intl.get("contract.122", "回款时间"),
        dataIndex: "repayment_date",
    },
    {
        title: Intl.get("contract.28", "回款额"),
        dataIndex: "repayment_amount",
    },
    {
        title: Intl.get("contract.29", "回款毛利"),
        dataIndex: "repayment_gross_profit",
    },
    {
        title: Intl.get("contract.167", "首笔回款"),
        dataIndex: "repayment_is_first",
    },
]);

//费用表格列
export const COST_COLUMNS = [
    {
        title: Intl.get("user.salesman", "销售人员"),
        dataIndex: "sales_name",
    },
    {
        title: Intl.get("user.sales.team", "销售团队"),
        dataIndex: "sales_team",
    },
    {
        title: Intl.get("common.login.time", "时间"),
        dataIndex: "date",
    },
    {
        title: Intl.get("contract.133", "费用"),
        dataIndex: "cost",
    },
    {
        title: Intl.get("contract.135", "费用类型"),
        dataIndex: "type",
    },
];

//合同仪表盘图表高度
export const CHART_HEIGHT = 290;

