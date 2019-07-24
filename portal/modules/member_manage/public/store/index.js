import MemberManageAction from '../action';
import MemberFormStore from './member-form-store';
import userData from 'PUB_DIR/sources/user-data';
import {userInfoEmitter} from 'PUB_DIR/sources/utils/emitters';

let emptyMember = {
    id: '',
    name: '',
    userName: '',
    image: '',
    password: '',
    rePassword: '',
    phone: '',
    email: '',
    role: [],
    phoneOrder: ''
};

class MemberManageStore {
    constructor() {
        this.pageSize = 20;
        this.searchContent = ''; // 搜索框查询内容
        this.selectRole = ''; // 已选过滤角色,默认全部
        this.status = '1'; // 成员状态，默认启用
        this.teamroleId = ''; // 职务id
        this.setInitialData();
        this.bindActions(MemberManageAction);
    }
    // 初始化数据
    setInitialData() {
        this.loading = false; // 获取成员列表的loading
        this.listenScrollBottom = false;
        this.sortId = '';
        this.memberList = [];
        this.memberTotal = 0; // 成员列表数
        this.getMemberListErrMsg = ''; // 获取成员列表失败的信息
        this.currentMember = emptyMember; // 编辑/添加 状态时，需要提交的域对象
        this.formType = 'add'; //表单的类型：添加/修改
        this.isShowMemberDetail = false; // 是否显示成员详情，默认false
        this.isShowMemberForm = false; // 是否显示成员表单，默认false
        this.isGetMemberDetailLoading = false; // 获取成员详情的loading
        this.getMemberDetailErrMsg = ''; //获取成员详情失败的错误提示
        this.isContinueAddButtonShow = false; // 是否显示继续添加按钮
        this.resultType = '';
        this.errorMsg = '';
    }
    // 获取成员列表
    getMemberList(result) {
        if (result.loading) {
            this.loading = result.loading;
        } else {
            this.loading = false;
            if (result.error) {
                this.getMemberListErrMsg = result.errMsg || Intl.get('errorcode.1', '获取成员列表失败');
            } else {
                this.getMemberListErrMsg = '';
                let list = _.get(result, 'resData.data', []);
                this.memberList = _.concat(this.memberList, list);
                this.memberTotal = _.get(result, 'resData.list_size', 0);
                let length = _.get(this.memberList, 'length', 0);
                this.listenScrollBottom = length < this.memberTotal ? true : false;
                this.sortId = length > 0 ? this.memberList[length - 1].id : '';
            }
        }
    }
    // 设置当前成员的loading
    setMemberLoading(flag) {
        this.isGetMemberDetailLoading = flag;
        if (flag) {
            this.getMemberDetailErrMsg = ''; // 重新获取详情时，清空之前的错误提示
        }
    }
    //点击成员查看详情时，先设置已有的详情信息
    setCurMember(memberId) {
        this.currentMember = _.find(this.memberList, item => item.id === memberId) || emptyMember;
    }
    //获取成员详情后，重新赋值详情信息
    getCurMemberById(result) {
        this.isGetMemberDetailLoading = false;
        this.getMemberDetailErrMsg = ''; //获取成员详情失败的错误提示
        this.resultType = '';
        this.errorMsg = '';
        if (_.isString(result)) {
            this.getMemberDetailErrMsg = result;
        } else {
            this.getMemberDetailErrMsg = '';
            this.currentMember = result;
            let curMember = _.find(this.memberList, item => item.id === result.id);
            if (curMember){
                curMember.roleIds = _.get(result, 'roleIds');
                curMember.roleNames = _.get(result, 'roleNames');
                curMember.teamName = _.get(result, 'teamName');
                curMember.teamId = _.get(result, 'teamId');
                curMember.phoneOrder = _.get(result, 'phoneOrder');
                //获取成员详情中没有创建时间，所以用列表中获取的创建时间
                result.createDate = _.get(curMember, 'createDate');
            }
            this.currentMember = result;
        }
    }
    // 显示成员详情
    showMemberInfoPanel() {
        this.isShowMemberDetail = true;
        this.isShowMemberForm = false;
    }
    // 设置选择的角色
    setSelectRole(role) {
        //搜索框和筛选角色不能联合查询
        this.selectRole = role;
        this.searchContent = '';
    }
    // 设置选择的状态
    setSelectStatus(status) {
        this.status = status;
    }
    // 显示成员表单
    showMemberForm(type) {
        if (type === 'add') {
            this.currentMember = emptyMember;
        }
        this.formType = type;
        this.isShowMemberDetail = false;
        this.isShowMemberForm = true;
    }
    // 关闭右侧面板
    closeRightPanel() {
        this.isShowMemberDetail = false;
        this.isShowMemberForm = false;
    }
    // 返回详细信息展示页
    returnInfoPanel(newMember) {
        this.memberList.unshift(newMember);
        this.memberTotal += 1;
        if (_.get(newMember, 'id')) {
            //添加完成员返回详情页的处理
            let rolesIds = _.get(newMember, 'roleIds');
            let length = _.get(rolesIds, 'length', 0);
            if (_.isArray(rolesIds) && length) {
                //角色的处理
                let roleList = _.get(MemberFormStore.getState(), 'roleList');
                let roleListLength = _.get(roleList, 'length');
                if (_.isArray(roleList) && roleListLength) {
                    let role = _.filter(roleList, role => rolesIds.indexOf(role.roleId) !== -1);
                    if (_.isArray(role) && role.length) {
                        newMember.roleNames = _.map(role, 'roleName');
                    }
                }
            }
            //获取团队名称
            let teamId = _.get(newMember, 'teamId');
            if (teamId) {
                let teamList = _.get(MemberFormStore.getState(), 'userTeamList');
                let teamListLength = _.get(teamList, 'length');
                let memberTeam = {};
                if (_.isArray(teamList) && teamListLength) {
                    memberTeam = _.find(teamList, team => team.group_id === teamId);
                }
                newMember.teamName = _.get(memberTeam, 'group_name', '');
            }
            if (newMember.emailEnable === 'false') {
                newMember.emailEnable = false;
            }
            this.currentMember = newMember;
        }
        this.isShowMemberDetail = true;
        this.isShowMemberForm = false;
    }
    // 编辑成员后的处理
    afterEditMember(modifiedMember) {
        if (_.isObject(modifiedMember)) {
            let memberList = this.memberList;
            let changeMember = _.find(memberList, item => item.id === modifiedMember.id);
            let status = _.get(modifiedMember, 'status'); // 成员启停状态
            let nick_name = _.get(modifiedMember, 'nick_name'); // 昵称
            let user_logo = _.get(modifiedMember, 'user_logo'); // 头像
            let phone = _.get(modifiedMember, 'phone'); // 手机
            let email = _.get(modifiedMember, 'email'); // 邮箱
            let teamName = _.get(modifiedMember, 'teamName'); // 部门
            let positionName = _.get(modifiedMember, 'positionName'); // 职务

            if (status) { // 修改成员状态
                changeMember.status = status;
            } else if (nick_name) { // 修改成员昵称
                changeMember.name = nick_name;
                //如果修改当前登录的用户时 修改完成后刷新左下角用户头像(没有头像的是通过昵称的第一个字来代替头像)
                userInfoEmitter.emit(userInfoEmitter.CHANGE_USER_LOGO, {
                    nickName: modifiedMember.name
                });
            } else if (user_logo) { // 修改头像
                changeMember.image = user_logo;
                if (userData.getUserData().user_id === modifiedMember.id) {
                    //如果修改当前登录的用户时 修改完成后刷新左下角用户头像
                    userInfoEmitter.emit(userInfoEmitter.CHANGE_USER_LOGO, {
                        userLogo: modifiedMember.user_logo
                    });
                }
            } else if (phone) { // 修改成员手机
                changeMember.phone = phone;
            } else if (email) { // 修改成员邮箱
                changeMember.email = email;
                changeMember.emailEnable = false; // 修改邮箱后，邮箱的激活状态改为未激活
            } else if (teamName) { // 修改成员部门
                changeMember.teamName = teamName;
                changeMember.teamId = _.get(modifiedMember, 'team');
            } else if (positionName) { // 修改成员职务
                changeMember.positionName = positionName;
                changeMember.positionId = _.get(modifiedMember, 'position');
            }
            this.currentMember = changeMember;
        }
    }
    // 修改成员状态
    updateMemberStatus(modifiedMember) {
        if (_.isObject(modifiedMember)) {
            this.resultType = '';
            this.errorMsg = '';
            _.find(this.memberList, (item) => {
                if (item.id === modifiedMember.id ) {
                    item.status = modifiedMember.status;
                }
            });
        } else {
            this.resultType = 'error';
            this.errorMsg = modifiedMember || Intl.get('common.edit.failed', '修改失败');
        }
    }
    // 更新列表中当前修改成员的状态
    updateCurrentMemberStatus(status) {
        if(this.currentMember){
            this.currentMember.status = status;
        }
    }
    // 处理搜索框的内容
    updateSearchContent(searchContent) {
        //搜索框和角色不能联合查询
        this.searchContent = searchContent;
        this.selectRole = '';
    }
    // 显示继续添加按钮
    showContinueAddButton() {
        this.isContinueAddButtonShow = true;
    }
    // 隐藏继续添加按钮
    hideContinueAddButton() {
        this.isContinueAddButtonShow = false;
    }
    // 修改成员部门(所属团队)
    updateMemberTeam(team) {
        if (this.currentMember) {
            this.currentMember.teamId = team.group_id;
            this.currentMember.teamName = team.group_name;
        }
    }
    // 修改成员职务
    updateMemberPosition(position) {
        if (this.currentMember) {
            this.currentMember.positionId = position.id;
            this.currentMember.positionName = position.name;
        }
    }
    // 修改成员角色
    updateMemberRoles(roleObj) {
        if (this.currentMember) {
            this.currentMember.roleIds = roleObj.roleIds;
            this.currentMember.roleNames = roleObj.roleNames;
        }
    }
    // 设置职务id
    setPositionId(teamroleId) {
        this.teamroleId = teamroleId;
    }
}

export default alt.createStore(MemberManageStore, 'MemberManageStore');
