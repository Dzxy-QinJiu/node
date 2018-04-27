/**
 *   通话记录中， 114占比，饼图展示
 * */
var echarts = require("echarts-eefung");
var immutable = require("immutable");
//macrons主题
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var PieChart = React.createClass({
    echartInstance : null,

    getDefaultProps : function() {
        return {
            dataList : [],
            height: 400
        };
    },

    componentDidMount : function() {
        this.renderChart();
    },
    componentWillUnmount : function() {
        if(this.echartInstance) {
            var _this = this;
            try {_this.echartInstance.dispose();}catch(e){}
            this.echartInstance = null;
        }
    },
    componentDidUpdate : function(prevProps) {
        if(
            this.props.dataList &&
            prevProps.dataList &&
            immutable.is(this.props.dataList , prevProps.dataList)
        ) {
            return;
        }
        this.renderChart();
    },

    renderChart : function() {
        var _this = this;
        if(this.echartInstance) {
            try {_this.echartInstance.clear();} catch(e){}
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
    },
    getSeries : function() {
        var list = this.props.dataList || [];
        var legend =  _.pluck(this.props.dataList, 'name')|| [];
        return legend.map((legendName,idx) => {
            return {
                name : legendName,
                value : list[idx].num  // 注意：饼图中，value是key
            };
        });
    },
    getEchartOptions : function() {
        return {
            tooltip : {
                trigger: 'item',
                formatter: "<div class='echarts-tooltip'>{b} : {c} ({d}%)</div>"
            },
            legend: {
                orient: 'vertical',
                right: '2%',
                top : '2%',
                data: _.pluck(this.props.dataList, 'name')
            },

            series : [
                {
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data: this.getSeries(),
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
    },
    render : function() {
        return (
            <div ref="chart" style={{width: '100%' ,height:this.props.height}}></div>
        );
    }
});

module.exports = PieChart;
