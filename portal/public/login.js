require("./sources/browser.sniff");
import LoginMain from "../components/Login/main";
import Translate from './intl/i18nTemplate';
var props = {
    loginErrorMsg: window.Oplate.initialProps.loginErrorMsg,
    username: window.Oplate.initialProps.username,
    captchaCode: window.Oplate.initialProps.captchaCode
};

ReactDOM.render(<Translate Template={<LoginMain {...props}/>}/>, $('#react-placeholder')[0]);

var styleEl = document.getElementById("css-style-collector-data");

if (styleEl) {
    styleEl.remove();
}

