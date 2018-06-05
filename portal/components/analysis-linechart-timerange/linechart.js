
var DateSelectorUtils = require('../date-selector/utils');
function LineChart(opts) {
    this.dataList = opts.dataList;
    if(!_.isArray(this.dataList)) {
        this.dataList = [];
    }
    this.formatter = opts.formatter;
    this.animation = opts.animation;
    this.noData = opts.noData;
    this.height = opts.height;
    this.width = opts.width;
    this.unit = opts.unit;
    this.judgeCreateData();
}

//没有数据的时候造点假数据
LineChart.prototype.judgeCreateData = function() {
    if(!this.noData) {
        return;
    }
    this.dataList = _.range(9).map(function(i) {
        return {
            timerange: {starttime: '',endtime: ''},
            value: 0
        };
    });
};

//获取横轴坐标
LineChart.prototype.getCategorys = function() {
    var timeRanges = _.pluck(this.dataList , 'timerange');
    var categorys = DateSelectorUtils.getNaturalDate(timeRanges , this.unit);
    return categorys;
};

//获取y轴数据
LineChart.prototype.getSeries = function() {
    return this.dataList.map(function(obj) {
        return obj.value;
    });
};

//获取echart配置
LineChart.prototype.getEchartOptions = function() {
    var _this = this;
    var label_interval = Math.ceil(this.dataList.length / 10);
    if(!label_interval) {
        label_interval = 1;
    }
    var label_count = 0;
    var idx = 0;
    return {
        animation: _this.animation,
        tooltip: _this.noData ? null : {
            transitionDuration: 0,
            enterable: true,
            trigger: 'item',
            backgroundColor: '#0b80e0',
            textStyle: {
                color: '#fff'
            },
            formatter: function(obj) {
                var idx = obj.dataIndex;
                var tooltipDate = DateSelectorUtils.getEchartTooltipDate(_this.dataList , idx , _this.unit);
                var newObj = {
                    name: tooltipDate,
                    value: obj.value
                };
                var html = _this.formatter(newObj);
                return html;
            }
        },
        grid: {
            x: 20,
            x2: 20,
            y: 20,
            y2: Math.floor(0.4 * _this.height)
        },
        xAxis: [
            {
                type: 'category',
                splitLine: {
                    lineStyle: {
                        color: '#f2f2f2'
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#80959d'
                    },
                    interval: function(id,label) {
                        idx++;
                        if(label.indexOf('\n') >= 0) {
                            label_count++;
                            return true;
                        }
                        var start = label_count * label_interval;
                        if(idx >= start) {
                            label_count++;
                            return true;
                        }
                        return false;
                    }
                },
                data: _this.getCategorys()
            }
        ],
        yAxis: [
            {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: '#f2f2f2'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 1,
                        color: '#f2f2f2'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#81939e'
                    }
                }
            }
        ],
        series: [
            {
                name: 'line',
                type: 'line',
                showAllSymbol: true,
                symbolSize: _this.noData ? 0 : 6,
                symbol: 'emptyCircle',
                smooth: true,
                itemStyle: {
                    normal: {
                        color: '#4dafde'
                    },
                    emphasis: {
                        color: '#4dafde'
                    }
                },
                data: _this.getSeries()
            }
        ]
    };
};



module.exports = LineChart;