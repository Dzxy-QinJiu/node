import { Button, Icon } from "antd";
import { getSelected } from "../../../../lib/utils/filter-utils";
var FilterStore = require("../store/filter-store");
var FilterAction = require("../action/filter-actions");
import Trace from "LIB_DIR/trace";
const PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
const clueFilter = ["", Intl.get("user.distributed", "已分配销售跟进"),
    Intl.get("user.undistributed", "未分配销售跟进")];
var CrmFilterPanel = React.createClass({
    getInitialState: function () {
        return FilterStore.getState();
    },
    onStoreChange: function () {
        this.setState(FilterStore.getState());
    },
    componentDidMount: function () {
        FilterStore.listen(this.onStoreChange);
        FilterAction.getTeamList();
        FilterAction.getStageList();
        FilterAction.getTagList();
        FilterAction.getIndustries();
    },
    componentDidUpdate: function (prevProps) {
        var filterPanelHeight = $(".crm-filter-panel").outerHeight(true);
        if (prevProps.filterPanelHeight !== filterPanelHeight) {
            this.props.changeTableHeight(filterPanelHeight);
        }
    },
    componentWillUnmount: function () {
        FilterStore.unlisten(this.onStoreChange);
    },
    appSelected: function (app) {
        FilterAction.setApp(app);

        const _this = this;
        setTimeout(() => _this.props.search());
    },
    stageSelected: function (stage) {
        const curSelectedStages = this.state.condition.sales_opportunities[0].sale_stages;

        const newSelectedStages = getSelected(curSelectedStages, stage);

        if (newSelectedStages === curSelectedStages) return;

        FilterAction.setStage(newSelectedStages);

        setTimeout(() => this.props.search());
        stage = stage ? stage : "全部";
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按销售阶段筛选");
    },
    teamSelected: function (team) {
        const curSelectedTeams = this.state.condition.sales_team_id;

        const newSelectedTeams = getSelected(curSelectedTeams, team);

        if (newSelectedTeams === curSelectedTeams) return;

        FilterAction.setTeam(newSelectedTeams);

        setTimeout(() => this.props.search());
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按团队筛选客户");
    },
    tagSelected: function (tag) {
        let labels = this.state.condition.labels;
        let selectedTags = [""];
        //当前选中的标签多于一个且当前点击的不是全部时进行处理
        if (tag && labels) {
            //如果之前处于选中状态则取消选择
            if (labels.indexOf(tag) > -1) {
                selectedTags = _.filter(labels, label => label != tag);
            }
            //否则设为选中状态
            else {
                //”未打标签的客户“和其他标签不可同时选中
                if (tag == Intl.get("crm.tag.unknown", "未打标签的客户")) {
                    selectedTags = [Intl.get("crm.tag.unknown", "未打标签的客户")];
                } else {
                    //过滤掉”未打标签的客户“
                    labels = _.filter(labels, label => label != Intl.get("crm.tag.unknown", "未打标签的客户"));
                    selectedTags = [].concat(labels);
                    selectedTags = _.filter(selectedTags, item => item != "");
                    selectedTags.push(tag);
                }
            }
        }
        FilterAction.setTag(selectedTags);

        const _this = this;
        setTimeout(() => _this.props.search());
        tag = tag ? tag : "全部";
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按标签筛选");
    },
    industrySelected: function (industry) {
        const curSelectedIndustrys = this.state.condition.industry;

        const newSelectedIndustrys = getSelected(curSelectedIndustrys, industry);

        if (newSelectedIndustrys === curSelectedIndustrys) return;

        FilterAction.setIndustry(newSelectedIndustrys);

        setTimeout(() => this.props.search());
        industry = industry ? industry : "全部";
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按行业筛选");
    },
    provinceSelected: function (province) {
        const curSelectedProvince = this.state.condition.province;

        const newSelectedProvince = getSelected(curSelectedProvince, province);

        if (newSelectedProvince === curSelectedProvince) return;

        FilterAction.setProvince(newSelectedProvince);

        setTimeout(() => this.props.search());
        province = province ? province : "全部";
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按地域筛选");
    },
    //未知联系方式过滤
    contactSelected: function (contact) {
        const curSelectedContact = this.state.condition.contact;

        const newSelectedContact = getSelected(curSelectedContact, contact);

        if (newSelectedContact === curSelectedContact) return;

        FilterAction.setContact(newSelectedContact);

        setTimeout(() => this.props.search());
        contact = contact ? contact : "全部";
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按联系方式筛选");
    },
    //线索客户的筛选
    clueSelect: function (clue) {
        const curSelectedClue = this.state.condition.clue;

        const newSelectedClue = getSelected(curSelectedClue, clue);

        if (newSelectedClue === curSelectedClue) return;

        FilterAction.setClue(newSelectedClue);

        setTimeout(() => this.props.search());
        clue = clue ? clue : "全部";
        Trace.traceEvent($(this.getDOMNode()).find("li"), "按线索筛选");
    },
    render: function () {
        const appListJsx = this.state.appList.map((app, idx) => {
            let className = app.client_id == this.state.condition.sales_opportunities[0].apps[0] ? "selected" : "";
            return <li key={idx} onClick={this.appSelected.bind(this, app.client_id)}
                       className={className}>{app.client_name}</li>
        });
        const teams = this.state.condition.sales_team_id.split(",");
        const teamListJsx = this.state.teamList.map((team, idx) => {
            let className = teams.indexOf(team.group_id) > -1 ? "selected" : "";
            return <li key={idx} onClick={this.teamSelected.bind(this, team.group_id)}
                       className={className}>{team.group_name}</li>
        });
        //用Store.getState()方法获取存在store里的state时，若state下的某个属性所在层次较深且其值为空时，该属性会被丢掉
        //所以这个地方需要判断一下sale_stages属性是否存在，若不存在则用空值替代
        const currentStage = this.state.condition.sales_opportunities[0].sale_stages || "";
        const selectedStages = currentStage.split(",");
        const stageArray = [{name: '', show_name: Intl.get("common.all", "全部")}, {
            name: Intl.get("user.unknown", "未知"),
            show_name: Intl.get("user.unknown", "未知")
        }].concat(this.state.stageList);
        const stageListJsx = stageArray.map((stage, idx) => {
            let className = selectedStages.indexOf(stage.name) > -1 ? "selected" : "";
            return <li key={idx} onClick={this.stageSelected.bind(this, stage.name)}
                       className={className}>{stage.show_name}</li>
        });
        const tagListJsx = this.state.tagList.map((tag, idx) => {
            let className = this.state.condition.labels.indexOf(tag.name) > -1 ? "selected" : "";
            return <li key={idx} onClick={this.tagSelected.bind(this, tag.name)}
                       className={className}>{tag.show_name}</li>
        });

        const industryArray = ["", Intl.get("user.unknown", "未知")].concat(this.state.industryList);
        const industryListJsx = industryArray.map((item, idx) => {
            let className = this.state.condition.industry.split(",").indexOf(item) > -1 ? "selected" : "";
            return <li key={idx} onClick={this.industrySelected.bind(this, item)}
                       className={className}>{item || Intl.get("common.all", "全部")}</li>
        });
        const provinceListJsx = ["", Intl.get("user.unknown", "未知")].map((item, idx) => {
            let className = this.state.condition.province.split(",").indexOf(item) > -1 ? "selected" : "";
            return <li key={idx} onClick={this.provinceSelected.bind(this, item)}
                       className={className}>{item || Intl.get("common.all", "全部")}</li>
        });
        //过滤联系方式
        const contactListJsx = ["", Intl.get("user.unknown", "未知")].map((item, idx) => {
            let className = this.state.condition.contact.split(",").indexOf(item) > -1 ? "selected" : "";
            return <li key={idx} onClick={this.contactSelected.bind(this, item)}
                       className={className}>{item || Intl.get("common.all", "全部")}</li>
        });
        //线索筛选
        const clueFilterJsx = clueFilter.map((item, idx) => {
            let className = this.state.condition.clue.split(",").indexOf(item) > -1 ? "selected" : "";
            return (
                <li key={idx} onClick={this.clueSelect.bind(this, item)}
                    className={className}>{item || "全部"}</li>
            )
        });
        return (
            <div data-tracename="筛选">
                <div className="crm-filter-panel">
                    {true ? null : (
                        <dl>
                            <dt>{Intl.get("common.app", "应用")}:</dt>
                            <dd>
                                <ul>{appListJsx}</ul>
                            </dd>
                        </dl>
                    )}
                    {teamListJsx.length == 1 ? null : (
                        <dl>
                            <dt><ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队"/> :</dt>
                            <dd>
                                <ul>{teamListJsx}</ul>
                            </dd>
                        </dl>
                    )}
                    <dl>
                        <dt><ReactIntl.FormattedMessage id="sales.stage.sales.stage" defaultMessage="销售阶段"/> :</dt>
                        <dd>
                            <ul>{stageListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get("common.tag", "标签")} :</dt>
                        <dd>
                            <ul>{tagListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get("realm.industry", "行业")} :</dt>
                        <dd>
                            <ul>{industryListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get("crm.96", "地域")} :</dt>
                        <dd>
                            <ul>{provinceListJsx}</ul>
                        </dd>
                    </dl>
                    <dl>
                        <dt>{Intl.get("crm.5", "联系方式")} :</dt>
                        <dd>
                            <ul>{contactListJsx}</ul>
                        </dd>
                    </dl>
                    <PrivilegeChecker check="CUSTOMER_GET_CLUE">
                        <dl>
                            <dt>{Intl.get("crm.clue", "线索")} :</dt>
                            <dd>
                                <ul>{clueFilterJsx}</ul>
                            </dd>
                        </dl>
                    </PrivilegeChecker>
                </div>
            </div>
        );
    }
});

module.exports = CrmFilterPanel;
