/**
 * 批量变更标签和销售人员
 */

require('../scss/crm-right-panel.scss');
require('../scss/batch-change.scss');

var rightPanelUtil = require("../../../../components/rightPanel/index");
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var BatchChangeStore = require("../store/batch-change-store");
var crmStore = require("../store/crm-store");
var BatchChangeActions = require("../action/batch-change-actions");
var Spinner = require('../../../../components/spinner');
var AreaSelection = require("../../../../components/AreaSelection");
import { Tag, Button, Icon, Input, Form, Select, message, Radio } from "antd";
import ValidateMixin from "../../../../mixins/ValidateMixin";
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
var Option = Select.Option;
var userData = require("../../../../public/sources/user-data");
var batchOperate = require("../../../../public/sources/push/batch");
import Trace from "LIB_DIR/trace";
const BATCH_OPERATE_TYPE = {
    CHANGE_SALES: "changeSales",//变更销售人员
    CHANGE_TAG: "changeTag",//更新标签
    CHANGE_LABEL: "change_label",//更新标签url中传的type
    ADD_TAG: "addTag",//添加标签
    ADD_LABEL: "add_label",//添加标签url中传的type
    REMOVE_TAG: "removeTag",//移除标签
    REMOVE_LABEL: "remove_label", //移除标签url中传的type
    CHANGE_INDUSTRY: "changeIndustry",//变更行业
    CHANGE_TERRITORY: "changeTerritory"//变更地域
};

var CrmBatchChange = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function () {
        return BatchChangeStore.getState();
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
        Trace.traceEvent($(this.getDOMNode()).find(".op-type"),"点击切换变更类型");
        BatchChangeActions.setCurrentTab(tab);
    },
    onSalesmanChange: function (sales_id, sales_name) {
        Trace.traceEvent($(this.getDOMNode()).find(".change-salesman"),"点击切换销售人员");
        BatchChangeActions.setSalesMan({sales_id, sales_name});
    },
    onSalesteamChange: function (value, text) {
        BatchChangeActions.changeSalesTeam({
            sales_team_name: text,
            sales_team_id: value
        });
    },
    doTransfer: function () {
        if (!this.state.salesman_id) {
            message.error(Intl.get("crm.17", "请选择销售人员"));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                user_id: this.state.salesman_id
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
        var _this = this;
        BatchChangeActions.doBatch("user", condition, (result) => {
            if (result.code == 0) {
                message.success(Intl.get("user.operate.success", "操作成功"));
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    sales_id: this.state.salesman_id,
                    sales_nick_name: this.state.salesman_nick_name,
                    sales_team_id: this.state.sales_team_id,
                    sales_team_name: this.state.sales_team
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
                    typeText: Intl.get("crm.18", "变更销售人员")
                });
                //隐藏批量操作面板
                _this.props.hideBatchChange();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
            BatchChangeActions.setLoadingState(false);
        });
    },
    addTag: function (e) {
        if (e.keyCode !== 13) return;

        const tag = e.target.value.trim();
        if (!tag) return;

        this.toggleTag(tag, true);
        Trace.traceEvent(e,"按enter键添加新标签");

    },
    toggleTag: function (tag, isAdd) {

        BatchChangeActions.toggleTag({tag, isAdd});
    },
    //批量更新标签
    doChangeTag: function (type, typeText) {
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
        var _this = this;
        BatchChangeActions.doBatch(type, condition, (result) => {
            if (result.code == 0) {
                message.success(Intl.get("user.operate.success", "操作成功"));
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
                //隐藏批量操作面板
                _this.props.hideBatchChange();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
            BatchChangeActions.setLoadingState(false);
        });
    },
    //批量修改行业
    doChangeIndustry: function () {
        BatchChangeActions.setLoadingState(true);
        var industryStr = this.state.selected_industries.join(',');
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
        var _this = this;
        BatchChangeActions.doBatch("industry", condition, (result) => {
            if (result.code == 0) {
                message.success(Intl.get("user.operate.success", "操作成功"));
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
                //隐藏批量操作面板
                _this.props.hideBatchChange();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
            BatchChangeActions.setLoadingState(false);
        });
    },
    //批量修改地域
    doChangeTerritory: function () {
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: this.state.territoryObj
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
        var _this = this;
        BatchChangeActions.doBatch("address", condition, (result) => {
            if (result.code == 0) {
                message.success(Intl.get("user.operate.success", "操作成功"));
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
                //隐藏批量操作面板
                _this.props.hideBatchChange();
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
            BatchChangeActions.setLoadingState(false);
        });
    },
    handleSubmit: function (e) {
        Trace.traceEvent(e, "点击变更按钮");
        var currentTab = this.state.currentTab;
        switch (currentTab) {
            case BATCH_OPERATE_TYPE.CHANGE_SALES:
                this.doTransfer();
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
        }
    },
    industryChange: function (industry) {
        Trace.traceEvent($(this.getDOMNode()).find(".block-industry-edit"),"选择行业");
        BatchChangeActions.industryChange([industry]);
    },
    renderIndustryList: function () {
        return <div className="block-tag-edit block-industry-edit">
            <Select
                showSearch
                placeholder={Intl.get("crm.22", "请选择行业")}
                optionFilterProp="children"
                value={this.state.selected_industries.join(',')}
                onChange={this.industryChange}
                notFoundContent={this.state.industries.list.length ? Intl.get("crm.23", "无相关行业") : Intl.get("crm.24", "暂无行业")}
            >
                {
                    this.state.industries.list.map((item) => {
                        return <Select.Option value={item.industry}>{item.industry}</Select.Option>
                    })
                }
            </Select>
        </div>
    },
    renderIndustryArea: function () {
        return <FormItem
            label={Intl.get("realm.industry", "行业")}
            labelCol={{span: 5}}
            wrapperCol={{span: 13}}
        >
            {this.renderIndustryList()}
        </FormItem>;
    },
    //更新地址
    updateLocation: function (address) {
        var location = address.split('/');
        this.state.territoryObj.province = location[0] || "";
        this.state.territoryObj.city = location[1] || "";
        this.state.territoryObj.county = location[2] || "";
        Trace.traceEvent($(this.getDOMNode()).find(".change-territory"),"选择地址");
    },
    //是否是普通销售(多角色时：非销售领导、域管理员)的判断
    isSales: function () {
        return userData.hasRole("sales") && !userData.isSalesManager()
    },
    //标签变更类型的切换
    onChangeTag: function (e, v) {
        this.setCurrentTab(e.target.value);
    },
    render: function () {
        var _this = this;
        let salesmanOptions = [];
        if (this.isSales()) {
            //普通销售(多角色时：非销售领导、域管理员),展示所属销售所在团队的成员列表
            salesmanOptions = this.state.salesManList.map(function (salesman) {
                return (<Option value={salesman.userId}
                                key={salesman.userId}>{salesman.nickName}</Option>);
            });
        } else {
            //销售领导、域管理员,展示其所有（子）团队的成员列表
            salesmanOptions = this.state.salesManList.map(function (salesman) {
                return (<Option value={salesman.user_info.user_id}
                                key={salesman.user_info.user_id}>{salesman.user_info.nick_name}</Option>);
            });
        }
        var salesteamOptions = this.state.sales_team_list.map(function (salesteam) {
            return (<Option value={salesteam.group_id} key={salesteam.group_id}>{salesteam.group_name}</Option>);
        });

        var selectedTagsArray = this.state.tags ? this.state.tags : [];
        var recommendTagsArray = _.isArray(this.state.recommendTags) ? this.state.recommendTags : [];
        var unionTagsArray = _.union(recommendTagsArray, selectedTagsArray);
        var tagsJsx = unionTagsArray.map(function (tag, index) {
            let className = "customer-tag";
            className += selectedTagsArray.indexOf(tag) > -1 ? " tag-selected" : "";
            return (<span key={index} onClick={() => _this.toggleTag(tag)} className={className} data-tracename="点击选中/取消选中某个标签">{tag}</span>);
        });
        let selectedNum;
        if (this.props.selectAllMatched) {
            selectedNum = this.props.matchedNum;
        } else {
            selectedNum = this.props.selectedCustomer.length;
        }
        let territoryObj = this.state.territoryObj;//地域
        return (
            <RightPanel showFlag={true} className="crm-right-panel batch-change" data-tracename="批量变更面板">
                <div className="right-panel-content">
                    <RightPanelClose onClick={this.props.hideBatchChange} data-tracename="点击关闭批量变更面板"/>
                    <div className="crm-right-panel-content">
                        <div className="panel-title"><ReactIntl.FormattedMessage id="user.batch.change"
                                                                                 defaultMessage="批量变更"/></div>
                        <div className="info-block">
                            <div className="selected-number">
                                <ReactIntl.FormattedMessage
                                    id="crm.26"
                                    defaultMessage={`已选择{count}个客户`}
                                    values={{
                                                "count": <span className="the-number">{selectedNum}</span>
                                             }}
                                />
                            </div>
                            <div className="op-type">
                                <span className="op-title"><ReactIntl.FormattedMessage id="user.batch.change.type"
                                                                                       defaultMessage="变更类型"/></span>
                                <span
                                    className={"op-tab" + (this.state.currentTab.indexOf("Tag") != -1? " current" : "")}
                                    onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_TAG)}><ReactIntl.FormattedMessage
                                    id="crm.19" defaultMessage="变更标签"/></span>
                                <span
                                    className={"op-tab" + (this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_INDUSTRY? " current" : "")}
                                    onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_INDUSTRY)}><ReactIntl.FormattedMessage
                                    id="crm.20" defaultMessage="变更行业"/></span>
                                <span
                                    className={"op-tab" + (this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_TERRITORY? " current" : "")}
                                    onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_TERRITORY)}><ReactIntl.FormattedMessage
                                    id="crm.21" defaultMessage="变更地域"/></span>
                                <span
                                    className={"op-tab" + (this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_SALES? " current" : "")}
                                    onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.CHANGE_SALES)}><ReactIntl.FormattedMessage
                                    id="crm.18" defaultMessage="变更销售人员"/></span>
                            </div>
                        </div>
                        <div className="op-block">
                            {this.state.currentTab.indexOf("Tag") != -1 ?
                                <div className="op-pane change-tag">
                                    <RadioGroup onChange={this.onChangeTag} value={this.state.currentTab}>
                                        <Radio
                                            value={BATCH_OPERATE_TYPE.CHANGE_TAG}>{Intl.get("crm.206", "更新标签")}</Radio>
                                        <Radio value={BATCH_OPERATE_TYPE.ADD_TAG}>{Intl.get("crm.205", "添加标签")}</Radio>
                                        <Radio
                                            value={BATCH_OPERATE_TYPE.REMOVE_TAG}>{Intl.get("crm.204", "移除标签")}</Radio>
                                    </RadioGroup>
                                    <FormItem
                                        label={Intl.get("common.tag", "标签")}
                                        labelCol={{span: 5}}
                                        wrapperCol={{span: 13}}
                                    >
                                        <div className="block-tag-edit">
                                            {tagsJsx}
                                        </div>
                                        {this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_TAG || this.state.currentTab == BATCH_OPERATE_TYPE.ADD_TAG ? (
                                            <div>
                                                <Input placeholder={Intl.get("crm.28", "按Enter键添加新标签")}
                                                       onChange={this.setField.bind(this , "tag")}
                                                       value={this.state.formData.tag}
                                                       onKeyUp={this.addTag}
                                                />
                                            </div>) : ""}
                                    </FormItem>
                                </div> : ""}
                            {this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_SALES ?
                                <div className="op-pane change-salesman">
                                    <div className="select-sales select-salesman">
                                        <ReactIntl.FormattedMessage id="user.salesman" defaultMessage="销售人员"/>
                                        <Select
                                            showSearch
                                            placeholder={Intl.get("crm.17", "请选择销售人员")}
                                            optionFilterProp="children"
                                            onChange={this.onSalesmanChange}
                                            notFoundContent={!salesmanOptions.length ? Intl.get("crm.29", "暂无销售") : Intl.get("crm.30", "无相关销售")}
                                            value={this.state.salesman_id}
                                        >
                                            {salesmanOptions}
                                        </Select>
                                    </div>
                                    <div className="select-sales select-salesman">
                                        <ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队"/>
                                        <Select
                                            placeholder={Intl.get("crm.31", "请选择销售团队")}
                                            optionFilterProp="children"
                                            onChange={this.onSalesteamChange}
                                            value={this.state.sales_team_id}
                                            notFoundContent={Intl.get("member.no.groups", "暂无团队")}
                                        >
                                            {salesteamOptions}
                                        </Select>
                                    </div>
                                </div> : ""}
                            {this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_INDUSTRY ?
                                <div className="op-pane change-industry">
                                    {this.renderIndustryArea()}
                                </div> : ""}
                            {this.state.currentTab == BATCH_OPERATE_TYPE.CHANGE_TERRITORY ?
                                <div className="op-pane change-territory">
                                    {<AreaSelection labelCol="5" wrapperCol="13" width="420"
                                                    prov={territoryObj.province} city={territoryObj.city}
                                                    county={territoryObj.county}
                                                    updateLocation={this.updateLocation}/>}
                                </div> : ""}
                        </div>
                        <div className="op-buttons">
                            <RightPanelCancel onClick={this.props.hideBatchChange}>
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                            </RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit}>
                                <ReactIntl.FormattedMessage id="crm.32" defaultMessage="变更"/>
                            </RightPanelSubmit>
                        </div>
                    </div>
                </div>
                {
                    this.state.isLoading ?
                        (<Spinner className="isloading"/>) :
                        (null)
                }
            </RightPanel>
        );
    }
});

module.exports = CrmBatchChange;

