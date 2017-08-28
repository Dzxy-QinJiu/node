
var UserData = require("../../public/sources/user-data");

//根据权限获取子路由
function getChildRoutes(preRoutePath , fullModuleList) {
    var userInfo = UserData.getUserData();
    var subModules = userInfo.subModules || {};
    var needModules = subModules[preRoutePath] || [];
    var childRoutes = [];

    _.each(needModules , function(module) {
        var target = _.find(fullModuleList , function(moduleAnother) {
            if(module.routePath === preRoutePath + '/' + moduleAnother.path) {
                return true;
            }
        });
        if(target) {
            childRoutes.push(target);
        }
    });
    return childRoutes;
} 

//检查权限的标签
var PrivilegeChecker = React.createClass({
    getDefaultProps : function() {
        return {
            check : '',
            tagName : 'div'
        };
    },
    canRenderChildren : function(check) {
        if(typeof check === 'string') {
            var userInfo = UserData.getUserData() || {};
            var privileges = userInfo.privileges || [];
            var checkPrivilege = check.toLowerCase();
            return _.find(privileges, function(privilege) {
                if(privilege.toLowerCase() === checkPrivilege) {
                    return true;
                }
            });
        } else if(typeof check === 'function') {
            return check();
        }
    },
    getInitialState : function() {
        return {
            hasChildNodes : this.canRenderChildren(this.props.check)
        };
    },
    componentWillReceiveProps : function(nextProps) {
        if(typeof nextProps.check === 'function' || (nextProps.check !== this.props.check)) {
            this.setState({
                hasChildNodes : this.canRenderChildren(nextProps.check)
            });
        }
    },
    render : function() {
        if(!this.state.hasChildNodes) {
            return null;
        }
        return React.createElement(
            this.props.tagName,
            this.props,
            this.props.children
        );
    }
});

//是否有某个权限
function hasPrivilege(list) {
    if(typeof list !== 'string' && !$.isArray(list) || ($.isArray(list) && !list.length)) {
        throw 'first parameter need to be String/Array(not Empty)';
    }
    if(typeof list === 'string') {
        list = [list];
    }
    var userInfo = UserData.getUserData() || {};
    var privileges = userInfo.privileges || [];
    var pass = true;
    _.each(list , function(privilege) {
        if(typeof privilege !== 'string') {
            throw 'privilege need to be String';
        }
        var checkPrivilege = privilege.toLowerCase();
        var hasPrivilege = _.find(privileges, function(item) {
            if(item.toLowerCase() === checkPrivilege) {
                return true;
            }
        });
        if(!hasPrivilege) {
            pass = false;
        }
    });
    return pass;
}

//检查权限的标签
exports.PrivilegeChecker = PrivilegeChecker;
//根据权限获取子路由
exports.getChildRoutes = getChildRoutes;
//是否有权限
exports.hasPrivilege = hasPrivilege;
