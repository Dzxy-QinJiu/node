/**
 * 柱状图
 */
var echarts = require("echarts-eefung");
require("./style.less");
var macronsTheme = require("./theme-macrons");
var echartsTooltipCssText = require("../../lib/utils/echarts-tooltip-csstext");
var textWidth = require("../../public/sources/utils/measure-text");
var immutable = require("immutable");
const querystring = require("querystring");
import { XAXIS_COLOR } from "./consts";
import Trace from "LIB_DIR/trace";
import { packageTry } from 'LIB_DIR/func';

var COLORSINGLE = '#1790cf';
var COLORMULTIPLE = ['#1790cf', '#1bb2d8'];
var BarChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            chartData : [],
            width:'100%',
            height:214,
            resultType : 'loading',
            startDate: '',
            endDate : '',
            showLabel: false,//是否展示柱状图上的数据
            //超过多少的柱子时横轴文字需要倾斜显示
            xAxisRotateLength: 12,
        };
    },
    componentDidMount : function() {
        this.renderChart();
    },
    componentDidUpdate : function(prevProps) {
        if(
            this.props.chartData.length &&
            prevProps.chartData.length &&
            immutable.is(this.props.chartData , prevProps.chartData) &&
            this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderChart();
    },
    componentWillUnmount : function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    adjustXaxis : function(categories, xAxisOptions) {
        const length = categories.length;
        if (length < 40) {
            //横坐标展示所有的种类
            xAxisOptions.interval = 0;
            const adjustLength = this.props.xAxisRotateLength;
            if (length > adjustLength) {
                xAxisOptions.labelAlign = "left";
                if (length <= 25) {
                    xAxisOptions.rotate = -30;
                } else {
                    xAxisOptions.rotate = -50;
                }
            }
        }
    },
    getLegend : function() {
        if (!this.props.legend) {
            return {
                show: false,
                data: []
            };
        }
        return {
            show : true,
            data :_.pluck(this.props.legend , 'name')
        };
    },
    getCategories : function() {
        let chartData = this.props.chartData;

        if (this.props.dataField) {
            chartData = chartData[this.props.dataField];
        }
        var categories = "";
        if (this.props.reverseChart){
            categories = _.pluck(chartData.slice().reverse() , 'name');
        }else{
            categories = _.pluck(chartData , 'name');
        }
        return categories;
    },
    getSeries : function() {
        var _this = this;
        let chartData = this.props.chartData;

        if (this.props.dataField) {
            chartData = chartData[this.props.dataField];
        }

        const serieTpl = {
            name:this.props.name || "",
            type: "bar",
            barMaxWidth: 40,
            barMinWidth: 4,
            stack: 'stack',
        };

        const legend = this.props.legend;

        if (_.isEmpty(legend)) {
            const serie = _.clone(serieTpl);
            if (this.props.reverseChart){
                serie.data = _.pluck(chartData.slice().reverse(), this.props.valueField);
            }else{
                serie.data = _.pluck(chartData, this.props.valueField);
            }
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
                serie.data = _.pluck(chartData , this.props.valueField || legendItem.key);
                serie.stack = "stack";
                serie.itemStyle = {
                    normal: {
                        color: currentColor,
                        label: {show: _this.props.showLabel, position: 'top'}
                    }
                };
                return serie;
            });
        }
    },
    getMargin : function() {
        let chartData = this.props.chartData;

        if (this.props.dataField) {
            chartData = chartData[this.props.dataField];
        }
        var industry = _.pluck(chartData.slice().reverse() , 'name');
        if(!industry.length) {
            return 80;
        }
        var marginList = _.map(industry , function(text) {
            text = text === 'unknown' ? Intl.get("user.unknown", "未知"):text;
            return textWidth.measureTextWidth(text , 12);
        });
        var maxMargin = _.max(marginList) + 10;
        return maxMargin;
    },
    getEchartOptions : function() {
        const categories = this.getCategories();
        const xAxisOptions = {
            interval: "auto",//x轴坐标label间隔的控制,默认：自动调整，（0：所有label全部展示）
            labelAlign: "center",//x轴坐标label位置，默认：剧中（居左、右）
            rotate: 0,//x轴坐标label倾斜的角度（避免重叠时设置）
        };

        if (this.props.autoAdjustXaxisLabel) {
            this.adjustXaxis(categories, xAxisOptions);
        }

        const labelConf = {
            show: typeof this.props.showLabel === "boolean"? this.props.showLabel : true,
            position: "outside",
            formatter : this.props.labelFormatter || "{c}"
        };

        var option = {
            title:null,
            animation : false,
            tooltip : this.getTooltip(),
            legend: this.getLegend(),
            toolbox: {
                show : false
            },
            label : {
                normal : labelConf,
                emphasis : labelConf,
            },
            calculable : false,
            grid : {
                x : 50,
                y : 20,
                x2 : 30,
                y2 : this.props.gridY2 || 60,
                borderWidth : 0
            },
            xAxis : [
                {
                    type : 'category',
                    data : categories,
                    splitLine : false,
                    splitArea :  false,
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisTick : {
                        show : false
                    },
                    axisLabel : {
                        textStyle : {
                            color: XAXIS_COLOR,
                            align: this.props.xAxisLabelAlign || xAxisOptions.labelAlign
                        },
                        interval: this.props.xAxisInterval || xAxisOptions.interval,
                        rotate: this.props.xAxisRotate || xAxisOptions.rotate,
                        formatter : function(text) {
                            if(text === 'unknown') {
                                text = Intl.get("common.unknown", "未知");
                            } else if(!text) {
                                text = 'null';
                            }
                            return text;
                        }
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    splitLine : false,
                    splitArea : false,
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisLabel : {
                        textStyle : {
                            color:'#939393'
                        }
                    }
                }
            ],
            series : this.getSeries()
        };
        return option;
    },
    getReverseEchartOptions : function() {
        //grid上的margin
        var maxMargin = this.getMargin();
        const categories = this.getCategories();
        const xAxisOptions = {
            interval: "auto",//x轴坐标label间隔的控制,默认：自动调整，（0：所有label全部展示）
            labelAlign: "center",//x轴坐标label位置，默认：剧中（居左、右）
            rotate: 0,//x轴坐标label倾斜的角度（避免重叠时设置）
        };

        if (this.props.autoAdjustXaxisLabel) {
            this.adjustXaxis(categories, xAxisOptions);
        }

        const labelConf = {
            show: typeof this.props.showLabel === "boolean"? this.props.showLabel : true,
            position: "outside",
            formatter : this.props.labelFormatter || "{c}"
        };

        var option = {
            title:null,
            animation : false,
            tooltip : this.getTooltip(),
            legend: this.getLegend(),
            toolbox: {
                show : false
            },
            label : {
                normal : labelConf,
                emphasis : labelConf,
            },
            calculable : false,
            grid : {
                x : maxMargin,
                y : 40,
                x2 : 33,
                y2 : 0,
                borderWidth : 0
            },
            yAxis : [
                {
                    type : 'category',
                    data : categories,
                    splitLine : false,
                    splitArea : false,
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisTick : {
                        show : false
                    },
                    axisLabel : {
                        textStyle : {
                            color: XAXIS_COLOR,
                        },
                        formatter : function(text) {
                            if(text === 'unknown') {
                                text = Intl.get("common.unknown", "未知");
                            } else if(!text) {
                                text = 'null';
                            }
                            return text;
                        }
                    }
                }
            ],
            xAxis : [
                {
                    type : 'value',
                    splitLine : false,
                    splitArea : false,
                    position : 'top',
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisLabel : {
                        textStyle : {
                            color:'#939393'
                        }
                    }
                }
            ],
            series : this.getSeries()
        };
        return option;
    },
    getTooltip : function() {
        var _this = this;
        return {
            show : true,
            extraCssText : echartsTooltipCssText,
            formatter : function(obj) {
                var name = obj.name;
                if(!name) {
                    name = 'null';
                } else if(name === 'unknown') {
                    name = Intl.get("common.unknown", "未知"); 
                }
                var seriesName = obj.seriesName;
                let timeDesc =  Intl.get("oplate_customer_analysis.12", "至{time}为止", {time: _this.props.endDate});
                if(_this.props.startDate){
                    if(_this.props.startDate == _this.props.endDate) {
                        timeDesc = _this.props.startDate;
                    }else{
                        timeDesc = _this.props.startDate + Intl.get("common.time.connector", "至") +  _this.props.endDate;
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
    },
    renderChart : function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        var options = "";
        if (this.props.reverseChart) {
            options = this.getReverseEchartOptions();
        } else {
            options = this.getEchartOptions();
        }
        this.echartInstance.setOption(options, true);
        const jumpProps = this.props.jumpProps;
        if (jumpProps) {
            this.echartInstance.on("click", params => {
                Trace.traceEvent(params.event.event, "跳转到'" + params.name + "'用户列表");
                let query = {
                    app_id: this.props.app_id,
                    login_begin_date: this.props.startTime,
                    login_end_date: this.props.endTime,
                    analysis_filter_value: params.name,
                };

                if (jumpProps.query) _.extend(query, jumpProps.query);

                //跳转到用户列表
                window.open(jumpProps.url + "?" + querystring.stringify(query));
            });
        }

    },
    render: function() {
        return (
            <div className="analysis-chart">
                <div ref="chart" style={{width: this.props.width, height: this.props.height}} className="chart"
                    data-title={this.props.title}></div>
            </div>
        );
    }
});

module.exports = BarChart;
