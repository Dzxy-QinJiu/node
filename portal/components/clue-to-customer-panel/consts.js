/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by yubin on 2019/11/11.
*/

//线索转客户面板视图类型
export const VIEW_TYPE = {
    //添加客户视图
    ADD_CUSTOMER: 'add_customer',
    //相似客户列表视图
    CUSTOMER_LIST: 'customer_list',
    //客户搜索视图
    CUSTOMER_SEARCH: 'customer_search',
    //合并客户视图
    CUSTOMER_MERGE: 'customer_merge'
};

//空操作
export const NOOP = function(){};

const { CONTACT_OTHER_KEYS } = require('MOD_DIR/crm/public/views/contacts/contact-form');

//联系人不用展示的项
export const NOT_SHOW_FORM_ITEMS = [
    CONTACT_OTHER_KEYS.SEX,
    CONTACT_OTHER_KEYS.BIRTHDAY,
    CONTACT_OTHER_KEYS.HOBBY,
    CONTACT_OTHER_KEYS.REMARK
];
