/**
 * 销售开通账号统计
 */

import { argCallbackUnderlineTimeToTime } from '../../utils';

export function getAccountSalesOpenAccountChart() {
    return {
        title: '销售开通账号统计',
        url: '/rest/customer/v2/customer/:data_type/app/user/count',
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'table',
        layout: {
            sm: 24,
        },
        noShowCondition: {
            app_id: '!all',
        },
        option: {
            pagination: false,
            bordered: true,
            columns: [
                {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                }, {
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'sales_team_name',
                    isSetCsvValueBlank: true,
                },
            ],
        },
        customOption: {
            fieldName: 'app_map',
            needExtractColumns: true,
            needSummaryColumn: true,
            summaryColumnTitle: Intl.get('sales.home.total.compute', '总计'),
            summaryColumnKey: 'total',
            needSummaryRow: true,
            summaryRowTitle: Intl.get('sales.home.total.compute', '总计'),
        },
        //不让表格显示纵向滚动条
        height: 'auto',
        processOption: option => {
            _.each(option.columns, (column, index) => {
                //设置列宽
                column.width = 100;
                //统计数据右对齐
                if (index > 1) column.align = 'right';
            });
        }
    };
}
