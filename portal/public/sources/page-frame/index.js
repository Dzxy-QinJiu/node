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
var audioMsgEmitter = require("PUB_DIR/sources/utils/emitters").audioMsgEmitter;
import PhonePanel from "MOD_DIR/phone_panel/public";
import AudioPlayer from "CMP_DIR/audioPlayer";
const emptyParamObj = {
    customer_params: null,//客户详情相关的参数
    call_params: null//后端推送过来的通话状态相关的参数
};
var classNames = require("classnames");
var PageFrame = React.createClass({
    getInitialState: function() {
        return {
            phonePanelShow: false,//是否展示拨打电话面板（包括：客户详情）
            paramObj: $.extend(true, {}, emptyParamObj),
            audioPanelShow: false,//是否展示播放录音面板
            audioParamObj: {}
        };
    },
    componentDidMount: function() {
        Trace.addEventListener(window, "click", Trace.eventHandler);
        //打开拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
        //打开播放录音面板的事件监听
        audioMsgEmitter.on(audioMsgEmitter.OPEN_AUDIO_PANEL, this.openAudioPanel);
        //隐藏上报客服电话的按钮
        audioMsgEmitter.on(audioMsgEmitter.HIDE_REPORT_BTN, this.hideReportBtn);
    },
    componentWillUnmount: function() {
        Trace.detachEventListener(window, "click", Trace.eventHandler);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
        audioMsgEmitter.removeListener(audioMsgEmitter.OPEN_AUDIO_PANEL, this.openAudioPanel);
        audioMsgEmitter.removeListener(audioMsgEmitter.HIDE_REPORT_BTN, this.hideReportBtn);
    },
    openAudioPanel: function(audioParamObj) {
        this.setState({audioPanelShow: true, audioParamObj: $.extend(this.state.audioParamObj, audioParamObj)});
    },
    hideReportBtn: function(btnShowFlag) {
        this.state.audioParamObj.isShowReportButton = btnShowFlag.isShowReportButton;
        this.setState({
            audioParamObj: this.state.audioParamObj
        });
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
    closeAudioPanel: function() {
        this.setState({audioPanelShow: false, audioParamObj: {}});
        if (this.state.audioParamObj && _.isFunction(this.state.audioParamObj.closeAudioPlayContainer)){
            this.state.audioParamObj.closeAudioPlayContainer();
        }
    },
    render: function() {
        var audioParamObj = this.state.audioParamObj;
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
                {this.state.audioPanelShow && audioParamObj ? (
                    <AudioPlayer
                        playingItemAddr={audioParamObj.playingItemAddr}
                        getInvalidPhoneErrMsg={audioParamObj.getInvalidPhoneErrMsg}
                        addingInvalidPhoneErrMsg={audioParamObj.addingInvalidPhoneErrMsg}
                        isAddingInvalidPhone={audioParamObj.isAddingInvalidPhone}
                        isShowReportButton={audioParamObj.isShowReportButton}
                        closeAudioPlayContainer={this.closeAudioPanel}
                        handleAddInvalidPhone={audioParamObj.handleAddInvalidPhone}
                        hideErrTooltip={audioParamObj.hideErrTooltip}
                    />
                ) : null}
            </div>
        );
    }
});

module.exports = PageFrame;
