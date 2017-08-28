var BatchChangeActions = require("../action/batch-change-actions");
let userData = require("../../../../public/sources/user-data");

function BatchChangeStore() {
    this.resetState();
    this.salesManList = [];
    this.recommendTags = [];
    //行业列表
    this.industries = {
        //rest状态
        result: 'loading',
        //列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    this.bindActions(BatchChangeActions);
}

//重置客户批量变更数据
BatchChangeStore.prototype.resetState = function () {
    this.salesman_id = "";
    this.salesman_nick_name = "";
    this.sales_team_list = [];
    this.sales_team_id = "";
    this.sales_team = "";
    this.tags = [];
    this.currentTab = "changeTag";
    this.isLoading = false;
    //选中的行业列表
    this.selected_industries = [];
    //行业
    this.formData = {
        tag: '',
    };
    //地域
    this.territoryObj = {
        province: "",
        city: "",
        county: ""
    };
};

BatchChangeStore.prototype.getSalesManList = function (list) {
    list = _.isArray(list) ? list : [];
    //过滤掉停用的成员
    if (userData.isSalesManager()) {
        //销售领导、域管理员角色时，客户所属销售下拉列表的过滤
        this.salesManList = _.filter(list, sales=>sales && sales.user_info && sales.user_info.status == 1);
    } else if (userData.hasRole("sales")) {
        //销售角色，所属销售下拉列表的过滤
        this.salesManList = _.filter(list, sales=>sales.status == 1);
    }
};

BatchChangeStore.prototype.setSalesMan = function ({sales_id,sales_name}) {
    this.salesman_id = sales_id;
    this.salesman_nick_name = sales_name;
    if (userData.isSalesManager()) {
        //销售领导、域管理员角色时，客户所属销售团队的修改
        var list = [];
        var _this = this;
        this.salesManList.forEach(function (salesMan) {
            if (salesMan.user_info.nick_name == _this.salesman_nick_name) {
                salesMan.user_groups.forEach(function (group) {
                    list.push({
                        group_id: group.group_id,
                        group_name: group.group_name,
                        user_id: salesMan.user_id,
                        user_name: salesMan.user_name,
                        nick_name: salesMan.nick_name
                    });
                });
            }
        });
        this.sales_team_list = list;
        if (list[0]) {
            this.sales_team_id = list[0].group_id;
            this.sales_team = list[0].group_name;
        }
    } else if (userData.hasRole("sales")) {
        this.sales_team_id = userData.getUserData().team_id;
        this.sales_team = userData.getUserData().team_name;
        this.sales_team_list = [{
            group_id: this.sales_team_id,
            group_name: this.sales_team,
            user_id: this.salesman_id,
            nick_name: this.salesman_nick_name
        }];
    }
};

BatchChangeStore.prototype.setSalesTeam = function (value) {
    this.sales_team = value;
};

BatchChangeStore.prototype.setCurrentTab = function (value) {
    this.currentTab = value;
};

BatchChangeStore.prototype.getRecommendTags = function (list) {
    this.recommendTags = list;
};

BatchChangeStore.prototype.setLoadingState = function (state) {
    this.isLoading = state;
};

//更改select中的销售团队
BatchChangeStore.prototype.changeSalesTeam = function ({sales_team_name , sales_team_id}) {
    this.sales_team_id = sales_team_id;
    this.sales_team = sales_team_name;
};
//切换行业选中状态
BatchChangeStore.prototype.industryChange = function (industries) {
    this.selected_industries = industries;
};

//变更标签
BatchChangeStore.prototype.toggleTag = function ({tag, isAdd}) {
    let labels = this.tags || [];
    //清空输入框的值
    if (isAdd) {
        this.formData.tag = '';
    }
    if (labels.indexOf(tag) > -1) {
        if (isAdd) return;

        labels = labels.filter(theTag => theTag != tag);
        this.tags = labels;
    }
    else {
        labels.push(tag);

        this.tags = labels;

        if (this.recommendTags.indexOf(tag) === -1) {
            this.recommendTags.push(tag);
        }
    }

};

//获取行业列表
BatchChangeStore.prototype.getIndustries = function (result) {
    if (result.loading) {
        this.industries.result = 'loading';
        this.industries.errorMsg = '';
        this.industries.list = [];
    } else if (result.error) {
        this.industries.result = 'error';
        this.industries.errorMsg = result.errorMsg;
        this.industries.list = [];
    } else {
        this.industries.result = '';
        this.industries.errorMsg = '';
        this.industries.list = result.list;
    }
};

module.exports = alt.createStore(BatchChangeStore, 'BatchChangeStore');
