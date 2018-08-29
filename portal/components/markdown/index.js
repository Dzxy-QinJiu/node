var React = require('react');
require('./github-markdown.css');
const ReactMarkdown = require('react-markdown');

const Markdown = React.createClass({
    getDefaultProps: function() {
        return {
            title: '',
            source: '',
            onDoubleClick: function(){}
        };
    },
    render: function() {
        return (
            <div className="markdown-body" title={this.props.title} onDoubleClick={this.props.onDoubleClick}>
                <ReactMarkdown source={this.props.source} />
            </div>
        );
    }
});

module.exports = Markdown;
