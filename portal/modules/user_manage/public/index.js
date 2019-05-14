let language = require('PUB_DIR/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/index-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./css/index-zh_CN.less');
}
var RightCardsContainer = require('../../../components/rightCardsContainer');
var UserStore = require('./store/user-store');
var UserAction = require('./action/user-actions');
var AddUserForm = require('./views/user-form');
var UserInfo = require('./views/user-info');
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var UserFormAction = require('./action/user-form-actions');
var Spinner = require('../../../components/spinner');
var UserFilterAdv = require('./views/user-filter-adv');
var openTimeout = null;//打开面板时的时间延迟设置
var focusTimeout = null;//focus事件的时间延迟设置
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;

import {Button, Icon} from 'antd';
import Trace from 'LIB_DIR/trace';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import {SearchInput} from 'antc';

class UserManage extends React.Component {
    state = UserStore.getState();

    onChange = () => {
        this.setState(UserStore.getState());
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        UserStore.listen(this.onChange);
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        UserStore.unlisten(this.onChange);
    }

    events_showUserForm = (type) => {
        //type：“edit”/"add"
        if (type === 'add') {
            Trace.traceEvent('成员管理', '成员详情面板点击添加成员按钮');
            //获取团队列表
            if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
                UserFormAction.setTeamListLoading(true);
                UserFormAction.getUserTeamList();
            }
            //获取角色列表
            UserFormAction.setRoleListLoading(true);
            UserFormAction.getRoleList();
            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }
            focusTimeout = setTimeout(function() {
                $('#userName').focus();
            }, 600);
        }
        UserAction.showUserForm(type);
    };

    getLastId() {
        let userListLength = _.get(this.state, 'curUserList.length', 0);
        return _.get(this.state, `curUserList[${userListLength - 1}].id`, '');
    }
    //切换页数时，当前页展示数据的修改
    events_onChangePage = (count, curPage) => {
        UserAction.updateCurPage(curPage);
        var searchObj = {
            cur_page: curPage,
            id: curPage === 1 ? '' : this.getLastId(),
            page_size: count,
            search_content: this.state.searchContent,
            role_param: this.state.selectRole
        };
        UserAction.getCurUserList(searchObj);
    };

    events_showUserInfo = (user) => {
        //如果正在展示其他详情，则先不展示当前点击的成员详情
        if (this.state.userIsLoading || this.state.logIsLoading) {
            return;
        }
        Trace.traceEvent('成员管理', '点击查看成员详情');
        UserAction.setCurUser(user.id);
        // //获取用户的详情
        UserAction.setUserLoading(true);
        UserAction.getCurUserById(user.id);
        if ($('.right-panel-content').hasClass('right-panel-content-slide')) {
            $('.right-panel-content').removeClass('right-panel-content-slide');
            if (openTimeout) {
                clearTimeout(openTimeout);
            }
            openTimeout = setTimeout(function() {
                UserAction.showUserInfoPanel();
            }, 200);
        } else {
            UserAction.showUserInfoPanel();
        }
        //获取团队列表
        if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
            UserFormAction.setTeamListLoading(true);
            UserFormAction.getUserTeamList();
        }
        //获取角色列表
        UserFormAction.setRoleListLoading(true);
        UserFormAction.getRoleList();
    };

    events_searchEvent = (searchContent) => {
        let content = _.trim(searchContent);
        if (content) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-input-container input'), '跟据用户名/昵称/电话/邮箱搜索成员');
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-input-container input'), '清空搜索内容');
        }
        UserAction.updateCurPage(1);
        UserAction.updateSearchContent(content);
        var searchObj = {
            cur_page: 1,
            id: '',
            page_size: this.state.pageSize,
            search_content: content,
            role_param: this.state.selectRole
        };
        UserAction.getCurUserList(searchObj);
    };

    //右侧面板的关闭
    events_closeRightPanel = () => {
        //将数据清空
        UserAction.setInitialData();
        UserAction.closeRightPanel();
        UserAction.hideContinueAddButton();
    };

    //显示继续添加按钮
    events_showContinueAddButton = () => {
        UserAction.showContinueAddButton();
    };

    //由编辑页面返回信息展示页面
    events_returnInfoPanel = (newAddUser) => {
        UserAction.returnInfoPanel(newAddUser);
    };

    //一页展示多少安全域的修改
    events_updatePageSize = (count) => {
        UserAction.updatePageSize(count);
    };

    //展示、收起筛选面板的处理
    events_toggleFilterPanel = () => {
        UserAction.toggleFilterPanel();
    };

    //过滤角色选择与修改时，已选标签的修改
    events_filterUserByRole = (role) => {
        //设置筛选角色，并筛选成员
        UserAction.setSelectRole(role);
        UserAction.updateCurPage(1);
        //角色和搜索框的内容不能联合搜索，所以，通过角色筛选时，清空搜索框
        $('.backgroundManagement_user_content .search-input').val('');
        var searchObj = {
            cur_page: 1,
            id: '',
            page_size: this.state.pageSize,
            search_content: '',
            role_param: role
        };
        UserAction.getCurUserList(searchObj);
    };

    getCardShowUserList = () => {
        let userList = _.isArray(this.state.curUserList) ? this.state.curUserList : [];
        return userList.map(user => {
            return {
                id: user.id,
                name: user.name,
                image: user.image,
                userName: {
                    label: Intl.get('common.username', '用户名') + ' :',
                    value: user.userName,
                    showOnCard: true
                },
                phone: {
                    label: Intl.get('common.phone', '电话') + ' :',
                    value: user.phone,
                    showOnCard: true
                },
                email: {
                    label: Intl.get('common.email', '邮箱') + ' :',
                    value: user.email,
                    showOnCard: true
                },
                status: user.status
            };
        });

    };

    changeUserFieldSuccess = (user) => {
        UserAction.afterEditUser(user);
    };

    updateUserStatus = (updateObj) => {
        UserAction.updateUserStatus(updateObj);
        UserAction.updateCurrentUserStatus(updateObj.status);
    };
    hasNoFilterCondition = () => {
        if (this.state.searchContent || this.state.selectRole) {
            return false;
        } else {
            return true;
        }

    };
    renderAddAndImportBtns = () => {
        if (hasPrivilege('USER_MANAGE_ADD_USER')) {
            return (
                <div className="btn-containers">
                    <Button className='add-clue-btn btn-item btn-m-r-2'
                        onClick={this.events_showUserForm.bind(this, 'add')}>{Intl.get('common.add.member', '添加成员')}</Button>
                </div>
            );
        } else {
            return null;
        }

    };
    //渲染操作按钮区
    renderTopNavOperation = () => {
        return (<ButtonZones>
            <div className="block float-r btn-item-container">
                <Button type="ghost" className="tag-filter-btn btn-item"
                    onClick={this.events_toggleFilterPanel.bind(this)}>

                    <ReactIntl.FormattedMessage id="common.filter" defaultMessage="筛选"/>
                    {this.state.isFilterPanelShow ? <Icon type="up"/> :
                        <Icon type="down"/>}
                </Button>
                <div className="block search-input-block btn-item">
                    <SearchInput searchPlaceHolder={Intl.get('member.search.placeholder', '用户名/昵称/电话/邮箱')}
                        searchEvent={this.events_searchEvent.bind(this)}/>
                </div>
                <PrivilegeChecker check="USER_MANAGE_ADD_USER" className="btn-item">
                    <Button className="btn-m-r-2 vertical-initial" onClick={this.events_showUserForm.bind(this, 'add')}
                        data-tracename="添加成员">
                        <ReactIntl.FormattedMessage id="common.add.member" defaultMessage="添加成员"/>
                    </Button>
                </PrivilegeChecker>
            </div>
        </ButtonZones>);
    };

    render() {
        var firstLoading = this.state.isLoading;
        return (
            <div className="user_manage_style backgroundManagement_user_content" data-tracename="成员管理">
                {
                    firstLoading ? <div className="firstLoading">
                        <Spinner/>
                    </div> : null
                }
                {
                    this.renderTopNavOperation()
                }

                <RightCardsContainer
                    currentCard={this.state.currentUser}
                    cardListSize={this.state.userListSize}
                    curCardList={this.getCardShowUserList()}
                    selectCards={this.state.selectUsers}
                    listTipMsg={this.state.userListTipMsg}
                    curPage={this.state.curPage}
                    pageSize={this.state.pageSize}
                    updatePageSize={this.events_updatePageSize.bind(this)}
                    hideCardForm={this.events_hideUserForm}
                    submitCardForm={this.events_submitUserForm}
                    editCard={this.events_editUser}
                    changePageEvent={this.events_onChangePage.bind(this)}
                    showCardInfo={this.events_showUserInfo.bind(this)}
                    // searchEvent={this.events_searchEvent.bind(this)}
                    isPanelShow={this.state.isFilterPanelShow}
                    // toggleFilterPanel={this.events_toggleFilterPanel.bind(this)}
                    type="userManage"
                    renderAddAndImportBtns={this.renderAddAndImportBtns}
                    showAddBtn={this.hasNoFilterCondition()}
                >
                    <UserFilterAdv isFilterPanelShow={this.state.isFilterPanelShow}
                        allUserTotal={this.state.allUserTotal}
                        selectRole={this.state.selectRole}
                        userRoleList={this.state.userRoleList}
                        filterUserByRole={this.events_filterUserByRole.bind(this)}
                    />
                    {this.state.userInfoShow ?
                        <UserInfo
                            userInfo={this.state.currentUser}
                            closeRightPanel={this.events_closeRightPanel}
                            userInfoShow={this.state.userInfoShow}
                            userFormShow={this.state.userFormShow}
                            showEditForm={this.events_showUserForm}
                            isContinueAddButtonShow={this.state.isContinueAddButtonShow}
                            changeUserFieldSuccess={this.changeUserFieldSuccess}
                            updateUserStatus={this.updateUserStatus}
                            resultType={this.state.resultType}
                            errorMsg={this.state.errorMsg}
                            userIsLoading={this.state.userIsLoading}
                            getUserDetailError={this.state.getUserDetailError}
                        /> : null}
                    {this.state.userFormShow ?
                        <AddUserForm
                            formType={this.state.formType}
                            closeRightPanel={this.events_closeRightPanel}
                            returnInfoPanel={this.events_returnInfoPanel}
                            showUserInfo={this.events_showUserInfo.bind(this)}
                            showContinueAddButton={this.events_showContinueAddButton}
                            user={this.state.currentUser}
                            userFormShow={this.state.userFormShow}
                        />
                        : null}
                </RightCardsContainer>
            </div>
        );
    }
}

module.exports = UserManage;

