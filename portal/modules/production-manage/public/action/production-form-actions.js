/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */
/**
 * Created by wangliping on 2016/4/18.
 */
var userData = require('../../../../public/sources/user-data');
var productionAjax = require('../ajax/production-ajax');
// var ProductionActions = require('./production-actions');
// var cardEmitter = require('../../../../public/sources/utils/emitters').cardEmitter;

function ProductionFormActions() {
    this.generateActions(
        //设置是否正在保存
        'setSaveFlag',
        //保存成员
        'addProduction',
        //编辑成员
        'editProduction'
    );


    //保存
    this.addProduction = function(production) {
        var _this = this;
        productionAjax.addProduction(production).then(function(savedProduction) {
            _this.dispatch({
                saveResult: 'success',
                saveMsg: '保存成功',
                value: savedProduction
            });
        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('member.add.failed', '添加失败！')});
        });
    };
    //编辑
    this.editProduction = function(production) {
        var _this = this;
        productionAjax.editProduction(production).then(function(data) {
            //修改成功data=true，false:修改失败
            if (data) {
                //保存成功后的处理
                _this.dispatch({
                    saveResult: 'success',
                    saveMsg: Intl.get('common.save.success', '保存成功！'),
                    value: production
                });
            } else {
                _this.dispatch({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败!')});
            }
        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败!')});
        });
    };

}

module.exports = alt.createActions(ProductionFormActions);
