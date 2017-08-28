/**
 * Created by 肖金峰 on 2016/01/29.
 */
var Role = require("../dto/role");
var Authority = require("../dto/authority");
var nock = require('nock');
var uuid = require(require("path").join(portal_root_path, "lib/utils/uuid"));
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var roleManageServic = require("../service/role-manage-service");

var roleList = [
    new Role({
        id: uuid(),
        roleName: "oplateOwner",
        roleControl: "oplateOwner备注",
        authorityNames: ["789", "546"]
    }),
    new Role({
        id: uuid(),
        roleName: "oplateAdmin",
        roleControl: "oplateAdmin备注",
        authorityNames: ["124", "157", "744"]
    }),
    new Role({
        id: uuid(),
        roleName: "oplateAanlyst",
        roleControl: "oplateAanlyst备注",
        authorityNames: ["744", "157", "526"]
    }),
    new Role({
        id: uuid(),
        roleName: "oplateAanlyst1",
        roleControl: "oplateAanlyst1备注",
        authorityNames: ["744", "157", "526"]
    }),
    new Role({
        id: uuid(),
        roleName: "oplateAanlyst2",
        roleControl: "oplateAanlyst2备注",
        authorityNames: ["744", "157", "526"]
    }),
    new Role({
        id: uuid(),
        roleName: "oplateAanlyst3",
        roleControl: "oplateAanlyst3备注",
        authorityNames: ["124", "157", "744"]
    }),
    new Role({
        id: uuid(),
        roleName: "oplateAanlyst4",
        roleControl: "oplateAanlyst4备注",
        authorityNames: ["124", "157", "744"]
    })
];

var authorityList = [
    new Authority({
        id: uuid(),
        authorityID: "789",
        authorityName: "创建Realm",
        authorityDescribe: "创建Realm的相关描述",
        authorityRemarks: "创建Realm的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "546",
        authorityName: "停用Realm",
        authorityDescribe: "停用Realm的相关描述",
        authorityRemarks: "停用Realm的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "124",
        authorityName: "Realm列表",
        authorityDescribe: "Realm列表的相关描述",
        authorityRemarks: "Realm列表的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "157",
        authorityName: "增加用户",
        authorityDescribe: "增加用户的相关描述",
        authorityRemarks: "增加用户的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "1234",
        authorityName: "停用用户",
        authorityDescribe: "停用用户的相关描述",
        authorityRemarks: "停用用户的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "744",
        authorityName: "修改用户",
        authorityDescribe: "修改用户的相关描述",
        authorityRemarks: "修改用户的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "526",
        authorityName: "增加角色",
        authorityDescribe: "增加角色的相关描述",
        authorityRemarks: "增加角色的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "7541",
        authorityName: "删除角色",
        authorityDescribe: "删除角色的相关描述",
        authorityRemarks: "删除角色的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "8723",
        authorityName: "授权管理",
        authorityDescribe: "授权管理的相关描述",
        authorityRemarks: "授权管理的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "834",
        authorityName: "用户分析",
        authorityDescribe: "用户分析的相关描述",
        authorityRemarks: "用户分析的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "759",
        authorityName: "业务服务度量与控制",
        authorityDescribe: "业务服务度量与控制的相关描述",
        authorityRemarks: "业务服务度量与控制的相关备注"
    }),
    new Authority({
        id: uuid(),
        authorityID: "751",
        authorityName: "大数据管理",
        authorityDescribe: "的相关描述",
        authorityRemarks: ""
    }),
    new Authority({
        id: uuid(),
        authorityID: "756",
        authorityName: "分布式服务跟踪",
        authorityDescribe: "的相关描述",
        authorityRemarks: ""
    }),
    new Authority({
        id: uuid(),
        authorityID: "458",
        authorityName: "日志审计",
        authorityDescribe: "的相关描述",
        authorityRemarks: ""
    })
];

exports.init = function () {

    nock(config.nockUrl)
        .persist()
        .get(roleManageServic.urls.getRoleList)
        .query(true)
        .reply(function () {
            return [200, {
                roleList: roleList,
                authorityList: authorityList
            }]
        });

    nock(config.nockUrl)
        .persist()
        .post(roleManageServic.urls.addRole)
        .query(true)
        .reply(function (url, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();

            var roleName = req.body.roleName;
            var roleControl = req.body.roleControl;
            var authorityNames = req.body.authorityNames.split(",");
            var newRole = new Role({
                id: uuid(),
                roleName: roleName,
                authorityNames: authorityNames,
                roleControl: roleControl
            });
            roleList.push(newRole);
            return [200, {
                id: newRole.id,
                roleName: newRole.roleName,
                authorityNames: newRole.authorityNames,
                roleControl: newRole.roleControl
            }];

        });

    nock(config.nockUrl)
        .persist()
        .put(roleManageServic.urls.editRole)
        .query(true)
        .reply(function (url, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();

            var id = req.body.id;
            var roleName = req.body.roleName;
            var roleControl = req.body.roleControl;
            var authorityNames = req.body.authorityNames.split(",");

            var target = roleList.find(function (item) {
                return item.id === id;
            });

            if (target) {
                target.roleName = roleName;
                target.authorityNames = authorityNames;
                target.roleControl = roleControl;
            }

            return [200, target];

        });

    nock(config.nockUrl)
        .persist()
        .delete(roleManageServic.urls.deleteRole)
        .query(true)
        .reply(function (url, requestBody) {
            var req = new nockParser().setUrlParam('/rest/deleteRole/:roleId').setRequest(this.req).setBody(requestBody).parse();

            var id = req.body.id, idx = -1;
            roleList.find(function (item, i) {
                if (item.id === id) {
                    idx = i;
                    return true;
                }
            });
            if (idx >= 0) {
                roleList.splice(idx, 1);
            }

            return [200, "ok"];
        });
};
