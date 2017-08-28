/**
 * Created by wangliping on 2016/1/12.
 */
var LogItem = React.createClass({
    render: function () {
        var logTime = this.props.log.logTime;
        logTime = (logTime && logTime != "null") ? moment(parseInt(logTime)).format(oplateConsts.DATE_TIME_FORMAT) : "";
        return (
            <div className="log-item">
                <label className="log-username">{this.props.log.userName}</label>
                <label className="log-info">{this.props.log.logInfo}</label>
                <label
                    className="log-time">{logTime}</label>
            </div>
        );
    }
});
module.exports = LogItem;