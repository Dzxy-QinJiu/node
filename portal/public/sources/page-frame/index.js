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
import PhonePanel from 'MOD_DIR/phone_panel/public';
import ClueDetailPanel from 'MOD_DIR/clue_detail_panel/public';
import AudioPlayer from 'CMP_DIR/audioPlayer';
import Notification from 'MOD_DIR/notification/public/index';
import UserDetail from 'MOD_DIR/app_user_manage/public/views/user-detail';
import PurchaseLeads from 'CMP_DIR/purchase-leads';
import ClueToCustomerPanel from 'CMP_DIR/clue-to-customer-panel';
import OfficialPersonalEdition from 'CMP_DIR/official-personal-edition';
import OrganizationExpiredTip from 'CMP_DIR/organization-expired-tip';
import{
    myWorkEmitter,
    notificationEmitter,
    resizeEmitter,
    phoneMsgEmitter,
    audioMsgEmitter,
    userDetailEmitter,
    paymentEmitter,
    clueToCustomerPanelEmitter
} from 'PUB_DIR/sources/utils/emitters';
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
        clueDetailPanelShow: false,
        isShowUserDetailPanel: false, // 是否显示用户详情界面
        isShowClueToCustomerPanel: false, // 是否显示线索转客户面板
        clueToCustomerPanelProps: {}, //线索转客户面板属性
        clueParamObj: $.extend(true, {}, emptyParamObj),
        userDetailParamObj: $.extend(true, {}), // 用户详情组件相关的参数
        isShowPurchaseLeadsPanel: false,//是否展示购买线索量面板
        cluePaymentParamObj: {},
        isShowPersonalVersionPanel: false,//是否展示升级个人正式版面板
        personalPaymentParamObj: {},
    };

    componentDidMount() {
        this.setContentHeight();
        Trace.addEventListener(window, 'click', Trace.eventHandler);
        //打开拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_PHONE_PANEL, this.openPhonePanel);
        //关闭拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_PHONE_PANEL, this.closePhonePanel);
        phoneMsgEmitter.on(phoneMsgEmitter.OPEN_CLUE_PANEL, this.openCluePanel);
        //关闭拨打电话面板的事件监听
        phoneMsgEmitter.on(phoneMsgEmitter.CLOSE_CLUE_PANEL, this.closeCluePanel);
        //打开播放录音面板的事件监听
        audioMsgEmitter.on(audioMsgEmitter.OPEN_AUDIO_PANEL, this.openAudioPanel);
        //隐藏上报客服电话的按钮
        audioMsgEmitter.on(audioMsgEmitter.HIDE_REPORT_BTN, this.hideReportBtn);
        // 点击系统通知框的的触发
        notificationEmitter.on(notificationEmitter.CLICK_SYSTEM_NOTICE, this.showNotificationPanel);
        // 打开用户详情面板的事件监听
        userDetailEmitter.on(userDetailEmitter.OPEN_USER_DETAIL, this.openUserDetailPanel);
        // 关闭用户详情面板的事件监听
        userDetailEmitter.on(userDetailEmitter.CLOSE_USER_DETAIL, this.closeUserDetailPanel);
        //打开增加线索量的面板的事件监听
        paymentEmitter.on(paymentEmitter.OPEN_ADD_CLUES_PANEL, this.showPurchaseLeadsPanel);
        //打开升级个人正式版的面板的事件监听
        paymentEmitter.on(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, this.showPersonalVersionPanel);
        //监听线索转客户面板打开事件
        clueToCustomerPanelEmitter.on(clueToCustomerPanelEmitter.OPEN_PANEL, this.openClueToCustomerPanel);
        //监听线索转客户面板关闭事件
        clueToCustomerPanelEmitter.on(clueToCustomerPanelEmitter.CLOSE_PANEL, this.closeClueToCustomerPanel);

        $(window).on('resize', this.resizeHandler);
    }

    componentWillReceiveProps(nextProps) {
        //路由切换时，关闭电话弹屏和客户详情的处理，也需要关闭线索详情
        if (_.get(nextProps, 'location.pathname') !== _.get(this.props, 'location.pathname')) {
            this.closePhonePanel();
            this.closeCluePanel();
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
        //关闭拨打电话面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_PHONE_PANEL, this.closePhonePanel);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.OPEN_CLUE_PANEL, this.openCluePanel);
        //关闭拨打电话面板的事件监听
        phoneMsgEmitter.removeListener(phoneMsgEmitter.CLOSE_CLUE_PANEL, this.closeCluePanel);
        audioMsgEmitter.removeListener(audioMsgEmitter.OPEN_AUDIO_PANEL, this.openAudioPanel);
        audioMsgEmitter.removeListener(audioMsgEmitter.HIDE_REPORT_BTN, this.hideReportBtn);
        notificationEmitter.removeListener(notificationEmitter.CLICK_SYSTEM_NOTICE, this.showNotificationPanel);
        // 打开用户详情面板的事件监听
        userDetailEmitter.removeListener(userDetailEmitter.OPEN_USER_DETAIL, this.openUserDetailPanel);
        // 关闭用户详情面板的事件监听
        userDetailEmitter.removeListener(userDetailEmitter.CLOSE_USER_DETAIL, this.closeUserDetailPanel);
        paymentEmitter.removeListener(paymentEmitter.OPEN_ADD_CLUES_PANEL, this.showPurchaseLeadsPanel);
        paymentEmitter.removeListener(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, this.showPersonalVersionPanel);
        //取消监听线索转客户面板打开事件
        clueToCustomerPanelEmitter.removeListener(clueToCustomerPanelEmitter.OPEN_PANEL, this.openClueToCustomerPanel);
        //取消监听线索转客户面板关闭事件
        clueToCustomerPanelEmitter.removeListener(clueToCustomerPanelEmitter.CLOSE_PANEL, this.closeClueToCustomerPanel);
        $(window).off('resize', this.resizeHandler);
        phoneUtil.unload(() => {
            console.log('成功登出电话系统!');
        });
    }

    showNotificationPanel = () => {
        this.setState({
            isShowNotificationPanel: true
        });
    }


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
    //打开线索面板
    openCluePanel = (paramObj) => {
        if (!this.state.clueDetailPanelShow) {
            if (paramObj.call_params) {
                Trace.traceEvent('线索弹屏', '弹出拨打电话的面板');
            } else {
                Trace.traceEvent(ReactDOM.findDOMNode(this), '查看线索详情');
            }
        }
        this.setState({clueDetailPanelShow: true, clueParamObj: $.extend(this.state.clueParamObj, paramObj)});
    };
    closeCluePanel = () => {
        //首页我的工作中，打通电话或写了跟进，关闭弹屏前，需要将首页的相关工作去掉
        if (window.location.pathname === '/home') {
            myWorkEmitter.emit(myWorkEmitter.HANDLE_FINISHED_WORK);
        }
        //关闭电话弹屏面板时，将系统内拨打电话时，记录的电话联系人信息清掉
        if (this.state.clueParamObj.call_params && _.isFunction(this.state.clueParamObj.call_params.setInitialPhoneObj)) {
            this.state.clueParamObj.call_params.setInitialPhoneObj();
        }
        this.setState({clueDetailPanelShow: false, clueParamObj: $.extend(true, {}, emptyParamObj)});
    };

    // 打开用户详情面板
    openUserDetailPanel = (paramObj) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '查看用户详情');
        this.setState({
            isShowUserDetailPanel: true,
            userDetailParamObj: $.extend(this.state.userDetailParamObj, paramObj)
        });
    };

    // 关闭用户详情面板
    closeUserDetailPanel = () => {
        this.setState({
            isShowUserDetailPanel: false,
            userDetailParamObj: $.extend(this.state.userDetailParamObj, {})
        });
    };

    // 打开线索转客户面板
    openClueToCustomerPanel = props => {
        this.setState({
            isShowClueToCustomerPanel: true,
            clueToCustomerPanelProps: props,
        });
    };

    // 关闭线索转客户面板
    closeClueToCustomerPanel = () => {
        this.setState({
            isShowClueToCustomerPanel: false,
            clueToCustomerPanelProps: {},
        });
    };

    closePhonePanel = () => {
        //首页我的工作中，打通电话或写了跟进，关闭弹屏前，需要将首页的相关工作去掉
        if (window.location.pathname === '/home') {
            myWorkEmitter.emit(myWorkEmitter.HANDLE_FINISHED_WORK);
        }
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
            } else {
                // 打开系统通知时，需要关闭以前打开的相应的用户详情、客户详情界面
                this.closeUserDetailPanel();
                this.closePhonePanel();
            }
        });
    };

    closeNotificationPanel = () => {
        this.setState({
            isShowNotificationPanel: false,
        });
        // 关闭系统通知后，需要关闭相应的用户详情、客户详情界面
        this.closeUserDetailPanel();
        this.closePhonePanel();
    };

    showPurchaseLeadsPanel = (paramObj) => {
        this.setState({isShowPurchaseLeadsPanel: true, cluePaymentParamObj: $.extend(this.state.cluePaymentParamObj, paramObj)});
    };
    closePurchaseLeadsPanel = () => {
        this.setState({isShowPurchaseLeadsPanel: false, cluePaymentParamObj: {}});
    };

    showPersonalVersionPanel = (paramObj) => {
        this.setState({isShowPersonalVersionPanel: true, personalPaymentParamObj: $.extend(this.state.personalPaymentParamObj, paramObj)});
    };
    closePersonalVersionPanel = () => {
        this.setState({isShowPersonalVersionPanel: false, personalPaymentParamObj: {}});
    };

    render() {
        var audioParamObj = this.state.audioParamObj;
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-2">
                        <LeftMenu
                            toggleNotificationPanel={this.toggleNotificationPanel}
                            closeNotificationPanel={this.closeNotificationPanel}
                            isShowNotificationPanel={this.state.isShowNotificationPanel}
                        />
                    </div>
                    <div className="col-xs-10">
                        <OrganizationExpiredTip/>
                        {renderRoutes(this.props.route.routes)}
                        {this.state.phonePanelShow ? (
                            <PhonePanel
                                showFlag={this.state.phonePanelShow}
                                paramObj={this.state.paramObj}
                                closePhonePanel={this.closePhonePanel}
                                notificationCustomer={this.state.isShowNotificationPanel}
                            />) : null}
                        {this.state.clueDetailPanelShow ? (
                            <ClueDetailPanel
                                showFlag={this.state.clueDetailPanelShow}
                                paramObj={this.state.clueParamObj}
                                closeClueDetailPanel={this.closeCluePanel}
                            />) : null}
                        {
                            this.state.isShowNotificationPanel ? (
                                <Notification closeNotificationPanel={this.closeNotificationPanel}/>
                            ) : null
                        }
                        {
                            this.state.isShowUserDetailPanel ? (
                                <UserDetail
                                    {...this.state.userDetailParamObj}
                                    closeRightPanel={this.closeUserDetailPanel}
                                    isNotificationOpenUserDetail={this.state.isShowNotificationPanel}
                                />
                            ) : null
                        }
                        {
                            this.state.isShowPurchaseLeadsPanel ? (
                                <PurchaseLeads
                                    paramObj={this.state.cluePaymentParamObj}
                                    onClosePanel={this.closePurchaseLeadsPanel}
                                />
                            ) : null
                        }
                        {
                            this.state.isShowClueToCustomerPanel ? (
                                <ClueToCustomerPanel
                                    onClose={this.closeClueToCustomerPanel}
                                    {...this.state.clueToCustomerPanelProps}
                                />
                            ) : null
                        }
                        {
                            this.state.isShowPersonalVersionPanel ? (
                                <OfficialPersonalEdition
                                    paramObj={this.state.personalPaymentParamObj}
                                    onClosePanel={this.closePersonalVersionPanel}
                                />
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
            </div>
        );
    }
}

PageFrame.propTypes = {
    route: PropTypes.obj
};
module.exports = PageFrame;
