require('./index.less');
var AnalysisRealmCount = React.createClass({
    getDefaultProps: function() {
        return {
            title: '当前安全域开通总数',
            total: 0
        };
    },
    render: function() {
        return (
            <p className="analysis-realm-count">
                <span>{this.props.title}</span>
                <em className="pull-right" data-total={this.props.total}></em>
            </p>
        );
    }
});

module.exports = AnalysisRealmCount;