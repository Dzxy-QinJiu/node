var batchChangeAjax = require('../ajax/batch-change-ajax');
let userData = require("../../../../public/sources/user-data");

function BatchChangeAction() {
    this.generateActions(
        'setCurrentTab',
        'setSalesMan',
        'setLoadingState',
        'toggleTag',
        'industryChange',
        'resetState',
        'clearSelectedTag',
        "administrativeLevelChange",
        'setUnSelectDataTip',
        'locationChange'
    );

    this.getSalesManList = function (cb) {
        var _this = this;
        let ajaxFunc = null;
        if (userData.isSalesManager()) {
            //销售领导、域管理员角色时，客户所属销售下拉列表的数据获取
            ajaxFunc = batchChangeAjax.getSalesManList();
        } else if (userData.hasRole("sales")) {
            //销售角色获取其团队里的成员列表
            let teamId = userData.getUserData().team_id;
            ajaxFunc = batchChangeAjax.getSalesTeamMembers(teamId);
        }
        if (ajaxFunc) {
            ajaxFunc.then(function (list) {
                _this.dispatch(list);
                if (cb) cb();
            }, function (errorMsg) {
                console.log(errorMsg);
            });
        }
    };
    //批量操作调用
    this.doBatch = function (type, condition, cb) {
        var _this = this;
        batchChangeAjax.doBatch(type, condition).then(function (taskId) {
            cb({code: 0, taskId: taskId});
        }, function (errorMsg) {
            cb({code: 1, msg: errorMsg});
        });
    };


    this.getRecommendTags = function (cb) {
        var _this = this;
        batchChangeAjax.getRecommendTags().then(function (data) {
            _this.dispatch(data.result);
            if (cb) cb(data.result);
        }, function (errorMsg) {
            if (cb){
                cb(errorMsg)
            }
            console.log(errorMsg);
        });
    };

    //获取行业列表
    this.getIndustries = function () {
        this.dispatch({loading: true});
        batchChangeAjax.getIndustries().then((list) => {
            this.dispatch({list: list});
        }, (errorMsg) => {
            this.dispatch({error: true, errorMsg: errorMsg});
        });
    };

}

module.exports = alt.createActions(BatchChangeAction);
