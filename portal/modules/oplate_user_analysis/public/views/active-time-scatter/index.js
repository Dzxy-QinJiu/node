/**
 * 用户活跃时间段统计
 */
var echarts = require("echarts-eefung");
var immutable = require("immutable");
var Spinner = require("../../../../../components/spinner");
require("./index.scss");
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";


var ScatterChart = React.createClass({
    echartInstance: null,
    getDefaultProps : function() {
        return {
            list : [],
            width:'100%',
            height:300,
            resultType : 'loading'
        };
    },
    renderChart : function(){
        var hours = _.range(24);
        var days = [ Intl.get("user.time.sunday", "周日"),Intl.get("user.time.monday", "周一"),Intl.get("user.time.tuesday", "周二"),Intl.get("user.time.wednesday", "周三"), Intl.get("user.time.thursday", "周四"),Intl.get("user.time.friday", "周五"),Intl.get("user.time.saturday", "周六")];
        var data = this.props.list;
        var dataMax = _.max(data , (item) => item.count);
        var countMax = dataMax.count;
        var _this = this;
        if(this.echartInstance) {
            try {_this.echartInstance.dispose()} catch(e){};
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var option = {
            tooltip: {
                extraCssText : echartsTooltipCssText,
                formatter: function(obj){
                    var weekdaysIndex = obj.seriesIndex;
                    var hour = obj.value[0];
                    var active = obj.value[1];
                    return `${days[weekdaysIndex]}${hour}${Intl.get("crm.75", "点")}
                         <br/>
                         ${Intl.get("oplate.user.analysis.29", "操作数")}：${active}`;
                }
            },
            title: [],
            singleAxis: [],
            series: []
        };

        echarts.util.each(days, function (day, idx) {
            option.title.push({
                textBaseline: 'middle',
                top: (idx + 0.5) * 100 / 10 + '%',
                text: day,
                textStyle: {
                    fontSize: 12,
                    color: "#62696f",
                    fontStyle: "normal",
                    fontWeight: "normal"
                }
            });
            option.singleAxis.push({
                left: 50,
                type: 'category',
                boundaryGap: false,
                axisLine:{
                    lineStyle: {
                        color: '#C0C0C0',
                        width: 0.5
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#C0C0C0',
                        width: 0.5
                    }
                },
                axisLabel: {
                    show: day == Intl.get("user.time.saturday", "周六") ? true : false,
                    margin: 16,
                    textStyle: {
                        fontSize: 12,
                        color: "#62696f",
                        fontStyle: "normal",
                        fontWeight: "normal"
                    }
                },
                data: hours,
                top: (idx * 100 / 10 + 5) + '%',
                height: (100 / 10 - 10) + '%'
            });
            option.series.push({
                singleAxisIndex: idx,
                coordinateSystem: 'singleAxis',
                type: 'scatter',
                data: [],
                symbolSize: function (dataItem) {
                    if(countMax == 0){
                        return dataItem[1];
                    }
                    return dataItem[1] * (30/countMax);
                }
            });

        });

        echarts.util.each(data, function (dataItem) {
            option.series[dataItem.week].data.push([dataItem.hour, dataItem.count]);
        });
        this.echartInstance.setOption(option);

        if(!data.length) {
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

    render : function() {
        var _this = this;
        return (
            <div className="analysis_timerange_bar_chart" ref="wrap">
                {this.props.resultType === 'loading'?
                    (
                        <div className="loadwrap" style={{height:this.props.height}}>
                            <Spinner/>
                        </div>
                    ):
                    (
                        <div>
                            <div
                                ref="chart"
                                style={{width:this.props.width,height:this.props.height}}
                                className="chart"
                                data-title={this.props.title}
                            >
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = ScatterChart;
