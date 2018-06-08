var FilterActions = require('../action/filter-actions');
import {CUSTOMER_TAGS} from '../utils/crm-util';
function FilterStore() {
    this.appList = [];
    this.teamList = [];
    this.stageList = [];
    this.tagList = [];
    this.stageTagList = [];//阶段标签
    this.competitorList = [];//竞品列表
    this.industryList = [];//行业列表
    this.provinceList = [];//地域列表
    this.salesRoleList = [];
    this.inputCondition = {};
    this.condition = {
        sales_team_id: '',
        sub_sales_team_id: '',
        industry: '',
        province: '',
        app_ids: [''],
        labels: [''],//标签的筛选
        customer_label: '',//阶段标签
        member_role: '',//销售角色的筛选
        competing_products: [''],//竞品的筛选
        sales_opportunities: [{
            sale_stages: '',
            apps: ['']
        }],
        administrative_level: '',//行政级别
        otherSelectedItem: '',//其他类型的筛选
    };
    this.isPanelShow = false;

    this.bindActions(FilterActions);
}

//获取地域列表
FilterStore.prototype.getFilterProvinces = function(list) {
    this.provinceList = list;
};

//获取行业列表
FilterStore.prototype.getIndustries = function(list) {
    this.industryList = list;
};

FilterStore.prototype.getAppList = function(list) {
    this.appList = list;
};

FilterStore.prototype.getTeamList = function(result) {
    this.teamTreeList = result.teamTreeList;
    this.teamList = result.list;
};

FilterStore.prototype.getStageList = function(list) {
    this.stageList = list;
};

FilterStore.prototype.getStageTagList = function(data) {
    let stageTagList = [{name: '', show_name: Intl.get('common.all', '全部')}];
    if (!data.errorMsg && _.isArray(data.list)) {
        let list = _.map(data.list, tag => {
            return {name: tag, show_name: tag};
        });
        stageTagList = stageTagList.concat(list);
    }
    //试用合格、签约合格、曾经合格 标签的添加
    stageTagList = stageTagList.concat([{
        name: CUSTOMER_TAGS.QUALIFIED,
        show_name: CUSTOMER_TAGS.QUALIFIED
    },{
        name: CUSTOMER_TAGS.TRIAL_QUALIFIED,
        show_name: CUSTOMER_TAGS.TRIAL_QUALIFIED
    }, {
        name: CUSTOMER_TAGS.SIGN_QUALIFIED,
        show_name: CUSTOMER_TAGS.SIGN_QUALIFIED
    }, {
        name: CUSTOMER_TAGS.HISTORY_QUALIFIED,
        show_name: CUSTOMER_TAGS.HISTORY_QUALIFIED
    }]);
    this.stageTagList = stageTagList;
};

FilterStore.prototype.getSalesRoleList = function(data) {
    let salesRoleList = [{name: '', show_name: Intl.get('common.all', '全部')}];
    if (!data.errorMsg && _.isArray(data.list)) {
        let list = _.map(data.list, role => {
            return {name: role, show_name: role};
        });
        salesRoleList = salesRoleList.concat(list);
    }
    this.salesRoleList = salesRoleList;
};

FilterStore.prototype.getTagList = function(list) {
    this.tagList = list;
};

FilterStore.prototype.getCompetitorList = function(list) {
    this.competitorList = list;
};

FilterStore.prototype.setApp = function(value) {
    this.condition.sales_opportunities[0].apps = [value];
};

FilterStore.prototype.setTeam = function(value) {
    this.condition.sales_team_id = value;
};

FilterStore.prototype.setSubTeam = function(value) {
    this.condition.sub_sales_team_id = value;
};

FilterStore.prototype.setStage = function(value) {
    this.condition.sales_opportunities[0].sale_stages = value;
};

FilterStore.prototype.setTag = function(value) {
    this.condition.labels = value;
};
FilterStore.prototype.setStageTag = function(value) {
    this.condition.customer_label = value;
};

FilterStore.prototype.setSalesRole = function(value) {
    this.condition.member_role = value;
};

FilterStore.prototype.setCompetitor = function(value) {
    this.condition.competing_products = value;
};

FilterStore.prototype.setIndustry = function(value) {
    this.condition.industry = value;
};

FilterStore.prototype.setProvince = function(value) {
    this.condition.province = value;
};
FilterStore.prototype.setContact = function(value) {
    this.condition.contact = value;
};
FilterStore.prototype.setInputCondition = function(value) {
    this.inputCondition = value;
};
FilterStore.prototype.setClue = function(value) {
    this.condition.clue = value;
};
FilterStore.prototype.setLevel = function(value) {
    this.condition.administrative_level = value;
};

FilterStore.prototype.setOtherSelectedItem = function(item) {
    this.condition.otherSelectedItem = item;
};

FilterStore.prototype.showPanel = function() {
    this.isPanelShow = true;
};

FilterStore.prototype.hidePanel = function() {
    this.isPanelShow = false;
};

module.exports = alt.createStore(FilterStore, 'FilterStore');
