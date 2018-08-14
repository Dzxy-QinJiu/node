import { CONTRACT_STAGE, CATEGORY } from '../../consts';
//拼接字段的符号
export const CONTRACT_FIELD_CONNECT_SYMBOL = '---';
export const CONTRACT_FILTER_OPTIONS_HANDLERS = {
    TEAM: 'teamList',
    USER: 'userList'
};
export const CONTRACT_DEFAULT_PAGESIZE = 10;
//查看权限
export const CONTRACT_VIEW_AUTH = {
    SELF: {
        value: 0,
        text: '仅自己可见'
    },//status (integer): 视图状态，私有:0，共有:1 ,
    ALL: {
        value: 1,
        text: '所有人可见'
    }
};
export const LAYOUT_CONSTANTS = {
    TOP: 80,
    BTNBAR: 30,
    NAV_TOP: 50
};
export const CONTRACT_TYPES_LIST = [{
    value: 'contract',
    name: '合同'
}, {
    value: 'repayment',
    name: '回款'
}, {
    value: 'cost',
    name: '费用'
}];
export const CONTRACT_TYPES = {
    'contract': 'contract',
    'repayment': 'repayment',
    'cost': 'cost'
};
export const CONTRACT_FIELDS = {
    contract: [
        {
            value: 'num',
            fieldType: 'string',
            text: Intl.get('contract.24', '合同号')
        },
        {
            value: 'name',
            fieldType: 'string',
            text: Intl.get('contract.name', '合同名称')
        },
        {
            value: 'buyer',
            fieldType: 'string',
            text: Intl.get('contract.buyer', '买方')
        },
        {
            value: 'customer_name',
            fieldType: 'string',
            text: Intl.get('crm.4', '客户名称')
        },
        {
            value: 'user_name',
            fieldType: 'string',
            text: Intl.get('common.belong.sales', '所属销售'),
            options: CONTRACT_FILTER_OPTIONS_HANDLERS.USER
        },
        {
            value: 'stage',
            fieldType: 'string',
            text: Intl.get('contract.36', '合同阶段'),
            options: CONTRACT_STAGE.map(x => ({ value: x, name: x }))
        },
        {
            value: 'date',
            fieldType: 'date',
            text: Intl.get('contract.34', '签订时间')
        },
        {
            value: 'start_time',
            fieldType: 'date',
            text: Intl.get('contract.35', '起始时间')
        },
        {
            value: 'end_time',
            fieldType: 'date',
            text: Intl.get('contract.105', '结束时间')
        },
        {
            value: 'total_amount',
            fieldType: 'num',
            text: Intl.get('contract.totalEarned', '回款总额')
        },
        {
            value: 'contract_amount',
            fieldType: 'num',
            text: Intl.get('contract.25', '合同额')
        },
        {
            value: 'total_payment_amount',
            fieldType: 'num',
            text: Intl.get('contract.totalPaid', '已付款总额', )
        },
        {
            value: 'total_plan_amount',
            fieldType: 'num',
            text: Intl.get('contract.totalToEarn', '待回款总额')
        },
        {
            value: 'total_invoice_amount',
            fieldType: 'num',
            text: Intl.get('contract.31', '已开发票额')
        },
        {
            value: 'total_gross_profit',
            fieldType: 'num',
            text: '总的毛利万元'
        },
        {
            value: 'gross_profit',
            fieldType: 'num',
            text: Intl.get('contract.109', '毛利') + Intl.get('contract.82', '万元')
        },
        {
            value: 'cost_price',
            fieldType: 'num',
            text: Intl.get('contract.121', '合同成本') + Intl.get('contract.82', '万元')
        },
        {
            value: 'cost_structure',
            fieldType: 'string',
            text: Intl.get('contract.165', '成本构成')
        },
        {
            value: 'need_invoice',
            fieldType: 'string',
            text: Intl.get('contract.hasInvoice', '是否开发票')
        },
        {
            value: 'copy_number',
            fieldType: 'num',
            text: Intl.get('contract.num', '合同数量')
        },
        {
            value: 'remarks',
            fieldType: 'string',
            text: Intl.get('common.remark', '备注')
        },
        {
            value: 'sales_team',
            fieldType: 'string',
            text: Intl.get('user.sales.team', '销售团队'),
            options: CONTRACT_FILTER_OPTIONS_HANDLERS.TEAM
        },
        {
            value: 'type',
            fieldType: 'string',
            text: Intl.get('contract.37', '合同类型'),
            options: [
                { value: 'buy', name: Intl.get('contract.9', '采购合同') },
                { value: 'sell', name: Intl.get('contract.112', '销售合同') }
            ]
        },
        {
            value: 'category',
            fieldType: 'string',
            text: Intl.get('contract.category', '合同种类'),
            options: CATEGORY.map(x => ({ value: x, name: x }))
        },
        {
            value: 'status',
            fieldType: 'string',
            text: Intl.get('contract.status', '合同状态')
        },
        {
            value: 'gross_profit_rate',
            fieldType: 'num',
            text: Intl.get('common.gross_profit_rate', '毛利率')
        },
        {
            value: 'label',
            fieldType: 'string',
            text: Intl.get('contract.newEenewal', '新增续约'),
        },
        {
            value: 'customers.customer_name',
            fieldType: 'string',
            text: Intl.get('common.belong.customer', '所属客户') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('common.definition', '名称'),
        },
        {
            value: 'customers.customer_sales_team_name',
            text: Intl.get('common.belong.customer', '所属客户') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('user.user.team', '团队'),
            fieldType: 'string',
        },
        {
            value: 'customers.sales_name',
            text: Intl.get('common.belong.customer', '所属客户') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('sales.home.sales', '销售'),
            fieldType: 'string',
        },
        {
            value: 'products.total_price',
            text: Intl.get('contract.178', '购买产品') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('contract.23', '总价'),
            fieldType: 'num',
        },
        {
            value: 'products.num',
            fieldType: 'num',
            text: Intl.get('contract.178', '购买产品') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('common.app.count', '数量'),
        },
        {
            value: 'products.name',
            text: Intl.get('contract.178', '购买产品') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('common.definition', '名称'),
            fieldType: 'string',
        },
        {
            value: 'products.version',
            text: Intl.get('contract.178', '购买产品') + CONTRACT_FIELD_CONNECT_SYMBOL + Intl.get('contract.21', '版本号'),
            fieldType: 'string',
        },


    ],
    cost: [
        {
            'value': 'create_date',
            'text': Intl.get('contract.182', '费用录入时间'),
            'fieldType': 'date'
        },
        {
            'value': 'date',
            'text': Intl.get('contract.183', '费用产生时间'),
            'fieldType': 'date'
        },
        {
            'value': 'cost',
            'text': Intl.get('contract.184', '费用金额'),
            'fieldType': 'num'
        },
        {
            'value': 'sales_name',
            'text': Intl.get('sales.home.sales', '销售'),
            'fieldType': 'string'
        },
        {
            'value': 'type',
            'text': Intl.get('contract.185', '类型（市内交通）'),
            'fieldType': 'string'
        },
        {
            'value': 'sales_team',
            'text': Intl.get('user.user.team', '团队'),
            'fieldType': 'string'
        }
    ],
    repayment: [
        {
            'value': 'date',
            'text': Intl.get('contract.122', '回款时间'),
            'fieldType': 'date'
        },
        {
            'value': 'amount',
            'text': Intl.get('contract.187', '回款金额'),
            'fieldType': 'num'
        },
        {
            'value': 'user_name',
            'text': Intl.get('sales.home.sales', '销售'),
            'fieldType': 'string'
        },
        {
            'value': 'gross_profit',
            'text': Intl.get('contract.29', '回款毛利'),
            'fieldType': 'num'
        },
        {
            'value': 'type',
            'text': Intl.get('contract.37', '合同类型'),
            'fieldType': 'string'
        },        
        {
            'value': 'contract_date',
            'text': Intl.get('contract.34', '签订时间'),
            'fieldType': 'date'
        },
        {
            'value': 'sales_team',
            'text': Intl.get('user.user.team', '团队'),
            'fieldType': 'string'
        },
        {
            'value': 'is_first',
            'text': Intl.get('contract.186', '首次回款'),
            'fieldType': 'string'
        }
    ]
};
//值计算类型
export const CONTRACT_VALUE_TYPES = [
    {
        value: 'sum',
        text: Intl.get('contract.sum', '求和'),
        type: 'num'
    },
    {
        value: 'count',
        text: Intl.get('contract.count', '计数')
    },
    {
        value: 'avg',
        text: Intl.get('contract.avg', '平均值'),
        type: 'num'
    },
    {
        value: 'max',
        text: Intl.get('contract.max', '最大值'),
        type: 'num'
    },
    {
        value: 'min',
        text: Intl.get('contract.min', '最小值'),
        type: 'num'
    }
];

//单个分析区域中最大字段数量
export const CONTRACT_FIELDS_MAXLENGTH = 3;

//默认值计算类型
export const CONTRACT_DEFAULT_VALUE_TYPE = {
    value: 'count',
    text: '计数'
};