/**
 * 续签客户毛利分析
 */

export function getRenewalCustomerGrossProfitChart(paramObj = {}) {
    return {
        title: '续签客户毛利分析',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/renewal/gross',
        argCallback: paramObj.argCallback,
        processData: data => [data],
        option: {
            columns: [{
                title: '客户个数',
                dataIndex: 'count',
                align: 'right',
                width: '20%',
            }, {
                title: '续约前合同毛利',
                dataIndex: 'before',
                align: 'right',
                width: '20%',
            }, {
                title: '续约后合同毛利',
                dataIndex: 'after',
                align: 'right',
                width: '20%',
            }, {
                title: '续约金额增长率',
                dataIndex: 'percent',
                align: 'right',
                showAsPercent: true,
                width: '20%',
            }],
        },
    };
}
