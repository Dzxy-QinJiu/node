var ShareObj = require("../util/app-id-share-util");

exports.handleSelectAppId = (userOwnAppList) => {
    // 上一个用户选择应用id
    let lastSelectAppId = ShareObj.share_differ_user_keep_app_id;
    let index = _.indexOf(_.pluck(userOwnAppList, 'app_id'),lastSelectAppId);
    let selectAppId = "";
    if (index > -1) {
        selectAppId = lastSelectAppId;
    } else {
        selectAppId = userOwnAppList.length && userOwnAppList[0].app_id || '';
    }
    return selectAppId;
};
