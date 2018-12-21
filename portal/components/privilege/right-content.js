require('./css/right-content.less');
var history = require('../../public/sources/history');
var TopNav = require('CMP_DIR/top-nav');

import {renderRoutes} from 'react-router-config';
import classNames from 'classnames';

class RightContent extends React.Component {
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
        const cls = classNames({
            'moduleContent': this.props.route ? true : false
        });
        return (
            <div className="rightContent">
                <div className="main">
                    {this.props.route ? (<TopNav>
                        <TopNav.MenuList/>
                    </TopNav>
                    ) : null}
                    <div className={cls}>
                        {this.props.route ? renderRoutes(this.props.route.routes) : this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

RightContent.propTypes = {
    route: PropTypes.object,
    children: PropTypes.element
};
module.exports = RightContent;
