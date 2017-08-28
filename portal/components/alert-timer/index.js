var Alert = require("antd").Alert;
var AlertTimer = React.createClass({
    isUnmount : false,
    getDefaultProps: function () {
        return {
            //默认两秒后消失
            time: 2000,
            onHide : function() {}
        };
    },
    componentWillUnmount : function() {
        this.isUnmount = true;
        clearTimeout(this.timer);
    },
    getInitialState: function () {
        return {
            show: true
        };
    },
    componentDidMount: function () {
        var _this = this;
        this.timer = setTimeout(function () {
            if(!_this.isUnmount) {
                _this.setState({
                    show: false
                });
            }
            _this.props.onHide();
        }, this.props.time);
    },
    render: function () {
        return (
            <div className="alert-timer">
                {
                    this.state.show ?
                        (
                            <Alert {...this.props}/>
                        ) : null
                }
            </div>
        );
    }
});

module.exports = AlertTimer;