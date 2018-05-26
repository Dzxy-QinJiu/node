/**
 * Created by xiaojinfeng on 2016/04/08.
 */

var SalesTeam = require("../dto/sales-team");
var SalesTeamPersonnel = require("../dto/sales-team-personnel");
var nock = require('nock');
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var SalesTeamManageService = require("../service/sales-team-manage-service");

var SalesTeamList = [
    new SalesTeam({
        id: "1",
        teamName: "北方销售团队"
    }),
    new SalesTeam({
        id: "2",
        teamName: "南方销售团队"
    })
];
var SalesTeamPersonnelList = [
    new SalesTeamPersonnel({
        id: "1",
        teamId: "1",
        personnelName: "张三",
        personnelLogo: ""
    }),
    new SalesTeamPersonnel({
        id: "2",
        teamId: "1",
        personnelName: "李四",
        personnelLogo: ""
    }), new SalesTeamPersonnel({
        id: "3",
        teamId: "1",
        personnelName: "王五",
        personnelLogo: ""
    }),
    new SalesTeamPersonnel({
        id: "4",
        teamId: "2",
        personnelName: "小六",
        personnelLogo: ""
    }), new SalesTeamPersonnel({
        id: "5",
        teamId: "2",
        personnelName: "熊大",
        personnelLogo: ""
    }),
    new SalesTeamPersonnel({
        id: "6",
        teamId: "2",
        personnelName: "熊二",
        personnelLogo: ""
    })
];

exports.init = function() {

    var memberList = [{
        "userId": "3722pgujaa37206ub2s4dPNRd6m84lPctk0frFi6tc8",
        "userName": "flyleong",
        "nickName": "Fly Leong",
        "password": "778373e6c3dd1201012c4e34b618eb64656b405c1ed06b6f5f1d4cbf2ebdfb74",
        "passwordSalt": "2kDovx5T44ubby50RK6QQpZH",
        "createDate": 1458792178596,
        "updateDate": null,
        "description": null,
        "email": "fly@fly.com",
        "phone": "15666772566",
        "wechatId": null,
        "wechatName": null,
        "status": 1,
        "userLogo": "",
        "realmId": "3722pgujaa",
        "userGrantInfos": [],
        "managedRealms": ["37206uma4m"],
        "managedClients": null
    }];
    var groupList = [
        {
            "client_id": "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB",
            "group_id": "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB370hkoej113ntOj8Pt4IFagI028XobzS2",
            "group_name": "文东会",
            "owner_id": "3722pgujaa371j4hgqa12kiBse1E4BRbsK0bNrs4a0E"
        },
        {
            "client_id": "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB",
            "group_id": "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB370hn4bge1uWR9u9Qu4M38Ye0yu1tn6ee",
            "group_name": "山口组",
            "owner_id": "3722pgujaa371j4hgqa12kiBse1E4BRbsK0bNrs4a0E",
            "sub_groups": [
                "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB370pfou0a0ppdbkear4taaJH1fWH2oq6R"
            ]
        },
        {
            "client_id": "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB",
            "group_id": "3722pgujaa3722cqj3c2aps5k6Wb57Uc1e0nPsXOSfB370pfou0a0ppdbkear4taaJH1fWH2oq6R",
            "group_name": "晓",
            "owner_id": "3722pgujaa371j4hgqa12kiBse1E4BRbsK0bNrs4a0E",
            "user_ids": [
                "3722pgujaa371j4hgqa12kiBse1E4BRbsK0bNrs4a0E"
            ]
        }
    ];


    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/group\/.*/i)
        .query(true)
        .reply(function(uri, requestBody, cb) {
            setTimeout(function() {
                if (/member/.test(uri)) {
                    cb(null, [
                        200, memberList, {}
                    ]);
                } else {
                    cb(null, [
                        200, groupList, {}
                    ]);
                }
            }, 100);
        });


    nock(config.nockUrl)
        .persist()
        .get(SalesTeamManageService.urls.getSalesTeamPersonnelList + "/1")
        .query(true)
        .reply(function(url, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();

            var teamId = req.body.teamId;
            teamId = "1";
            var personnelList = [];

            SalesTeamPersonnelList.map(function(personnel, index) {
                if (personnel.teamId == teamId) {
                    personnelList.push(personnel);
                }
            });

            return [200, {
                personnelList: personnelList
            }];

        });
};

