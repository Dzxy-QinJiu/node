import '../../css/crm-basic-info.less';
import classNames from 'classnames';
var CRMStore = require("../../store/basic-store");
var CRMAction = require("../../action/basic-actions");
var SalesTeamStore = require("../../../../sales_team/public/store/sales-team-store");
var PrivilegeChecker = require("../../../../../components/privilege/checker").PrivilegeChecker;
let hasPrivilege = require("../../../../../components/privilege/checker").hasPrivilege;
var GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
import {Tag, Spin} from "antd";
var history = require("../../../../../public/sources/history");
var FilterAction = require("../../action/filter-actions");
let NameTextareaField = require("./name-textarea-field");
let CommentTextareaField = require("./comment-textarea-field");
let IndustrySelectField = require("./industry-select-field");
let LocationSelectField = require("./location-select-field");
let CrmAction = require("../../action/crm-actions");
let CrmRepeatAction = require("../../action/customer-repeat-action");
import BasicEditInputField from "CMP_DIR/basic-edit-field/input";
import BasicEditSelectField from "CMP_DIR/basic-edit-field/select";
import crmUtil from "../../utils/crm-util";
import CrmBasicAjax from "../../ajax/index";
import userData from "PUB_DIR/sources/user-data";
import {DetailEditBtn} from "CMP_DIR/rightPanel";

function getStateFromStore(isMerge) {
    return {
        basicIsLoading: CRMStore.getBasicState(),
        basicData: _.extend({}, CRMStore.getBasicInfo()),
        salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
        basicPanelH: getBasicPanelH(isMerge),
        showDetailFlag: false,//控制客户详情展示隐藏的标识
        editNameFlag: false,//编辑客户名的标识
        editBasicFlag: false//编辑客户基本信息的标识
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

var BasicData = React.createClass({
    getInitialState: function () {
        return getStateFromStore(this.props.isMerge);
    },
    onChange: function () {
        this.setState({
            basicIsLoading: CRMStore.getBasicState(),
            basicData: _.extend({}, CRMStore.getBasicInfo()),
        });
    },
    componentDidMount: function () {
        this.autoLayout();
        CRMStore.listen(this.onChange);
        CRMAction.getBasicData(this.props.curCustomer);
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
        if (this.state.basicData.id !== nextProps.curCustomer.id) {
            this.setState({
                showDetailFlag: false,
                editNameFlag: false
            });
        }
    },
    componentWillUnmount: function () {
        CRMStore.unlisten(this.onChange);
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
        setTimeout(() => {
            this.props.setTabsContainerHeight();
        });
    },
    //设置编辑客户名的标识
    setEditNameFlag: function (flag) {
        this.setState({editNameFlag: flag});
    },
    //设置编辑基本资料的标识
    setEditBasicFlag: function (flag) {
        this.setState({editBasicFlag: flag});
    },
    //渲染客户的基本信息
    renderBasicBlock: function (basicData) {
        //地域
        let location = [];
        if (basicData.province) {
            location.push(basicData.province);
        }
        if (basicData.city) {
            location.push(basicData.city);
        }
        if (basicData.county) {
            location.push(basicData.county);
        }
        let level = crmUtil.filterAdministrativeLevel(basicData.administrative_level);
        return (
            <div className="basic-info-detail-block">
                <div className="basic-info-detail-show">
                    <div className="basic-info-administrative basic-info-item">
                        <span className="iconfont icon-administrative basic-info-icon"/>
                        <span
                            className="administrative-text basic-info-text">{this.getAdministrativeLevel(level)}</span>
                    </div>
                    <div className="basic-info-indestry basic-info-item">
                        <span className="iconfont icon-industry basic-info-icon"/>
                        <span className="indestry-text  basic-info-text">{basicData.industry}</span>
                    </div>
                    <div className="basic-info-address basic-info-item">
                        <span className="iconfont icon-address basic-info-icon"/>
                        <span className="address-text basic-info-text">{location.join('/')}</span>
                        <span className="address-detail-text  basic-info-text">{basicData.address}</span>
                    </div>
                    <div className="basic-info-remark basic-info-item">
                        <span className="iconfont icon-remark basic-info-icon"/>
                        <span className="remark-text  basic-info-text">{basicData.remarks}</span>
                    </div>
                    {hasPrivilege("CUSTOMER_UPDATE_INDUSTRY") ? (
                        <DetailEditBtn title={Intl.get("common.edit", "编辑")}
                                       modifySuccess={this.editBasicSuccess}
                                       onClick={this.setEditBasicFlag.bind(this, true)}/>) : null}
                </div>
            </div>);
    },
    render: function () {
        var basicData = this.state.basicData ? this.state.basicData : {};
        //是否是关注客户的标识
        let interestFlag = basicData.interest === "true";
        return (
            <div className="basic-info-contianer">
                {this.state.editNameFlag ? (
                    <NameTextareaField
                        isMerge={this.props.isMerge}
                        updateMergeCustomer={this.props.updateMergeCustomer}
                        customerId={basicData.id}
                        name={basicData.name}
                        modifySuccess={this.editBasicSuccess}
                        setEditNameFlag={this.setEditNameFlag}
                        showRightPanel={this.props.showRightPanel}
                    /> ) : (
                    <div className="basic-info-title-block">
                        <div className="basic-info-name">
                            {basicData.customer_label ? (
                                <Tag className={crmUtil.getCrmLabelCls(basicData.customer_label)}>
                                    {basicData.customer_label.substr(0, 1)}</Tag>) : null
                            }
                            {basicData.qualify_label ? (
                                <Tag className={crmUtil.getCrmLabelCls(basicData.qualify_label)}>
                                    {basicData.qualify_label == 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                                        basicData.qualify_label == 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ""}</Tag>) : null
                            }
                            <span className="basic-name-text">{basicData.name}</span>
                            {hasPrivilege("CUSTOMER_UPDATE_NAME") ? (
                                <DetailEditBtn title={Intl.get("common.edit", "编辑")}
                                               onClick={this.setEditNameFlag.bind(this, true)}/>) : null}
                        </div>
                        <div className="basic-info-btns">
                        <span
                            className={classNames("iconfont icon-detail-list", {"btn-active": this.state.showDetailFlag})}
                            title={this.state.showDetailFlag ? Intl.get("crm.basic.detail.hide", "收起详情") :
                                Intl.get("crm.basic.detail.show", "展开详情")}
                            onClick={this.toggleBasicDetail}/>
                            <span
                                className={classNames("iconfont", {
                                    "icon-interested": interestFlag,
                                    "icon-uninterested": !interestFlag
                                })}
                                title={interestFlag ? Intl.get("crm.customer.uninterested", "取消关注") :
                                    Intl.get("crm.customer.interested", "添加关注")}
                                onClick={this.props.handleFocusCustomer.bind(this, basicData)}
                            />
                        </div>
                    </div>
                )}
                {this.state.showDetailFlag ? this.renderBasicBlock(basicData) : null}
            </div>
        );
    }
});

module.exports = BasicData;

