"use strict";
var LoginMain = require("./main");
import Translate from '../../public/intl/i18nTemplate';

class Login extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Translate>
                <LoginMain/>
            </Translate>
        );
    }
}
module.exports = Login;
