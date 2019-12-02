require('./css/right-content.less');
var history = require('../../public/sources/history');
var TopNav = require('CMP_DIR/top-nav');
import LeftSubNav from 'CMP_DIR/left-sub-nav';

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
            // 如果有子路由
            if (routes && routes[0] && routes[0].path) {
                history.replace(routes[0].path);
                return true;
            }
        }
        return false;
    };
    //是否是左侧子导航
    isLeftSubNav() {
        return _.get(this.props, 'route.subMenuPosition') === 'left';
    }
    renderSubNav(){
        if(this.props.route){
            if (this.isLeftSubNav()) {
                return (<LeftSubNav/>);
            } else {
                return (
                    <TopNav>
                        <TopNav.MenuList/>
                    </TopNav>);
            }
        }else{
            return null;
        }
    }
    render() {
        if (this.props.route) {
            var jump = this.checkRoute();
            if (jump) {
                return null;
            }
        }
        const cls = classNames({
            'top-nav-module-content': this.props.route && !this.isLeftSubNav(),
            'left-nav-module-conent': this.props.route && this.isLeftSubNav()
        });
        return (
            <div className="rightContent">
                <div className="main">
                    {this.renderSubNav()}
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
