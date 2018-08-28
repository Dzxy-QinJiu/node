/**
 * 为包裹的JSX(props.children)维护加载状态和错误信息
 * @param loading[boolean]
 * @param errorMsg[string]
 * @param size['small'|'medium'|'large'] spin的尺寸，默认large
 */
import { Spin, Alert } from 'antd';
require('./index.less');
var classNames = require('classnames');
const StatusWrapper = ({ loading, errorMsg, children, size, className}) => {
    var statusClass = classNames('status-wrapper clearfix',className);
    if (errorMsg) {
        const error = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
        return (<div className={statusClass}>
            <div className="alert-container">
                <Alert message={error} type="error" showIcon />
            </div>
        </div>);
    } else {
        return (
            <div className={statusClass}>
                <div className={!loading ? 'hide' : 'spiner-container'}>
                    <div className="spin-wrapper">
                        <Spin size={size || 'large'} />
                    </div>
                </div>
                <div className={loading ? 'transparent' : ''}>
                    {children}
                </div>
            </div>
        );
    }
};

export default StatusWrapper;