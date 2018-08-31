/**
 * 合同仪表盘
 */

var React = require('react');
import './public/style.less';
import Analysis from '../../components/analysis';
import { CHART_HEIGHT } from './consts';
import AnalysisFilter from '../../components/analysis/filter';
import TeamTree from '../../components/team-tree';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';

import { formatAmount } from 'LIB_DIR/func';
import { AntcCardContainer } from 'antc'; // 容器
import { CONTRACT_STATIC_COLUMNS } from './consts';
import { Row, Col } from 'antd';

//窗口改变的事件emitter
const resizeEmitter = require('PUB_DIR/sources/utils/emitters').resizeEmitter;

const threeMonthAgo = moment().subtract(3, 'month').valueOf();
const now = moment().valueOf();

class ContractDashboard extends React.Component {
    state = {
        //是否隐藏团队分布图
        isTeamDisChartHide: false,
        amount: '',
        grossProfit: '',
        repayGrossProfit: '',
        contentHeight: 0,
    };

    componentDidMount() {
        //窗口大小改变事件
        resizeEmitter.on(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
    }

    componentWillUnmount() {
        //卸载窗口大小改变事件
        resizeEmitter.removeListener(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
    }

    //窗口缩放时候的处理函数
    resizeHandler = (data) => {
        this.setState({
            contentHeight: data.height
        });
    };

    getComponent = (component, componentProps) => {
        if (!componentProps) componentProps = {};

        componentProps.height = CHART_HEIGHT;

        componentProps.ref = (ref) => {this[componentProps.refName] = ref;};

        return React.createElement(component, componentProps, null);
    };

    //改变数字格式
    changeNumberFormat = (num) => {
        //把以元为单位的数字改为以万元为单位。
        num = formatAmount(num);
        //保留两位小数，不进行四舍五入
        return Math.floor(num * 100) / 100;
    };

    renderCountBoxContent = (args, value) => {
        return (
            <div>
                <div>{args.title}</div>
                <div className="count-content">
                    {Intl.get('sales.home.new.add', '新增')} <span className="count-value">{args.type === 'repay' ? this.changeNumberFormat(value) : value}</span> {args.unit}
                </div>
                {args.type === 'contract' && this.state.amount ? (
                    <div className="count-content">
                        {Intl.get('contract.25', '合同额')} <span className="count-value">{this.changeNumberFormat(this.state.amount)}</span> {Intl.get('contract.139', '万')}
                    </div>
                ) : null}
                {args.type === 'contract' && this.state.grossProfit ? (
                    <div className="count-content">
                        {Intl.get('contract.109', '毛利')} <span className="count-value">{this.changeNumberFormat(this.state.grossProfit)}</span> {Intl.get('contract.139', '万')}
                    </div>
                ) : null}
                {args.type === 'repay' && this.state.repayGrossProfit ? (
                    <div className="count-content">
                        {Intl.get('contract.109', '毛利')} <span className="count-value">{this.changeNumberFormat(this.state.repayGrossProfit)}</span> {Intl.get('contract.139', '万')}
                    </div>
                ) : null}
            </div>
        );
    };

    showTeamDisChart = () => {
        this.setState({isTeamDisChartHide: false});
    };

    hideTeamDisChart = () => {
        this.setState({isTeamDisChartHide: true});
    };

    processAmountData = (data) => {
        return _.map(data, item => {
            item.value = formatAmount(item.value);
            return item;
        });
    };

    renderChartContent = (content) => {
        return (
            <div className="chart-content">
                {content}
            </div>
        );
    };

    render() {
        const countBoxStyle = {
            border: 'none',
        };

        const charts = [
            {
                title: Intl.get('contract.142', '新增合同数'),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    chartType: 'box',
                    target: 'Contract',
                    property: 'count',
                    renderContent: this.renderCountBoxContent.bind(this, {
                        title: Intl.get('contract.125', '合同'),
                        unit: Intl.get('contract.22', '个'),
                        type: 'contract',
                    }),
                }),
                style: countBoxStyle,
                lg: 8,
            },
            {
                title: Intl.get('contract.156', '新增合同额'),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: 'Contract',
                    chartType: 'box',
                    property: 'amount',
                    processData: data => {this.setState({amount: data.value}); return data;},
                }),
                style: _.extend({}, countBoxStyle, {
                    display: 'none'
                }),
            },
            {
                title: Intl.get('contract.157', '新增毛利'),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: 'Contract',
                    chartType: 'box',
                    property: 'gross_profit',
                    processData: data => {this.setState({grossProfit: data.value}); return data;},
                }),
                style: _.extend({}, countBoxStyle, {
                    display: 'none'
                }),
            },
            {
                title: Intl.get('contract.143', '新增回款额'),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: 'Contract',
                    chartType: 'box',
                    type: 'repay',
                    property: 'total=amount',
                    renderContent: this.renderCountBoxContent.bind(this, {
                        title: Intl.get('contract.108', '回款'),
                        unit: Intl.get('contract.139', '万'),
                        type: 'repay',
                    }),
                }),
                style: countBoxStyle,
                lg: 8,
            },
            {
                title: Intl.get('contract.158', '新增回款毛利'),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    target: 'Contract',
                    chartType: 'box',
                    type: 'repay',
                    property: 'total=gross_profit',
                    processData: data => {this.setState({repayGrossProfit: data.value}); return data;},
                }),
                style: _.extend({}, countBoxStyle, {
                    display: 'none'
                }),
            },
            {
                title: Intl.get('contract.148', '新增费用额'),
                isTitleHide: true,
                content: this.getComponent(Analysis, {
                    chartType: 'box',
                    target: 'Contract',
                    type: 'cost',
                    property: 'total=amount',
                    renderContent: this.renderCountBoxContent.bind(this, {
                        title: Intl.get('contract.133', '费用'),
                        unit: Intl.get('contract.155', '元'),
                    }),
                }),
                style: countBoxStyle,
                lg: 8,
            },
            {
                title: Intl.get('contract.144', '新增合同毛利团队分布') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
                hide: this.state.isTeamDisChartHide,
                content: this.getComponent(Analysis, {
                    chartType: 'bar',
                    target: 'Contract',
                    type: 'gross_profit',
                    property: 'team',
                    autoAdjustXaxisLabel: true,
                    gridY2: 70,
                    processData: this.processAmountData,
                    refName: 'xin_zeng_he_tong_mao_li_tuan_dui_fen_bu',
                })
            },
            {
                title: Intl.get('contract.145', '新增回款团队分布') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
                hide: this.state.isTeamDisChartHide,
                content: this.getComponent(Analysis, {
                    chartType: 'bar',
                    target: 'Contract',
                    type: 'repay',
                    property: 'team=amount',
                    autoAdjustXaxisLabel: true,
                    gridY2: 70,
                    processData: this.processAmountData,
                    refName: 'xin_zeng_hui_kuan_tuan_dui_fen_bu',
                })
            },
            {
                title: Intl.get('contract.149', '新增费用团队分布') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
                hide: this.state.isTeamDisChartHide,
                content: this.getComponent(Analysis, {
                    chartType: 'bar',
                    target: 'Contract',
                    type: 'cost',
                    property: 'team=amount',
                    autoAdjustXaxisLabel: true,
                    xAxisRotateLength: 8,
                    gridY2: 70,
                    refName: 'xin_zeng_fei_yong_tuan_dui_fen_bu',
                })
            },
            {
                title: Intl.get('contract.146', '近3个月回款周趋势图') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
                content: this.getComponent(Analysis, {
                    chartType: 'line',
                    target: 'Contract',
                    type: 'repay',
                    property: 'trend',
                    startTime: threeMonthAgo,
                    endTime: now,
                    processData: this.processAmountData,
                    refName: 'jin_san_ge_yue_hui_kuan_zhou_qu_shi',
                })
            },
            {
                title: Intl.get('contract.147', '近3个月新增合同周趋势图'),
                content: this.getComponent(Analysis, {
                    chartType: 'line',
                    target: 'Contract',
                    type: 'count',
                    property: 'trend',
                    startTime: threeMonthAgo,
                    endTime: now,
                    refName: 'jin_san_ge_yue_xin_zeng_he_tong_zhou_qu_shi',
                })
            },
            {
                title: Intl.get('contract.150', '近3个月费用周趋势图') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
                content: this.getComponent(Analysis, {
                    chartType: 'line',
                    target: 'Contract',
                    type: 'cost',
                    property: 'trend',
                    startTime: threeMonthAgo,
                    endTime: now,
                    refName: 'jin_san_ge_yue_fei_yong_zhou_qu_shi',
                })
            },
            {
                title: Intl.get('contract.166', '签单情况统计表') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
                style: {
                    width: '100%',
                    marginRight: 0
                },
                content: this.getComponent(Analysis, {
                    chartType: 'signingStatistics',
                    target: 'Contract',
                    type: 'team',
                    property: 'amount',
                    refName: 'qian_dan_qing_kuang_tong_ji',
                })
            },
            {
                title: Intl.get('contract.168', '合同分析统计表') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
                style: {
                    width: '100%',
                    marginRight: 0
                },
                content: this.getComponent(Analysis, {
                    chartType: 'contractStatistics',
                    target: 'ContractStatic',
                    column: CONTRACT_STATIC_COLUMNS,
                    refName: 'he_tong_fen_xi_tong_ji',
                })
            },
        ];

        return (
            <div className="contract-dashboard" style={{height: this.state.contentHeight}} data-tracename="合同仪表盘">
                <GeminiScrollBar>
                    <div className="dashboard-content">
                        <Row>
                            <AnalysisFilter isAppSelectorShow={false} isAutoSelectDate={true} />
                        </Row>
                        <Row gutter={16}>
                            <Col span={18}>
                                <Row gutter={16}>
                                    {charts.map(chart => {
                                        const xs = chart.xs || 24;
                                        const sm = chart.sm || 24;
                                        const md = chart.md || 24;
                                        const lg = chart.lg || 12;

                                        const componentProps = chart.content.props;
                                        const refName = componentProps.refName;
                                        const ref = this[refName];
                                        const exportData = () => {
                                            if (refName === 'qian_dan_qing_kuang_tong_ji') {
                                                $('.signing-statistics-export-btn').click();
                                                return;
                                            }

                                            if (!ref) return;

                                            return ref.getProcessedData();
                                        };
                                        return chart.hide ? null : (
                                            <Col xs={xs} sm={sm} md={md} lg={lg} style={chart.style || {}}>
                                                <div className="chart-wrap">
                                                    {chart.title && !chart.isTitleHide ? (
                                                        <AntcCardContainer title={chart.title}
                                                            csvFileName={refName + '.csv'}
                                                            exportData={exportData.bind(this)}
                                                        >
                                                            {this.renderChartContent(chart.content)}
                                                        </AntcCardContainer>
                                                    ) : this.renderChartContent(chart.content) }
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Col>
                            <Col span={6}>
                                <div className="main-right">
                                    <TeamTree
                                        onTeamSelect={this.showTeamDisChart}
                                        onMemberSelect={this.hideTeamDisChart}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </GeminiScrollBar>
            </div>
        );
    }
}

module.exports = ContractDashboard;

