exports.postApplyTry = (apply_data, successCallback, errorCallback) => {
    $.ajax({
        url: '/rest/apply_try',
        dataType: 'json',
        type: 'post',
        data: {
            company: apply_data.company,
            user_scales: apply_data.user_scales,
            remark: apply_data.remark,
            version_kind: apply_data.version_kind
        },
        success: () => {
            successCallback();
        },
        error: () => {
            errorCallback();
        }
    });
};