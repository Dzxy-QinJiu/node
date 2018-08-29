/**
 * 文本块
 */

var React = require('react');
let Box = React.createClass({
    getDefaultProps: function() {
        return {
            renderContent: function(value) {
                return value;
            }
        };
    },
    render: function() {
        return (
            <div className="chart-box">
                {this.props.renderContent(this.props.chartData.value,this.props.app_id)}
            </div>
        );
    }
});

module.exports = Box;

