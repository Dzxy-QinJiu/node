/**
 * Created by wangliping on 2016/9/26.
 */

var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../scss/app-auth-panel-es_VE.scss");
}else if (language.lan() == "zh"){
    require("../scss/app-auth-panel-zh_CN.scss");
}
var Validation = require("antd").Validation;
var Form = require("antd").Form;
var Input = require("antd").Input;
var Select = require("antd").Select;
var Icon = require("antd").Icon;
var Option = Select.Option;
var AlertTimer = require("../../../../components/alert-timer");
var Spinner = require("../../../../components/spinner");
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var classNames = require("classnames");
var AppFormStore = require("../store/app-form-store");
var AppFormAction = require("../action/app-form-actions");
import Trace from "LIB_DIR/trace";

var LAYOUT_CONSTANTS = {
    PADDING_TOP: 20,
    TITLE_HEIGHT: 30
};

function noop() {
}

var AppAuthPanel = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function () {
        return {
            submitAppForm: noop,
            app: {
                id: '',
                name: '',
                appUrl: '',
                owner: '',
                descr: ''
            }
        };
    },

    getInitialState: function () {
        return {
            ...AppFormStore.getState(),
            appAuthArray: this.getAppAuthArray(this.props.appAuthMap)
        };
    },
    getAppAuthArray: function (appAuthMap) {
        var appAuthArray = [];
        if (_.isObject(appAuthMap)) {
            for (var key in appAuthMap) {
                //一个url对应一个或多个请求方式的处理
                if (appAuthMap[key] && _.isString(appAuthMap[key])) {
                    appAuthMap[key].split(",").forEach(function (method) {
                        appAuthArray.push({
                            apiMethod: method,
                            apiUrl: key
                        });
                    });
                }
            }
        }
        return appAuthArray;
    },
    componentWillReceiveProps: function (nextProps) {
        //this.refs.validation.reset();
        var stateData = this.getInitialState();
        stateData.appAuthArray = this.getAppAuthArray(nextProps.appAuthMap);
        this.setState(stateData);
    },
    onChange: function () {
        this.setState(AppFormStore.getState());
    },
    componentWillUnmount: function () {
        AppFormStore.unlisten(this.onChange);
    },
    componentDidMount: function () {
        var _this = this;
        AppFormStore.listen(_this.onChange);
    },

    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    handleCancel: function (e) {
        e.preventDefault();
        Trace.traceEvent(e,"取消添加应用权限信息");
        this.props.returnInfoPanel();
    },

    handleSubmit: function (e) {
        e.preventDefault();
        Trace.traceEvent(e,"保存添加应用权限信息");
        var appAuthMap = {};
        var hasAppAuthApi = false;
        //遍历权限服务地址 [{url:‘urlVal’，method：‘methodVal’},..]数组,转成后台接口参数所需{urlVal:methodVal,..}对象
        this.state.appAuthArray.forEach(function (appAuth, index) {
            if (appAuth.apiUrl) {
                hasAppAuthApi = true;
                //同一地址不同方法的处理
                if (appAuthMap[appAuth.apiUrl]) {
                    //如果已有该路径，该路径对应的value中没有当前方法名，则value+=,method
                    if (appAuthMap[appAuth.apiUrl].indexOf(appAuth.apiMethod) < 0) {
                        appAuthMap[appAuth.apiUrl] += "," + appAuth.apiMethod;
                    }
                } else {
                    //不存在该路径时，该路径对应的value就是其方法名
                    appAuthMap[appAuth.apiUrl] = appAuth.apiMethod;
                }
            }
        });
        //设置正在保存中
        AppFormAction.setSaveFlag(true);
        AppFormAction.editApp({id: this.props.appId, appAuthMap: JSON.stringify(appAuthMap)});
    },

    //关闭
    closePanel: function (e) {
        e.stopPropagation();
        Trace.traceEvent(e,"关闭应用权限");
        this.props.closeRightPanel();
        AppFormAction.setEditAppAuthFlag(false);
    },

    //返回详细信息展示页
    returnInfoPanel: function (e) {
        e.stopPropagation();
        Trace.traceEvent(e,"返回到应用详情");
        this.props.returnInfoPanel();
        AppFormAction.setEditAppAuthFlag(false);
    },

    //去掉保存后提示信息
    hideSaveTooltip: function () {
        AppFormAction.resetSaveResult(this.state.saveResult, true);
    },

    //更新服务地址,i:当前修改的是第几个地址，newVal:修改后的url/method,type:当前修改的是url还是method
    updatePermissionApiObj: function (i, newVal, type) {
        var permissionApiArray = this.state.appAuthArray || [];
        //找到数组中对应的对象，更新method/url
        if (permissionApiArray[i] && _.isObject(permissionApiArray[i])) {
            if (type == "url") {
                if (newVal) {
                    delete permissionApiArray[i].isNull;
                } else if (i == 0) {
                    //服务地址url为空时，必填一项的验证
                    permissionApiArray[i].isNull = true;
                }
                permissionApiArray[i].apiUrl = newVal;
            } else {
                permissionApiArray[i].apiMethod = newVal || "PUT";
            }
            this.state.appAuthArray = permissionApiArray;
            this.setState({
                appAuthArray: this.state.appAuthArray
            });
        }
    },
    //选择服务地址的请求方式的处理
    onPermissionSelect: function (index, selectVal) {
        this.updatePermissionApiObj(index, selectVal, "method");
    },
    //服务地址输入的处理
    onPermissionInputChange: function (index, event) {
        var newKey = event.target.value;
        this.updatePermissionApiObj(index, newKey, "url");
    },
    //添加一个服务地址的处理
    addPermissionApi: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".add-permission-inputgroup-btn"),"添加服务地址");
        var permissionApiArray = this.state.appAuthArray || [];
        permissionApiArray.push({
            apiUrl: "",
            apiMethod: "PUT"
        });
        this.state.appAuthArray = permissionApiArray;
        this.setState({
            appAuthArray: this.state.appAuthArray
        });
    },
    //删除服务地址
    delPermissionApi: function (index, event) {
        Trace.traceEvent($(this.getDOMNode()).find(".del-permission-inputgroup-btn"),"删除服务地址");
        var value = event.target.value;
        if (value) {
            return;
        }
        var permissionApiArray = this.state.appAuthArray || [];
        if (permissionApiArray[index]) {
            permissionApiArray.splice(index, 1);
            this.state.appAuthArray = permissionApiArray;
            this.setState({
                appAuthArray: this.state.appAuthArray
            });
        }
    },
    renderPermissionApiItem: function (permissionApi, index, permissionApiLen) {
        var onlyOneItem = index == 0 && index == permissionApiLen - 1;//只有一条服务地址,并且地址为空时不展示删除按钮
        return (<div className="permission-api-item" key={index}>
            <Select size="large"
                    name="permissionApisVal" onChange={this.onPermissionSelect.bind(this,index)}
                    value={permissionApi.apiMethod}>
                <Option value="PUT">PUT</Option>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="DELETE">DELETE</Option>
            </Select>
            <Input name="permissionApisKey" id="permissionApisKey"
                   value={permissionApi.apiUrl}
                   onChange={this.onPermissionInputChange.bind(this,index)}
            />
            <div className="permission-inputgroup-btns-div">
                {onlyOneItem && !permissionApi.apiUrl ? null : (
                    <Icon type="minus" className="del-permission-inputgroup-btn permission-inputgroup-btn"
                          onClick={this.delPermissionApi.bind(this,index)}/>)}
                {(index == permissionApiLen - 1) ? (
                    <Icon type="plus" className="add-permission-inputgroup-btn permission-inputgroup-btn"
                          onClick={this.addPermissionApi}/>) : null}
            </div>
        </div>);
    },
    renderAppAuthApis: function () {
        var appAuthArray = this.state.appAuthArray;
        var appAuthEle = [];
        var _this = this;
        if (_.isArray(appAuthArray) && appAuthArray.length > 0) {
            //如果权限服务地址数组有数据，则遍历数组中的服务地址对象进行渲染展示
            appAuthEle = appAuthArray.map(function (appAuth, index) {
                if (_.isObject(appAuth)) {
                    return _this.renderPermissionApiItem(appAuth, index, appAuthArray.length);
                }
            });
        } else {
            //如果权限服务地址数组没有数据
            var appAuth = {apiMethod: "PUT", apiUrl: ""};
            //权限服务地址数组中默认加入一个服务地址对象
            this.state.appAuthArray = [appAuth];
            //默认渲染一个空的服务地址url输入框和method选择框
            appAuthEle.push(_this.renderPermissionApiItem(appAuth, 0, 1));
        }
        return appAuthEle;
    },
    //展示添加、编辑权限面板
    showEditAuthPanel: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".app-auth-api-container"),"修改权限");
        if (this.state.isEditAppAuth) {
            return;
        }
        AppFormAction.setEditAppAuthFlag(true);
    },
    hideEditAuthPanel: function (e) {
        Trace.traceEvent(e,"取消修改应用权限信息");
        AppFormAction.setEditAppAuthFlag(false);
        this.setState({appAuthArray: this.getAppAuthArray(this.props.appAuthMap)});
    },
    renderAppAuthLi: function () {
        var appAuthLi = [], appAuthArray = this.state.appAuthArray;
        if (appAuthArray && appAuthArray.length > 0) {
            appAuthArray.forEach(function (appAuth) {
                if (appAuth.apiUrl) {
                    appAuthLi.push(<div className="app-auth-api-item">
                        <span className="api-item-left">{appAuth.apiMethod} </span>
                        <span className="api-item-right">{appAuth.apiUrl} </span>
                    </div>);
                }
            });
            if (appAuthLi.length == 0) {
                appAuthLi = (<div className="no-api-data">
                    <ReactIntl.FormattedMessage
                        id="my.app.no.auth"
                        defaultMessage={`暂无数据，{clickTips}`}
                        values={{
                           "clickTips":  <a onClick={this.showEditAuthPanel}>{Intl.get("my.app.click.add", "点击添加")}</a>
                          }}
                    />
                </div>);
            }
        } else {
            appAuthLi = (<div className="no-api-data">
                <ReactIntl.FormattedMessage
                    id="my.app.no.auth"
                    defaultMessage={`暂无数据，{clickTips}`}
                    values={{
                           "clickTips":  <a onClick={this.showEditAuthPanel}>{Intl.get("my.app.click.add", "点击添加")}</a>
                          }}
                />
            </div>);
        }
        return appAuthLi;
    },

    render: function () {
        var editClassName = classNames("iconfont icon-update", {
            "edit-btn-active": this.state.isEditAppAuth
        });
        var appAuthArray = this.state.appAuthArray, appAuthMap = this.props.appAuthMap;
        var apiLiHeight = $("body").height() - 3 * LAYOUT_CONSTANTS.PADDING_TOP - 2 * LAYOUT_CONSTANTS.TITLE_HEIGHT;
        return (
            <div data-tracename="应用权限界面">
                <RightPanelClose onClick={this.closePanel}/>
                {this.props.appAuthPanelShow ? (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>) : null}
                <div className="app-auth-api-container">
                    <div className="app-auth-api-title">
                        {Intl.get("rightpanel_app_auth","应用权限")}{appAuthMap && !_.isEmpty(appAuthMap) ? (
                        <span className={editClassName} onClick={this.showEditAuthPanel}/>) : null}
                    </div>
                    <div className="app-auth-api-content">
                        {(appAuthArray && appAuthArray.length > 0 && appAuthArray[0].apiUrl) || this.state.isEditAppAuth ? (
                            <div className="api-header"><span>{Intl.get("my.app.auth.method","请求方式")}</span><span>{Intl.get("my.app.auth.path","请求路径")}</span></div>) : null}
                        <div className="api-body" style={{height:apiLiHeight}}>
                            <GeminiScrollbar className="geminiScrollbar-vertical">
                                {this.state.isEditAppAuth ? (<div>
                                    {this.renderAppAuthApis()}
                                    <div className="save-btn-container">
                                        <RightPanelCancel onClick={this.hideEditAuthPanel}>
                                            <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                        </RightPanelCancel>
                                        <RightPanelSubmit onClick={this.handleSubmit}>
                                            <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                                        </RightPanelSubmit>
                                        <div className="indicator">
                                            {this.state.saveResult ?
                                                (
                                                    <AlertTimer time={this.state.saveResult=="error"?3000:600}
                                                                message={this.state.saveMsg}
                                                                type={this.state.saveResult} showIcon
                                                                onHide={this.hideSaveTooltip}/>
                                                ) : ""
                                            }
                                        </div>
                                    </div>
                                </div>) : this.renderAppAuthLi()}
                            </GeminiScrollbar>
                        </div>
                    </div>
                    {this.state.isSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : null}
                </div>
            </div>
        );
    }
});

module.exports = AppAuthPanel;
