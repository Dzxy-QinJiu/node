/**
 * Created by xiaojinfeng on 2016/04/13.
 */

var React = require('react');
var createReactClass = require('create-react-class');
import {InputNumber, Button, message, Icon} from 'antd';
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var DefaultUserLogoTitle = require('../../../../components/default-user-logo-title');
var Spinner = require('../../../../components/spinner');
var AlertTimer = require('../../../../components/alert-timer');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
import {SearchInput} from 'antc';
var classNames = require('classnames');
var SalesTeamAction = require('../action/sales-team-actions');
var MemberListEditAction = require('../action/member-list-edit-actions');
var MemberListEditStore = require('../store/member-list-edit-store');
import salesTeamAjax from '../ajax/sales-team-ajax';
import Trace from 'LIB_DIR/trace';
var UserInfo = require('MOD_DIR/user_manage/public/views/user-info');
var rightPanelUtil = require('CMP_DIR/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
var UserStore = require('MOD_DIR/user_manage/public/store/user-store');
var UserAction = require('MOD_DIR/user_manage/public/action/user-actions');
var UserFormAction = require('MOD_DIR/user_manage/public/action/user-form-actions');
import { AntcTable } from 'antc';
//成员的类型
const MEMBER_TYPE = {
    OWNER: 'owner',//负责人
    MANAGER: 'manager',//秘书
    USER: 'user'//成员
};
//销售目标的类型
const SALES_GOALS_TYPE = {
    MEMBER: 'member',//个人销售目标
    TEAM: 'team'//团队销售目标
};
function noop() {
}
var MemberList = createReactClass({
    displayName: 'MemberList',

    getDefaultProps: function() {
        return {
            getIsDeleteMember: noop,
            addMember: noop,
            saveEditMember: noop,
            cancelEditMember: noop,
            saveAddMember: noop,
            cancelAddMember: noop
        };
    },
    propTypes: {
        addMemberList: PropTypes.array,
        curShowTeamMemberObj: PropTypes.obj,
        salesGoals: PropTypes.obj,
        isLoadingSalesGoal: PropTypes.bool,
        getSalesGoalErrMsg: PropTypes.string,
        containerHeight: PropTypes.number,
        isAddMember: PropTypes.bool,
        isEditMember: PropTypes.bool,
        showMemberOperationBtn: PropTypes.bool,
        className: PropTypes.string,
        addMemberListTipMsg: PropTypes.string,
        teamMemberListTipMsg: PropTypes.string,
        salesTeamMemberWidth: PropTypes.number,
        isLoadingTeamMember: PropTypes.bool,
        rightPanelShow: PropTypes.bool,
        userInfoShow: PropTypes.bool,
        userFormShow: PropTypes.bool
    },
    getInitialState: function() {
        var savingFlags = MemberListEditStore.getState();
        return {
            searchValue: '',
            addMemberList: $.extend(true, [], this.props.addMemberList),
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj),
            salesGoals: _.extend({}, this.props.salesGoals),
            isMemberListSaving: savingFlags.isMemberListSaving,//是否正在保存修改的成员列表
            saveMemberListResult: savingFlags.saveMemberListResult,//error，success
            saveMemberListMsg: savingFlags.saveMemberListMsg,//保存结果的提示信息
            saveMemberListObj: {},//修改、添加时要保存的数据对象
            teamConfirmVisible: false,
            memberConfirmVisible: false,
            memberListHeight: this.getMemberListHeight(),
            currentUser: UserStore.getState().currentUser,
            isLoadingSalesGoal: this.props.isLoadingSalesGoal,
            getSalesGoalErrMsg: this.props.getSalesGoalErrMsg,
            isShowBatchChangeTeamGoal: true,//是否展示设置团队目标按钮
            isShowBatchChangeSelfGoal: true, //是否展示设置个人目标按钮
            isSavingTeamGoal: false, //正在保存团队目标
            isSavingMemberGoal: false,//正在保存个人目标
            selectedRowIndex: null, // 点击的行索引
        };
    },

    onChange: function() {
        var savingFlags = MemberListEditStore.getState();
        this.setState({
            isMemberListSaving: savingFlags.isMemberListSaving,
            saveMemberListResult: savingFlags.saveMemberListResult,
            saveMemberListMsg: savingFlags.saveMemberListMsg,
            currentUser: UserStore.getState().currentUser,
        });
    },

    getMemberListHeight: function() {
        let containerHeight = this.props.containerHeight;
        let memberListPaddingTop = 20;//成员列表顶部padding
        let memberListTitleHeight = 50;//成员列表顶部操作区域高度
        let $topElement = $('.member-top-operation-div');
        //缩放浏览器时，顶部编辑框和按钮展示不开换行时的高度设置
        if ($topElement.size() && $topElement.height() > memberListTitleHeight) {
            memberListTitleHeight = $topElement.height();
        }
        return containerHeight - memberListPaddingTop - memberListTitleHeight;
    },

    layout: function() {
        setTimeout(() => {
            this.setState({memberListHeight: this.getMemberListHeight()});
        });
    },

    componentDidMount: function() {
        MemberListEditStore.listen(this.onChange);
        UserStore.listen(this.onChange);
        $(window).on('resize', this.layout);
    },

    componentWillUnmount: function() {
        MemberListEditStore.unlisten(this.onChange);
        UserStore.unlisten(this.onChange);
        $(window).off('resize', this.layout);
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState(this.getInitialState());
        this.setState({
            addMemberList: $.extend(true, [], nextProps.addMemberList),
            curShowTeamMemberObj: $.extend(true, {}, nextProps.curShowTeamMemberObj),
            salesGoals: _.extend({}, nextProps.salesGoals),
            isLoadingSalesGoal: nextProps.isLoadingSalesGoal,
            getSalesGoalErrMsg: nextProps.getSalesGoalErrMsg
        });
    },

    cleanSearchInput: function() {
        this.setState({
            searchValue: ''
        });
        $('.sales-team-member-add-container .search-input').val('');
    },

    selectMember: function(salesTeamMember) {
        if (this.props.isAddMember) {
            this.state.addMemberList.forEach(function(member) {
                if (member && (member.userId === salesTeamMember.userId)) {
                    member.selected = !member.selected;
                }
            });
            this.setState({
                addMemberList: this.state.addMemberList
            });
        } else {
            //展示用户的时候
            if (!this.props.isEditMember){
                Trace.traceEvent('团队管理','点击查看成员详情');
                UserAction.setCurUser(salesTeamMember.userId);
                //获取用户的详情
                UserAction.setUserLoading(true);
                UserAction.getCurUserById(salesTeamMember.userId);
                setTimeout(() => {
                    //获取团队列表
                    if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
                        UserFormAction.setTeamListLoading(true);
                        UserFormAction.getUserTeamList();
                    }
                    //获取角色列表
                    UserFormAction.setRoleListLoading(true);
                    UserFormAction.getRoleList();
                });
                if ($('.right-panel-content').hasClass('right-panel-content-slide')) {
                    $('.right-panel-content').removeClass('right-panel-content-slide');
                    SalesTeamAction.showUserInfoPanel();
                } else {
                    SalesTeamAction.showUserInfoPanel();
                }
            }
            //删除、编辑
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            //负责人存在
            if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.userId === salesTeamMember.userId) {
                curShowTeamMemberObj.owner.selected = !curShowTeamMemberObj.owner.selected;
                this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
                return;
            }
            //秘书存在
            if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
                var findManager = false;
                _.some(curShowTeamMemberObj.managers, function(member) {
                    if (member && (member.userId === salesTeamMember.userId)) {
                        member.selected = !member.selected;
                        findManager = true;
                        return findManager;
                    }
                });
                if (findManager) {
                    this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
                    return;
                }
            }
            //成员存在
            if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
                _.some(curShowTeamMemberObj.users, function(member) {
                    if (member && (member.userId === salesTeamMember.userId)) {
                        member.selected = !member.selected;
                        return true;
                    }
                });
                this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
            }
        }
    },

    //还原团队成员对象
    resetCurShowTeamMemberObj: function() {
        this.setState({
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj)
        });
    },

    //还原添加团队成员对象
    resetAddMemberList: function() {
        this.setState({addMemberList: $.extend(true, [], this.props.addMemberList)});
    },

    addMember: function() {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (!this.props.isAddMember) {
            this.resetAddMemberList();
            SalesTeamAction.getIsAddMember();
            this.cleanSearchInput();
        }
    },

    editMember: function() {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (!this.props.isEditMember) {
            this.resetCurShowTeamMemberObj();
            SalesTeamAction.getIsEditMember();
            this.cleanSearchInput();
        }
    },

    //确认的处理
    handleOK: function(e) {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (this.props.isAddMember) {
            Trace.traceEvent(e, '保存添加团队成员的修改');
            this.saveAddMember();
        } else if (this.props.isEditMember) {
            Trace.traceEvent(e, '保存编辑团队成员的修改');
            this.saveEditMember();
        }
    },

    //取消的处理
    handleCancel: function(e) {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (this.props.isAddMember) {
            SalesTeamAction.cancelAddMember();
            this.resetAddMemberList();
            Trace.traceEvent(e, '取消添加团队成员的修改');
        } else if (this.props.isEditMember) {
            SalesTeamAction.cancelEditMember();
            this.resetCurShowTeamMemberObj();
            Trace.traceEvent(e, '取消编辑团队成员的修改');
        }
        this.cleanSearchInput();
    },

    saveEditMember: function() {
        var ownerId = '', managerIds = [], userIds = [];
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //负责人
        if (curShowTeamMemberObj.owner) {
            ownerId = curShowTeamMemberObj.owner.userId;
        }
        //秘书
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            curShowTeamMemberObj.managers.forEach(function(member) {
                managerIds.push(member.userId);
            });
        }
        //成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users.forEach(function(member) {
                userIds.push(member.userId);
            });
        }
        //保存修改后改组的负责人id、秘书id列表、成员id列表
        var saveMemberListObj = {
            groupId: curShowTeamMemberObj.groupId,
            ownerId: ownerId,
            managerIds: JSON.stringify(managerIds),
            userIds: JSON.stringify(userIds)
        };
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(saveMemberListObj);
        this.setState({saveMemberListObj: saveMemberListObj});
        this.cleanSearchInput();
    },

    saveAddMember: function() {
        let userIds = [];
        let selectedAddMembers = _.filter(this.state.addMemberList, member => member && member.selected);
        if (_.isArray(selectedAddMembers) && selectedAddMembers.length) {
            userIds = _.map(selectedAddMembers, 'userId');
            //保存新增的负责人id、秘书id列表、成员id列表
            var saveMemberListObj = {
                groupId: this.state.curShowTeamMemberObj.groupId,
                userIds: JSON.stringify(userIds)
            };
            MemberListEditAction.setMemberListSaving(true);
            MemberListEditAction.addMember(saveMemberListObj);
            this.setState({
                saveMemberListObj: saveMemberListObj
            });
            this.cleanSearchInput();
        }
    },

    searchMember: function(searchValue) {
        searchValue = searchValue ? searchValue : '';
        this.setState({
            searchValue: searchValue
        });
        if (searchValue) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.sales-team-member-search-input-div input'), '输入昵称/用户名进行过滤');
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.sales-team-member-search-input-div input'), '清空搜索内容');
        }
    },

    createOperationBtn: function() {
        var isAddMember = this.props.isAddMember; //是否是添加状态
        var isEditMember = this.props.isEditMember;//是否是编辑状态
        var showMemberOperationBtn = this.props.showMemberOperationBtn;
        var addActiveClass = classNames('add-member-btn operation-top-btn iconfont icon-add', this.props.className, {
            'active-btn': isAddMember
        });
        var editActiveClass = classNames('edit-member-btn operation-top-btn iconfont icon-update', this.props.className, {
            'active-btn': isEditMember
        });
        return (
            showMemberOperationBtn ? null :
                (<div className="operation-top-btn-div">
                    <PrivilegeChecker check="BGM_SALES_TEAM_MEMBER_EDIT" className="operation-top-btn-div-label">
                        <div className={editActiveClass} title={Intl.get('sales.team.edit.team.member', '编辑团队成员')}
                            onClick={this.editMember} data-tracename="编辑团队成员">
                        </div>
                    </PrivilegeChecker>
                    <PrivilegeChecker check="BGM_SALES_TEAM_MEMBER_EDIT" className="operation-top-btn-div-label">
                        <div className={addActiveClass} title={Intl.get('sales.team.add.team.member', '添加团队成员')}
                            onClick={this.addMember} data-tracename="添加团队成员">
                        </div>
                    </PrivilegeChecker>
                </div>)
        );
    },

    //渲染成员头像及名称，memeber:成员信息，type:负责人/秘书/成员，hasSelectBtn:是否需要选择按钮
    renderMemberEle: function(salesTeamMember, type, hasSelectBtn) {
        var selectBtnClass = '';
        //只展示的成员样式
        var memberClass = 'sales-team-member-info';
        if (hasSelectBtn) {
            selectBtnClass = classNames('select-icon-div iconfont icon-select-member', this.props.className, {
                'select-member': salesTeamMember.selected
            });
            //带选择框的成员样式
            memberClass = 'operation-sales-team-member-info';
        }
        let userName = salesTeamMember.userName ? salesTeamMember.userName : '';
        //没有昵称时，用用户名展示
        let nickName = salesTeamMember.nickName ? salesTeamMember.nickName : userName;
        return (
            <div className={memberClass} key={salesTeamMember.userId}
                onClick={this.selectMember.bind(this, salesTeamMember)}>
                <DefaultUserLogoTitle defaultImgClass={'sales-team-member-info-img'}
                    userName={userName}
                    nickName={nickName}
                    userLogo={salesTeamMember.userLogo}
                >
                </DefaultUserLogoTitle>
                {salesTeamMember.status === 0 ? (
                    <div className="sales-team-member-stop"><ReactIntl.FormattedMessage id="common.stop"
                        defaultMessage="停用"/>
                    </div>) : null}
                {type !== MEMBER_TYPE.USER ?
                    (<span className={'iconfont icon-sale-team-' + type}/> ) : null}
                <div className="sales-team-member-info-name-div">
                    {hasSelectBtn ? (<div className={selectBtnClass}></div>) : null}
                    <div className="sales-team-member-info-name" title={nickName}>
                        {nickName}
                    </div>
                </div>
            </div>
        );
    },


    getTableColumns() {
        return [{
            title: Intl.get('member.member', '成员'),
            dataIndex: 'nickName',
            key: 'nickName',
            width: '35%'
        }, {
            title: Intl.get('operation.report.department', '部门'),
            dataIndex: 'department',
            key: 'department',
            width: '25%'
        },{
            title: Intl.get('member.position', '职务'),
            dataIndex: 'position',
            key: 'position',
            width: '25%'
        },{
            title: Intl.get('member.phone', '手机'),
            dataIndex: 'phone',
            key: 'phone',
            width: '15%'
        }];
    },

    // table中的数据处理
    processTableData() {
        let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let dataSource = [];
        let owner = _.get(curShowTeamMemberObj, 'owner');
        if (owner) {
            dataSource = _.concat(dataSource, owner);
        }
        let managers = _.get(curShowTeamMemberObj, 'managers');
        if (managers) {
            dataSource = _.concat(dataSource, managers);
        }
        let users = _.get(curShowTeamMemberObj, 'users');
        if (users) {
            dataSource = _.concat(dataSource, users);
        }
        return dataSource;
    },

    handleRowClick(record, index) {
        this.setState({
            selectedRowIndex: index
        });
        let userId = _.get(record, 'userId');
        UserAction.setCurUser(userId);
        //获取成员的详情
        UserAction.setUserLoading(true);
        UserAction.getCurUserById(userId);
        if ($('.right-panel-content').hasClass('right-panel-content-slide')) {
            $('.right-panel-content').removeClass('right-panel-content-slide');
            SalesTeamAction.showUserInfoPanel();
        } else {
            SalesTeamAction.showUserInfoPanel();
        }
    },

    //处理选中行的样式
    handleRowClassName(record, index){
        if (index === this.state.selectedRowIndex) {
            return 'current-row';
        }
        else {
            return '';
        }
    },

    // 渲染当前正在展示的团队成员列表，使用table的方式
    renderMemberList(){
        let columns = this.getTableColumns();
        let dataSource = this.processTableData();
        return (
            <div className='member-list-table'>
                <AntcTable
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    onRowClick={this.handleRowClick}
                    rowClassName={this.handleRowClassName}
                />
            </div>
        );
    },


    //渲染当前正在展示的团队成员列表
    renderCurTeamMemberList: function(hasSelectBtn) {
        var _this = this;
        var curShowTeamMemberObj = _this.state.curShowTeamMemberObj;
        //负责人
        var ownerElement = null;
        if (curShowTeamMemberObj.owner) {
            ownerElement = (<div className="sales-team-owner-container sales-team-member-tier">
                {_this.renderMemberEle(curShowTeamMemberObj.owner, MEMBER_TYPE.OWNER, hasSelectBtn)}
            </div>);
        }
        //秘书
        var managersElement = null;
        if (curShowTeamMemberObj.managers) {
            managersElement = (<div className="sales-team-manager-container sales-team-member-tier">
                {curShowTeamMemberObj.managers.map(function(manager) {
                    return _this.renderMemberEle(manager, MEMBER_TYPE.MANAGER, hasSelectBtn);
                })}
            </div>);
        }
        //成员
        var usersElement = null;
        if (curShowTeamMemberObj.users) {
            usersElement = (<div className="sales-team-user-container sales-team-member-tier">
                {curShowTeamMemberObj.users.map(function(user) {
                    return _this.renderMemberEle(user, MEMBER_TYPE.USER, hasSelectBtn);
                })}
            </div>);
        }
        return (<div className="sales-team-members-show-div">
            {ownerElement}
            {managersElement}
            {usersElement}
        </div>);
    },

    //获取当前选择成员个数
    getSelectSize: function() {
        var selectedOwnerSize = 0, selectedManagerSize = 0, selectedUserSize = 0;
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //负责人
        if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
            selectedOwnerSize++;
        }
        //管理员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            curShowTeamMemberObj.managers.forEach(function(member) {
                if (member.selected) {
                    selectedManagerSize++;
                }
            });
        }
        //成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users.forEach(function(member) {
                if (member.selected) {
                    selectedUserSize++;
                }
            });
        }
        return {
            selectedOwnerSize: selectedOwnerSize,
            selectedManagerSize: selectedManagerSize,
            selectedUserSize: selectedUserSize,
            selectedSize: selectedOwnerSize + selectedUserSize + selectedManagerSize
        };
    },

    //将选中成员加为XXX的处理
    handleAddMember: function(className, type) {
        if (className && className.indexOf('member-btn-enable') !== -1) {
            var _this = this;
            //将选中成员加为XXX的处理
            _this.state.addMemberList.forEach(function(member) {
                if (member && member.selected && !member.isHidden) {
                    member.roleType = type;//添加成员的角色，负责人：owner,秘书：manager,成员：user
                    member.isHidden = true;//该成员已选择添加了，在添加列表中则不显示
                }
            });
            _this.setState({
                addMemberList: _this.state.addMemberList
            });
        }
    },

    //删除团队成员的处理
    delMember: function() {
        if (!$('#del-member-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let delObj = {
            group_id: curShowTeamMemberObj.groupId,
            operate: 'delete'
        };
        //删除负责人
        if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
            delObj.owner_id = curShowTeamMemberObj.owner.userId;
            delObj.type = MEMBER_TYPE.OWNER;
        }
        //删除秘书
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            let managerIds = [];
            curShowTeamMemberObj.managers.forEach(member => {
                if (member.selected) {
                    managerIds.push(member.userId);
                }
            });
            if (managerIds.length) {
                delObj.user_ids = JSON.stringify(managerIds);
                delObj.type = MEMBER_TYPE.MANAGER;
            }
        }
        //删除成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            let userIds = [];
            curShowTeamMemberObj.users.forEach(member => {
                if (member.selected) {
                    userIds.push(member.userId);
                }
            });
            if (userIds.length) {
                delObj.user_ids = JSON.stringify(userIds);
                delObj.type = MEMBER_TYPE.USER;
            }
        }
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(delObj);
        this.setState({saveMemberListObj: delObj});
        this.cleanSearchInput();
    },

    //加为负责人的处理
    addOwner: function(event) {
        if (!$('#set-owner-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        var oldOwner = curShowTeamMemberObj.owner;//原负责人
        var newOwner = null;//新负责人
        if (oldOwner && oldOwner.selected) {
            //当前选中要设置为负责人的就是负责人时，不做修改
            return;
        }
        let editObj = {
            group_id: curShowTeamMemberObj.groupId,
            operate: 'exchange_owner'
        };
        let ownerId = '';
        //当前选中的是秘书，将秘书转为负责人
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            let selectedManager = _.find(curShowTeamMemberObj.managers, member => member.selected);
            if (selectedManager && selectedManager.userId) {
                ownerId = selectedManager.userId;
                editObj.type = MEMBER_TYPE.MANAGER;
            }
        }
        //当前选中的是成员
        if (!newOwner && _.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            let user = _.find(curShowTeamMemberObj.users, member => member.selected);
            if (user && user.userId) {
                ownerId = user.userId;
                editObj.type = MEMBER_TYPE.USER;
            }
        }
        if (ownerId) {
            editObj.user_ids = JSON.stringify([ownerId]);
            MemberListEditAction.setMemberListSaving(true);
            MemberListEditAction.editMember(editObj);
            this.setState({saveMemberListObj: editObj});
        }
    },

    //加为秘书的处理
    addManager: function(event) {
        if (!$('#set-manager-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let editObj = {
            group_id: curShowTeamMemberObj.groupId
        };
        //负责人转为秘书
        if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
            editObj.owner_id = curShowTeamMemberObj.owner.userId;
            editObj.type = MEMBER_TYPE.OWNER;
            editObj.operate = 'move_manager';
        }
        //成员转为秘书
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            let managerIds = [];
            curShowTeamMemberObj.users.forEach((member) => {
                if (member.selected) {
                    managerIds.push(member.userId);
                }
            });
            if (managerIds.length) {
                editObj.user_ids = JSON.stringify(managerIds);
                editObj.type = MEMBER_TYPE.USER;
                editObj.operate = 'exchange';
            }
        }
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(editObj);
        this.setState({saveMemberListObj: editObj});

    },

    //加为成员的处理
    addUser: function(event) {
        if (!$('#set-user-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let editObj = {
            group_id: curShowTeamMemberObj.groupId
        };
        //负责人转为成员
        if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
            editObj.owner_id = curShowTeamMemberObj.owner.userId;
            editObj.type = MEMBER_TYPE.OWNER;
            editObj.operate = 'move_member';
        }
        //秘书转为成员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            let userIds = [];
            curShowTeamMemberObj.managers.forEach(member => {
                if (member.selected) {
                    userIds.push(member.userId);
                }
            });
            if (userIds.length) {
                editObj.user_ids = JSON.stringify(userIds);
                editObj.type = MEMBER_TYPE.MANAGER;
                editObj.operate = 'exchange';
            }
        }
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(editObj);
        this.setState({saveMemberListObj: editObj});
    },

    hideSaveTooltip: function() {
        var type = this.props.isAddMember ? 'add' : 'edit';
        MemberListEditAction.clearSaveFlags(type, this.state.saveMemberListResult, this.state.saveMemberListObj);
    },

    //渲染'设为xx'按钮
    renderEditBtns: function() {
        //成员列表已选择成员的个数
        let selectSizeObj = this.getSelectSize();
        //负责人按钮样式设置
        let addOwnerBtnCls = classNames('add-member-btn', {
            //只选一个非负责人成员时，加为负责任按钮点击事件可用
            'member-btn-enable': selectSizeObj.selectedSize === 1 && !selectSizeObj.selectedOwnerSize
        });
        let addManagerEnable = true;
        //不可同时选择了owner和user设为管理员，只能选一种角色中的人进行转换
        if (selectSizeObj.selectedSize === 0
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedUserSize)
            || (selectSizeObj.selectedManagerSize === selectSizeObj.selectedSize)) {
            addManagerEnable = false;
        }
        //管理员按钮样式设置
        let addManagerBtnCls = classNames('add-member-btn', {
            'member-btn-enable': addManagerEnable
        });
        let addUserEnable = true;
        //不可同时选择了owner和manager设为成员，只能选一种角色中的人进行转换
        if (selectSizeObj.selectedSize === 0
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedManagerSize)
            || (selectSizeObj.selectedSize === selectSizeObj.selectedUserSize)) {
            addUserEnable = false;
        }
        //成员按钮样式设置
        let addUserBtnCls = classNames('add-member-btn', {
            'member-btn-enable': addUserEnable
        });
        let delBtnEnable = true;
        //只能选一种角色的人进行删除
        if (selectSizeObj.selectedSize === 0
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedUserSize)
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedManagerSize)
            || (selectSizeObj.selectedManagerSize && selectSizeObj.selectedUserSize)) {
            delBtnEnable = false;
        }
        //删除按钮样式设置
        let delMemberBtnCls = classNames('add-member-btn', {
            'member-btn-enable': delBtnEnable
        });
        return (
            <div className="set-select-member-btns">
                {this.renderSaveMsg()}
                <div id="del-member-btn" className={delMemberBtnCls} onClick={this.delMember}
                    data-tracename="删除成员">{Intl.get('common.delete', '删除')}</div>
                <div id="set-owner-btn" className={addOwnerBtnCls} onClick={this.addOwner}
                    data-tracename="设为负责人">{Intl.get('sales.team.add.owner', '设为负责人')}</div>
                <div id="set-manager-btn" className={addManagerBtnCls} onClick={this.addManager}
                    data-tracename="设为秘书">{Intl.get('sales.team.add.manager', '设为秘书')}</div>
                <div id="set-user-btn" className={addUserBtnCls} onClick={this.addUser}
                    data-tracename="设为成员">{Intl.get('sales.team.add.to.member', '设为成员')}</div>
                <div className="add-member-btn member-btn-enable" onClick={(e) => {
                    this.handleCancel(e);
                }}>
                    {Intl.get('common.cancel', '取消')}
                </div>
            </div>
        );
    },

    //渲染保存结果的提示
    renderSaveMsg: function() {
        let saveResult = this.state.saveMemberListResult;
        return saveResult ?
            (<div className="indicator">
                <AlertTimer time={saveResult === 'error' ? 3000 : 600}
                    message={this.state.saveMemberListMsg}
                    type={saveResult} showIcon
                    onHide={this.hideSaveTooltip}/>
            </div>) : null;

    },

    renderAddBtns: function() {
        return (<div className="operation-bottom-btn-div">
            {this.renderSaveMsg()}
            <Button type="ghost" className="operation-bottom-btn btn-primary-sure"
                onClick={(e) => this.handleOK(e)}>
                {Intl.get('common.add', '添加')}
            </Button>
            <Button type="ghost" className="operation-bottom-btn btn-primary-cancel"
                onClick={(e) => this.handleCancel(e)}>
                {Intl.get('common.cancel', '取消')}
            </Button>
        </div>);
    },

    createMemberInfoElement: function() {
        var _this = this;
        var selectMemberListH = 0;
        let memberListContainerH = this.state.memberListHeight;
        if (_this.props.isAddMember || _this.props.isEditMember) {
            selectMemberListH = memberListContainerH - 20 - 35;//20:paddingTOP+paddingBottom,35:BtnH+margin
            if (_this.props.isAddMember) {
                selectMemberListH -= 42;//42：搜索框的高度
            }
        } else {
            selectMemberListH -= 20;//20：padding
        }

        return _this.props.isAddMember ?
            (<div className="sales-team-member-add-container">
                <div className="sales-team-member-search-input-div">
                    <SearchInput
                        searchPlaceHolder={Intl.get('sales.team.sales.team.search.placeholder', '请输入昵称/用户名进行过滤')}
                        searchEvent={this.searchMember}/>
                </div>
                <div className="sales-team-member-select-list sales-team-member-tier"
                    style={{height: selectMemberListH}}>
                    {this.props.addMemberListTipMsg ? (
                        <div className="member-list-tip"> {this.props.addMemberListTipMsg} </div>) : (<GeminiScrollbar
                        className="geminiScrollbar-div sales-team-member-select-geminiScrollbar">
                        {
                            _this.state.addMemberList.map(function(salesTeamMember) {
                                //搜索的过滤
                                if (salesTeamMember.nickName.indexOf(_this.state.searchValue) !== -1 || salesTeamMember.userName.indexOf(_this.state.searchValue) !== -1) {
                                    //已选择加为的过滤
                                    if (!salesTeamMember.isHidden) {
                                        return _this.renderMemberEle(salesTeamMember, MEMBER_TYPE.USER, true);
                                    }
                                }
                            })
                        }
                    </GeminiScrollbar>)
                    }
                </div>
                {_this.renderAddBtns()}
            </div>) : _this.props.isEditMember ? (
                <div className="sales-team-member-edit-container">
                    <div className="sales-team-member-select-list sales-team-member-tier"
                        style={{height: selectMemberListH}}>
                        {this.props.teamMemberListTipMsg ? (
                            <div className="member-list-tip"> {this.props.teamMemberListTipMsg} </div>) : (
                            <GeminiScrollbar
                                className="geminiScrollbar-div sales-team-member-select-geminiScrollbar">
                                {_this.renderMemberList(true)}
                            </GeminiScrollbar>)
                        }
                    </div>
                    {this.renderEditBtns()}
                </div>
            ) : (<div className="sales-team-member-show-list sales-team-member-tier"
                style={{height: memberListContainerH - 20}}>
                {
                    this.props.teamMemberListTipMsg ? (
                        <div className="member-list-tip">
                            {this.props.teamMemberListTipMsg}
                        </div>
                    ) : (
                        <GeminiScrollbar
                            className="geminiScrollbar-div sales-team-member-select-geminiScrollbar"
                        >
                            {_this.renderMemberList()}
                        </GeminiScrollbar>)
                }
            </div>);
    },

    //修改团队销售目标时的处理
    changeTeamSalesGoals: function(val) {
        let salesGoals = this.state.salesGoals;
        salesGoals.goal = this.turnGoalToSaveData(val);
        this.setState({salesGoals});
    },

    //修改成员销售目标时的处理
    changeMemberSalesGoals: function(val) {
        let salesGoals = this.state.salesGoals;
        salesGoals.member_goal = this.turnGoalToSaveData(val);
        this.setState({salesGoals});
    },

    //展示是否保存团队销售目标的确认框
    showTeamConfirm: function(e) {
        if (this.props.salesGoals.goal !== this.state.salesGoals.goal) {
            this.setState({teamConfirmVisible: true});
            Trace.traceEvent(e, '修改团队销售目标');
        }
    },

    //展示是否保存个人销售目标的确认框
    showMemberConfirm: function(e) {
        if (this.props.salesGoals.member_goal !== this.state.salesGoals.member_goal) {
            this.setState({memberConfirmVisible: true});
            Trace.traceEvent(e, '修改个人销售目标');
        }
    },

    //将销售目标转换为保存时所需的数据x万=>x*10000
    turnGoalToSaveData: function(goal) {
        return _.isNumber(goal) && !_.isNaN(goal) ? (goal * 10000) : null;
    },

    //获取要保存的销售目标
    getSaveSalesGoals: function(type) {
        let curTeamObj = this.state.curShowTeamMemberObj;
        let salesGoals = this.state.salesGoals;
        let saveParams = {};
        if (type === SALES_GOALS_TYPE.TEAM) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.member-top-operation-div'), '保存团队销售目标');
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            //团队销售目标
            saveParams = {
                sales_team_id: curTeamObj.groupId,
                sales_team: curTeamObj.groupName,
                goal: salesGoals.goal
            };
            if (salesGoals.id) {
                //修改时加上销售目标的id
                saveParams.id = salesGoals.id;
            }
            //将团队的销售目标加在团队的owner上
            if (curTeamObj.owner && curTeamObj.owner.nickName && curTeamObj.owner.userId){
                saveParams.users = [{
                    goal: salesGoals.goal,
                    user_id: curTeamObj.owner.userId,
                    user_name: curTeamObj.owner.nickName
                }];
                if (_.isArray(salesGoals.users)){
                    let ownerItem = _.find(salesGoals.users, userItem => userItem.user_id === curTeamObj.owner.userId);
                    //修改团队目标时，如果团队owner的id存在，也要把团队owner的id加上
                    if (ownerItem && ownerItem.id){
                        saveParams.users[0].id = ownerItem.id;
                    }
                }
            }
        } else if (type === SALES_GOALS_TYPE.MEMBER) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.member-top-operation-div'), '保存个人销售目标');
            //个人销售目标
            if (_.isArray(curTeamObj.users) && curTeamObj.users.length) {
                saveParams = {
                    sales_team_id: curTeamObj.groupId,
                    sales_team: curTeamObj.groupName
                };
                saveParams.users = curTeamObj.users.map(user => {
                    let userGoal = {
                        user_id: user.userId,
                        user_name: user.nickName,
                        goal: salesGoals.member_goal
                    };
                    //修改时id的处理
                    if (_.isArray(salesGoals.users) && salesGoals.users.length) {
                        let oldUserGoal = _.find(salesGoals.users, goal => goal.user_id === user.userId);
                        if (oldUserGoal && oldUserGoal.id) {
                            userGoal.id = oldUserGoal.id;
                        }
                    }
                    return userGoal;
                });
            }
        }
        return saveParams;
    },

    //保存销售目标
    saveSalesGoals: function(type) {
        let salesGoals = this.getSaveSalesGoals(type);
        //修改的团队目标并且数值未更改
        var isTeamGoalNoChange = type === SALES_GOALS_TYPE.TEAM && this.state.salesGoals.goal === this.props.salesGoals.goal;
        //修改的个人目标并且数值未更改
        var isMemberGoalNoChange = type === SALES_GOALS_TYPE.MEMBER && this.state.salesGoals.member_goal === this.props.salesGoals.member_goal;
        if (isTeamGoalNoChange || isMemberGoalNoChange){
            this.cancelSaveSalesGoals(type,true);
            return;
        }
        this.setState({
            isSavingTeamGoal: type === SALES_GOALS_TYPE.TEAM,
            isSavingMemberGoal: type === SALES_GOALS_TYPE.MEMBER
        });
        salesTeamAjax.saveSalesGoals(salesGoals).then(result => {
            this.setState({
                isSavingTeamGoal: false,
                isSavingMemberGoal: false
            });
            if (result) {
                SalesTeamAction.updateSalesGoals({type: type, salesGoals: result});
            } else {
                this.cancelSaveSalesGoals(type,false);
            }
        }, errorMsg => {
            this.setState({
                isSavingTeamGoal: false,
                isSavingMemberGoal: false
            });
            message.error(errorMsg || Intl.get('common.edit.failed', '修改失败'));
            this.cancelSaveSalesGoals(type,false);
        });
    },

    closeRightPanel: function() {
        //将数据清空
        UserAction.setInitialData();
        SalesTeamAction.closeRightPanel();
        UserAction.hideContinueAddButton();
    },

    //取消销售目标的保存
    cancelSaveSalesGoals: function(type,flag) {
        let salesGoals = this.state.salesGoals;
        if (type === SALES_GOALS_TYPE.TEAM) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.member-top-operation-div'), '取消团队销售目标的保存');
            salesGoals.goal = this.props.salesGoals.goal;
            this.setState({teamConfirmVisible: false, salesGoals});
            this.toggleBatchChangeTeamGoalBtn(flag);
        } else if (type === SALES_GOALS_TYPE.MEMBER) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.member-top-operation-div'), '取消个人销售目标的保存');
            salesGoals.member_goal = this.props.salesGoals.member_goal;
            this.setState({memberConfirmVisible: false, salesGoals});
            this.toggleBatchChangeSelfGoalBtn(flag);

        }
    },

    //将销售目标转换为界面展示所需数据：x0000=>x万
    turnGoalToShowData: function(goal) {
        return _.isNumber(goal) && !_.isNaN(goal) ? (goal / 10000) : '';
    },

    toggleBatchChangeTeamGoalBtn: function(flag) {
        this.setState({
            isShowBatchChangeTeamGoal: flag
        });
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.sales-team-goals-container'), '设置团队销售目标');

    },

    toggleBatchChangeSelfGoalBtn: function(flag) {
        this.setState({
            isShowBatchChangeSelfGoal: flag
        });
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.sales-team-goals-container'), '批量设置个人销售目标');

    },

    //渲染团队目标
    renderSalesGoals: function() {
        return (
            <div className="sales-team-goals-container" data-tracename="团队管理">
                <span className="iconfont icon-sales-goals" title={Intl.get('sales.team.sales.goal', '销售目标')} data-tracename="团队管理"/>
                {this.state.isShowBatchChangeTeamGoal ? <Button className="team-sales-goal" onClick={this.toggleBatchChangeTeamGoalBtn.bind(this, false)}>{Intl.get('common.batch.sales.target', '设置团队销售目标')}</Button> : <div className="sales-goals-item">
                    <span className="sales-goals-label">{Intl.get('user.user.team', '团队')}：</span>
                    <InputNumber className="team-goals-input"
                        value={this.turnGoalToShowData(this.state.salesGoals.goal)}
                        onChange={this.changeTeamSalesGoals}
                    />
                    {this.state.isSavingTeamGoal ? <Icon type="loading"/> : <span className="team-icon-container">
                        <i className="iconfont icon-choose" onClick={this.saveSalesGoals.bind(this, SALES_GOALS_TYPE.TEAM)}></i>
                        <i className="iconfont icon-close" onClick={this.cancelSaveSalesGoals.bind(this, SALES_GOALS_TYPE.TEAM, true)}></i>
                    </span>}


                    <span className="sales-goals-label">{Intl.get('contract.139', '万')}，</span>
                </div>}
                {this.state.isShowBatchChangeSelfGoal ? <Button className="self-sales-goal" onClick={this.toggleBatchChangeSelfGoalBtn.bind(this, false)}>{Intl.get('common.batch.self.sales.target', '批量设置个人销售目标')}</Button> : <div className="sales-goals-item">
                    <span className="sales-goals-label">{Intl.get('sales.team.personal', '个人')}：</span>
                    <InputNumber className="member-goals-input"
                        value={this.turnGoalToShowData(this.state.salesGoals.member_goal)}
                        onChange={this.changeMemberSalesGoals}
                    />
                    {this.state.isSavingMemberGoal ? <Icon type="loading"/> : <span className="member-icon-container">
                        <i className="iconfont icon-choose" onClick={this.saveSalesGoals.bind(this, SALES_GOALS_TYPE.MEMBER)}></i>
                        <i className="iconfont icon-close" onClick={this.cancelSaveSalesGoals.bind(this, SALES_GOALS_TYPE.MEMBER, true)}></i>
                    </span>}

                    <span className="sales-goals-label">{Intl.get('contract.139', '万')}</span>
                </div>}
            </div>);
    },

    //修改用户的基本信息或者修改用户的状态后
    changeUserFieldSuccess: function(user) {
        //修改用户的昵称
        SalesTeamAction.updateCurShowTeamMemberObj(user);
    },

    updateUserStatus: function(updateObj) {
        UserAction.updateUserStatus(updateObj);
        UserAction.updateCurrentUserStatus(updateObj.status);
        this.changeUserFieldSuccess(updateObj);
    },

    //修改团队后的处理
    afterEditTeamSuccess: function(user) {
        SalesTeamAction.updateCurShowTeamMemberObj(user);
        //对左边数据重新进行获取
        SalesTeamAction.getTeamMemberCountList();
    },

    render: function() {
        var salesTeamPersonnelWidth = this.props.salesTeamMemberWidth;
        var containerHeight = this.props.containerHeight;
        return (
            <div className="sales-team-personnel"
                style={{height: containerHeight, width: salesTeamPersonnelWidth}} data-tracename="团队列表">
                <div className="member-top-operation-div">
                    <div className="member-top-operation-div-title">
                        {this.state.curShowTeamMemberObj.groupName || ''}
                    </div>
                    {this.state.isLoadingSalesGoal || this.state.getSalesGoalErrMsg ? null : this.renderSalesGoals()}
                    {this.createOperationBtn()}
                </div>
                <div className="member-list-div"
                    style={{height: this.state.memberListHeight}}>
                    {
                        this.props.isLoadingTeamMember ? (
                            <Spinner className="isloading"/>) : this.createMemberInfoElement()
                    }
                </div>
                {this.state.isMemberListSaving ? (<div className="member-list-edit-block">
                    <Spinner className="isloading"/>
                </div>) : ''}
                {this.props.rightPanelShow ? (
                    <UserInfo
                        userInfo={this.state.currentUser}
                        closeRightPanel={this.closeRightPanel}
                        changeUserFieldSuccess={this.changeUserFieldSuccess}
                        updateUserStatus={this.updateUserStatus}
                        userInfoShow={this.props.userInfoShow}
                        userFormShow={this.props.userFormShow}
                        afterEditTeamSuccess={this.afterEditTeamSuccess}
                    />) : null}
            </div>
        );
    },
});
module.exports = MemberList;
