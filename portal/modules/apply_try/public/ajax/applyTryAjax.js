exports.postApplyTry = (apply_data, successCallback, errorCallback) => {
    $.ajax({
        url: '/rest/apply_try',
        dataType: 'json',
        type: 'post',
        data: apply_data,
        success: () => {
            successCallback();
        },
        error: () => {
            errorCallback();
        }
    });
};