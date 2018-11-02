/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */
let productionAjax = require('../ajax/production-ajax');

function ProductionActions() {
    this.generateActions(
        'setInitialData',
        'addProduction',
        'updateProduction',
        'showForm',
        'updateCurPage',
        'updatePageSize',
        'showInfoPanel',
        'closeInfoPanel',
        'setCurProduction'
    );
    this.getProductions = function() {
        productionAjax.getProductions().then((listObj) => {
            this.dispatch(listObj);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        });
    };

    this.deleteItemById = function(id) {
        productionAjax.deleteItemById(id).then((itemId) => {
            this.dispatch(itemId);
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('crm.139', '删除失败'));
        });
    };

}

module.exports = alt.createActions(ProductionActions);
