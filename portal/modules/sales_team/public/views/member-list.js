/**
 * Created by xiaojinfeng on 2016/04/13.
 */
const createReactClass = require('create-react-class');
import {InputNumber, Button, message, Icon} from 'antd';
import {PrivilegeChecker, hasPrivilege} from 'CMP_DIR/privilege/checker';
const Spinner = require('../../../../components/spinner');
const AlertTimer = require('../../../../components/alert-timer');
import {SearchInput} from 'antc';
const classNames = require('classnames');
const SalesTeamAction = require('../action/sales-team-actions');
const MemberListEditAction = require('../action/member-list-edit-actions');
const MemberListEditStore = require('../store/member-list-edit-store');
import salesTeamAjax from '../ajax/sales-team-ajax';
import Trace from 'LIB_DIR/trace';
import MemberInfo from 'MOD_DIR/member_manage/public/view/member-info';
import MemberManageStore from 'MOD_DIR/member_manage/public/store';
import MemberManageAction from 'MOD_DIR/member_manage/public/action';
import MemberFormAction from 'MOD_DIR/member_manage/public/action/member-form-actions';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import MemberTableList from 'MOD_DIR/member-table-list';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
import SALES_DEPARTMENT_PRIVILEGE from '../privilege-const';
import MEMBER_MANAGE_PRIVILEGE from 'MOD_DIR/member_manage/public/privilege-const';
import {isOpenCash} from 'PUB_DIR/sources/utils/common-method-util';

const tableHeadHeight = 50; // table表格头部高度

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
const MemberList = createReactClass({
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
        userFormShow: PropTypes.bool,
        selectedRowIndex: PropTypes.number,
        roleList: PropTypes.array
    },
    getInitialState: function() {
        let savingFlags = MemberListEditStore.getState();
        return {
            searchValue: _.get(this.state, 'searchValue', ''),
            addMemberList: $.extend(true, [], this.props.addMemberList),
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj),
            salesGoals: _.extend({}, this.props.salesGoals),
            isMemberListSaving: savingFlags.isMemberListSaving,//是否正在保存修改的成员列表
            saveMemberListResult: savingFlags.saveMemberListResult,//error，success
            saveMemberListMsg: savingFlags.saveMemberListMsg,//保存结果的提示信息
            saveMemberListObj: {},//修改、添加时要保存的数据对象
            teamConfirmVisible: false,
            memberConfirmVisible: false,
            memberListHeight: this.props.containerHeight,
            currentMember: MemberManageStore.getState().currentMember,
            isGetMemberDetailLoading: MemberManageStore.getState().isGetMemberDetailLoading,
            isLoadingSalesGoal: this.props.isLoadingSalesGoal,
            getSalesGoalErrMsg: this.props.getSalesGoalErrMsg,
            isShowBatchChangeTeamGoal: true,//是否展示设置团队目标按钮
            isShowBatchChangeSelfGoal: true, //是否展示设置个人目标按钮
            isSavingTeamGoal: false, //正在保存团队目标
            isSavingMemberGoal: false,//正在保存个人目标
            selectedRowKeys: _.get(this.state, 'selectedRowKeys', []), // 选中的行
        };
    },

    onChange: function() {
        let savingFlags = MemberListEditStore.getState();
        this.setState({
            isMemberListSaving: savingFlags.isMemberListSaving,
            saveMemberListResult: savingFlags.saveMemberListResult,
            saveMemberListMsg: savingFlags.saveMemberListMsg,
            currentMember: MemberManageStore.getState().currentMember,
            isGetMemberDetailLoading: MemberManageStore.getState().isGetMemberDetailLoading,
        });
    },

    layout: function() {
        setTimeout(() => {
            this.setState({memberListHeight: this.props.containerHeight});
        });
    },

    componentDidMount: function() {
        MemberListEditStore.listen(this.onChange);
        MemberManageStore.listen(this.onChange);
        $(window).on('resize', this.layout);
    },

    componentWillUnmount: function() {
        MemberListEditStore.unlisten(this.onChange);
        MemberManageStore.unlisten(this.onChange);
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

    // 显示成员详情
    showMemberInfo(member, index) {
        Trace.traceEvent('团队管理','点击查看成员详情');
        let id = _.get(member, 'userId');
        MemberManageAction.setCurMember(id);
        MemberManageAction.setMemberLoading(true);
        // 获取成员详情
        MemberManageAction.getCurMemberById(id);
        setTimeout(() => {
            //获取团队列表
            if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
                MemberFormAction.setTeamListLoading(true);
                MemberFormAction.getUserTeamList();
            }
        });
        if ($('.right-panel-content').hasClass('right-panel-content-slide')) {
            $('.right-panel-content').removeClass('right-panel-content-slide');
            SalesTeamAction.showUserInfoPanel(index);
        } else {
            SalesTeamAction.showUserInfoPanel(index);
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

    addMember() {
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

    editMember() {
        // 如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (!this.props.isEditMember) {
            SalesTeamAction.getIsEditMember();
            this.resetCurShowTeamMemberObj();
            this.cleanSearchInput();
        }
    },

    //确认的处理
    handleOK(e) {
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
    handleCancel(e) {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (this.props.isAddMember) {
            this.setState({
                selectedRowKeys: []
            }, () => {
                SalesTeamAction.cancelAddMember();
                this.resetAddMemberList();
            });
            Trace.traceEvent(e, '取消添加团队成员的修改');
        } else if (this.props.isEditMember) {
            this.setState({
                selectedRowKeys: []
            }, () => {
                SalesTeamAction.cancelEditMember();
                this.resetCurShowTeamMemberObj();
            });
            Trace.traceEvent(e, '取消编辑团队成员的修改');
        }
        this.cleanSearchInput();
    },

    saveEditMember() {
        let ownerId = '', managerIds = [], userIds = [];
        let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
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
        let saveMemberListObj = {
            groupId: curShowTeamMemberObj.groupId,
            ownerId: ownerId,
            managerIds: JSON.stringify(managerIds),
            userIds: JSON.stringify(userIds)
        };
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(saveMemberListObj);
        this.setState({
            saveMemberListObj: saveMemberListObj,
            selectedRowKeys: [],
        });
        this.cleanSearchInput();
    },

    getSearchAddMemberList() {
        let addMemberList = this.state.addMemberList;
        let searchValue = this.state.searchValue;
        if (searchValue) {
            addMemberList = _.filter(addMemberList, item => _.includes(item.userName, searchValue) || _.includes(item.name, searchValue));
        }
        return addMemberList;
    },

    saveAddMember() {
        let userIds = [];
        let selectedRowKeys = this.state.selectedRowKeys;
        let addMemberList = this.getSearchAddMemberList();
        _.each(selectedRowKeys, item => {
            addMemberList[item].selected = true;
        });
        let selectedAddMembers = _.filter(addMemberList, member => member && member.selected);
        if (_.isArray(selectedAddMembers) && selectedAddMembers.length) {
            userIds = _.map(selectedAddMembers, 'userId');
            //保存新增的负责人id、秘书id列表、成员id列表
            let saveMemberListObj = {
                groupId: this.state.curShowTeamMemberObj.groupId,
                userIds: JSON.stringify(userIds)
            };
            MemberListEditAction.setMemberListSaving(true);
            MemberListEditAction.addMember(saveMemberListObj);
            this.setState({
                saveMemberListObj: saveMemberListObj,
                selectedRowKeys: []
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

    memberStatusClass(status){
        return classNames({'member-status': status === 0});
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
        if (managers && _.get(managers, 'length')) {
            dataSource = _.concat(dataSource, managers);
        }
        let users = _.get(curShowTeamMemberObj, 'users');
        if (users && _.get(users, 'length')) {
            dataSource = _.concat(dataSource, users);
        }
        return dataSource;
    },

    handleRowClick(record, index) {
        this.showMemberInfo(record, index);
    },

    onSelectChange(selectedRowKeys){
        this.setState({
            selectedRowKeys: selectedRowKeys
        });
    },

    // 渲染当前正在展示的团队成员列表，使用table的方式
    renderMemberList(flag, addMemberList){
        let dataSource = this.processTableData();

        if (flag === 'add') {
            dataSource = addMemberList;
        }
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        const hasSelected = _.get(selectedRowKeys, 'length', 0);

        if (hasSelected) {
            if (!this.props.isAddMember) {
                this.editMember();
            }
        }
        let height = this.state.memberListHeight - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        let tableHeight = height - tableHeadHeight;
        let operationZoneWidth = this.props.salesTeamMemberWidth;
        return (
            <div className="member-table-container" style={{height: height}}>
                {
                    hasSelected ? (
                        <div className='operation-zone' style={{width: operationZoneWidth}}>
                            <span className="select-row-number">
                                {Intl.get('member.selected.member.count', '已选{count}', {count: hasSelected})}
                            </span>
                            {
                                this.props.isAddMember ? this.renderAddBtns() : this.renderEditBtns()
                            }
                        </div>
                    ) : (
                        <div className='sale-goal-zone' style={{width: operationZoneWidth}}>
                            <span className="member-top-operation-div-title">
                                {this.state.curShowTeamMemberObj.groupName || ''}
                            </span>
                            {
                                this.state.isLoadingSalesGoal || this.state.getSalesGoalErrMsg ? null :
                                    this.renderSalesGoals()}
                        </div>
                    )
                }
                <div className='member-list-table' style={{height: height}}>
                    <div style={{ height: height }}>
                        <MemberTableList
                            rowSelection={rowSelection}
                            dataSource={dataSource}
                            handleRowClick={this.handleRowClick}
                            selectedRowIndex={this.props.selectedRowIndex}
                            isShowMemberDetail={this.props.rightPanelShow}
                            tableHeight={tableHeight}
                            isHideTableTitle={hasSelected !== 0 || this.state.curShowTeamMemberObj.groupName}
                        />
                    </div>

                </div>
            </div>
        );
    },

    // 编辑团队数据时，处理选中的数据
    handleEditTeamData() {
        let selectedRowKeys = this.state.selectedRowKeys;
        let curMemberList = this.processTableData();
        // 去除之前选择的状态
        _.each(curMemberList, (item) => {
            if (item.selected) {
                delete item.selected;
            }
        });
        // 更新这次选择的成员的状态
        _.each(selectedRowKeys, item => {
            curMemberList[item].selected = true;
        });
        return curMemberList;
    },

    //获取当前选择成员个数
    getSelectSize: function() {
        let selectedOwnerSize = 0, selectedManagerSize = 0, selectedUserSize = 0;
        let curMemberList = this.handleEditTeamData();
        _.each(curMemberList, item => {
            if (item.selected) {
                if (item.role === 'owner') { // 负责人
                    selectedOwnerSize++;
                }
                if (item.role === 'manager') { // 秘书
                    selectedManagerSize++;
                }
                if (item.role === 'user') { // 成员
                    selectedUserSize++;
                }
            }
        });
        return {
            selectedOwnerSize: selectedOwnerSize,
            selectedManagerSize: selectedManagerSize,
            selectedUserSize: selectedUserSize,
            selectedSize: selectedOwnerSize + selectedUserSize + selectedManagerSize
        };
    },

    //移除团队成员的处理
    delMember() {
        if (!$('#del-member-btn').hasClass('member-btn-enable')) {
            return;
        }
        let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let delObj = {
            group_id: curShowTeamMemberObj.groupId,
            operate: 'delete'
        };
        let curMemberList = this.handleEditTeamData();
        //移除负责人
        let owner = _.get(curShowTeamMemberObj, 'owner');
        if (owner) {
            _.each(curMemberList, item => {
                if (item.role === 'owner') {
                    if (item.selected) {
                        delObj.owner_id = item.userId;
                        delObj.type = MEMBER_TYPE.OWNER;
                    }
                }
            });
        }
        //移除秘书
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            let managerIds = [];
            _.each(curMemberList, item => {
                if (item.role === 'manager') {
                    if (item.selected) {
                        managerIds.push(item.userId);
                    }
                }
            });
            if (managerIds.length) {
                delObj.user_ids = JSON.stringify(managerIds);
                delObj.type = MEMBER_TYPE.MANAGER;
            }
        }
        //移除成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            let userIds = [];
            _.each(curMemberList, item => {
                if (item.role === 'user') {
                    if (item.selected) {
                        userIds.push(item.userId);
                    }
                }
            });
            if (userIds.length) {
                delObj.user_ids = JSON.stringify(userIds);
                delObj.type = MEMBER_TYPE.USER;
            }
        }
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(delObj);
        this.setState({
            saveMemberListObj: delObj,
            selectedRowKeys: [],
        });
        this.cleanSearchInput();
    },

    //加为负责人的处理
    addOwner(event) {
        if (!$('#set-owner-btn').hasClass('member-btn-enable')) {
            return;
        }
        let curMemberList = this.handleEditTeamData();
        _.each(curMemberList, item => {
            if (item.role === 'owner') { // 负责人
                if (item.selected) {
                    //当前选中要设置为负责人的就是负责人时，不做修改
                    return;
                }
            }
        });
        let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let newOwner = null; //新负责人
        let editObj = {
            group_id: curShowTeamMemberObj.groupId,
            operate: 'exchange_owner'
        };
        let ownerId = '';

        //当前选中的是秘书，将秘书转为负责人
        _.each(curMemberList, item => {
            if (item.role === 'manager') {
                if (item.selected) {
                    ownerId = item.userId;
                    editObj.type = MEMBER_TYPE.MANAGER;
                }
            }
        });
        if (!newOwner && _.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            //当前选中的是成员
            _.each(curMemberList, item => {
                if (item.role === 'user') {
                    if (item.selected) {
                        ownerId = item.userId;
                        editObj.type = MEMBER_TYPE.USER;
                    }
                }
            });
        }
        if (ownerId) {
            editObj.user_ids = JSON.stringify([ownerId]);
            MemberListEditAction.setMemberListSaving(true);
            MemberListEditAction.editMember(editObj);
            this.setState({
                saveMemberListObj: editObj,
                selectedRowKeys: [],
            });
        }
    },

    //加为秘书的处理
    addManager: function(event) {
        if (!$('#set-manager-btn').hasClass('member-btn-enable')) {
            return;
        }
        let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let editObj = {
            group_id: curShowTeamMemberObj.groupId
        };

        //负责人转为秘书
        let curMemberList = this.handleEditTeamData();
        _.each(curMemberList, item => {
            if (item.role === 'owner') {
                if (item.selected) {
                    editObj.owner_id = item.userId;
                    editObj.type = MEMBER_TYPE.OWNER;
                    editObj.operate = 'move_manager';
                }
            }
        });

        //成员转为秘书
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            let managerIds = [];
            _.each(curMemberList, item => {
                if (item.role === 'user') {
                    if (item.selected) {
                        managerIds.push(item.userId);
                    }
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
        this.setState({
            saveMemberListObj: editObj,
            selectedRowKeys: []
        });

    },

    //加为成员的处理
    addUser: function(event) {
        if (!$('#set-user-btn').hasClass('member-btn-enable')) {
            return;
        }
        let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        let editObj = {
            group_id: curShowTeamMemberObj.groupId
        };

        let curMemberList = this.handleEditTeamData();
        //负责人转为成员
        if (curShowTeamMemberObj.owner) {
            _.each(curMemberList, item => {
                if (item.role === 'owner') {
                    if (item.selected) {
                        editObj.owner_id = item.userId;
                        editObj.type = MEMBER_TYPE.OWNER;
                        editObj.operate = 'move_member';
                    }
                }
            });
        }
        //秘书转为成员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            let userIds = [];
            _.each(curMemberList, item => {
                if (item.role === 'manager') {
                    if (item.selected) {
                        userIds.push(item.userId);
                    }
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
        this.setState({
            saveMemberListObj: editObj,
            selectedRowKeys: []
        });
    },

    hideSaveTooltip: function() {
        let type = this.props.isAddMember ? 'add' : 'edit';
        let saveResult = this.state.saveMemberListResult;
        let saveObj = this.state.saveMemberListObj;
        MemberListEditAction.clearSaveFlags(type, saveResult, saveObj);
    },

    //渲染'设为xx'按钮
    renderEditBtns() {
        //成员列表已选择成员的个数
        let selectSizeObj = this.getSelectSize();
        //负责人按钮样式设置
        let addOwnerBtnCls = classNames('add-member-btn', {
            //只选一个非负责人成员时，加为负责任按钮点击事件可用
            'member-btn-enable': selectSizeObj.selectedSize === 1 && !selectSizeObj.selectedOwnerSize
        });

        let isShowSettingOwnerBtn = selectSizeObj.selectedSize === 1 && !selectSizeObj.selectedOwnerSize;

        let addManagerEnable = true;
        //不可同时选择了owner和user设为秘书，只能选一种角色中的人进行转换
        if (selectSizeObj.selectedSize === 0
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedUserSize)
            || (selectSizeObj.selectedManagerSize === selectSizeObj.selectedSize)) {
            addManagerEnable = false;
        }
        // 秘书按钮样式设置
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
        //只能选一种角色的人进行移除
        if (selectSizeObj.selectedSize === 0
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedUserSize)
            || (selectSizeObj.selectedOwnerSize && selectSizeObj.selectedManagerSize)
            || (selectSizeObj.selectedManagerSize && selectSizeObj.selectedUserSize)) {
            delBtnEnable = false;
        }
        //移除按钮样式设置
        let delMemberBtnCls = classNames('add-member-btn', {
            'member-btn-enable': delBtnEnable
        });
        return (
            <div className="set-select-member-btns">
                {
                    isShowSettingOwnerBtn ? (
                        <div
                            id="set-owner-btn"
                            className={addOwnerBtnCls}
                            onClick={this.addOwner}
                            data-tracename="设为负责人"
                        >
                            {Intl.get('sales.team.add.owner', '设为负责人')}
                        </div>
                    ) : null
                }
                {
                    addManagerEnable ? (
                        <div
                            id="set-manager-btn"
                            className={addManagerBtnCls}
                            onClick={this.addManager}
                            data-tracename="设为秘书"
                        >
                            {Intl.get('sales.team.add.manager', '设为秘书')}
                        </div>
                    ) : null
                }
                {
                    addUserEnable ? (
                        <div
                            id="set-user-btn"
                            className={addUserBtnCls}
                            onClick={this.addUser}
                            data-tracename="设为成员"
                        >
                            {Intl.get('sales.team.add.to.member', '设为成员')}
                        </div>
                    ) : null
                }
                {
                    delBtnEnable ? (
                        <div
                            id="del-member-btn"
                            className={delMemberBtnCls}
                            onClick={this.delMember}
                            data-tracename="移除成员"
                        >
                            {Intl.get('sales.team.del.select.member', '移除')}
                        </div>
                    ) : null
                }
                <div
                    className="add-member-btn member-btn-enable"
                    onClick={(e) => {this.handleCancel(e);}}
                >
                    {Intl.get('common.cancel', '取消')}
                </div>
            </div>
        );
    },

    //渲染保存结果的提示
    renderSaveMsg() {
        let saveResult = this.state.saveMemberListResult;
        return saveResult ?
            (<div className="indicator">
                <AlertTimer
                    time={saveResult === 'error' ? 3000 : 600}
                    message={this.state.saveMemberListMsg}
                    type={saveResult}
                    showIcon
                    onHide={this.hideSaveTooltip}
                />
            </div>) : null;

    },

    renderAddBtns() {
        return (
            <div className="operation-add-member">
                <span className="operation-add"
                    onClick={(e) => this.handleOK(e)}>
                    {Intl.get('common.add', '添加')}
                </span>
                <span className="operation-cancel"
                    onClick={(e) => this.handleCancel(e)}>
                    {Intl.get('common.cancel', '取消')}
                </span>
            </div>
        );
    },

    renderMemberZoneData() {
        let memberListContainerH = this.state.memberListHeight - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        let addMemberList = this.getSearchAddMemberList();
        let flag = 'add';
        if (this.props.isAddMember) { // 显示添加成员的数据
            return (
                <div className="sales-team-member-add-container">
                    <div
                        className="sales-team-member-select-list sales-team-member-tier"
                        style={{height: memberListContainerH}}
                    >
                        {
                            this.props.addMemberListTipMsg ? (
                                <div className="member-list-tip">
                                    {this.props.addMemberListTipMsg}
                                </div>) : (
                                <div className="member-table-zone">
                                    {this.renderMemberList(flag, addMemberList)}
                                </div>
                            )
                        }
                    </div>
                </div>
            );
        } else if (this.props.isEditMember) {
            return (
                <div className="sales-team-member-edit-container">
                    <div
                        className="sales-team-member-select-list sales-team-member-tier"
                        style={{height: memberListContainerH}}
                    >
                        {
                            this.props.teamMemberListTipMsg ? (
                                <div className="member-list-tip">
                                    {this.props.teamMemberListTipMsg}
                                </div>
                            ) : (
                                <div className="member-table-zone">
                                    {this.renderMemberList()}
                                </div>
                            )
                        }

                    </div>
                </div>
            );
        } else {
            return (
                <div
                    className="sales-team-member-show-list sales-team-member-tier"
                    style={{height: memberListContainerH}}
                >
                    {
                        this.props.teamMemberListTipMsg ? (
                            <div className="member-list-tip">
                                {this.props.teamMemberListTipMsg}
                            </div>
                        ) : (
                            <div className="member-table-zone">
                                {this.renderMemberList()}
                            </div>
                        )
                    }

                </div>
            );
        }
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
    getSaveSalesGoals(type) {
        let curTeamObj = this.state.curShowTeamMemberObj;
        let salesGoals = this.state.salesGoals;
        let saveParams = {};
        if (type === SALES_GOALS_TYPE.TEAM) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.member-top-operation-div'), '保存团队销售目标');
            let curShowTeamMemberObj = this.state.curShowTeamMemberObj;
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
        let isTeamGoalNoChange = type === SALES_GOALS_TYPE.TEAM && this.state.salesGoals.goal === this.props.salesGoals.goal;
        //修改的个人目标并且数值未更改
        let isMemberGoalNoChange = type === SALES_GOALS_TYPE.MEMBER && this.state.salesGoals.member_goal === this.props.salesGoals.member_goal;
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

    // 关闭右侧面板
    closeRightPanel() {
        SalesTeamAction.closeRightPanel();
        MemberManageAction.hideContinueAddButton();
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
        // 开通营收中心并且有销售目标的权限
        if (!isOpenCash() || !hasPrivilege(MEMBER_MANAGE_PRIVILEGE.USER_MANAGE_ADD_SALES_GOAL)) {
            return;
        }
        let groupGoal = _.get(this.state.salesGoals, 'goal'); // 部门销售目标
        let memberGoal = this.state.salesGoals.member_goal; // 个人销售目标
        return (
            <div className="sales-team-goals-container" data-tracename="团队管理">
                <span className='group-sales-goals'>
                    {Intl.get('member.group.sales.goal', '部门销售目标')}:
                </span>
                {
                    this.state.isShowBatchChangeTeamGoal ? (
                        groupGoal ? (
                            <span className='sales-goal-value'>
                                {parseAmount(groupGoal)}
                                <i
                                    className='iconfont icon-update'
                                    onClick={this.toggleBatchChangeTeamGoalBtn.bind(this, false)}
                                ></i>
                            </span>
                        ) : (
                            <span
                                className='no-sale-goal-value'
                                onClick={this.toggleBatchChangeTeamGoalBtn.bind(this, false)}
                            >
                                {Intl.get('sales.team.add.sales.team', '添加')}
                            </span>
                        )
                    ) :
                        <div className="sales-goals-item">
                            <InputNumber
                                className="team-goals-input"
                                value={this.turnGoalToShowData(this.state.salesGoals.goal)}
                                onChange={this.changeTeamSalesGoals}
                            />
                            {
                                this.state.isSavingTeamGoal ?
                                    <Icon type="loading"/> :
                                    <span className="team-icon-container">
                                        <i className="iconfont icon-choose"
                                            onClick={this.saveSalesGoals.bind(this, SALES_GOALS_TYPE.TEAM)}
                                        ></i>
                                        <i className="iconfont icon-close"
                                            onClick={this.cancelSaveSalesGoals.bind(this, SALES_GOALS_TYPE.TEAM, true)}
                                        ></i>
                                    </span>
                            }
                            <span className="sales-goals-label">{Intl.get('contract.139', '万')}，</span>
                        </div>
                }
                <span className="self-sales-goal">
                    {Intl.get('member.sale.goal', '个人销售目标')}:
                </span>
                {
                    this.state.isShowBatchChangeSelfGoal ?
                        (
                            memberGoal ? (
                                <span className='self-sales-goal'>
                                    {parseAmount(memberGoal)}
                                    <i
                                        className='iconfont icon-update'
                                        onClick={this.toggleBatchChangeSelfGoalBtn.bind(this, false)}
                                    ></i>
                                </span>
                            ) : (
                                <span
                                    className='no-sale-goal-value'
                                    onClick={this.toggleBatchChangeSelfGoalBtn.bind(this, false)}
                                >
                                    {Intl.get('sales.team.add.sales.team', '添加')}
                                </span>
                            )
                        ) :
                        <div className="sales-goals-item">
                            <InputNumber
                                className="member-goals-input"
                                value={this.turnGoalToShowData(this.state.salesGoals.member_goal)}
                                onChange={this.changeMemberSalesGoals}
                            />
                            {
                                this.state.isSavingMemberGoal ?
                                    <Icon type="loading"/> :
                                    <span className="member-icon-container">
                                        <i className="iconfont icon-choose"
                                            onClick={this.saveSalesGoals.bind(this, SALES_GOALS_TYPE.MEMBER)}
                                        ></i>
                                        <i className="iconfont icon-close"
                                            onClick={this.cancelSaveSalesGoals.bind(this, SALES_GOALS_TYPE.MEMBER, true)}
                                        ></i>
                                    </span>
                            }
                            <span className="sales-goals-label">{Intl.get('contract.139', '万')}</span>
                        </div>
                }
            </div>);
    },

    // 修改成员字段成功的处理
    changeMemberFieldSuccess(member){
        //修改用户的昵称
        SalesTeamAction.updateCurShowTeamMemberObj(member);
    },
    // 修改成员状态
    updateMemberStatus(updateObj) {
        SalesTeamAction.updateCurShowTeamMemberObj(updateObj);
    },

    //修改成员详情中部门信息后的处理
    afterEditTeamSuccess(member) {
        SalesTeamAction.updateCurShowTeamMemberObj(member);
        //对左边数据重新进行获取
        SalesTeamAction.getTeamMemberCountList();
    },

    // 修改成员详情中职务信息后的处理
    afterEditPositionSuccess(member) {
        SalesTeamAction.updateCurShowTeamMemberObj(member);
    },

    render() {
        let salesTeamPersonnelWidth = this.props.salesTeamMemberWidth;
        let containerHeight = this.props.containerHeight;
        return (
            <div
                className="sales-team-personnel"
                style={{height: containerHeight, width: salesTeamPersonnelWidth}} data-tracename="团队列表"
            >
                <div className="member-top-operation-div">
                    <div className='pull-left'>
                        <PrivilegeChecker check={SALES_DEPARTMENT_PRIVILEGE.EDIT_DEPARTMENT} className="btn-item">
                            <Button
                                title={Intl.get('sales.team.add.team.member', '添加团队成员')}
                                data-tracename="添加团队成员"
                                onClick={this.addMember}
                            >
                                <Icon type="plus" />{Intl.get('common.add.member', '添加成员')}
                            </Button>
                        </PrivilegeChecker>
                    </div>
                    {
                        this.props.isAddMember ? (
                            <div className='pull-right sales-team-member-add-container'>
                                <div className="search-input-block btn-item sales-team-member-search-input-div">
                                    <SearchInput
                                        searchPlaceHolder={Intl.get('member.add.member.search.placeholder', '账号/昵称')}
                                        searchEvent={this.searchMember}/>
                                </div>
                            </div>
                        ) : null
                    }
                </div>
                <div className="member-list-div"
                    style={{height: this.state.memberListHeight - 80}}>
                    {
                        this.props.isLoadingTeamMember ? (
                            <Spinner className="isloading"/>
                        ) : this.renderMemberZoneData()
                    }
                </div>
                {
                    this.state.isMemberListSaving ? (
                        <div className="member-list-edit-block">
                            <Spinner className="isloading"/>
                        </div>
                    ) : this.renderSaveMsg()
                }
                {this.props.rightPanelShow ? (
                    <MemberInfo
                        memberInfo={this.state.currentMember}
                        closeRightPanel={this.closeRightPanel}
                        changeMemberFieldSuccess={this.changeMemberFieldSuccess}
                        updateMemberStatus={this.updateMemberStatus}
                        afterEditTeamSuccess={this.afterEditTeamSuccess}
                        afterEditPositionSuccess={this.afterEditPositionSuccess}
                        isGetMemberDetailLoading={this.state.isGetMemberDetailLoading}
                        roleList={this.props.roleList}
                    />) : null}
            </div>
        );
    },
});
module.exports = MemberList;
