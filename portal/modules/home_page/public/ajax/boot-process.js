/** Created by 2019-07-31 22:06 */
//获取推荐线索
let getRecommendClueListsAjax = null;
exports.getRecommendClueData = function(reqData) {
    var Deferred = $.Deferred();
    getRecommendClueListsAjax && getRecommendClueListsAjax.abort();
    getRecommendClueListsAjax = $.ajax({
        url: '/rest/global/guide/recommend/list',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};