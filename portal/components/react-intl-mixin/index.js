/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/12.
 */
/**
 * 国际化工具类
 * @type {{formatMessage: (function(*=))}}
 */
const reactIntlMixin = {
    /**
     * 获取国际化数据
     * @param defineMessageKey
     * 例如：const message= defineMessages({input_user_name: {id: 'input.userName'}});
     *       defineMessageKey即： message.input_user_name
     * @returns {*}
     */
    formatMessage(defineMessageKey){
        return this.props.intl['formatMessage'](defineMessageKey);
    }
}
export default reactIntlMixin;