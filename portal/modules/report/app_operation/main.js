import ReportLayout from '../layout';
import Analysis from '../../../components/analysis';
const localStorageAppIdKey = 'app_operation_stored_app_id';

const OperationReport = React.createClass({
    getInitialState() {
        return {
            totalUserAmount: '',
            neverLoginAmount: '',
            loginOnceAmount: '',
            avgLoginTime: '',
            avgLoginTimestamp: '',
            avgLogins: '',
            exceedAvgLogins: '',
            exceedAvgLoginLong: '',
            underAvgLogins: '',
            underAvgLoginLong: '',
            newAddedTrial: '',
            newAddedFormal: '',
        };
    },
    getComponent(component, props) {
        if (!props) props = {};
        if (!props.height) props.height = 290;
        props.localStorageAppIdKey = localStorageAppIdKey;

        return React.createElement(component, props, null);
    },
    //处理用户总数统计数据
    //数据的原始格式为：
    // {
    //     enabled: {total: 15, formal: 10, trial: 3, ...},
    //     disabled: {total: 10, formal: 5, unknown: 2, ...},
    // }
    processPropertyDisData(data) {
        if (!data.enabled && !data.disabled) {
            return [];
        } else {
            //启停用户
            let serieEnableDisable = {};
            //各类型用户
            let serieType = {};
            //用户总数
            let total = 0;

            if (data.enabled) {
                serieEnableDisable.enabled = data.enabled.total;
                total += data.enabled.total;
                serieType = _.clone(data.enabled);
            }

            if (data.disabled) {
                const disabledData = data.disabled;

                serieEnableDisable.disabled = disabledData.total;
                total += disabledData.total;
                if (_.isEmpty(serieType)) {
                    serieType = _.clone(disabledData);
                } else {
                    for (let key in serieType) {
                        const value = disabledData[key];
                        if (value) {
                            serieType[key] += value;
                        }
                    }
                }

                //各类型用户数据中去掉总数
                delete serieType.total;
            }

            this.setState({totalUserAmount: total, userTypePropData: serieType});

            return serieEnableDisable;
        }
    },
    //处理用户登录分布数据
    processLoginTeamDisData(key, data) {
        const list = data.data;

        if (_.isArray(list) && list.length) {
            const amount = _.chain(list).pluck('count').reduce((m, n) => m + n, 0).value();
            this.state[key] = amount;
            this.setState(this.state);
        }

        if (key === 'exceedAvgLogins' && data.avg > 0) {
            this.state.avgLogins = data.avg;
        }
        this.setState(this.state);

        return data;
    },
    //处理高于或低于平均登录时长的返回数据
    processLoginLongDisData(data) {
        let avg = data.avg;

        if (avg) {
            avg = parseInt(avg);
            const timeStr = this.timestampToFmtStr(avg);
            this.setState({
                avgLoginTime: timeStr,
                avgLoginTimestamp: avg,
            });
        }

        return data;
    },
    //处理新增用户统计数据
    processNewAddedUserData(data) {
        if (_.isArray(data) && data.length) {
            const trial = _.chain(data).pluck('trial').reduce((m, n) => m + n, 0).value();
            const formal = _.chain(data).pluck('formal').reduce((m, n) => m + n, 0).value();
            this.setState({
                newAddedTrial: trial,
                newAddedFormal: formal,
            });
        }

        return data;
    },
    //处理平均登录时长Y轴数据格式
    loginLongYaxisLabelFormatter(value) {
        const parsedValue = parseInt(value / 1000);
        return parsedValue || value;
    },
    //平均登录时长趋势图tooltip格式化
    loginLongAvgTrendTooltipFormatter(params) {
        const param = params[0];
        const seriesName = param.seriesName.replace(/（.*）/, '');
        const timeStr = this.timestampToFmtStr(param.value);

        return `${param.name}<br>${seriesName}：${timeStr}`;
    },
    //平均登录时长趋势图label格式化
    loginLongAvgTrendLabelFormatter(params) {
        const timeStr = this.timestampToFmtStr(params.value);

        return timeStr;
    },
    //时间戳转格式化字符串
    timestampToFmtStr(timestamp) {
        const duration = moment.duration(timestamp);
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        let str = '';

        if (years > 0) {
            str += years + Intl.get('common.time.unit.year', '年');
        }

        if (months > 0) {
            str += months + Intl.get('common.time.unit.month', '月');
        }

        if (days > 0) {
            str += days + Intl.get('common.time.unit.day', '天');
        }

        if (hours > 0) {
            str += hours + Intl.get('user.time.hour', '小时');
        }

        if (minutes > 0) {
            str += minutes + Intl.get('user.time.minute', '分');
        }

        if (seconds > 0) {
            str += seconds + Intl.get('user.time.second', '秒');
        }

        return str;
    },
    getSectionList() {
        return [
            {
                name: Intl.get('app_operation.0', '一、用户总体统计'),
                charts: [
                    {
                        name: Intl.get('app_operation.1','用户总数') + this.state.totalUserAmount + ', ' + Intl.get('app_operation.33', '启停用户分布'),
                        style: {width: '50%'},
                        content: this.getComponent(Analysis, {
                            chartType: 'pie',
                            target: 'User',
                            property: 'property_dis',
                            processData: this.processPropertyDisData,
                            excludeKey: ['total'],
                            legend: [{name: Intl.get('common.enabled', '启用'), key: 'enabled'}, {name: Intl.get('common.stop', '停用'), key: 'disabled'}]
                        })
                    },
                    {
                        name: Intl.get('app_operation.1','用户总数') + this.state.totalUserAmount + ', ' + Intl.get('app_operation.34', '各类型用户分布'),
                        style: {width: '50%'},
                        content: this.getComponent(Analysis, {
                            chartType: 'pie',
                            property: 'property_dis',
                            presetLegend: 'userType',
                            chartData: this.state.userTypePropData || {},
                        })
                    },
                    {
                        name: Intl.get('app_operation.4', '用户地域分布'),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            property: 'zone',
                            valueField: 'count',
                        })
                    },
                    {
                        name: Intl.get('app_operation.5', '用户行业分布'),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            property: 'industry',
                            valueField: 'count',
                        })
                    },
                    {
                        name: Intl.get('app_operation.6', '用户活跃数'),
                        content: this.getComponent(Analysis, {
                            chartType: 'line',
                            target: 'User',
                            type: 'operation_report',
                            property: 'logined_user=active=daily',
                            name: Intl.get('app_operation.6', '用户活跃数'),
                            dataField: 'actives',
                            valueField: 'active',
                            legend: false,
                        }),
                    },
                    {
                        name: Intl.get('app_operation.7', '平均登录时长趋势') + ', ' + Intl.get('app_operation.35', '平均值') + ': ' + this.state.avgLoginTime,
                        content: this.getComponent(Analysis, {
                            chartType: 'line',
                            target: 'User',
                            property: 'login_long_avg_trend',
                            name: Intl.get('app_operation.12', '平均登录时长（单位：秒'),
                            dataField: 'data',
                            yAxisLabelFormatter: this.loginLongYaxisLabelFormatter,
                            valueField: 'count',
                            legend: false,
                            tooltipFormatter: this.loginLongAvgTrendTooltipFormatter,
                            labelFormatter: this.loginLongAvgTrendLabelFormatter
                        })
                    },
                    {
                        name: Intl.get('app_operation.9', '平均登录次数趋势') + ', ' + Intl.get('app_operation.35', '平均值') + ': ' + this.state.avgLogins,
                        content: this.getComponent(Analysis, {
                            chartType: 'line',
                            target: 'User',
                            property: 'logins_avg_trend',
                            name: Intl.get('app_operation.10', '平均登录次数'),
                            dataField: 'data',
                            valueField: 'count',
                            legend: false,
                        })
                    },
                    {
                        name: Intl.get('app_operation.15', '各操作类别占比'),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar_pie',
                            target: 'User',
                            property: 'operation_dis',
                            dataField: 'data',
                            subField: 'sub_property',
                            height: 450,
                            legend: false
                        })
                    },
                    {
                        name: Intl.get('app_operation.11', '用户平均登录时长为') + this.state.avgLoginTime,
                        style: {width: '50%'},
                        content: this.getComponent(Analysis, {
                            chartType: 'pie',
                            target: 'User',
                            property: 'login_long_dis',
                            legend: [{name: Intl.get('app_operation.13', '高于平均时长'), key: 'higher'}, {name: Intl.get('app_operation.14', '低于平均时长'), key: 'lower'}],
                            excludeKey: ['appId', 'total', 'avg'],
                            processData: this.processLoginLongDisData
                        }),
                    },
                ]
            },
            {
                name: Intl.get('app_operation.16', '二、试用用户分析'),
                charts: [
                    {
                        name: Intl.get('app_operation.17', '用户留存分析'),
                        content: this.getComponent(Analysis, {
                            chartType: 'retention',
                            target: 'User',
                            type: 'trial',
                            property: 'retention',
                            minStartTime: moment().subtract(1, 'year').valueOf(),
                        }),
                    },
                    {
                        name: Intl.get('app_operation.18', '共有{count}个用户从未登录过系统', {count: this.state.neverLoginAmount}),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            type: 'trial',
                            property: 'not_logined_team_dis',
                            dataField: 'data',
                            valueField: 'count',
                            legend: [],
                            autoAdjustXaxisLabel: true,
                            jumpProps: {
                                url: '/user/list',
                                query: {
                                    analysis_filter_field: 'team_ids',
                                    user_type: '试用用户',
                                    is_filter_notlogined: true,
                                },
                            },
                            processData: this.processLoginTeamDisData.bind(this, 'neverLoginAmount')
                        }),
                    },
                    {
                        name: Intl.get('app_operation.19', '共有{count}个用户只登录过一次', {count: this.state.loginOnceAmount}),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            type: 'trial',
                            property: 'logined_team_dis',
                            dataField: 'data',
                            valueField: 'count',
                            query: {count: 1},
                            legend: [],
                            jumpProps: {
                                url: '/user/list',
                                query: {
                                    analysis_filter_field: 'team_ids',
                                    user_type: '试用用户',
                                    logins_min: 1,
                                    logins_max: 2,
                                },
                            },
                            processData: this.processLoginTeamDisData.bind(this, 'loginOnceAmount')
                        }),
                    },
                    {
                        name: Intl.get('app_operation.20', '共有{count}个用户高于平均登录次数', {count: this.state.exceedAvgLogins}),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            type: 'trial',
                            property: 'exceed_avg_logins_team_dis',
                            dataField: 'data',
                            valueField: 'count',
                            legend: [],
                            jumpProps: {
                                url: '/user/list',
                                query: {
                                    analysis_filter_field: 'team_ids',
                                    user_type: '试用用户',
                                    logins_min: this.state.avgLogins,
                                },
                            },
                            processData: this.processLoginTeamDisData.bind(this, 'exceedAvgLogins')
                        }),
                    },
                    {
                        name: Intl.get('app_operation.21', '共有{count}个用户高于平均登录时长', {count: this.state.exceedAvgLoginLong}),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            type: 'trial',
                            property: 'exceed_avg_login_long_team_dis',
                            dataField: 'data',
                            valueField: 'count',
                            legend: [],
                            jumpProps: {
                                url: '/user/list',
                                query: {
                                    analysis_filter_field: 'team_ids',
                                    user_type: '试用用户',
                                    login_time_min: this.state.avgLoginTimestamp,
                                },
                            },
                            processData: this.processLoginTeamDisData.bind(this, 'exceedAvgLoginLong')
                        }),
                    },
                ]
            },
            {
                name: Intl.get('app_operation.22', '三、签约用户分析'),
                charts: [
                    {
                        name: Intl.get('app_operation.23', '共有{count}个用户低于平均登录时长', {count: this.state.underAvgLoginLong}),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            type: 'signed',
                            property: 'under_avg_login_long_team_dis',
                            dataField: 'data',
                            valueField: 'count',
                            legend: [],
                            jumpProps: {
                                url: '/user/list',
                                query: {
                                    analysis_filter_field: 'team_ids',
                                    user_type: '正式用户',
                                    login_time_max: this.state.avgLoginTimestamp,
                                },
                            },
                            processData: this.processLoginTeamDisData.bind(this, 'underAvgLoginLong')
                        }),
                    },
                    {
                        name: Intl.get('app_operation.24', '共有{count}个用户低于平均登录次数', {count: this.state.underAvgLogins}),
                        content: this.getComponent(Analysis, {
                            chartType: 'bar',
                            target: 'User',
                            type: 'signed',
                            property: 'under_avg_logins_team_dis',
                            dataField: 'data',
                            valueField: 'count',
                            legend: [],
                            jumpProps: {
                                url: '/user/list',
                                query: {
                                    analysis_filter_field: 'team_ids',
                                    user_type: '正式用户',
                                    logins_max: this.state.avgLogins,
                                    logins_min: 1,
                                },
                            },
                            processData: this.processLoginTeamDisData.bind(this, 'underAvgLogins')
                        }),
                    },
                ]
            },
            {
                name: Intl.get('app_operation.25', '四、新增用户情况'),
                charts: [
                    {
                        name: Intl.get('app_operation.26', '新增{countTrial}试用，{countFormal}正式', {countTrial: this.state.newAddedTrial, countFormal: this.state.newAddedFormal}),
                        content: this.getComponent(Analysis, {
                            chartType: 'line',
                            target: 'User',
                            type: 'added',
                            property: 'summary',
                            presetLegend: 'userType',
                            processData: this.processNewAddedUserData
                        }),
                    },
                    {
                        name: Intl.get('app_operation.28', '留存分析，7日留存'),
                        content: this.getComponent(Analysis, {
                            chartType: 'retention',
                            target: 'User',
                            type: 'retention',
                            property: 'retention_null',
                            query: {interval: 'daily'},
                            minStartTime: moment().subtract(7, 'day').valueOf(),
                        }),
                    },
                    {
                        name: Intl.get('app_operation.30', '活跃数分析'),
                        content: this.getComponent(Analysis, {
                            chartType: 'line',
                            target: 'User',
                            type: 'new_added',
                            property: 'users=activation=daily',
                            name: Intl.get('app_operation.30', '活跃数分析'),
                            dataField: 0,
                            dataField2: 'actives',
                            valueField: 'active',
                            legend: false,
                        }),
                    },
                ]
            },
        ];
    },
    render() {
        return (
            <div className="app-operation" data-tracename="应用运营报告">
                <ReportLayout
                    localStorageAppIdKey={localStorageAppIdKey}
                    sectionList={this.getSectionList()}
                />
            </div>
        );
    }
});

module.exports = OperationReport;
