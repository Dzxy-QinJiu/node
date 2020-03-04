/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/11/09.
 */
//倒计时组件

const CONST_TIME = 1000;
class CountDown extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            seconds: this.props.seconds
        };
    }
    timer = null;
    componentDidMount() {
        this.tick();
    }
    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
        this.timer = null;
    }

    //重置计时
    resetTime = (seconds) => {
        this.timer && clearInterval(this.timer);
        this.timer = null;
        this.setState({seconds: seconds || this.props.seconds}, () => {
            this.tick();
        });
    };

    //暂停计时 todo 以防将来使用
    pause = () => {
        clearInterval(this.timer);
    };

    //开始计时
    tick = () => {
        this.timer = setInterval(() => {
            let seconds = this.state.seconds;
            seconds -= 1;
            if(seconds >= 0) {
                this.setState({seconds});
            }else {
                clearInterval(this.timer);
                this.props.onComplete && this.props.onComplete();
            }
        }, CONST_TIME);
    };

    render() {
        let content = `${this.props.msg}${this.state.seconds}s`;
        if(_.isFunction(this.props.renderContent)) {
            content = this.props.renderContent(this.state.seconds);
        }
        return (
            <div className="countdown-wrapper">
                {content}
            </div>
        );
    }
}
CountDown.defaultProps = {
    msg: Intl.get('payment.countdown.default.msg', '倒计时中...'),
    seconds: 60,
    onComplete: function() {}
};
CountDown.propTypes = {
    msg: PropTypes.string,
    seconds: PropTypes.number,
    onComplete: PropTypes.func,
    renderContent: PropTypes.func,
};

module.exports = CountDown;