import analysisPrivilegeConst from '../../modules/analysis/public/privilege-const';

var React = require('react');
var UserData = require('../../public/sources/user-data');

//根据权限获取子路由
function getChildRoutes(preRoutePath, fullModuleList) {
    var userInfo = UserData.getUserData();
    var subModules = userInfo.subModules || {};
    var needModules = subModules[preRoutePath] || [];
    var childRoutes = [];

    _.each(needModules, function(module) {
        var target = _.find(fullModuleList, function(moduleAnother) {
            if ('/' + module.routePath === moduleAnother.path) {
                return true;
            }
        });
        if (target) {
            childRoutes.push(target);
        }
    });
    return childRoutes;
}

//检查权限的标签
class PrivilegeChecker extends React.Component {
    static defaultProps = {
        check: '',
        tagName: 'div'
    };

    canRenderChildren = (check) => {
        if (typeof check === 'string') {
            var userInfo = UserData.getUserData() || {};
            var privileges = userInfo.privileges || [];
            var checkPrivilege = check.toLowerCase();
            return _.find(privileges, function(privilege) {
                if (privilege.toLowerCase() === checkPrivilege) {
                    return true;
                }
            });
        } else if (typeof check === 'function') {
            return check();
        }
    };

    state = {
        hasChildNodes: this.canRenderChildren(this.props.check)
    };

    componentWillReceiveProps(nextProps) {
        if (typeof nextProps.check === 'function' || (nextProps.check !== this.props.check)) {
            this.setState({
                hasChildNodes: this.canRenderChildren(nextProps.check)
            });
        }
    }

    render() {
        if (!this.state.hasChildNodes) {
            return null;
        }
        return React.createElement(
            this.props.tagName,
            this.props,
            this.props.children
        );
    }
}

//是否有某个权限
function hasPrivilege(list) {
    if (typeof list !== 'string' && !$.isArray(list) || ($.isArray(list) && !list.length)) {
        throw 'first parameter need to be String/Array(not Empty)';
    }
    if (typeof list === 'string') {
        list = [list];
    }
    var userInfo = UserData.getUserData() || {};
    var privileges = userInfo.privileges || [];
    var pass = true;
    _.each(list, function(privilege) {
        if (typeof privilege !== 'string') {
            throw 'privilege need to be String';
        }
        var checkPrivilege = privilege.toLowerCase();
        var hasPrivilege = _.find(privileges, function(item) {
            if (item.toLowerCase() === checkPrivilege) {
                return true;
            }
        });
        if (!hasPrivilege) {
            pass = false;
        }
    });
    return pass;
}

function getDataAuthType() {
    let type = 'Common';//CURTAO_CRM_CUSTOMER_ANALYSIS_SELF
    if (hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL)) {
        type = 'Manager';
    }
    return type;
}

//检查权限的标签
exports.PrivilegeChecker = PrivilegeChecker;
//根据权限获取子路由
exports.getChildRoutes = getChildRoutes;
//是否有权限
exports.hasPrivilege = hasPrivilege;
//数据访问类型（管理者还是普通人员）
exports.getDataAuthType = getDataAuthType;


