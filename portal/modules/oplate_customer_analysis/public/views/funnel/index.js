/**
 * 漏斗图
 */
var echarts = require('echarts-eefung');
require('./index.less');
var colors = require('../../utils/colors');
var Spinner = require('../../../../../components/spinner');
var immutable = require('immutable');
import macronsTheme from 'CMP_DIR/echarts-theme/macrons';
import { packageTry } from 'LIB_DIR/func';

var FunnelChart = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            list: [],
            title: '',
            width: '100%',
            height: 600,
            resultType: 'loading',
        };
    },
    getSeries: function() {
        const series1 = {
            type: 'funnel',
            x: 10,
            y: 10,
            data: this.props.list,
            sort: this.props.sort || 'descending',
            max: this.props.max || 100,
            minSize: this.props.minSize || '0%',
            itemStyle: {
                normal: {
                    label: {
                        textStyle: {
                            color: '#506470'
                        }
                    },
                    labelLine: {
                        show: false
                    }
                },
                emphasis: {
                }
            },
        };

        let series2 = JSON.parse(JSON.stringify(series1));

        series2.itemStyle.normal.label = {
            formatter: function(params) { return params.data.total; },
            position: 'inside',
            textStyle: {
                color: '#506470'
            }
        };

        series2.itemStyle.emphasis.label = {
            formatter: function(params) { return params.data.total; }
        };

        return [series1, series2];
    },
    getEchartOptions: function() {
        var option = {
            title: {
                text: this.props.title,
                x: 'center',
                y: 'bottom',
                textStyle: {
                    fontSize: 14,
                    fontWeight: 'normal'
                }
            },
            animation: false,
            toolbox: {
                show: false
            },
            calculable: false,
            series: this.getSeries(),
            color: colors,
        };
        return option;
    },
    renderChart: function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.clear();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
                this.echartInstance = null;
            }
            $(this.refs.chart).html('<div class=\'nodata\'>' + Intl.get('common.no.data', '暂无数据') + '</div>');
        } else {
            $(this.refs.chart).find('.nodata').remove();
        }
    },
    componentDidMount: function() {
        this.renderChart();
    },
    componentDidUpdate: function(prevProps) {
        if(
            this.props.list.length &&
            prevProps.list.length &&
            immutable.is(this.props.list , prevProps.list) &&
            this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderChart();
    },
    componentWillUnmount: function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    render: function() {
        var _this = this;
        return (
            <div className="analysis_funnel_chart" ref="wrap" style={{width: this.props.width, float: 'left'}}>
                {this.props.resultType === 'loading' ?
                    (
                        <div className="loadwrap" style={{height: this.props.height}}>
                            <Spinner/>
                        </div>
                    ) :
                    (
                        <div ref="chart" style={{width: this.props.width,height: this.props.height}} className="chart" data-title={this.props.title}></div>
                    )
                }
            </div>
        );
    }
});

module.exports = FunnelChart;
