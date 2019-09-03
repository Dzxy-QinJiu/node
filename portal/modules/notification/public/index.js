
const language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/main-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./css/main-zh_CN.less');
}
//顶部导航
const SystemNotification = require('./views/system');

class Notification extends React.Component {
    componentDidMount() {
        $('body').css('overflow', 'hidden');
    }

    componentWillUnmount() {
        $('body').css('overflow', 'hidden');
    }

    render() {
        return (
            <div className="notification_wrap">
                <div className="shade" onClick={this.props.closeNotificationPanel}></div>
                <div className="notification_content" id="system-notice">
                    <SystemNotification/>
                </div>
            </div>
           
        );
    }
}

Notification.propTypes = {
    closeNotificationPanel: PropTypes.func,
};

module.exports = Notification;
