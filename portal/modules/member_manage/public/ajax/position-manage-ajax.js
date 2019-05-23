import {getSalesTeamRoleList} from 'MOD_DIR/common/public/ajax/role';

// 获取职务列表
exports.getPositionList = () => {
    let Deferred = $.Deferred();
    getSalesTeamRoleList().sendRequest().success((data) => {
        Deferred.resolve(data);
    }).error((xhr) => {
        Deferred.reject(xhr.responseJSON || Intl.get('user.log.login.fail', '获取职务列表失败！'));
    });
    return Deferred.promise();
};

// 添加职务
exports.addPosition = (reqBody) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/role',
        type: 'post',
        dateType: 'json',
        data: reqBody,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(xhr.responseJSON || Intl.get('member.add.failed', '添加失败！'));
        }
    });
    return Deferred.promise();
};