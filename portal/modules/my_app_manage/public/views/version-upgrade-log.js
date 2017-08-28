import {Validation, Form, Input, Button, Select, Icon, message} from "antd";
require("../../../../components/version-upgrade/version-upgrade-list.scss");
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var VersionUpgradeLogStore = require("../store/version-upgrade-log-store");
var VersionUpgradeLogAction = require("../action/version-upgrade-log-action");
var VersionUpgradeForm = require("./version-upgrade-form");
var VersionUpgradeList = require("../../../../components/version-upgrade");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var AppStore = require("../store/app-store");
var autosize = require("autosize");
import Trace from "LIB_DIR/trace";

//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 60,
    RIGHT_PANEL_PADDING_BOTTOM: 40
};

var VersionUpgradeLog = React.createClass({

    getDefaultProps: function () {
            return {
                appId: ""
            }
        },

    getInitialState: function () {
            return VersionUpgradeLogStore.getState();
        },

        onStoreChange: function () {
            var state = VersionUpgradeLogStore.getState();
            this.setState(state);
        },

        componentDidMount: function () {
            VersionUpgradeLogStore.listen(this.onStoreChange);
            VersionUpgradeLogAction.resetState();
            var appId = AppStore.getState().currentApp.id;
            var searchObj = {
                appId: appId,
                page: 1,
                pageSize:this.state.pageSize
            };
            VersionUpgradeLogAction.getAppRecordsList(searchObj);
        },

        componentWillReceiveProps : function (nextProps){
            var appId = nextProps.appId;
            if (appId != this.props.appId) {
                    VersionUpgradeLogAction.resetState();
                    var searchObj = {
                        appId: appId,
                        page: 1,
                        pageSize:this.state.pageSize
                    };
                    VersionUpgradeLogAction.getAppRecordsList(searchObj);
            }
        },

    addVersionUpgradeInfo: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".version-right-panel-addbtn"),"添加升级版本记录");
            this.setState({
                addVersionInfoShow: true,
                noDataShow: false
            },function(){
                autosize($('#add-version-upgrade-content'));
            });
            GeminiScrollbar.scrollTo( this.refs.scrolltoTop,0);
        },

        //关闭
        closePanel: function (e) {
            e.stopPropagation();
            Trace.traceEvent(e,"关闭版本升级界面");
            this.props.closeRightPanel();
        },

        //返回详细信息展示页
        returnInfoPanel: function (e) {
            e.stopPropagation();
            Trace.traceEvent(e,"返回到应用详情界面");
            this.props.returnInfoPanel();
        },

        getAppRecordsList : function(queryParams){
            var searchObj = {
                appId: queryParams && 'appId' in queryParams ? queryParams.appId : this.props.appId,
                page: queryParams && 'page' in queryParams ? queryParams.page : this.state.curPage,
                pageSize:this.state.pageSize
            };
            VersionUpgradeLogAction.getAppRecordsList(searchObj);
        },

        handleScrollBarBottom : function(){
            // 判断加载的条件
            var totalPages = Math.ceil(this.state.total/this.state.pageSize);
            if (this.state.curPage <= totalPages ){
                this.getAppRecordsList({page: this.state.curPage});
            } else {
                this.setState({
                    listenScrollBottom:false
                });
            }
        },

        retryGetAppRecordInfo : function(){
            var appId = this.props.appId;
            var searchObj = {
                appId: appId,
                page: this.state.curPage,
                pageSize:this.state.pageSize
            };
            this.getAppRecordsList(searchObj);
        },
    
        render: function () {
            var divHeight = $(window).height()
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM
                ;
            return (
            <div className="app-record-style" data-tracename="应用版本升级界面">
                    <RightPanelClose onClick={this.closePanel}/>
                    {(this.props.cardInfoShow || !this.props.versionUpgradeShow) ? null : (
                        <RightPanelReturn onClick={this.returnInfoPanel}/>)}
                    <div className="version-list" style={{height: divHeight}}  ref="scrolltoTop">
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                            itemCssSelector=".version-content-item"
                        >
                            {this.state.addVersionInfoShow ? (
                                <div className="add-version-upgrade-info">
                                    <VersionUpgradeForm
                                        appId={this.props.appId}
                                        addVersionInfoShow={this.state.addVersionInfoShow}
                                    />
                                </div>
                            ) : (
                                <VersionUpgradeList
                                    list = {this.state.versionList}
                                    page = {this.state.curPage}
                                    noDataShow = {this.state.noDataShow}
                                    appVersionListResult = {this.state.appVersionListResult}
                                    getAppRecordErrorMsg = {this.state.getAppRecordErrorMsg}
                                    retryGetAppRecordInfo = {this.retryGetAppRecordInfo}
                                />
                            ) }

                        </GeminiScrollbar>

                        <PrivilegeChecker check="ADD_APPLICATION_RECORD">
                            <div className="version-right-panel-addbtn" onClick={this.addVersionUpgradeInfo}>
                                <Icon type="plus"/><span>添加升级记录</span>
                            </div>
                        </PrivilegeChecker>
                    </div>

                </div>
            );
        }
});

module.exports = VersionUpgradeLog;