/**
 * 数据分析中，按照总客户(用户)、新增客户(用户)、各销售阶段客户(过期用户)、（新增过期用户)，显示一个统计数字
 */
var React = require('react');
require('./index.less');
import Trace from 'LIB_DIR/trace';
var Icon = require('antd').Icon;

class SummaryNumber extends React.Component {
    static defaultProps = {
        desp: Intl.get('oplate_customer_analysis.7', '总客户'),
        num: '',
        active: false,
        resultType: 'loading',
        onClick: function(){}
    };

    renderLoading = () => {
        return (
            <div>
                <p>
                    {this.props.desp}
                </p>
                <Icon type="loading"/>
            </div>
        );
    };

    renderContent = () => {
        var number = '';
        if(this.props.num === 0 || this.props.num) {
            number = this.props.num + '';
        } else if(this.props.resultType === 'error') {
            number = '';
        }
        var fontSizeClass = 'number';
        if(number.length >= 8) {
            fontSizeClass += ' f' + number.length;
        }
        return (
            <div>
                <p>
                    {this.props.desp}
                </p>
                <div className={fontSizeClass}>
                    {number}
                </div>
            </div>
        );

    };

    render() {
        var activeClass = 'summary-number';
        if(this.props.active) {
            activeClass += ' active';
        }
        return (
            <div className={activeClass} onClick={e => {Trace.traceEvent(e,'点击查询' + this.props.desp + '统计'); return this.props.onClick();}}>
                {
                    this.props.resultType === 'loading' ?
                        this.renderLoading() :
                        this.renderContent()
                }
            </div>
        );
    }
}

module.exports = SummaryNumber;
