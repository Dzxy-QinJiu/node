import { func } from 'prop-types';

var BatchChangeActions = require('../action/batch-change-actions');

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
BatchChangeStore.prototype.resetState = function() {
    this.sales_man = '';//普通销售：userId，非普通销售（销售领导及运营人员）：userId&&teamId
    this.second_user = '';//联合跟进人id，非普通销售（销售领导及管理员）：userId&&teamId
    this.tags = [];
    this.currentTab = 'changeTag';
    this.isLoading = false;
    //选中的行业列表
    this.selected_industries = [];
    //行政级别
    this.administrative_level = '';
    //行业
    this.formData = {
        tag: '',
    };
    //地域
    this.territoryObj = {
        province: '',
        city: '',
        county: '',
        province_code: '',
        city_code: '',
        county_code: ''
    };
    this.unSelectDataTip = '';//未选择数据就保存的提示信息
};

//设置未选择数据就保存的提示信息
BatchChangeStore.prototype.setUnSelectDataTip = function(tip) {
    this.unSelectDataTip = tip;
};

BatchChangeStore.prototype.getSalesManList = function(list) {
    list = _.isArray(list) ? list : [];
    //客户所属销售下拉列表,过滤掉停用的成员
    this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
};

BatchChangeStore.prototype.getALLUserList = function(result) {
    this.salesManList = result;
};

BatchChangeStore.prototype.setSalesMan = function(sales_man) {
    this.sales_man = sales_man;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};
BatchChangeStore.prototype.setSecondUser = function(user) {
    this.second_user = user;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};

BatchChangeStore.prototype.setCurrentTab = function(value) {
    this.currentTab = value;
};

BatchChangeStore.prototype.getRecommendTags = function(list) {
    this.recommendTags = _.isArray(list) ? list : [];
};

BatchChangeStore.prototype.setLoadingState = function(state) {
    this.isLoading = state;
};
//切换行业选中状态
BatchChangeStore.prototype.industryChange = function(industries) {
    this.selected_industries = industries;
    this.unSelectDataTip = '';
};
//切换行政级别选中状态
BatchChangeStore.prototype.administrativeLevelChange = function(level) {
    this.administrative_level = level;
    this.unSelectDataTip = '';
};
//地址修改
BatchChangeStore.prototype.locationChange = function(addressObj) {
    this.territoryObj.province = addressObj.provName || '';
    this.territoryObj.city = addressObj.cityName || '';
    this.territoryObj.county = addressObj.countyName || '';
    this.territoryObj.province_code = addressObj.provCode || '';
    this.territoryObj.city_code = addressObj.cityCode || '';
    this.territoryObj.county_code = addressObj.countyCode || '';
    this.unSelectDataTip = '';
};

//变更标签
BatchChangeStore.prototype.toggleTag = function({tag, isAdd}) {
    let labels = this.tags || [];
    //清空输入框的值
    if (isAdd) {
        this.formData.tag = '';
    }
    if (labels.indexOf(tag) > -1) {
        if (isAdd) return;

        labels = labels.filter(theTag => theTag !== tag);
        this.tags = labels;
    }
    else {
        labels.push(tag);

        this.tags = labels;

        if (this.recommendTags.indexOf(tag) === -1) {
            this.recommendTags.push(tag);
        }
        //去掉未选标签的提示
        this.unSelectDataTip = '';
    }

};
//清空选择的标签
BatchChangeStore.prototype.clearSelectedTag = function() {
    this.tags = [];
    //去掉未选标签的提示
    this.unSelectDataTip = '';
};

//获取行业列表
BatchChangeStore.prototype.getIndustries = function(result) {
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
