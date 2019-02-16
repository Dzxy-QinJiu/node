//日期格式
export const DATE_FORMAT = oplateConsts.DATE_FORMAT;
import Intl from '../../public/intl/intl';
import { dateColumnRender, yesNoColumnRender } from '../../lib/func';

//视图类型
export const VIEW_TYPE = {
    SELL: 'sell',//销售合同
    BUY: 'buy',//采购合同
    REPAYMENT: 'repayment',//回款
    COST: 'cost',//费用
};

//导出文件名
export const EXPORT_FILE_NAME = {
    SELL: 'xiao_shou_he_tong',//销售合同
    BUY: 'cai_gou_he_tong',//采购合同
    REPAYMENT: 'hui_kuan',//回款
    COST: 'fei_yong',//费用
};

//操作名称
export const OPERATE = {
    add: Intl.get('sales.team.add.sales.team', '添加'),
    update: Intl.get('contract.5', '更新'),
    delete: Intl.get('common.delete', '删除'),
};

//合同类型
export const PRODUCT = Intl.get('contract.6', '产品合同');
export const PROJECT = Intl.get('contract.7', '项目合同');
export const SERVICE = Intl.get('contract.8', '服务合同');
export const PURCHASE = Intl.get('contract.9', '采购合同');
export const CATEGORY = [PRODUCT, PROJECT, SERVICE, PURCHASE];

// 采购合同分类
export const PURCHASE_TYPE = [
    { dataIndex: '1', name: Intl.get('contract.purchase.contract.type.fixed.assets', '固定资产') },
    { dataIndex: '2', name: Intl.get('contract.purchase.contract.type.technical.service', '技术服务') },
    { dataIndex: '3', name: Intl.get('contract.purchase.contract.type.office.purchase', '办公采购') },
    { dataIndex: '4', name: Intl.get('contract.purchase.contract.type.cost.purchase', '成本采购') },
    { dataIndex: '5', name: Intl.get('contract.purchase.contract.type.intellectual.property', '知识产权') },
    { dataIndex: '6', name: Intl.get('contract.purchase.contract.type.market.promotion', '市场推广') },
    { dataIndex: '7', name: Intl.get('contract.purchase.contract.type.house.rent', '房租') },
    { dataIndex: '8', name: Intl.get('contract.purchase.contract.type.optical.fiber', '光纤') },
    { dataIndex: '9', name: Intl.get('contract.purchase.contract.type.other', '其他') },
];

//搜索字段
export const SEARCH_FIELD = [Intl.get('crm.41', '客户名'), Intl.get('crm.6', '负责人')];

//合同阶段
export const STAGE_AUDIT = Intl.get('contract.10', '审核');
export const STAGE_ARCHIVE = Intl.get('contract.11', '归档');
export const STAGE_SCRAP = Intl.get('contract.12', '报废');
export const STAGE_UNVERIFY = Intl.get('contract.unverify', '待审');
export const CONTRACT_STAGE = [STAGE_UNVERIFY, STAGE_AUDIT, STAGE_ARCHIVE, STAGE_SCRAP];

//成本构成
export const COST_STRUCTURE = [
    Intl.get('contract.133', '费用'),
    Intl.get('common.login.equipment', '设备'),
];

//合同签约类型
export const LABEL_NEW_SIGNING = {
    name: Intl.get('contract.162', '新签'),
    value: 'new',
};
export const LABEL_RENEWAL = {
    name: Intl.get('contract.163', '续约'),
    value: 'extension',
};
export const CONTRACT_LABEL = [LABEL_NEW_SIGNING, LABEL_RENEWAL];

//报告类型
export const REPORT_TYPE = [Intl.get('contract.13', '日报'), Intl.get('contract.14', '周报'), Intl.get('contract.15', '月报'), Intl.get('contract.16', '年报'), Intl.get('contract.17', '专报')];

//服务类型
export const REPORT_SERVICE = Intl.get('contract.18', '报告服务');
export const DATA_SERVICE = Intl.get('contract.19', '数据服务');
export const COLLECTION_SERVICE = Intl.get('contract.20', '采集服务');
export const SERVICE_TYPE = [REPORT_SERVICE, DATA_SERVICE, COLLECTION_SERVICE];
export const LITE_SERVICE_TYPE = [DATA_SERVICE, COLLECTION_SERVICE];

//费用类型
export const COST_TYPE = [Intl.get('contract.130', '交际费'), Intl.get('contract.131', '市内交通费'), Intl.get('contract.132', '售前技术支持费')];

//列宽
const COLUMN_WIDTH = 80;

//合同号列
const CONTRACT_NUM_COLUMN = [
    {
        title: Intl.get('contract.24', '合同号'),
        dataIndex: 'num',
        width: 120,
        sorter: true,
    },
];

//合同客户列
const CONTRACT_CUSTOMER_COLUMN = [
    {
        title: Intl.get('crm.41', '客户名'),
        dataIndex: 'customer_name',
        width: 160,
    },
];

//合同所属客户列
const CONTRACT_BELONG_CUSTOMER_COLUMN = [
    {
        title: Intl.get('common.belong.customer', '所属客户'),
        dataIndex: 'customers',
        width: 160,
        render: text => {
            if (!_.isArray(text)) text = [];

            return ( 
                <div>
                    {text.map((customer, index) => (<div key={index}>{customer.customer_name}</div>))}
                </div>
            );
        },
    },
];

//合同甲方列
const CONTRACT_BUYER_COLUMN = [
    {
        title: Intl.get('contract.4', '甲方'),
        dataIndex: 'buyer',
        width: 160,
    },
];

// 负责人和部门列
const SALES_AND_GROUP_COLUMNS = [
    {
        title: Intl.get('crm.6', '负责人'),
        dataIndex: 'user_name',
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('crm.113', '部门'),
        dataIndex: 'sales_team',
        width: COLUMN_WIDTH,
    },
];

// 合同基本信息列
const CONTRACT_BASE_COLUMNS = SALES_AND_GROUP_COLUMNS
    .concat([
        {
            title: Intl.get('contract.34', '签订时间'),
            dataIndex: 'date',
            render: dateColumnRender,
            width: 90,
            sorter: true,
        },
        {
            title: Intl.get('contract.36', '合同阶段'),
            dataIndex: 'stage',
            width: COLUMN_WIDTH,
        },
        {
            title: Intl.get('contract.25', '合同额'),
            dataIndex: 'contract_amount',
            sorter: true,
            width: COLUMN_WIDTH,
        },
    ]);

//销售合同特有列
const SELLS_CONTRACT_SPECIAL_COLUMNS = [
    {
        title: Intl.get('contract.120', '开始时间'),
        dataIndex: 'start_time',
        render: dateColumnRender,
        width: 90,
        sorter: true,
    },
    {
        title: Intl.get('contract.105', '结束时间'),
        dataIndex: 'end_time',
        render: dateColumnRender,
        width: 90,
        sorter: true,
    },
    {
        title: Intl.get('contract.37', '合同类型'),
        dataIndex: 'category',
        width: COLUMN_WIDTH,
    },
];

//销售合同财务基本信息列
export const SELLS_CONTRACT_FINANCIAL_BASE_COLUMNS = [
    {
        title: Intl.get('contract.121', '合同成本'),
        dataIndex: 'cost_price',
        sorter: true,
        width: 90,
    },
    {
        title: Intl.get('contract.27', '合同毛利'),
        dataIndex: 'gross_profit',
        sorter: true,
        width: 90,
    },
    {
        title: Intl.get('common.gross_profit_rate', '毛利率'),
        dataIndex: 'gross_profit_rate',
        width: 76,
    },
];

//销售合同财务扩展信息列
const SELLS_CONTRACT_FINANCIAL_EXTEND_COLUMNS = [
    {
        title: Intl.get('contract.28', '回款额'),
        dataIndex: 'total_amount',
        sorter: true,
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('contract.29', '回款毛利'),
        dataIndex: 'total_gross_profit',
        sorter: true,
        width: 90,
    },
    {
        title: Intl.get('contract.30', '应收款'),
        dataIndex: 'total_plan_amount',
        sorter: true,
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('contract.31', '已开发票额'),
        dataIndex: 'total_invoice_amount',
        sorter: true,
        width: 110,
    },
];

//合同表格其他信息列
const CONTRACT_OTHER_COLUMNS = [
    {
        title: Intl.get('contract.164', '签约类型'),
        dataIndex: 'label',
        width: COLUMN_WIDTH,
    },
];

//销售合同表格列
export const SELLS_CONTRACT_COLUMNS = CONTRACT_NUM_COLUMN
    .concat(CONTRACT_BUYER_COLUMN)
    .concat(CONTRACT_CUSTOMER_COLUMN)
    .concat(CONTRACT_BELONG_CUSTOMER_COLUMN)
    .concat(SELLS_CONTRACT_SPECIAL_COLUMNS)
    .concat(CONTRACT_BASE_COLUMNS)
    .concat(SELLS_CONTRACT_FINANCIAL_BASE_COLUMNS)
    .concat(SELLS_CONTRACT_FINANCIAL_EXTEND_COLUMNS)
    .concat(CONTRACT_OTHER_COLUMNS);

//销售合同表格导出列
export const SELLS_CONTRACT_EXPORT_COLUMNS = CONTRACT_NUM_COLUMN
    .concat(CONTRACT_BUYER_COLUMN)
    .concat(CONTRACT_CUSTOMER_COLUMN)
    .concat(CONTRACT_BELONG_CUSTOMER_COLUMN)
    .concat(SELLS_CONTRACT_SPECIAL_COLUMNS)
    .concat(CONTRACT_BASE_COLUMNS)
    .concat(SELLS_CONTRACT_FINANCIAL_BASE_COLUMNS)
    .concat(SELLS_CONTRACT_FINANCIAL_EXTEND_COLUMNS)
    .concat(CONTRACT_OTHER_COLUMNS);

//采购合同表格列
export const BUY_CONTRACT_COLUMNS = CONTRACT_NUM_COLUMN
    .concat(CONTRACT_BASE_COLUMNS);


// 回款时间列
const REPAYMENT_TIME_COLUMN = [
    {
        title: Intl.get('contract.122', '回款时间'),
        dataIndex: 'repayment_date',
        nonNumeric: true,
        render: dateColumnRender,
        width: 90,
        sorter: true,
    },
];

// 回款基本信息列（除回款时间）
const REPAYMENT_BASE_COLUMNS = [
    {
        title: Intl.get('contract.28', '回款额'),
        dataIndex: 'repayment_amount',
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('contract.29', '回款毛利'),
        dataIndex: 'repayment_gross_profit',
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('contract.167', '首笔回款'),
        dataIndex: 'repayment_is_first',
        nonNumeric: true,
        width: COLUMN_WIDTH,
        render: yesNoColumnRender
    },
];

//回款特有列
export const REPAYMENT_OWN_COLUMNS = REPAYMENT_TIME_COLUMN
    .concat(REPAYMENT_BASE_COLUMNS);

//回款表格列
export const REPAYMENT_COLUMNS = REPAYMENT_TIME_COLUMN
    .concat(SALES_AND_GROUP_COLUMNS)
    .concat(REPAYMENT_BASE_COLUMNS)
    .concat(CONTRACT_NUM_COLUMN)
    .concat(CONTRACT_CUSTOMER_COLUMN)
    .concat(CONTRACT_BUYER_COLUMN);

//费用表格列
export const COST_COLUMNS = [
    {
        title: Intl.get('user.salesman', '销售人员'),
        dataIndex: 'sales_name',
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('user.sales.team', '销售团队'),
        dataIndex: 'sales_team',
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('common.login.time', '时间'),
        dataIndex: 'date',
        width: 90,
        render: dateColumnRender,
    },
    {
        title: Intl.get('contract.133', '费用'),
        dataIndex: 'cost',
        width: COLUMN_WIDTH,
    },
    {
        title: Intl.get('contract.135', '费用类型'),
        dataIndex: 'type',
        width: 200,
    },
];

//合同仪表盘图表高度
export const CHART_HEIGHT = 290;

// 合同统计分析列
export const CONTRACT_STATIC_COLUMNS = [
    {
        title: Intl.get('common.type', '类型'),
        dataIndex: 'name',
    }, {
        title: Intl.get('sales.home.total.compute', '总计'),
        dataIndex: 'amount',
    }, {
        title: Intl.get('sales.home.new.add', '新增'),
        dataIndex: 'new',
    }, {
        title: Intl.get('contract.163', '续约'),
        dataIndex: 'renewal',
    },{
        title: Intl.get('contract.171', '流失'),
        dataIndex: 'runOff',
    }, {
        title: Intl.get('contract.172', '流失率'),
        dataIndex: 'churnRate',
    }, {
        title: Intl.get('contract.173', '年度流失率'),
        dataIndex: 'yearRate',
    }
];

//权限常量
export const PRIVILEGE_MAP = {
    CONTRACT_BASE_PRIVILEGE: 'CRM_CONTRACT_COMMON_BASE',//合同基础角色的权限，开通合同管理应用后会有此权限
    CONTRACT_UPATE_PRIVILEGE: 'OPLATE_CONTRACT_UPDATE',//更新合同的权限
    CONTRACT_UPDATE_REPAYMENT: 'OPLATE_REPAYMENT_ADD',//更新回款的权限
    CONTRACT_INVOICE: 'CONTRACT_INVOICE_DETAIL_ADD', // 添加和修改发票信息的权限
    CONTRACT_ADD_INVOICE_AMOUNT: 'CONTRACT_ADD_INVOICE_AMOUNT', // 添加和修改发票额的权限
    CONTRACT_ADD_PAYMENT: 'OPLATE_PAYMENT_ADD', // 添加和修改付款信息的权限
};