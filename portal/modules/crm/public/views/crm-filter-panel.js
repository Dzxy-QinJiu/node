var React = require('react');
const PropTypes = require('prop-types');
import { getSelected } from '../../../../lib/utils/filter-utils';
var FilterStore = require('../store/filter-store');
var FilterAction = require('../action/filter-actions');
import Trace from 'LIB_DIR/trace';
import { administrativeLevels, CUSTOMER_TAGS } from '../utils/crm-util';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import userData from 'PUB_DIR/sources/user-data';
import { FilterList } from 'CMP_DIR/filter';
import { FILTER_RANGE, STAGE_OPTIONS, DAY_TIME, UNKNOWN, COMMON_OTHER_ITEM } from 'PUB_DIR/sources/utils/consts';
//行政级别筛选项
let filterLevelArray = [{ id: '', level: Intl.get('common.all', '全部') }].concat(administrativeLevels);


const otherFilterArray = [
    {
        name: Intl.get('common.all', '全部'),
        value: ''
    }, {
        name: Intl.get('crm.never.contact.customer', '从未联系客户'),
        value: 'never_contact'
    },{
        name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', { day: 30 }),
        value: 'thirty_uncontact'
    }, {
        name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', { day: 15 }),
        value: 'fifteen_uncontact'
    }, {
        name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', { day: 7 }),
        value: 'seven_uncontact'
    }, {
        name: Intl.get('crm.over.day.no.connection', '近{day}天拨打未接通', { day: 30 }),
        value: 'thirty_no_connection'
    }, {
        name: Intl.get('crm.over.day.no.phone', '超{day}天未打过电话', { day: 30 }),
        value: 'thirty_no_call'
    }, {
        name: Intl.get('crm.no.contact.way', '无联系方式客户'),
        value: 'no_contact_way'
    }, {
        name: Intl.get('crm.call.no.remark', '最后联系但未写跟进记录'),
        value: 'last_call_no_record'
    }, {
        name: Intl.get('crm.call.no.remark.over', '超{day}天未写跟进记录', {day: 30}),
        value: 'thirty_no_last_trace'
    }, {
        name: Intl.get('crm.call.no.remark.over', '超{day}天未写跟进记录', {day: 15}),
        value: 'fifteen_no_last_trace'
    }, {
        name: Intl.get('crm.call.no.remark.over', '超{day}天未写跟进记录', {day: 7}),
        value: 'seven_no_last_trace'
    }, {
        name: Intl.get('crm.concerned.customer', '被关注的客户'),
        value: 'interest_member_ids'
    }, {
        name: Intl.get('crm.my.concerned.customer', '我关注的客户'),
        value: 'my_interest'
    }, {
        name: Intl.get('crm.order.more.customer', '多个订单的客户'),
        value: 'multi_order'
    }, {
        name: Intl.get('crm.available.customer', '有效客户'),
        value: 'availability'
    }, {
        name: Intl.get('crm.recent.week.active', '近一周的活跃客户'),
        value: 'seven_login'
    }, {
        name: Intl.get('crm.recent.month.active', '近一个月的活跃客户'),
        value: 'month_login'
    }, {
        name: Intl.get('crm.filter.team.customer', '团队客户'),
        value: 'team_customer'
    },{
        name: Intl.get('crm.this.week.contact', '本周联系过的客户'),
        value: 'this_week_contacted'
    }
];
//只有管理员可以过滤未分配的客户
if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
    otherFilterArray.push({
        name: Intl.get('crm.213', '未分配客户'),
        value: 'undistributed'
    });
}
//合格标签的筛选
const qualifiedTagList = [{
    name: CUSTOMER_TAGS.QUALIFIED, value: '1'
}, {
    name: CUSTOMER_TAGS.HISTORY_QUALIFIED, value: '2'
}, {
    name: CUSTOMER_TAGS.NEVER_QUALIFIED, value: '3'
}];

class CrmFilterPanel extends React.Component {
    state = FilterStore.getState();

    onStoreChange = () => {
        this.setState(FilterStore.getState());
    };

    componentDidMount() {
        FilterStore.listen(this.onStoreChange);
        FilterAction.getTeamList();
        FilterAction.getSalesRoleList();
        FilterAction.getStageList();
        FilterAction.getTagList();
        FilterAction.getStageTagList();
        //获取竞品的列表
        FilterAction.getCompetitorList();
        FilterAction.getIndustries();
        //负责任人名称列表
        FilterAction.getOwnerNameList();
        //地域列表的获取
        let type = 'user';
        //管理员获取地域列表的权限
        if (hasPrivilege('CUSTOMER_MANAGER_PROVINCE_GET')) {
            type = 'manager';
        }
        FilterAction.getFilterProvinces(type);
        setTimeout(() => {
            this.getCommonFilterList();
        });
    }

    componentDidUpdate(prevProps) {
        var filterPanelHeight = $('.crm-filter-panel').outerHeight(true);
        if (prevProps.filterPanelHeight !== filterPanelHeight) {
            // this.props.changeTableHeight(filterPanelHeight);
        }
    }

    componentWillUnmount() {
        FilterAction.setInitialCondition();
        FilterStore.unlisten(this.onStoreChange);
    }

    getCommonFilterList() {
        const paramsObj = {
            params: {
                type: FILTER_RANGE.USER.value,
                order: 'descend',
                sort_field: 'operate_time',
                page_size: 1000
            },
            //post请求不传body参数会报415
            data: { emptyFix: '' }

        };
        FilterAction.getCommonFilterList(paramsObj);
    }

    appSelected = (app) => {
        FilterAction.setApp(app);

        const _this = this;
        setTimeout(() => _this.props.search());
    };

    stageSelected = (stage) => {
        const curSelectedStages = this.state.condition.sales_opportunities[0].sale_stages;
        let newSelectedStages = getSelected(curSelectedStages, stage);
        //未知的处理
        if (stage === UNKNOWN || curSelectedStages === UNKNOWN) {
            newSelectedStages = stage;
        } else {
            newSelectedStages = getSelected(curSelectedStages, stage);
        }
        if (newSelectedStages === curSelectedStages) return;

        FilterAction.setStage(newSelectedStages);

        setTimeout(() => this.props.search());
        stage = stage ? stage : '全部';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按销售阶段筛选');
    };

    teamSelected = (team) => {
        const curSelectedTeams = this.state.condition.sales_team_id;

        const newSelectedTeams = getSelected(curSelectedTeams, team);

        if (newSelectedTeams === curSelectedTeams) return;

        FilterAction.setTeam(newSelectedTeams);

        setTimeout(() => this.props.search());
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按团队筛选客户');
    };

    //行政级别的筛选
    levelSelected = (level) => {
        const curSelectedLevels = this.state.condition.administrative_level;

        const newSelectedLevels = getSelected(curSelectedLevels, level);

        if (newSelectedLevels === curSelectedLevels) return;

        FilterAction.setLevel(newSelectedLevels);

        setTimeout(() => this.props.search());
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按行政级别筛选客户');
    };

    tagSelected = (tag) => {
        //标签
        let labels = this.state.condition.labels;
        let selectedTags = [''];
        //当前选中的标签多于一个且当前点击的不是全部时进行处理
        if (tag && labels) {
            //如果之前处于选中状态则取消选择
            if (labels.indexOf(tag) > -1) {
                selectedTags = _.filter(labels, label => label !== tag);
                if (selectedTags.length === 0) {//都取消选择后，选中全部
                    selectedTags = [''];
                }
            }
            //否则设为选中状态
            else {
                //未打标签的客户和其他标签不可同时选中
                if (tag === Intl.get('crm.tag.unknown', '未打标签的客户')) {
                    selectedTags = [tag];
                } else {
                    //过滤掉”未打标签的客户“
                    labels = _.filter(labels, label => label !== Intl.get('crm.tag.unknown', '未打标签的客户'));
                    selectedTags = [].concat(labels);
                    selectedTags = _.filter(selectedTags, item => item !== '');
                    selectedTags.push(tag);
                }
            }
        }
        FilterAction.setTag(selectedTags);

        const _this = this;
        setTimeout(() => _this.props.search());
        tag = tag ? tag : '全部';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按标签筛选');
    };

    //阶段标签的选择
    stageTagSelected = (stageTag) => {
        if (this.state.condition.customer_label === stageTag) {
            if (stageTag) {//不是全部时，则取消当前选项的选择
                stageTag = '';
            } else {//全部时，不做处理
                return;
            }
        }
        FilterAction.setStageTag(stageTag);
        setTimeout(() => this.props.search());
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按阶段标签筛选');
    };

    //销售角色的选择
    salesRoleSelected = (role) => {
        if (this.state.condition.member_role === role) {
            if (role) {//不是全部时，则取消当前选项的选择
                role = '';
            } else {//全部时，不做处理
                return;
            }
        }
        FilterAction.setSalesRole(role);
        setTimeout(() => this.props.search());
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按销售角色筛选');
    };

    //竞品的选择
    competitorSelected = (tag) => {
        let labels = this.state.condition.competing_products;
        let selectedTags = [''];
        //当前选中的标签多于一个且当前点击的不是全部时进行处理
        if (tag && labels) {
            //如果之前处于选中状态则取消选择
            if (labels.indexOf(tag) > -1) {
                selectedTags = _.filter(labels, label => label !== tag);
            } else {//否则设为选中状态
                selectedTags = [].concat(labels);
                selectedTags = _.filter(selectedTags, item => item !== '');
                selectedTags.push(tag);
            }
        }
        FilterAction.setCompetitor(selectedTags);
        setTimeout(() => this.props.search());
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按标签筛选');
    };

    industrySelected = (industry) => {
        const curSelectedIndustrys = this.state.condition.industry;
        let newSelectedIndustrys = '';
        //未知的处理
        if (industry === UNKNOWN || curSelectedIndustrys === UNKNOWN) {
            newSelectedIndustrys = industry;
        } else {
            newSelectedIndustrys = getSelected(curSelectedIndustrys, industry);
        }
        if (newSelectedIndustrys === curSelectedIndustrys) return;

        FilterAction.setIndustry(newSelectedIndustrys);

        setTimeout(() => this.props.search());
        industry = industry ? industry : '全部';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按行业筛选');
    };

    provinceSelected = (province) => {
        const curSelectedProvince = this.state.condition.province;
        let newSelectedProvince = '';
        //未知的处理
        if (province === UNKNOWN || curSelectedProvince === UNKNOWN) {
            newSelectedProvince = province;
        } else {
            newSelectedProvince = getSelected(curSelectedProvince, province);
        }
        if (newSelectedProvince === curSelectedProvince) return;
        FilterAction.setProvince(newSelectedProvince);
        setTimeout(() => this.props.search());
        province = province ? province : '全部';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '按地域筛选');
    };

    otherSelected = (item) => {
        //当前选择的是之前选择的时
        if (item === this.state.condition.otherSelectedItem) {
            if (item) {//不是全部时，则取消当前选项的选择
                item = '';
            } else {//全部时，不做处理
                return;
            }
        }
        FilterAction.setOtherSelectedItem(item);
        setTimeout(() => this.props.search());
        switch (item) {
            case otherFilterArray[1].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '从未联系客户筛选');
                break;
            case otherFilterArray[2].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '超30天未联系的筛选');
                break;
            case otherFilterArray[3].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '超15天未联系的筛选');
                break;
            case otherFilterArray[4].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '超7天未联系的筛选');
                break;
            case otherFilterArray[5].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '无联系方式的客户的筛选');
                break;
            case otherFilterArray[6].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '最后联系但未写更近记录客户的筛选');
                break;
            case otherFilterArray[7].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '超30天未写跟进记录客户的筛选');
                break;
            case otherFilterArray[8].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '被关注客户的筛选');
                break;
            case otherFilterArray[9].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '我关注客户的筛选');
                break;
            case otherFilterArray[10].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '多个订单客户的筛选');
                break;
            case otherFilterArray[13].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '近一周的活跃客户的筛选');
                break;
            case otherFilterArray[14].value:
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '近一个月的活跃客户的筛选');
                break;
        }
        if (otherFilterArray[11] && item === otherFilterArray[10].value) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '未分配客户的筛选');
        }
        if (otherFilterArray[12] && item === otherFilterArray[11].value) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('li'), '有效客户');
        }
    };

    handleFilterChange = (data) => {
        const condition = {};
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            condition[COMMON_OTHER_ITEM] = '';
        }
        data.forEach(item => {
            if (item.groupId) {
                if (item.groupId !== 'sales_opportunities') {
                    condition[item.groupId] = item.data.map(x => x.value);
                    if (['customer_label', 'province', 'industry', 'member_role', 'administrative_level', 'sales_team_id', COMMON_OTHER_ITEM].includes(item.groupId)) {
                        condition[item.groupId] = condition[item.groupId].join(',');
                    } else if (item.singleSelect) {
                        condition[item.groupId] = condition[item.groupId][0] || '';
                    }

                } else {
                    condition.sales_opportunities = [];
                    condition.sales_opportunities.push($.extend(true, {}, this.state.condition.sales_opportunities[0], {
                        sale_stages: item.data.map(x => x.value)
                    }));
                    condition.sales_opportunities[0].sale_stages = condition.sales_opportunities[0].sale_stages.join(',');
                }

            }
        });
        FilterAction.setCondition(condition);
        setTimeout(() => {
            this.props.search();
        });
    };
    onDelete(item) {
        return FilterAction.delCommonFilter({
            params: {
                id: item.id
            }
        });
    }
    render() {
        const appListJsx = this.state.appList.map((app, idx) => {
            let className = app.client_id === this.state.condition.sales_opportunities[0].apps[0] ? 'selected' : '';
            return <li key={idx} onClick={this.appSelected.bind(this, app.client_id)}
                className={className}>{app.client_name}</li>;
        });
        const teams = this.state.condition.sales_team_id.split(',');
        const teamListJsx = this.state.teamList.map((team, idx) => {
            let className = teams.indexOf(team.group_id) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.teamSelected.bind(this, team.group_id)}
                className={className}>{team.group_name}</li>;
        });
        //用Store.getState()方法获取存在store里的state时，若state下的某个属性所在层次较深且其值为空时，该属性会被丢掉
        //所以这个地方需要判断一下sale_stages属性是否存在，若不存在则用空值替代
        const currentStage = this.state.condition.sales_opportunities[0].sale_stages || '';
        const selectedStages = currentStage.split(',');
        const stageArray = STAGE_OPTIONS.concat(this.state.stageList);
        const industryArray = ['', Intl.get('user.unknown', '未知')].concat(this.state.industryList);
        const commonData = _.drop(otherFilterArray).map(x => {
            x.readOnly = true;
            x.groupId = COMMON_OTHER_ITEM;
            x.groupName = Intl.get('crm.186', '其他');
            x.data = [{
                name: x.name,
                value: x.value,
                groupId: COMMON_OTHER_ITEM,
                groupName: Intl.get('crm.186', '其他'),
                data: [{
                    name: x.name,
                    value: x.value,
                    groupId: COMMON_OTHER_ITEM,
                    groupName: Intl.get('crm.186', '其他'),
                }]
            }];
            x.plainFilterList = [{
                name: x.name,
                value: x.value
            }];
            return x;
        });
        const advancedData = [
            {
                groupName: Intl.get('crm.order.stage', '订单阶段'),
                groupId: 'sales_opportunities',
                singleSelect: true,
                data: _.drop(stageArray).map(x => ({
                    name: x.show_name,
                    value: x.name
                }))
            },
            {
                groupName: Intl.get('weekly.report.customer.stage', '客户阶段'),
                groupId: 'customer_label',
                data: _.drop(this.state.stageTagList).map(x => ({
                    name: x.show_name,
                    value: x.name
                }))
            },
            {
                groupName: Intl.get('common.qualified', '合格'),
                groupId: 'qualify_label',
                singleSelect: true,
                data: qualifiedTagList
            },
            {
                groupName: Intl.get('common.tag', '标签'),
                groupId: 'labels',
                data: _.drop(this.state.tagList).map(x => {
                    const item = {
                        name: x.show_name,
                        value: x.name
                    };
                    if (x.name === Intl.get('crm.tag.unknown', '未打标签的客户')) {
                        item.selectOnly = true;
                    }
                    return item;
                })
            },
            {
                groupName: Intl.get('crm.competing.products', '竞品'),
                groupId: 'competing_products',
                data: _.drop(this.state.competitorList).map(x => ({
                    name: x.show_name,
                    value: x.name
                }))
            },
            {
                groupName: Intl.get('common.industry', '行业'),
                groupId: 'industry',
                singleSelect: true,
                data: _.drop(industryArray).map(x => ({
                    name: x,
                    value: x
                }))
            },
            {
                groupName: Intl.get('crm.administrative.level', '行政级别'),
                groupId: 'administrative_level',
                data: _.drop(filterLevelArray).map(x => ({
                    name: x.level,
                    value: x.id
                }))
            },
            {
                groupName: Intl.get('crm.96', '地域'),
                groupId: 'province',
                singleSelect: true,
                data: [Intl.get('user.unknown', '未知')]
                    .concat(this.state.provinceList)
                    .map(x => ({
                        name: x,
                        value: x
                    }))
            }
        ];
        //非普通销售才有销售角色和团队
        if (!userData.getUserData().isCommonSales) {
            advancedData.unshift(
                {
                    groupName: Intl.get('crm.detail.sales.role', '销售角色'),
                    groupId: 'member_role',
                    data: _.drop(this.state.salesRoleList).map(x => ({
                        name: x.show_name,
                        value: x.name
                    }))
                },
                {
                    groupName: Intl.get('user.sales.team', '销售团队'),
                    groupId: 'sales_team_id',
                    data: _.drop(this.state.teamList).map(x => ({
                        name: x.group_name,
                        value: x.group_id
                    }))
                },
                {
                    groupName: Intl.get('crm.6', '负责人'),
                    groupId: 'user_name',
                    singleSelect: true,
                    data: _.map(this.state.ownerNameList, x => ({
                        name: x,
                        value: x
                    }))
                }
            );
        }
        return (
            <div data-tracename="筛选">
                <div className="crm-filter-panel">
                    <FilterList
                        ref="filterlist"
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
                        commonLoading={this.state.commonFilterList.loading}
                        commonData={commonData.concat(this.state.commonFilterList.data)}
                        advancedData={advancedData}
                        onDelete={this.onDelete.bind(this)}
                        onFilterChange={this.handleFilterChange.bind(this)}
                    />
                </div>
            </div>
        );
    }
}
CrmFilterPanel.propTypes = {
    showSelectTip: PropTypes.bool,
    style: PropTypes.object,
    search: PropTypes.func
};
module.exports = CrmFilterPanel;

