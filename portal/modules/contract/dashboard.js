/**
 * 合同仪表盘
 */

import "./public/style.scss";
import Analysis from "../../components/analysis";
import TopNav from "../../components/top-nav";
import { CHART_HEIGHT } from "./consts";
import AnalysisFilter from "../../components/analysis/filter";
import TeamTree from "../../components/team-tree";
import { formatAmount } from "LIB_DIR/func";
import CardContainer from 'CMP_DIR/card-container'; // 容器

const threeMonthAgo = moment().subtract(3, "month").valueOf();
const now = moment().valueOf();

const ContractDashboard = React.createClass({
    getInitialState() {
        return {
            //是否隐藏团队分布图
            isTeamDisChartHide: false,
            amount: "",
            grossProfit: "",
            repayGrossProfit: "",
        };
    },
    getComponent(component, props) {
        if (!props) props = {};
        props.height = CHART_HEIGHT;

        return React.createElement(component, props, null);
    },
    renderCountBoxContent(args, value) {
        return (
            <div>
                <div>{args.title}</div>
                <div className="count-content">
                    {Intl.get("sales.home.new.add", "新增")} <span className="count-value">{args.type === "repay"? formatAmount(value) : value}</span> {args.unit}
                </div>
                {args.type === "contract" && this.state.amount? (
                <div className="count-content">
                    {Intl.get("contract.25", "合同额")} <span className="count-value">{formatAmount(this.state.amount)}</span> {Intl.get("contract.139", "万")}
                </div>
                ) : null}
                {args.type === "contract" && this.state.grossProfit? (
                <div className="count-content">
                    {Intl.get("contract.109", "毛利")} <span className="count-value">{formatAmount(this.state.grossProfit)}</span> {Intl.get("contract.139", "万")}
                </div>
                ) : null}
                {args.type === "repay" && this.state.repayGrossProfit? (
                <div className="count-content">
                    {Intl.get("contract.109", "毛利")} <span className="count-value">{formatAmount(this.state.repayGrossProfit)}</span> {Intl.get("contract.139", "万")}
                </div>
                ) : null}
            </div>
        );
    },
    showTeamDisChart() {
        this.setState({isTeamDisChartHide: false});
    },
    hideTeamDisChart() {
        this.setState({isTeamDisChartHide: true});
    },
    processAmountData(data) {
        return _.map(data, item => {
            item.value = formatAmount(item.value);
            return item;
        });
    },
    renderChartContent(content) {
        return (
            <div className="chart-content">
                {content}
            </div>
        );
    },
    render: function () {
        const countBoxStyle = {
            width: "33.33%",
            marginRight: 0,
            padding: "0 0 0 10px",
            border: "none",
        };

        const charts = [
            {
                title: Intl.get("contract.142", "新增合同数"),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    chartType: "box",
                    target: "Contract",
                    property: "count",
                    renderContent: this.renderCountBoxContent.bind(this, {
                        title: Intl.get("contract.125", "合同"),
                        unit: Intl.get("contract.22", "个"),
                        type: "contract",
                    }),
                }),
                style: _.extend({}, countBoxStyle, {
                    marginLeft: -10,
                    marginRight: 5,
                }),
            },
            {
                title: Intl.get("contract.156", "新增合同额"),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: "Contract",
                    chartType: "box",
                    property: "amount",
                    processData: data => {this.setState({amount: data.value}); return data;},
                }),
                style: _.extend({}, countBoxStyle, {
                    display: "none"
                }),
            },
            {
                title: Intl.get("contract.157", "新增毛利"),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: "Contract",
                    chartType: "box",
                    property: "gross_profit",
                    processData: data => {this.setState({grossProfit: data.value}); return data;},
                }),
                style: _.extend({}, countBoxStyle, {
                    display: "none"
                }),
            },
            {
                title: Intl.get("contract.143", "新增回款额"),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: "Contract",
                    chartType: "box",
                    type: "repay",
                    property: "total=amount",
                    renderContent: this.renderCountBoxContent.bind(this, {
                        title: Intl.get("contract.108", "回款"),
                        unit: Intl.get("contract.139", "万"),
                        type: "repay",
                    }),
                }),
                style: _.extend({}, countBoxStyle, {
                    marginRight: 5,
                }),
            },
            {
                title: Intl.get("contract.158", "新增回款毛利"),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: "Contract",
                    chartType: "box",
                    type: "repay",
                    property: "total=gross_profit",
                    processData: data => {this.setState({repayGrossProfit: data.value}); return data;},
                }),
                style: _.extend({}, countBoxStyle, {
                    display: "none"
                }),
            },
            {
                title: Intl.get("contract.148", "新增费用额"),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    chartType: "box",
                    target: "Contract",
                    type: "cost",
                    property: "total=amount",
                    renderContent: this.renderCountBoxContent.bind(this, {
                        title: Intl.get("contract.133", "费用"),
                        unit: Intl.get("contract.155", "元"),
                    }),
                }),
                style: countBoxStyle,
            },
            {
                title: Intl.get("contract.144", "新增合同毛利团队分布") + "(" + Intl.get("contract.160", "单位") + ": " + Intl.get("contract.139", "万") + ")",
                hide: this.state.isTeamDisChartHide,
                content: this.getComponent(Analysis, {
                    chartType: "bar",
                    target: "Contract",
                    type: "gross_profit",
                    property: "team",
                    autoAdjustXaxisLabel: true,
                    gridY2: 70,
                    processData: this.processAmountData,
                })
            },
            {
                title: Intl.get("contract.145", "新增回款团队分布") + "(" + Intl.get("contract.160", "单位") + ": " + Intl.get("contract.139", "万") + ")",
                hide: this.state.isTeamDisChartHide,
                content: this.getComponent(Analysis, {
                    chartType: "bar",
                    target: "Contract",
                    type: "repay",
                    property: "team=amount",
                    autoAdjustXaxisLabel: true,
                    gridY2: 70,
                    processData: this.processAmountData,
                })
            },
            {
                title: Intl.get("contract.149", "新增费用团队分布") + "(" + Intl.get("contract.160", "单位") + ": " + Intl.get("contract.155", "元") + ")",
                hide: this.state.isTeamDisChartHide,
                content: this.getComponent(Analysis, {
                    chartType: "bar",
                    target: "Contract",
                    type: "cost",
                    property: "team=amount",
                    autoAdjustXaxisLabel: true,
                    xAxisRotateLength: 8,
                    gridY2: 70,
                })
            },
            {
                title: Intl.get("contract.146", "近3个月回款周趋势图") + "(" + Intl.get("contract.160", "单位") + ": " + Intl.get("contract.139", "万") + ")",
                content: this.getComponent(Analysis, {
                    chartType: "line",
                    target: "Contract",
                    type: "repay",
                    property: "trend",
                    startTime: threeMonthAgo,
                    endTime: now,
                    processData: this.processAmountData,
                })
            },
            {
                title: Intl.get("contract.147", "近3个月新增合同周趋势图"),
                content: this.getComponent(Analysis, {
                    chartType: "line",
                    target: "Contract",
                    type: "count",
                    property: "trend",
                    startTime: threeMonthAgo,
                    endTime: now,
                })
            },
            {
                title: Intl.get("contract.150", "近3个月费用周趋势图") + "(" + Intl.get("contract.160", "单位") + ": " + Intl.get("contract.155", "元") + ")",
                content: this.getComponent(Analysis, {
                    chartType: "line",
                    target: "Contract",
                    type: "cost",
                    property: "trend",
                    startTime: threeMonthAgo,
                    endTime: now,
                })
            },
            {
                title: Intl.get("contract.166", "签单情况统计表") + "(" + Intl.get("contract.160", "单位") + ": " + Intl.get("contract.155", "元") + ")",
                style: {
                    width: "100%",
                    marginRight: 0
                },
                content: this.getComponent(Analysis, {
                    chartType: "signingStatistics",
                    target: "Contract",
                    type: "team",
                    property: "amount",
                })
            },
        ];

        return (
            <div className="contract-dashboard">
                <TopNav>
                    <AnalysisFilter isAppSelectorShow={false} isAutoSelectDate={true} />
                </TopNav>
                <div className="main-content">
                    <div className="main-left">
                    {charts.map(chart => {
                        return chart.hide? null : (
                            <div className="chart-wrap" style={chart.style || {}}>
                                {chart.title && !chart.isTitleHide ? (
                                    <CardContainer title={chart.title}>
                                        {this.renderChartContent(chart.content)}
                                    </CardContainer>
                                ) : this.renderChartContent(chart.content) }
                            </div>
                        );
                    })}
                    </div>
                    <div className="main-right">
                        <TeamTree
                            onTeamSelect={this.showTeamDisChart}
                            onMemberSelect={this.hideTeamDisChart}
                        />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ContractDashboard;
