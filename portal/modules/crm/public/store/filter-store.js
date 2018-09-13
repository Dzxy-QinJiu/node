var FilterActions = require('../action/filter-actions');
import { altAsyncUtil } from 'ant-utils';
const { resultHandler } = altAsyncUtil;
const COMMON_OTHER_ITEM = 'otherSelectedItem';
import { OTHER_FILTER_ITEMS, DAY_TIME, STAGE_OPTIONS, UNKNOWN } from 'PUB_DIR/sources/utils/consts';

function FilterStore() {
    this.appList = [];
    this.teamList = [];
    this.ownerNameList = [];//有客户的负责人名称列表
    this.stageList = [];
    this.tagList = [];
    this.stageTagList = [];//阶段标签
    this.competitorList = [];//竞品列表
    this.industryList = [];//行业列表
    this.provinceList = [];//地域列表
    this.salesRoleList = [];
    this.inputCondition = {};
    this.setInitialCondition();
    this.isPanelShow = false;

    this.bindActions(FilterActions);
}
FilterStore.prototype.setInitialCondition = function () {
    this.condition = {
        sales_team_id: '',
        user_name: '',//负责人
        industry: '',
        province: '',
        app_ids: [''],
        labels: [''],//标签的筛选
        customer_label: '',//阶段标签
        qualify_label: '',//合格标签（合格、曾经合格）
        member_role: '',//销售角色的筛选
        competing_products: [''],//竞品的筛选
        sales_opportunities: [{
            sale_stages: '',
            apps: ['']
        }],
        administrative_level: '',//行政级别
        otherSelectedItem: '',//其他类型的筛选
    };
    this.commonFilterList = {
        data: [],
        loading: false,
        errorMsg: ""
    }
};
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

FilterStore.prototype.getTeamList = function (result) {
    this.teamTreeList = result.teamTreeList;
    this.teamList = result.teamList;
};

FilterStore.prototype.getOwnerNameList = function (list) {
    this.ownerNameList = _.get(list, '[0]') ? list : [];
};

FilterStore.prototype.getStageList = function (list) {
    this.stageList = list;
};

FilterStore.prototype.getStageTagList = function (data) {
    let stageTagList = [{ name: '', show_name: Intl.get('common.all', '全部') }];
    if (!data.errorMsg && _.isArray(data.list)) {
        let list = _.map(data.list, tag => {
            return { name: tag, show_name: tag };
        });
        stageTagList = stageTagList.concat(list);
    }
    this.stageTagList = stageTagList;
};

FilterStore.prototype.getSalesRoleList = function (data) {
    let salesRoleList = [{ name: '', show_name: Intl.get('common.all', '全部') }];
    if (!data.errorMsg && _.isArray(data.list)) {
        let list = _.map(data.list, role => {
            return { name: role, show_name: role };
        });
        salesRoleList = salesRoleList.concat(list);
    }
    this.salesRoleList = salesRoleList;
};

FilterStore.prototype.getTagList = function (list) {
    this.tagList = list;
};

FilterStore.prototype.getCompetitorList = function (list) {
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
FilterStore.prototype.setStageTag = function (value) {
    this.condition.customer_label = value;
};

FilterStore.prototype.setSalesRole = function (value) {
    this.condition.member_role = value;
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
FilterStore.prototype.setInputCondition = function (searchObj) {
    if (_.has(searchObj, 'contact_name')) {
        //联系人的搜索
        this.inputCondition = { contacts: [{ name: searchObj.contact_name }] };
    } else {
        this.inputCondition = searchObj;
    }
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

FilterStore.prototype.setCondition = function (conditionObj) {
    this.condition = $.extend({}, this.condition, conditionObj);
};

//将查询条件
const getFilterItemFromConditionItem = function(item) {
    let filters = [];
    let plainFilters = [];
    if (item.query_condition) {
        _.each(item.query_condition.query, (value, key) => {
            let name = value;
            switch (key) {
                case 'sales_team_id':
                    name = this.teamList.find(x => x.group_id === value).group_name
                    break;
                case "contain_sales_opportunity"://订单阶段value由name表示
                    const stageArray = this.stageList.concat(STAGE_OPTIONS);
                    const stateItem = stageArray.find(x => x.name === value);
                    if (stateItem) {
                        name = stateItem.show_name;
                    }
                default:

                    break;
            }
            const plainFilterItem = {
                groupId: key,
                groupName: key,//todo
                value: value,
                name,
            }
            const filterItem = {
                name,
                groupId: key,
                groupName: key,//todo
                value: value,
                data: [{
                    name,
                    groupId: key,
                    groupName: key,//todo
                    value: value,
                }]
            };
            //非空字符串或非空数组
            if ((value && !Array.isArray(value))) {
                plainFilters.push(filterItem);
                filters.push(filterItem)
            }
            else if (_.get(value, 'length') > 0) {
                plainFilters.concat(value.map(x => ({
                    groupId: key,
                    groupName: key,//todo
                    name: x,
                    value: x
                })));
                filters.concat(value.map(x => ({
                    groupId: key,
                    groupName: key,//todo
                    name: x,
                    value: x,
                    data: [{
                        groupId: key,
                        groupName: key,//todo
                        name: x,
                        value: x,
                    }]
                })))
            }
        });
        //todo 日期范围无法判断，需修改接口,或传from to 判断范围
        if (_.get(item.query_condition, 'rang_params.length')) {
            item.query_condition.rang_params.forEach(rangeItem => {
                const item = {
                    groupId: COMMON_OTHER_ITEM
                };
                switch (rangeItem.name) {
                    case 'last_contact_time':
                        switch (rangeItem.to) {
                            case DAY_TIME.THIRTY_DAY:
                                item.name = OTHER_FILTER_ITEMS.THIRTY_UNCONTACT;
                                item.value = OTHER_FILTER_ITEMS.THIRTY_UNCONTACT;
                                //超30天未联系的客户                                
                                break;
                            case DAY_TIME.FIFTEEN_DAY:
                                item.name = OTHER_FILTER_ITEMS.FIFTEEN_UNCONTACT;
                                item.value = OTHER_FILTER_ITEMS.FIFTEEN_UNCONTACT;
                                //超15天未联系的客户
                                break;
                            case DAY_TIME.SEVEN_DAY:
                                item.name = OTHER_FILTER_ITEMS.SEVEN_UNCONTACT;
                                item.value = OTHER_FILTER_ITEMS.SEVEN_UNCONTACT;
                                //超7天未联系的客户
                                break;
                        }
                        break;
                    case 'last_login_time':
                        switch (rangeItem.from) {
                            case value:

                                break;

                            default:
                                break;
                        }
                    default:
                        break;
                }
            })
        }
    }

    return {
        name: item.name,
        value: item.name,
        data: filters,
        plainFilterList: plainFilters,
        id: item.id
    };
};

FilterStore.prototype.getCommonFilterList = resultHandler('commonFilterList', function ({ data, paramsObj }) {
    if (_.get(data, 'list.length') > 0) {
        this.commonFilterList.data = data.list.map(condition => getFilterItemFromConditionItem.call(this, condition))
        console.log(this.commonFilterList.data)
    }
});

module.exports = alt.createStore(FilterStore, 'FilterStore');
