/**
 * 用户分析
 */

var React = require('react');
require('./css/oplate-user-analysis.less');
import { AntcAnalysis } from 'antc';
import AnalysisFilter from 'CMP_DIR/analysis/filter';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
const TopNav = require('CMP_DIR/top-nav');
const userData = require('PUB_DIR/sources/user-data');
const emitters = require('PUB_DIR/sources/utils/emitters');

//从 unknown 到 未知 的对应关系对象
const unknownObj = {name: Intl.get('user.unknown', '未知'), key: 'unknown'};

//从 unknown 到 未知 的映射
let unknownDataMap = {};
unknownDataMap[unknownObj.key] = unknownObj.name;

//tab转换映射，用于建立tab键值和接口需要的参数值的对应
const tabTransMap = {total: 'all', added: 'add'};

//图表内定义的tab条件
const chartTabCondition = {
    name: 'analysis_type',
    value: 'all',
    isTabCondition: true,
    transMap: tabTransMap
};

//用户类型
//Todo: 移到公共常量文件中
const USER_TYPES = [
    {name: Intl.get('common.official', '签约'), key: 'formal', dataName: '正式用户'},
    {name: Intl.get('common.trial', '试用'), key: 'trial', dataName: '试用用户'},
    {name: Intl.get('user.type.presented', '赠送'), key: 'special'},
    {name: Intl.get('user.type.train', '培训'), key: 'training'},
    {name: Intl.get('user.type.employee', '员工'), key: 'internal'},
    unknownObj,
];

//用户类型名到中文的映射
let userTypeDataMap = {};

_.each(USER_TYPES, userType => {
    const mapKey = userType.dataName || userType.key;
    userTypeDataMap[mapKey] = userType.name;
});

//带标题的用户类型名数组
const USER_TYPES_WITH_TITLE = [{
    name: Intl.get('oplate.user.analysis.user.type', '用户类型'),
    key: 'name'
}]
    .concat(USER_TYPES)
    .concat([{
        name: Intl.get('operation.report.total.num', '总数'),
        key: 'total'
    }]);

//权限类型
const authType = hasPrivilege('USER_ANALYSIS_MANAGER') ? 'manager' : 'common';

//一周7天的中文名
//Todo: 移到公共常量文件中
const WEEKDAY = [
    Intl.get('user.time.sunday', '周日'),
    Intl.get('user.time.monday', '周一'),
    Intl.get('user.time.tuesday', '周二'),
    Intl.get('user.time.wednesday', '周三'),
    Intl.get('user.time.thursday', '周四'),
    Intl.get('user.time.friday', '周五'),
    Intl.get('user.time.saturday', '周六')
];

//范围类型
const rangeType = hasPrivilege('CRM_MANAGER_APP_USER_COUNT') ? 'all' : 'self';

//是否是销售
const isSales = userData.hasRole(userData.ROLE_CONSTANS.SALES) ||
                userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER) ||
                userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);

//获取范围请求参数
function getRangeReqData(rangeParams, multiple) {
    let reqData = [];

    rangeParams.forEach(rangeParam => {
        if (Array.isArray(rangeParam)) {
            reqData.push(...rangeParam.map(value => ({
                'from': value,
                'to': value
            })));
        }
        else {
            if (multiple) {
                rangeParam = _.mapValues(rangeParam, value => value * multiple);
            }
            reqData.push(rangeParam);
        }
    });

    return reqData;
}

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

//将请求参数值中的delayed转为delay
function processArgDelayed(arg) {
    const analysisType = _.get(arg, 'query.analysis_type');

    if (analysisType === 'delayed') {
        arg.query.analysis_type = 'delay';
    }
}

class OPLATE_USER_ANALYSIS extends React.Component {
    //获取图表定义
    getCharts = () => {
        return [{
            title: 'Tabs',
            url: '/rest/analysis/user/v1/:auth_type/summary',
            chartType: 'tab',
            tabs: [
                {
                    key: 'total',
                    title: Intl.get('oplate.user.analysis.11', '总用户'),
                    active: true,
                },
                {
                    key: 'added',
                    title: Intl.get('oplate.user.analysis.12', '新增用户'),
                },
                {
                    key: 'delayed',
                    title: Intl.get('operation.report.app.delay.user', '延期用户'),
                    layout: {
                        sm: 4,
                    },
                    noShowCondition: {
                        app_id: 'all',
                    },
                },
                {
                    key: 'expired',
                    title: Intl.get('oplate.user.analysis.13', '过期用户'),
                },
                {
                    key: 'added_expired',
                    title: Intl.get('oplate.user.analysis.14', '新增过期用户'),
                },
            ],
        }, {
            title: Intl.get('oplate.user.analysis.user.type', '用户类型'),
            url: '/rest/analysis/user/v1/:auth_type/:tab/type',
            chartType: 'pie',
            //是否支持点图筛选
            useChartFilter: true,
            //点图筛选时的参数名
            chartFilterKey: 'type',
            option: {
                legend: {
                    data: USER_TYPES,
                },
            },
            //什么情况下不显示
            noShowCondition: {
                //综合应用下
                app_id: 'all',
                //延期Tab下
                tab: ['delayed'],
            },
            //数据值转换映射，原始数据中的值会被转换成映射后的值
            nameValueMap: userTypeDataMap,
        }, {
            title: Intl.get('oplate.user.analysis.app.status', '用户状态'),
            url: '/rest/analysis/user/v1/:auth_type/:tab/status',
            chartType: 'pie',
            useChartFilter: true,
            chartFilterKey: 'status',
            noShowCondition: {
                app_id: 'all',
                tab: ['delayed'],
            },
            nameValueMap: {
                '0': Intl.get('common.stop', '停用'),
                '1': Intl.get('common.enabled', '启用'),
            },
        }, {
            title: Intl.get('user.analysis.total', '用户统计'),
            url: '/rest/analysis/user/v1/:auth_type/:tab/summary',
            noShowCondition: {
                tab: ['delayed'],
            },
            chartType: 'bar',
            option: {
                legend: {
                    data: USER_TYPES,
                },
            },
            customOption: {
                stack: true,
            },
            csvOption: {
                rowNames: USER_TYPES_WITH_TITLE,
            },
            overide: {
                condition: {
                    app_id: 'all',
                },
                chartType: 'line',
                option: {
                    legend: {
                        type: 'scroll',
                        pageIconSize: 10,
                    },
                },
                customOption: {
                    stack: false,
                    multi: true,
                    serieNameField: 'app_name',
                    serieNameValueMap: {
                        '': Intl.get('oplate.user.analysis.22', '综合'),
                    },
                },
                generateCsvData: function(data) {
                    let csvData = [];
                    let thead = [Intl.get('common.product.name','产品名称')];
                    let subData = data[0] && data[0].data;
                    if (!subData) return [];

                    thead = thead.concat(_.map(subData, 'name'));
                    csvData.push(thead);
                    _.each(data, dataItem => {
                        const appName = dataItem.app_name || Intl.get('oplate.user.analysis.22', '综合');
                        let tr = [appName];
                        tr = tr.concat(_.map(dataItem.data, 'value'));
                        csvData.push(tr);
                    });
                    return csvData;
                },
            },
        }, {
            title: Intl.get('user.analysis.team', '团队统计'),
            url: '/rest/analysis/user/v1/:auth_type/:tab/team',
            chartType: 'bar',
            useChartFilter: true,
            chartFilterKey: 'team',
            noShowCondition: {
                tab: ['delayed'],
            },
            nameValueMap: unknownDataMap,
            overide: {
                condition: {
                    app_id: 'all',
                },
                url: '/rest/analysis/user/v1/:auth_type/apps/:tab/team',
                useChartFilter: false,
                customOption: {
                    stack: true,
                    legendData: USER_TYPES,
                },
                csvOption: {
                    rowNames: USER_TYPES_WITH_TITLE,
                },
            },
        }, {
            title: Intl.get('user.analysis.address', '地域统计'),
            url: '/rest/analysis/user/v1/:auth_type/:tab/zone',
            chartType: 'bar',
            useChartFilter: true,
            chartFilterKey: 'zone',
            noShowCondition: {
                tab: ['delayed', 'added', 'expired'],
            },
            nameValueMap: unknownDataMap,
            overide: {
                condition: {
                    app_id: 'all',
                },
                url: '/rest/analysis/user/v1/:auth_type/apps/:tab/zone',
                useChartFilter: false,
                customOption: {
                    stack: true,
                    legendData: USER_TYPES,
                },
                csvOption: {
                    rowNames: USER_TYPES_WITH_TITLE,
                },
            },
        }, {
            title: Intl.get('user.analysis.industry', '行业统计'),
            url: '/rest/analysis/user/v1/:auth_type/:tab/industry',
            chartType: 'bar',
            useChartFilter: true,
            chartFilterKey: 'industry',
            noShowCondition: {
                tab: ['delayed'],
            },
            nameValueMap: unknownDataMap,
            overide: {
                condition: {
                    app_id: 'all',
                },
                url: '/rest/analysis/user/v1/:auth_type/apps/:tab/industry',
                useChartFilter: false,
                customOption: {
                    stack: true,
                    reverse: true,
                    legendData: USER_TYPES,
                },
                csvOption: {
                    rowNames: USER_TYPES_WITH_TITLE,
                },
            },
        }, {
            title: Intl.get('user.analysis.sales.users', '销售开通用户统计'),
            url: '/rest/customer/v2/customer/:range_type/app/user/count',
            chartType: 'table',
            layout: {
                sm: 24,
            },
            noShowCondition: {
                app_id: '!all',
                tab: ['!', 'total'],
            },
            conditions: [{
                name: 'range_type',
                value: rangeType,
                type: 'params',
            }],
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
            },
        }, {
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
            noShowCondition: {
                app_id: 'all',
                tab: ['delayed', 'added_expired'],
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
            noShowCondition: {
                app_id: 'all',
                tab: ['delayed', 'added', 'expired', 'added_expired'],
                callback: () => isSales,
            },
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
            title: Intl.get('oplate.user.analysis.9', '用户留存'),
            url: '/rest/analysis/user/v1/retention',
            chartType: 'table',
            noShowCondition: {
                app_id: 'all',
                tab: ['delayed', 'total', 'expired', 'added_expired'],
                callback: (conditions) => {
                    if (isSales) return true;

                    const startTimeCondition = _.find(conditions, condition => condition.name === 'starttime');
                    const startTime = startTimeCondition && startTimeCondition.value;
                    const endTimeCondition = _.find(conditions, condition => condition.name === 'endtime');
                    const endTime = endTimeCondition && endTimeCondition.value;

                    if (startTime && endTime && (moment(endTime).diff(startTime, 'd') > 7)) {
                        return true;
                    }
                },
            },
            option: {
                columns: (() => {
                    let columns = [
                        {
                            title: Intl.get('common.login.time', '时间'),
                            dataIndex: 'timestamp',
                            width: '10%',
                            align: 'left',
                            render: text => {
                                text = moment(text).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
                                return <b>{text}</b>;
                            },
                        }, {
                            title: Intl.get('oplate.user.analysis.32', '新增数'),
                            dataIndex: 'count',
                            width: '10%',
                        }, {
                            title: Intl.get('oplate.user.analysis.23', '当天'),
                            dataIndex: 'day0',
                            width: '10%',
                            align: 'right',
                            render: text => {
                                text = isNaN(text) ? '0' : text;
                                return <span>{text}</span>;
                            },
                        }, {
                            title: Intl.get('oplate.user.analysis.24', '次日'),
                            dataIndex: 'day1',
                            width: '10%',
                            align: 'right',
                            render: (text, record) => {
                                if (moment().diff(record.timestamp, 'day') < 1) {
                                    text = '';
                                } else {
                                    text = isNaN(text) ? '0' : text;
                                }
                                return <span>{text}</span>;
                            },
                        },
                    ];

                    _.each(_.range(5), num => {
                        const index = num + 2;

                        columns.push({
                            title: Intl.get('oplate.user.analysis.25', '{count}天后', {count: index}),
                            dataIndex: 'day' + index,
                            width: '10%',
                            align: 'right',
                            render: (text, record) => {
                                if (moment().diff(record.timestamp, 'day') < index) {
                                    text = '';
                                } else {
                                    text = isNaN(text) ? '0' : text;
                                }
                                return <span>{text}</span>;
                            },
                        });
                    });

                    return columns;
                })(),
            },
            customOption: {
                fieldName: 'actives',
                needExtractColumns: true,
                callback: dataItem => {
                    const actives = dataItem.actives;

                    _.each(actives, activeItem => {
                        const diffDay = moment(activeItem.timestamp).diff(dataItem.timestamp, 'day');
                        dataItem['day' + diffDay] = activeItem.active;
                    });
                },
            },
        }, {
            title: Intl.get('oplate.user.analysis.6', '在线时长统计'),
            url: '/rest/analysis/user/v1/:tab/login_long',
            conditions: [{
                name: 'ranges',
                value: 1,
            }],
            chartType: 'pie',
            noShowCondition: {
                app_id: 'all',
                tab: ['delayed', 'added', 'added_expired'],
                callback: () => isSales,
            },
            nameValueMap: {
                0: Intl.get('oplate.user.analysis.7', '时长小于1小时'),
                1: Intl.get('oplate.user.analysis.8', '时长大于1小时'),
            },
        }, {
            title: Intl.get('oplate.user.analysis.device', '设备统计'),
            url: '/rest/analysis/user/v3/:auth_type/device',
            conditions: [chartTabCondition],
            chartType: 'bar',
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
        }, {
            title: Intl.get('oplate.user.analysis.browser', '浏览器统计'),
            url: '/rest/analysis/user/v3/:auth_type/browser',
            conditions: [chartTabCondition],
            chartType: 'bar',
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
        }, {
            title: Intl.get('oplate.user.analysis.loginCounts', '用户访问次数'),
            url: '/rest/analysis/user/v3/:auth_type/logins/distribution/num',
            reqType: 'post',
            conditions: [{
                value: loginNumReqData,
                type: 'data',
            },
            chartTabCondition
            ],
            argCallback: processArgDelayed,
            chartType: 'wordcloud',
            unit: Intl.get('common.label.times', '次'),
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
            csvOption: {
                thead: [Intl.get('user.login.time', '次数'), Intl.get('common.app.count', '数量')],
            },
        }, {
            title: Intl.get('user.analysis.active.user.area.statistics', '活跃用户地域统计'),
            url: '/rest/analysis/user/v3/:auth_type/zone/province',
            conditions: [chartTabCondition],
            chartType: 'map',
            height: 546,
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
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
            },
            chartTabCondition
            ],
            argCallback: processArgDelayed,
            chartType: 'wordcloud',
            unit: Intl.get('common.time.unit.day', '天'),
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
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
            },
            chartTabCondition
            ],
            argCallback: processArgDelayed,
            chartType: 'wordcloud',
            unit: Intl.get('common.label.hours', '小时'),
            multiple: 60,
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
            csvOption: {
                thead: [Intl.get('oplate.user.analysis.loginTimes', '用户在线时间'), Intl.get('common.app.count', '数量')],
            },
        }, {
            title: Intl.get('oplate.user.analysis.averageLoginTimes', '平均在线时长'),
            url: '/rest/analysis/user/v3/:auth_type/app/avg/online_time/trend',
            conditions: [{
                name: 'interval',
                value: 'hourly',
            },
            chartTabCondition
            ],
            argCallback: processArgDelayed,
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
                            ${Intl.get('common.app.minute', '分钟')}：${data.value}
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
            noShowCondition: {
                app_id: 'all',
                tab: ['added_expired'],
            },
        }];
    };

    getEmitters = () => {
        return [{
            emitter: emitters.appSelectorEmitter,
            event: emitters.appSelectorEmitter.SELECT_APP,
            callbackArgs: [{
                name: 'app_id',
            }],
        }, {
            emitter: emitters.dateSelectorEmitter,
            event: emitters.dateSelectorEmitter.SELECT_DATE,
            callbackArgs: [{
                name: 'starttime',
            }, {
                name: 'endtime',
            }],
        }];
    };

    render() {
        const charts = this.getCharts();

        return (
            <div className="oplate_user_analysis"
                data-tracename="用户分析"
            >
                <TopNav>
                    <TopNav.MenuList/>
                    <AnalysisFilter />
                </TopNav>

                <AntcAnalysis
                    charts={charts}
                    emitterConfigList={this.getEmitters()}
                    isUseScrollBar={true}
                    conditions={[{
                        name: 'app_id',
                        value: 'all',
                        type: 'query,params',
                    }, {
                        name: 'starttime',
                        value: moment().startOf('isoWeek').valueOf(),
                    }, {
                        name: 'endtime',
                        value: moment().valueOf(),
                    }, {
                        name: 'auth_type',
                        value: authType,
                        type: 'params',
                    }]}
                />
            </div>
        );
    }
}

module.exports = OPLATE_USER_ANALYSIS;

