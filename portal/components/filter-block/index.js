
require("./style.less");

var FilterBlock = React.createClass({
    render: function () {
        return (
            <div className="filter-block clearfix">{this.props.children}</div>
        );
    }
});

module.exports = FilterBlock;
