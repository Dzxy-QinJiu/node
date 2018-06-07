/**
 * 标签云
 * author:许宁
 */
const cloud = require('wordcloud');
const Spinner = require('CMP_DIR/spinner');
const immutable = require('immutable');
const CONSTS = {
    FONT_COLOR: '#2b4352',//字体颜色
    FONT_FAMILY: 'SimHei'
};
let options = {
    minSize: 8,
    gridSize: 12,
    weightFactor: function(size) {
        return Math.ceil(size / 2) + 15;
    },
    fontFamily: CONSTS.FONT_FAMILY,
    color: function(text, level) {
        return CONSTS.FONT_COLOR;
    },
    rotateRatio: 0,
    rotationSteps: 0
};
class CloudChart extends React.Component {
    //根据配置渲染标签云dom
    renderChart(props) {
        const $dom = $(ReactDOM.findDOMNode(this.chart));
        const config = $.extend({}, options, { list: props.data });
        cloud($dom[0], config);
    }
    componentDidMount() {
        if (this.props.resultType != 'loading') {
            this.renderChart(this.props);
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.resultType != 'loading') {
            this.renderChart(prevProps);
        }
        if (
            this.props.data &&
            prevProps.data &&
            immutable.is(this.props.data, prevProps.data) &&
            this.props.resultType === prevProps.resultType &&
            this.props.width === prevProps.width
        ) {
            return;
        }
    }
    render() {        
        return (
            <div className="analysis_pie_chart">
                {this.props.resultType === 'loading' ?
                    (
                        <div className="loadwrap" style={{ height: this.props.height }}>
                            <Spinner />
                        </div>
                    ) :
                    (
                        <div>
                            <div ref={chart => this.chart = chart} style={{ width: this.props.width, height: this.props.height }} className="chart" data-title={this.props.title}></div>
                        </div>
                    )
                }
            </div>
        );
    }
}
CloudChart.defaultProps = {
    data: [],
    title: '',
    width: '100%',
    height: 214,
    resultType: 'loading',
};
module.exports = CloudChart;