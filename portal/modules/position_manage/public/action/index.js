import PositionAjax from '../ajax/index';

class PositionActions {
    constructor() {
        this.generateActions(
            'addPosition', // 添加座席号
            'editPosition', // 修改座席号
            'editLocation', // 修改地域
            'editBindMember', // 修改成员 
            'bindMember', // 绑定成员
            'setSort', // 排序
            'search', // 搜索
            'resetState' // 重置
        );
    }
    // 获取电话座席号列表
    getPhoneOrderList(reqParam) {
        this.dispatch({ loading: true ,error: false});
        PositionAjax.getPhoneOrderList(reqParam).then( (resData) => {
                this.dispatch({ loading: false, error: false, resData: resData});
            }, (errMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errMsg});
            }
        );
    }
    // 获取未绑定座席号的用户列表
    getUnbindMemberList(reqRealm) {
        PositionAjax.getUnbindMemberList(reqRealm).then( (resData) => {
                this.dispatch({ error: false, resData: resData});
            }, (errMsg) => {
                this.dispatch({ error: true, errMsg: errMsg});
            }
        );
    }
    
    getRealmList() {
        PositionAjax.getRealmList().then( (list) => {
            this.dispatch({error: false, list: list});
        },() => {
            this.dispatch({error: true});
        });
    }
}

export default alt.createActions(PositionActions);