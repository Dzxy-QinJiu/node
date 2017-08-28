var echarts = require("echarts-eefung");
var BarChart = require("./barchart");
var animationCount = 0;
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var AnalysisEchartBarHorizontal = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            width : 500,
            height : 500,
            className : "analysis-echart-bar-horizontal-wrapper",
            style : {},
            formatter : function(){},
            dataList : [],
            noData : false
        };
    },
    renderMap : function() {
        if(this.props.height > 0 && this.props.width > 0) {
            if(this.echartInstance) {
                this.echartInstance.dispose();
            }
            var chartWrap = this.refs.chartWrap;
            var _this = this;
            var mapUtil = new BarChart({
                dataList : _this.props.dataList,
                formatter : _this.props.formatter,
                height : _this.props.height,
                animation : ++animationCount > 1 ? false : true,
                noData : _this.props.noData
            });
            var options = mapUtil.getEchartOptions();
            this.echartInstance = echarts.init(chartWrap,macronsTheme);
            this.echartInstance.setOption(options);
        }
    },
    componentDidMount : function() {
        this.renderMap();
    },
    componentWillUnmount : function() {
        if(this.echartInstance) {
            this.echartInstance.dispose();
        }
    },
    componentDidUpdate : function() {
        this.renderMap();
    },
    render : function() {

        return (
            <div>
                <div ref="chartWrap" style={{width:this.props.width,height:this.props.height,marginBottom:'15px',borderBottom:'1px solid transparent',...this.props.style}} className={this.props.className} formatter={this.props.formatter}></div>
            </div>
        );
    }
});

module.exports = AnalysisEchartBarHorizontal;