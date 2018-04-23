/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/13.
 */
import zh_CN from '../../../i18n/zh_CN';
import en_US from '../../../i18n/en_US';
import es_VE from '../../../i18n/es_VE';
const defaultLanguage = 'zh_CN'; // 缺省语言
import { storageUtil } from "ant-utils";
const Local = {
    getNavigatorLanguage(){
        //获取浏览器语言
        var lang = typeof navigator == "object" && navigator.language;
        //如果设置了语言，以设置为准
        if (typeof Oplate == "object" && Oplate.lang) {
            lang = Oplate.lang;
        } else if (typeof localStorage == "object") {
            lang = storageUtil.local.get("userLang");
        }
        return lang || defaultLanguage;
    },
    getLanguageCode(language){
        if (typeof language == "string")
            return language && language.toLowerCase().split(/[_-]+/)[0];
        else return language;
    },
    chooseLocale(lan) {
        switch (lan) {
            case 'en':
                return en_US;
            case 'zh':
                return zh_CN;
            case 'es':
                return es_VE;
            default:
                return zh_CN;
        }
    }
};
export default Local;