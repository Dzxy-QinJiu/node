require("./index.less");
var echarts = require("echarts-eefung");
require("echarts-eefung/map/js/china");
var MapChart = require("./mapchart");
import { MAP_PROVINCE } from "LIB_DIR/consts";
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { Button } from 'antd';
var immutable = require("immutable");
var ChinaMap = React.createClass({
    getInitialState() {
        return {
            showReturnBtn: false
        };
    },
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
    renderMap() {
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
            if (this.props.getClickEvent) {
                this.echartInstance.on("click", params => {
                    this.props.getClickEvent(params.name);
                    this.setState({
                        showReturnBtn: true
                    });
                    let transName = this.provinceName(params.name);
                    if (transName) {
                        const provinceName = require("echarts-eefung/map/json/province/" + transName);
                        echarts.registerMap(params.name, provinceName);
                        options.series[0].mapType = params.name;
                        this.echartInstance.setOption(options);
                    }

                });
            }
        }
    },
    componentDidMount : function() {
        this.renderMap();
    },
    componentWillUnmount() {
        if(this.echartInstance) {
            this.echartInstance.dispose();
        }
    },
    componentDidUpdate(prevProps) {
        if(
            this.props.dataList &&
            prevProps.dataList &&
            immutable.is(this.props.dataList , prevProps.dataList) &&
            this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderMap();
    },
    getDefaultProps() {
        return {
            width : 500,
            height : 500,
            className : "china-map-wrapper",
            style : {},
            dataList : [],
            formatter : function(){}
        };
    },
    returnChinaMap() {
        // 点击返回按钮时，返回“”,判断是点击的省份还是返回上一级，显示全国
        this.props.getClickEvent("");
        this.setState({
            showReturnBtn: false
        });
        this.renderMap();
    },
    render() {
        return (
            <div>
                {this.state.showReturnBtn ? (<Button type="primary" onClick={this.returnChinaMap}>返回上一级</Button>) : null}
                <div ref="chartWrap" style={{width:this.props.width,height:this.props.height,borderBottom:'1px solid transparent',...this.props.style}} className={this.props.className}></div>
            </div>
        );
    }
});

module.exports = ChinaMap;