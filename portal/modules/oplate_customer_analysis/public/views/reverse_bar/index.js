/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
//各种颜色
var Color = require("color");
var emitter = require("../../utils/emitter");
var Spinner = require("../../../../../components/spinner");
var immutable = require("immutable");
var minHeight = 214;
var textWidth = require("../../../../../public/sources/utils/measure-text");
var COLOR_MULTIPLE = ['#1790cf','#1bb2d8'];
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";

var BarChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            list : [],
            title : Intl.get("oplate_customer_analysis.16", "新增客户行业分布"),
            width:'100%',
            resultType : 'loading',
            startDate: '',
            endDate : '',
            /**
             * [
             *  {name : '正式',key : 'formal'}
             * ]
             */
            legend : null,
            showLabel: false//是否展示柱状图上的数据
        };
    },
    getLegend : function() {
        if(!this.props.legend) {
            return {
                show : false,
                data :[]
            };
        }
        return {
            show : false,
            data :_.pluck(this.props.legend , 'name')
        };
    },
    getMargin : function() {
        var industry = _.pluck(this.props.list.slice().reverse() , 'name');
        if(!industry.length) {
            return 80;
        }
        var marginList = _.map(industry , function(text) {
            text = text === 'unknown' ? Intl.get("user.unknown", "未知"):text;
            return textWidth.measureTextWidth(text , 12);
        });
        var maxMargin = _.max(marginList) + 20;
        return maxMargin;
    },
    getCategorys : function() {
        return _.pluck(this.props.list.slice().reverse() , 'name');
    },
    getSeries : function() {
        var _this = this;
        var series = [];
        _.each(this.props.legend , function(legendInfo,idx) {
            var currentColor = COLOR_MULTIPLE[idx];
            var line = {
                name : legendInfo.name,
                type : 'bar',
                barMaxWidth:40,
                barMinWidth : 4,
                stack : 'stack',
                data : _.pluck(_this.props.list.slice().reverse() , legendInfo.key),
                itemStyle : {
                    normal : {
                        color :currentColor,
                        label: {show: _this.props.showLabel, position: 'right'}
                    }
                }
            };
            series.push(line);
        });
        return series;
    },
    getTooltip : function() {
        var _this = this;
        return {
            trigger: 'item',
            extraCssText : echartsTooltipCssText,
            formatter : function(obj) {
                var value = obj.value;
                var name = obj.name;

                var target = _.find(_this.props.list , function(obj) {
                    return name === obj.name;
                });

                var allTotal = _.reduce(_this.props.list, function(sum , obj) {
                    return sum + obj.total;
                } , 0);

                var list = [];

                var currentTotal = 0 , colorList;
                _this.props.legend.map(function(legendInfo,idx) {
                    var value = target[legendInfo.key];
                    var percent = (value * 100 / allTotal).toFixed(2);
                    colorList = COLOR_MULTIPLE;
                    var color = colorList[idx];
                    currentTotal += value;
                    list.push(`<li><span style="background:${color}"></span><i>${legendInfo.name}</i><i class="number_text">${value}</i></li>`);
                });
                var totalPercent = (currentTotal * 100 / allTotal).toFixed(2);
                if (_this.props.legend && _this.props.legend.length > 1) {
                    list.unshift(`<li><span style="background:${colorList[0]}"><b style="background:${colorList[1]}"></b></span><i><ReactIntl.FormattedMessage id="oplate_customer_analysis.2" defaultMessage="总数" /></i><i class="number_text">${currentTotal}</i></li>`);
                }

                var displayName = name;
                if(!name) {
                    displayName = 'null';
                } else if(name === 'unknown') {
                    displayName = Intl.get("user.unknown", "未知");
                }
                let timeDesc = Intl.get("oplate_customer_analysis.12", "至{time}为止", {time: _this.props.endDate});
                if(_this.props.startDate){
                    if(_this.props.startDate == _this.props.endDate) {
                        timeDesc = _this.props.startDate;
                    }else{
                        timeDesc = _this.props.startDate + " 至 " +  _this.props.endDate;
                    }
                }
                return `<div class="echarts-tooltip">
                            <div class="title">${timeDesc}<span>${displayName}</span></div>
                            <ul class="list-unstyled">
                                ${list.join('')}
                            </ul>
                        </div>`;
            }
        };
    },
    getEchartOptions : function() {
        //grid上的margin
        var maxMargin = this.getMargin();
        var option = {
            title:null,
            animation : false,
            tooltip : this.getTooltip(),
            legend: this.getLegend(),
            toolbox: {
                show : false
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
                    data : this.getCategorys(),
                    splitLine : false,
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
                            color: '#939393'
                        },
                        formatter : function(text) {
                            if(text === 'unknown') {
                                text = Intl.get("user.unknown", "未知");
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
                    position : 'top',
                    min : 0,
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisLabel : {
                        textStyle : {
                            color:'#939393',
                            align:'right'
                        }
                    }
                }
            ],
            series : this.getSeries()
        };
        return option;
    },
    renderChart : function() {
        var _this = this;
        if(this.echartInstance) {
            try {
                _this.echartInstance.clear();
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(e));
            }
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                try {
                    _this.echartInstance.dispose();
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log(JSON.stringify(e));
                }
                this.echartInstance = null;
            }
            $(this.refs.chart).html("<div class='nodata'>" + Intl.get("common.no.data", "暂无数据") + "</div>");
        } else {
            $(this.refs.chart).find(".nodata").remove();
        }
    },
    componentDidMount : function() {
        this.renderChart();
    },
    componentDidUpdate : function(prevProps) {
        if(
            this.props.list.length &&
            prevProps.list.length &&
            immutable.is(this.props.list , prevProps.list) &&
            this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderChart();
    },
    componentWillUnmount : function() {
        if(this.echartInstance) {
            var _this = this;
            try {
                _this.echartInstance.dispose();
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(e));
            }
            this.echartInstance = null;
        }
    },
    render : function() {
        var _this = this;
        var height = this.props.height;
        return (
            <div className="analysis_bar_reverse_chart" ref="wrap">
                {this.props.resultType === 'loading'?
                    (
                        <div className="loadwrap" style={{height:minHeight}}>
                            <Spinner/>
                        </div>
                    ):
                    (
                        <div>
                            <div ref="chart" style={{width:this.props.width,height:height}} className="chart" data-title={this.props.title}></div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = BarChart;