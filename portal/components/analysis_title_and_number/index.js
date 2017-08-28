require("./index.scss");
var TitleAndNum = React.createClass({
    getDefaultProps : function() {
        return {
            left_title : "新增用户",
            right_title : "新增用户量",
            number : "1132",
            hideRightPart : false
        };
    },
    render : function() {

        var rightPart = this.props.right_title ? (
            <span className="pull-right">
                {this.props.right_title}
                <em>{this.props.number}</em>
            </span>
        ) : null;

        return (
            <div className="analysis_title_and_num clearfix">
                <span className="pull-left">{this.props.left_title}</span>
                {this.props.hideRightPart ? null : rightPart}
            </div>
        );
    }
});

module.exports = TitleAndNum;