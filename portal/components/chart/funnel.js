/**
 * 漏斗图
 */
var echarts = require("echarts-eefung");
require("./style.scss");
var Spinner = require("../spinner");
var macronsTheme = require("./theme-macrons");
var immutable = require("immutable");
const querystring = require("querystring");
import Trace from "LIB_DIR/trace";

var FunnelChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            chartData : [],
            title : "",
            width:'100%',
            height: 600,
            resultType : 'loading',
        };
    },
    getSeries : function() {
        const series1 = {
            type:'funnel',
            x: 10,
            y: 10,
            data : this.props.chartData,
            sort : this.props.sort || "descending",
            max : this.props.max || 100,
            minSize : this.props.minSize || "0%",
            itemStyle : {
                normal : {
                    label : {
                        textStyle: {
                            color: "#506470"
                        }
                    },
                    labelLine : {
                        show : false
                    }
                },
                emphasis : {
                }
            },
        };

        let series2 = JSON.parse(JSON.stringify(series1));

        series2.itemStyle.normal.label = {
            formatter: function (params) { return params.data.total },
            position: "inside",
            textStyle: {
                color: "#506470"
            }
        };

        series2.itemStyle.emphasis.label = {
            formatter: function (params) { return params.data.total }
        };

        return [series1, series2];
    },
    getEchartOptions : function() {
        var option = {
            title: {
                text: this.props.title,
                x: "center",
                y: "bottom",
                textStyle: {
                   fontSize: 14,
                   fontWeight: "normal"
                }
            },
            animation : false,
            toolbox: {
                show : false
            },
            calculable : false,
            series : this.getSeries(),
        };
        return option;
    },
    renderChart : function() {
        if(this.echartInstance) {
            try {this.echartInstance.dispose()} catch(e){};
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        if(_.isEmpty(this.props.chartData)) {
            if(this.echartInstance) {
                try {this.echartInstance.dispose()} catch(e){};
            }
            $(this.refs.chart).html("<div class='nodata'>" + Intl.get("common.no.data", "暂无数据") + "</div>");
        } else {
            $(this.refs.chart).find(".nodata").remove();
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options,true);
            const jumpProps = this.props.jumpProps;
            if (jumpProps) {
                this.echartInstance.on("click", params => {
                    Trace.traceEvent(params.event.event,"跳转到'" + params.name + "'用户列表");
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
        }
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
            try {this.echartInstance.dispose();}catch(e){}
            this.echartInstance = null;
        }
    },
    render : function() {
        return (
            <div className="analysis-chart" ref="wrap" style={{width:this.props.width, float:"left"}}>
                {this.props.resultType === 'loading'?
                    (
                        <div className="loadwrap" style={{height:this.props.height}}>
                            <Spinner/>
                        </div>
                    ):
                    (
                        <div ref="chart" style={{width:this.props.width,height:this.props.height}} className="chart" data-title={this.props.title}></div>
                    )
                }
            </div>
        );
    }
});

module.exports = FunnelChart;
