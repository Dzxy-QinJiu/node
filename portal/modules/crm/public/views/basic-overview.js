import '../css/basic-overview.less';
import DetailCard from "CMP_DIR/detail-card";
import {hasPrivilege} from "CMP_DIR/privilege/checker";
import TagCard from "CMP_DIR/detail-card/tag-card";
import SalesTeamCard from "./basic_info/sales-team-card";
import {isClueTag, isTurnOutTag, isHasCallBackTag} from "../utils/crm-util";
import classNames from 'classnames';
var basicOverviewStore = require("../store/basic-overview-store");
var basicOverviewAction = require("../action/basic-overview-actions");
var SalesTeamStore = require("../../../sales_team/public/store/sales-team-store");
var PrivilegeChecker = require("CMP_DIR/privilege/checker").PrivilegeChecker;
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import {Tag, Spin, message} from "antd";
var history = require("../../../../public/sources/history");
var FilterAction = require("../action/filter-actions");
let CrmAction = require("../action/crm-actions");
let CrmRepeatAction = require("../action/customer-repeat-action");
import crmUtil from "../utils/crm-util";
import crmAjax from "../ajax";
import batchAjax from "../ajax/batch-change-ajax";
import userData from "PUB_DIR/sources/user-data";
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import CustomerRecord from "./customer_record";
import ScheduleItem from "./schedule/schedule-item";
import Trace from "LIB_DIR/trace";
import RightPanelScrollBar from "./components/rightPanelScrollBar";

var BasicOverview = React.createClass({
    getInitialState: function() {
        return {
            ...basicOverviewStore.getState(),
            salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
            showDetailFlag: false,//控制客户详情展示隐藏的标识
            recommendTags: []//推荐标签
        };
    },
    onChange: function() {
        this.setState({...basicOverviewStore.getState()});
    },
    componentDidMount: function() {
        basicOverviewStore.listen(this.onChange);
        basicOverviewAction.getBasicData(this.props.curCustomer);
        this.getRecommendTags();
        setTimeout(() => {
            this.getCrmUserList(this.props.curCustomer);
            this.getNotCompletedScheduleList(this.props.curCustomer);
        });
    },
    //获取推荐标签列表
    getRecommendTags: function() {
        batchAjax.getRecommendTags().then(data => {
            if (_.isArray(data.result) && data.result.length) {
                // 过滤掉线索、转出、已回访标签，保证selectedTagsArray中有”线索“、“转出”、“已回访”标签，则只展示，没有就不展示
                let recommendTags = _.filter(data.result, tag => !isClueTag(tag) && !isTurnOutTag(tag) && !isHasCallBackTag(tag));
                this.setState({recommendTags: recommendTags});
            }
        });
    },
    //获取客户开通的用户列表
    getCrmUserList: function(curCustomer) {
        if (curCustomer && curCustomer.id) {
            //该客户开通的用户个数
            let appUserLength = curCustomer && _.isArray(curCustomer.app_user_ids) ? curCustomer.app_user_ids.length : 0;
            if (appUserLength) {
                basicOverviewAction.getCrmUserList({
                    customer_id: curCustomer.id,
                    page_num: 1,
                    page_size: appUserLength
                });
            } else {
                basicOverviewAction.setCrmUserList([]);
            }
        }
    },
    //获取未完成的日程列表
    getNotCompletedScheduleList: function(curCustomer) {
        if (curCustomer && curCustomer.id) {
            basicOverviewAction.getNotCompletedScheduleList({
                customer_id: curCustomer.id,
                page_size: 100,
                status: false,
                type: "calls",
                sort_field: 'start_time',
                order: "ascend"
            });
        }
    },

    componentWillReceiveProps: function(nextProps) {
        basicOverviewAction.getBasicData(nextProps.curCustomer);
        if (nextProps.curCustomer && nextProps.curCustomer.id !== this.state.basicData.id) {
            setTimeout(() => {
                this.getCrmUserList(nextProps.curCustomer);
                this.getNotCompletedScheduleList(nextProps.curCustomer);
            });
        }
    },
    componentWillUnmount: function() {
        basicOverviewStore.unlisten(this.onChange);
    },

    //展示按客户搜索到的用户列表
    triggerUserList: function() {
        //获取客户基本信息
        var basicData = this.state.basicData || {};
        this.props.ShowCustomerUserListPanel({customerObj: basicData || {}});
    },
    //修改客户基本资料成功后的处理
    editBasicSuccess: function(newBasic) {
        if (this.props.isMerge) {
            //合并面板的修改保存
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(newBasic);
        } else if (this.props.isRepeat) {
            //重客户的修改
            CrmRepeatAction.editBasicSuccess(newBasic);
        } else {
            CrmAction.editBasicSuccess(newBasic);
            //如果修改的是标签，则刷新标签列表
            if (newBasic.labels) {
                FilterAction.getTagList();
            }
            if (_.isFunction(this.props.editCustomerBasic)) {
                this.props.editCustomerBasic(newBasic);
            }
        }
    },
    getAdministrativeLevelOptions: function() {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>);
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    },
    onSelectAdministrativeLevel: function(administrative_level) {
        administrative_level = parseInt(administrative_level);
        if (!_.isNaN(administrative_level)) {
            this.state.basicData.administrative_level = parseInt(administrative_level);
            this.setState({basicData: this.state.basicData});
        }
    },
    getAdministrativeLevel: function(levelId) {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id == levelId);
        return levelObj ? levelObj.level : "";
    },
    //保存修改后的标签
    saveEditTags: function(tags, successFunc, errorFunc) {
        // 保存前先过滤掉线索、转出、已回访标签
        tags = _.filter(tags, tag => !isClueTag(tag) && !isTurnOutTag(tag) && !isHasCallBackTag(tag));
        let submitData = {
            id: this.state.basicData.id,
            type: "label",
            labels: tags
        };
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(submitData);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            crmAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    //更新列表中的标签
                    this.editBasicSuccess(submitData);
                    this.state.basicData.labels = tags;
                    this.setState({basicData: this.state.basicData});
                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, errorMsg => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        }
    },

    //是否有转出客户的权限
    enableTransferCustomer: function() {
        let isCommonSales = userData.getUserData().isCommonSales;
        let enable = false;
        //管理员有转出的权限
        if (hasPrivilege("CRM_MANAGER_TRANSFER")) {
            enable = true;
        } else if (hasPrivilege("CRM_USER_TRANSFER") && !isCommonSales) {
            //销售主管有转出的权限
            enable = true;
        }
        return enable;
    },
    //控制客户详情展示隐藏的方法
    toggleBasicDetail: function() {
        this.setState({
            showDetailFlag: !this.state.showDetailFlag
        });
    },
    //渲染有应用到期的提示
    renderExpireTip: function() {
        let crmUserList = this.state.crmUserList;
        const TRIAL_TYPE = "试用用户";
        let expireTrialUsers = [];//3天内到期的试用用户列表
        _.each(crmUserList, userObj => {
            let appList = userObj.apps;
            _.each(appList, app => {
                let end_time = app.end_time;
                //启用状态下，有到期时间的试用用户
                if (app.is_disabled !== "true" && app.end_time && app.user_type === TRIAL_TYPE) {
                    let duration = moment.duration(end_time - moment().valueOf());
                    let over_draft_days = duration.days();
                    if (over_draft_days < 3) {//概览页只提示3天内到期的试用用户
                        let overDraftTime = TimeUtil.getFutureTimeStr(end_time);
                        expireTrialUsers.push({overDraftDays: over_draft_days, overDraftTimeStr: overDraftTime});
                    }
                }
            });
        });
        if (expireTrialUsers.length) {
            //排序，优先展示短时间到期的
            expireTrialUsers.sort((obj1, obj2) => obj1.overDraftDays - obj2.overDraftDays);
            let tip = (
                <div className="app-expire-tip">
                    <span className="iconfont icon-warn-icon"/>
                    <span className="expire-tip-content">
                        {Intl.get("crm.overview.expire.tip", "有应用{days}试用到期", {days: expireTrialUsers[0].overDraftTimeStr})}
                    </span>
                    <span className="iconfont icon-arrow-right" onClick={this.turnToUserList}
                        title={Intl.get("call.record.show.customer.detail", "查看详情")}/>
                </div>);
            return (<DetailCard content={tip} className="expire-tip-contianer"/>);
        } else {
            return null;
        }
    },
    turnToUserList(){
        if (_.isFunction(this.props.changeActiveKey)) this.props.changeActiveKey("4");
    },
    refreshSrollbar(){
        //渲染完跟进记录列表后需要重新render来刷新滚动条（因为跟进记录渲染完成后不会走概览页的render，所以滚动条的高度计算还是一开始没有跟进记录时的界面高度）
        this.setState(this.state);
    },
    renderCustomerRcord: function() {
        return <CustomerRecord
            isOverViewPanel={true}
            isMerge={this.props.isMerge}
            curCustomer={this.state.basicData}
            refreshCustomerList={this.props.refreshCustomerList}
            refreshSrollbar={this.refreshSrollbar}
            changeActiveKey={this.props.changeActiveKey}
        />;
    },
    toggleScheduleContact(item, flag){
        let curSchedule = _.find(this.state.scheduleList, schedule => schedule.id == item.id);
        curSchedule.isShowContactPhone = flag;
        this.setState({scheduleList: this.state.scheduleList});
    },

    //修改状态
    handleItemStatus: function(item) {
        const user_id = userData.getUserData().user_id;
        //只能修改自己创建的日程的状态
        if (user_id != item.member_id) {
            return;
        }
        const reqData = {
            id: item.id,
            status: item.status == "false" ? "handle" : "false",
        };
        var status = item.status == "false" ? "完成" : "未完成";
        Trace.traceEvent($(this.getDOMNode()).find(".item-wrapper .ant-btn"), "修改联系计划的状态为" + status);
        basicOverviewAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    "id": item.id,
                    "status": reqData.status
                };
                basicOverviewAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败"));
            }
        });
    },
    renderScheduleItem: function(item) {
        return (<ScheduleItem item={item}
            hideDelete={true}
            hasSplitLine={false}
            isMerge={this.props.isMerge}
            toggleScheduleContact={this.toggleScheduleContact}
            handleItemStatus={this.handleItemStatus}
        />);
    },
    renderUnComplateScheduleList: function() {
        if (_.isArray(this.state.scheduleList) && this.state.scheduleList.length) {
            return _.map(this.state.scheduleList, item => {
                return (
                    <DetailCard title={ item.start_time ? moment(item.start_time).format(oplateConsts.DATE_FORMAT) : ""}
                        content={this.renderScheduleItem(item)}/>);
            });
        }
        return null;
    },
    render: function() {
        var basicData = this.state.basicData ? this.state.basicData : {};
        let tagArray = _.isArray(basicData.labels) ? basicData.labels : [];
        //线索、转出标签不可操作的标签，在immutable_labels属性中,和普通标签一起展示，但不可操作
        if (_.isArray(basicData.immutable_labels) && basicData.immutable_labels.length) {
            tagArray = basicData.immutable_labels.concat(tagArray);
        }
        return (
            <RightPanelScrollBar isMerge={this.props.isMerge}>
                <div className="basic-overview-contianer">
                    {this.renderExpireTip()}
                    <SalesTeamCard
                        isMerge={this.props.isMerge}
                        updateMergeCustomer={this.props.updateMergeCustomer}
                        enableEdit={hasPrivilege("CUSTOMER_UPDATE_SALES")}
                        enableTransfer={this.enableTransferCustomer()}
                        customerId={basicData.id}
                        userName={basicData.user_name}
                        userId={basicData.user_id}
                        salesTeam={basicData.sales_team}
                        salesTeamId={basicData.sales_team_id}
                        modifySuccess={this.editBasicSuccess}
                    />
                    { _.isArray(basicData.competing_products) && basicData.competing_products.length ? (
                        <dl className="dl-horizontal  crm-basic-item detail_item crm-basic-competing-products">
                            <TagCard title={`${Intl.get("crm.competing.products", "竞品")}:`}
                                tags={basicData.competing_products}
                                enableEdit={false}
                            />
                        </dl>
                    ) : null}
                    <TagCard title={`${Intl.get("common.tag", "标签")}:`}
                        placeholder={Intl.get("crm.input.new.tag", "请输入新标签")}
                        data={basicData}
                        tags={tagArray}
                        recommendTags={this.state.recommendTags}
                        enableEdit={hasPrivilege("CUSTOMER_UPDATE_LABEL")}
                        noDataTip={tagArray.length ? "" : Intl.get("crm.detail.no.tag", "暂无标签")}
                        saveTags={this.saveEditTags}
                    />
                    {this.renderUnComplateScheduleList()}
                    <DetailCard title={`${Intl.get("sales.frontpage.recent.record", "最新跟进")}:`}
                        content={this.renderCustomerRcord()}
                    />
                </div>
            </RightPanelScrollBar>
        );
    }
});

module.exports = BasicOverview;

