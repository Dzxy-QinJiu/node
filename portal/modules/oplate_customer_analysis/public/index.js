/**
 * 客户分析
 */

var React = require('react');
require('./css/oplate-customer-analysis.less');
import ajax from 'ant-ajax';
import { AntcAnalysis } from 'antc';
import AnalysisFilter from 'CMP_DIR/analysis/filter';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { parseAmount } from 'LIB_DIR/func';
import { processCustomerStageData, processOrderStageData } from 'PUB_DIR/sources/utils/analysis-util';
const TopNav = require('CMP_DIR/top-nav');
const userData = require('PUB_DIR/sources/user-data');
const emitters = require('PUB_DIR/sources/utils/emitters');
const querystring = require('querystring');
const history = require('PUB_DIR/sources/history');
import publicPrivilegeConst from 'PUB_DIR/privilege-const';

//从 unknown 到 未知 的对应关系对象
const unknownObj = { name: Intl.get('user.unknown', '未知'), key: 'unknown' };

//从 unknown 到 未知 的映射
let unknownDataMap = {};
unknownDataMap[unknownObj.key] = unknownObj.name;

//权限类型
const authType = hasPrivilege('CUSTOMER_ANALYSIS_MANAGER') ? 'manager' : 'common';

//合格标签，1代表当前合格
const QUALIFY_LABEL_PASS = 1;

//销售新开客户类型
const CUSTOMER_TYPE_OPTIONS = [
    {
        value: '',
        name: Intl.get('oplate_customer_analysis.type.all', '全部类型')
    },
    {
        value: '试用用户',
        name: Intl.get('oplate_customer_analysis.type.trial', '试用用户')
    },
    {
        value: '正式用户',
        name: Intl.get('oplate_customer_analysis.type.formal', '正式用户')
    },
    {
        value: 'internal',
        name: Intl.get('oplate_customer_analysis.type.employee', '员工用户')
    },
    {
        value: 'special',
        name: Intl.get('oplate_customer_analysis.type.gift', '赠送用户')
    },
    {
        value: 'training',
        name: Intl.get('oplate_customer_analysis.type.training', '培训用户')
    }
];

class OPLATE_CUSTOMER_ANALYSIS extends React.Component {
    state = {
        //行业列表
        industry: [],
        //订单阶段列表
        stageList: [],
    };

    componentDidMount() {
        this.getIndustry();
        this.getStageList();
    }

    //获取行业列表
    getIndustry = () => {
        ajax.send({
            url: '/rest/customer/v2/customer/industries'
        }).then(result => {
            this.setState({ industry: result.result });
        });
    };

    //获取订单阶段列表
    getStageList = () => {
        ajax.send({
            url: '/rest/customer/v2/salestage'
        }).then(result => {
            this.setState({ stageList: result.result });
        });
    };

    //处理图表点击事件
    handleChartClick = (name, value, conditions) => {
        let conditionObj = {};

        _.each(conditions, condition => {
            conditionObj[condition.name] = condition.value;
        });

        const query = {
            app_id: conditionObj.app_id,
            login_begin_date: conditionObj.starttime,
            login_end_date: conditionObj.endtime,
            analysis_filter_value: value,
            analysis_filter_field: name,
            customerType: conditionObj.tab,
        };

        const url = '/crm?' + querystring.stringify(query);

        //跳转到客户列表
        window.open(url);
    };

    //处理订单阶段数据
    processOrderStageData = (data) => {
        return processOrderStageData(this.state.stageList, data);
    };

    getDataType = () => {
        if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)) {
            return 'all';
        } else if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS)) {
            return 'self';
        } else {
            return '';
        }
    };

    //处理试用合格客户数统计数字点击事件
    handleTrialQualifiedNumClick = (customerIds) => {
        history.push('/crm', {
            from: 'sales_home',
            trialQualifiedCustomerIds: customerIds
        });
    };

    //试用合格客户数统计数字渲染函数
    trialQualifiedNumRender = (customerIdsField, text, record) => {
        const customerIds = record[customerIdsField];

        if (customerIds) {
            return (
                <span onClick={this.handleTrialQualifiedNumClick.bind(this, customerIds)} style={{cursor: 'pointer'}}>
                    {text}
                </span>
            );
        } else {
            return (
                <span>
                    {text}
                </span>
            );
        }
    };

    //获取试用合格客户数统计图表
    getTrialQualifiedChart = () => {
        const dataType = this.getDataType();

        //统计列
        const statisticsColumns = [{
            dataIndex: 'last_month',
            title: '上月',
            width: '10%',
            render: this.trialQualifiedNumRender.bind(this, 'last_month_customer_ids'),
        }, {
            dataIndex: 'this_month',
            title: '本月',
            width: '10%',
            render: this.trialQualifiedNumRender.bind(this, 'this_month_customer_ids'),
        }, {
            dataIndex: 'this_month_new',
            title: '本月新增',
            width: '10%',
            render: this.trialQualifiedNumRender.bind(this, 'this_month_new_customer_ids'),
        }, {
            dataIndex: 'this_month_lose',
            title: '本月流失',
            width: '10%',
            render: this.trialQualifiedNumRender.bind(this, 'this_month_lose_customer_ids'),
        }, {
            dataIndex: 'this_month_back',
            title: '本月回流',
            width: '10%',
            render: this.trialQualifiedNumRender.bind(this, 'this_month_back_customer_ids'),
        }, {
            dataIndex: 'this_month_add',
            title: '本月比上月净增',
            width: '15%',
        }, {
            dataIndex: 'highest',
            title: '历史最高',
            width: '10%',
        }, {
            dataIndex: 'this_month_add_highest',
            title: '本月比历史最高净增',
            width: '20%',
        }];

        //表格列
        let columns = _.cloneDeep(statisticsColumns);
        columns.unshift({
            title: '团队',
            width: '10%',
            dataIndex: 'team_name',
        });

        let chart = {
            title: '试用合格客户数统计',
            url: `/rest/analysis/customer/v2/statistic/${dataType}/customer/qualify`,
            argCallback: (arg) => {
                let query = arg.query;

                if (query && query.starttime && query.endtime) {
                    query.start_time = query.starttime;
                    query.end_time = query.endtime;
                    delete query.starttime;
                    delete query.endtime;
                }
            },
            layout: {sm: 24},
            processData: data => {
                data = data.list || [];
                _.each(data, dataItem => {
                    _.each(statisticsColumns, column => {
                        const key = column.dataIndex;
                        const customerIds = _.get(dataItem, [key, 'customer_ids']);

                        if (customerIds) {
                            dataItem[key + '_customer_ids'] = customerIds.join(',');
                        }

                        dataItem[key] = dataItem[key].total;
                    });
                });

                return data;
            },
        };

        _.extend(chart, {
            chartType: 'table',
            noShowCondition: {
                tab: ['!', 'total'],
            },
            height: 'auto',
            option: {
                columns,
            },
            processOption: (option, chartProps) => {
                //从返回数据里获取一下销售昵称
                const nickName = _.get(chartProps, 'data[0].nick_name');

                //若存在销售昵称，说明返回的是销售列表
                if (nickName) {
                    //找到名称列
                    let nameColumn = _.find(option.columns, column => column.dataIndex === 'team_name');

                    if (nameColumn) {
                        //将名称列的数据索引改为指向昵称字段
                        nameColumn.dataIndex = 'nick_name';
                        //将名称列的标题改为销售
                        nameColumn.title = '销售';
                    }
                }
            },
        });

        return chart;
    };

    //获取图表定义
    getCharts = () => {
        let charts = [{
            title: 'Tabs',
            url: '/rest/analysis/customer/v1/:auth_type/summary',
            chartType: 'tab',
            tabs: [
                {
                    key: 'total',
                    title: Intl.get('oplate_customer_analysis.7', '总客户'),
                    layout: {
                        sm: 3,
                    },
                    active: true,
                },
                {
                    key: 'added',
                    title: Intl.get('oplate_customer_analysis.8', '新增客户'),
                    layout: {
                        sm: 3,
                    },
                },
                {
                    key: 'tried',
                    title: Intl.get('oplate_customer_analysis.tried', '试用阶段客户'),
                    layout: {
                        sm: 4,
                    },
                },
                {
                    key: 'projected',
                    title: Intl.get('oplate_customer_analysis.projected', '立项报价阶段客户'),
                    layout: {
                        sm: 4,
                    },
                },
                {
                    key: 'negotiated',
                    title: Intl.get('oplate_customer_analysis.negotiated', '谈判阶段客户'),
                    layout: {
                        sm: 4,
                    },
                },
                {
                    key: 'dealed',
                    title: Intl.get('oplate_customer_analysis.9', '成交阶段客户'),
                    layout: {
                        sm: 3,
                    },
                },
                {
                    key: 'executed',
                    title: Intl.get('oplate_customer_analysis.10', '执行阶段客户'),
                    layout: {
                        sm: 3,
                    },
                },
            ],
        }, {
            title: Intl.get('oplate_customer_analysis.1', '趋势统计'),
            url: '/rest/analysis/customer/v1/:auth_type/:tab/trend',
            chartType: 'line',
            processOption: option => {
                let allData = [];

                //集合各系列中的数据
                _.each(option.series, serie => {
                    if (_.isArray(serie.data)) {
                        allData = allData.concat(serie.data);
                    }
                });

                //找出最小值
                const minValue = _.min(allData);

                //将y轴最小值设置为数据最小值，以解决数据变化过小，看不出趋势的问题
                if (minValue) {
                    _.set(option, 'yAxis[0].min', minValue);
                }
            },
            overide: {
                condition: {
                    app_id: 'all',
                },
                customOption: {
                    multi: true,
                },
            },
        }, {
            title: Intl.get('oplate_customer_analysis.3', '地域统计'),
            url: '/rest/analysis/customer/v1/:auth_type/:tab/zone',
            chartType: 'bar',
            nameValueMap: unknownDataMap,
            chartClickRedirectCallback: this.handleChartClick.bind(this, 'zone'),
        }, {
            title: Intl.get('oplate_customer_analysis.5', '行业统计'),
            url: '/rest/analysis/customer/v1/:auth_type/:tab/industry',
            chartType: 'bar',
            nameValueMap: unknownDataMap,
            chartClickRedirectCallback: this.handleChartClick.bind(this, 'industry'),
            customOption: {
                reverse: true
            },
        }, {
            title: Intl.get('oplate_customer_analysis.4', '团队统计'),
            url: '/rest/analysis/customer/v1/:auth_type/:tab/team',
            chartType: 'bar',
            nameValueMap: unknownDataMap,
            chartClickRedirectCallback: this.handleChartClick.bind(this, 'team'),
        }, {
            title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
            url: '/rest/analysis/customer/stage/label/:auth_type/summary',
            chartType: 'funnel',
            processData: processCustomerStageData,
            customOption: {
                valueField: 'showValue',
                minSize: '5%',
            },
            noShowCondition: {
                tab: ['!', 'total'],
            },
        }, {
            title: Intl.get('oplate_customer_analysis.11', '订单阶段统计'),
            url: '/rest/analysis/customer/v1/:auth_type/:tab/stage',
            chartType: 'horizontalStage',
            processData: this.processOrderStageData,
            noShowCondition: {
                tab: ['!', 'total'],
            },
        }, {
            title: Intl.get('oplate_customer_analysis.industryCustomerOverlay', '各行业试用客户覆盖率'),
            url: '/rest/analysis/customer/v2/statistic/all/industry/stage/region/overlay',
            argCallback: (arg) => {
                const query = arg.query;

                if (query) {
                    //starttime转成start_time，endtime转成end_time
                    if (query.starttime && query.endtime) {
                        query.start_time = 0;
                        query.end_time = query.endtime;
                        delete query.starttime;
                        delete query.endtime;
                    }

                    //"试用合格"标签需要特殊处理
                    if (query.customer_label === Intl.get('common.trial.qualified', '试用合格')) {
                        query.customer_label = Intl.get('common.trial', '试用');
                        query.qualify_label = QUALIFY_LABEL_PASS;
                    }
                }
            },
            noShowCondition: {
                tab: ['!', 'total'],
            },
            chartType: 'table',
            option: {
                pagination: false,
                bordered: true,
                columns: [
                    {
                        title: Intl.get('user.sales.team', '销售团队'),
                        dataIndex: 'team_name',
                        render: (text, item, index) => {
                            return {
                                children: text,
                                props: {
                                    rowSpan: item.rowSpan
                                },
                            };
                        },
                        width: 100
                    },
                    {
                        title: Intl.get('oplate_bd_analysis_realm_zone.1', '省份'),
                        dataIndex: 'province_name',
                        width: 70
                    }, {
                        title: Intl.get('oplate_customer_analysis.cityCount', '地市总数'),
                        dataIndex: 'city_count',
                        align: 'right',
                        width: 50
                    }, {
                        title: Intl.get('weekly.report.open.account', '开通数'),
                        dataIndex: 'city_dredge_count',
                        align: 'right',
                        width: 50
                    }, {
                        title: Intl.get('oplate_customer_analysis.overlay', '覆盖率'),
                        dataIndex: 'city_dredge_scale',
                        align: 'right',
                        width: 70,
                        render: text => `${Number(text * 100).toFixed(2)}%`
                    }, {
                        title: Intl.get('oplate_customer_analysis.countryCount', '区县总数'),
                        dataIndex: 'district_count',
                        align: 'right',
                        width: 50,
                    }, {
                        title: Intl.get('weekly.report.open.account', '开通数'),
                        dataIndex: 'district_dredge_count',
                        align: 'right',
                        width: 50,
                    }, {
                        title: Intl.get('oplate_customer_analysis.overlay', '覆盖率'),
                        dataIndex: 'district_dredge_scale',
                        align: 'right',
                        width: 70,
                        render: text => `${Number(text * 100).toFixed(2)}%`
                    },
                ],
            },
            customOption: {
                dataProcessor: (data) => {
                    let tempData = [];
                    let list = [];
                    if (data.result) {
                        _.each(data.result, (value, key) => {
                            tempData.push({
                                team_name: key, team_result: value
                            });
                        });
                        tempData.forEach(teamItem => {
                            teamItem.team_result.forEach(sale => {
                                sale.team_name = teamItem.team_name;
                                //list中已有当前数据的团队名，不展示对应单元格(rowSpan==0)
                                if (list.find(item => item.team_name === teamItem.team_name)) {
                                    sale.rowSpan = 0;
                                } else {
                                    //为第一条存在团队名的数据设置列合并(rowSpan)
                                    sale.rowSpan = teamItem.team_result.length;
                                }
                                list.push(sale);
                            });
                        });
                    }

                    return list;
                },
            },
            cardContainer: {
                selectors: [{
                    optionsCallback: () => {
                        return [
                            {
                                name: Intl.get('oplate_customer_analysis.allIndustries', '全部行业'),
                                value: '',
                            },
                        ].concat(this.state.industry);
                    },
                    activeOption: '',
                    conditionName: 'industry',
                }, {
                    options: [
                        {
                            name: Intl.get('oplate_customer_analysis.allLabel', '全部标签'),
                            value: '',
                        },
                        Intl.get('sales.stage.message', '信息'),
                        Intl.get('sales.stage.intention', '意向'),
                        Intl.get('common.trial', '试用'),
                        Intl.get('common.trial.qualified', '试用合格'),
                        Intl.get('sales.stage.signed', '签约'),
                        Intl.get('contract.163', '续约'),
                        Intl.get('sales.stage.lost', '流失')
                    ],
                    activeOption: '',
                    conditionName: 'customer_label',
                }],
            },
            conditions: [{
                name: 'industry',
                value: '',
            }, {
                name: 'customer_label',
                value: '',
            }],
        }, {
            title: Intl.get('oplate_customer_analysis.salesNewCustomerCount', '销售新开客户数统计'),
            url: '/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new',
            argCallback: (arg) => {
                const query = arg.query;

                if (query && query.starttime && query.endtime) {
                    query.start_time = query.starttime;
                    query.end_time = query.endtime;
                    delete query.starttime;
                    delete query.endtime;
                }
            },
            noShowCondition: {
                tab: ['!', 'total'],
            },
            chartType: 'table',
            option: {
                pagination: false,
                bordered: true,
                columns: [
                    {
                        title: Intl.get('user.sales.team', '销售团队'),
                        dataIndex: 'team_name',
                        isSetCsvValueBlank: true,
                        render: (text, item, index) => {
                            return {
                                children: text,
                                props: {
                                    rowSpan: item.rowSpan
                                },
                            };
                        },
                        width: 100
                    },
                    {
                        title: Intl.get('user.salesman', '销售人员'),
                        dataIndex: 'user_name',
                        width: 80
                    },
                    {
                        title: Intl.get('oplate_customer_analysis.newCustomerCount', '新开客户数'),
                        dataIndex: 'newly_customer',
                        align: 'right',
                        width: 80
                    },
                    {
                        title: Intl.get('oplate_customer_analysis.tatolNewCustomerCount', '新开账号数总数'),
                        dataIndex: 'tatol_newly_users',
                        align: 'right',
                        width: 80
                    },
                    {
                        title: Intl.get('oplate_customer_analysis.customerLoginCount', '登录过的客户数'),
                        dataIndex: 'customer_login',
                        align: 'right',
                        width: 80
                    }
                ],
            },
            customOption: {
                dataProcessor: (data) => {
                    let list = [];
                    if (data.list && data.list.length > 0) {
                        data.list.forEach(teamItem => {
                            teamItem.team_result.forEach((sale, index) => {
                                sale.team_name = teamItem.team_name;
                                if (list.find(item => item.team_name === teamItem.team_name)) {
                                    sale.rowSpan = 0;
                                } else {
                                    sale.rowSpan = teamItem.team_result.length;
                                }
                                list.push(sale);
                                //在每个团队最后一个销售的数据后加上合计
                                if (index === teamItem.team_result.length - 1) {
                                    list.push($.extend({}, teamItem.team_total, {
                                        user_name: Intl.get('sales.home.total.compute', '总计')
                                    }));
                                }
                            });
                        });
                        //在数据最后添加总的合计
                        if (data.total) {
                            list.push($.extend({}, data.total, {
                                team_name: Intl.get('sales.home.total.compute', '总计')
                            }));
                        }
                    }

                    return list;
                },
            },
            cardContainer: {
                selectors: [{
                    options: CUSTOMER_TYPE_OPTIONS,
                    activeOption: '',
                    conditionName: 'tags',
                }],
            },
            conditions: [{
                name: 'tags',
                value: '',
            }],
        }];

        const trialQualifiedChart = this.getTrialQualifiedChart();

        charts.push(trialQualifiedChart);

        return charts;
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
            <div className="oplate_customer_analysis"
                data-tracename="客户分析"
            >
                <TopNav>
                    <TopNav.MenuList/>
                    <AnalysisFilter />
                </TopNav>

                <AntcAnalysis
                    charts={charts}
                    emitterConfigList={this.getEmitters()}
                    isUseScrollBar={true}
                    chartHeight={240}
                    conditions={[{
                        name: 'app_id',
                        value: 'all',
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

module.exports = OPLATE_CUSTOMER_ANALYSIS;

