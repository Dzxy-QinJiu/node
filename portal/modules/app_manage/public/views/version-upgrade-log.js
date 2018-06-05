require('../../../../components/version-upgrade/version-upgrade-list.less');
var Alert = require('antd').Alert;
var rightPanelUtil = require('../../../../components/rightPanel');
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var VersionUpgradeLogStore = require('../store/version-upgrade-log-store');
var VersionUpgradeLogAction = require('../action/version-upgrade-log-action');
var VersionUpgradeList = require('../../../../components/version-upgrade');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var AppStore = require('../store/app-store');
import Trace from 'LIB_DIR/trace';

//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 60,
    RIGHT_PANEL_PADDING_BOTTOM: 20
};

var VersionUpgradeLog = React.createClass({

    getDefaultProps: function(){
        return {
            appId: ''
        };
    },

    getInitialState: function(){
        return VersionUpgradeLogStore.getState();
    },

    onStoreChange: function() {
        var state = VersionUpgradeLogStore.getState();
        this.setState(state);
    },
    componentDidMount: function() {
        VersionUpgradeLogStore.listen(this.onStoreChange);
        VersionUpgradeLogAction.resetState();
        var appId = AppStore.getState().currentApp.id;
        var searchObj = {
            appId: appId,
            page: 1,
            pageSize: this.state.pageSize
        };
        VersionUpgradeLogAction.getAppRecordsList(searchObj);
    },


    componentWillReceiveProps: function(nextProps){
        var appId = nextProps.appId;
        if ( appId != this.props.appId){
            VersionUpgradeLogAction.resetState();
            var searchObj = {
                appId: appId,
                page: 1,
                pageSize: this.state.pageSize
            };
            VersionUpgradeLogAction.getAppRecordsList(searchObj);
        }
    },
    

    //关闭
    closePanel: function(e) {
        Trace.traceEvent(e,'关闭版本升级界面');
        this.props.closeRightPanel(e);
    },

    //返回详细信息展示页
    returnInfoPanel: function(e) {
        Trace.traceEvent(e,'返回到应用详情界面');
        this.props.returnInfoPanel(e);
    },

    getAppRecordsList: function(queryParams){
        var searchObj = {
            appId: queryParams && 'appId' in queryParams ? queryParams.appId : this.props.appId,
            page: queryParams && 'page' in queryParams ? queryParams.page : this.state.curPage,
            pageSize: this.state.pageSize
        };
        VersionUpgradeLogAction.getAppRecordsList(searchObj);
    },

    handleScrollBarBottom: function(){
        // 判断加载的条件
        var totalPages = Math.ceil(this.state.total / this.state.pageSize);
        if (this.state.curPage <= totalPages ){
            this.getAppRecordsList({page: this.state.curPage});
        } else {
            this.setState({
                listenScrollBottom: false
            });
        }
    },

    retryGetAppRecordInfo: function(){
        var appId = this.props.appId;
        var searchObj = {
            appId: appId,
            page: this.state.curPage,
            pageSize: this.state.pageSize
        };
        this.getAppRecordsList(searchObj);
    },
    
    render: function() {
        var className = 'app-record-style right-panel-content';
        if(this.props.versionUpgradeShow){
            className += ' right-panel-content-slide';
        }
        var divHeight = $(window).height()
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM 
            ;
        return (
            <div className={className} data-tracename="版本升级记录界面">
                <RightPanelClose onClick={this.closePanel}/>
                {(this.props.cardInfoShow || !this.props.versionUpgradeShow) ? null : (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>)}
                <div className="version-list" style={{height: divHeight}}>
                    <GeminiScrollbar
                        handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}
                        itemCssSelector=".version-content-item"
                    >
                        <VersionUpgradeList
                            list = {this.state.versionList}
                            page = {this.state.curPage}
                            noDataShow = {this.state.noDataShow}
                            appVersionListResult = {this.state.appVersionListResult}
                            getAppRecordErrorMsg = {this.state.getAppRecordErrorMsg}
                            retryGetAppRecordInfo = {this.retryGetAppRecordInfo}
                        />
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});

module.exports = VersionUpgradeLog;