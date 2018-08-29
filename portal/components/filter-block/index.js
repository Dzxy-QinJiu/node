
var React = require('react');
require('./style.less');

class FilterBlock extends React.Component {
    render() {
        return (
            <div className="filter-block clearfix">{this.props.children}</div>
        );
    }
}

module.exports = FilterBlock;

