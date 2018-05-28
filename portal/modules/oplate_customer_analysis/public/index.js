/**
 * 客户分析
 */

require("./css/oplate-customer-analysis.less");
import ajax from "ant-ajax";
import { AntcAnalysis } from "antc";
import AnalysisFilter from "CMP_DIR/analysis/filter";
import { hasPrivilege } from "CMP_DIR/privilege/checker";
import { parseAmount } from "LIB_DIR/func";
const TopNav = require("CMP_DIR/top-nav");
const AnalysisMenu = require("CMP_DIR/analysis_menu");
const userData = require("PUB_DIR/sources/user-data");
const emitters = require("PUB_DIR/sources/utils/emitters");

//从 unknown 到 未知 的对应关系对象
const unknownObj = {name: Intl.get("user.unknown", "未知"), key: "unknown"};

//从 unknown 到 未知 的映射
let unknownDataMap = {};
unknownDataMap[unknownObj.key] = unknownObj.name;

//权限类型
const authType = hasPrivilege("CUSTOMER_ANALYSIS_MANAGER")? "manager" : "common";

var OPLATE_CUSTOMER_ANALYSIS = React.createClass({
    getInitialState() {
        return {
            //行业列表
            industry: [],
            //订单阶段列表
            stageList: [],
        };
    },

    componentDidMount() {
        this.getIndustry();
        this.getStageList();
    },

    //获取行业列表
    getIndustry() {
        ajax.send({
            url: "/rest/customer/v2/customer/industries"
        }).then(result => {
            this.setState({industry: result.result});
        });
    },

    //获取订单阶段列表
    getStageList() {
        ajax.send({
            url: "/rest/customer/v2/salestage"
        }).then(result => {
            this.setState({stageList: result.result});
        });
    },
    
    //处理客户阶段统计数据
    processCustomerStageData(data) {
        const customerStages = [
            {
                tagName: Intl.get("sales.stage.message", "信息"),
                tagValue: "message",
            },
            {
                tagName: Intl.get("sales.stage.intention", "意向"),
                tagValue: "intention",
            },
            {
                tagName: Intl.get("common.trial", "试用"),
                tagValue: "trial",
            },
            {
                tagName: Intl.get("common.qualified", "合格"),
                tagValue: "qualified",
            },
            {
                tagName: Intl.get("sales.stage.signed", "签约"),
                tagValue: "signed",
            },
        ];
    
        let processedData = [];
        let prevStageValue;
    
        customerStages.forEach(stage => {
            let stageValue = data[stage.tagValue];
    
            if (stageValue) {
                //保留原始值，用于在图表上显示
                const showValue = stageValue;
    
                //如果下一阶段的值比上一阶段的值大，则将下一阶段的值变得比上一阶段的值小，以便能正确排序
                if (prevStageValue && stageValue > prevStageValue) {
                    stageValue = prevStageValue * 0.8;
                }
    
                //将暂存的上一阶段的值更新为当前阶段的值，以供下一循环中使用
                prevStageValue = stageValue;
    
                processedData.push({
                    name: stage.tagName,
                    value: stageValue,
                    showValue,
                });
            }
        });
    
        return processedData;
    },
    
    //处理订单阶段统计数据
    processOrderStageData(data) {
        //接口返回数据里没有value字段，但是图表渲染需要该字段，所以需要补上该字段
        _.map(data, stage => {
            stage.value = stage.total;
            if (_.isNumber(stage.budget)) {
                //对预算额做千分位分隔及加单位处理
                stage.budget = parseAmount(stage.budget) + Intl.get("contract.139", "万");
            }
        });
    
        const stageList = this.state.stageList || [];
        let processedData = [];
    
        //将统计数据按销售阶段列表顺序排序
        _.each(stageList, stage => {
            const dataItem = _.find(data, item => item.name === stage.name);
            if (dataItem) {
                processedData.push(dataItem);
            }
        });
    
        //将维护阶段的统计数据加到处理后的数据的最后
        let maintainStage = _.find(data, stage => stage.name ===Intl.get("oplate_customer_analysis.6", "维护阶段"));
        if (maintainStage) processedData.push(maintainStage);
    
        return processedData;
    },

    //获取图表定义
    getCharts() {
        return [{
            title: "Tabs",
            url: "/rest/analysis/customer/v1/:auth_type/summary",
            chartType: "tab",
            tabs: [
                {
                    key: "total",
                    title: Intl.get("oplate.user.analysis.11", "总客户"),
                    layout: {
                        sm: 3,
                    },
                    active: true,
                },
                {
                    key: "added",
                    title: Intl.get("oplate.user.analysis.12", "新增客户"),
                    layout: {
                        sm: 3,
                    },
                },
                {
                    key: 'tried',
                    title: Intl.get("oplate_customer_analysis.tried", "试用阶段客户"),
                    layout: {
                        sm: 4,
                    },
                },
                {
                    key: 'projected',
                    title: Intl.get("oplate_customer_analysis.projected", "立项报价阶段客户"),
                    layout: {
                        sm: 4,
                    },
                },
                {
                    key: 'negotiated',
                    title: Intl.get("oplate_customer_analysis.negotiated", "谈判阶段客户"),
                    layout: {
                        sm: 4,
                    },
                },
                {
                    key: 'dealed',
                    title: Intl.get("oplate_customer_analysis.9", "成交阶段客户"),
                    layout: {
                        sm: 3,
                    },
                },
                {
                    key: 'executed',
                    title: Intl.get("oplate_customer_analysis.10", "执行阶段客户"),
                    layout: {
                        sm: 3,
                    },
                },
            ],
        }, {
            title: Intl.get("oplate_customer_analysis.1", "趋势统计"),
            url: "/rest/analysis/customer/v1/:auth_type/:tab/trend",
            chartType: "line",
                customOption: {
                    multi: true,
                },
        }, {
            title: Intl.get("oplate_customer_analysis.3", "地域统计"),
            url: "/rest/analysis/customer/v1/:auth_type/:tab/zone",
            chartType: "bar",
            nameValueMap: unknownDataMap,
        }, {
            title: Intl.get("oplate_customer_analysis.5", "行业统计"),
            url: "/rest/analysis/customer/v1/:auth_type/:tab/industry",
            chartType: "bar",
            nameValueMap: unknownDataMap,
            customOption: {
                reverse: true
            },
        }, {
            title: Intl.get("oplate_customer_analysis.4", "团队统计"),
            url: "/rest/analysis/customer/v1/:auth_type/:tab/team",
            chartType: "bar",
            nameValueMap: unknownDataMap,
        }, {
            title: Intl.get("oplate_customer_analysis.customer_stage", "客户阶段统计"),
            url: "/rest/analysis/customer/stage/label/:auth_type/summary",
            chartType: "funnel",
            processData: this.processCustomerStageData,
            customOption: {
                valueField: "showValue",
                minSize: "5%",
            },
            noShowCondition: {
                tab: ["!", "total"],
            },
        }, {
            title: Intl.get("oplate_customer_analysis.11", "订单阶段统计"),
            url: "/rest/analysis/customer/v1/:auth_type/:tab/stage",
            chartType: "horizontalStage",
            processData: this.processOrderStageData,
            noShowCondition: {
                tab: ["!", "total"],
            },
        }, {
            title: Intl.get("oplate_customer_analysis.industryCustomerOverlay", "各行业试用客户覆盖率"),
            url: "/rest/analysis/customer/v2/statistic/all/industry/stage/region/overlay",
            argCallback: (arg) => {
                const query = arg.query;

                if (query && query.starttime && query.endtime) {
                    query.start_time = 0;
                    query.end_time = query.endtime;
                    delete query.starttime;
                    delete query.endtime;
                }
            },
            noShowCondition: {
                tab: ["!", "total"],
            },
            chartType: "table",
            option: {
                pagination: false,
                bordered: true,
                columns: [
                    {
                        title: Intl.get("user.sales.team", "销售团队"),
                        dataIndex: "team_name",
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
                        title: Intl.get("oplate_bd_analysis_realm_zone.1", "省份"),
                        dataIndex: "province_name",
                        width: 70
                    }, {
                        title: Intl.get("oplate_customer_analysis.cityCount", "地市总数"),
                        dataIndex: "city_count",
                        align: "right",
                        width: 50
                    }, {
                        title: Intl.get("weekly.report.open.account", "开通数"),
                        dataIndex: "city_dredge_count",
                        align: "right",
                        width: 50
                    }, {
                        title: Intl.get("oplate_customer_analysis.overlay", "覆盖率"),
                        dataIndex: "city_dredge_scale",
                        align: "right",
                        width: 70,
                        render: text => `${Number(text * 100).toFixed(2)}%`
                    }, {
                        title: Intl.get("oplate_customer_analysis.countryCount", "区县总数"),
                        dataIndex: "district_count",
                        align: "right",
                        width: 50,
                    }, {
                        title: Intl.get("weekly.report.open.account", "开通数"),
                        dataIndex: "district_dredge_count",
                        align: "right",
                        width: 50,
                    }, {
                        title: Intl.get("oplate_customer_analysis.overlay", "覆盖率"),
                        dataIndex: "district_dredge_scale",
                        align: "right",
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
                                if (list.find(item => item.team_name == teamItem.team_name)) {
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
                                name: Intl.get("oplate_customer_analysis.allIndustries", "全部行业"), 
                                value: "",
                            },
                        ].concat(this.state.industry);
                    },
                    activeOption: "",
                    conditionName: "industry",
                }, {
                    options: [
                        {
                            name: Intl.get("oplate_customer_analysis.allLabel", "全部标签"), 
                            value: "",
                        },
                        Intl.get("sales.stage.message", "信息"),
                        Intl.get("sales.stage.intention", "意向"),
                        Intl.get("common.trial", "试用"),
                        Intl.get("common.trial.qualified", "试用合格"),
                        Intl.get("sales.stage.signed", "签约"),
                        Intl.get("contract.163", "续约"),
                        Intl.get("sales.stage.lost", "流失")
                    ],
                    activeOption: "",
                    conditionName: "customer_label",
                }],
            },
            conditions: [{
                name: "industry",
                value: "",
            }, {
                name: "customer_label",
                value: "",
            }],
        }, {
            title: Intl.get("oplate_customer_analysis.salesNewCustomerCount", "销售新开客户数统计"),
            url: "/rest/analysis/customer/v2/statistic/:auth_type/customer/user/new",
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
                tab: ["!", "total"],
            },
            chartType: "table",
            option: {
                pagination: false,
                bordered: true,
                columns: [
                    {
                        title: Intl.get("user.sales.team", "销售团队"),
                        dataIndex: "team_name",
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
                        title: Intl.get("user.salesman", "销售人员"),
                        dataIndex: "customer_name",
                        width: 80
                    },
                    {
                        title: Intl.get("oplate_customer_analysis.newCustomerCount", "新开客户数"),
                        dataIndex: "newly_customer",
                        align: "right",
                        width: 80
                    },
                    {
                        title: Intl.get("oplate_customer_analysis.tatolNewCustomerCount", "新开账号数总数"),
                        dataIndex: "tatol_newly_users",
                        align: "right",
                        width: 80
                    },
                    {
                        title: Intl.get("oplate_customer_analysis.customerLoginCount", "新开通客户登录数"),
                        dataIndex: "customer_login",
                        align: "right",
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
                                if (list.find(item => item.team_name == teamItem.team_name)) {                    
                                    sale.rowSpan = 0;
                                } else {                    
                                    sale.rowSpan = teamItem.team_result.length;
                                }
                                list.push(sale);
                                //在每个团队最后一个销售的数据后加上合计
                                if (index == teamItem.team_result.length - 1) {
                                    list.push($.extend({}, teamItem.team_total, {
                                        customer_name: Intl.get("sales.home.total.compute", "总计")
                                    }));
                                }                
                            });
                        });
                        //在数据最后添加总的合计
                        if (data.total) {
                            list.push($.extend({}, data.total, {
                                team_name: Intl.get("sales.home.total.compute", "总计")
                            }));
                        }
                    }

                    return list;
                },
            },
        }];
    },

    getEmitters() {
        return [{
            instance: emitters.appSelectorEmitter,
            event: emitters.appSelectorEmitter.SELECT_APP,
            callbackArgs: [{
                name: "app_id",
            }],
        }, {
            instance: emitters.dateSelectorEmitter,
            event: emitters.dateSelectorEmitter.SELECT_DATE,
            callbackArgs: [{
                name: "starttime",
            }, {
                name: "endtime",
            }],
        }];
    },

    render() {
        const charts = this.getCharts();

        return (
            <div className="oplate_customer_analysis"
                data-tracename="客户分析"
            >
                <TopNav>
                    <AnalysisMenu />
                    <AnalysisFilter />
                </TopNav>

                <AntcAnalysis
                    charts={charts}
                    emitters={this.getEmitters()}
                    isUseScrollBar={true}
                    chartHeight={240}
                    conditions={[{
                        name: "app_id",
                        value: "all",
                    }, {
                        name: "starttime",
                        value: moment().startOf("isoWeek").valueOf(),
                    }, {
                        name: "endtime",
                        value: moment().valueOf(),
                    }, {
                        name: "auth_type",
                        value: authType,
                        type: "params",
                    }]}
                />
            </div>
        );
    },
});

module.exports = OPLATE_CUSTOMER_ANALYSIS;
