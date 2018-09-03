var React = require('react');
var classNames = require('classnames');
var Icon = require('antd').Icon;
var Button = require('antd').Button;
require('./index.less');

class FilterBtn extends React.Component {
    static defaultProps = {
        expanded: false,
        className: '',
        onClick: function() {}
    };

    render() {
        var cls = classNames(this.props.className , 'global_filter_btn');
        var expanded = this.props.expanded;
        return (
            <Button type="ghost" className={cls} onClick={this.props.onClick}>
                <ReactIntl.FormattedMessage id="common.filter" defaultMessage="筛选" />
                {expanded ? <Icon type="up"/> : <Icon type="down"/>}
            </Button>
        );
    }
}

module.exports = FilterBtn;
