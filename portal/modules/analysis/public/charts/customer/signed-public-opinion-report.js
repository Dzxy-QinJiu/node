/**
 * 签约客户舆情报送统计
 */

export function getSignedCustomerPublicOpinionReportChart() {
    return {
        title: Intl.get('common.signed.customer.public.opinion.report.statistics', '签约客户舆情报送统计'),
        chartType: 'table',
        url: '/rest/customer/v3/customer/report',
        argCallback: arg => {
            //该接口的团队id参数名和公共参数里的不一致，需要单独处理一下
            if (arg.query.team_ids) {
                arg.query.sales_teamd_id = arg.query.team_ids;
            }
        },
        processData: data => {
            //计算报送数量总计
            const total = _.sumBy(data, 'report_num');
            //将总计加入数据集
            data.push({
                customer_name: Intl.get('sales.home.total.compute', '总计'),
                report_num: total
            });

            return data;
        },
        option: {
            columns: [{
                title: Intl.get('crm.4', '客户名称'),
                dataIndex: 'customer_name',
                width: '50%',
            }, {
                title: Intl.get('common.report.num', '报送数量'),
                dataIndex: 'report_num',
                width: '50%',
            }],
        },
    };
}
