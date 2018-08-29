const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/6/21.
 */
import TopNav from 'CMP_DIR/top-nav';
const history = require('../../public/sources/history');
import './public/style.less';
class ContractContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    checkRoute() {
        var locationPath = window.location.pathname.replace(/^\//, '');
        if (this.props.route && locationPath === this.props.route.path) {
            var routes = this.props.route.routesExports;
            if (routes && routes[0] && routes[0].path) {
                history.replace('/' + locationPath + '/' + routes[0].path);
                return true;
            }
        }
        return false;
    }

    render() {
        var jump = this.checkRoute();
        if (jump) {
            return null;
        }

        return (
            <div className="rightContent">
                <div className="main">
                    <TopNav>
                        <TopNav.MenuList />
                    </TopNav>
                    <div className="contract-container">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
ContractContainer.propTypes = {
    children: PropTypes.element,
    route: PropTypes.object,
};
module.exports = ContractContainer;

