var batchChangeAjax = require('../ajax/batch-change-ajax');

function BatchChangeAction() {
    this.generateActions(
        'setCurrentTab',
        'setSalesMan',
        'setLoadingState',
        'toggleTag',
        'industryChange',
        'resetState',
        'clearSelectedTag',
        'administrativeLevelChange',
        'setUnSelectDataTip',
        'locationChange',
        'setSecondUser'
    );

    this.getSalesManList = function(cb) {
        //客户所属销售(团队)下拉列表的数据获取
        batchChangeAjax.getSalesManList().then((list) => {
            this.dispatch(list);
            if (cb) cb();
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };
    this.getALLUserList = function(searchObj,callback) {
        batchChangeAjax.getALLUserList(searchObj).then((listObj) => {
            if (_.isArray(listObj.data)){
                _.forEach(listObj.data,(item) => {
                    item.user_info = {
                        user_id: item.userId,
                        user_name: item.userName,
                        nick_name: item.nickName,
                        status: item.status
                    };
                });
                var data = _.filter(listObj.data, sales => sales && sales.user_info && sales.user_info.status === 1);
                this.dispatch(data);
                _.isFunction(callback) && callback(data);
            }
        }, function(errorMsg) {
            this.dispatch(errorMsg);
            _.isFunction(callback) && callback(errorMsg);
        });
    };

    //批量操作调用
    this.doBatch = function(type, condition, cb) {
        var _this = this;
        batchChangeAjax.doBatch(type, condition).then(function(taskId) {
            cb({code: 0, taskId: taskId});
        }, function(errorMsg) {
            cb({code: 1, msg: errorMsg});
        });
    };


    this.getRecommendTags = function(cb) {
        var _this = this;
        batchChangeAjax.getRecommendTags().then(function(data) {
            _this.dispatch(data && data.result);
            if (cb) cb(data && data.result);
        }, function(errorMsg) {
            if (cb) {
                cb(errorMsg);
            }
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };

    //获取行业列表
    this.getIndustries = function() {
        this.dispatch({loading: true});
        batchChangeAjax.getIndustries().then((list) => {
            this.dispatch({list: list});
        }, (errorMsg) => {
            this.dispatch({error: true, errorMsg: errorMsg});
        });
    };

}

module.exports = alt.createActions(BatchChangeAction);
