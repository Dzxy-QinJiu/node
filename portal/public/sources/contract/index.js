var RightContent = require('../../../components/privilege/right-content');

var Checker = require('CMP_DIR/privilege/checker');
//合同列表
var Contract = require('MOD_DIR/contract');
//合同仪表盘
var ContractDashboard = require('MOD_DIR/contract/dashboard-index');
//分析
const ContractAnalysis = require('MOD_DIR/contract/analysis');
// 提成计算
const SalesCommission = require('MOD_DIR/sales_commission');
// 提成发放
const CommissionPayment = require('MOD_DIR/commission_payment');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('contract',
        [
            ContractDashboard,
            Contract('sell'),
            Contract('buy'),
            Contract('repayment'),
            Contract('cost'),
            SalesCommission('sales_commission'),
            CommissionPayment('commission_payment'),
            ContractAnalysis
        ]
    );
    return childRoutes;
}

module.exports = {
    path: 'contract',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    getChildRoutes: function(location, cb) {
        var childRoutes = getChildRoutes();
        cb(null, childRoutes);
    },
    component: RightContent
};
