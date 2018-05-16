/**
 * 柱状图和饼图组合组件
 *
 * 柱状图展示所有数据，饼图用于展示由于占比太小在柱状图上不好详细展示的那部分数据
 */

var echarts = require("echarts-eefung");
require("./style.less");
import Spinner from "../spinner";
import macronsTheme from "./theme-macrons";
var immutable = require("immutable");
import { packageTry } from 'LIB_DIR/func';

class AntcBarPieChart extends React.Component {
    static defaultProps = {
        chartData : [],
        legend : [],
        //最多显示的系列数
        maxSeries: 10,
        //多数在总数中的占比
        proportion: 0.9,
        width : '100%',
        height : 214,
        resultType : 'loading',
    }

    constructor(props) {
        super(props);
        this.echartInstance = null;
    }

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate(prevProps) {
        if(
            this.props.chartData &&
            prevProps.chartData &&
            immutable.is(this.props.chartData , prevProps.chartData) &&
            this.props.resultType === prevProps.resultType &&
            this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderChart();
    }

    componentWillUnmount() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    }

    getEchartOptions() {
        var option = {
            animation : false,
            tooltip : {
                show: false
            },
            legend: {
                orient: this.props.legendOrient || 'vertical',
                top: 15,
                right: 20,
                tooltip: {
                    show: false
                },
                data: this.getLegendData()
            },
            grid: {
                right: "60%",
            },
            xAxis: {
                data: [""],
            },
            yAxis: {
                type: "value",
                splitLine: false,
                splitArea: false,
            },
            series : this.getSeries(),
        };
        return option;
    }

    //获取按数值排好序的按最大显示系列数截取后的子类数据
    getChartData() {
        let data = [];

        let chartData = this.props.chartData;
        const dataField = this.props.dataField;
        if (dataField) chartData = chartData[dataField];

        const subField = this.props.subField;

        if (subField) {
            let subData = _.chain(chartData).pluck(subField).flatten().sortBy("count").value();

            data = subData.slice(-this.props.maxSeries);
        }

        return data;
    }

    getLegendData() {
        let legend = this.props.legend;
        if (!legend) {
            const chartData = this.getChartData();
    
            legend = _.pluck(chartData, "name");
        }
        return legend;
    }

    getSeries() {
        let series = [];

        let chartData = this.getChartData();

        if (chartData.length) {
            //图表数据总数
            const total = _.reduce(chartData, (memo, data) => memo + data.count, 0);
    
            //按从大到小排序的图表数据
            let descendChartData = JSON.parse(JSON.stringify(chartData)).reverse();

            //临界值(紧邻多数派的少数派中的第一个值)
            let boundaryValue = "";
            //累加值(用于判断临界值)
            let sum = 0;
            //多数派总数
            let majorTotal = 0;
            //临界索引
            let boundaryIndex = 0;

            //获取临界值和多数派总数
            descendChartData.every(data => {
                //对每个值进行累加
                sum += data.count;

                //计算累加值和总数之比
                const proportion = sum / total;

                //如果该比值大于设定的阀值，说明到了临界点
                //开始对临界索引进行累加
                if (proportion > this.props.proportion) {
                    boundaryIndex ++;
                }

                //若临界索引值为1，说明当前数据为多数派中的最后一个数据
                //此时多数派总数即为累加数
                if (boundaryIndex === 1) {
                    majorTotal = sum;
                }

                //若临界索引值为2，说明当前已进入少数派区域，当前数据为少数派中的第一个数据
                //此时临界值即为当前数据值
                //取到临界值之后就可以中止循环了
                if (boundaryIndex === 2) {
                    boundaryValue = data.count;
                    return false;
                } else {
                    return true;
                }
            });

            //少数派总数
            const minorTotal = total - majorTotal;

            //生成柱状堆叠图系列
            chartData.forEach((dataItem, index) => {
                const count = dataItem.count;
                let barSerie = {
                    name: dataItem.name,
                    type: "bar",
                    stack: true,
                    barWidth: 40,
                    data: [count],
                };

                //数值大于临界值的系列才显示系列标签
                if (count > boundaryValue) {
                    barSerie.label = {
                        normal: {
                            show: true,
                            position: "left",
                            formatter: "{a}: {c}"
                        }
                    };
                }
    
                //标志线基本配置
                const markLineObj = {
                    symbolSize: 0,
                    lineStyle: {
                        normal: {
                            type: "dashed",
                            color: "#666",
                        }
                    },
                };
    
                //如果存在临界值的话，从柱状图底部(数值最小的系列)引出下标志线
                if (index === 0 && boundaryValue) {
                    let markLine = JSON.parse(JSON.stringify(markLineObj));

                    markLine.data = [
                        [
                            {
                                coord: [0, count]
                            },
                            {
                                x: "70%", y: "80%"
                            }
                        ]
                    ];
    
                    barSerie.markLine = markLine;
                }
    
                //从临界值上方引出上标志线
                if (count === boundaryValue) {
                    const markLineData = [
                        {
                            coord: [0, minorTotal]
                        },
                        {
                            x: "60%", y: "8%"
                        }
                    ];

                    if (barSerie.markLine && barSerie.markLine.data) {
                        barSerie.markLine.data.push(markLineData);
                    } else {
                        let markLine = JSON.parse(JSON.stringify(markLineObj));
                        markLine.data = [markLineData];
    
                        barSerie.markLine = markLine;
                    }
                }
    
                series.push(barSerie);
            });

            //少数派图表数据
            const minorChartData = _.filter(chartData, data => data.count <= boundaryValue);

            //存在少数派图表数据时，用饼图展示该数据
            if (minorChartData.length) {
                series.push({
                    type: 'pie',
                    radius : '50%',
                    center: ['60%', '50%'],
                    label: {
                        normal: {
                            formatter: "{b}: {c}"
                        }
                    },
                    data: this.getSerieData(minorChartData),
                });
            }
        }

        return series;
    }

    getSerieData(data) {
        if (_.isArray(data)) {
            return data.map(item => {
                return {
                    name : item.name,
                    value : item.count
                };
            });
        }
    }

    renderChart() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }

        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var chartData = this.props.chartData? JSON.parse(JSON.stringify(this.props.chartData)) : [];
        if (this.props.dataField) chartData = chartData[this.props.dataField];
        if (_.isEmpty(chartData)) {
            if(this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options,true);
        }
    }

    render() {
        return (
            <div className="analysis-chart">
                {this.props.resultType === 'loading'?
                    (
                        <div className="loadwrap" style={{height:this.props.height}}>
                            <Spinner/>
                        </div>
                    ):
                    (
                        <div>
                            <div ref="chart" style={{width:this.props.width,height:this.props.height}} className="chart" data-title={this.props.title}></div>
                        </div>
                    )
                }
            </div>
        );
    }
}

export default AntcBarPieChart;
