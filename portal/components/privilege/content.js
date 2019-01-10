/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/4.
 */
var history = require('../../public/sources/history');
import {renderRoutes} from 'react-router-config';

class Content extends React.Component {
    constructor(props) {
        super(props);
    }

    checkRoute = () => {
        var locationPath = location.pathname;
        if (this.props.route && locationPath === this.props.route.path) {
            var routes = this.props.route.routes;
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
            <div className="content">
                {this.props.route ? renderRoutes(this.props.route.routes) : this.props.children}
            </div>
        );
    }
}
Content.propTypes = {
    route: PropTypes.object,
    children: PropTypes.element
};

module.exports = Content;
