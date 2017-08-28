var FilterActions = require("../action/filter-actions");

function FilterStore() {
    this.appList = [];
    this.teamList = [];
    this.stageList = [];
    this.tagList = [];
    this.industryList = [];//行业列表
    this.inputCondition = {};
    this.condition = {
        sales_team_id: "",
        industry: "",
        province: "",
        contact:"",//联系方式
        app_ids: [""],
        labels: [""],
        sales_opportunities: [{
            sale_stages: "",
            apps:[""]
        }],
        clue:""
    };
    this.isPanelShow = false;

    this.bindActions(FilterActions);
}

//获取行业列表
FilterStore.prototype.getIndustries = function (list) {
    this.industryList = list;
};

FilterStore.prototype.getAppList = function (list) {
    this.appList = list;
};

FilterStore.prototype.getTeamList = function (list) {
    this.teamList = list;
};

FilterStore.prototype.getStageList = function (list) {
    this.stageList = list;
};

FilterStore.prototype.getTagList = function (list) {
    this.tagList = list;
};

FilterStore.prototype.setApp = function (value) {
    this.condition.sales_opportunities[0].apps = [value];
};

FilterStore.prototype.setTeam = function (value) {
    this.condition.sales_team_id = value;
};

FilterStore.prototype.setStage = function (value) {
    this.condition.sales_opportunities[0].sale_stages = value;
};

FilterStore.prototype.setTag = function (value) {
    this.condition.labels = value;
};

FilterStore.prototype.setIndustry = function (value) {
    this.condition.industry = value;
};

FilterStore.prototype.setProvince = function (value) {
    this.condition.province = value;
};
FilterStore.prototype.setContact = function (value) {
    this.condition.contact = value;
};
FilterStore.prototype.setInputCondition = function (value) {
    this.inputCondition = value;
};
FilterStore.prototype.setClue = function (value) {
    this.condition.clue = value;
};
FilterStore.prototype.showPanel = function () {
    this.isPanelShow = true;
};

FilterStore.prototype.hidePanel = function () {
    this.isPanelShow = false;
};

module.exports = alt.createStore(FilterStore, 'FilterStore');
