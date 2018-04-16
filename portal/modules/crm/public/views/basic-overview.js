import '../css/basic-overview.less';
import DetailCard from "CMP_DIR/detail-card";
import {hasPrivilege} from "CMP_DIR/privilege/checker"
import TagCard from "CMP_DIR/detail-card/tag-card";
import SalesTeamCard from "./basic_info/sales-team-card"
import {isClueTag, isTurnOutTag} from "../utils/crm-util";
import classNames from 'classnames';
var CRMStore = require("../store/basic-store");
var CRMAction = require("../action/basic-actions");
var SalesTeamStore = require("../../../sales_team/public/store/sales-team-store");
var PrivilegeChecker = require("CMP_DIR/privilege/checker").PrivilegeChecker;
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import {Tag, Spin} from "antd";
var history = require("../../../../public/sources/history");
var FilterAction = require("../action/filter-actions");
let CrmAction = require("../action/crm-actions");
let CrmRepeatAction = require("../action/customer-repeat-action");
import crmUtil from "../utils/crm-util";
import CrmBasicAjax from "../ajax/index";
import batchAjax from "../ajax/batch-change-ajax";
import userData from "PUB_DIR/sources/user-data";
import CustomerRecord from "./customer_record";
function getStateFromStore(isMerge) {
    return {
        basicIsLoading: CRMStore.getBasicState(),
        basicData: _.extend({}, CRMStore.getBasicInfo()),
        editShowFlag: false,
        salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
        basicPanelH: getBasicPanelH(isMerge),
        showDetailFlag: false,//控制客户详情展示隐藏的标识
        recommendTags: []//推荐标签
    };
}
function getBasicPanelH(isMerge) {
    if (isMerge) {
        //合并面板，去掉客户选择框和合并按钮所占高度
        return $(window).height() - 103;//103:顶部导航 + 顶部间距高度 53 + 50
    } else {
        return $(window).height() - 73;//73:顶部导航 + 顶部间距高度 53 + 20
    }
}

var BasicOverview = React.createClass({
    getInitialState: function () {
        return getStateFromStore(this.props.isMerge);
    },
    onChange: function () {
        this.setState({basicIsLoading: CRMStore.getBasicState(), basicData: _.extend({}, CRMStore.getBasicInfo()),});
    },
    componentDidMount: function () {
        this.autoLayout();
        CRMStore.listen(this.onChange);
        CRMAction.getBasicData(this.props.curCustomer);
        this.getRecommendTags();
    },
    //获取推荐标签列表
    getRecommendTags: function () {
        batchAjax.getRecommendTags().then(data => {
            if (_.isArray(data.result) && data.result.length) {
                //过滤掉线索、转出标签，保证selectedTagsArray中有”线索“、“转出”标签，则只展示，没有就不展示
                let recommendTags = _.filter(data.result, tag => !isClueTag(tag) && !isTurnOutTag(tag));
                this.setState({recommendTags: recommendTags});
            }
        });
    },
    autoLayout: function () {
        var _this = this;
        $(window).resize(function () {
            _this.setState({
                basicPanelH: getBasicPanelH(_this.props.isMerge)
            });
        });
    },
    componentWillReceiveProps: function (nextProps) {
        CRMAction.getBasicData(nextProps.curCustomer);
    },
    componentWillUnmount: function () {
        CRMStore.unlisten(this.onChange);
    },

    //展示编辑基本资料页面
    showEditForm: function () {
        this.setState({editShowFlag: true});
    },

    //返回基本资料展示页面
    returnInfoPanel: function () {
        this.setState({editShowFlag: false});
    },

    //提交修改
    submitBaiscForm: function (newBasicData, changedData) {
        if (this.props.isMerge) {
            //合并面板的修改保存
            this.props.updateMergeCustomer(newBasicData);
        } else {
            CRMAction.submitBaiscForm(newBasicData, changedData, () => {
                this.props.refreshCustomerList(newBasicData.id);
                FilterAction.getTagList();
            });
        }
    },
    //展示按客户搜索到的用户列表
    triggerUserList: function () {
        //获取客户基本信息
        var basicData = this.state.basicData || {};
        this.props.ShowCustomerUserListPanel({customerObj: basicData || {}});
    },
    //修改客户基本资料成功后的处理
    editBasicSuccess: function (newBasic) {
        if (this.props.isMerge) {
            //合并面板的修改保存
            this.props.updateMergeCustomer(newBasic);
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
    getAdministrativeLevelOptions: function () {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>)
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    },
    onSelectAdministrativeLevel: function (administrative_level) {
        administrative_level = parseInt(administrative_level);
        if (!_.isNaN(administrative_level)) {
            this.state.basicData.administrative_level = parseInt(administrative_level);
            this.setState({basicData: this.state.basicData});
        }
    },
    cancelAdministrativeLevel: function () {
        this.state.basicData.administrative_level = CRMStore.getBasicInfo().administrative_level;
        this.setState({basicData: this.state.basicData});
    },
    getAdministrativeLevel: function (levelId) {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id == levelId);
        return levelObj ? levelObj.level : "";
    },
    //保存修改后的标签
    saveEditTags: function (tags, successFunc, errorFunc) {
        //保存前先过滤掉线索、转出标签
        tags = _.filter(tags, tag => !isClueTag(tag) && !isTurnOutTag(tag));
        let submitData = {
            id: this.state.basicData.id,
            type: "label",
            labels: tags
        };
        CrmBasicAjax.updateCustomer(submitData).then(result => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                //更新列表中的标签
                this.editBasicSuccess(submitData);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    },

    //是否有转出客户的权限
    enableTransferCustomer: function () {
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
    toggleBasicDetail: function () {
        this.setState({
            showDetailFlag: !this.state.showDetailFlag
        });
    },
    //渲染有应用签约到期的提示
    renderExpireTip: function () {
        let tip = (
            <div className="app-expire-tip">
                <span className="iconfont icon-warn-icon"/>
                <span className="expire-tip-content">
                    {Intl.get("crm.overview.expire.tip", "有应用{days}天后签约到期", {days: "xxx"})}
                </span>
                <span className="iconfont icon-arrow-right"/>
            </div>);
        return (<DetailCard content={tip} className="expire-tip-contianer"/>);
    },
    renderCustomerRcord: function () {
        return <CustomerRecord
            isOverViewPanel={true}
            curCustomer={this.state.basicData}
            refreshCustomerList={this.props.refreshCustomerList}
        />
    },
    render: function () {
        var basicData = this.state.basicData ? this.state.basicData : {};
        let tagArray = _.isArray(basicData.labels) ? basicData.labels : [];
        //线索、转出标签不可操作的标签，在immutable_labels属性中,和普通标签一起展示，但不可操作
        if (_.isArray(basicData.immutable_labels) && basicData.immutable_labels.length) {
            tagArray = basicData.immutable_labels.concat(tagArray);
        }
        return (
            <div className="basic-overview-contianer">
                {this.renderExpireTip()}
                <SalesTeamCard
                    enableEdit={hasPrivilege("CUSTOMER_UPDATE_SALES")}
                    enableTransfer={this.enableTransferCustomer()}
                    customerId={basicData.id}
                    userName={basicData.user_name}
                    userId={basicData.user_id}
                    salesTeam={basicData.sales_team}
                    salesTeamId={basicData.sales_team_id}
                    modifySuccess={this.editBasicSuccess}
                />
                <TagCard title={`${Intl.get("common.tag", "标签")}:`}
                         placeholder={Intl.get("crm.input.new.tag", "请输入新标签")}
                         data={basicData}
                         tags={tagArray}
                         recommendTags={this.state.recommendTags}
                         enableEdit={hasPrivilege("CUSTOMER_UPDATE_LABEL")}
                         noDataTip={tagArray.length ? "" : Intl.get("crm.detail.no.tag", "暂无标签")}
                         saveTags={this.saveEditTags}
                />
                <DetailCard title={`${Intl.get("sales.frontpage.recent.record", "最新跟进")}:`}
                            content={this.renderCustomerRcord()}
                />
            </div>
        );
    }
});

module.exports = BasicOverview;

