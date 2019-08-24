/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */
let productionAjax = require('../ajax/production-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
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
        'setCurProduction',
        'openEditPanel'
    );
    this.getProductions = function(query) {
        productionAjax.getProductions(query).then((listObj) => {
            this.dispatch(listObj);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    };

    this.deleteItemById = function(id) {
        productionAjax.deleteItemById(id).then((itemId) => {
            this.dispatch(itemId);
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('crm.139', '删除失败'));
        });
    };
    this.getProductById = function(id, callback) {
        productionAjax.getProductById(id).then((obj) => {
            this.dispatch(obj);
            if (_.isFunction(callback)) callback(obj);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        });
    };
}

module.exports = alt.createActions(ProductionActions);
