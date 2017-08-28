var Alert = require("antd").Alert;
var SystemNotification = React.createClass({
    renderMessageNodata : function() {
        var message = (
            <span>
                <ReactIntl.FormattedMessage id="notification.has.no.system.data" defaultMessage="暂无系统消息数据" />
            </span>
        );
        return (<Alert
            message={message}
            type="info"
            showIcon={true}
        />);
    },
    render : function() {
        return (
            <div className="notification_system">
                {
                    this.renderMessageNodata()
                }
            </div>
        );
    }
});

module.exports = SystemNotification;