/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/15.
 */
import Local from '../../lib/utils/local';
function lan() {
    var lan = Local.getNavigatorLanguage();
    var language = 'zh';
    if (lan.indexOf('es') > -1){
        language = 'es';
    }else if (lan.indexOf('zh') > -1){
        language = 'zh';
    }else if (lan.indexOf('en') > -1){
        language ='en';
    }else{
        language = 'zh';
    }
    return language;
}
exports.lan = lan;