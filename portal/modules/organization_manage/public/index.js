/**
 * Created by wangliping on 2016/10/18.
 */
var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./css/organization-es_VE.less");
}else if (language.lan() == "zh"){
    require("./css/organization-zh_CN.less");
}
var OrganizationStore = require("./store/organization-store");
var OrganizationAction = require("./action/organization-actions");
var Spinner = require("../../../components/spinner");
var TopNav = require("../../../components/top-nav");
var LeftTree = require("./views/left-tree");
var MemberList = require("./views/member-list");
var OrganizationAjax = require("./ajax/organization-ajax");
var PrivilegeChecker = require("../../../components/privilege/checker").PrivilegeChecker;
var NoData = require("../../../components/analysis-nodata");
var AlertTimer = require("../../../components/alert-timer");
var Icon = require("antd").Icon;
var Button = require("antd").Button;
var Input = require("antd").Input;
var topHeight = 87; // 22 + 65 : 添加按钮高度+顶部导航高度
var bootomHeight = 30; //距离底部高度
import {FormattedMessage,defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../../../components/react-intl-mixin';
const messages = defineMessages({
    common_save_success: {id: 'common.save.success'},//保存成功
    common_save_failed: {id: 'common.save.failed'},//保存失败
    organization_no_organization_tip: {id: 'organization.no.organization.tip'},//暂无组织，请先添加
    organization_input_placeholder: {id: 'organization.input.placeholder'},//请输入组织名称
});
var CONSTANT = {
    ORGANIZATION_IS_NULL: "organization-is-null",//没有组织时的提示信息
    SUCCESS: "success",
    ERROR: "error",
    SAVE_SUCCESS: Intl.get("common.save.success"),
    SAVE_ERROR: Intl.get("common.save.failed")
};

var OrganizationPage = React.createClass({
    mixins: [reactIntlMixin],
    getInitialState: function () {
        var data = OrganizationStore.getState();
        data.containerHeight = this.containerHeightFnc();
        data.containerWidth = this.containerWidthFnc();
        data.windowHeight = this.windowHeightFnc();
        data.organizationName = "";//添加组织时的组织名称
        data.isSavingOrganization = false;//是否正在添加组织
        data.saveOrganizationMsg = "";//添加组织成功失败的提示
        data.saveOrganizationResult = "";//添加组织成功还是失败（success/error）
        return data;
    },

    onChange: function () {
        var data = OrganizationStore.getState();
        data.containerHeight = this.containerHeightFnc();
        data.containerWidth = this.containerWidthFnc();
        data.windowHeight = this.windowHeightFnc();
        this.setState(data);
    },

    resizeWindow: function () {
        this.setState({
            containerHeight: this.containerHeightFnc(),
            containerWidth: this.containerWidthFnc(),
            windowHeight: this.windowHeightFnc()
        });
    },

    componentDidMount: function () {
        $("body").css("overflow", "hidden");
        $(window).on("resize", this.resizeWindow);
        OrganizationStore.listen(this.onChange);
        OrganizationAction.setOrganizationLoading(true);
        OrganizationAction.getOrganizationList();
    },

    componentWillUnmount: function () {
        $(window).off("resize", this.resizeWindow);
        OrganizationStore.unlisten(this.onChange);
        $("body").css("overflow", "auto");
    },

    containerHeightFnc: function () {
        return $(window).height() - topHeight - bootomHeight;
    },

    windowHeightFnc: function () {
        return $(window).height();
    },

    containerWidthFnc: function () {
        return $(window).width() - 65 - 90;
    },

    addGroup: function () {
        OrganizationAction.addGroup();
    },

    cancelAddGroup: function () {
        OrganizationAction.cancelAddGroup();
    },
    //组织名称修改的处理
    onOrganizationNameChange: function (event) {
        this.state.organizationName = event.target.value;
        this.setState({organizationName: this.state.organizationName});
    },
    //添加组织
    addOrganization: function () {
        var _this = this;
        _this.setState({
            isSavingOrganization: true
        });
        OrganizationAjax.addGroup({
            groupName: this.state.organizationName
        }).then(function (data) {
            _this.state.isSavingOrganization = false;
            if (data) {
                _this.state.saveOrganizationMsg = CONSTANT.SAVE_SUCCESS;
                _this.state.saveOrganizationResult = CONSTANT.SUCCESS;
            } else {
                _this.state.saveOrganizationMsg = CONSTANT.SAVE_ERROR;
                _this.state.saveOrganizationResult = CONSTANT.ERROR;
            }
            _this.updateSaveState();
        }, function (errorMsg) {
            _this.state.isSavingOrganization = false;
            _this.state.saveOrganizationMsg = errorMsg || CONSTANT.SAVE_ERROR;
            _this.state.saveOrganizationResult = CONSTANT.ERROR;
            _this.updateSaveState();
        });
    },
    //更新添加组织返回结果的相关数据
    updateSaveState: function () {
        this.setState({
            isSavingOrganization: this.state.isSavingOrganization,
            saveOrganizationMsg: this.state.saveOrganizationMsg,
            saveOrganizationResult: this.state.saveOrganizationResult
        });
    },
    //隐藏添加组织后的提示信息
    hideSaveTooltip: function () {
        if (this.state.saveOrganizationResult == CONSTANT.SUCCESS) {
            OrganizationAction.getOrganizationList();
        }
        this.state.saveOrganizationMsg = "";
        this.state.saveOrganizationResult = "";
    },
    //无组织时，添加组织面板的渲染
    renderAddOrganization: function () {
        return (<PrivilegeChecker check="USER_ORGANIZATION_ADD" className="organization-null-add-container">
            <div className="no-organization-tip">
                <ReactIntl.FormattedMessage id="organization.no.organization.tip" defaultMessage={this.formatMessage(messages.organization_no_organization_tip)}/>:

            </div>
            <div className="add-organization-div">
                <Input value={this.state.organizationName}
                       size="large"
                       onChange={this.onOrganizationNameChange}
                       placeholder={this.formatMessage(messages.organization_input_placeholder)}/>
                {this.state.saveOrganizationMsg ? (<div className="indicator">
                    <AlertTimer time={this.state.saveOrganizationResult==CONSTANT.ERROR?3000:600}
                                message={this.state.saveOrganizationMsg}
                                type={this.state.saveOrganizationResult} showIcon
                                onHide={this.hideSaveTooltip}/>
                </div>) : null}
                <Button type="primary" size="large"
                        onClick={this.addOrganization}>
                    <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加"/>{this.state.isSavingOrganization ? (
                    <Icon type="loading"/>) : ""}</Button>
            </div>
        </PrivilegeChecker>);
    },
    render: function () {
        var containerHeight = this.state.containerHeight - 2;
        var containerWidth = this.state.containerWidth - 2;
        var organizationMemberWidth = containerWidth - 300 - 2;
        var organizationList = this.state.organizationList;
        let leftTreeData = this.state.searchContent ? this.state.searchOrganizationTree : this.state.organizationListArray;
        return (
            <div className="organization-manage-container">
                <TopNav>
                    <TopNav.MenuList/>
                </TopNav>
                {this.state.organizationLisTipMsg ?
                    (this.state.organizationLisTipMsg == CONSTANT.ORGANIZATION_IS_NULL ? this.renderAddOrganization() :
                        <NoData msg={this.state.organizationLisTipMsg}/>) : (this.state.isLoadingOrganization ? (
                    <Spinner className="isloading"/>) : (
                    <div className="organization-table-block modal-container"
                         style={{width: containerWidth, height: containerHeight}}>
                        <LeftTree
                            containerHeight={containerHeight}
                            organizationList={organizationList}
                            searchContent={this.state.searchContent}
                            organizationGroupList={leftTreeData}
                            deleteGroupItem={this.state.deleteGroupItem}
                            isLoadingTeamMember={this.state.isLoadingTeamMember}
                            delOrganizationErrorMsg={this.state.delOrganizationErrorMsg}
                            isAddOrganizationRoot={this.state.isAddOrganizationRoot}
                        />
                        <MemberList
                            organizationMemberWidth={organizationMemberWidth}
                            containerHeight={containerHeight}
                            isLoadingTeamMember={this.state.isLoadingTeamMember}
                            organizationMerberList={this.state.organizationMemberList}
                            curShowTeamMemberObj={this.state.curShowTeamMemberObj}
                            isAddMember={this.state.isAddMember}
                            isEditMember={this.state.isEditMember}
                            showMemberOperationBtn={this.state.showMemberOperationBtn}
                            teamMemberListTipMsg={this.state.teamMemberListTipMsg}
                        >
                        </MemberList>
                    </div>))
                }
            </div>
        );
    }
});

module.exports = injectIntl(OrganizationPage);