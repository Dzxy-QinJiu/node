/**
 * 出差统计详情
 */

import { MERIDIEM } from 'PUB_DIR/sources/utils/consts';

export function getBusinessTripStatisticsDetailChart() {
    return {
        title: Intl.get('analysis.business.trip.statistics', '出差统计详情'),
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/base/v1/workflow/businesstrip/customervisit/list',
        processData: data => {
            _.each(data, item => {
                item.visit_record_time = moment(item.visit_record_time).format(oplateConsts.DATE_FORMAT);

                if (item.visit_start === item.visit_end) {
                    item.visit_time = transAmPm(item.visit_start);
                } else {
                    item.visit_time = transAmPm(item.visit_start) + ' - ' + transAmPm(item.visit_end);
                }
            });

            return data;
        },
        option: {
            columns: [{
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'nickname',
                width: 100,
            }, {
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'team_name',
                width: 100,
            }, {
                title: Intl.get('crm.41', '客户名'),
                dataIndex: 'customer_name',
                width: 200,
            }, {
                title: Intl.get('bussiness.trip.time.range', '拜访时间'),
                dataIndex: 'visit_time',
                width: 260,
            }, {
                title: Intl.get('common.remark', '备注'),
                dataIndex: 'remarks',
                width: 200,
            }, {
                title: Intl.get('analysis.follow-up.record.content', '跟进记录内容'),
                dataIndex: 'visit_record',
                width: 200,
            }, {
                title: Intl.get('analysis.follow-up.time', '跟进记录时间'),
                dataIndex: 'visit_record_time',
                width: 120,
            }],
        }
    };

    //将日期字符串中的AM转成上午,PM转成下午
    function transAmPm(dateStr = '') {
        return dateStr.replace('_', '').replace('AM', MERIDIEM.AM).replace('PM', MERIDIEM.PM);
    }
}
