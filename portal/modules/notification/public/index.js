var language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/main-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./css/main-zh_CN.less');
}
//顶部导航
var SystemNotification = require('./views/system');

var Notification = React.createClass({
    componentDidMount: function() {
        $('body').css('overflow', 'hidden');
    },
    componentWillUnmount: function() {
        $('body').css('overflow', 'hidden');
    },
    render: function() {
        return (
            <div className="notification_wrap">
                <div className="shade"></div>
                <div className="notification_content" id="system-notice">
                    <SystemNotification/>
                </div>
            </div>
           
        );
    }
});

module.exports = Notification;