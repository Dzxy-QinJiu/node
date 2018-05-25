/**
 * 饼图
 */
var echarts = require("echarts-eefung");
require("./index.less");
var Color = require("color");
var Spinner = require("../../../../../components/spinner");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
var immutable = require("immutable");
import { packageTry } from 'LIB_DIR/func';

var PieChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            data : [],
            legend : [],
            title : Intl.get("oplate.user.analysis.6", "在线时长统计"),
            width:'100%',
            height:214,
            resultType : 'loading',
        };
    },
    getCategorys : function() {
        return _.pluck(this.props.list , 'name');
    },
    getEchartOptions : function() {
        var option = {
            animation : false,
            title : null,
            tooltip : {
                trigger: 'item',
                extraCssText : echartsTooltipCssText,
                formatter: "<div class='echarts-tooltip'>{b} : {c} ({d}%)</div>"
            },
            legend: {
                orient: 'vertical',
                right: '2%',
                top : '2%',
                data: this.props.legend
            },
            series : [
                {
                    name: '',
                    type: 'pie',
                    radius : '70%',
                    center: ['40%', '60%'],
                    data:this.getSeries(),
                    label : {
                        normal : {
                            formatter : "{c}"
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        return option;
    },
    getSeries : function() {
        var list = this.props.data || [];
        var legend = this.props.legend || [];
        return legend.map((legendName,idx) => {
            return {
                name : legendName,
                value : list[idx].count
            };
        });
    },
    renderChart : function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        if(!this.props.data || !this.props.data.length) {
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
            this.props.data &&
            prevProps.data &&
            immutable.is(this.props.data , prevProps.data) &&
            this.props.resultType === prevProps.resultType &&
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
    render : function() {
        var _this = this;
        return (
            <div className="analysis_pie_chart" ref="wrap">
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

module.exports = PieChart;
