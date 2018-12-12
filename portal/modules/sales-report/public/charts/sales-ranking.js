/**
 * 销售排名
 */

export const salesRankingChart = {
    title: '销售排名',
    chartType: 'table',
    layout: {sm: 24},
    url: [
        //合同数排名
        '/rest/analysis/contract/contract/:data_type/order/contract/count',
        //回款毛利排名
        '/rest/analysis/contract/contract/:data_type/order/repay/gross/profit',
        //客户流失率排名
        '/rest/analysis/contract/contract/:data_type/order/customer/churn/rate',
        //销售跟进客户数排名
        '/rest/analysis/customer/v2/customertrace/:data_type/sale/trace/ranking',
    ],
    ajaxInstanceFlag: 'sales_report_sales_ranking',
    argCallback: arg => {
        if (arg.query.member_id) {
            arg.query.member_ids = arg.query.member_id;
            delete arg.query.member_id;
        }

        if (arg.query.starttime) {
            arg.query.start_time = arg.query.starttime;
            delete arg.query.start_time;
        }

        if (arg.query.endtime) {
            arg.query.end_time = arg.query.endtime;
            delete arg.query.end_time;
        }
    },
    processData: data => {
        console.log(data);
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
