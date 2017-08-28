function BarChart(opts) {
    this.dataList = opts.dataList;
    if(!_.isArray(this.dataList)) {
        this.dataList = [];
    }
    this.dataList = this.dataList.concat();
    this.sort();
    this.total = this.countTotal();
    this.formatter = opts.formatter;
    this.animation = opts.animation;
    this.noData = opts.noData;
    this.judgeCreateData();
}

//如果noData是true的话，产生假数据
BarChart.prototype.judgeCreateData = function() {
    if(!this.noData) {
        return;
    }
    this.dataList = _.range(9).map(function(i) {
        return {
            name : '-',
            value : 2,
            idx : i + 1
        };
    });
    this.total = 0;
};

BarChart.prototype.colors = ["#f4bb4a", "#88af1e", "#c1e7ce", "#9230e5", "#f8d289", "#b6d9f7", "#0ebfe9", "#db0908", "#f88916", "#4dafde", "#f05050"];

//排序，为了保证echart效果，必须变成升序
BarChart.prototype.sort = function() {
    this.dataList.sort(function(obj1 , obj2) {
        return obj1.value - obj2.value;
    });
};

//计算总数
BarChart.prototype.countTotal = function() {
    var total = 0;
    _.each(this.dataList , function(obj) {
        total += obj.value;
    });
    if(isNaN(total)) {
        total = 0;
    }
    return total;
};

//获取tooltip选项
BarChart.prototype.getTooltipOptions = function() {
    var originFormatter = this.formatter;
    var _this = this;
    return {
        trigger: 'item',
        backgroundColor : '#0b80e0',
        textStyle : {
            color: '#fff'
        },
        formatter : function(obj) {
            var newObj = $.extend(true,{},obj);
            newObj.total = _this.total;
            var html = originFormatter(newObj);
            return html;
        }
    };
};
//获取每个数据的值
BarChart.prototype.getSeries = function() {
    var colors = this.colors;
    var noData = this.noData;
    return _.map(this.dataList , function(obj , i) {
        var color = noData ? '#f9f9f9' : colors[i % colors.length];
        return {
            value : obj.value,
            itemStyle : {
                normal : {
                    color : color
                },
                emphasis : {
                    color : color
                }
            }
        };
    });
};
//获取每个数据的名字
BarChart.prototype.getCategorys = function() {
    return _.map(this.dataList , function(obj) {
        return obj.name;
    });
};
//获取echart的地图配置
BarChart.prototype.getEchartOptions = function() {
    var _this = this;
    var option = {
        animation : _this.animation,
        tooltip : _this.noData ? null : _this.getTooltipOptions(),
        xAxis : [
            {
                type : 'value',
                splitLine:{
                    show:false
                },
                axisLine : {
                    show:false
                },
                axisTick : {
                    show:false
                },
                axisLabel : {
                    show:false
                }
            }
        ],
        grid : {
            borderWidth:0,
            y : 76,
            x : 120,
            width : '90%'
        },
        yAxis : [
            {
                type : 'category',
                data : _this.getCategorys(),
                boundaryGap : false,
                splitLine:{
                    show:false
                },
                axisLine : {
                    lineStyle : {
                        width : 1,
                        color:'#b5c2ca'
                    }
                },
                axisLabel : {
                    textStyle : {
                        color:'#82929f'
                    }
                },
                axisTick : {
                    show:false
                }
            }
        ],
        series : [
            {
                name:'柱状图',
                type:'bar',
                barWidth:25,
                itemStyle : {
                    normal : {
                        label : {
                            show : true,
                            textStyle : {
                                color: '#81939f'
                            },
                            formatter : function(obj) {
                                if(_this.noData) {
                                    return '';
                                }
                                return [
                                    obj.value,
                                    (obj.value * 100/ _this.total).toFixed(1) + '%'
                                ].join('   ')
                            }
                        }
                    },
                    emphasis : {
                        label : {
                            textStyle : {
                                color: '#81939f'
                            }
                        }
                    }
                },
                data:_this.getSeries()
            }
        ]

    };
    return option;
};

module.exports = BarChart;