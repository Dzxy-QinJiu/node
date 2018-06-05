/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/21.
 */

import IntlMessageFormat from 'intl-messageformat';
import Local from './local';
var IntlMessageFormatWrap = {
    get(key, defaultMessage, options, code) {
        //获取本地语言包
        const messages = Local.chooseLocale(code);
        let msg = messages[key];
        if (!msg) {
            //不存在返回null
            return 'null';
        }
        if (options) {
            msg = new IntlMessageFormat(msg, code);
            return msg.format(options);
        }
        return msg;
    }
};
export default IntlMessageFormatWrap;