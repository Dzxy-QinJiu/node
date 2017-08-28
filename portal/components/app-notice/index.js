// 查看系统公告信息
var Alert = require("antd").Alert;
// 加载时的动作显示
var Spinner = require("../spinner");
var AppNoticeList = React.createClass({

    returnMsgErrorFromServer : function(){
        if(this.props.getAppNoticeErrorMsg) {
            var retry = (
                <span>
                    {this.props.getAppNoticeErrorMsg}
                        <a
                            href="javascript:void(0)"
                            onClick={this.props.retryGetAppNoticeInfo}
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
            </div>
        }
    },
    
    render : function(){
        if(this.props.appNoticeListResult == "loading" && this.props.page == 1){
            return (<div>
                <Spinner />
            </div>);
        }
        return (
            <div className="app-notice-list">
                {this.props.getAppNoticeErrorMsg? (
                    this.returnMsgErrorFromServer()
                ) : null}
                { this.props.list.length > 0  ?  this.props.list.map(function(item, index){
                    return (
                        <div className="app-notice-item" key={index}>
                            {item.type == "upgrade-notice" ? (
                                <div className="app-notice-content">升级公告：<br />
                                    <pre className="display-notice-style">
                                        {item.content}
                                    </pre>
                                </div>
                            ) : (item.type == "maintain-notice" ? (
                                <div className="app-notice-content">维护公告：<br />
                                    <pre className="display-notice-style">
                                        {item.content}
                                    </pre>
                                </div>
                            ) : (item.type == "fault-notice" ? (
                                <div className="app-notice-content">故障公告：<br />
                                    <pre className="display-notice-style">
                                        {item.content}
                                    </pre>
                                </div>
                            ) : (
                                <div className="app-notice-content">系统通知：<br />
                                    <pre className="display-notice-style">
                                        {item.content}
                                    </pre>
                                </div>
                            )))}
                            <div className="app-notice-type">
                                {moment(item.create_date).format(oplateConsts.DATE_FORMAT)}&nbsp;&nbsp;
                            </div>
                        </div>
                    );
                }) :  ( this.props.getAppNoticeErrorMsg == '' && this.props.list.length == 0 &&  this.props.noDataShow  ?
                        (<div>
                            <Alert
                                message="该应用没有公告"
                                type="info"
                                showIcon={true}
                            />
                        </div> ) : null
                )}
        </div>);
    }
});

module.exports = AppNoticeList;
