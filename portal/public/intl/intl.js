/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/12.
 */
import IntlMessageFormatWrap from './../../lib/utils/intlMessageFormatWrap';
import Local from './../../lib/utils/local'

const Intl = {
    get(key, defaultMessage, options) {
        //获取本地语言code
        const languageCode = Local.getLanguageCode(Local.getNavigatorLanguage());
        return IntlMessageFormatWrap.get(key, defaultMessage, options,languageCode);
    }
}
export default Intl;