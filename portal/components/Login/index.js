"use strict";
import React,{ Component }  from 'react';
var LoginDetail = require("./LoginDetail");
import Translate from '../../public/intl/i18nTemplate';
class Login extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Translate Template={<LoginDetail/>}></Translate>
        );
    }
}
module.exports = Login;