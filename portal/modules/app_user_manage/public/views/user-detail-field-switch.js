//用户详情添加switch切换逻辑
var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../css/user-detail-field-switch-es_VE.less");
}else if (language.lan() == "zh"){
    require("../css/user-detail-field-switch-zh_CN.less");
}

var AppUserAjax = require("../ajax/app-user-ajax");
var Icon = require("antd").Icon;
var AlertTimer = require("../../../../components/alert-timer");
/**
 * is_two_factor 二步认证
 * mutilogin     多人登录
 * over_draft    过期停用
 * status        开启状态
 */

const CLS = 'user-detail-field-switch';

var Switch = require("antd").Switch;
var UserDetailFieldSwitch = React.createClass({
    //获取默认属性
    getDefaultProps : function() {
        return {
            //用户id
            userId : '',
            //应用id
            appId : '',
            //属性原始值
            originValue : '0',
            //选中状态下对应的值
            checkedValue : '1',
            //未选中状态下对应的值
            unCheckedValue : '0',
            //开启文字
            checkedChildren : Intl.get("user.open.code", "开"),
            //关闭文字
            unCheckedChildren : Intl.get("user.close.code", "关"),
            //选中状态下提交的值
            checkedSubmitValue : '1',
            //未选中状态下提交的值
            unCheckedSubmitValue : '0',
            //字段
            field : 'status',
            //修改成功之后的回调
            onSubmitSuccess : function() {}
        };
    },
    componentWillReceiveProps : function(nextProps) {
        if(nextProps.originValue != this.props.originValue) {
            this.setState({
                value : nextProps.originValue
            });
        }
    },
    getInitialState : function() {
        return {
            timeout : null,
            resultType : '',
            errorMsg : '',
            value : this.props.originValue
        };
    },
    //获取提交对象
    getSubmitObj : function() {
        //user_id和client_id是必传项
        var submitObj = {
            user_id : this.props.userId,
            client_id : this.props.appId
        };
        //当前是否选中
        var checked = this.state.value == this.props.checkedValue;
        //添加提交字段
        submitObj[this.props.field] = checked ? this.props.checkedSubmitValue : this.props.unCheckedSubmitValue;
        return submitObj;
    },
    //发送ajax
    sendAjax : function() {
        this.setState({
            resultType : 'loading',
            errorMsg : ''
        });
        var submitObj = this.getSubmitObj();
        //保留this
        var _this = this;
        //提交数据
        AppUserAjax.editAppField(submitObj).then(function(result) {
            _this.setState({
                resultType : '',
                errorMsg : ''
            });
            //multilogin这个字段太各应了！覃璐和郑鹏飞都写的是错的
            var successObj = {
                user_id : submitObj.user_id,
                client_id : submitObj.client_id
            };
            var field = _this.props.field;
            if(field !== 'mutilogin') {
                successObj[field] = submitObj[field];
            } else {
                successObj.multilogin = submitObj[field];
            }
            //回调外层函数
            _this.props.onSubmitSuccess(successObj);
        },function(errorMsg) {
            _this.setState({
                resultType : 'error',
                errorMsg : errorMsg
            });
        });
    },
    //当选项改变的时候，发送请求
    onSwitchChange : function(checked) {
        this.setState({
            value : checked ? this.props.checkedValue : this.props.unCheckedValue
        });
        clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(this.sendAjax , 500);
    },
    onHideAlert : function() {
        this.setState({
            resultType : '',
            value : this.props.originValue
        });
    },
    render : function() {
        if(this.state.resultType === 'loading') {
            return <div className={CLS}><Icon type="loading" /></div>;
        }
        if(this.state.resultType === 'error') {
            return <div  className={CLS}><AlertTimer time={2000} message={this.state.errorMsg} type="error" onHide={this.onHideAlert} showIcon/></div>;
        }
        return (
            <div className={CLS}>
                <Switch
                    checked={this.state.value == this.props.checkedValue}
                    checkedChildren={this.props.checkedChildren}
                    unCheckedChildren={this.props.unCheckedChildren}
                    onChange={this.onSwitchChange}
                />
            </div>
        );
    }
});

module.exports = UserDetailFieldSwitch;