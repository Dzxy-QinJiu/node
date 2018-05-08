/**
 * 用户分析
 */

require("./css/oplate-user-analysis.less");
const TopNav = require("CMP_DIR/top-nav");
const AnalysisMenu = require("CMP_DIR/analysis_menu");
import { AntcDatePicker, AntcAnalysis } from "antc";
import AnalysisFilter from "CMP_DIR/analysis/filter";
const GeminiScrollbar = require("CMP_DIR/react-gemini-scrollbar");
const AnalysisLayout = require("./utils/analysis-layout");
import { hasPrivilege } from "CMP_DIR/privilege/checker";
const userData = require("PUB_DIR/sources/user-data");

const Emitters = require("PUB_DIR/sources/utils/emitters");
const emitters = {
    dateSelectorEmitter: Emitters.dateSelectorEmitter,
    appSelectorEmitter: Emitters.appSelectorEmitter,
    analysisTabEmitter: Emitters.analysisTabEmitter,
    chartClickEmitter: Emitters.chartClickEmitter,
};

const unknownObj = {name: Intl.get("user.unknown", "未知"), key: "unknown"};

let unknownDataMap = {};
unknownDataMap[unknownObj.key] = unknownObj.name;

const USER_TYPES = [
        {name: Intl.get("common.official", "签约"), key: "formal", dataName: "正式用户"},
        {name: Intl.get("common.trial", "试用"), key: "trial", dataName: "试用用户"},
        {name: Intl.get("user.type.presented", "赠送"), key: "special"},
        {name: Intl.get("user.type.train", "培训"), key: "training"},
        {name: Intl.get("user.type.employee", "员工"), key: "internal"},
        unknownObj,
    ];

let userTypeDataMap = {};

_.each(USER_TYPES, userType => {
    const mapKey = userType.dataName || userType.key;
    userTypeDataMap[mapKey] = userType.name;
});

const USER_TYPES_WITH_TITLE = [{
        name: Intl.get("oplate.user.analysis.user.type", "用户类型"),
        key: "name"
    }]
    .concat(USER_TYPES)
    .concat([{
        name: Intl.get('operation.report.total.num', '总数'),
        key: "total"
    }]);

const authType = hasPrivilege("USER_ANALYSIS_MANAGER")? "manager" : "common";

const WEEKDAY = [
        Intl.get("user.time.sunday", "周日"),
        Intl.get("user.time.monday", "周一"),
        Intl.get("user.time.tuesday", "周二"),
        Intl.get("user.time.wednesday", "周三"),
        Intl.get("user.time.thursday", "周四"),
        Intl.get("user.time.friday", "周五"),
        Intl.get("user.time.saturday", "周六")
    ];

const rangeType = hasPrivilege("CRM_MANAGER_APP_USER_COUNT")? "all" : "self";

const isSales = userData.hasRole(userData.ROLE_CONSTANS.SALES) ||
                userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER) ||
                userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);

var OPLATE_USER_ANALYSIS = React.createClass({
    getInitialState: function () {
        return {};
    },
    componentDidMount: function () {
        $(window).on('resize', this.windowResize);
    },
    componentWillUnmount: function () {
        $(window).off('resize', this.windowResize);
    },
    windowResize: function () {
        this.setState(this.state);
    },

    getTabs: function () {
        const tabs = [
            {
                key: "total",
                title: Intl.get("oplate.user.analysis.11", "总用户"),
                isSelected: true,
            },
            {
                key: "added",
                title: Intl.get("oplate.user.analysis.12", "新增用户"),
            },
            {
                key: "delayed",
                title: Intl.get("operation.report.app.delay.user", "延期用户"),
                layout: {
                    sm: 4,
                },
                notShowWhen: {
                    app: "all",
                },
            },
            {
                key: "expired",
                title: Intl.get("oplate.user.analysis.13", "过期用户"),
            },
            {
                key: "added_expired",
                title: Intl.get("oplate.user.analysis.14", "新增过期用户"),
            },
        ];

        return tabs;
    },

    getSummaryCharts: function () {
        return [{
            url: `/rest/analysis/user/v1/${authType}/summary`,
        }];
    },

    getCharts: function () {
        return [{
            title: Intl.get("oplate.user.analysis.user.type", "用户类型"),
            url: `/rest/analysis/user/v1/${authType}/:tab/type`,
            chartType: "pie",
            useChartFilter: true,
            option: {
                legend: {
                    data: USER_TYPES,
                },
            },
            notShowWhen: {
                app: "all",
                tab: ["delayed"],
            },
            nameValueMap: userTypeDataMap,
        }, {
            title: Intl.get("oplate.user.analysis.app.status", "用户状态"),
            url: `/rest/analysis/user/v1/${authType}/:tab/status`,
            chartType: "pie",
            useChartFilter: true,
            notShowWhen: {
                app: "all",
                tab: ["delayed"],
            },
            nameValueMap: {
                "0": Intl.get("common.stop", "停用"),
                "1": Intl.get("common.enabled", "启用"),
            },
        }, {
            title: Intl.get("user.analysis.total", "用户统计"),
            url: `/rest/analysis/user/v1/${authType}/:tab/summary`,
            notShowWhen: {
                tab: ["delayed"],
            },
            chartType: "bar",
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
                when: {
                    app: "all",
                },
                chartType: "line",
                option: {
                    legend: {
                        type: "scroll",
                        pageIconSize: 10,
                    },
                },
                customOption: {
                    stack: false,
                    multi: true,
                    serieNameField: "app_name",
                    serieNameValueMap: {
                        "": Intl.get("oplate.user.analysis.22", "综合"),
                    },
                },
                generateCsvData: function (data) {
                    let csvData = [];
                    let thead = [Intl.get("common.app.name", "应用名称")];
                    let subData = data[0] && data[0].data;
                    if (!subData) return [];

                    thead = thead.concat(_.pluck(subData, "name"));
                    csvData.push(thead);
                    _.each(data, dataItem => {
                        const appName = dataItem.app_name || Intl.get("oplate.user.analysis.22", "综合");
                        let tr = [appName];
                        tr = tr.concat(_.pluck(dataItem.data, "value"));
                        csvData.push(tr);
                    });
                    return csvData;
                },
            },
        }, {
            title: Intl.get("user.analysis.team", "团队统计"),
            url: `/rest/analysis/user/v1/${authType}/:tab/team`,
            chartType: "bar",
            useChartFilter: true,
            notShowWhen: {
                tab: ["delayed"],
            },
            nameValueMap: unknownDataMap,
            overide: {
                when: {
                    app: "all",
                },
                url: `/rest/analysis/user/v1/${authType}/apps/:tab/team`,
                useChartFilter: false,
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
            },
        }, {
            title: Intl.get("user.analysis.address", "地域统计"),
            url: `/rest/analysis/user/v1/${authType}/:tab/zone`,
            chartType: "bar",
            useChartFilter: true,
            notShowWhen: {
                tab: ["delayed", "added", "expired"],
            },
            nameValueMap: unknownDataMap,
            overide: {
                when: {
                    app: "all",
                },
                url: `/rest/analysis/user/v1/${authType}/apps/:tab/zone`,
                useChartFilter: false,
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
            },
        }, {
            title: Intl.get("user.analysis.industry", "行业统计"),
            url: `/rest/analysis/user/v1/${authType}/:tab/industry`,
            chartType: "bar",
            useChartFilter: true,
            notShowWhen: {
                tab: ["delayed"],
            },
            nameValueMap: unknownDataMap,
            overide: {
                when: {
                    app: "all",
                },
                url: `/rest/analysis/user/v1/${authType}/apps/:tab/industry`,
                useChartFilter: false,
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
            },
        }, {
            title: Intl.get("user.analysis.sales.users", "销售开通用户统计"),
            url: `/rest/customer/v2/customer/${rangeType}/app/user/count`,
            chartType: "table",
            layout: {
                sm: 24,
            },
            showWhen: {
                app: "all",
                tab: ["total"],
            },
            tableOption: {
                pagination: false,
                bordered: true,
                columns: [
                    {
                        title: Intl.get("sales.home.sales", "销售"),
                        dataIndex: 'member_name',
                    }, {
                        title: Intl.get("user.user.team", "团队"),
                        dataIndex: 'sales_team_name',
                    },
                ],
                subDataProps: {
                    fieldName: "app_map",
                    fieldType: "object",
                    needExtractColumns: true,
                    needSummaryColumn: true,
                    summaryColumnTitle: Intl.get("sales.home.total.compute", "总计"),
                    summaryColumnKey: "total",
                    needSummaryRow: true,
                    summaryRowTitle: Intl.get("sales.home.total.compute", "总计"),
                },
            },
        }, {
            title: Intl.get("operation.report.activity", "活跃度"),
            url: `/rest/analysis/user/v1/${authType}/:app_id/users/activation/:card_tab`,
            chartType: "line",
            valueField: "active",
            cardContainer: {
                operateButtons: [{value: 'daily', name: Intl.get("operation.report.day.active", "日活")},
                    {value: 'weekly', name: Intl.get("operation.report.week.active", "周活")},
                    {value: 'monthly', name: Intl.get("operation.report.month.active", "月活")}],
                activeButton: "daily",
            },
            option: {
                tooltip: {
                    formatter: params => {
                        const data = params[0].data;
                        const cardTab = data.cardTab;
                        let name = data.name;

                        if (cardTab === "weekly") {
                            name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                        } else if (cardTab === "monthly") {
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
                        name: Intl.get("operation.report.user.count", "用户数"),
                    },
                    {
                        name: Intl.get('operation.report.active', '活跃率'),
                        position: "right",
                        min: 0,
                        max: 100,
                        splitNumber: 1,
                    },
                ],
            },
            notShowWhen: {
                app: "all",
                tab: ["delayed", "added_expired"],
            },
            csvOption: {
                rowNames: [
                    {
                        name: Intl.get("common.login.time", "时间"),
                        key: "name",
                    },
                    {
                        name: Intl.get("operation.report.active.num", "活跃数"),
                        key: "value",
                    },
                    {
                        name: Intl.get("operation.report.active", "活跃率"),
                        key: "percent",
                        render: function (td) {
                            return `${(td * 100).toFixed(2)}%`;
                        }
                    },
                    {
                        name: Intl.get("operation.report.total.num", "总数"),
                        key: "total",
                    },
                ],
            },
        }, {
            title: Intl.get("oplate.user.analysis.10", "活跃时间段"),
            url: `/rest/analysis/auditlog/v1/:app_id/operations/weekly`,
            chartType: "scatter",
            option: {
                tooltip: {
                    formatter: params => {
                        const name = WEEKDAY[params.seriesIndex];
                        const data = params.data;
                        return `
                            ${name}${data[0]}${Intl.get("crm.75", " 点")}<br>
                            ${Intl.get("oplate.user.analysis.29", "操作数")}：${data[1]}
                        `;
                    },
                },
            },
            xAxisLabels: _.range(24),
            yAxisLabels: WEEKDAY,
            notShowWhen: {
                app: "all",
                tab: ["delayed", "added", "expired", "added_expired"],
                isTrue: isSales,
            },
            generateCsvData: function (data) {
                let csvData = [];
                let thead = [Intl.get("common.login.time", "时间")];
                _.each(_.range(24), hour => {
                    thead.push(hour + Intl.get("crm.75", " 点"));
                });
                csvData.push(thead);

                const weekData = _.groupBy(data, dataItem => dataItem.week);
                _.each(weekData, (weekDataItem, index) => {
                    let tr = _.pluck(weekDataItem, "count");
                    tr.unshift(WEEKDAY[index]);
                    csvData.push(tr);
                });
                return csvData;
            },
        }, {
            title: Intl.get("oplate.user.analysis.9", "用户留存"),
            url: `/rest/analysis/user/v1/retention`,
            chartType: "table",
            notShowWhen: {
                app: "all",
                tab: ["delayed", "total", "expired", "added_expired"],
                timeRange: ">7d",
                isTrue: isSales,
            },
            tableOption: {
                pagination: false,
                columns: (() => {
                    let columns = [
                        {
                            title: Intl.get("common.login.time", "时间"),
                            dataIndex: "timestamp",
                            render: text => {
                                text = moment(text).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
                                return <b>{text}</b>;
                            },
                        }, {
                            title: Intl.get("oplate.user.analysis.32", "新增数"),
                            dataIndex: "count",
                        }, {
                            title: Intl.get("oplate.user.analysis.23", "当天"),
                            dataIndex: "day0",
                            render: text => {
                                text = isNaN(text)? "0" : text;
                                return <span>{text}</span>;
                            },
                        }, {
                            title: Intl.get("oplate.user.analysis.24", "次日"),
                            dataIndex: "day1",
                            render: (text, record) => {
                                if (moment().diff(record.timestamp, "day") <= 1) {
                                    text = "";
                                } else {
                                    text = isNaN(text)? "0" : text;
                                }
                                return <span>{text}</span>;
                            },
                        },
                    ];

                    _.each(_.range(5), num => {
                        const index = num + 2;

                        columns.push({
                            title: Intl.get("oplate.user.analysis.25", "{count}天后", {count: index}),
                            dataIndex: "day" + index,
                            render: (text, record) => {
                                if (moment().diff(record.timestamp, "day") <= index) {
                                    text = "";
                                } else {
                                    text = isNaN(text)? "0" : text;
                                }
                                return <span>{text}</span>;
                            },
                        });
                    });

                    return columns;
                })(),
                subDataProps: {
                    fieldName: "actives",
                    fieldType: "array",
                    needExtractColumns: true,
                    callback: dataItem => {
                        const actives = dataItem.actives;

                        _.each(actives, activeItem => {
                            const diffDay = moment(activeItem.timestamp).diff(dataItem.timestamp, "day");
                            dataItem["day" + diffDay] = activeItem.active;
                        });
                    },
                },
            },
        }, {
            title: Intl.get("oplate.user.analysis.6", "在线时长统计"),
            url: `/rest/analysis/user/v1/:tab/login_long`,
            reqQuery: {
                ranges: 1,
            },
            chartType: "pie",
            notShowWhen: {
                app: "all",
                tab: ["delayed", "added", "added_expired"],
                isTrue: isSales,
            },
            nameValueMap: {
                0: Intl.get("oplate.user.analysis.7", "时长小于1小时"),
                1: Intl.get("oplate.user.analysis.8", "时长大于1小时"),
            },
        }, {
            title: Intl.get("oplate.user.analysis.device", "设备统计"),
            url: `/rest/analysis/user/v3/${authType}/device`,
            chartType: "bar",
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
        }, {
            title: Intl.get("oplate.user.analysis.browser", "浏览器统计"),
            url: `/rest/analysis/user/v3/${authType}/browser`,
            chartType: "bar",
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
        }, {
            title: Intl.get("oplate.user.analysis.loginCounts", "用户访问次数"),
            url: `/rest/analysis/user/v3/${authType}/logins/distribution/num`,
            reqType: "post",
            reqDataGenerator: "loginNum",
            chartType: "wordcloud",
            unit: Intl.get("common.label.times", "次"),
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
            csvOption: {
                thead: [Intl.get("user.login.time", "次数"), Intl.get("common.app.count", "数量")],
            },
        }, {
            title: Intl.get("user.analysis.active.user.area.statistics", "活跃用户地域统计"),
            url: `/rest/analysis/user/v3/${authType}/zone/province`,
            chartType: "map",
            height: 546,
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
            subChart: {
                chartType: "table",
                tableOption: {
                    columns: [
                        {title: Intl.get("crm.96", "地域"), dataIndex: 'name', key: 'name'},
                        {title: Intl.get("operation.report.user.count", "用户数"), dataIndex: 'value', key: 'value', className: 'text-align-right'}
                    ],
                    pagination: {
                        pageSize: 12,
                    },
                },
            },
        }, {
            title: Intl.get("oplate.user.analysis.loginDays", "用户访问天数"),
            url: `/rest/analysis/user/v3/${authType}/login/day/distribution/num`,
            reqType: "post",
            reqDataGenerator: "loginDayNum",
            chartType: "wordcloud",
            unit: Intl.get("common.time.unit.day", "天"),
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
            csvOption: {
                thead: [Intl.get("oplate.user.analysis.loginDays", "用户访问天数"), Intl.get("common.app.count", "数量")],
            },
        }, {
            title: Intl.get("oplate.user.analysis.loginTimes", "用户在线时间"),
            url: `/rest/analysis/user/v3/${authType}/online_time/distribution/num`,
            reqType: "post",
            reqDataGenerator: "onlineTime",
            chartType: "wordcloud",
            unit: Intl.get("common.label.hours", "小时"),
            multiple: 60,
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
            csvOption: {
                thead: [Intl.get("oplate.user.analysis.loginTimes", "用户在线时间"), Intl.get("common.app.count", "数量")],
            },
        }, {
            title: Intl.get("oplate.user.analysis.averageLoginTimes", "平均在线时长"),
            url: `/rest/analysis/user/v3/${authType}/app/avg/online_time/trend`,
            chartType: "bar",
            option: {
                tooltip: {
                    formatter: params => {
                        const data = params.data;
                        const cardSelectValue = data.cardSelectValue;
                        let name = data.name;

                        if (cardSelectValue === "hourly") {
                            name = `${name} ${moment(data.timestamp).get("h")}:00`;
                        } else if (cardSelectValue === "weekly") {
                            name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                        } else if (cardSelectValue === "monthly") {
                            name = moment(name).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
                        } else if (cardSelectValue === "quarterly") {
                            name = `${moment(name).format("YYYY年Q")}季度`;
                        } else if (cardSelectValue === "yearly") {
                            name = `${moment(name).format("YYYY")}年`;
                        }

                        return `
                            ${name}<br>
                            ${Intl.get("common.app.minute", "分钟")}：${moment.duration(data.value).asMinutes().toFixed()}
                        `;
                    },
                },
            },
            cardContainer: {
                selectOptions: [
                    {name: Intl.get("common.label.hours", "小时"), value: "hourly"},
                    {name: Intl.get("common.time.unit.day", "天"), value: "daily"},
                    {name: Intl.get("common.time.unit.week", "周"), value: "weekly"},
                    {name: Intl.get("common.time.unit.month", "月"), value: "monthly"},
                    {name: Intl.get("common.time.unit.quarter", "季度"), value: "quarterly"},
                    {name: Intl.get("common.time.unit.year", "年"), value: "yearly"}
                    ],
                activeOption: "hourly",
                selectQueryField: "interval",
            },
            notShowWhen: {
                app: "all",
                tab: ["added_expired"],
            },
        }];
    },

    render: function () {
        const chartListHeight = $(window).height() -
            AnalysisLayout.LAYOUTS.TOP -
            AnalysisLayout.LAYOUTS.BOTTOM - 20;

        const summaryCharts = this.getSummaryCharts();
        const tabs = this.getTabs();
        const charts = this.getCharts();

        return (
            <div className="oplate_user_analysis"
                data-tracename="用户分析"
            >
                <TopNav>
                    <AnalysisMenu />
                    <AnalysisFilter
                    />
                </TopNav>

                <div className="summary-numbers">
                    <AntcAnalysis
                        isTabSelector={true}
                        tabs={tabs}
                        charts={summaryCharts}
                        emitters={emitters}
                    />
                </div>

                <AntcAnalysis
                    charts={charts}
                    emitters={emitters}
                    tabs={tabs}
                    useScrollBar={true}
                    height={chartListHeight}
                    style={{padding: "0 24px"}}
                />
            </div>
        );
    }
});

module.exports = OPLATE_USER_ANALYSIS;
