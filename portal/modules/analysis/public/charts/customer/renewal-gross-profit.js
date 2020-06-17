/**
 * 续签客户毛利分析
 */

export function getRenewalCustomerGrossProfitChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.renew.customer.gross.profit.analysis', '续签客户毛利分析'),
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/renewal/gross',
        argCallback: paramObj.argCallback,
        processData: data => [data],
        option: {
            columns: [{
                title: Intl.get('analysis.number.of.customers', '客户个数'),
                dataIndex: 'count',
                align: 'right',
                width: '20%',
            }, {
                title: Intl.get('analysis.contract.gross.profit.before.renewal', '续约前合同毛利'),
                dataIndex: 'before',
                align: 'right',
                width: '20%',
            }, {
                title: Intl.get('analysis.contract.gross.profit.after.renewal', '续约后合同毛利'),
                dataIndex: 'after',
                align: 'right',
                width: '20%',
            }, {
                title: Intl.get('analysis.growth.rate.of.renewal.amount', '续约金额增长率'),
                dataIndex: 'percent',
                align: 'right',
                showAsPercent: true,
                width: '20%',
            }],
        },
    };
}
