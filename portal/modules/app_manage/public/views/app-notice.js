import { Icon} from "antd";
require("../../../../components/app-notice/app-notice-list.less");
var Alert = require("antd").Alert;
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var AppNoticeStore = require('../store/app-notice-store');
var AppNoticeAction = require('../action/app-notice-action');
var AppNoticeList = require("../../../../components/app-notice");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var AppStore = require("../store/app-store");
var autosize = require("autosize");
import Trace from "LIB_DIR/trace";

//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 60,
    RIGHT_PANEL_PADDING_BOTTOM: 60
};

var AppNotice = React.createClass({

    getDefaultProps: function() {
        return {
            appId: ""
        };
    },

    getInitialState: function() {
        return AppNoticeStore.getState();
    },

    onStoreChange: function() {
        var state = AppNoticeStore.getState();
        this.setState(state);
    },

    componentDidMount: function() {
        AppNoticeStore.listen(this.onStoreChange);
        AppNoticeAction.resetState();
        var appId = AppStore.getState().currentApp.id;
        var searchObj = {
            appId: appId,
            page: 1,
            pageSize: this.state.pageSize
        };
        AppNoticeAction.getAppNoticeList(searchObj);
    },

    componentWillReceiveProps: function(nextProps){
        var appId = nextProps.appId;
        if (appId != this.props.appId) {
            AppNoticeAction.resetState();
            var searchObj = {
                appId: appId,
                page: 1,
                pageSize: this.state.pageSize
            };
            AppNoticeAction.getAppNoticeList(searchObj);
        }
    },

    getAppNoticeList: function(queryParams){
        var searchObj = {
            appId: queryParams && 'appId' in queryParams ? queryParams.appId : this.props.appId,
            page: queryParams && 'page' in queryParams ? queryParams.page : this.state.curPage,
            pageSize: this.state.pageSize
        };
        AppNoticeAction.getAppNoticeList(searchObj);
    },

    handleScrollBarBottom: function(){
        // 判断加载的条件
        var totalPages = Math.ceil(this.state.total / this.state.pageSize);
        if (this.state.curPage <= totalPages ){
            this.getAppNoticeList({page: this.state.curPage});
        } else {
            this.setState({
                listenScrollBottom: false
            });
        }
    },

    //关闭
    closePanel: function(e) {
        Trace.traceEvent(e,"关闭应用公告界面");
        this.props.closeRightPanel(e);
    },

    //返回详细信息展示页
    returnInfoPanel: function(e) {
        Trace.traceEvent(e,"返回到应用详情界面");
        this.props.returnInfoPanel(e);
    },

    retryGetAppNoticeInfo: function(){
        var appId = this.props.appId;
        var searchObj = {
            appId: appId,
            page: this.state.curPage,
            pageSize: this.state.pageSize
        };
        this.getAppNoticeList(searchObj);
    },

    render: function(){
        var divHeight = $(window).height()
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM
            ;
        return (
            <div className="app-notice-style" data-tracename="应用公告界面">
                <RightPanelClose onClick={this.closePanel}/>
                {this.props.appNoticePanelShow ? (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>) : null}
                <div className="app-notice-list" style={{height: divHeight}}>
                    <GeminiScrollbar
                        handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}
                        itemCssSelector=".app-notice-item"
                    >
                        <AppNoticeList
                            list = {this.state.noticeList}
                            page = {this.state.curPage}
                            noDataShow = {this.state.noDataShow}
                            appNoticeListResult = {this.state.appNoticeListResult}
                            getAppNoticeErrorMsg = {this.state.getAppNoticeErrorMsg}
                            retryGetAppNoticeInfo = {this.retryGetAppNoticeInfo}
                        />
                    </GeminiScrollbar>

                </div>
            </div>
        );
    }
});

module.exports = AppNotice;