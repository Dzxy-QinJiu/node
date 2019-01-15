var React = require('react');
var language = require('../../../public/language/getLanguage');
import Trace from 'LIB_DIR/trace';
import {renderRoutes} from 'react-router-config';

require('./index-zh_CN.less');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./index-es_VE.less');
}
require('./oplate');
const LAYOUT_CONSTS = require('../../../lib/consts').LAYOUT;
var LeftMenu = require('../../../components/privilege/nav-sidebar');
var phoneMsgEmitter = require('PUB_DIR/sources/utils/emitters').phoneMsgEmitter;
var audioMsgEmitter = require('PUB_DIR/sources/utils/emitters').audioMsgEmitter;
import PhonePanel from 'MOD_DIR/phone_panel/public';
import AudioPlayer from 'CMP_DIR/audioPlayer';
import Notification from 'MOD_DIR/notification/public/index';
//窗口改变的事件emitter
var resizeEmitter = require('../../../public/sources/utils/emitters').resizeEmitter;
import ClueRightPanel from 'MOD_DIR/clue_customer/public/views/clue-right-detail';

var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
let phoneUtil = require('PUB_DIR/sources/utils/phone-util');


const emptyParamObj = {
    customer_params: null,//客户详情相关的参数
    call_params: null//后端推送过来的通话状态相关的参数
};

class PageFrame extends React.Component {
    state = {
        phonePanelShow: false,//是否展示拨打电话面板（包括：客户详情）
        paramObj: $.extend(true, {}, emptyParamObj),
        audioPanelShow: false,//是否展示播放录音面板
        audioParamObj: {},
        isShowNotificationPanel: false, // 是否展示系统通知面板
        rightContentHeight: 0,
        showCluePanel: false,
        clueId: ''//展示线索的id
    };

    componentDidMount() {
        this.setContentHeight();
        Trace.addEventListener(window, 'click', Trace.eventHandler);
        //打开拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
        //打开播放录音面板的事件监听
        audioMsgEmitter.on(audioMsgEmitter.OPEN_AUDIO_PANEL, this.openAudioPanel);
        //隐藏上报客服电话的按钮
        audioMsgEmitter.on(audioMsgEmitter.HIDE_REPORT_BTN, this.hideReportBtn);
        //系统内有弹窗时，点击弹框中的线索名称可以查看线索详情
        notificationEmitter.on(notificationEmitter.SHOW_CLUE_DETAIL, this.showClueDetailFromNotification);
        $(window).on('resize', this.resizeHandler);
    }

    componentWillReceiveProps(nextProps) {
        //路由切换时，关闭电话弹屏和客户详情的处理
        if (_.get(nextProps, 'location.pathname') !== _.get(this.props, 'location.pathname')) {
            this.closePhonePanel();
        }
    }

    resizeEmitter = () => {
        resizeEmitter.emit(resizeEmitter.WINDOW_SIZE_CHANGE, {
            width: $('#app .col-xs-10').width(),
            height: this.state.rightContentHeight
        });
    };

    resizeHandler = () => {
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            this.setContentHeight();
        }, 100);
    };

    componentDidUpdate() {
        this.resizeEmitter();
    }

    setContentHeight = () => {
        const height = $(window).height() - LAYOUT_CONSTS.TOP_NAV - LAYOUT_CONSTS.PADDING_BOTTOM;
        this.setState({
            rightContentHeight: height
        });
    }

    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
        audioMsgEmitter.removeListener(audioMsgEmitter.OPEN_AUDIO_PANEL, this.openAudioPanel);
        audioMsgEmitter.removeListener(audioMsgEmitter.HIDE_REPORT_BTN, this.hideReportBtn);
        notificationEmitter.removeListener(notificationEmitter.SHOW_CLUE_DETAIL, this.showClueDetailFromNotification);
        $(window).off('resize', this.resizeHandler);
        phoneUtil.unload(() => {
            console.log('成功登出电话系统!');
        });
    }

    showClueDetailFromNotification = (clueObj) => {
        this.setState({
            showCluePanel: true,
            clueId: clueObj.clueId
        });
    };

    hideClueRightPanel = () => {
        this.setState({
            showCluePanel: false,
            clueId: ''
        });
    };

    openAudioPanel = (audioParamObj) => {
        this.setState({audioPanelShow: true, audioParamObj: $.extend(this.state.audioParamObj, audioParamObj)});
    };

    hideReportBtn = (btnShowFlag) => {
        let audioParamObj = this.state.audioParamObj;
        audioParamObj.isShowReportButton = btnShowFlag.isShowReportButton;
        this.setState({audioParamObj});
    };

    openPhonePanel = (paramObj) => {
        if (!this.state.phonePanelShow) {
            if (paramObj.call_params) {
                Trace.traceEvent('电话弹屏', '弹出拨打电话的面板');
            } else {
                Trace.traceEvent(ReactDOM.findDOMNode(this), '查看客户详情');
            }
        }
        this.setState({phonePanelShow: true, paramObj: $.extend(this.state.paramObj, paramObj)});
    };

    closePhonePanel = () => {
        //关闭电话弹屏面板时，将系统内拨打电话时，记录的电话联系人信息清掉
        if (this.state.paramObj.call_params && _.isFunction(this.state.paramObj.call_params.setInitialPhoneObj)) {
            this.state.paramObj.call_params.setInitialPhoneObj();
        }
        this.setState({phonePanelShow: false, paramObj: $.extend(true, {}, emptyParamObj)});
    };

    closeAudioPanel = () => {
        this.setState({audioPanelShow: false, audioParamObj: {}});
        if (this.state.audioParamObj && _.isFunction(this.state.audioParamObj.closeAudioPlayContainer)) {
            this.state.audioParamObj.closeAudioPlayContainer();
        }
    };

    toggleNotificationPanel = () => {
        this.setState({
            isShowNotificationPanel: !this.state.isShowNotificationPanel
        }, () => {
            if (this.state.isShowNotificationPanel === false) {
                this.setState({
                    phonePanelShow: false
                });
            }
        });
    };

    closeNotificationPanel = () => {
        this.setState({
            isShowNotificationPanel: false,
            phonePanelShow: false
        });
    };

    render() {
        var audioParamObj = this.state.audioParamObj;
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-2">
                        <LeftMenu toggleNotificationPanel={this.toggleNotificationPanel}
                                  closeNotificationPanel={this.closeNotificationPanel}/>
                    </div>
                    <div className="col-xs-10">
                        {renderRoutes(this.props.route.routes)}
                        {this.state.phonePanelShow ? (
                            <PhonePanel
                                showFlag={this.state.phonePanelShow}
                                paramObj={this.state.paramObj}
                                closePhonePanel={this.closePhonePanel}
                                notificationCustomer={this.state.isShowNotificationPanel}
                            />) : null}
                        {
                            this.state.isShowNotificationPanel ? (
                                <Notification/>
                            ) : null
                        }
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
                {this.state.showCluePanel ?
                    <ClueRightPanel
                        className="page-frame-clue-detail"
                        showFlag={this.state.showCluePanel}
                        currentId={this.state.clueId}
                        hideRightPanel={this.hideClueRightPanel}
                    /> : null}
            </div>
        );
    }
}

PageFrame.propTypes = {
    route: PropTypes.obj
};
module.exports = PageFrame;
