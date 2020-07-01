/**
 * 通话时长分布统计
 */

//时间区间
const TIME_INTERVAL = {
    '0.0': Intl.get('analysis.number.of.calls.lasting.interval.seconds', '通话时长{interval}秒的通话个数', {interval: Intl.get('apply.add.condition.less', '小于') + '30'}),
    '30.0': Intl.get('analysis.number.of.calls.lasting.interval.seconds', '通话时长{interval}秒的通话个数', {interval: '30-60'}),
    '60.0': Intl.get('analysis.number.of.calls.lasting.interval.seconds', '通话时长{interval}秒的通话个数', {interval: '60-90'}),
    '90.0': Intl.get('analysis.number.of.calls.lasting.interval.seconds', '通话时长{interval}秒的通话个数', {interval: '90-120'}),
    '120.0': Intl.get('analysis.number.of.calls.lasting.interval.seconds', '通话时长{interval}秒的通话个数', {interval: Intl.get('apply.add.condition.larger', '大于') + '120'}),
};

//集客方式
const SOURCE_CLASSIFY = {
    inbound: Intl.get('crm.clue.client.source.inbound', '市场'),
    outbound: Intl.get('analysis.expand', '拓展'),
};

export function getCallDurationDistributionChart(paramObj = {}) {
    const { type } = paramObj;
    let title = Intl.get('analysis.cue.call.analysis', '线索通话分析');

    if (SOURCE_CLASSIFY[type]) title = SOURCE_CLASSIFY[type] + title;

    return {
        title,
        layout: {sm: 24},
        height: 'auto',
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/callrecord/billsec/histogram',
        argCallback: arg => {
            if (type) arg.query.source_classify = type;
        },
        dataField: 'list',
        processData: data => {
            _.each(data, item => {
                _.each(item.billsec_list, billsecItem => {
                    item[billsecItem.name] = billsecItem.count;
                });
            });

            return data;
        },
        processOption: (option, chart) => {
            let columns = [];
            option.columns = columns;

            const hasNickName = _.chain(chart.data).first().has('nick_name').value();

            if (hasNickName) {
                columns.push({
                    title: Intl.get('menu.member', '成员'),
                    dataIndex: 'nick_name',
                    width: 100,
                });
            }

            columns.push({
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: 100,
            });

            _.each(TIME_INTERVAL, (value, key) => {
                columns.push({
                    title: value,
                    dataIndex: key,
                    width: 190,
                    align: 'right',
                });
            });
        }
    };
}
