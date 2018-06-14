var ShareObj = require('../util/app-id-share-util');

exports.handleSelectAppId = (userOwnAppList) => {
    // 上一个用户选择应用id
    let lastSelectAppId = ShareObj.share_differ_user_keep_app_id;
    let selectAppId = '';
    if (_.isArray(userOwnAppList) && userOwnAppList.length) {
        if (lastSelectAppId) {
            let index = _.indexOf(_.map(userOwnAppList, 'app_id'),lastSelectAppId);
            if (index > -1) {
                selectAppId = lastSelectAppId;
            } else {
                selectAppId = userOwnAppList[0].app_id;
            }
        } else {
            selectAppId = userOwnAppList[0].app_id;
        }
    }
    return selectAppId;
};
