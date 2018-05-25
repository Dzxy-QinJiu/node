/**
 * Created by jinfeng on 2015/12/30.
 */


var language = require("../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./index-es_VE.less");
}else if (language.lan() == "zh"){
    require("./index-zh_CN.less");
}
var classNames = require("classnames");
var Button = require("antd").Button;
//渲染右侧推出面板
var RightPanel = React.createClass({

    render: function () {
        var btnClass = classNames("right-pannel-default", this.props.className, {
            'right-pannel-show': this.props.showFlag
        });
        return (
            <div {...this.props} className={btnClass}>
                {this.props.children}
            </div>
        );
    }
});

//渲染右侧面板确认按钮
var RightPanelSubmit = React.createClass({

    render: function () {
        return (
            <Button type="primary" className="form-submit-btn btn-primary-sure" {...this.props}>
                {this.props.children}
            </Button>
        );
    }
});

//渲染右侧面板取消按钮
var RightPanelCancel = React.createClass({

    render: function () {
        return (
            <Button type="ghost" className="form-cancel-btn btn-primary-cancel" {...this.props}>
                {this.props.children}
            </Button>
        );
    }
});

//渲染关闭按钮
var RightPanelClose = React.createClass({

    render: function () {
        return (
            <div {...this.props} className="close-pannel icon-close iconfont"></div>
        );
    }
});


//渲染编辑按钮
var RightPanelEdit = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-update circle-button iconfont" title={Intl.get("common.edit","编辑")}>
            </div>
        );
    }
});
//渲染详情中的编辑按钮
var DetailEditBtn = React.createClass({
    render: function () {
        return (<span  {...this.props} className="iconfont icon-edit-btn"/>);
    }
});

//渲染禁用按钮
var RightPanelForbid = React.createClass({

    render: function () {
        var className = "icon-forbid circle-button iconfont";
        var title = Intl.get("common.disabled","禁用");
        if (this.props.isActive) {
            className += " active";
            title = Intl.get("common.enabled","启用");
        }

        return (
            <div {...this.props} className={className} title={title}>
            </div>
        );
    }
});

//渲染返回按钮
var RightPanelReturn = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-return return-btn circle-button iconfont">
            </div>
        );
    }
});

//渲染删除按钮
var RightPanelDelete = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-delete circle-button iconfont" title={Intl.get("common.delete","删除")}>
            </div>
        );
    }
});

// 渲染版本升级按钮
var RightPanelVersionUpgrade = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-upgrade circle-button iconfont" title={Intl.get("rightpanel_upgrade","升级记录")}>
            </div>
        );
    }
});

// 渲染应用权限按钮
var RightPanelAppAuth = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-app-auth circle-button iconfont" title={Intl.get("rightpanel_app_auth","应用权限")}>
            </div>
        );
    }
});

// 渲染系统公告按钮
var RightPanelAppNotice = React.createClass({
    render: function () {
        return (
            <div {...this.props} className=" icon-notice circle-button iconfont" title={Intl.get("rightpanel_notice","公告")}>
            </div>
        );
    }
});

// 渲染是否删除版本升级记录
var RightPanelAppVersionDelete = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-delete circle-button iconfont" title={Intl.get("rightpanel_delete_record","删除该记录")}>
            </div>
        );
    }
});
 // 渲染用户类型配置
    var RightPanelUserTypeConfig = React.createClass({
        render: function () {
            return (
                <div {...this.props} className="icon-usertypeconfig circle-button iconfont" title={Intl.get("rightpanel_usertypeconfig","用户类型设置")}>
                </div>
            );
        }
    });
//应用代码的跟踪
var RightPanelAppCodeTrace = React.createClass({
    render: function () {
        return (
            <div {...this.props} className="icon-trace circle-button iconfont" title={Intl.get("rightpanel_codetrace","跟踪代码")}>
            </div>
        );
    }
});


exports.RightPanel = RightPanel;
exports.RightPanelSubmit = RightPanelSubmit;
exports.RightPanelCancel = RightPanelCancel;
exports.RightPanelClose = RightPanelClose;
exports.RightPanelEdit = RightPanelEdit;
exports.DetailEditBtn = DetailEditBtn;
exports.RightPanelForbid = RightPanelForbid;
exports.RightPanelReturn = RightPanelReturn;
exports.RightPanelDelete = RightPanelDelete;
exports.RightPanelVersionUpgrade = RightPanelVersionUpgrade;
exports.RightPanelAppAuth = RightPanelAppAuth;
exports.RightPanelAppNotice = RightPanelAppNotice;
exports.RightPanelAppVersionDelete = RightPanelAppVersionDelete;
exports.RightPanelUserTypeConfig = RightPanelUserTypeConfig;
exports.RightPanelAppCodeTrace = RightPanelAppCodeTrace;

