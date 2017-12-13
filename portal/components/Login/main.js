import "./style.less";
const QRCode = require('qrcode.react');
const classnames = require("classnames");
const Logo = require("../Logo");
const LoginForm = require("./login-form");
const ForgotPassword = require("./forgot-password");

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
        }
    }

    changeView(view) {
        this.setState({currentView: view});
    }

    render() {
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
                            return <span><a href={`/login?lang=${lang.code}`} className={getLangClassName(lang.code)}>{lang.name}</a></span>
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
    
                    {this.state.currentView === VIEWS.LOGIN? (
                    <LoginForm
                        hasWindow={hasWindow}
                        views={VIEWS}
                        changeView={this.changeView.bind(this)}
                        {...this.props}
                    />
                    ) : null}
    
                    {this.state.currentView === VIEWS.FORGOT_PASSWORD? (
                    <ForgotPassword
                        hasWindow={hasWindow}
                        views={VIEWS}
                        changeView={this.changeView.bind(this)}
                        {...this.props}
                    />
                    ) : null}
    
                </div>
            </div>
        );
    }
}

export default LoginMain;
