/**
 * 批量变更标签和销售人员
 */

require('../css/crm-batch-change.less');
var BatchChangeStore = require("../store/batch-change-store");
var crmStore = require("../store/crm-store");
var BatchChangeActions = require("../action/batch-change-actions");
import {AntcAreaSelection} from "antc";
import {Input, Select, message, Radio, Button} from "antd";
import ValidateMixin from "../../../../mixins/ValidateMixin";
const RadioGroup = Radio.Group;
var Option = Select.Option;
var userData = require("../../../../public/sources/user-data");
var batchOperate = require("../../../../public/sources/push/batch");
import Trace from "LIB_DIR/trace";
import {isClueTag, isTurnOutTag} from "../utils/crm-util";
import AntcDropdown from "CMP_DIR/antc-dropdown";
import AlwaysShowSelect from "CMP_DIR/always-show-select";
import crmUtil from "../utils/crm-util";
const BATCH_OPERATE_TYPE = {
    CHANGE_SALES: "changeSales",//变更销售人员
    CHANGER_SALES_URL: "user",//变更销售人员url中传的type
    TRANSFER_CUSTOMER: "transfer_customer",//转出客户和url中传的type
    CHANGE_TAG: "changeTag",//更新标签
    CHANGE_LABEL: "change_label",//更新标签url中传的type
    ADD_TAG: "addTag",//添加标签
    ADD_LABEL: "add_label",//添加标签url中传的type
    REMOVE_TAG: "removeTag",//移除标签
    REMOVE_LABEL: "remove_label", //移除标签url中传的type
    CHANGE_INDUSTRY: "changeIndustry",//变更行业
    CHANGE_TERRITORY: "changeTerritory",//变更地域
    CHANGE_ADMINISTRATIVE_LEVEL: "changeAdministrativeLevel",//变更行政级别
    ADD_SCHEDULE_LISTS: "addScheduleLists",
};
var CrmScheduleForm = require("./schedule/form");

var CrmBatchChange = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function () {
        return {
            ...BatchChangeStore.getState(),
            stopContentHide: false,//content内容中有select下拉框时，
        };
    },
    onStoreChange: function () {
        this.setState(BatchChangeStore.getState());
    },
    componentDidMount: function () {
        BatchChangeStore.listen(this.onStoreChange);
        BatchChangeActions.getSalesManList();
        BatchChangeActions.getRecommendTags();
        BatchChangeActions.getIndustries();
    },
    componentWillUnmount: function () {
        BatchChangeStore.unlisten(this.onStoreChange);
    },
    setCurrentTab: function (tab) {
        Trace.traceEvent($(this.getDOMNode()).find(".op-type"), "点击切换变更类型");
        BatchChangeActions.setCurrentTab(tab);
        if (tab === BATCH_OPERATE_TYPE.ADD_SCHEDULE_LISTS) {
            this.state.stopContentHide = true;
        }
    },
    onSalesmanChange: function (sales_man) {
        Trace.traceEvent($(this.getDOMNode()).find(".change-salesman"), "点击切换销售人员");
        BatchChangeActions.setSalesMan(sales_man);
    },
    getSalesBatchParams: function () {
        let salesId = "", teamId = "", salesName = "", teamName = "";
        //客户所属销售团队的修改
        //销售id和所属团队的id
        let idArray = this.state.sales_man.split("&&");
        if (_.isArray(idArray) && idArray.length) {
            salesId = idArray[0];
            teamId = idArray[1];
        }
        //销售昵称和所属团队的团队名称
        let salesman = _.find(this.state.salesManList, item => item.user_info && item.user_info.user_id === salesId);
        if (salesman) {
            salesName = salesman.user_info ? salesman.user_info.nick_name : "";
            if (_.isArray(salesman.user_groups) && salesman.user_groups.length) {
                let salesTeam = _.find(salesman.user_groups, team => team.group_id === teamId);
                if (salesTeam) {
                    teamName = salesTeam.group_name;
                }
            }
        }
        return {
            sales_id: salesId,
            sales_nick_name: salesName,
            sales_team_id: teamId,
            sales_team_name: teamName
        };
    },
    /**
     * 变更销售/转出客户
     * @param transferType: user/transfer_customer
     * @param title: 变更销售/转出客户
     */
    doTransfer: function (transferType, title) {
        if (!this.state.sales_man) {
            // message.error(Intl.get("crm.17", "请选择销售人员"));
            BatchChangeActions.setUnSelectDataTip(Intl.get("crm.17", "请选择销售人员"));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                user_id: this.state.sales_man.split("&&")[0]
            }
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function (customer) {
                return customer.id
            });
        }
        BatchChangeActions.doBatch(transferType, condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code == 0) {
                //批量操作参数
                let is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                let totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                let batchParams = this.getSalesBatchParams();
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/crm'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: title
                });
                if (transferType === BATCH_OPERATE_TYPE.TRANSFER_CUSTOMER) {
                    //隐藏转出客户面板
                    this.refs.transferCustomer.handleCancel();
                } else {
                    //隐藏批量变更销售面板
                    this.refs.changeSales.handleCancel();
                }
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },
    addTag: function (e) {
        if (e.keyCode !== 13) return;

        const tag = e.target.value.trim();
        if (!tag) return;
        //”线索“、”转出“标签，不可以添加
        if (isClueTag(tag) || isTurnOutTag(tag)) {
            message.error(Intl.get("crm.sales.clue.add.disable", "不能手动添加'{label}'标签", {label: tag}));
            return;
        }
        this.toggleTag(tag, true);
        Trace.traceEvent(e, "按enter键添加新标签");

    },
    toggleTag: function (tag, isAdd) {

        BatchChangeActions.toggleTag({tag, isAdd});
    },
    //批量更新标签
    doChangeTag: function (type, typeText) {
        if (!_.isArray(this.state.tags) || !this.state.tags.length) {
            BatchChangeActions.setUnSelectDataTip(Intl.get("crm.212", "请选择标签"));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                labels: this.state.tags.length ? this.state.tags : null
            }
        };

        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function (customer) {
                return customer.id
            });
        }
        BatchChangeActions.doBatch(type, condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code == 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    tags: this.state.tags
                };
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/crm'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: typeText
                });
                //隐藏批量变更标签面板
                this.refs.changeTag.handleCancel();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },
    //批量修改行业
    doChangeIndustry: function () {
        let industryStr = this.state.selected_industries.join(',');
        if (!industryStr) {
            BatchChangeActions.setUnSelectDataTip(Intl.get("crm.22", "请选择行业"));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                industry: industryStr || null
            }
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function (customer) {
                return customer.id
            });
        }
        BatchChangeActions.doBatch("industry", condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code == 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    industry: industryStr
                };
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/crm'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get("crm.20", "变更行业")
                });
                //隐藏批量变更行业面板
                this.refs.changeIndustry.handleCancel();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },
    //批量修改地域
    doChangeTerritory: function () {
        let territoryObj = this.state.territoryObj;
        if (!territoryObj.city && !territoryObj.county && !territoryObj.province) {
            BatchChangeActions.setUnSelectDataTip(Intl.get("realm.edit.address.placeholder", "请选择地址"));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: territoryObj
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function (customer) {
                return customer.id
            });
        }
        BatchChangeActions.doBatch("address", condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code == 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = this.state.territoryObj;
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/crm'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get("crm.21", "变更地域")
                });
                //隐藏批量变更地域面板
                this.refs.changeAddress.handleCancel();
                //清空选择的地域信息
                this.updateLocation("");
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },
    //批量修改行政级别
    doChangeAdministrativeLevel: function () {
        let administrativeLevel = this.state.administrative_level;
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                administrative_level: administrativeLevel || ""
            }
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function (customer) {
                return customer.id
            });
        }
        BatchChangeActions.doBatch("administrative_level", condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code == 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    administrative_level: administrativeLevel
                };
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/crm'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get("crm.administrative.level.change", "变更行政级别")
                });
                //隐藏批量变更行业面板
                this.refs.changeAdministrativeLevel.handleCancel();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },
    //批量添加联系计划
    doAddScheduleLists: function () {
        //调用子组件中保存数据的方法
        this.refs.crmScheduleForm.handleSave();
    },
    //添加完联系计划后，关闭下拉面板
    closeContent: function () {
        this.refs.addSchedule.handleCancel();
    },
    //取消添加日程
    cancelAddSchedule: function () {
        this.state.stopContentHide = false;
        this.setState({
            stopContentHide: this.state.stopContentHide
        });
        this.refs.crmScheduleForm.handleCancel();
    },
    handleSubmit: function (e) {
        Trace.traceEvent(e, "点击变更按钮");
        var currentTab = this.state.currentTab;
        switch (currentTab) {
            case BATCH_OPERATE_TYPE.CHANGE_SALES:
                this.doTransfer(BATCH_OPERATE_TYPE.CHANGER_SALES_URL, Intl.get("crm.18", "变更销售人员"));
                break;
            case BATCH_OPERATE_TYPE.TRANSFER_CUSTOMER:
                this.doTransfer(BATCH_OPERATE_TYPE.TRANSFER_CUSTOMER, Intl.get("crm.customer.transfer", "转出客户"));
                break;
            case BATCH_OPERATE_TYPE.CHANGE_TAG:
                this.doChangeTag(BATCH_OPERATE_TYPE.CHANGE_LABEL, Intl.get("crm.206", "更新标签"));
                break;
            case BATCH_OPERATE_TYPE.ADD_TAG:
                this.doChangeTag(BATCH_OPERATE_TYPE.ADD_LABEL, Intl.get("crm.205", "添加标签"));
                break;
            case BATCH_OPERATE_TYPE.REMOVE_TAG:
                this.doChangeTag(BATCH_OPERATE_TYPE.REMOVE_LABEL, Intl.get("crm.204", "移除标签"));
                break;
            case BATCH_OPERATE_TYPE.CHANGE_INDUSTRY:
                this.doChangeIndustry();
                break;
            case BATCH_OPERATE_TYPE.CHANGE_TERRITORY:
                //批量修改地域
                this.doChangeTerritory();
                break;
            case BATCH_OPERATE_TYPE.CHANGE_ADMINISTRATIVE_LEVEL:
                //批量修改行政级别
                this.doChangeAdministrativeLevel();
                break;
            case BATCH_OPERATE_TYPE.ADD_SCHEDULE_LISTS:
                //批量添加联系计划
                this.doAddScheduleLists();
                break;
        }
    },
    industryChange: function (industry) {
        Trace.traceEvent($(this.getDOMNode()).find(".block-industry-edit"), "选择行业");
        BatchChangeActions.industryChange([industry]);
    },
    renderIndustryBlock: function () {
        let dataList = [], industryList = this.state.industries.list;
        if (_.isArray(industryList)) {
            dataList = industryList.map(item => {
                return {name: item.industry, value: item.industry};
            });
        }
        return (
            <div className="op-pane change-industry">
                <AlwaysShowSelect
                    placeholder={Intl.get("crm.22", "请选择行业")}
                    value={this.state.selected_industries.join(',')}
                    onChange={this.industryChange}
                    notFoundContent={dataList.length ? Intl.get("crm.23", "无相关行业") : Intl.get("crm.24", "暂无行业")}
                    dataList={dataList}
                />
            </div>
        );
    },
    renderAdministrativeLevelBlock: function () {
        let dataList = crmUtil.administrativeLevels.map(item => {
            return {name: item.level, value: item.id};
        });
        return (
            <div className="op-pane change-administrative-level">
                <AlwaysShowSelect
                    placeholder={Intl.get("crm.select.level", "请选择行政级别")}
                    value={this.state.administrative_level}
                    hasClearOption={true}
                    onChange={this.administrativeLevelChange}
                    notFoundContent={Intl.get("crm.no.level", "无相关行政级别")}
                    dataList={dataList}
                />
            </div>
        );
    },
    //更新地址
    updateLocation: function (address) {
        BatchChangeActions.locationChange(address);
        Trace.traceEvent($(this.getDOMNode()).find(".change-territory"), "选择地址");
    },
    //标签变更类型的切换
    onChangeTag: function (e, v) {
        this.setCurrentTab(e.target.value);
    },
    renderSalesBlock: function () {
        let dataList = [];
        //展示其所在团队的成员列表
        this.state.salesManList.forEach(function (salesman) {
            let teamArray = salesman.user_groups;
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                teamArray.forEach(team => {
                    dataList.push({
                        name: salesman.user_info.nick_name + "(" + team.group_name + ")",
                        value: salesman.user_info.user_id + "&&" + team.group_id
                    })
                });
            }
        });
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get("crm.17", "请选择销售人员")}
                    value={this.state.sales_man}
                    onChange={this.onSalesmanChange}
                    notFoundContent={dataList.length ? Intl.get("crm.29", "暂无销售") : Intl.get("crm.30", "无相关销售")}
                    dataList={dataList}
                />
            </div>
        );
    },
    //批量添加联系计划
    renderScheduleLists: function () {
        //批量操作选中的客户
        var selectedCustomer = this.props.selectedCustomer;
        const newSchedule = {
            customer_id: selectedCustomer[0].id,
            customer_name: selectedCustomer[0].name,
            start_time: "",
            end_time: "",
            alert_time: "",
            topic: "",
            edit: true
        };
        return (
            <div className="batch-add-schedule">
                <CrmScheduleForm
                    currentSchedule={newSchedule}
                    selectedCustomer={selectedCustomer}
                    ref="crmScheduleForm"
                    cancelAddSchedule={this.cancelAddSchedule}
                    closeContent={this.closeContent}
                />
            </div>
        )
    },
    renderAddressBlock: function () {
        let territoryObj = this.state.territoryObj;//地域
        return (
            <div className="op-pane change-territory">
                {<AntcAreaSelection labelCol="0" wrapperCol="24" width="210"
                                    isAlwayShow={true}
                                    prov={territoryObj.province} city={territoryObj.city}
                                    county={territoryObj.county}
                                    updateLocation={this.updateLocation}/>}
            </div>
        );
    },
    renderTagChangeBlock: function () {
        let selectedTagsArray = this.state.tags ? this.state.tags : [];
        let recommendTagsArray = _.isArray(this.state.recommendTags) ? this.state.recommendTags : [];
        let unionTagsArray = _.union(recommendTagsArray, selectedTagsArray);
        //过滤掉“线索”、“转出”标签，“线索“、“转出”标签不可添加、修改、删除
        unionTagsArray = _.filter(unionTagsArray, tag => tag != Intl.get("crm.sales.clue", "线索") && tag != Intl.get("crm.qualified.roll.out", "转出"));
        let tagsJsx = unionTagsArray.map((tag, index) => {
            let className = "customer-tag";
            className += selectedTagsArray.indexOf(tag) > -1 ? " tag-selected" : "";
            return (<span key={index} onClick={() => this.toggleTag(tag)} className={className}
                          data-tracename="点击选中/取消选中某个标签">{tag}</span>);
        });
        return (
            <div className="op-pane change-tag">
                <RadioGroup onChange={this.onChangeTag} value={this.state.currentTab}>
                    <Radio
                        value={BATCH_OPERATE_TYPE.CHANGE_TAG}>{Intl.get("crm.206", "更新标签")}</Radio>
                    <Radio value={BATCH_OPERATE_TYPE.ADD_TAG}>{Intl.get("crm.205", "添加标签")}</Radio>
                    <Radio
                        value={BATCH_OPERATE_TYPE.REMOVE_TAG}>{Intl.get("crm.204", "移除标签")}</Radio>
                </RadioGroup>
                <div className="block-tag-edit">
                    {tagsJsx}
                </div>
                {this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_TAG || this.state.currentTab == BATCH_OPERATE_TYPE.ADD_TAG ? (
                    <Input placeholder={Intl.get("crm.28", "按Enter键添加新标签")}
                           onChange={this.setField.bind(this, "tag")}
                           value={this.state.formData.tag}
                           onKeyUp={this.addTag}
                    />
                ) : ""}
            </div>
        );
    },
    clearSelectSales: function () {
        BatchChangeActions.setSalesMan("");
    },
    clearSelectLocation: function () {
        BatchChangeActions.locationChange("");
    },
    clearSelectIndustry: function () {
        BatchChangeActions.industryChange([]);
    },
    clearSelectTags: function () {
        BatchChangeActions.clearSelectedTag();
    },
    administrativeLevelChange: function (level) {
        BatchChangeActions.administrativeLevelChange(level);
    },
    render: function () {
        const changeBtns = {
            tag: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_TAG)}>{Intl.get("crm.19", "变更标签")}</Button>),
            industry: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_INDUSTRY)}>{Intl.get("crm.20", "变更行业")}</Button>),
            administrativeLevel: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_ADMINISTRATIVE_LEVEL)}>{Intl.get("crm.administrative.level.change", "变更行政级别")}</Button>),
            address: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_TERRITORY)}>{Intl.get("crm.21", "变更地域")}</Button>),
            sales: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_SALES)}>{Intl.get("crm.18", "变更销售人员")}</Button>),
            transfer: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.TRANSFER_CUSTOMER)}>{Intl.get("crm.qualified.roll.out", "转出")}</Button>),
            schedule: (<Button
                onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.ADD_SCHEDULE_LISTS)}>{Intl.get("crm.214", "添加联系计划")}</Button>)
        };
        return (
            <div className="crm-batch-change-container">
                <AntcDropdown
                    ref="changeTag"
                    content={changeBtns.tag}
                    overlayTitle={Intl.get("common.tag", "标签")}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderTagChangeBlock()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get("crm.32", "变更")}
                    cancelTitle={Intl.get("common.cancel", "取消")}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectTags}
                />
                <AntcDropdown
                    ref="changeIndustry"
                    content={changeBtns.industry}
                    overlayTitle={Intl.get("realm.industry", "行业")}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderIndustryBlock()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get("crm.32", "变更")}
                    cancelTitle={Intl.get("common.cancel", "取消")}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectIndustry}
                />
                <AntcDropdown
                    ref="changeAdministrativeLevel"
                    content={changeBtns.administrativeLevel}
                    overlayTitle={Intl.get("crm.administrative.level.change", "变更行政级别")}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderAdministrativeLevelBlock()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get("crm.32", "变更")}
                    cancelTitle={Intl.get("common.cancel", "取消")}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.administrativeLevelChange.bind(this, "")}
                />
                <AntcDropdown
                    ref="changeAddress"
                    content={changeBtns.address}
                    overlayTitle={Intl.get("realm.address", "地址")}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderAddressBlock()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get("crm.32", "变更")}
                    cancelTitle={Intl.get("common.cancel", "取消")}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectLocation}
                />
                <AntcDropdown
                    ref="changeSales"
                    content={changeBtns.sales}
                    overlayTitle={Intl.get("user.salesman", "销售人员")}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get("crm.32", "变更")}
                    cancelTitle={Intl.get("common.cancel", "取消")}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                />
                {   //普通销售不可做转出操作
                    !userData.getUserData().isCommonSales ? (<AntcDropdown
                        ref="transferCustomer"
                        content={changeBtns.transfer}
                        overlayTitle={Intl.get("user.salesman", "销售人员")}
                        isSaving={this.state.isLoading}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={this.handleSubmit}
                        okTitle={Intl.get("crm.qualified.roll.out", "转出")}
                        cancelTitle={Intl.get("common.cancel", "取消")}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                    />) : null
                }
                <AntcDropdown
                    ref="addSchedule"
                    stopContentHide={this.state.stopContentHide}
                    content={changeBtns.schedule}
                    overlayTitle={Intl.get("crm.214", "添加联系计划")}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderScheduleLists()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get("common.add", "添加")}
                    cancelTitle={Intl.get("common.cancel", "取消")}
                    clearSelectData={this.cancelAddSchedule}
                />
            </div>
        );
    }
});

module.exports = CrmBatchChange;

