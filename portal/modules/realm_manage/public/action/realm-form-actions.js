/**
 * Created by wangliping on 2016/4/13.
 */

var realmAjax = require("../ajax/realm-ajax");
var RealmActions = require("./realm-actions");

function RealmFormActions() {
    this.generateActions(
        //设置是否正在保存
        'setSaveFlag',
        //重置用户验证的标志
        'resetUserNameFlags',
        //重置电话验证的标志
        'resetPhoneFlags',
        //重置邮箱验证的标志
        'resetEmailFlags'
    );
    //保存安全域
    this.addRealm = function (realm,cb) {
        var _this = this;
        realmAjax.addRealm(realm).then(function (list) {
            //保存成功后的处理
            _this.dispatch({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功！")});
            //清空搜索内容
            RealmActions.updateSearchContent("");
            //将新创建的放在原有列表之前
            RealmActions.expandRealmLists(list);
            cb({saveResult: "success" , taskId : list.taskId});
        }, function (errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
            cb({saveResult: "error", msg : errorMsg});
        });
    };


    //保存所有者
    this.addOwner = function (owner) {
        var _this = this;
        realmAjax.addOwner(owner).then(function () {
            //保存成功后的处理
            _this.dispatch({saveResult: "success", saveMsg:Intl.get("common.save.success", "保存成功！")});
            //清空搜索内容
            RealmActions.updateSearchContent("");
            //添加成功后获取第一页的数据
            RealmActions.getCurRealmList({
                cur_page: 1,
                page_size: 16,
                search_content: ""
            });
        }, function (errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
        });
    };
    //编辑安全域
    this.editRealm = function (realm) {
        var _this = this;
        realmAjax.editRealm(realm).then(function (realmModified) {
            //保存成功后的处理
            _this.dispatch({saveResult: "success", saveMsg:Intl.get("common.save.success", "保存成功！")});
            //修改成功后刷新左侧列表对应安全域卡片及其详情的数据
            RealmActions.afterEditRealm(realmModified);
        }, function (errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
        });
    };

    //清空提示
    this.resetSaveResult = function (formType, saveResult, realm) {
        if (saveResult == "success") {
            if (formType == "add") {
                //添加成功后关闭右侧面板
                RealmActions.showOwnerForm(realm);
            } else if (formType == "edit") {
                //修改成功后返回详情
                RealmActions.returnInfoPanel();
            }
        }
        this.dispatch();
    };

    //用户名唯一性的验证
    this.checkOnlyUserName = function (userName) {
        var _this = this;
        realmAjax.checkOnlyUserName(userName).then(function (result) {
            _this.dispatch(result);
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //电话唯一性的验证
    this.checkOnlyOwnerPhone = function (phone) {
        var _this = this;
        realmAjax.checkOnlyOwnerPhone(phone).then(function (result) {
            _this.dispatch(result);
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //邮箱唯一性的验证
    this.checkOnlyOwnerEmail = function (email) {
        var _this = this;
        realmAjax.checkOnlyOwnerEmail(email).then(function (result) {
            _this.dispatch(result);
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

}

module.exports = alt.createActions(RealmFormActions);