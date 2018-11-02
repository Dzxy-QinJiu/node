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
        'editProduction',
        //清空保存后的提示信息
        'resetSaveResult',
        //用户名唯一性的验证
        'checkOnlyProductionName',
        //邮箱唯一性的验证
        'checkOnlyEmail',
        //电话唯一性的验证
        'checkOnlyPhone',
        //重置用户验证的标志
        'resetProductionNameFlags',
        //重置邮箱验证的标志
        'resetEmailFlags',
        //正在获取角色列表
        'setRoleListLoading',
        //是否正在获取销售团队列表的标志
        'setTeamListLoading'
    );

    //获取团队列表
    this.getProductionTeamList = function() {
        var _this = this;
        var clientId = userData.getProductionData().auth.client_id;
        productionAjax.getProductionTeamList(clientId).then(function(salesTeamList) {
            _this.dispatch(salesTeamList);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('common.get.team.list.failed', '获取团队列表失败'));
        });
    };

    //获取角色列表
    this.getRoleList = function() {
        var _this = this;
        var clientId = userData.getProductionData().auth.client_id;
        productionAjax.getRoleList(clientId).then(function(roleList) {
            _this.dispatch(roleList);
        });
    };

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

    //清空提示
    this.resetSaveResult = function(formType, saveResult) {
        if (saveResult === 'success') {
            if (formType === 'add') {
                ProductionActions.updateSearchContent('');
            } else if (formType === 'edit') {
                //修改成功后返回详情
                ProductionActions.returnInfoPanel();
            }
        }
        this.dispatch();
    };

    //用户名唯一性的验证
    this.checkOnlyProductionName = function(userName) {
        var _this = this;
        productionAjax.checkOnlyProductionName(userName).then(function(result) {
            _this.dispatch(result);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //电话唯一性的验证
    this.checkOnlyPhone = function(phone, callback) {
        productionAjax.checkOnlyPhone(phone).then(function(result) {
            _.isFunction(callback) && callback(result);
        }, function(errorMsg) {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.phone.is.unique', '电话唯一性校验出错！'));
        });
    };

    //邮箱唯一性的验证
    this.checkOnlyEmail = function(email) {
        var _this = this;
        productionAjax.checkOnlyEmail(email).then(function(result) {
            _this.dispatch(result);
            if (!result) {
                //不存在邮箱为email的用户时，验证是否存在用户名为该邮箱的用户
                _this.actions.checkOnlyProductionName(email);
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('user.email.only.error', '邮箱唯一性验证失败'));
        });
    };
}

module.exports = alt.createActions(ProductionFormActions);
