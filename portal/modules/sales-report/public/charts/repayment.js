/**
 * 回款情况
 */

export const repaymentChart = {
    title: Intl.get('weekly.report.repayment', '回款情况'),
    chartType: 'table',
    url: '/rest/analysis/contract/report/repayment/:auth_type',
    ajaxInstanceFlag: 'sales_report_repayment',
    argCallback: arg => {
        if (arg.query.member_id) {
            arg.query.user_ids = arg.query.member_id;
            delete arg.query.member_id;
        }
    },
    processData: data => {
        if (_.isArray(data) && data.length) {
            //回款按回款时间排序
            data = _.sortBy(data, 'date').reverse();

            const amountSum = _.sumBy(data, 'amount');
            const grossProfitSum = _.sumBy(data, 'grossProfit');

            data.push({
                customerName: Intl.get('common.summation', '合计'),
                amount: amountSum,
                grossProfit: grossProfitSum
            });
        }

        return data;
    },
    option: {
        columns: [{
            title: Intl.get('sales.home.customer', '客户'),
            dataIndex: 'customerName',
            width: '40%',
        }, {
            title: Intl.get('contract.122', '回款时间'),
            dataIndex: 'date',
            width: '20%'
        }, {
            title: Intl.get('weekly.report.repayment.account', '回款金额'),
            dataIndex: 'amount',
            width: '20%'
        }, {
            title: Intl.get('contract.109', '毛利'),
            dataIndex: 'grossProfit',
            width: '20%'
        }],
    },
};
