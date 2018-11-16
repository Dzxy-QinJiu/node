'use strict';

import Translate from '../../public/intl/i18nTemplate';
import WechatBindLoginMain from './main';

class WechatBindLogin extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Translate Template={<WechatBindLoginMain {...this.props}/>}></Translate>
        );
    }
}

module.exports = WechatBindLogin;
