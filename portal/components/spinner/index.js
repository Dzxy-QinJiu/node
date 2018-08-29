var React = require('react');
require('./index.less');
var classNames = require('classnames');

class Spinner extends React.Component {
    //获取默认属性
    static defaultProps = {
        type: 'load8'
    };

    render() {

        if(this.props.type === 'load8') {
            var cls = classNames('load8',this.props.className);
            return (
                <div className={cls}>
                    <div className="loader8"></div>
                </div>
            );
        }
        if(this.props.type === 'line-spin') {
            var cls = classNames('line-spin',this.props.className);
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
}

module.exports = Spinner;
