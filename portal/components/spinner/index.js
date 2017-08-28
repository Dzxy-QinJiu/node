require("./index.scss");
var classNames = require("classnames");
var Spinner = React.createClass({
    //获取默认属性
    getDefaultProps : function() {
        return {
            type : "load8"
        };
    },
    render : function() {

        if(this.props.type === 'load8') {
            var cls = classNames("load8",this.props.className);
            return (
                <div className={cls}>
                    <div className="loader8"></div>
                </div>
            );
        }
        if(this.props.type === 'line-spin') {
            var cls = classNames("line-spin",this.props.className);
            return (
                <div className={cls}>
                    <div className="translatePos">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            );
        }
    }
});

module.exports = Spinner;