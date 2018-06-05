var history = require('../../public/sources/history');

function getPathname() {
    return window.location.pathname.replace(/^\//, '');
}

var RightContent = React.createClass({
    checkRoute: function() {
        var locationPath = getPathname();
        if (this.props.route && locationPath === this.props.route.path) {
            var routes = this.props.route.routesExports;
            if (routes && routes[0] && routes[0].path) {
                history.replace('/' + locationPath + '/' + routes[0].path);
                return true;
            }
        }
        return false;
    },
    render: function() {
        var jump = this.checkRoute();
        if (jump) {
            return null;
        }

        return (
            <div className="rightContent">
                <div className="main">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

module.exports = RightContent;
