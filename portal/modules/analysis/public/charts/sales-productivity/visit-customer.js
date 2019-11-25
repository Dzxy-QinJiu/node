/**
 * 拜访客户统计
 */

let conditionCache = {};

export function getVisitCustomerChart() {
    let chart = {
        title: Intl.get('common.sales.behavior.statistics', '拜访客户统计'),
        chartType: 'table',
        url: '/rest/analysis/callrecord/v1/customertrace/:data_type/sale/trace/statistics',
        argCallback: arg => {
            arg.query.result_type = 'user';

            conditionCache = arg.query;
        },
        processData: (data, chart, analysisInstance, chartIndex) => {
            chart.option = {
                columns: [{
                    title: '日期',
                    dataIndex: 'sales_team',
                    width: '10%',
                }, {
                    title: '出差人员',
                    dataIndex: 'nick_name',
                    width: '10%',
                    render: (value, record) => {
                        return <span onClick={onSalesNameClick.bind(this, record, analysisInstance, chartIndex)}>{value}</span>;
                    }
                }]
            };

            const list = _.get(data, 'list');
            return _.filter(list, item => item.visit > 0);
        },
    };

    //销售人员名点击事件
    function onSalesNameClick(record, analysisInstance, chartIndex) {
        let charts = analysisInstance.state.charts;

        let chart = charts[chartIndex];

        chart.title = <div>拜访客户频率统计<span>返回</span></div>;
        chart.url = '/rest/analysis/callrecord/v1/customertrace/sale/visit/statistics';

        conditionCache.member_id = record.user_id;

        chart.conditions = _.map(conditionCache, (value, key) => ({name: key, value}));

        chart.processData = data => data.list;

        chart.option.columns = [
            {
                title: '日期',
                dataIndex: 'customer_name',
                width: '10%'
            },
            {
                title: '拜访客户',
                dataIndex: 'customer_name',
                width: '10%'
            },
        ];

        analysisInstance.getData(chartIndex);
    }

    return chart;
}
