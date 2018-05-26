require("./index.less");

var Spinner = require("../../../components/spinner");
var PrivilegeGet = React.createClass({
    getInitialState: function() {
        return {
            isLoading: true,
            needLogout: false,
            errorTip: "",
            logoutTime: 3//获取用户信息出错3秒后重新登录
        };
    },
    retry: function() {
        if (this.state.needLogout) {
            return;
        }
        this.props.retry();
    },
    render: function() {
        if (this.state.isLoading) {
            return (
                <div className="PrivilegeGet">
                    <Spinner />
                </div>
            );
        } else if (this.state.errorTip && this.state.logoutTime > 0) {
            var retryLink = !this.state.needLogout ? "javascript:void(0)" : "/logout";
            var errorTip = this.state.errorTip ? this.state.errorTip : Intl.get("common.get.data.error", "请求数据错误");
            return (
                <div className="PrivilegeGet">
                    <div className="fail">
                        {errorTip}, {Intl.get("seconds.after.tip", "{logoutTime}秒后", {logoutTime: this.state.logoutTime})},
                        <a href={retryLink} onClick={this.retry}>{Intl.get("retry.login.again", "重新登录")}</a>
                    </div>
                </div>
            );
        } else {
            //获取用户基本信息失败3秒后，自动跳到登录页
            window.location.href = '/logout';
        }
    }
});

module.exports = PrivilegeGet;