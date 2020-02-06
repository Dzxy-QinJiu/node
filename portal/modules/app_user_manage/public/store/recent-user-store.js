const RecentUserAction = require('../action/recent-user-action');
import {altAsyncUtil} from 'ant-utils';
const {resultHandler} = altAsyncUtil;

class RecentUserStore {
    constructor() {
        // 成员数据
        this.memberList = {
            data: [],
            errorMsg: '',
            loading: false
        };
        this.bindActions(RecentUserAction);
    }
    getSaleMemberList = resultHandler('memberList', function({data, paramsObj}) {
        let memberList = [];
        if (_.isArray(data) && data.length) {
            _.each(data, (item) => {
                if (item.status) {
                    memberList.push({name: item.nick_name, id: item.user_id, user_name: item.user_name});
                }
            });
        }
        this.memberList.data = memberList;
    });

    getSelectedTeamSalesMembers = (data) => {
        let memberList = [];
        if (_.isArray(data) && data.length) {
            _.each(data, (item) => {
                if (item.status) {
                    memberList.push({name: item.nickName, id: item.userId, user_name: item.userName});
                }
            });
        }
        this.memberList.data = memberList;
    };
    
}

export default alt.createStore(RecentUserStore , 'RecentUserStore');