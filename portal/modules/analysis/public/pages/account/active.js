/**
 * 活跃分析
 */

import { numToPercent, getRangeReqData } from '../../utils';
import { WEEKDAY } from '../../consts';

//登录次数请求参数
const loginNumReqData = getRangeReqData(
    [
        [1, 2, 3, 4, 5, 6, 7, 8],
        {
            'from': 9,
            'to': 14
        },
        {
            'from': 15,
            'to': 25
        },
        {
            'from': 25,
            'to': 50
        },
        {
            'from': 51,
            'to': 100
        },
        {
            'from': 101,
            'to': 200
        },
        {
            'from': 200,
            'to': 10000
        }
    ]
);

//登录天数请求参数
const loginDayNumReqData = getRangeReqData(
    [
        [1, 2, 3, 4],
        {
            'from': 5,
            'to': 10
        },
        {
            'from': 11,
            'to': 15
        },
        {
            'from': 16,
            'to': 20
        },
        {
            'from': 21,
            'to': 50
        },
        {
            'from': 51,
            'to': 100
        },
        {
            'from': 100,
            'to': 10000
        }
    ]
);

//在线时间请求参数
const onlineTimeReqData = getRangeReqData(
    [
        {
            'from': 0,
            'to': 1
        },
        {
            'from': 1,
            'to': 5
        },
        {
            'from': 5,
            'to': 10
        },
        {
            'from': 10,
            'to': 10000
        }
    ]
    , 60
);

module.exports = {
    title: '活跃分析',
    menuIndex: 2,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    return [{
        title: Intl.get('operation.report.activity', '活跃度'),
        url: '/rest/analysis/user/v1/:auth_type/:app_id/users/activation/:interval',
        chartType: 'line',
        valueField: 'active',
        cardContainer: {
            operateButtons: [{value: 'daily', name: Intl.get('operation.report.day.active', '日活')},
                {value: 'weekly', name: Intl.get('operation.report.week.active', '周活')},
                {value: 'monthly', name: Intl.get('operation.report.month.active', '月活')}],
            activeButton: 'daily',
            conditionName: 'interval',
        },
        conditions: [{
            name: 'interval',
            value: 'daily',
            type: 'params',
        }],
        option: {
            tooltip: {
                formatter: params => {
                    const data = params[0].data;
                    const cardTab = data.cardTab;
                    let name = data.name;

                    if (cardTab === 'weekly') {
                        name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                    } else if (cardTab === 'monthly') {
                        name = moment(name).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
                    }

                    return `
                        ${name}<br>
                        ${Intl.get('operation.report.active.num', '活跃数')}：${data.value}<br>
                        ${Intl.get('operation.report.total.num', '总数')}：${data.total}<br>
                        ${Intl.get('operation.report.active', '活跃率')}：${(data.percent * 100).toFixed(2)}%
                    `;
                },
            },
        },
        customOption: {
            yAxises: [
                {
                    name: Intl.get('operation.report.user.count', '用户数'),
                },
                {
                    name: Intl.get('operation.report.active', '活跃率'),
                    position: 'right',
                    min: 0,
                    max: 100,
                    splitNumber: 1,
                },
            ],
        },
        csvOption: {
            rowNames: [
                {
                    name: Intl.get('common.login.time', '时间'),
                    key: 'name',
                },
                {
                    name: Intl.get('operation.report.active.num', '活跃数'),
                    key: 'value',
                },
                {
                    name: Intl.get('operation.report.active', '活跃率'),
                    key: 'percent',
                    render: function(td) {
                        return `${(td * 100).toFixed(2)}%`;
                    }
                },
                {
                    name: Intl.get('operation.report.total.num', '总数'),
                    key: 'total',
                },
            ],
        },
    }, {
        title: Intl.get('oplate.user.analysis.10', '活跃时间段'),
        url: '/rest/analysis/auditlog/v1/:app_id/operations/weekly',
        chartType: 'scatter',
        option: {
            tooltip: {
                formatter: params => {
                    const name = WEEKDAY[params.seriesIndex];
                    const data = params.data;
                    return `
                        ${name}${data[0]}${Intl.get('crm.75', ' 点')}<br>
                        ${Intl.get('oplate.user.analysis.29', '操作数')}：${data[1]}
                    `;
                },
            },
        },
        xAxisLabels: _.range(24),
        yAxisLabels: WEEKDAY,
        generateCsvData: function(data) {
            let csvData = [];
            let thead = [Intl.get('common.login.time', '时间')];
            _.each(_.range(24), hour => {
                thead.push(hour + Intl.get('crm.75', ' 点'));
            });
            csvData.push(thead);

            const weekData = _.groupBy(data, dataItem => dataItem.week);
            _.each(weekData, (weekDataItem, index) => {
                let tr = _.map(weekDataItem, 'count');
                tr.unshift(WEEKDAY[index]);
                csvData.push(tr);
            });
            return csvData;
        },
    }, {
        title: Intl.get('oplate.user.analysis.6', '在线时长统计'),
        url: '/rest/analysis/user/v1/:tab/login_long',
        conditions: [{
            name: 'ranges',
            value: 1,
        }],
        chartType: 'pie',
        nameValueMap: {
            0: Intl.get('oplate.user.analysis.7', '时长小于1小时'),
            1: Intl.get('oplate.user.analysis.8', '时长大于1小时'),
        },
    }, {
        title: Intl.get('oplate.user.analysis.loginCounts', '用户访问次数'),
        url: '/rest/analysis/user/v3/:auth_type/logins/distribution/num',
        reqType: 'post',
        conditions: [{
            value: loginNumReqData,
            type: 'data',
        }],
        chartType: 'wordcloud',
        unit: Intl.get('common.label.times', '次'),
        csvOption: {
            thead: [Intl.get('user.login.time', '次数'), Intl.get('common.app.count', '数量')],
        },
    }, {
        title: Intl.get('user.analysis.active.user.area.statistics', '活跃用户地域统计'),
        url: '/rest/analysis/user/v3/:auth_type/zone/province',
        chartType: 'map',
        height: 546,
        csvOption: {
            reverse: true,
        },
        subChart: {
            chartType: 'table',
            option: {
                columns: [
                    {title: Intl.get('crm.96', '地域'), dataIndex: 'name', key: 'name'},
                    {title: Intl.get('operation.report.user.count', '用户数'), dataIndex: 'value', key: 'value', className: 'text-align-right'}
                ],
                pagination: {
                    pageSize: 12,
                },
            },
        },
    }, {
        title: Intl.get('oplate.user.analysis.loginDays', '用户访问天数'),
        url: '/rest/analysis/user/v3/:auth_type/login/day/distribution/num',
        reqType: 'post',
        conditions: [{
            value: loginDayNumReqData,
            type: 'data',
        }],
        chartType: 'wordcloud',
        unit: Intl.get('common.time.unit.day', '天'),
        csvOption: {
            thead: [Intl.get('oplate.user.analysis.loginDays', '用户访问天数'), Intl.get('common.app.count', '数量')],
        },
    }, {
        title: Intl.get('oplate.user.analysis.loginTimes', '用户在线时间'),
        url: '/rest/analysis/user/v3/:auth_type/online_time/distribution/num',
        reqType: 'post',
        conditions: [{
            value: onlineTimeReqData,
            type: 'data',
        }],
        chartType: 'wordcloud',
        unit: Intl.get('common.label.hours', '小时'),
        multiple: 60,
        csvOption: {
            thead: [Intl.get('oplate.user.analysis.loginTimes', '用户在线时间'), Intl.get('common.app.count', '数量')],
        },
    }, {
        title: Intl.get('oplate.user.analysis.averageLoginTimes', '平均在线时长'),
        url: '/rest/analysis/user/v3/:auth_type/app/avg/online_time/trend',
        conditions: [{
            name: 'interval',
            value: 'hourly',
        }],
        chartType: 'bar',
        option: {
            tooltip: {
                formatter: params => {
                    const data = params.data;
                    const cardSelectValue = data.cardSelectValue;
                    let name = data.name;

                    if (cardSelectValue === 'hourly') {
                        name = `${name} ${moment(data.timestamp).get('h')}:00`;
                    } else if (cardSelectValue === 'weekly') {
                        name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                    } else if (cardSelectValue === 'monthly') {
                        name = moment(name).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
                    } else if (cardSelectValue === 'quarterly') {
                        name = `${moment(name).format('YYYY年Q')}季度`;
                    } else if (cardSelectValue === 'yearly') {
                        name = `${moment(name).format('YYYY')}年`;
                    }

                    return `
                        ${name}<br>
                        ${Intl.get('common.app.minute', '分钟')}：${moment.duration(data.value).asMinutes().toFixed()}
                    `;
                },
            },
        },
        processOption(option, chartProps) {
            //设置y轴名称，用以标识y轴数值的单位
            _.set(option, 'yAxis[0].name', Intl.get('common.app.minute', '分钟'));

            //时间区间
            const interval = _.get(chartProps, 'cardContainer.selectors[0].activeOption');

            //按小时查看时，横轴显示天和小时
            if (interval === 'hourly') {
                const xAxisData = _.map(chartProps.data, dataItem => {
                    return moment(dataItem.timestamp).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT);
                });
                _.set(option, 'xAxis[0].data', xAxisData);
            }

            //系列数据
            const serieData = _.get(option, 'series[0].data');

            _.each(serieData, dataItem => {
                //将通话时间转成分钟
                dataItem.value = moment.duration(dataItem.value).asMinutes().toFixed();
            });
        },
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.label.hours', '小时'), value: 'hourly'},
                    {name: Intl.get('common.time.unit.day', '天'), value: 'daily'},
                    {name: Intl.get('common.time.unit.week', '周'), value: 'weekly'},
                    {name: Intl.get('common.time.unit.month', '月'), value: 'monthly'},
                    {name: Intl.get('common.time.unit.quarter', '季度'), value: 'quarterly'},
                    {name: Intl.get('common.time.unit.year', '年'), value: 'yearly'}
                ],
                activeOption: 'hourly',
                conditionName: 'interval',
            }],
        },
    }];
}
