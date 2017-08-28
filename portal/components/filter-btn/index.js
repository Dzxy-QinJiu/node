var classNames = require("classnames");
var Icon = require("antd").Icon;
var Button = require("antd").Button;
require("./index.scss");
var FilterBtn = React.createClass({
    getDefaultProps : function() {
        return {
            expanded : false,
            className : "",
            onClick : function () {}
        };
    },
    render : function() {
        var cls = classNames(this.props.className , "global_filter_btn");
        var expanded = this.props.expanded;
        return (
            <Button type="ghost" className={cls} onClick={this.props.onClick}>
                <ReactIntl.FormattedMessage id="common.filter" defaultMessage="筛选" />
                {expanded ? <Icon type="up"/>:<Icon type="down"/>}
            </Button>
        );
    }
});
module.exports = FilterBtn;