/**
 * Created by xiaojinfeng on  2015/12/22 16:59 .
 */

var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./scss/authority-es_VE.scss");
}else if (language.lan() == "zh"){
    require("./scss/authority-zh_CN.scss");
}
var GeminiScrollbar = require('../../../components/react-gemini-scrollbar');
var Button = require("antd").Button;
var AuthorityStore = require("./store/authority-store");
var AuthorityAction = require("./action/authority-actions");
var AuthorityListView = require("./views/authority-list");
var AuthorityGroupForm = require("./views/authority-group-form");
var rightPanelUtil = require("../../../components/rightPanel/index");
var RightPanel = rightPanelUtil.RightPanel;
var AuthorityForm = require("./views/authority-form");
var PrivilegeChecker = require("../../../components/privilege/checker").PrivilegeChecker;
var TopNav = require("../../../components/top-nav");
var Spinner = require("../../../components/spinner");
var NoData = require("../../../components/analysis-nodata");
function getStateFromStore(_this) {
    var storeState = AuthorityStore.getState();
    storeState.authorityContainerHeight = _this.authorityContainerHeightFnc();
    return storeState;
}

var topHeight = 98; // 76 +22 : 距导航高度+顶部导航高度
var bootomHeight = 52; //距离底部高度

var AuthorityPage = React.createClass({
    getInitialState: function () {
        return getStateFromStore(this);
    },

    onChange: function () {
        var datas = getStateFromStore(this);
        this.setState(datas);
    },
    componentDidMount: function () {
        $(window).on("resize", this.resizeWindow);
        AuthorityStore.listen(this.onChange);
        AuthorityAction.getAuthorityList();
        AuthorityAction.authorityInfo();
    },
    componentWillUnmount: function () {
        $(window).off("resize", this.resizeWindow);
        AuthorityStore.unlisten(this.onChange);
    },

    authorityContainerHeightFnc: function () {
        return $(window).height() - topHeight;
    },

    resizeWindow: function () {
        this.setState({
            authorityContainerHeight: this.authorityContainerHeightFnc()
        });
    },
    events: {

        showAddAuthorityGroupForm: function () {
            AuthorityAction.showAuthorityForm("", "addAuthorityGroup");
        },

        hideAuthorityForm: function () {
            AuthorityAction.hideAuthorityForm();
        },

        editAuthority: function (authority) {
            AuthorityAction.editAuthority(authority);
        },

        showAddAuthorityForm: function (authorityGroup, flag) {
            AuthorityAction.showAuthorityForm(authorityGroup, flag);
        },

        deleteAuthority: function (authorityIds) {
            AuthorityAction.deleteAuthority(authorityIds);
        },
        deleteAuthorityGroup: function (authorityIds, groupName) {
            AuthorityAction.deleteAuthorityGroup(authorityIds, groupName);
        },

        showModalDialog: function (authorityGroup) {
            AuthorityAction.showModalDialog(authorityGroup);
        },

        hideModalDialog: function (authorityGroup) {
            AuthorityAction.hideModalDialog(authorityGroup);
        },

        showAuthorityModalDialog: function (authority) {
            AuthorityAction.showAuthorityModalDialog(authority);
        },

        hideAuthorityModalDialog: function (authority) {
            AuthorityAction.hideAuthorityModalDialog(authority);
        },

        showAuthorityInfo: function (authority) {
            AuthorityAction.showAuthorityForm(authority);
            AuthorityAction.showAuthorityInfoFnc(authority);
        },

        hideAuthorityInfoFnc: function (authority) {
            AuthorityAction.hideAuthorityInfoFnc(authority);
        },

        showAuthorityGroupForm: function (authorityGroup) {
            AuthorityAction.showAuthorityGroupForm(authorityGroup);
        },
        closeAuthorityGroupForm: function () {
            AuthorityAction.closeAuthorityGroupForm();
        },
        clearDelAuthErrorMsg: function () {
            AuthorityAction.clearDelAuthErrorMsg();
        },
        clearDelAuthGroupErrorMsg: function () {
            AuthorityAction.clearDelAuthGroupErrorMsg();
        }

    },
    render: function () {
        var _this = this;
        var authorityGroupList = this.state.authorityGroupList || [];
        var height = this.state.authorityContainerHeight;
        var authorityListDivHeight = height - bootomHeight;
        var authorityListElement = "";
        if (authorityGroupList && authorityGroupList.length > 0) {
            authorityListElement = authorityGroupList.map(function (authorityGroup, i) {
                var delAuthGroupErorrMsg = (authorityGroup.permissionGroupName == _this.state.delAuthGroupName ? _this.state.delAuthGroupErorrMsg : "");
                return (
                    <div className="backgroundManagement_authority_content">
                        <AuthorityListView
                            key={i}
                            authorityGroup={authorityGroup}
                            delAuthGroupErorrMsg={delAuthGroupErorrMsg}
                            clearDelAuthGroupErrorMsg={_this.events.clearDelAuthGroupErrorMsg}
                            showAddAuthorityForm={_this.events.showAddAuthorityForm}
                            deleteAuthorityGroup={_this.events.deleteAuthorityGroup}
                            showModalDialog={_this.events.showModalDialog}
                            hideModalDialog={_this.events.hideModalDialog}
                            showAuthorityModalDialog={_this.events.showAuthorityModalDialog}
                            hideAuthorityModalDialog={_this.events.hideAuthorityModalDialog}
                            showAuthorityGroupForm={_this.events.showAuthorityGroupForm}
                            showAuthorityInfo={_this.events.showAuthorityInfo}
                            authorityListDivHeight={authorityListDivHeight}
                            delAuthorityStr="ROLEP_RIVILEGE_AUTHORITY_DELETE"
                            editAuthorityStr="ROLEP_RIVILEGE_AUTHORITY_EDIT"
                        />
                    </div>
                );
            })
        }

        return (
            <div className="backgroundManagement_authority_content">
                <div className="authority-manage-container">
                    <TopNav>
                        <TopNav.MenuList/>
                        <PrivilegeChecker check="ROLEP_RIVILEGE_AUTHORITY_ADD" className="add-authority-div">
                            <Button type="ghost" className="authority-add-btn"
                                    onClick={_this.events.showAddAuthorityGroupForm}><ReactIntl.FormattedMessage id="authority.add.group" defaultMessage="添加权限组" />
                            </Button>
                        </PrivilegeChecker>
                    </TopNav>
                    <AuthorityGroupForm
                        authorityGroupList={_this.state.authorityGroupList}
                        authorityGroup={_this.state.editAuthorityGroup}
                        authorityGroupFormShow={_this.state.authorityGroupFormShow}
                        delAuthErrorMsg={_this.state.delAuthErrorMsg}
                        clearDelAuthErrorMsg={_this.events.clearDelAuthErrorMsg}
                        closeAuthorityGroupForm={_this.events.closeAuthorityGroupForm.bind(_this)}
                        deleteAuthority={_this.events.deleteAuthority}
                        delStr="ROLEP_RIVILEGE_AUTHORITY_DELETE"
                        editStr="ROLEP_RIVILEGE_AUTHORITY_EDIT"
                        addStr="ROLEP_RIVILEGE_AUTHORITY_ADD"
                    />
                    {_this.state.authListIsLoadding ? (<Spinner className="isloading"/>) : (
                        <div className="authority-table-block">
                            {
                                _this.state.listTipMsg ? (<NoData msg={_this.state.listTipMsg}/>) : (
                                    <div style={{height: height}} className="authority-container-scroll">
                                        <GeminiScrollbar className="geminiScrollbar-div authority-geminiScrollbar-div">
                                            <div className="authority-container" style={{height: height}}>
                                                {authorityListElement}
                                            </div>
                                        </GeminiScrollbar>
                                    </div>)}

                        </div>)}
                    <RightPanel showFlag={_this.state.authorityFormShow}>
                        <AuthorityForm
                            showAuthorityInfo={_this.events.showAuthorityInfo}
                            showAuthorityInfoFlag={_this.state.showAuthorityInfoFlag}
                            isEditAuthority={_this.state.isEditAuthority}
                            isAddAuthorityGroup={_this.state.isAddAuthorityGroup}
                            cancelAuthorityForm={_this.events.hideAuthorityForm}
                            editAuthority={_this.events.editAuthority}
                            authorityGroupInfo={_this.state.authorityGroupInfo}
                            authority={_this.state.authorityInfo}
                        >
                        </AuthorityForm>
                    </RightPanel>

                </div>
            </div>
        );
    }
});

module.exports = AuthorityPage;
