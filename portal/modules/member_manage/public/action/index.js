import MemberManageAjax from '../ajax';

class MemberManageAction {
    constructor() {
        this.generateActions(
            'setInitialData', // 初始化数据
            'setSelectRole', // 设置成员角色
            'setSelectStatus', // 设置成员状态
            'showMemberForm', // 显示成员表单
            'closeRightPanel', // 关闭右侧面板
            'returnInfoPanel', // 返回详细信息展示页
            'afterEditMember', // 编辑成员后的处理
            'updateMemberStatus', // 更新详情中成员的启停用状态
            'updateCurrentMemberStatus', // 更新列表中当前修改成员的状态
            'setCurMember', // 设置当前的成员
            'setMemberLoading', // 设置当前成员的loading
            'showMemberInfoPanel', // 显示成员详情面板
            'updateSearchContent', // 处理搜索框的内容
            'showContinueAddButton', // 显示继续添加按钮
            'hideContinueAddButton', // 隐藏继续添加按钮
            'addUser',
            'editUser',
            'getLogList',
            'closeAddPanel',
            'updateUserTeam',
            'updateUserRoles',
        );
    }

    // 获取成员列表
    getMemberList(searchObj, cb) {
        this.dispatch({loading: true, error: false});
        MemberManageAjax.getMemberList(searchObj).then( (result) => {
            let memberTotal = _.get(result, 'list_size', 0);
            this.dispatch({loading: false, resData: result, error: false});
            cb(memberTotal);
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }

    // 获取成员详情
    getCurMemberById(memberId) {
        MemberManageAjax.getCurMemberById(memberId).then( (result) => {
            if (_.isObject(result)) {
                this.dispatch(result);
            } else {
                this.dispatch( Intl.get('member.get.detail.failed', '获取成员的详情失败!'));
            }
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('member.get.detail.failed', '获取成员的详情失败!'));
        } );
    }
    // 修改成员的启停用状态
    updateMemberStatus(member) {
        MemberManageAjax.updateMemberStatus(member).then( (data) => {
            if (data) {
                this.dispatch(member);
            } else {
                this.dispatch(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    }
}

export default alt.createActions(MemberManageAction);
