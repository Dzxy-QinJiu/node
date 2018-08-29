var React = require('react');
require('./index.less');
var Dropdown = require('antd').Dropdown;
var Menu = require('antd').Menu;
var Link = require('react-router').Link;
var UserData = require('../../public/sources/user-data');
var moduleTextMap = {
    'oplate_user_analysis': Intl.get('sales.user.analysis', '用户分析'),
    'analysis/realm': Intl.get('menu.analysis_realm','安全域分析'),
    'oplate_customer_analysis': Intl.get('customer.analysis', '客户分析'),
    'weekly_report_analysis': Intl.get('analysis.sales.weekly.report', '销售周报')
};
var urlTextMap = {
    '/analysis/user': Intl.get('sales.user.analysis', '用户分析'),
    '/analysis/realm/zone': Intl.get('menu.analysis_realm','安全域分析'),
    '/analysis/realm/industry': Intl.get('menu.analysis_realm','安全域分析'),
    '/analysis/realm/establish': Intl.get('menu.analysis_realm','安全域分析'),
    '/analysis/customer': Intl.get('customer.analysis', '客户分析'),
    '/analysis/weekly_report': Intl.get('analysis.sales.weekly.report', '销售周报')
};
var moduleUrlMap = {
    'oplate_user_analysis': '/analysis/user',
    'analysis/realm': '/analysis/realm',
    'oplate_customer_analysis': '/analysis/customer',
    'weekly_report_analysis': '/analysis/weekly_report'
};

class AnalysisMenu extends React.Component {
    getCurrentPath = () => {
        var pathname = window.location.pathname;
        return pathname;
    };

    getCurrentLinkText = () => {
        var category = this.getCurrentPath();
        return urlTextMap[category];
    };

    render() {
        var menuListArray = [];
        var modules = UserData.getUserData().modules;
        _.each(modules , function(module) {
            if(/analysis/.test(module)) {
                var url = moduleUrlMap[module];
                menuListArray.push((
                    <Menu.Item key={module}>
                        <Link to={url} activeClassName="active">{moduleTextMap[module]}</Link>
                    </Menu.Item>
                ));
            }
        });
        var MenuList = (
            <Menu className="analysis-menu-dropdown">
                {menuListArray}
            </Menu>
        );
        return (
            <div className="analysis-menu">
                <Dropdown overlay={MenuList}>
                    <a className="ant-dropdown-link" href="javascript:void(0)">
                        {this.getCurrentLinkText()} <span className="glyphicon glyphicon-triangle-bottom"></span>
                    </a>
                </Dropdown>
            </div>
        );
    }
}

module.exports = AnalysisMenu;
