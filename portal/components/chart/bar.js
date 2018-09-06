/**
 * 柱状图
 */
require('./style.less');
import {AntcChart} from 'antc';
var echartsTooltipCssText = require('../../lib/utils/echarts-tooltip-csstext');
var textWidth = require('../../public/sources/utils/measure-text');
import { XAXIS_COLOR } from './consts';
import Trace from 'LIB_DIR/trace';
import PropTypes from 'prop-types'; 

var COLORSINGLE = '#1790cf';
var COLORMULTIPLE = ['#1790cf', '#1bb2d8'];

class BarChart extends React.Component {
    static defaultProps = {
        chartData: [],
        height: 214,
        resultType: 'loading',
        startDate: '',
        endDate: '',
        showLabel: false,//是否展示柱状图上的数据
        //超过多少的柱子时横轴文字需要倾斜显示
        xAxisRotateLength: 12,
    };

    static propTypes = {
        chartData: PropTypes.array,
        height: PropTypes.number,
        resultType: PropTypes.string,
        valueField: PropTypes.string,
        dataField: PropTypes.string,
        name: PropTypes.string,
        legend: PropTypes.array,
        xAxisRotateLength: PropTypes.number,
        autoAdjustXaxisLabel: PropTypes.bool,
        showLabel: PropTypes.bool,
        labelFormatter: PropTypes.func,
        gridY2: PropTypes.number,
        xAxisLabelAlign: PropTypes.string,
        xAxisInterval: PropTypes.string,
        xAxisRotate: PropTypes.number,
    }

    adjustXaxis = (categories, xAxisOptions) => {
        const length = categories.length;
        if (length < 40) {
            //横坐标展示所有的种类
            xAxisOptions.interval = 0;
            const adjustLength = this.props.xAxisRotateLength;
            if (length > adjustLength) {
                xAxisOptions.labelAlign = 'left';
                if (length <= 25) {
                    xAxisOptions.rotate = -30;
                } else {
                    xAxisOptions.rotate = -50;
                }
            }
        }
    };

    getLegend = () => {
        if (!this.props.legend) {
            return {
                show: false,
                data: []
            };
        }
        return {
            show: true,
            data: _.map(this.props.legend , 'name')
        };
    };

    getCategories = () => {
        let chartData = this.props.chartData;

        if (this.props.dataField) {
            chartData = chartData[this.props.dataField];
        }
        var categories = _.map(chartData , 'name');
        return categories;
    };

    getSeries = () => {
        var _this = this;
        let chartData = this.props.chartData;

        if (this.props.dataField) {
            chartData = chartData[this.props.dataField];
        }

        const serieTpl = {
            name: this.props.name || '',
            type: 'bar',
            barMaxWidth: 40,
            barMinWidth: 4,
            stack: 'stack',
        };

        const legend = this.props.legend;

        if (_.isEmpty(legend)) {
            const serie = _.clone(serieTpl);
            serie.data = _.map(chartData, this.props.valueField);
            serie.itemStyle = {
                normal: {
                    color: COLORSINGLE,
                }
            };

            return serie;
        } else {
            return _.map(legend, (legendItem,idx) => {
                var currentColor = COLORMULTIPLE[idx];
                const serie = _.clone(serieTpl);
                serie.name = legendItem.name;
                serie.data = _.map(chartData , this.props.valueField || legendItem.key);
                serie.stack = 'stack';
                serie.itemStyle = {
                    normal: {
                        color: currentColor,
                        label: {show: _this.props.showLabel, position: 'top'}
                    }
                };
                return serie;
            });
        }
    };

    getMargin = () => {
        let chartData = this.props.chartData;

        if (this.props.dataField) {
            chartData = chartData[this.props.dataField];
        }
        var industry = _.map(chartData.slice().reverse() , 'name');
        if(!industry.length) {
            return 80;
        }
        var marginList = _.map(industry , function(text) {
            text = text === 'unknown' ? Intl.get('user.unknown', '未知') : text;
            return textWidth.measureTextWidth(text , 12);
        });
        var maxMargin = _.max(marginList) + 10;
        return maxMargin;
    };

    getEchartOptions = () => {
        const categories = this.getCategories();
        const xAxisOptions = {
            interval: 'auto',//x轴坐标label间隔的控制,默认：自动调整，（0：所有label全部展示）
            labelAlign: 'center',//x轴坐标label位置，默认：剧中（居左、右）
            rotate: 0,//x轴坐标label倾斜的角度（避免重叠时设置）
        };

        if (this.props.autoAdjustXaxisLabel) {
            this.adjustXaxis(categories, xAxisOptions);
        }

        const labelConf = {
            show: typeof this.props.showLabel === 'boolean' ? this.props.showLabel : true,
            position: 'outside',
            formatter: this.props.labelFormatter || '{c}'
        };

        var option = {
            title: null,
            animation: false,
            tooltip: this.getTooltip(),
            legend: this.getLegend(),
            toolbox: {
                show: false
            },
            label: {
                normal: labelConf,
                emphasis: labelConf,
            },
            calculable: false,
            grid: {
                x: 50,
                y: 20,
                x2: 30,
                y2: this.props.gridY2 || 60,
                borderWidth: 0
            },
            xAxis: [
                {
                    type: 'category',
                    data: categories,
                    splitLine: false,
                    splitArea: false,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#d1d1d1'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: XAXIS_COLOR,
                            align: this.props.xAxisLabelAlign || xAxisOptions.labelAlign
                        },
                        interval: this.props.xAxisInterval || xAxisOptions.interval,
                        rotate: this.props.xAxisRotate || xAxisOptions.rotate,
                        formatter: function(text) {
                            if(text === 'unknown') {
                                text = Intl.get('common.unknown', '未知');
                            } else if(!text) {
                                text = 'null';
                            }
                            return text;
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: false,
                    splitArea: false,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#d1d1d1'
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#939393'
                        }
                    }
                }
            ],
            series: this.getSeries()
        };
        return option;
    };

    getTooltip = () => {
        var _this = this;
        return {
            show: true,
            extraCssText: echartsTooltipCssText,
            formatter: function(obj) {
                var name = obj.name;
                if(!name) {
                    name = 'null';
                } else if(name === 'unknown') {
                    name = Intl.get('common.unknown', '未知'); 
                }
                var seriesName = obj.seriesName;
                let timeDesc = Intl.get('oplate_customer_analysis.12', '至{time}为止', {time: _this.props.endDate});
                if(_this.props.startDate){
                    if(_this.props.startDate === _this.props.endDate) {
                        timeDesc = _this.props.startDate;
                    }else{
                        timeDesc = _this.props.startDate + Intl.get('common.time.connector', '至') + _this.props.endDate;
                    }
                }
                var colorList = COLORMULTIPLE;
                return `<div class="echarts-tooltip">
                            <div class="title">
                                ${timeDesc}
                            </div>
                            <div class="content">
                                 <span style="background:${colorList[0]}"><b style="background:${colorList[0]}"></b></span>
                                 <i>${name} : </i>
                                 <i>${obj.value}</i>
                            </div>
                         </div>`;
            }
        };
    };

    render() {
        return (
            <AntcChart
                option={this.getEchartOptions()}
                resultType={this.props.resultType}
                height={this.props.height}
            />
        );
    }
}

module.exports = BarChart;

