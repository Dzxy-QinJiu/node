require("./css/btn.less");
// 折叠左侧栏按钮组件
var BtnCollapse = React.createClass({
    getInitialState: function() {
        return {tips: "展开"};
    },
    handleClick: function(event) {
        this.setState({tips: this.state.tips == "展开" ? "折叠" : "展开"});
        $("#app .row").toggleClass("extend");
    },
    render: function () {
        return (
            <a onClick={this.handleClick}  className="toggle-nav-collapse" title={this.state.tips}><i className="iconfont">&#xe600;</i></a>
        );
    }
});

module.exports = BtnCollapse;
