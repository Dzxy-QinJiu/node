var FilterActions = require("../action/filter-actions");

function FilterStore() {
    this.appList = [];
    this.teamList = [];
    this.stageList = [];
    this.tagList = [];
    this.competitorList = [];//竞品列表
    this.industryList = [];//行业列表
    this.provinceList = [];//地域列表
    this.inputCondition = {};
    this.condition = {
        sales_team_id: "",
        industry: "",
        province: "",
        app_ids: [""],
        labels: [""],//标签的筛选
        competing_products: [""],//竞品的筛选
        sales_opportunities: [{
            sale_stages: "",
            apps: [""]
        }],
        administrative_level: "",//行政级别
        otherSelectedItem:"",//其他类型的筛选
    };
    this.isPanelShow = false;

    this.bindActions(FilterActions);
}

//获取地域列表
FilterStore.prototype.getFilterProvinces = function (list) {
    this.provinceList = list;
};

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

FilterStore.prototype.getCompetitorList= function (list) {
    this.competitorList = list;
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

FilterStore.prototype.setCompetitor = function (value) {
    this.condition.competing_products = value;
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
FilterStore.prototype.setLevel = function (value) {
    this.condition.administrative_level = value;
};

FilterStore.prototype.setOtherSelectedItem = function (item) {
    this.condition.otherSelectedItem = item;
};

FilterStore.prototype.showPanel = function () {
    this.isPanelShow = true;
};

FilterStore.prototype.hidePanel = function () {
    this.isPanelShow = false;
};

module.exports = alt.createStore(FilterStore, 'FilterStore');
