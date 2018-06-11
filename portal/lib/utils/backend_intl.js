/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/21.
 */
import IntlMessageFormatWrap from './intlMessageFormatWrap';
import osLocale from 'os-locale';
import Local from './local';
import _ from 'lodash';

class BackendIntl {
    //langReq：传入的req或lang,默认为系统的语言环境
    constructor(langReq = osLocale.sync()) {
        if (langReq) {
            //传入语言环境时
            if (_.isString(langReq)) {
                this.lang = langReq;
            } else if (langReq.session && langReq.session.lang) {
                //传req时，需从session中取出该用户的语言环境
                this.lang = langReq.session.lang;
            }
        }
    }

    get(key, defaultMessage, options) {
        //获取对应的语言code
        let languageCode = Local.getLanguageCode(this.lang);
        return IntlMessageFormatWrap.get(key, defaultMessage, options, languageCode);
    }
}
module.exports = BackendIntl;