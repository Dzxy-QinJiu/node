import {getSelected} from '../../../../lib/utils/filter-utils';
var FilterStore = require('../store/filter-store');
var FilterAction = require('../action/filter-actions');
import Trace from 'LIB_DIR/trace';
import {administrativeLevels} from '../utils/crm-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import userData from 'PUB_DIR/sources/user-data';
//行政级别筛选项
let filterLevelArray = [{id: '', level: Intl.get('common.all', '全部')}].concat(administrativeLevels);
const UNKNOWN = Intl.get('user.unknown', '未知');
const otherFilterArray = [{
    name: Intl.get('common.all', '全部'),
    value: ''
}, {
    name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', {day: 30}),
    value: 'thirty_uncontact'
}, {
    name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', {day: 15}),
    value: 'fifteen_uncontact'
}, {
    name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', {day: 7}),
    value: 'seven_uncontact'
}, {
    name: Intl.get('crm.no.contact.way', '无联系方式客户'),
    value: 'no_contact_way'
}, {
    name: Intl.get('crm.call.no.remark', '最后联系但未写跟进记录'),
    value: 'last_call_no_record'
}, {
    name: Intl.get('crm.call.no.remark.over30', '超30天未写跟进记录'),
    value: 'last_trace'
}, {
    name: Intl.get('crm.concerned.customer', '关注的客户'),
    value: 'interest'
}, {
    name: Intl.get('crm.order.more.customer', '多个订单的客户'),
    value: 'multi_order'
}];
//只有管理员可以过滤未分配的客户
if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
    otherFilterArray.push({
        name: Intl.get('crm.213', '未分配客户'),
        value: 'undistributed'
    });
}
const CrmFilterPanel = React.createClass({
    getInitialState: function() {
        return FilterStore.getState();
    },
    onStoreChange: function() {
        this.setState(FilterStore.getState());
    },
    componentDidMount: function() {
        FilterStore.listen(this.onStoreChange);
        FilterAction.getTeamList();
        FilterAction.getSalesRoleList();
        FilterAction.getStageList();
        FilterAction.getTagList();
        FilterAction.getStageTagList();
        //获取竞品的列表
        FilterAction.getCompetitorList();
        FilterAction.getIndustries();
        //地域列表的获取
        let type = 'user';
        //管理员获取地域列表的权限
        if (hasPrivilege('CUSTOMER_MANAGER_PROVINCE_GET')) {
            type = 'manager';
        }
        FilterAction.getFilterProvinces(type);
    },
    componentDidUpdate: function(prevProps) {
        var filterPanelHeight = $('.crm-filter-panel').outerHeight(true);
        if (prevProps.filterPanelHeight !== filterPanelHeight) {
            this.props.changeTableHeight(filterPanelHeight);
        }
    },
    componentWillUnmount: function() {
        FilterStore.unlisten(this.onStoreChange);
    },
    appSelected: function(app) {
        FilterAction.setApp(app);

        const _this = this;
        setTimeout(() => _this.props.search());
    },
    stageSelected: function(stage) {
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
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按销售阶段筛选');
    },
    teamSelected: function(team) {
        const curSelectedTeams = this.state.condition.sales_team_id;

        const newSelectedTeams = getSelected(curSelectedTeams, team);

        if (newSelectedTeams === curSelectedTeams) return;

        FilterAction.setTeam(newSelectedTeams);

        setTimeout(() => this.props.search());
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按团队筛选客户');
    },
    //行政级别的筛选
    levelSelected: function(level) {
        const curSelectedLevels = this.state.condition.administrative_level;

        const newSelectedLevels = getSelected(curSelectedLevels, level);

        if (newSelectedLevels === curSelectedLevels) return;

        FilterAction.setLevel(newSelectedLevels);

        setTimeout(() => this.props.search());
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按行政级别筛选客户');
    },
    tagSelected: function(tag) {
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
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按标签筛选');
    },
    //阶段标签的选择
    stageTagSelected: function(stageTag) {
        if (this.state.condition.customer_label === stageTag) {
            if (stageTag) {//不是全部时，则取消当前选项的选择
                stageTag = '';
            } else {//全部时，不做处理
                return;
            }
        }
        FilterAction.setStageTag(stageTag);
        setTimeout(() => this.props.search());
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按阶段标签筛选');
    },
    //销售角色的选择
    salesRoleSelected: function(role) {
        if (this.state.condition.member_role === role) {
            if (role) {//不是全部时，则取消当前选项的选择
                role = '';
            } else {//全部时，不做处理
                return;
            }
        }
        FilterAction.setSalesRole(role);
        setTimeout(() => this.props.search());
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按销售角色筛选');
    },
    //竞品的选择
    competitorSelected: function(tag) {
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
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按标签筛选');
    },

    industrySelected: function(industry) {
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
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按行业筛选');
    },
    provinceSelected: function(province) {
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
        Trace.traceEvent($(this.getDOMNode()).find('li'), '按地域筛选');
    },
    otherSelected: function(item) {
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
            Trace.traceEvent($(this.getDOMNode()).find('li'), '超30天未联系的筛选');
            break;
        case otherFilterArray[2].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '超15天未联系的筛选');
            break;
        case otherFilterArray[3].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '超7天未联系的筛选');
            break;
        case otherFilterArray[4].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '无联系方式的客户的筛选');
            break;
        case otherFilterArray[5].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '最后联系但未写更近记录客户的筛选');
            break;
        case otherFilterArray[6].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '超30天未写跟进记录客户的筛选');
            break;
        case otherFilterArray[7].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '关注客户的筛选');
            break;
        case otherFilterArray[8].value:
            Trace.traceEvent($(this.getDOMNode()).find('li'), '多个订单客户的筛选');
            break;
        }
        if (otherFilterArray[9] && item === otherFilterArray[8].value) {
            Trace.traceEvent($(this.getDOMNode()).find('li'), '未分配客户的筛选');
        }
    },
    render: function() {
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
        const stageArray = [{name: '', show_name: Intl.get('common.all', '全部')}, {
            name: Intl.get('user.unknown', '未知'),
            show_name: Intl.get('user.unknown', '未知')
        }].concat(this.state.stageList);
        const stageListJsx = stageArray.map((stage, idx) => {
            let className = selectedStages.indexOf(stage.name) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.stageSelected.bind(this, stage.name)}
                className={className}>{stage.show_name}</li>;
        });
        const tagListJsx = this.state.tagList.map((tag, idx) => {
            let className = this.state.condition.labels.indexOf(tag.name) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.tagSelected.bind(this, tag.name)}
                className={className}>{tag.show_name}</li>;
        });
        const stageTagListJsx = this.state.stageTagList.map((tag, idx) => {
            let className = this.state.condition.customer_label === tag.name ? 'selected' : '';
            return <li key={idx} onClick={this.stageTagSelected.bind(this, tag.name)}
                className={className}>{tag.show_name}</li>;
        });
        const competitorListJsx = this.state.competitorList.map((tag, idx) => {
            let className = this.state.condition.competing_products.indexOf(tag.name) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.competitorSelected.bind(this, tag.name)}
                className={className}>{tag.show_name}</li>;
        });
        const industryArray = ['', Intl.get('user.unknown', '未知')].concat(this.state.industryList);
        const industryListJsx = industryArray.map((item, idx) => {
            let className = this.state.condition.industry.split(',').indexOf(item) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.industrySelected.bind(this, item)}
                className={className}>{item || Intl.get('common.all', '全部')}</li>;
        });
        //行政级别
        const levelListJsx = filterLevelArray.map((item, idx) => {
            let className = this.state.condition.administrative_level.split(',').indexOf(item.id) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.levelSelected.bind(this, item.id)}
                className={className}>{item.level}</li>;
        });
        const provinceListJsx = ['', Intl.get('user.unknown', '未知')].concat(this.state.provinceList).map((item, idx) => {
            let className = this.state.condition.province.split(',').indexOf(item) > -1 ? 'selected' : '';
            return <li key={idx} onClick={this.provinceSelected.bind(this, item)}
                className={className}>{item || Intl.get('common.all', '全部')}</li>;
        });
        //销售角色
        const salesRoleListJsx = this.state.salesRoleList.map((role, idx) => {
            let className = this.state.condition.member_role === role.name ? 'selected' : '';
            return <li key={idx} onClick={this.salesRoleSelected.bind(this, role.name)}
                className={className}>{role.show_name}</li>;
        });
        return (
            <div data-tracename="筛选">
                <div className="crm-filter-panel">
                    {true ? null : (
                        <dl>
                            <dt>{Intl.get('common.app', '应用')}:</dt>
                            <dd>
                                <ul>{appListJsx}</ul>
                            </dd>
                        </dl>
                    )}
                    {teamListJsx.length === 1 ? null : (
                        <dl>
                            <dt><ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队"/> :</dt>
                            <dd>
                                <ul>{teamListJsx}</ul>
                            </dd>
                        </dl>
                    )}
                    <dl>
                        <dt>{Intl.get('crm.detail.sales.role', '销售角色')} :</dt>
                        <dd>
                            <ul>{salesRoleListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('crm.order.stage','订单阶段')} :</dt>
                        <dd>
                            <ul>{stageListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('weekly.report.customer.stage', '客户阶段')} :</dt>
                        <dd>
                            <ul>{stageTagListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('common.tag', '标签')} :</dt>
                        <dd>
                            <ul>{tagListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('crm.competing.products', '竞品')} :</dt>
                        <dd>
                            <ul>{competitorListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('realm.industry', '行业')} :</dt>
                        <dd>
                            <ul>{industryListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('crm.administrative.level', '行政级别')} :</dt>
                        <dd>
                            <ul>{levelListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('crm.96', '地域')} :</dt>
                        <dd>
                            <ul>{provinceListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get('crm.186', '其他')} :</dt>
                        <dd>
                            <ul>
                                {otherFilterArray.map(item => {
                                    return (
                                        <li onClick={this.otherSelected.bind(this, item.value)}
                                            className={this.state.condition.otherSelectedItem === item.value ? 'selected' : ''}>
                                            {item.name}
                                        </li>);
                                })}
                            </ul>
                        </dd>
                    </dl>
                </div>
            </div>
        );
    }
});

module.exports = CrmFilterPanel;
