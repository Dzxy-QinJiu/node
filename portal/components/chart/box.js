/**
 * 文本块
 */

var React = require('react');

class Box extends React.Component {
    static defaultProps = {
        renderContent: function(value) {
            return value;
        }
    };

    render() {
        return (
            <div className="chart-box">
                {this.props.renderContent(this.props.chartData.value,this.props.app_id)}
            </div>
        );
    }
}

module.exports = Box;

