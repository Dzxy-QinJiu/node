/**
 * 饼图
 */
var echarts = require("echarts-eefung");
require("../bar/index.less");
var Spinner = require("../../../../../components/spinner");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
var immutable = require("immutable");

var SingleAppBarChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            list : [],
            title : Intl.get("user.analysis.team", "团队统计"),
            width:'100%',
            height:234,
            resultType : 'loading',
            xAxisInterval:'auto',//x轴坐标label间隔的控制,默认：自动调整，（0：所有label全部展示）
            xAxisLabelAlign:'center',//x轴坐标label位置，默认：剧中（居左、右）
            xAxisRotate:0, //x轴坐标label倾斜的角度（避免重叠时设置）
            isShowSplitLine: false,
            isShowSplitArea: false
        };
    },
    getLegend : function() {
        return {
            show : true
        };
    },
    // 横坐标的值
    getCategorys : function() {
        return _.pluck(this.props.list , 'name');
    },

    getTooltip : function() {
        return {
            show : true,
            extraCssText : echartsTooltipCssText,
            formatter : function(obj) {
                var name = obj.name;
                if(!name) {
                    name = 'null';
                } else if(name === 'unknown') {
                    name = Intl.get("user.unknown", "未知");
                }
                return `<div>
                           <span>${name}:${obj.value}</span>
                        </div>`;
            }
        };
    },

    getEchartOptions : function() {
        let yValue = _.pluck(this.props.list , 'count');
        // 获取最大的y轴刻度值
        let yValueMax = _.max(yValue);
        // y轴的最大值
        let yMax = null;
        // y轴的最大值小于等于5时，设置y坐标轴刻度最大值为5
        if (yValueMax <= 5) {
            yMax = 5;
        }
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
                    splitLine : this.props.isShowSplitLine,
                    splitArea : {
                        show: this.props.isShowSplitArea
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
                            align: this.props.xAxisLabelAlign
                        },
                        interval: this.props.xAxisInterval,
                        rotate: this.props.xAxisRotate,
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
            yAxis : [
                {
                    minInterval: 1,
                    max: yMax,
                    type : 'value',
                    splitArea : {
                        show: this.props.isShowSplitArea
                    },
                    splitLine : this.props.isShowSplitLine,
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
           series : [{
               type : 'bar',
               barMaxWidth:40,
               barMinWidth : 4,
               data : _.pluck(this.props.list , 'count')
           }]
        };
        return option;
    },
    renderChart : function() {
        if(this.echartInstance) {
            try {
                _this.echartInstance.dispose();
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(e));
            }
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        var _this = this;
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                try {
                    _this.echartInstance.dispose();
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log(JSON.stringify(e));
                }
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options,true);
            this.echartInstance.on("click", params => {
                this.props.getClickType(params.name);
            });
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
        return (
            <div className="analysis_bar_chart" ref="wrap">
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

module.exports = SingleAppBarChart;
