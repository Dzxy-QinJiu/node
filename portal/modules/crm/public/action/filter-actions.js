var FilterAjax = require('../ajax/filter-ajax');
import {getMyTeamTreeAndFlattenList, getTeamTreeMemberLists} from 'PUB_DIR/sources/utils/common-data-util';
import { altAsyncUtil } from 'ant-utils';
const {asyncDispatcher} = altAsyncUtil;

function FilterAction() {
    this.generateActions(
        'setInputCondition',
        'showPanel',
        'hidePanel',
        'setCondition',
        'setInitialCondition',
        'setTimeFilterCondition',
    );

    this.getAppList = function() {
        var _this = this;
        FilterAjax.getAppList().then(function(list) {
            list = _.isArray(list) ? list : [];
            _this.dispatch(list);
        }, function(errorMsg) {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };

    this.getTeamList = function(cb) {
        getMyTeamTreeAndFlattenList(data => {
            let list = data.teamList || [];
            this.dispatch({teamList: list, teamTreeList: data.teamTreeList});
            if (_.isFunction(cb)) cb(list);
        });
    };
    //获取负责人(联合跟进人)列表
    this.getUserList = function() {
        getTeamTreeMemberLists((result) => {
            this.dispatch(result);
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
    //获取系统标签列表
    this.getSystemTagList = function() {
        FilterAjax.getSystemTagList().then((list) => {
            let systemTagList = _.isArray(list) ? list : [];
            systemTagList = systemTagList.map(tag => {
                return {name: tag, show_name: tag};
            });
            this.dispatch(systemTagList);
        }, (errorMsg) => {
            this.dispatch([]);
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
            _this.dispatch(list);
        }, function(errorMsg) {
            _this.dispatch([]);
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
            this.dispatch(competitorList);
        }, (errorMsg) => {
            this.dispatch([]);
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
