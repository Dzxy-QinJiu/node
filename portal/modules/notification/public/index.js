var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./css/main-es_VE.scss");
} else if (language.lan() == "zh") {
    require("./css/main-zh_CN.scss");
}
//顶部导航
var TopNav = require("../../../components/top-nav");

var url = require("url");

var Notification = React.createClass({
    componentDidMount: function () {
        $("body").css("overflow", "hidden");
    },
    componentWillUnmount: function () {
        $("body").css("overflow", "auto");
    },
    render: function () {
        var pathname = url.parse(window.location.href).pathname;
        var View;
        switch (pathname) {
            case '/notification/customer':
                var CustomerNotification = require("./views/customer");
                View = (<CustomerNotification/>);
                break;
            case '/notification/system':
                var SystemNotification = require("./views/system");
                View = (<SystemNotification/>);
                break;
        }

        return (
            <div className="notification_wrap">
                <TopNav>
                    <TopNav.MenuList />
                </TopNav>
                <div className="notification_content">
                    {View}
                </div>
            </div>
        );
    }
});

module.exports = Notification;