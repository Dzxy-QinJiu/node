/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
var clueCustomerAjax = require('../ajax/clue-customer-ajax');
function DynamicAction() {
    this.generateActions(
        //设置初始的数据
        'setInitialData',
        //获取动态列表
        'getDynamicList'
    );
    //获取动态列表
    this.getDynamicList = function(clue_id, page_size) {
        this.dispatch({loading: true});
        clueCustomerAjax.getDynamicList(clue_id, page_size).then(list => {
            if (!_.isArray(list)) list = [];
            this.dispatch({loading: false, list: list});
        }, errorMsg => {
            this.dispatch({loading: false, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(DynamicAction);