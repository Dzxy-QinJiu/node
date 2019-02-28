/**
 * Created by hzl on 2019/2/28.
 */
import InviteMemberAction from '../action/invite-member-actions';

class InviteMemberStore {
    constructor() {
        this.userNameExist = false;//用户名是否已存在
        this.userNameError = false;//用户名唯一性验证出错
        this.emailExist = false;//邮箱是否已存在
        this.emailError = false;//邮件唯一性验证出错
        this.bindActions(InviteMemberAction);
    }
    // 邀请成员
    inviteMember(result) {
        console.log('inviteMember:',result);
    }
    // 用户名唯一性的验证
    checkOnlyUserName(result) {
        if (_.isString(result)) {
            //验证出错！
            this.userNameError = true;
        } else {
            //不存在该用户名！
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
}

export default alt.createStore(InviteMemberStore, 'InviteMemberStore');

