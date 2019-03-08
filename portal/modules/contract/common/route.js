const contractUrl = '/rest/contract/v2/contract';
const invoiceUrl = contractUrl + '/invoice';
const repaymentUrl = '/rest/contract/v2/repayment';
const paymentUrl = '/rest/contract/v2/payment';
const costUrl = '/rest/contract/v2/cost';
const commissionUrl = '/rest/contract/v2/sales_commission/record';
//自定义合同分析
const analysisUrl = '/rest/analysis/contract/custom';

module.exports = [
    {
        'method': 'post',
        'path': contractUrl + '/range/:page_size/:sort_field/:order',
        'handler': 'queryContract',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': contractUrl + '/export/:page_size/:sort_field/:order',
        module: 'contract/server/special-case-handler',
        'handler': 'exportData',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': contractUrl + '/upload/preview',
        'handler': 'uploadContractPreview',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'post',
        'path': contractUrl + '/upload',
        'handler': 'uploadContract',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': contractUrl + '/upload/confirm/:flag',
        'handler': 'uploadContractConfirm',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': contractUrl + '/:type',
        'handler': 'addContract',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': contractUrl + '/:type',
        'handler': 'editContract',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete',
        'path': contractUrl,
        'handler': 'deleteContract',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': contractUrl + '/type/list',
        'handler': 'getContractTypeList',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': invoiceUrl + '/add',
        'handler': 'addInvoice',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': invoiceUrl,
        'handler': 'updateInvoice',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': invoiceUrl + '/amount',
        'handler': 'addInvoiceAmount',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': invoiceUrl + '/amount',
        'handler': 'updateInvoiceAmount',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete',
        'path': invoiceUrl + '/amount/:id',
        'handler': 'deleteInvoiceAmount',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': contractUrl + '/repeat/search',
        'handler': 'checkNumExist',
        'passport': {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/repayment-list/:page_size/:sort_field/:order',
        module: 'contract/server/special-case-handler',
        handler: 'getRepaymentList',
        passport: {
            needLogin: true
        }
    }, {
        'method': 'post',
        'path': repaymentUrl + '/query/:page_size/:sort_field/:order',
        'handler': 'queryRepayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': repaymentUrl + '/query_v2/:page_size/:sort_field/:order',
        'handler': 'queryRepaymentV2',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': repaymentUrl + '/:contractId/:type',
        'handler': 'addRepayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': repaymentUrl + '/:contractId/:type',
        'handler': 'updateRepayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': repaymentUrl + '/delete',
        'handler': 'deleteRepayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': paymentUrl + '/:contractId',
        'handler': 'addPayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': paymentUrl + '/:contractId',
        'handler': 'updatePayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete',
        'path': paymentUrl + '/:id',
        'handler': 'deletePayment',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': costUrl + '/range/:page_size/:sort_field/:order',
        'handler': 'queryCost',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': costUrl,
        'handler': 'addCost',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': costUrl,
        'handler': 'updateCost',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete',
        'path': costUrl + '/:id',
        'handler': 'deleteCost',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': commissionUrl,
        'handler': 'addCommission',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': commissionUrl,
        'handler': 'updateCommission',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete',
        'path': commissionUrl + '/:id',
        'handler': 'deleteCommission',
        'passport': {
            'needLogin': true
        }
    },{//合同自定义分析
        'method': 'post',
        'path': analysisUrl + '/contract',//获取合同表格数据
        'handler': 'getContractData',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': analysisUrl + '/cost',//获取费用表格数据
        'handler': 'getCostData',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'post',
        'path': analysisUrl + '/repayment',//获取还款表格数据
        'handler': 'getRepaymentData',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'get',
        'path': analysisUrl + '/view/page',//获取已保存的表格标题
        'handler': 'getTableList',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': analysisUrl + '/view',//获取已保存的表格详情
        'handler': 'getTableInfo',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': analysisUrl + '/view',//保存表格视图
        'handler': 'saveTableInfo',
        'passport': {
            'needLogin': true
        }
    }
];
