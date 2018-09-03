require('./sources/browser.sniff');
import LoginMain from '../components/Login/main';
import Translate from './intl/i18nTemplate';
var history = require('PUB_DIR/sources/history');
import {Router} from 'react-router-dom';


var props = {
    loginErrorMsg: window.Oplate.initialProps.loginErrorMsg,
    username: window.Oplate.initialProps.username,
    captchaCode: window.Oplate.initialProps.captchaCode
};

ReactDOM.render(<Translate Template={<Router history={history}><LoginMain {...props}/></Router>}/>, $('#react-placeholder')[0]);

var styleEl = document.getElementById('css-style-collector-data');

if (styleEl) {
    styleEl.remove();
}

