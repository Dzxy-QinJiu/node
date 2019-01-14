require('./sources/browser.sniff');
require('./css/iconfont.less');
//ketao的登录界面
import LoginMain from '../components/Login/main';
import Translate from './intl/i18nTemplate';
var history = require('PUB_DIR/sources/history');
import {Router} from 'react-router-dom';


var props = {
    loginErrorMsg: window.Oplate.initialProps.loginErrorMsg,
    username: window.Oplate.initialProps.username,
    captchaCode: window.Oplate.initialProps.captchaCode,
    isBindWechat: window.Oplate.initialProps.isBindWechat,
    isWechatRegisterError: window.Oplate.initialProps.isWechatRegisterError,
};

ReactDOM.render(<Translate Template={<Router history={history}><LoginMain {...props}/></Router>}/>, $('#react-placeholder')[0]);