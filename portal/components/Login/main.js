import "./style.less";
const QRCode = require('qrcode.react');
const classnames = require("classnames");
const Logo = require("../Logo");
const LoginForm = require("./login-form");
const ForgotPassword = require("./forgot-password");
import {Alert} from "antd";
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from "../../lib/websso";

const LANGUAGES = [
    {code: "zh_CN", name: "简体中文"},
    {code: "en_US", name: "English"},
    {code: "es_VE", name: "Español"},
];

const VIEWS = {
    LOGIN: "login",
    FORGOT_PASSWORD: "forgot_password",
};

class LoginMain extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentView: VIEWS.LOGIN,
            errorMsg: this.props.loginErrorMsg,
            //展示界面
            showUi: false,
            //验证码
            captcha: ""
        };

        this.setErrorMsg = this.setErrorMsg.bind(this);
    }

    changeView(view) {
        this.setState({currentView: view, errorMsg: ""});
    }

    setErrorMsg(errorMsg) {
        this.setState({errorMsg});
    }


    componentDidMount() {
        //如果尚未进行ssocheck
        if (!window.Oplate.stopcheck) {
            this.ssoCheck(this.show.bind(this));
        } else {
            this.show();
        }
    }

    //检测是否已经sso登录
    ssoCheck(callback) {
        var lang = window.Oplate && window.Oplate.lang || "zh_CN";
        //2. 在登录界面显示前，检测当前 SSO 是否已经登录
        ssoLogin.check().then((ticket) => {
            // SSO已成功登录成功的回调（因为这里拿到了 ticket, 所以这时候应该重定向到 callBackUrl 地址中）
            window.location.href = callBackUrl + "?t=" + ticket + "&lang=" + lang;
        }).catch((data) => {
            // SSO尚未登录的回调（ data.captcha 为图片验证码的 base64）
            callback(data.captcha);
        });
    }

    //展示界面
    show(captcha) {
        this.setState({
            showUi: true,
            captcha: captcha ? captcha : ""
        });
    }

    render() {
        //如果是初次渲染不展示表单，直接sso校验
        if (!this.state.showUi) {
            return (<div className="login-wrap"></div>);
        } else {
            const hasWindow = !(typeof window === "undefined");

            function getLangClassName(lang) {
                const isSelected = hasWindow && Oplate.lang === lang || false;
                return classnames("lang-btn", {"lang-selected": isSelected});
            }

            return (
                <div className="login-wrap">
                    { hasWindow ? (Oplate.hideLangQRcode ? null :
                        (<div>
                            <div className="lang-wrap">
                                <span>{Intl.get("common.user.lang", "语言")}：</span>
                                {LANGUAGES.map(lang => {
                                    return <span><a href={`/login?lang=${lang.code}`}
                                                    className={getLangClassName(lang.code)}>{lang.name}</a></span>
                                })}
                            </div>
                            <div className="code-wrap">
                                <p>
                                    {Intl.get("menu.download.app", "客套APP")}
                                </p>
                                {typeof window === "undefined" ? null : (
                                    <QRCode
                                        value={location.protocol + "//" + location.host + "/ketao"}
                                        level="H"
                                        size={100}
                                    />
                                )}
                            </div>
                        </div>)) : null
                    }

                    <div className="form-wrap">
                        <div className="logo-wrap">
                            <Logo />
                        </div>

                        {this.state.currentView === VIEWS.LOGIN ? (
                            <LoginForm
                                captcha={this.state.captcha}
                                hasWindow={hasWindow}
                                setErrorMsg={this.setErrorMsg}
                                {...this.props}
                            />
                        ) : null}

                        {this.state.currentView === VIEWS.FORGOT_PASSWORD ? (
                            <ForgotPassword
                                hasWindow={hasWindow}
                                setErrorMsg={this.setErrorMsg}
                                {...this.props}
                            />
                        ) : null}

                        {this.state.errorMsg ? (
                            <Alert message={this.state.errorMsg} type="error" showIcon/>
                        ) : null}

                        {this.state.currentView === VIEWS.LOGIN ? (
                            <div tabIndex="5" onClick={this.changeView.bind(this, VIEWS.FORGOT_PASSWORD)}
                                 onKeyPress={this.changeView.bind(this, VIEWS.FORGOT_PASSWORD)}
                                 className="btn-change-view">{Intl.get("login.forgot_password", "忘记密码")}</div>
                        ) : (
                            <div tabIndex="5" onClick={this.changeView.bind(this, VIEWS.LOGIN)}
                                 onKeyPress={this.changeView.bind(this, VIEWS.LOGIN)}
                                 className="btn-change-view">{Intl.get("login.return_to_login_page", "返回登录页")}</div>
                        )}
                    </div>
                </div>
            );
        }
    }
}

export default LoginMain;
