// 查看版本升级日志信息

var AlertTimer = require("../alert-timer");
var Alert = require("antd").Alert;
var Spinner = require("../spinner");
var Markdown = require("../markdown");
var rightPanelUtil = require("../rightPanel");
var RightPanelAppVersionDelete = rightPanelUtil.RightPanelAppVersionDelete;
var PrivilegeChecker = require("../privilege/checker").PrivilegeChecker;
import { Modal } from 'antd';
const confirm = Modal.confirm;
var versionAjax = require("../../modules/my_app_manage/public/ajax/version-upgrade-log-ajax");
var VersionUpgradeLogAction = require("../../modules/my_app_manage/public/action/version-upgrade-log-action");
var AppStore = require("../../modules/my_app_manage/public/store/app-store");
import Trace from "LIB_DIR/trace";

var VersionUpgradeList = React.createClass({
    getInitialState: function(){
        return{
            deleteAppVersionErrMsg: ''
        };
    },
    returnMsgErrorFromServer : function(){
        if(this.props.getAppRecordErrorMsg) {
            var retry = (
                <span>
                    {this.props.getAppRecordErrorMsg}
                        <a
                            href="javascript:void(0)"
                            onClick={this.props.retryGetAppRecordInfo}
                        >
                            请重试
                        </a>
                    </span>
            );
            return <div className="alert-wrap">
                <Alert
                    message={retry}
                    type="error"
                    showIcon={true}
                />
            </div>;
        }
    },
    
    showVersionUpgradeDelete(record_id){
        Trace.traceEvent($(this.getDOMNode()).find(".app-version-delete"),"删除升级版本记录");
        confirm({
            title: '您是否确认要删除该条记录',
            onOk: ()  => {
                Trace.traceEvent($(this.getDOMNode()).find(".app-version-delete"),"确定删除升级版本记录");
                versionAjax.deleteAppVersionRecord(record_id).then((result) => {
                    // 删除版本记录成功的处理
                    if(result){
                        this.getAfreshVersionData();
                    }
                }, (errMessage) => {
                    // 删除版本记录失败的处理
                    this.setState({
                        deleteAppVersionErrMsg: errMessage
                    });
                });
            },
            onCancel: () => {
                Trace.traceEvent($(this.getDOMNode()).find(".app-version-delete"),"取消删除升级版本记录");
            }
        });
    },

    // 删除版本记录成功后，重新获取版本记录列表
    getAfreshVersionData : function(){
        var appId = AppStore.getState().currentApp.id;
        VersionUpgradeLogAction.resetState();
        var searchObj = {
            appId: appId,
            page: 1,
            pageSize:20
        };
        VersionUpgradeLogAction.getAppRecordsList(searchObj);
    },

    handleDeleteAppVersionError: function(){
       var hide = () => {
           this.setState({
               deleteAppVersionErrMsg: ''
           });
       };
        return (
            <AlertTimer
                time={3000}
                message={this.state.deleteAppVersionErrMsg}
                type="error"
                showIcon
                onHide={hide}
            />
        );
    },

    render : function(){
        if(this.props.appVersionListResult == "loading" && this.props.page == 1){
            return (<div>
                <Spinner />
            </div>);
        }
        return (
            <div className="version-content-list">
                {this.props.getAppRecordErrorMsg? (
                    this.returnMsgErrorFromServer()
                ) : null}
                {this.state.deleteAppVersionErrMsg != '' ?
                    this.handleDeleteAppVersionError() : null
                }
                { this.props.list.length > 0  ?  this.props.list.map((item, index) => {
                    var content = (item.content).replace(/\n+/g,function (ns) {
                        if(ns.length == 1){
                            return '  '+ns;
                        }
                        return ns;
                    });
                    var record_id = item.id;
                    return (
                        <div className="version-content-item" key={index}>
                            <PrivilegeChecker check={"DELETE_APPLICATION_RECORD"} className="app-version-delete">
                                <RightPanelAppVersionDelete
                                    onClick={this.showVersionUpgradeDelete.bind(this, record_id)}
                                />
                            </PrivilegeChecker>

                            <div className="upgrade-content clearfix" >升级内容：
                                <Markdown source={content}/>
                            </div>

                            { item.file_name ? (
                                <div >
                                    应用：<br />
                                    <span className="upgrade-log-upload-apk">
                                        <a href={"/rest/app/record/download_file/"+ record_id }>
                                            {item.file_name}
                                        </a>
                                        &nbsp;
                                    </span>
                                    { item.forced ? (
                                        <span
                                            className="iconfont icon-app-forced-upgrade"
                                            title="客户端强制升级"
                                        > </span>
                                    ) : null }
                                </div>
                            ): null}

                            <div className="upgrade-version">
                                {moment(item.create_date).format(oplateConsts.DATE_FORMAT)}&nbsp;&nbsp;
                                V{item.version}
                            </div>
                        </div>
                    );
                }) :  ( this.props.getAppRecordErrorMsg == '' && this.props.list.length == 0 &&  this.props.noDataShow  ?
                        (<div>
                            <Alert
                                message="该应用没有升级记录"
                                type="info"
                                showIcon={true}
                            />
                        </div> ) : null
                )}
            </div>);
    }
});

module.exports = VersionUpgradeList;