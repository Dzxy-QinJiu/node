require('./sources/browser.sniff');
require('./css/iconfont.less');
//用户协议界面
import UserAgreementMain from '../components/login-user-agreement/main';
import Translate from './intl/i18nTemplate';
var history = require('PUB_DIR/sources/history');
import {Router} from 'react-router-dom';

var props = {
    isCurtao: window.curtaoObj.isCurtao,
};

ReactDOM.render(<Translate Template={<Router history={history}><UserAgreementMain {...props}/></Router>}/>, $('#react-placeholder')[0]);