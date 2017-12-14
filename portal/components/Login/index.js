"use strict";

import Translate from '../../public/intl/i18nTemplate';
import LoginMain from "./main";

class Login extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Translate Template={<LoginMain/>}></Translate>
        );
    }
}

module.exports = Login;
