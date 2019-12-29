require('./sources/browser.sniff');
require('./css/iconfont.less');
//隐私政策界面
import PrivacyPolicyMain from '../components/login-privacy-policy/main';
import Translate from './intl/i18nTemplate';
var history = require('PUB_DIR/sources/history');
import {Router} from 'react-router-dom';

var props = {
    isCurtao: window.curtaoObj.isCurtao,
};

ReactDOM.render(<Translate Template={<Router history={history}><PrivacyPolicyMain {...props}/></Router>}/>, $('#react-placeholder')[0]);