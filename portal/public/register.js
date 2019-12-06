require('./sources/browser.sniff');
require('./css/iconfont.less');
//注册界面
import RegisterMain from '../components/login-register/main';
import Translate from './intl/i18nTemplate';
var history = require('PUB_DIR/sources/history');
import {Router} from 'react-router-dom';

var props = {
    isCurtao: window.curtaoObj.isCurtao,
};

ReactDOM.render(<Translate Template={<Router history={history}><RegisterMain {...props}/></Router>}/>, $('#react-placeholder')[0]);