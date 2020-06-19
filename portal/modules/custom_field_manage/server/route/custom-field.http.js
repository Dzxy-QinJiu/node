/**
 * Created by hzl on 2020/5/15.
 */

module.exports = {
    module: 'custom_field_manage/server/action/custom-field-controller',
    routes: [
        { // 获取自定义参数配置
            method: 'get',
            path: '/rest/get/custom/field',
            handler: 'getCustomFieldConfig',
            passport: {
                needLogin: true
            }
        }, { // 添加自定义参数配置
            method: 'post',
            path: '/rest/add/custom/field',
            handler: 'addCustomFieldConfig',
            passport: {
                needLogin: true
            }
        }, { // 修改自定义参数配置
            method: 'put',
            path: '/rest/update/custom/field',
            handler: 'updateCustomFieldConfig',
            passport: {
                needLogin: true
            }
        }, { // 删除自定义参数配置
            method: 'delete',
            path: '/rest/delete/custom/field/:id',
            handler: 'deleteCustomFieldConfig',
            passport: {
                needLogin: true
            }
        }, { // 添加一条自定义参数配置
            method: 'post',
            path: '/rest/add/item/custom/field/:id',
            handler: 'addItemCustomField',
            passport: {
                needLogin: true
            }
        }, { // 修改一条自定义参数配置
            method: 'put',
            path: '/rest/update/item/custom/field/:id',
            handler: 'updateItemCustomField',
            passport: {
                needLogin: true
            }
        }, { // 删除一条自定义参数配置
            method: 'delete',
            path: '/rest/delete/item/custom/field/:id/:key',
            handler: 'deleteItemCustomField',
            passport: {
                needLogin: true
            }
        }
    ]
};
