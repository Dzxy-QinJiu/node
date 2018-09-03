var React = require('react');
var history = require('../../public/sources/history');

import {renderRoutes} from 'react-router-config';

class RightContent extends React.Component {
    checkRoute = () => {
        var locationPath = location.pathname;
        if (this.props.route && locationPath === this.props.route.path) {
            var routes = this.props.route.routesExports;
            if (routes && routes[0] && routes[0].path) {
                history.replace(routes[0].path);
                return true;
            }
        }
        return false;
    };

    render() {
        if (this.props.route) {
            var jump = this.checkRoute();
            if (jump) {
                return null;
            }
        }
        return (
            <div className="rightContent">
                <div className="main">
                    {this.props.route ? renderRoutes(this.props.route.routes) : this.props.children}
                </div>
            </div>
        );
    }
}

module.exports = RightContent;
