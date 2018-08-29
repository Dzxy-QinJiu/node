var React = require('react');
require('./index.less');

class AnalysisRealmCount extends React.Component {
    static defaultProps = {
        title: '当前安全域开通总数',
        total: 0
    };

    render() {
        return (
            <p className="analysis-realm-count">
                <span>{this.props.title}</span>
                <em className="pull-right" data-total={this.props.total}></em>
            </p>
        );
    }
}

module.exports = AnalysisRealmCount;
