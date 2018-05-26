var echarts = require("echarts-eefung");
var animationCount = 0;
var LineChart = require("./linechart");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var AnalysisLinechartTimerange = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            width: 500,
            height: 500,
            className: "analysis-linechart-timerange",
            style: {},
            formatter: function(){},
            dataList: [],
            noData: false,
            unit: "day"
        };
    },
    renderChart: function() {
        if(this.props.height > 0 && this.props.width > 0) {
            if(this.echartInstance) {
                this.echartInstance.dispose();
            }
            var chartDom = this.refs.chartDom;
            var _this = this;
            var chartUtil = new LineChart({
                dataList: _this.props.dataList,
                formatter: _this.props.formatter,
                height: _this.props.height,
                width: _this.props.width,
                animation: ++animationCount > 1 ? false : true,
                noData: _this.props.noData,
                unit: _this.props.unit
            });
            var options = chartUtil.getEchartOptions();
            this.echartInstance = echarts.init(chartDom,macronsTheme);
            this.echartInstance.setOption(options);
        }
    },
    componentDidMount: function() {
        this.renderChart();
    },
    componentWillUnmount: function() {
        if(this.echartInstance) {
            this.echartInstance.dispose();
        }
    },
    componentDidUpdate: function() {
        this.renderChart();
    },
    render: function() {

        return (
            <div>
                <div ref="chartDom" style={{width: this.props.width,height: this.props.height,...this.props.style}} className={this.props.className} formatter={this.props.formatter}></div>
            </div>
        );
    }
});

module.exports = AnalysisLinechartTimerange;