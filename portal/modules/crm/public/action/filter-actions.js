var FilterAjax = require('../ajax/filter-ajax');

function FilterAction() {
    this.generateActions(
        'setApp',
        'setTeam',
        'setStage',
        'setTag',
        'setIndustry',
        'setProvince',
        'setContact',
        "setRange",
        'setInputCondition',
        'setClue',
        'showPanel',
        'hidePanel'
    );

    this.getAppList = function () {
        var _this = this;
        FilterAjax.getAppList().then(function (list) {
            list = _.isArray(list) ? list : [];
            list.unshift({client_id: "", client_name: Intl.get("common.all", "全部")});
            _this.dispatch(list);
        }, function (errorMsg) {
            console.log(errorMsg);
        });
    };

    this.getTeamList = function (cb) {
        var _this = this;
        FilterAjax.getTeamList().then(function (list) {
            list = _.isArray(list) ? list : [];
            list.unshift({group_id: "", group_name: Intl.get("common.all", "全部")});
            _this.dispatch(list);
            if (_.isFunction(cb)) cb(list);
        }, function (errorMsg) {
            console.log(errorMsg);
        });
    };

    this.getStageList = function () {
        var _this = this;
        FilterAjax.getStageList().then(function (list) {
            list = _.isArray(list) ? list : [];
            list.map(stage => stage.show_name = stage.name);
            _this.dispatch(list);
        }, function (errorMsg) {
            console.log(errorMsg);
        });
    };

    this.getTagList = function () {
        var _this = this;
        FilterAjax.getTagList().then(function (list) {
            list = _.isArray(list) ? list : [];
            list = list.map(tag => {
                return {name: tag, show_name: tag}
            });
            list.unshift({
                name: Intl.get("crm.tag.unknown", "未打标签的客户"),
                show_name: Intl.get("crm.tag.unknown", "未打标签的客户")
            });
            list.unshift({name: "", show_name: Intl.get("common.all", "全部")});
            _this.dispatch(list);
        }, function (errorMsg) {
            console.log(errorMsg);
        });
    };
    //获取行业列表
    this.getIndustries = function () {
        FilterAjax.getIndustries().then((data) => {
            const list = data && _.isArray(data.result) ? data.result : [];
            this.dispatch(list);
        }, (errorMsg) => {
            this.dispatch({error: true, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(FilterAction);
