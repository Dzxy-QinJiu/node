/**
 * 联系客户或线索统计
 */

export function getContactChart(type) {
    let title = '';
    let contactNumColumnTitle = '';

    if (type === 'customer') {
        title = Intl.get('analysis.contact.customer.statistics', '联系客户统计');
        contactNumColumnTitle = Intl.get('common.number.of.customers.contacted', '联系客户数');
    } else if (type === 'lead') {
        title = Intl.get('analysis.contact.clue.statistics', '联系线索统计');
        contactNumColumnTitle = Intl.get('analysis.number.of.contact.clue', '联系线索数');
    }

    return {
        title,
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/contact/lead/customer/num',
        argCallback: arg => {
            if (type) {
                arg.query.lead_customer = type;
            }

            arg.query.statistics_type = 'user';
        },
        dataField: 'list',
        option: {
            columns: [{
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: '10%',
            }, {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'user_name',
                width: '10%',
            }, {
                title: contactNumColumnTitle,
                dataIndex: 'trace_num',
                width: '10%',
            }, {
                title: Intl.get('common.number.of.calls.made', '接通数'),
                dataIndex: 'answer_phone_num',
                width: '10%',
            }, {
                title: Intl.get('common.number.of.calls.not.connected', '未接通数'),
                dataIndex: 'no_answer_phone_num',
                width: '10%',
            }]
        },
    };
}
