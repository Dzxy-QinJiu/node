
function MapChart(opts) {
    this.domWrap = opts.domWrap;
    this.dataList = opts.dataList;
    if(!_.isArray(this.dataList)) {
        this.dataList = [];
    }
    this.total = this.countTotal();
    this.formatter = opts.formatter;
}

//计算总数
MapChart.prototype.countTotal = function() {
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
MapChart.prototype.getTooltipOptions = function() {
    var originFormatter = this.formatter;
    var _this = this;
    var $tooltipDom = null;

    function getTooltipDom() {
        if(!$tooltipDom || !$tooltipDom[0]) {
            $tooltipDom = $(_this.domWrap).find(".echarts-tooltip");
        }
    }

    return {
        trigger: 'item',
        backgroundColor : '#0b80e0',
        textStyle : {
            color: '#fff'
        },
        formatter : function(obj) {
            getTooltipDom();
            if(obj.name === '南海诸岛') {
                $tooltipDom.addClass("notshow");
            } else {
                $tooltipDom.removeClass("notshow");
            }
            var newObj = $.extend(true,{},obj);
            newObj.total = _this.total;
            var html = originFormatter(newObj);
            return html;
        }
    };
};

//获取图表数据，隐藏南海诸岛
MapChart.prototype.getSeries = function() {
    var arr = this.dataList.concat();
    arr.push({
        name: '南海诸岛',
        itemStyle: {
            normal: {
                color: 'rgba(0,0,0,0)',
                label: {
                    show: false
                }
            },
            emphasis: {
                color: 'rgba(0,0,0,0)',
                label: {
                    show: false
                }
            }
        }
    });
    return arr;
};

//获取echart的splitList
MapChart.prototype.getSplitList = function() {

    var maxVal = _.max(this.dataList , function(obj) {
        return obj.value;
    });

    if(maxVal) {
        maxVal = maxVal.value;
    } else {
        maxVal = 0;
    }

    var minVal = _.min(this.dataList , function(obj) {
        return obj.value;
    });

    if(minVal) {
        minVal = minVal.value;
    } else {
        minVal = 0;
    }

    var delta = Math.floor((maxVal - minVal) / 5) - 1;

    var ret = [], start = minVal;
    for(var i = 1, total = 5; i <= total ; i++) {
        var obj = {};
        if(i === 1) {
            obj = {
                start : start,
                end : start + delta
            };
            start += delta + 1;
        } else if (i === total){
            obj ={
                start : start,
                end : maxVal
            };
        } else {
            obj ={
                start: start,
                end : start + delta
            };
            start += delta + 1;
        }
        obj.label = '';
        ret.push(obj);
    }

    return ret.reverse();
};

//获取echart的地图配置
MapChart.prototype.getEchartOptions = function() {
    var _this = this;
    var option = {
        tooltip : _this.getTooltipOptions(),
        dataRange: {
            x: 'left',
            y: 'bottom',
            orient : 'horizontal',
            itemGap : 1,
            itemWidth:22,
            itemHeight:19,
            splitList: _this.getSplitList(),
            color: ['#385993', '#8da2c8', '#8fa8ca', '#cad8ed','#cddaef'],
            text : ['多','少'],
            textStyle : {
                color:'#80949d'
            }
        },
        series : [
            {
                name: '中国',
                type: 'map',
                mapType: 'china',
                roam: false,
                mapLocation : {
                    top : 0
                },
                itemStyle:{
                    normal:{label:{show:true}},
                    emphasis:{label:{show:true}}
                },
                data:_this.getSeries()
            }
        ]
    };


    return option;
};

module.exports = MapChart;