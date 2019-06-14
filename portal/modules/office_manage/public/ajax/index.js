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
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON || Intl.get('member.add.failed', '添加失败！'));
        }
    });
    return Deferred.promise();
};

// 设为默认角色
exports.setDefautRole = (id) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/default_role/' + id,
        type: 'put',
        dateType: 'json',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON || Intl.get('member.position.set.default.failed', '设置默认角色失败！'));
        }
    });
    return Deferred.promise();
};

// 编辑职务
exports.editPosition = (updateObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/edit/role',
        type: 'put',
        dateType: 'json',
        data: updateObj,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON || Intl.get('common.edit.failed', '修改失败！'));
        }
    });

    return Deferred.promise();
};

// 删除职务
exports.deletePosition = (id) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/role/' + id,
        type: 'delete',
        dateType: 'json',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON || Intl.get('crm.139', '删除失败！'));
        }
    });
    return Deferred.promise();
};
