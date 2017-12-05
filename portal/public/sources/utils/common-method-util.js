/**
 * 不同模块调用的公共方法
 * Created by wangliping on 2017/5/25.
 */
//获取递归遍历计算树形团队内的成员个数
exports.getTeamMemberCount = function (salesTeam) {
    let teamMemberCount = 0;

    let memberArray = [];
    if (salesTeam.ownerId) {
        memberArray.push(salesTeam.ownerId);
    }
    if (_.isArray(salesTeam.managerIds) && salesTeam.managerIds.length > 0) {
        memberArray = memberArray.concat(salesTeam.managerIds);
    }
    if (_.isArray(salesTeam.userIds) && salesTeam.userIds.length > 0) {
        memberArray = memberArray.concat(salesTeam.userIds);
    }
    memberArray = _.uniq(memberArray);//去重
    teamMemberCount = memberArray.length;
    //递归遍历子团队，加上子团队的人数
    if (_.isArray(salesTeam.children) && salesTeam.children.length > 0) {
        salesTeam.children.forEach(team=> {
            teamMemberCount += this.getTeamMemberCount(team);
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
exports.urlConifg = function(itemLocal,itemRecord){
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
    return {"local":local,"audioType":audioType}
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