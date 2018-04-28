require("./index.less");
var echarts = require("echarts-eefung");
require("echarts-eefung/map/js/china");
var MapChart = require("./mapchart");
import { MAP_PROVINCE } from "LIB_DIR/consts";
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var ChinaMap = React.createClass({

    provinceName(name) {
        let transName = '';
        _.find(MAP_PROVINCE, (item) => {
            for(var key in item) {
                if (item[key] == name) {
                    transName = key;
                }
            }
        });
        return transName;
    },
    echartInstance : null,
    renderMap : function() {
        if(this.props.height > 0 && this.props.width > 0) {
            if(this.echartInstance) {
                this.echartInstance.dispose();
            }
            var chartWrap = this.refs.chartWrap;
            var _this = this;
            var mapUtil = new MapChart({
                domWrap : chartWrap,
                dataList : _this.props.dataList,
                formatter : _this.props.formatter,
                height : _this.props.height
            });
            var options = mapUtil.getEchartOptions();
            this.echartInstance = echarts.init(chartWrap,macronsTheme);
            this.echartInstance.setOption(options);
            this.echartInstance.on("click", params => {
                let transName = this.provinceName(params.name);
                const provinceName = require("echarts-eefung/map/json/province/" + transName);
                echarts.registerMap(params.name, provinceName);
                options.series[0].mapType = params.name;
                this.echartInstance.setOption(options);
                //this.props.getClickEvent(params.name);
            });
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
    getDefaultProps : function() {
        return {
            width : 500,
            height : 500,
            className : "china-map-wrapper",
            style : {},
            dataList : [],
            formatter : function(){}
        };
    },
    render : function() {
        return (
            <div>
                <div ref="chartWrap" style={{width:this.props.width,height:this.props.height,borderBottom:'1px solid transparent',...this.props.style}} className={this.props.className}></div>
            </div>
        );
    }
});

module.exports = ChinaMap;