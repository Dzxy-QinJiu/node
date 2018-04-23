/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/7/11.
 */
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var AppAction = require("./../action/app-actions");
var AppStore = require("./../store/app-store");
var Alert = require("antd").Alert;
var Spinner = require("../../../../components/spinner");
require('../css/app-code-trace.less');
import CopyToClipboard from 'react-copy-to-clipboard';
import {Icon} from 'antd';
var AppCodeTrace = React.createClass({
    getInitialState: function () {
        return AppStore.getState();
    },

    onChange: function () {
        this.setState(AppStore.getState());
    },
    componentDidMount: function () {
        AppStore.listen(this.onChange);
        var appId = this.props.appId;
        AppAction.getCurAppKeyById(appId);

    },
    componentWillReceiveProps : function (nextProps){
        var appId = nextProps.appId;
        if (appId != this.props.appId) {
            AppAction.getCurAppKeyById(appId);
        }
    },
    renderContent:function () {
        var key = this.state.appPiwikKey;
        var text = `
        <!-- Oplate Track -->
            <script type="text/javascript">
              var _paq = _paq || [];
              // tracker methods like "setCustomDimension" should be called before "trackPageView"
              _paq.push(['setAppData','key','${key}']);
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              _paq.push(['setTrackerUrl', 'http://collector-piwik.antfact.com/piwik']);
              (function() {
                var u="https://oplate.antfact.com/";
                _paq.push(['setSiteId', '1']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'resources/piwik.js'; s.parentNode.insertBefore(g,s);
              })();
            </script>
        <!-- End Oplate Track Code -->
        `;
        var tip = Intl.get("app.insert.code","我们建议您将下面的代码插入到<head>标签中。");
        return(
            <div className="app-code-trace-container">
                <div className="topcontainer">
                    <RightPanelClose onClick={this.props.closeRightPanel}/>
                    <RightPanelReturn onClick={this.props.returnInfoPanel}/>
                </div>
                <div className="app-code-trace-content">

                <div className="app-code-trace">
                    <h3>{Intl.get("rightpanel_codetrace","跟踪代码")}</h3>
                    <p className="app-code-tip">{tip}</p>
                    <div className="app-code-block">
                        <pre>
                            <CopyToClipboard text={text}>
                                         <Icon type="copy" style={{cursor: 'pointer'}}
                                               title={Intl.get("user.log.copy", "点击可复制")}/>
                                     </CopyToClipboard>
                            <div className="app-code">
                                {text}
                            </div>
                        </pre>
                    </div>
                </div>
                </div>

            </div>
        );
    },
    retryGetAppKey:function () {
        var appId = this.props.appId;
        AppAction.getCurAppKeyById(appId);
    },
    renderCodeContent:function () {
        if (this.state.getPiwikKeyLoading) {
            return (<Spinner />);
        }else if (this.state.appPiwikKeyErrMsg){
            //加载完成，出错的情况
            var errMsg = <span>{this.state.appPiwikKeyErrMsg}
                        <a onClick={this.retryGetAppKey} style={{marginLeft:"20px",marginTop:"20px"}}>
                        <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
                        </a>
                         </span>;
            return (
                <div className="alert-wrap">
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }else{
            return this.renderContent();
        }

    },
    render:function () {
        return(
            <div className="code-container">
                {this.renderCodeContent()}
            </div>
        );
    }
});
module.exports = AppCodeTrace;