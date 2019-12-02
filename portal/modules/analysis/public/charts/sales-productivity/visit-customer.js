/**
 * 拜访客户统计
 */

import { WEEKDAY } from '../../consts';

//查询条件缓存
let conditionCache = null;
//第一层图表缓存
let levelOneChartCache = null;
//第二层图表缓存
let levelTwoChartCache = null;
//分析组件实例缓存
let analysisInstanceCache = null;
//图表索引缓存
let chartIndexCache = -1;

export function getVisitCustomerChart() {
    let chart = {
        title: Intl.get('analysis.business.visit.frequency.statistics', '出差拜访频率统计'),
        chartType: 'table',
        layout: { sm: 24 },
        height: 'auto',
        url: '/rest/base/v1/workflow/businesstrip/customervisit/statistic',
        argCallback: arg => {
            //将查询条件缓存下来，供进入第二级或第三级图表查询时使用
            const {start_time, end_time, team_ids} = arg.query;
            conditionCache = {start_time, end_time};
            if (team_ids) conditionCache.team_ids = team_ids;
        },
        processData: (data, chart, analysisInstance, chartIndex) => {
            //将分析组件实例缓存下来，供一、二、三级图表间切换时使用
            analysisInstanceCache = analysisInstance;
            //将图表索引缓存下来，供一、二、三级图表间切换时使用
            chartIndexCache = chartIndex;

            //返回数据为空时，直接返回空数组，界面上显示暂无数据
            if (_.isEmpty(data)) return [];

            const startTime = conditionCache.start_time;
            const endTime = conditionCache.end_time;
            const dayDiff = moment(endTime).diff(startTime, 'days');
            let processedData = [];

            for (let i = 0; i <= dayDiff; i++) {
                const day = moment(endTime).subtract(i, 'days');
                const dayEnd = day.valueOf();
                const dayStart = day.startOf('day').valueOf();
                let dayStr = day.format(oplateConsts.DATE_FORMAT);
                let weekDayIndex = day.weekday() + 1;
                if (weekDayIndex === 7) weekDayIndex = 0;
                const weekDay = WEEKDAY[weekDayIndex];
                dayStr += '(' + weekDay + ')';
                let dataItem = { day_str: dayStr };
                const matchedItem = _.find(data, item => item.visit_time >= dayStart && item.visit_time <= dayEnd);

                if (matchedItem) {
                    _.extend(dataItem, matchedItem);

                    //增加销售名字段，供导出用
                    dataItem.sales_names = _.map(dataItem.users, 'nick_name').join('、');

                    //增加客户名字段，供导出用
                    dataItem.customer_names = _.map(dataItem.customers, 'name').join('、');
                }

                processedData.push(dataItem);
            }

            return processedData;
        },
        option: {
            columns: [{
                title: Intl.get('crm.146', '日期'),
                dataIndex: 'day_str',
                width: 150,
            }, {
                title: Intl.get('leave.apply.add.leave.person', '出差人员'),
                dataIndex: 'sales_names',
                isSetCsvValueBlank: true,
                render: (value, record) => {
                    let users = record.users;

                    users = _.map(users, (item, index) => {
                        let seperator = null;

                        if (users.length > 1 && index < (users.length - 1)) {
                            seperator = '、';
                        }

                        return (
                            <span className="clickable-with-color" onClick={onSalesNameClick.bind(this, item.nick_name, item.user_id)}>
                                {item.nick_name}
                                {seperator}
                            </span>
                        );
                    });

                    return <div>{users}</div>;
                }
            }]
        },
    };

    //销售人员名点击事件
    function onSalesNameClick(salesName, userId) {
        let charts = analysisInstanceCache.state.charts;

        let chart = charts[chartIndexCache];
        levelOneChartCache = _.cloneDeep(chart);

        chart.title = Intl.get('analysis.sales.visiting.customer.frequency', '{sales}拜访客户频率统计', {sales: salesName});
        const subTitle = <span className="clickable" onClick={backToLevelOne}>{Intl.get('crm.52', '返回')}</span>;
        _.set(chart, 'cardContainer.props.subTitle', subTitle);

        conditionCache.user_id = userId;

        chart.conditions = _.map(conditionCache, (value, key) => ({name: key, value}));

        chart.option.columns = [
            {
                title: Intl.get('crm.146', '日期'),
                dataIndex: 'day_str',
                width: 150,
            },
            {
                title: Intl.get('customer.visit.customer', '拜访客户'),
                dataIndex: 'customer_names',
                isSetCsvValueBlank: true,
                render: (value, record) => {
                    let customers = record.customers;

                    customers = _.map(customers, (item, index) => {
                        let seperator = null;

                        if (customers.length > 1 && index < (customers.length - 1)) {
                            seperator = '、';
                        }

                        return (
                            <span className="clickable-with-color" onClick={onCustomerNameClick.bind(this, item.name, item.id)}>
                                {item.name}
                                {seperator}
                            </span>
                        );
                    });

                    return <div>{customers}</div>;
                }
            },
        ];

        analysisInstanceCache.getData(chartIndexCache);
    }

    //销售人员名点击事件
    function onCustomerNameClick(customerName, customerId) {
        let charts = analysisInstanceCache.state.charts;

        let chart = charts[chartIndexCache];
        levelTwoChartCache = _.cloneDeep(chart);

        chart.title = Intl.get('analysis.visits.customer.frequency', '拜访{customer}的频率统计', {customer: customerName});
        const subTitle = <span className="clickable" onClick={backToLevelTwo}>{Intl.get('crm.52', '返回')}</span>;
        _.set(chart, 'cardContainer.props.subTitle', subTitle);

        conditionCache.customer_id = customerId;

        chart.conditions = _.map(conditionCache, (value, key) => ({name: key, value}));


        chart.option.columns = [
            {
                title: Intl.get('crm.146', '日期'),
                dataIndex: 'day_str',
                width: 150,
            },
            {
                title: Intl.get('sales.home.sales', '销售'),
                width: 150,
                dataIndex: 'sales_names',
                isSetCsvValueBlank: true,
                render: (value, record) => {
                    let users = _.map(record.users, 'nick_name');
                    users = users.join('、');

                    return <div>{users}</div>;
                }
            },
            {
                title: Intl.get('common.customer.visit.record', '拜访记录'),
                dataIndex: 'visit_record',
                isSetCsvValueBlank: true,
            },
        ];

        analysisInstanceCache.getData(chartIndexCache);
    }

    //返回第一层
    function backToLevelOne() {
        let charts = analysisInstanceCache.state.charts;
        charts[chartIndexCache] = levelOneChartCache;

        analysisInstanceCache.setState({charts});
    }

    //返回第二层
    function backToLevelTwo() {
        let charts = analysisInstanceCache.state.charts;
        charts[chartIndexCache] = levelTwoChartCache;

        analysisInstanceCache.setState({charts});
    }

    return chart;
}
