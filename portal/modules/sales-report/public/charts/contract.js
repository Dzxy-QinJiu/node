/**
 * 合同情况
 */

export const contractChart = {
    title: Intl.get('weekly.report.contract', '合同情况'),
    chartType: 'table',
    url: '/rest/analysis/contract/report/contract/:auth_type',
    ajaxInstanceFlag: 'sales_report_contract',
    argCallback: arg => {
        if (arg.query.member_id) {
            arg.query.user_ids = arg.query.member_id;
            delete arg.query.member_id;
        }
    },
    processData: data => {
        if (_.isArray(data) && data.length) {
            //合同按签订时间排序
            data = _.sortBy(data, 'date').reverse();

            const amountSum = _.sumBy(data, 'amount');
            const grossProfitSum = _.sumBy(data, 'grossProfit');

            data.push({
                customerName: Intl.get('common.summation', '合计') + ' ' + Intl.get('sales.home.count', '{count}个', {count: data.length}),
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
            title: Intl.get('weekly.report.assign.time', '签约时间'),
            dataIndex: 'date',
            width: '20%'
        }, {
            title: Intl.get('weekly.report.contract.account', '合同金额'),
            dataIndex: 'amount',
            width: '20%'
        }, {
            title: Intl.get('contract.109', '毛利'),
            dataIndex: 'grossProfit',
            width: '20%'
        }],
    },
};
