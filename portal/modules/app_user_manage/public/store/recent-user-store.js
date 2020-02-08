const RecentUserAction = require('../action/recent-user-action');
import {altAsyncUtil} from 'ant-utils';
const {resultHandler} = altAsyncUtil;
import { selectedTeamTreeAllMember } from 'PUB_DIR/sources/utils/common-method-util';
class RecentUserStore {
    constructor() {
        this.allMemberList = []; // 所有团队下的成员
        // 成员数据
        this.memberList = {
            data: [],
            errorMsg: '',
            loading: false
        };
        this.bindActions(RecentUserAction);
    }
    getSaleMemberList = resultHandler('memberList', ({data, paramsObj}) => {
        let memberList = [];
        if (_.isArray(data) && data.length) {
            this.allMemberList = data;
            this.getMemberList(data);
        }
    });

    getMemberList(data){
        let memberList = [];
        _.each(data, (item) => {
            if (item.status) {
                memberList.push({name: item.nick_name, id: item.user_id, user_name: item.user_name});
            }
        });
        this.memberList.data = memberList;
    }

    getSelectedTeamSalesMembers = (selectedTeam) => {
        let memberList = _.clone(this.allMemberList); // 所有团队下的成员
        if (_.isEmpty(selectedTeam)) {
            this.getMemberList(memberList);
        } else {
            this.memberList.data = selectedTeamTreeAllMember(selectedTeam, memberList);
        }
    };
    
}

export default alt.createStore(RecentUserStore , 'RecentUserStore');