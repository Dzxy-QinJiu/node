/**
 * Created by hzl on 2019/3/8.
 */

import InviteMemberAction from '../action/index';

class InviteMemberStore {
    constructor() {
        this.loading = false; // 邀请成功的loading
        this.inviteMemberMsg = ''; // 邀请失败的提示信息
        this.inviteResult = ''; // 邀请成员是否成功
        this.nameExist = false;// 姓名是否已存在
        this.nameError = false;// 姓名唯一性验证出错
        this.userNameExist = false;// 用户名是否已存在
        this.userNameError = false;// 用户名唯一性验证出错
        this.emailExist = false;// 邮箱是否已存在
        this.emailError = false;// 邮件唯一性验证出错
        // 是否显示继续邀请成员的面板，默认false,邀请成功后3s后才显示继续邀请面板
        this.isShowContinueInvitePanel = false;

        this.bindActions(InviteMemberAction);
    }
    // 邀请成员
    inviteMember(result) {
        if (result.loading) {
            this.loading = result.loading;
        } else {
            this.loading = false;
            if (result.error) {
                this.inviteMemberMsg = result.errorMsg;
                this.inviteResult = 'error';
            } else {
                this.inviteMemberMsg = '';
                this.inviteResult = 'success';
            }
        }
    }
    //姓名唯一性的验证
    checkOnlyName(result) {
        if (_.isString(result)) {
            //验证出错！
            this.nameError = true;
        } else {
            //该昵称存不存在！
            this.nameExist = result;
        }
    }
    // 用户名唯一性的验证
    checkOnlyUserName(result) {
        if (_.isString(result)) {
            //验证出错！
            this.userNameError = true;
        } else {
            //该用户名存不存在！
            this.userNameExist = result;
        }
    }
    //邮箱唯一性的验证
    checkOnlyEmail(result) {
        if (_.isString(result)) {
            //验证出错！
            this.emailError = true;
        } else {
            //该邮箱存不存在！
            this.emailExist = result;
        }
    }
    // 重置姓名验证的标志
    resetNameFlags() {
        this.nameExist = false;
        this.nameError = false;
    }

    // 重置用户验证的标志
    resetUserNameFlags() {
        this.userNameExist = false;
        this.userNameError = false;
    }
    // 重置邮箱验证的标志
    resetEmailFlags() {
        this.emailExist = false;
        this.emailError = false;
    }
    // 显示邀请成员面板
    showInviteMemberPanel(flag) {
        this.inviteResult = '';
        this.isShowContinueInvitePanel = flag;
    }
}

export default alt.createStore(InviteMemberStore, 'InviteMemberStore');