/**
 * 个人操作日志
 */
require('../css/user-log.less');

class UserLog extends React.Component {
    render() {
        let logTime = this.props.log.logTime;
        logTime = (logTime && logTime != 'null') ? moment(parseInt(logTime)).format(oplateConsts.DATE_TIME_FORMAT) : '';
        return (
            <div className="log-item">
                <label className="log-username">{this.props.log.userName}</label>
                <label className="log-info">{this.props.log.logInfo}</label>
                <label className="log-time">{logTime}</label>
            </div>
        );
    }
}

export default UserLog;