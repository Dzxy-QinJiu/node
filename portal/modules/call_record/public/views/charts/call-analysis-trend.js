var echarts = require("echarts-eefung");
var immutable = require("immutable");
//macrons主题
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { packageTry } from 'LIB_DIR/func';
var TimeSeriesLinechart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            dataList : [],
            getToolTip : function() {}
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
            this.props.width === prevProps.width && this.props.lineType === prevProps.lineType && this.props.height === prevProps.height
        ) {
            return;
        }
        this.renderChart();
    },
    componentWillUnmount : function() {
        $(window).off('resize', this.windowResize);
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.clear();
            });
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
            packageTry(() => {
                _this.echartInstance.clear();
            });
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
    },
    getCategorys: function () {
        var data = [];
        if (this.props.isMutileLine) {
            var dataType = this.props.lineType;
            var dataList = this.props.dataList[0];
            _.each(dataList[dataType], (item) => {
                data.push(new Date(item.timestamp));
            });
        } else {
            this.props.dataList.forEach((item) => {
                data.push(new Date(item.timestamp));
            });
        }
        return data;
    },
    getLegendData: function () {
        var data = [];
        if (this.props.isMutileLine) {
            var dataList = this.props.dataList;
            data = _.pluck(dataList,"teamName");
        }
        return data;
    },
    getDataSerise: function () {
       //共同的属性
        var commonObj = {
            data: [],
            type: 'line',
            symbolSize: 6
        };
        if (this.props.isMutileLine) {
            var lineType = this.props.lineType;
            var dataList = this.props.dataList;
            var serise = [];
            _.each(dataList, (dataItem) => {
                var seriseItem = $.extend(true, {},{name: dataItem.teamName}, commonObj);
                _.each(dataItem[lineType], (item) => {
                    seriseItem.data.push(item.count);
                });
                serise.push(seriseItem);
            });
            return serise;
        } else {
            var serise = [$.extend(true, {},{itemStyle: {
                normal: {
                    color: '#4d96d1'
                }
            }},commonObj)];
            this.props.dataList.forEach((item) => {
                serise[0].data.push(item.count);
            });
        }
        return serise;
    },
    getEchartOptions: function () {
        return {
            title : null,
            toolbox: {
                show : false
            },
            calculable : false,
            tooltip : { // 图表中的提示数据信息
                trigger: 'axis',
                formatter : (params) =>{
                    var timeText, count, teamArr;
                    if(_.isArray(params)){
                        if (params.length == 1) {
                            var params = params[0];
                            timeText = moment(params.name || Date.now()).format(oplateConsts.DATE_FORMAT);
                            count = params.data;

                        } else if (params.length > 1) {
                            timeText = [], count = [], teamArr = [];
                            _.each(params, (paramsItem) => {
                                timeText.push(moment(paramsItem.name || Date.now()).format(oplateConsts.DATE_FORMAT));
                                count.push(paramsItem.data || 0);
                                teamArr.push(paramsItem.seriesName);
                            });
                        }
                        return this.props.getToolTip(timeText, count, teamArr);
                    }
                }
            },
            legend : {
                data: this.getLegendData()
            },
            grid: {
                x : 50,
                y : 40,
                x2 : 30,
                y2 : 30,
                borderWidth : 0
            },
            xAxis : [
                {
                    type: 'category',
                    splitLine: false,
                    splitArea: false,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#d1d1d1'
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
                    },
                    data: this.getCategorys(),
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
            series: this.getDataSerise()
        };
    },
    render : function() {
        return (
            <div className="echart_wrap" ref="chart" style={{width:this.props.width, height:this.props.height}}></div>
        );
    }
});

module.exports = TimeSeriesLinechart;