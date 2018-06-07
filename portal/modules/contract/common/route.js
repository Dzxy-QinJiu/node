const contractUrl = '/rest/contract/v2/contract';
const invoiceUrl = contractUrl + '/invoice';
const repaymentUrl = '/rest/contract/v2/repayment';
const paymentUrl = '/rest/contract/v2/payment';
const costUrl = '/rest/contract/v2/cost';

module.exports = [{
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
    },
}, {
    'method': 'post',
    'path': repaymentUrl + '/query/:page_size/:sort_field/:order',
    'handler': 'queryRepayment',
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
}];
