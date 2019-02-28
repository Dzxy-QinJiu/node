/**
 * Created by hzl on 2019/2/28.
 */
import inviteMemberAjax from '../ajax/invite-member-ajax';

class InviteMemberAction {
    constructor() {
        this.generateActions(
            'resetUserNameFlags', // 重置用户验证的标志
            'resetEmailFlags' // 重置邮箱验证的标志
        );
    }

    // 邀请成员
    inviteMember(reqBody) {
        this.dispatch({loading: true, error: false});
        inviteMemberAjax.inviteMember(reqBody).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }

    // 用户名唯一性的验证
    checkOnlyUserName(queryObj) {
        inviteMemberAjax.checkOnlyUserName(queryObj).then( (result) => {
            this.dispatch(result);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        } );
    }

    // 邮箱唯一性的验证
    checkOnlyEmail(queryObj) {
        inviteMemberAjax.checkOnlyEmail(queryObj).then( (result) => {
            this.dispatch(result);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        } );
    }
}

export default alt.createActions(InviteMemberAction);
