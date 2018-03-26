/**
 * 不同模块调用的公共方法
 * Created by wangliping on 2017/5/25.
 */
/**
 *获取递归遍历计算树形团队内的成员个数（与oplate中的计算组织成员个数的方法不同）
 * @param salesTeam: 计算成员个数的团队
 * @param teamMemberCount: 团队人数
 * @param teamMemberCountList: 所有团队成员人数统计列表[{team_id:xxx,available:{owner:xx,manager:xx,user:xx},total:xxx}]
 * @param filterManager: 是否过滤掉舆情秘书
 */
exports.getTeamMemberCount = function (salesTeam, teamMemberCount, teamMemberCountList, filterManager) {
    let curTeamId = salesTeam.group_id || salesTeam.key;//销售首页的是group_id，团队管理界面是key
    let teamMemberCountObj = _.find(teamMemberCountList, item => item.team_id == curTeamId);
    //该团队启用状态下的人数
    let availableObj = teamMemberCountObj && teamMemberCountObj.available ? teamMemberCountObj.available : {}
    if (availableObj.owner) {
        teamMemberCount += availableObj.owner;
    }
    //加上舆情秘书的个数统计（销售首页的团队人数统计中不计算舆情秘书）
    if(!filterManager && availableObj.manager){
        teamMemberCount += availableObj.manager;
    }
    if (availableObj.user) {
        teamMemberCount += availableObj.user;
    }
    //子团队，团队管理界面是child_group，销售首页是children
    let childGroup = salesTeam.child_groups || salesTeam.children;
    //递归遍历子团队，加上子团队的人数
    if (_.isArray(childGroup) && childGroup.length > 0) {
        childGroup.forEach(team => {
            teamMemberCount = this.getTeamMemberCount(team, teamMemberCount, teamMemberCountList, filterManager);
        });
    }
    return teamMemberCount;
};
//判断录音文件是否以.WAV结尾
exports.checkWav = function(str){
    var index = str.lastIndexOf('.WAV');
    if (index === -1){
        return false;
    }else{
        return index + 4 === str.length;
    }
};
//返回录音url的配置
exports.getAudioRecordUrl = function(itemLocal,itemRecord,phoneType){
    //播放长沙，济南和北京的录音
    var local = "changsha", audioType = "";
    if (itemLocal == "jinan"){
        local = "jinan";
    }else if (itemLocal == "beijing"){
        local = "beijing";
    }
    //是否是wav格式的文件
    if (this.checkWav(itemRecord)){
        audioType = "";
    }else{
        audioType = ".mp3";
    }
    local = local ? local + "/" : "";
    //如果是录音类型是app类型的
    if (phoneType === "app"){
        return "/record/app/" + itemRecord + audioType;
    }else{
        return "/record/" + local + itemRecord + audioType
    }
};
//去除json对象中的空白项
const removeEmptyItem = function (obj) {
    _.each(obj, (v, k) => {
        if (v === "") delete obj[k];
        if (_.isArray(v)) {
            _.each(v, (subv) => {
                if (subv === "") delete obj[k];
                else if (_.isObject(subv)) {
                    removeEmptyItem(subv);
                    if (Object.keys(subv).length === 0) delete obj[k];
                }
            });
        }
    });
};
exports.removeEmptyItem = removeEmptyItem;

// 根据权限，判断获取团队和成员时所传字段的值
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
exports.getParamByPrivilege = function(){
    let reqData = {};
    if (hasPrivilege("GET_TEAM_LIST_ALL") || hasPrivilege('GET_TEAM_MEMBERS_ALL')) {
        reqData.type = 'all';
    } else if (hasPrivilege("GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS") || hasPrivilege('GET_TEAM_MEMBERS_MYTEAM_WITH_SUBTEAMS')) {
        reqData.type = 'self';
    }
    return reqData;
}
//是否通过两项必填一项的验证
exports.validateRequiredOne = function (item1, item2) {
    item1 = $.trim(item1);
    item2 = $.trim(item2);
    if (item1 || item2) {
        //通过必填一项的验证
        return true;
    } else {//联系人姓名和部门都为空
       return false;
    }
}
