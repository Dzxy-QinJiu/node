var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var Spinner = require("../../../../components/spinner");
var NoData = require("../../../../components/analysis-nodata");
var AuthorityStore = require("../../../rolePrivilege_authority/public/store/authority-store");
var AuthorityAction = require("../../../rolePrivilege_authority/public/action/authority-actions");
var AuthorityListView = require("../../../rolePrivilege_authority/public/views/authority-list");
var AuthorityGroupForm = require("../../../rolePrivilege_authority/public/views/authority-group-form");
var bootomHeight = 52; //距离底部高度
function getStateFromStore() {
    return AuthorityStore.getState();
}
var TYPE_CONSTANT = "myApp";
var UserInfoAuthority = React.createClass({
    getInitialState: function () {
        return getStateFromStore();
    },

    onChange: function () {
        var datas = getStateFromStore();
        this.setState(datas);
    },
    componentDidMount: function () {
        AuthorityStore.listen(this.onChange);
        AuthorityAction.setAuthListLoading(true);
        AuthorityAction.getAuthorityList(this.props.curAppId, TYPE_CONSTANT);
    },
    componentWillUnmount: function () {
        AuthorityStore.unlisten(this.onChange);
    },

    events: {

        showAddAuthorityGroupForm: function () {
            AuthorityAction.showAuthorityForm("", "addAuthorityGroup");
        },

        hideAuthorityForm: function () {
            AuthorityAction.hideAuthorityForm();
        },

        showAddAuthorityForm: function (authorityGroup, flag) {
            AuthorityAction.showAuthorityForm(authorityGroup, flag);
        },

        showEditClassifyNameInput: function (authorityGroup) {
            AuthorityAction.showEditClassifyNameInput(authorityGroup);
        },

        hideEditClassifyNameInput: function (authorityGroup) {
            AuthorityAction.hideEditClassifyNameInput(authorityGroup);
        },
        deleteAuthority: function (authorityIds) {
            AuthorityAction.deleteAuthority(authorityIds, TYPE_CONSTANT);
        },
        deleteAuthorityGroup: function (authorityIds, groupName) {
            AuthorityAction.deleteAuthorityGroup(authorityIds, groupName, this.props.curAppId, TYPE_CONSTANT);
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
        var height = this.props.divHeight;
        var width = this.props.divWidth;

        var authorityListDivHeight = height - bootomHeight;
        var authorityListElement = "";
        if (authorityGroupList && authorityGroupList.length > 0) {
            authorityListElement = authorityGroupList.map(function (authorityGroup, i) {
                var delAuthGroupErrorMsg = (authorityGroup.permissionGroupName == _this.state.delAuthGroupName ? _this.state.delAuthGroupErrorMsg : "");
                return (
                    <AuthorityListView
                        key={i}
                        authorityGroup={authorityGroup}
                        delAuthGroupErrorMsg={delAuthGroupErrorMsg}
                        clearDelAuthGroupErrorMsg={_this.events.clearDelAuthGroupErrorMsg}
                        showAddAuthorityForm={_this.events.showAddAuthorityForm}
                        deleteAuthorityGroup={_this.events.deleteAuthorityGroup.bind(_this)}
                        showModalDialog={_this.events.showModalDialog}
                        hideModalDialog={_this.events.hideModalDialog}
                        showAuthorityModalDialog={_this.events.showAuthorityModalDialog}
                        hideAuthorityModalDialog={_this.events.hideAuthorityModalDialog}
                        showAuthorityInfo={_this.events.showAuthorityInfo}
                        showAuthorityGroupForm={_this.events.showAuthorityGroupForm}
                        authorityListDivHeight={authorityListDivHeight}
                        delAuthorityStr="USER_INFO_MYAPP_AUTHORITY_DELETE"
                        editAuthorityStr="USER_INFO_MYAPP_AUTHORITY_EDIT"
                    />
                );
            });
        }

        return (
            <div className="authority-manage-container">
                <div className="authority-table-block">
                    <div style={{height: height, width :width}} className="authority-container-scroll">
                        {_this.state.authListIsLoadding ? (<Spinner className="isloading"/>) : (
                            _this.state.listTipMsg ? (<NoData msg={_this.state.listTipMsg}/>) : (
                                <GeminiScrollbar className="geminiScrollbar-div authority-geminiScrollbar-div">
                                    <div className="authority-container" style={{height: height}}>
                                        {authorityListElement}
                                    </div>
                                </GeminiScrollbar>))
                        }
                    </div>
                    <AuthorityGroupForm
                        authorityGroupList={_this.state.authorityGroupList}
                        authorityGroup={_this.state.editAuthorityGroup}
                        authorityGroupFormShow={_this.state.authorityGroupFormShow}
                        delAuthErrorMsg={_this.state.delAuthErrorMsg}
                        clearDelAuthErrorMsg={_this.events.clearDelAuthErrorMsg}
                        closeAuthorityGroupForm={_this.events.closeAuthorityGroupForm.bind(_this)}
                        deleteAuthority={_this.events.deleteAuthority}
                        authorityType={TYPE_CONSTANT}
                        curAppId={_this.props.curAppId}
                        searchContent={_this.state.searchContent}
                        delStr="USER_INFO_MYAPP_AUTHORITY_DELETE"
                        editStr="USER_INFO_MYAPP_AUTHORITY_EDIT"
                        addStr="USER_INFO_MYAPP_AUTHORITY_ADD"
                    />
                </div>
            </div>
        );
    }
});

module.exports = UserInfoAuthority;