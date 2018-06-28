import { mapColorList } from 'LIB_DIR/func';

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
            $tooltipDom = $(_this.domWrap).find('.echarts-tooltip');
        }
    }

    return {
        trigger: 'item',
        backgroundColor: '#0b80e0',
        textStyle: {
            color: '#fff'
        },
        formatter: function(obj) {
            getTooltipDom();
            if(obj.name === '南海诸岛') {
                $tooltipDom.addClass('notshow');
            } else {
                $tooltipDom.removeClass('notshow');
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
    return mapColorList(this.dataList);
};

//获取echart的地图配置
MapChart.prototype.getEchartOptions = function() {
    var option = {
        //todo 待修改
        tooltip: this.getTooltipOptions(),
        // dataRange: {
        //     x: 'left',
        //     y: 'bottom',
        //     orient: 'horizontal',
        //     itemGap: 1,
        //     itemWidth: 22,
        //     itemHeight: 19,
        //     splitList: this.getSplitList(),
        //     color: oplateConsts.MAP_COLOR,
        //     text: ['多','少'],
        //     textStyle: {
        //         color: '#80949d'
        //     }
        // },
        series: [
            {
                name: '中国',
                type: 'map',
                mapType: 'china',
                roam: false,
                mapLocation: {
                    top: 0
                },
                itemStyle: {
                    normal: {label: {show: true}},
                    emphasis: {label: {show: true}}
                },
                data: this.getSeries()
            }
        ]
    };


    return option;
};

module.exports = MapChart;