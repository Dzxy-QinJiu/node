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
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
import { packageTry } from 'LIB_DIR/func';

var BarChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            list : [],
            title : Intl.get("oplate.user.analysis.33", "新增用户行业分布"),
            width:'100%',
            legendRight: 'auto',
            resultType : 'loading',
            startDate: '',
            endDate : '',
            /**
             * [
             *  {name : Intl.get("user.analysis.formal", "正式"),key : 'formal'}
             * ]
             */
            legend : null
        };
    },
    getLegend : function() {
        return {
            show : true,
            right : this.props.legendRight,
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
            var line = {
                name : legendInfo.name,
                type : 'bar',
                stack : 'stack',
                barMaxWidth:40,
                barMinWidth : 4,
                data : _.pluck(_this.props.list.slice().reverse() , legendInfo.key),
            };
            series.push(line);
        });
        return series;
    },
    getTooltip : function() {
        var _this = this;
        return {
            show: true,
            extraCssText : echartsTooltipCssText,
            formatter : function(obj) {
                var name = obj.name;
                if(!name) {
                    name = 'null';
                } else if(name === 'unknown') {
                    name = Intl.get("user.unknown", "未知");
                }
                let timeDesc =Intl.get("operation.report.time.duration","至{time}为止",{time:_this.props.endDate});
                if(_this.props.startDate){
                    if(_this.props.startDate == _this.props.endDate) {
                        timeDesc = _this.props.startDate;
                    }else{
                        timeDesc = _this.props.startDate + Intl.get("common.time.connector","至") +  _this.props.endDate;
                    }
                }
                return `<div class="echarts-tooltip">
                        <div class="title">${timeDesc}<span>${name}</span></div>
                        <div>${obj.seriesName}:<span>${obj.value}</span></div>
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
                y : 60,
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
        if(this.echartInstance) {
            packageTry(() => {
                _this.echartInstance.dispose();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        var _this = this;
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                packageTry(() => {
                    _this.echartInstance.dispose();
                });
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options,true);
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
            packageTry(() => {
                _this.echartInstance.dispose();
            });
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