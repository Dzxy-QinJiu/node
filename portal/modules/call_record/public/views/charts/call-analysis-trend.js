var echarts = require("echarts-eefung");
var immutable = require("immutable");
//macrons主题
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var TimeSeriesLinechart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            dataList : [],
            tooltip : function() {}
        };
    },
    componentDidMount : function() {
        this.renderChart();
        $(window).on('resize', this.windowResize);
    },
    componentDidUpdate : function(prevProps) {
        if(
            this.props.dataList &&
            prevProps.dataList &&
            immutable.is(this.props.dataList , prevProps.dataList) &&
            this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderChart();
    },
    componentWillUnmount : function() {
        $(window).off('resize', this.windowResize);
        if(this.echartInstance) {
            var _this = this;
            try {_this.echartInstance.clear();}catch(e){}
            this.echartInstance = null;
        }
    },
    windowResize: function () {
        clearTimeout(this.resizeTimeout);
        var _this = this;
        this.resizeTimeout = setTimeout(() => {
           this.renderChart();
        }, 300);
    },
    renderChart : function() {
        var _this = this;
        if(this.echartInstance) {
            try {_this.echartInstance.clear()} catch(e){}
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
    },
    getSeries : function() {
        return  this.props.dataList.map((item) =>{
            return [
                new Date(item.timestamp),
                item.count
            ];
        });
    },
    getEchartOptions : function() {
        return {
            title : null,
            toolbox: {
                show : false
            },
            calculable : false,
            tooltip : { // 图表中的提示数据信息
                trigger: 'axis',
                formatter : (params) =>{
                    var params = params[0];
                    var timeText = moment(params && params.data && params.data[0] || Date.now()).format(oplateConsts.DATE_FORMAT);
                    var count = params && params.data && params.data[1] || '0';
                    return this.props.tooltip(timeText , count);
                }
            },
            legend : {
                data : ['']
            },
            grid: {
                x : 50,
                y : 20,
                x2 : 30,
                y2 : 30,
                borderWidth : 0
            },
            xAxis : [
                {
                    type : 'time',  // 类型为time，时间轴
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
                            color:'#939393',
                            align:'center'
                        },
                        formatter: () => { // 不显示x轴数值
                            return "";
                        }
                    }
                }
            ],
            yAxis : [
                {
                    minInterval: 1,
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
                        },
                        formatter: () => { // 不显示y轴数值
                            return "";
                        }
                    },
                    axisTick: { // y轴不显示刻度
                        show:false
                    }
                }
            ],
            series : [
                {
                    name: '',
                    type: 'line',
                    symbolSize: 6,
                    itemStyle : {
                        normal : {
                            color : '#4d96d1'
                        }
                    },
                    data:  this.getSeries()
                }
            ]
        };
    },
    render : function() {
        return (
            <div className="echart_wrap" ref="chart" style={{width:this.props.width, height:'100%'}}></div>
        );
    }
});

module.exports = TimeSeriesLinechart;