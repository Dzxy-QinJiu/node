/** Created by 2019-07-26 11:36 */
//获取我的引导
let getGuideConfigAjax = null;
exports.getGuideConfig = function() {
    var Deferred = $.Deferred();
    getGuideConfigAjax && getGuideConfigAjax.abort();
    getGuideConfigAjax = $.ajax({
        url: '/rest/global/guide/config',
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//设置引导步骤标注, step: "organaization"等
let setGuideMarkAjax = null;
exports.setGuideMark = function(reqData) {
    var Deferred = $.Deferred();
    setGuideMarkAjax && setGuideMarkAjax.abort();
    setGuideMarkAjax = $.ajax({
        url: '/rest/global/guide/mark/' + reqData.step,
        dataType: 'json',
        type: 'post',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 关闭引导标注
let closeGuideMarkAjax = null;
exports.closeGuideMark = function(reqData) {
    var Deferred = $.Deferred();
    closeGuideMarkAjax && closeGuideMarkAjax.abort();
    closeGuideMarkAjax = $.ajax({
        url: '/rest/global/guide/close/' + reqData.step,
        dataType: 'json',
        type: 'post',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 批量提取推荐的线索
let batchExtractRecommendCluesAjax = null;
exports.batchExtractRecommendClues = function(reqData) {
    var Deferred = $.Deferred();
    batchExtractRecommendCluesAjax && batchExtractRecommendCluesAjax.abort();
    batchExtractRecommendCluesAjax = $.ajax({
        url: '/rest/global/guide/batch/recommend/list',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};