var RightCardsContainer = require("../../../components/rightCardsContainer");
var UserStore = require("./store/user-store");
var UserAction = require("./action/user-actions");
var AddUserForm = require("./views/user-form");
var UserInfo = require("./views/user-info");
var rightPanelUtil = require("../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var TopNav = require("../../../components/top-nav");
var PrivilegeChecker = require("../../../components/privilege/checker").PrivilegeChecker;
var UserFormAction = require("./action/user-form-actions");
var Spinner = require("../../../components/spinner");
var UserFilterAdv = require("./views/user-filter-adv");
var openTimeout = null;//打开面板时的时间延迟设置
var focusTimeout = null;//focus事件的时间延迟设置
var CONSTANTS = {
    LOG_PAGE_SIZE: 11//个人操作日志一页展示的条数
};
import Trace from "LIB_DIR/trace";

var UserManage = React.createClass({
    getInitialState: function () {
        return UserStore.getState();
    },
    onChange: function () {
        this.setState(UserStore.getState());
    },
    componentDidMount: function () {
        $("body").css("overflow", "hidden");
        UserStore.listen(this.onChange);
        //获取团队列表
        if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
            UserFormAction.setTeamListLoading(true);
            UserFormAction.getUserTeamList();
        }
        //获取角色列表
        UserFormAction.setRoleListLoading(true);
        UserFormAction.getRoleList();
    },
    componentWillUnmount: function () {
        $("body").css("overflow", "auto");
        UserStore.unlisten(this.onChange);
    },
    events: {
        showUserForm: function (type) {
            //type：“edit”/"add"
            //获取角色列表
            // UserFormAction.setRoleListLoading(true);
            // UserFormAction.getRoleList();
            if (type === "add") {
                Trace.traceEvent("成员管理","成员详情面板点击添加成员按钮");
                //获取团队列表
                // if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
                //     UserFormAction.setTeamListLoading(true);
                //     UserFormAction.getUserTeamList();
                // }
                if (focusTimeout) {
                    clearTimeout(focusTimeout);
                }
                focusTimeout = setTimeout(function () {
                    $("#userName").focus();
                }, 600);
            }
            UserAction.showUserForm(type);
        },


        //切换页数时，当前页展示数据的修改
        onChangePage: function (count, curPage) {
            UserAction.updateCurPage(curPage);
            var searchObj = {
                cur_page: curPage,
                page_size: count,
                search_content: this.state.searchContent,
                role_param: this.state.selectRole
            };
            UserAction.getCurUserList(searchObj);
        },


        showUserInfo: function (user) {
            //如果正在展示其他详情，则先不展示当前点击的成员详情
            if (this.state.userIsLoading || this.state.logIsLoading) {
                return;
            }
            Trace.traceEvent("成员管理","点击查看成员详情");
            UserAction.setCurUser(user.id);
            // //获取用户的详情
            UserAction.setUserLoading(true);
            UserAction.getCurUserById(user.id);
            if ($(".right-panel-content").hasClass("right-panel-content-slide")) {
                $(".right-panel-content").removeClass("right-panel-content-slide");
                if (openTimeout) {
                    clearTimeout(openTimeout);
                }
                openTimeout = setTimeout(function () {
                    UserAction.showUserInfoPanel();
                }, 200);
            } else {
                UserAction.showUserInfoPanel();
            }
        },

        searchEvent: function (searchContent) {
            if (searchContent) {
                Trace.traceEvent($(this.getDOMNode()).find(".search-input-container input"),"跟据用户名/昵称/电话/邮箱搜索成员");
            }else{
                Trace.traceEvent($(this.getDOMNode()).find(".search-input-container input"),"清空搜索内容");
            }
            UserAction.updateCurPage(1);
            UserAction.updateSearchContent(searchContent);
            var searchObj = {
                cur_page: 1,
                page_size: this.state.pageSize,
                search_content: searchContent,
                role_param: this.state.selectRole
            };
            UserAction.getCurUserList(searchObj);
        },
        //右侧面板的关闭
        closeRightPanel: function () {
            //将数据清空
            UserAction.setInitialData();
            UserAction.closeRightPanel();
            UserAction.hideContinueAddButton();
        },
        //显示继续添加按钮
        showContinueAddButton: function () {
            UserAction.showContinueAddButton();
        },
        //由编辑页面返回信息展示页面
        returnInfoPanel: function (newAddUser) {
            UserAction.returnInfoPanel(newAddUser);
        },

        //一页展示多少安全域的修改
        updatePageSize: function (count) {
            UserAction.updatePageSize(count);
        },
        //展示、收起筛选面板的处理
        toggleFilterPanel: function () {
            UserAction.toggleFilterPanel();
        },
        //过滤角色选择与修改时，已选标签的修改
        filterUserByRole: function (role) {
            //设置筛选角色，并筛选成员
            UserAction.setSelectRole(role);
            UserAction.updateCurPage(1);
            //角色和搜索框的内容不能联合搜索，所以，通过角色筛选时，清空搜索框
            $(".backgroundManagement_user_content .search-input").val("");
            var searchObj = {
                cur_page: 1,
                page_size: this.state.pageSize,
                search_content: "",
                role_param: role
            };
            UserAction.getCurUserList(searchObj);
        }
    },
    getCardShowUserList: function () {
        let userList = _.isArray(this.state.curUserList) ? this.state.curUserList : [];
        return userList.map(user=> {
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                userName: {
                    label: Intl.get("common.username", "用户名") + ' :',
                    value: user.userName,
                    showOnCard: true
                },
                phone: {
                    label: Intl.get("common.phone", "电话") + ' :',
                    value: user.phone,
                    showOnCard: true
                },
                email: {
                    label: Intl.get("common.email", "邮箱") + ' :',
                    value: user.email,
                    showOnCard: true
                },
                status: user.status
            };
        });

    },
    changeUserFieldSuccess: function (user) {
        UserAction.afterEditUser(user);
    },
    render: function () {
        var modalType = Intl.get("member.member", "成员");
        var firstLoading = this.state.isLoading;
        return (
            <div className="user_manage_style backgroundManagement_user_content" data-tracename="成员管理">
                {
                    firstLoading ? <div className="firstLoading">
                        <Spinner />
                    </div> : null
                }
                <RightCardsContainer
                    currentCard={this.state.currentUser}
                    cardListSize={this.state.userListSize}
                    curCardList={this.getCardShowUserList()}
                    selectCards={this.state.selectUsers}
                    listTipMsg={this.state.userListTipMsg}
                    curPage={this.state.curPage}
                    pageSize={this.state.pageSize}
                    searchPlaceHolder={Intl.get("member.search.placeholder", "用户名/昵称/电话/邮箱")}
                    updatePageSize={this.events.updatePageSize.bind(this)}
                    hideCardForm={this.events.hideUserForm}
                    submitCardForm={this.events.submitUserForm}
                    editCard={this.events.editUser}
                    changePageEvent={this.events.onChangePage.bind(this)}
                    showCardInfo={this.events.showUserInfo.bind(this)}
                    searchEvent={this.events.searchEvent.bind(this)}
                    isPanelShow={this.state.isFilterPanelShow}
                    toggleFilterPanel={this.events.toggleFilterPanel.bind(this)}
                    type="userManage"
                >
                    <TopNav>
                        <TopNav.MenuList />
                        <PrivilegeChecker check="USER_MANAGE_ADD_USER" className="block handle-btn-container"
                                          onClick={this.events.showUserForm.bind(this,"add")}
                                          data-tracename="添加成员"  >
                            <ReactIntl.FormattedMessage id="common.add.member" defaultMessage="添加成员"/>
                        </PrivilegeChecker>
                    </TopNav>
                    <UserFilterAdv isFilterPanelShow={this.state.isFilterPanelShow}
                                   allUserTotal={this.state.allUserTotal}
                                   selectRole={this.state.selectRole}
                                   userRoleList={this.state.userRoleList}
                                   filterUserByRole={this.events.filterUserByRole.bind(this)}
                    />
                    <RightPanel className="white-space-nowrap" showFlag={this.state.rightPanelShow}>
                        <UserInfo
                            userInfo={this.state.currentUser}
                            closeRightPanel={this.events.closeRightPanel}
                            userInfoShow={this.state.userInfoShow}
                            userFormShow={this.state.userFormShow}
                            showEditForm={this.events.showUserForm}
                            isContinueAddButtonShow={this.state.isContinueAddButtonShow}
                            changeUserFieldSuccess={this.changeUserFieldSuccess}
                        />
                        <AddUserForm
                            formType={this.state.formType}
                            closeRightPanel={this.events.closeRightPanel}
                            returnInfoPanel={this.events.returnInfoPanel}
                            showUserInfo={this.events.showUserInfo.bind(this)}
                            showContinueAddButton={this.events.showContinueAddButton}
                            user={this.state.currentUser}
                            userFormShow={this.state.userFormShow}
                        />
                    </RightPanel>
                </RightCardsContainer>
            </div>
        );
    }
});

module.exports = UserManage;
