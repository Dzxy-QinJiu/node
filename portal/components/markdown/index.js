var React = require('react');
require('./github-markdown.css');
const ReactMarkdown = require('react-markdown');

class Markdown extends React.Component {
    static defaultProps = {
        title: '',
        source: '',
        onDoubleClick: function(){}
    };

    render() {
        return (
            <div className="markdown-body" title={this.props.title} onDoubleClick={this.props.onDoubleClick}>
                <ReactMarkdown source={this.props.source} />
            </div>
        );
    }
}

module.exports = Markdown;
