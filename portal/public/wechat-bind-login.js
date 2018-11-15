require('./sources/browser.sniff');
require('./css/iconfont.less');
//curtao的登录界面
import WechatBindLoginMain from '../components/wechat-bind-login/main';
import Translate from './intl/i18nTemplate';
var history = require('PUB_DIR/sources/history');
import {Router} from 'react-router-dom';


var props = {
    loginErrorMsg: window.Oplate.initialProps.loginErrorMsg
};

ReactDOM.render(<Translate Template={<Router history={history}><WechatBindLoginMain {...props}/></Router>}/>, $('#react-placeholder')[0]);

var styleEl = document.getElementById('css-style-collector-data');

if (styleEl) {
    styleEl.remove();
}

