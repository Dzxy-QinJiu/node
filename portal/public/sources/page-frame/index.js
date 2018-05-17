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
import PhoneAlert from "MOD_DIR/phone-alert/public";
import PhonePanel from "MOD_DIR/phone_panel";
var PageFrame = React.createClass({
    getInitialState: function () {
        return {
            phonePanelShow: false,//是否展示拨打电话面板（包括：客户详情）
            paramObj: {
                type: "",//打开电话面板的类型，customer_detail、call_push、curtao_call
                params: {}
            },
        };
    },
    componentDidMount: function () {
        Trace.addEventListener(window, "click", Trace.eventHandler);
        //打开拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
    },
    componentWillUnmount: function () {
        Trace.detachEventListener(window, "click", Trace.eventHandler);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
    },
    openPhonePanel: function (paramObj) {
        this.setState({phonePanelShow: true, paramObj: paramObj});
    },
    closePhonePanel: function () {
        this.setState({phonePanelShow: false});
    },
    //TODO delete
    setInitialPhoneObj: function () {
        this.setState({phoneObj: {}});
    },
    render: function () {
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
