var language = require("../../../public/language/getLanguage");
import Trace from "LIB_DIR/trace";

if (language.lan() == "es" || language.lan() == "en") {
    require("./index-es_VE.less");
} else if (language.lan() == "zh") {
    require("./index-zh_CN.less");
}
require("./oplate");
var LeftMenu = require("../../../components/privilege/nav-sidebar");
var phoneMsgEmitter = require("PUB_DIR/sources/utils/emitters").phoneMsgEmitter;
import PhonePanel from "MOD_DIR/phone_panel/public";
const emptyParamObj = {
    customer_params: null,//客户详情相关的参数
    call_params: null//后端推送过来的通话状态相关的参数
};
var PageFrame = React.createClass({
    getInitialState: function() {
        return {
            phonePanelShow: false,//是否展示拨打电话面板（包括：客户详情）
            paramObj: $.extend(true, {}, emptyParamObj)
        };
    },
    componentDidMount: function() {
        Trace.addEventListener(window, "click", Trace.eventHandler);
        //打开拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
    },
    componentWillUnmount: function() {
        Trace.detachEventListener(window, "click", Trace.eventHandler);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
    },
    openPhonePanel: function(paramObj) {
        if (!this.state.phonePanelShow) {
            if (paramObj.call_params) {
                Trace.traceEvent("电话弹屏", '弹出拨打电话的面板');
            } else {
                Trace.traceEvent("客户详情", '查看客户详情');
            }
        }
        this.setState({phonePanelShow: true, paramObj: $.extend(this.state.paramObj, paramObj)});
    },
    closePhonePanel: function() {
        this.setState({phonePanelShow: false, paramObj: $.extend(true, {}, emptyParamObj)});
    },
    render: function() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-2">
                        <LeftMenu />
                    </div>
                    <div className="col-xs-10">
                        {this.props.children}
                        {this.state.phonePanelShow ? (
                            <PhonePanel showFlag={this.state.phonePanelShow}
                                paramObj={this.state.paramObj}
                                closePhonePanel={this.closePhonePanel}/>) : null}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PageFrame;
