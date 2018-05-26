var echarts = require("echarts-eefung");
var colors = require("../utils/colors");
var Color = require("color");
var numberFormatter = require("../utils/number-formatter");
var measureText = require("../../../../public/sources/utils/measure-text");
var Spinner = require("../../../../components/spinner");
var immutable = require("immutable");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { packageTry } from 'LIB_DIR/func';

//布局相关
var LAYOUT = {
    //饼图中心点x坐标
    CENTER_X: 103,
    //饼图中心点y坐标
    CENTER_Y: 115,
    //字体大小
    FONT_SIZE: 20,
    //饼图的边框宽度
    BORDER_WIDTH: 3
};

var PieChart = React.createClass({
    displayName: 'UserOnlineAnalysisPieChart',
    //echart的实例
    echartInstance: null,
    //获取默认参数
    getDefaultProps: function() {
        return {
            list: [],
            resultType: 'loading'
        };
    },
    //组件挂载完毕
    componentDidMount: function() {
        this.renderChart();
    },
    //组件更新完毕
    componentDidUpdate: function(prevProps) {
        if(
            this.props.list.length &&
            prevProps.list.length &&
            immutable.is(this.props.list , prevProps.list)
        ) {
            return;
        }
        this.renderChart();
    },
    //获取tooltip配置
    getTooltip: function() {
        return {
            show: true,
            formatter: function(arr) {
                //修复tooltip不消失的问题
                var title, color;
                if(arr[0] === '详情') {
                    var result = arr[1].split("-");
                    title = (result[0] === 'UNKNOWN' ? '未知' : result[0]) + ' ' + result[1];
                    color = result[2];
                } else {
                    var result = arr[1].split("-");
                    title = result[0];
                    color = result[1];
                }
                return `<div class="analysis_tooltip">
                                <div class="tooltip-title"><em style="background-color:${color}"></em><span>${title}</span></div>
                                <div class="content">
                                    ${arr[2]} 占比${arr[3]}%
                                </div>
                            </div>`;
            }
        };
    },
    getLegend: function() {
        return _.pluck(this.props.list , 'name');
    },
    getTitleOptions: function() {
        var total = numberFormatter.numberAddComma(this.props.total);
        var x = LAYOUT.CENTER_X - Math.floor(measureText.measureTextWidth(total , LAYOUT.FONT_SIZE) / 2);
        var y = LAYOUT.CENTER_Y - LAYOUT.FONT_SIZE / 2;

        return {
            text: total,
            x: x,
            y: y,
            textStyle: {
                color: '#636e72',
                fontSize: LAYOUT.FONT_SIZE,
                fontWeight: 'normal'
            }
        };
    },
    //获取echart配置
    getEchartOptions: function() {
        var option = {
            animation: false,
            title: this.getTitleOptions(),
            tooltip: this.getTooltip(),
            legend: {
                show: false,
                data: this.getLegend()
            },
            toolbox: {
                show: false
            },
            series: this.getSeries()
        };
        return option;
    },
    //获取饼图的配置
    getSeries: function() {
        //默认不显示label和labelLine
        var dataStyle = {
            normal: {
                borderColor: '#e6edef',
                borderWidth: LAYOUT.BORDER_WIDTH,
                label: {show: false},
                labelLine: {show: false}
            },
            emphasis: {
                borderColor: '#e6edef',
                borderWidth: LAYOUT.BORDER_WIDTH,
            }
        };
        var outerColors = colors.pieOuterColors;
        //外层圈、内层圈
        var series = [];
        var idx = 0;
        series.push({
            name: '总计',
            type: 'pie',
            center: [LAYOUT.CENTER_X,LAYOUT.CENTER_Y],
            clockWise: false,
            radius: [84, 90],
            itemStyle: dataStyle,
            data: this.props.list.map(function(obj,idx) {
                var color = outerColors[idx++];
                if(!color) {
                    idx = 0;
                    color = outerColors[idx++];
                }

                return {
                    value: obj.total,
                    name: obj.name + '-' + color,
                    itemStyle: {
                        normal: {
                            color: color
                        }
                    }
                };
            })
        });
        var datas = [];
        var idx = 0;
        var innerColors = colors.pieInnerColors;
        this.props.list.forEach(function(obj) {
            for(var key in obj) {
                if(key !== 'name' && key !== 'total') {

                    var color = innerColors[idx++];
                    if(!color) {
                        idx = 0;
                        color = innerColors[idx++];
                    }
                    datas.push({
                        value: obj[key],
                        name: key + '-' + obj.name + '-' + color,
                        itemStyle: {
                            normal: {
                                color: color
                            }
                        }
                    });
                }
            }
        });
        series.push({
            name: '详情',
            type: 'pie',
            center: [LAYOUT.CENTER_X,LAYOUT.CENTER_Y],
            clockWise: false,
            radius: [72, 80],
            itemStyle: dataStyle,
            data: datas
        });
        return series;
    },
    //渲染图表
    renderChart: function() {
        packageTry(() => {
            this.echartInstance && this.echartInstance.dispose();
        });
        if(this.props.resultType === 'loading') {
            return;
        }
        if(!this.props.list.length) {
            $(this.refs.chart).html(`<div class="nodata">${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
            var options = this.getEchartOptions();
            var dom = this.refs.chart;
            this.echartInstance = echarts.init(dom,macronsTheme);
            this.echartInstance.setOption(options,true);
        }
    },
    //图例鼠标悬浮
    legendMouseEnter: function(system , name , color , event) {
        var $em = $(event.currentTarget).find("em");
        var $span = $(event.currentTarget).find("span");
        var $b = $(event.currentTarget).find("b");

        var em_bg_color = Color($em.css("background-color"));
        var span_color = Color($span.css("color"));
        var b_color = Color($b.css("color"));

        var old_em_bg_color = em_bg_color.hexString();
        var old_span_color = span_color.hexString();
        var old_b_color = b_color.hexString();

        var darken_em_bg_color = em_bg_color.darken(0.3).hexString();
        var darken_span_color = span_color.darken(0.3).hexString();
        var darken_b_color = b_color.darken(0.3).hexString();

        $em.css("background-color" , darken_em_bg_color);
        $span.css("color", darken_span_color);
        $b.css("color", darken_b_color);

        //记录原来的值
        $em.data("background-color" , old_em_bg_color);
        $span.data("color",old_span_color);
        $b.data("color" , old_b_color);

        //高亮series
        var serieses = this.echartInstance && this.echartInstance.getSeries();
        if(serieses) {
            var targetName = (system ? (system + '-') : '') + name + '-' + color;
            for(var i = 0 , len = serieses.length; i < len; i++) {
                var series = serieses[i];
                var datas = series.data;
                for(var j = 0, jLen = datas.length; j < jLen; j++) {
                    var item = datas[j];
                    if(item.name === targetName) {
                        var oldColor = item.itemStyle.normal.color;
                        item.itemStyle.normal.oldColor = oldColor;
                        item.itemStyle.normal.color = Color(oldColor).darken(0.3).hexString();
                    }
                }
            }
            this.echartInstance.setSeries(serieses);
        }
    },
    //图例鼠标离开
    legendMouseLeave: function(system , name , color , event) {
        var $em = $(event.currentTarget).find("em");
        var $span = $(event.currentTarget).find("span");
        var $b = $(event.currentTarget).find("b");

        var em_bg_color = $em.data("background-color");
        var span_color = $span.data("color");
        var b_color = $b.data("color");

        $em.css("background-color" , em_bg_color);
        $span.css("color", span_color);
        $b.css("color", b_color);
        //取消高亮series
        var serieses = this.echartInstance && this.echartInstance.getSeries();
        if(serieses) {
            var targetName = (system ? (system + '-') : '') + name + '-' + color;
            for(var i = 0 , len = serieses.length; i < len; i++) {
                var series = serieses[i];
                var datas = series.data;
                for(var j = 0, jLen = datas.length; j < jLen; j++) {
                    var item = datas[j];
                    if(item.name === targetName) {
                        item.itemStyle.normal.color = item.itemStyle.normal.oldColor;
                        delete item.itemStyle.normal.oldColor;
                    }
                }
            }
            this.echartInstance.setSeries(serieses);
        }
    },
    //渲染排行榜
    renderRankList: function() {
        var outerColors = colors.pieOuterColors;
        var innerColors = colors.pieInnerColors;
        var totalIdx = 0;
        var subIdx = 0;
        var _this = this;
        return (
            <div className="clearfix">
                {this.props.list.map(function(obj) {
                    var totalColor = outerColors[totalIdx++];
                    if(!totalColor) {
                        totalIdx = 0;
                        totalColor = outerColors[totalIdx++];
                    }
                    var list = [];
                    for(var key in obj) {
                        if(key !== 'name' && key !== 'total') {
                            var color = innerColors[subIdx++];
                            if(!color) {
                                subIdx = 0;
                                color = innerColors[subIdx++];
                            }
                            list.push({
                                name: key,
                                total: obj[key],
                                color: color
                            });
                        }
                    }
                    return (
                        <ul className="ranklist" key={obj.name}>
                            <li
                                onMouseEnter={_this.legendMouseEnter.bind(_this , "" , obj.name , totalColor)}
                                onMouseLeave={_this.legendMouseLeave.bind(_this , "" , obj.name , totalColor)}
                            >
                                <em style={{backgroundColor: totalColor}}></em>
                                <span>{obj.name}</span>
                                <b>{obj.total}</b>
                            </li>
                            {
                                list.map(function(subObj) {
                                    return (
                                        <li
                                            key={subObj.name}
                                            onMouseEnter={_this.legendMouseEnter.bind(_this , subObj.name , obj.name , subObj.color)}
                                            onMouseLeave={_this.legendMouseLeave.bind(_this , subObj.name , obj.name , subObj.color)}
                                        >
                                            <em style={{backgroundColor: subObj.color}}></em>
                                            <span>{subObj.name === 'UNKNOWN' ? '未知' : subObj.name}</span>
                                            <b>{subObj.total}</b>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    );
                })}
            </div>
        );
    },
    render: function() {
        return (
            <div className="analysis_pie_chart">
                {
                    this.props.resultType === 'loading' ?
                        (
                            <div className="loadwrap">
                                <Spinner/>
                            </div>
                        ) :
                        (
                            <dl className="dl-horizontal">
                                <dt>
                                    <div className="chart" ref="chart" data-title={this.props.title}></div>
                                </dt>
                                <dd>
                                    {this.renderRankList()}
                                </dd>
                            </dl>
                        )
                }
            </div>
        );
    }
});

module.exports = PieChart;