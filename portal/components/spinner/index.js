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
                    <div className="loader8-content">
                        {this.props.content ? (
                            <div className="loader8-inner">
                                {this.props.content}
                            </div>
                        ) : null}
                        <div className="loader8"></div>
                        {this.props.loadingText ? (<div className="loader8-text">{this.props.loadingText}</div>) : null}
                    </div>
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
