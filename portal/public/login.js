require("./sources/browser.sniff");
var LoginDetail = require("../components/Login/LoginDetail");
import Translate from './intl/i18nTemplate';
var props = {
    loginErrorMsg: window.Oplate.initialProps.loginErrorMsg,
    username: window.Oplate.initialProps.username,
    captchaCode: window.Oplate.initialProps.captchaCode
};

ReactDOM.render(<Translate Template={<LoginDetail {...props}/>}/>, $('#react-placeholder')[0]);
