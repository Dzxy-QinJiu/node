/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/11.
 */
import React,{ Component } from 'react';
import {addLocaleData,IntlProvider} from 'react-intl';
import Local from './../../lib/utils/local';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import es from 'react-intl/locale-data/es';
addLocaleData([...en, ...zh, ...es]);

var areIntlLocalesSupported = require('intl-locales-supported');

var localesSupports = [
    'zh', 'en', 'es'
];

if (global.Intl) {
    if (!areIntlLocalesSupported(localesSupports)) {
        var IntlPolyfill = require('intl');
        Intl.NumberFormat = IntlPolyfill.NumberFormat;
        Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
    }
} else {
    global.Intl = require('intl');
}
class Translate extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        //获取本地语言code
        const languageCode = Local.getLanguageCode(Local.getNavigatorLanguage());
        //获取本地语言包
        const messages = Local.chooseLocale(languageCode);
        //this.props.Template 父级传来的 this.props.Template
        return (
            <IntlProvider locale={ languageCode } messages={ messages }>
                {this.props.Template}
            </IntlProvider>
        );
    }
}

module.exports = Translate;