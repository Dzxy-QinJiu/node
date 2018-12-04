var React = require('react');
var history = require('../../public/sources/history');
var TopNav = require('CMP_DIR/top-nav');

import {renderRoutes} from 'react-router-config';

class RightContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topNavOperation: null
        };
    }

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

    //子组件渲染回调
    renderTopNavOperation = (children) => {
        this.setState({
            topNavOperation: children
        });
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
                    <TopNav>
                        <TopNav.MenuList/>
                        {this.state.topNavOperation}
                    </TopNav>
                    {this.props.route ? renderRoutes(this.props.route.routes,
                        {renderTopNavOperation: this.renderTopNavOperation}) : this.props.children}
                </div>
            </div>
        );
    }
}

module.exports = RightContent;
