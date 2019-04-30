var FilterAjax = require('../ajax/filter-ajax');
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import { altAsyncUtil } from 'ant-utils';
const {asyncDispatcher} = altAsyncUtil;

function FilterAction() {
    this.generateActions(
        'setApp',
        'setTeam',
        'setStage',
        'setTag',
        'setStageTag',
        'setCompetitor',
        'setIndustry',
        'setProvince',
        'setContact',
        'setRange',
        'setInputCondition',
        'setClue',
        'setLevel',
        'showPanel',
        'hidePanel',
        'setOtherSelectedItem',
        'setSalesRole',
        'setCondition',
        'setInitialCondition'
    );

    this.getAppList = function() {
        var _this = this;
        FilterAjax.getAppList().then(function(list) {
            list = _.isArray(list) ? list : [];
            list.unshift({client_id: '', client_name: Intl.get('common.all', '全部')});
            _this.dispatch(list);
        }, function(errorMsg) {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };

    this.getTeamList = function(cb) {
        getMyTeamTreeAndFlattenList(data => {
            let list = data.teamList || [];
            list.unshift({group_id: '', group_name: Intl.get('common.all', '全部')});
            this.dispatch({teamList: list, teamTreeList: data.teamTreeList});
            if (_.isFunction(cb)) cb(list);
        });
    };
    //获取负责人列表
    this.getOwnerList = function() {
        FilterAjax.getOwnerList().then(list => {
            this.dispatch(list);
        }, function(errorMsg) {
            console.log(errorMsg);
        });
    };

    this.getStageList = function() {
        var _this = this;
        FilterAjax.getStageList().then(function(list) {
            list = _.isArray(list) ? list : [];
            list.map(stage => stage.show_name = stage.name);
            _this.dispatch(list);
        }, function(errorMsg) {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };

    this.getTagList = function() {
        var _this = this;
        FilterAjax.getTagList().then(function(list) {
            list = _.isArray(list) ? list : [];
            list = list.map(tag => {
                return {name: tag, show_name: tag};
            });
            list.unshift({
                name: Intl.get('crm.tag.unknown', '未打标签的客户'),
                show_name: Intl.get('crm.tag.unknown', '未打标签的客户')
            });
            list.unshift({name: '', show_name: Intl.get('common.all', '全部')});
            _this.dispatch(list);
        }, function(errorMsg) {
            this.dispatch([{name: '', show_name: Intl.get('common.all', '全部')}]);
        });
    };
    //获取阶段标签列表
    this.getStageTagList = function() {
        FilterAjax.getStageTagList().then((list) => {
            this.dispatch({errorMsg: '', list: list});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg, list: []});
        });
    };
    //获取销售角色列表
    this.getSalesRoleList = function() {
        FilterAjax.getSalesRoleList().then((list) => {
            this.dispatch({errorMsg: '', list: list});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg, list: []});
        });
    };
    //获取竞品列表
    this.getCompetitorList = function() {
        FilterAjax.getCompetitorList().then((list) => {
            let competitorList = _.isArray(list) ? list : [];
            competitorList = competitorList.map(tag => {
                return {name: tag, show_name: tag};
            });
            competitorList.unshift({name: '', show_name: Intl.get('common.all', '全部')});
            this.dispatch(competitorList);
        }, (errorMsg) => {
            this.dispatch([{name: '', show_name: Intl.get('common.all', '全部')}]);
        });
    };
    //获取行业列表
    this.getIndustries = function() {
        FilterAjax.getIndustries().then((data) => {
            const list = data && _.isArray(data.result) ? data.result : [];
            this.dispatch(list);
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };
    //获取地域列表
    this.getFilterProvinces = function(type) {
        FilterAjax.getFilterProvinces(type).then((data) => {
            const list = data && _.isArray(data.result) ? data.result : [];
            this.dispatch(list);
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };
    
    this.getCommonFilterList = asyncDispatcher(FilterAjax.getCommonFilterList);

    this.delCommonFilter = asyncDispatcher(FilterAjax.delCommonFilter, true);
    
}

module.exports = alt.createActions(FilterAction);
