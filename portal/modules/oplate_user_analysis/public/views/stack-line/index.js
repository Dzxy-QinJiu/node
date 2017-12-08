/**
 * 堆叠折线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
var Spinner = require("../../../../../components/spinner");
var immutable = require("immutable");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
let chartUtil = require("../../utils/chart-util");
var StackLineChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            list : [],
            width:'100%',
            height:234,
            resultType : 'loading',
            legend : null
        };
    },
    getLegend : function() {
        if(!this.props.legend) {
            return {
                show : false,
                data :[]
            };
        } else {
            return {
                data:_.pluck(this.props.legend , 'version')
            }
        }
    },
    getCategorys : function() {
        let timeArray = _.uniq(_.pluck(this.props.legend, 'time')); // 时间点
        return _.map(timeArray , (time) => {
            return moment(time).format(oplateConsts.DATE_FORMAT);
        });
    },
    getEchartOptions : function() {
        var _this = this;
        let countArray = _.pluck(this.props.legend, 'count');
        let yMax = 0, max = null;
        let yInterval = null;
        if (countArray.length) {
            yMax = _.max(countArray);
        }
        // y轴的最大值小于等于5时，设置y坐标轴刻度最大值为5（规定）
        if (yMax < 5) { 
            yInterval = 1;
            max = 5;
        }
        var option = {
            title:null,
            animation : false,
            tooltip : {
                trigger : "axis",
                show : true,
                extraCssText : echartsTooltipCssText,
                position: function (mousePointer, params, tooltipDom) {
                    return chartUtil.getTooltipPosition(_this, mousePointer, params, tooltipDom);
                }
            },
            legend: this.getLegend(),
            toolbox: {
                show : false
            },
            calculable : false,
            grid : {
                x : 50,
                y : 20,
                x2 : 30,
                y2 : 30,
                borderWidth : 0
            },
            xAxis : [
                {
                    type : 'category',
                    data : this.getCategorys(),
                    boundaryGap: false,
                    splitLine : false,
                    splitArea : {
                        show: false
                    },
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
                            color:'#939393',
                            align:'center'
                        }
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    interval: yInterval,
                    max: max,
                    splitArea : {
                        show: false
                    },
                    splitLine : false,
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
            series : this.props.list
        };
        return option;
    },
    renderChart : function() {
        if(this.echartInstance) {
            try {_this.echartInstance.dispose()} catch(e){};
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        var _this = this;
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                try {_this.echartInstance.dispose()} catch(e){};
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
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
            try {_this.echartInstance.dispose();}catch(e){}
            this.echartInstance = null;
        }
    },
    render : function() {
        return (
            <div className="analysis_single_line_chart" ref="wrap">
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
});

module.exports = StackLineChart;