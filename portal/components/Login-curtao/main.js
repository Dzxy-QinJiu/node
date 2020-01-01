var React = require('react');
import './style.less';
import './index.less';

const PropTypes = require('prop-types');
const classnames = require('classnames');
const LoginForm = require('./login-form');
import LoginLogo from '../login-logo';
import {Alert, Tabs, Icon, Button} from 'antd';
import {ssoLogin, callBackUrl} from '../../lib/websso';
import SideBar from '../side-bar';

const TabPane = Tabs.TabPane;
var Spinner = require('../spinner');
const USER_LANG_KEY = 'userLang';//存储用户语言环境的key
import {storageUtil} from 'ant-utils';

class LoginMain extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errorMsg: this.props.loginErrorMsg,
            //展示界面
            showUi: false,
            //验证码
            captcha: this.props.captchaCode || '',
        };

        this.setErrorMsg = this.setErrorMsg.bind(this);
    }

    componentDidMount() {
        //如果使用sso
        if (window.Oplate.useSso) {
            //如果尚未进行ssocheck
            if (!window.Oplate.stopcheck) {
                this.ssoCheck(this.show.bind(this));
            } else {
                this.show();
            }
        } else {
            //不是用sso登录，则直接显示登录界面
            this.show();
        }
        Trace.addEventListener(window, 'click', Trace.eventHandler);
    }

    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
    }

    setErrorMsg(errorMsg) {
        this.setState({errorMsg});
    }
    //检测是否已经sso登录
    ssoCheck(callback) {
        var lang = window.Oplate && window.Oplate.lang || 'zh_CN';
        //2. 在登录界面显示前，检测当前 SSO 是否已经登录
        ssoLogin.quickLogin().then((ticket) => {
            // SSO已成功登录成功的回调（因为这里拿到了 ticket, 所以这时候应该重定向到 callBackUrl 地址中）
            sendMessage && sendMessage('sso已登录,ticket=' + ticket);
            window.location.href = callBackUrl + '?t=' + ticket + '&lang=' + lang;
        }).catch((data) => {
            sendMessage && sendMessage('sso登录检查失败');
            // SSO尚未登录的回调（ data.captcha 为图片验证码的 base64）
            callback(data.captcha);
        });
    }

    //展示界面
    show(captcha) {
        var lang = storageUtil.local.get(USER_LANG_KEY);
        //之前设置过语言，且没有默认语言设置时,使用设置的语言，重新渲染界面（后端渲染部分）
        if (lang && !Oplate.lang) {
            window.location.href = '/login?lang=' + lang;
        } else {
            this.setState({
                showUi: true,
                captcha: captcha ? captcha : this.state.captcha
            });
        }
    }

    render() {
        //如果是初次渲染不展示表单;
        //如果有错误信息，则不显示loading状态
        if (!this.state.showUi) {
            return (<div className="login-wrap">
                {this.state.errorMsg ? null : <Spinner className="isloading"/>}
            </div>);
        } else {
            const hasWindow = !(typeof window === 'undefined');
            return (
                <div className="login-wrap" data-tracename="登录界面">
                    {hasWindow ? (
                        <div className="csm-form-wrap">
                            <div className="form-wrap">
                                <LoginLogo/>
                                <LoginForm
                                    captcha={this.state.captcha}
                                    hasWindow={hasWindow}
                                    setErrorMsg={this.setErrorMsg}
                                    {...this.props}
                                />
                                {this.state.errorMsg ?
                                    <div className="login-error-tip"><span className="iconfont icon-warn-icon"></span>{this.state.errorMsg}</div> : null}
                            </div>
                        </div>
                    ) : null
                    }
                    <SideBar showChat={Oplate.isCurtao}></SideBar>
                </div>
            );
        }
    }
}

LoginMain.propTypes = {
    loginErrorMsg: PropTypes.string,
    captchaCode: PropTypes.string
};
export default LoginMain;
