/**
 * Created by jinfeng on 2015/12/30.
 */


var React = require('react');
var language = require('../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./index-es_VE.less');
}else if (language.lan() === 'zh'){
    require('./index-zh_CN.less');
}
var classNames = require('classnames');
var Button = require('antd').Button;
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';

//渲染右侧推出面板
class RightPanel extends React.Component {
    render() {
        var btnClass = classNames('right-pannel-default', this.props.className, {
            'right-pannel-show': this.props.showFlag,
            'mobile-right-panel-default': isResponsiveDisplay().isWebMin
        });
        return (
            <div {...this.props} className={btnClass}>
                {this.props.children}
            </div>
        );
    }
}
RightPanel.propTypes = {
    showFlag: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
//渲染右侧面板确认按钮
class RightPanelSubmit extends React.Component {
    render() {
        return (
            <Button type="primary" className="form-submit-btn btn-primary-sure" {...this.props}>
                {this.props.children}
            </Button>
        );
    }
}
RightPanelSubmit.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
//渲染右侧面板取消按钮
class RightPanelCancel extends React.Component {
    render() {
        return (
            <Button type="ghost" className="form-cancel-btn btn-primary-cancel" {...this.props}>
                {this.props.children}
            </Button>
        );
    }
}
RightPanelCancel.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

//渲染关闭按钮
class RightPanelClose extends React.Component {
    render() {
        return (
            <div {...this.props} className="close-pannel icon-close iconfont"></div>
        );
    }
}

//渲染编辑按钮
class RightPanelEdit extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-update circle-button iconfont" title={Intl.get('common.edit','编辑')}>
            </div>
        );
    }
}

//渲染详情中的编辑按钮
class DetailEditBtn extends React.Component {
    render() {
        return (<span {...this.props} className="iconfont icon-edit-btn handle-btn-item"/>);
    }
}

//渲染禁用按钮
class RightPanelForbid extends React.Component {
    render() {
        var className = 'icon-forbid circle-button iconfont';
        var title = Intl.get('common.disabled','禁用');
        if (this.props.isActive) {
            className += ' active';
            title = Intl.get('common.enabled','启用');
        }

        return (
            <div {...this.props} className={className} title={title}>
            </div>
        );
    }
}
RightPanelForbid.propTypes = {
    isActive: PropTypes.bool
};

//渲染返回按钮
class RightPanelReturn extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-return return-btn circle-button iconfont">
            </div>
        );
    }
}

//渲染删除按钮
class RightPanelDelete extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-delete circle-button iconfont handle-btn-item" title={Intl.get('common.delete','删除')}>
            </div>
        );
    }
}

// 渲染版本升级按钮
class RightPanelVersionUpgrade extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-upgrade circle-button iconfont" title={Intl.get('rightpanel_upgrade','升级记录')}>
            </div>
        );
    }
}

// 渲染应用权限按钮
class RightPanelAppAuth extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-app-auth circle-button iconfont" title={Intl.get('rightpanel_app_auth','应用权限')}>
            </div>
        );
    }
}

// 渲染系统公告按钮
class RightPanelAppNotice extends React.Component {
    render() {
        return (
            <div {...this.props} className=" icon-notice circle-button iconfont" title={Intl.get('rightpanel_notice','公告')}>
            </div>
        );
    }
}

// 渲染是否删除版本升级记录
class RightPanelAppVersionDelete extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-delete circle-button iconfont" title={Intl.get('rightpanel_delete_record','删除该记录')}>
            </div>
        );
    }
}

// 渲染用户类型配置
class RightPanelUserTypeConfig extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-usertypeconfig circle-button iconfont handle-btn-item" title={Intl.get('rightpanel_usertypeconfig','用户类型设置')}>
            </div>
        );
    }
}

//应用代码的跟踪
class RightPanelAppCodeTrace extends React.Component {
    render() {
        return (
            <div {...this.props} className="icon-trace circle-button iconfont" title={Intl.get('common.trace.code','跟踪代码')}>
            </div>
        );
    }
}


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


