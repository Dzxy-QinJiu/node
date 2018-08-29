/**
 * Created by xiaojinfeng on  2015/12/22 16:59 .
 */

var React = require('react');
var language = require('../../../public/language/getLanguage');
if (language.lan() == 'es' || language.lan() == 'en') {
    require('./css/authority-es_VE.less');
} else if (language.lan() == 'zh') {
    require('./css/authority-zh_CN.less');
}
var GeminiScrollbar = require('../../../components/react-gemini-scrollbar');
var Button = require('antd').Button;
var AuthorityStore = require('./store/authority-store');
var AuthorityAction = require('./action/authority-actions');
var AuthorityListView = require('./views/authority-list');
var AuthorityGroupForm = require('./views/authority-group-form');
var rightPanelUtil = require('../../../components/rightPanel/index');
var RightPanel = rightPanelUtil.RightPanel;
var AuthorityForm = require('./views/authority-form');
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var TopNav = require('../../../components/top-nav');
var Spinner = require('../../../components/spinner');
var NoData = require('../../../components/analysis-nodata');

function getStateFromStore(_this) {
    var storeState = AuthorityStore.getState();
    storeState.authorityContainerHeight = _this.authorityContainerHeightFnc();
    return storeState;
}

var topHeight = 87; // 65 +22 : 距导航高度+顶部导航高度
var bootomHeight = 52; //距离底部高度

class AuthorityPage extends React.Component {
    onChange = () => {
        var datas = getStateFromStore(this);
        this.setState(datas);
    };

    componentDidMount() {
        $(window).on('resize', this.resizeWindow);
        AuthorityStore.listen(this.onChange);
        AuthorityAction.getAuthorityList();
        AuthorityAction.authorityInfo();
    }

    componentWillUnmount() {
        $(window).off('resize', this.resizeWindow);
        AuthorityStore.unlisten(this.onChange);
    }

    authorityContainerHeightFnc = () => {
        return $(window).height() - topHeight;
    };

    resizeWindow = () => {
        this.setState({
            authorityContainerHeight: this.authorityContainerHeightFnc()
        });
    };

    events_showAddAuthorityGroupForm = () => {
        AuthorityAction.showAuthorityForm('', 'addAuthorityGroup');
    };

    events_hideAuthorityForm = () => {
        AuthorityAction.hideAuthorityForm();
    };

    events_editAuthority = (authority) => {
        AuthorityAction.editAuthority(authority);
    };

    events_showAddAuthorityForm = (authorityGroup, flag) => {
        AuthorityAction.showAuthorityForm(authorityGroup, flag);
    };

    events_deleteAuthority = (authorityIds) => {
        AuthorityAction.deleteAuthority(authorityIds);
    };

    events_deleteAuthorityGroup = (authorityIds, groupName) => {
        AuthorityAction.deleteAuthorityGroup(authorityIds, groupName);
    };

    events_showModalDialog = (authorityGroup) => {
        AuthorityAction.showModalDialog(authorityGroup);
    };

    events_hideModalDialog = (authorityGroup) => {
        AuthorityAction.hideModalDialog(authorityGroup);
    };

    events_showAuthorityModalDialog = (authority) => {
        AuthorityAction.showAuthorityModalDialog(authority);
    };

    events_hideAuthorityModalDialog = (authority) => {
        AuthorityAction.hideAuthorityModalDialog(authority);
    };

    events_showAuthorityInfo = (authority) => {
        AuthorityAction.showAuthorityForm(authority);
        AuthorityAction.showAuthorityInfoFnc(authority);
    };

    events_hideAuthorityInfoFnc = (authority) => {
        AuthorityAction.hideAuthorityInfoFnc(authority);
    };

    events_showAuthorityGroupForm = (authorityGroup) => {
        AuthorityAction.showAuthorityGroupForm(authorityGroup);
    };

    events_closeAuthorityGroupForm = () => {
        AuthorityAction.closeAuthorityGroupForm();
    };

    events_clearDelAuthErrorMsg = () => {
        AuthorityAction.clearDelAuthErrorMsg();
    };

    events_clearDelAuthGroupErrorMsg = () => {
        AuthorityAction.clearDelAuthGroupErrorMsg();
    };

    state = getStateFromStore(this);

    render() {
        var _this = this;
        var authorityGroupList = this.state.authorityGroupList || [];
        var height = this.state.authorityContainerHeight;
        var authorityListDivHeight = height - bootomHeight;
        var authorityListElement = '';
        if (authorityGroupList && authorityGroupList.length > 0) {
            authorityListElement = authorityGroupList.map(function(authorityGroup, i) {
                var delAuthGroupErorrMsg = (authorityGroup.permissionGroupName == _this.state.delAuthGroupName ? _this.state.delAuthGroupErorrMsg : '');
                return (
                    <div className="backgroundManagement_authority_content">
                        <AuthorityListView
                            key={i}
                            authorityGroup={authorityGroup}
                            delAuthGroupErorrMsg={delAuthGroupErorrMsg}
                            clearDelAuthGroupErrorMsg={_this.events_clearDelAuthGroupErrorMsg}
                            showAddAuthorityForm={_this.events_showAddAuthorityForm}
                            deleteAuthorityGroup={_this.events_deleteAuthorityGroup}
                            showModalDialog={_this.events_showModalDialog}
                            hideModalDialog={_this.events_hideModalDialog}
                            showAuthorityModalDialog={_this.events_showAuthorityModalDialog}
                            hideAuthorityModalDialog={_this.events_hideAuthorityModalDialog}
                            showAuthorityGroupForm={_this.events_showAuthorityGroupForm}
                            showAuthorityInfo={_this.events_showAuthorityInfo}
                            authorityListDivHeight={authorityListDivHeight}
                            delAuthorityStr="ROLEP_RIVILEGE_AUTHORITY_DELETE"
                            editAuthorityStr="ROLEP_RIVILEGE_AUTHORITY_EDIT"
                        />
                    </div>
                );
            });
        }

        return (
            <div className="backgroundManagement_authority_content">
                <div className="authority-manage-container">
                    <TopNav>
                        <TopNav.MenuList/>
                        <PrivilegeChecker check="ROLEP_RIVILEGE_AUTHORITY_ADD" className="add-authority-div">
                            <Button type="ghost" className="authority-add-btn"
                                    onClick={_this.events_showAddAuthorityGroupForm}><ReactIntl.FormattedMessage
                                id="authority.add.group" defaultMessage="添加权限组"/>
                            </Button>
                        </PrivilegeChecker>
                    </TopNav>
                    <AuthorityGroupForm
                        authorityGroupList={_this.state.authorityGroupList}
                        authorityGroup={_this.state.editAuthorityGroup}
                        authorityGroupFormShow={_this.state.authorityGroupFormShow}
                        delAuthErrorMsg={_this.state.delAuthErrorMsg}
                        clearDelAuthErrorMsg={_this.events_clearDelAuthErrorMsg}
                        closeAuthorityGroupForm={_this.events_closeAuthorityGroupForm.bind(_this)}
                        deleteAuthority={_this.events_deleteAuthority}
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
                            showAuthorityInfo={_this.events_showAuthorityInfo}
                            showAuthorityInfoFlag={_this.state.showAuthorityInfoFlag}
                            isEditAuthority={_this.state.isEditAuthority}
                            isAddAuthorityGroup={_this.state.isAddAuthorityGroup}
                            cancelAuthorityForm={_this.events_hideAuthorityForm}
                            editAuthority={_this.events_editAuthority}
                            authorityGroupInfo={_this.state.authorityGroupInfo}
                            authority={_this.state.authorityInfo}
                        >
                        </AuthorityForm>
                    </RightPanel>

                </div>
            </div>
        );
    }
}

module.exports = AuthorityPage;

