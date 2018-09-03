var React = require('react');
var Alert = require('antd').Alert;

class AlertTimer extends React.Component {
    static defaultProps = {
        //默认两秒后消失
        time: 2000,
        onHide: function() {}
    };

    state = {
        show: true
    };

    isUnmount = false;

    componentWillUnmount() {
        this.isUnmount = true;
        clearTimeout(this.timer);
    }

    componentDidMount() {
        var _this = this;
        this.timer = setTimeout(function() {
            if(!_this.isUnmount) {
                _this.setState({
                    show: false
                });
            }
            _this.props.onHide();
        }, this.props.time);
    }

    render() {
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
}

module.exports = AlertTimer;
