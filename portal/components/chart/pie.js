/**
 * 饼图
 */
var echarts = require('echarts-eefung');
require('./style.less');
var macronsTheme = require('./theme-macrons');
var echartsTooltipCssText = require('../../lib/utils/echarts-tooltip-csstext');
var immutable = require('immutable');
import { packageTry } from 'LIB_DIR/func';

var PieChart = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            chartData: [],
            legend: [],
            width: '100%',
            height: 214,
            resultType: 'loading',
        };
    },
    getEchartOptions: function() {
        var option = {
            animation: false,
            tooltip: {
                trigger: 'item',
                extraCssText: echartsTooltipCssText,
                formatter: '<div class=\'echarts-tooltip\'>{b} : {c} ({d}%)</div>'
            },
            legend: {
                orient: this.props.legendOrient || 'vertical',
                top: 15,
                left: 420,
                tooltip: {
                    show: true
                },
                data: this.getLegendData()
            },
            series: this.getSeries(),
        };
        return option;
    },
    getLegendData() {
        let legend = this.props.legend;
        if (!legend) {
            const data = this.props.dataField ? this.props.chartData[this.props.dataField] : this.props.chartData;
    
            legend = _.pluck(data, 'name');
            const subField = this.props.subField;
            if (subField) {
                const subLegend = _.chain(data).pluck(subField).flatten().pluck('name').value();
                legend = legend.concat(subLegend);
            }
        }
        return legend;
    },
    getSeries: function() {
        let series = [];
        const serieObj = {
            name: '',
            type: 'pie',
            radius: '70%',
            center: ['30%', '55%'],
            data: [],
            label: {
                normal: {
                    formatter: '{c}'
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };

        const chartDataSeries = this.props.chartData.series;
        const subField = this.props.subField;
        let chartData = this.props.chartData ? JSON.parse(JSON.stringify(this.props.chartData)) : [];
        if (this.props.dataField) chartData = chartData[this.props.dataField];

        const maxSeries = this.props.maxSeries;

        if (maxSeries && chartData.length > maxSeries) {
            chartData.splice(maxSeries);
        }

        if (chartDataSeries) {
            series = _.map(chartDataSeries, (data, index) => {
                const serie = JSON.parse(JSON.stringify(serieObj));
                serie.radius = '50%';
                serie.data = this.getSerieData(data);
                serie.center[0] = (20 + index * 40) + '%';

                return serie;
            });
        } else if (subField) {
            const innerSerie = JSON.parse(JSON.stringify(serieObj));
            innerSerie.radius = [0, '45%'];
            innerSerie.label = {
                normal: {
                    show: false,
                    position: 'inner'
                }
            },
            innerSerie.labelLine = {
                normal: {
                    show: false
                }
            },
            innerSerie.data = this.getSerieData(chartData);
            series.push(innerSerie);

            const outerSerie = JSON.parse(JSON.stringify(serieObj));
            outerSerie.radius = ['50%', '70%'];
            const subData = _.chain(chartData).pluck(subField).flatten().value();
            outerSerie.data = this.getSerieData(subData);
            series.push(outerSerie);

            return series;
        } else {
            const serie = JSON.parse(JSON.stringify(serieObj));
            serie.data = this.getSerieData(chartData);
            series.push(serie);
        }

        return series;
    },
    getSerieData: function(data) {
        if (_.isArray(data)) {
            return data.map(item => {
                return {
                    name: item.name,
                    value: item.count
                };
            });
        } else {
            const serieData = [];
            const legend = this.props.legend;
            const excludeKey = this.props.excludeKey || [];

            for (let key in data) {
                const legendItem = _.find(legend, item => item.key === key);

                const name = legendItem ? legendItem.name : key;

                if (excludeKey.indexOf(key) === -1) {
                    serieData.push({
                        name: name, 
                        value: data[key]
                    });
                }
            }

            return serieData;
        }
    },
    renderChart: function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        var _this = this;
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
    },
    componentDidMount: function() {
        this.renderChart();
    },
    componentDidUpdate: function(prevProps) {
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
    },
    componentWillUnmount: function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    render: function() {
        var _this = this;
        return (
            <div className="analysis-chart">
                <div ref="chart" style={{width: this.props.width,height: this.props.height}} className="chart" data-title={this.props.title}></div>
            </div>
        );
    }
});

module.exports = PieChart;
