var path = require("path")
var RestUtil = require(path.resolve(portal_root_path , "./lib/rest/rest-util"));
var nock = require("nock");
var nockParser = require(path.resolve(portal_root_path , "./lib/utils/nockParser"));
var AppUserManageService = require("../service/app-user-manage.service");
var AppUserManageAction = require("../action/app_user_manage.action");
//销售人员列表
var SalesmanList = [
    {
        user_id : "test_userid_1",
        nick_name : "销售1"
    },
    {
        user_id : "test_userid_2",
        nick_name : "销售2"
    },
    {
        user_id : "test_userid_3",
        nick_name : "销售3"
    }
];
var UserListData = {"total":22,"data":[{"user":{"user_id":"3722pgujaa371e8qckp3IO1cN84B4SEbKE04fEWOYww","user_name":"132132","nick_name":"131"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371eauser3KnIBq64S5g7bWD0n9fvroce","user_name":"123","nick_name":"132"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371eb5m222s7AH0dVz4lMaVH0VZDCNCsu","user_name":"132","nick_name":"123"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371j3ke162BPXm7gt14qNbkZ0rCfuXqvk","user_name":"mindy","nick_name":"Mindy"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371j4hgqa12kiBse1E4BRbsK0bNrs4a0E","user_name":"fei","nick_name":"飞哥"},"sales":{"sales_name":"fei","sales_id":"3722pgujaa371j4hgqa12kiBse1E4BRbsK0bNrs4a0E"},"apps":[],"customer":{"customer_id":"3722pgujaa_2e74dbfd-92dc-4af5-96b5-e7a6e87c341d","customer_name":"asd"}},{"user":{"user_id":"3722pgujaa371lkcg800lWCwbdO15k69921fBkrfqW4","user_name":"371lmtsmsu","nick_name":"pengfei371lmtsmsu"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371lmtkjd3fJhWIdW94QhbMa0YOaezOcx","user_name":"zhengpengfeiclog","nick_name":"郑鹏飞云志"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371t8flc52BrMdk5BN50q9wn0uOHJGfwQ","user_name":"zhengpengfeieagleboy","nick_name":"郑鹏飞鹰仔"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371takj6n1rMvty1Ry4QG95g0Rf09uDdd","user_name":"zhengpengfei_eagleye","nick_name":"郑鹏飞鹰眼"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371vn0kp01yDnZo0Vw54499V0V5XWfERr","user_name":"lizonghai","nick_name":"李宗海"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX","user_name":"zhengpengfei","nick_name":"郑鹏飞"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa37206ub2s4dPNRd6m84lPctk0frFi6tc8","user_name":"flyleong","nick_name":"Fly Leong"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3721ss15d063xhSa7F4QhbAe10yzGEdAn","user_name":"xiaojinfeng","nick_name":"肖金峰"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3721ssq6o3GGA5f6dP4z2c5d0q2dR8nlG","user_name":"wangliping","nick_name":"王丽平"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3721std5t2OL5hN9Gq557bYt0dOtdDHrL","user_name":"zhoulianyi","nick_name":"周连毅"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3721suehg1rfKPS1gE4jzbgm0UXYTMSBn","user_name":"liangpengfei","nick_name":"梁鹏飞"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3721sv8u20qerzhbcb4Hpacx0Jj1BbAVU","user_name":"panfaguang","nick_name":"周连毅"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3721t98o51dDdgE95w4nV9EI1fzJTF2uX","user_name":"liwenjun","nick_name":"李文君"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3722615tl2iYNAC6yI5b7aKl0CApNKH1M","user_name":"antrol","nick_name":"oplate——admin用户"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3722746tq0mMElnaUW4Wicuo0qwqeeLTq","user_name":"qinlu","nick_name":"梁鹏飞——oplate的用户"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa372275p9e1Ncqblgn757b9bb0RXMAlz0l","user_name":"luojia","nick_name":"梁鹏飞——oplate的用户"},"sales":{},"apps":[],"customer":{}},{"user":{"user_id":"3722pgujaa3722b8kqj3LDz1d3qo562cbW0NiFs1Sxn","user_name":"kevin","nick_name":"梁鹏飞——oplate的用户"},"sales":{},"apps":[],"customer":{}}]};

//nock数据设置
exports.init = function() {
    //获取安全域地域信息
    nock(config.nockUrl)
        .persist()
        .post(AppUserManageService.urls.addUser)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, true, {}
                ]);
            } , 100);
        });
    //获取用户列表
    nock(config.nockUrl)
        .persist()
        .get(AppUserManageService.urls.getUsers)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, UserListData , {}
                ]);
            } , 1000);
        })

    //获取用户详情
    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/user\/.*\/detail/)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, [] , {}
                ]);
            } , 100);
        });

    //批量变更用户应用状态
    nock(config.nockUrl)
        .persist()
        .put(/\/rest\/oplate\/v1\/user\/.*\/app\/0/)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, true , {}
                ]);
            } , 100);
        });

    //添加应用
    nock(config.nockUrl)
        .persist()
        .put(AppUserManageService.urls.batchUpdate.replace(":field" , "grant_application"))
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                var list = [
                    {
                        "app_id": "1",
                        "app_name": "应用1",
                        "app_logo": "",
                        "account_type": 0,
                        "is_disabled": false,
                        "start_time": 1452480762324,
                        "end_time": 1452480762324,
                        "sales_opportunity": {
                            "sales_opportunity_id": "d6c3f9ec-e30a-45a2-afbe-655ac2f96961",
                            "sales_opportunity_name": "销售机会1"
                        }
                    }
                ];
                cb(null, [
                    200, list , {}
                ]);
            } , 100);
        });
    //修改密码
    nock(config.nockUrl)
        .persist()
        .put(AppUserManageService.urls.batchUpdate.replace(":field" , "change_password"))
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, true , {}
                ]);
            } , 100);
        });
    //开通类型
    nock(config.nockUrl)
        .persist()
        .put(AppUserManageService.urls.batchUpdate.replace(":field" , "grant_type"))
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, true , {}
                ]);
            } , 100);
        });
    //开通状态
    nock(config.nockUrl)
        .persist()
        .put(AppUserManageService.urls.batchUpdate.replace(":field" , "grant_status"))
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, true , {}
                ]);
            } , 100);
        });

    //开通周期
    nock(config.nockUrl)
        .persist()
        .put(AppUserManageService.urls.batchUpdate.replace(":field" , "grant_period"))
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, true , {}
                ]);
            } , 100);
        });

    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/message\/status\/.*/)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null , [
                    200 , {"result":[{"consumer":"","id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX_1460949499317","is_consumed":"false","message_id":"cb608736-6041-4079-a66e-da790383b694","produce_date":1460949498467,"producer":"3722pgujaa3721sv8u20qerzhbcb4Hpacx0Jj1BbAVU","status":"false","topic":"test"},{"consumer":"","id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX_1460949736082","is_consumed":"false","message_id":"1a05c301-eb9e-472b-9357-b7a7efe22cbb","produce_date":1460949735825,"producer":"name","status":"false","topic":"test"},{"consumer":"","id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX_1460960548620","is_consumed":"false","message_id":"d4bf3855-6c96-42aa-952d-093cdc5742d3","produce_date":1460960547956,"producer":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX","status":"false","topic":"试用用户申请"},{"consumer":"","id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX_1460960557368","is_consumed":"false","message_id":"43a8d1c4-0906-4ab5-89ad-6d6a60ddb489","produce_date":1460960557209,"producer":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX","status":"false","topic":"试用用户申请"},{"consumer":"","id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX_1460961079718","is_consumed":"false","message_id":"abd41cb3-11bf-43a0-8be6-a8497a01218b","produce_date":1460961079367,"producer":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX","status":"false","topic":"试用用户申请"},{"consumer":"","id":"3722pgujaa371vv7pr41rHgfb9o24ogbGM0Ju0eZxoX_1460966154338","is_consumed":"false","message_id":"19ccc68c-35ed-46d2-ba88-afb8fc008067","produce_date":1460966154003,"producer":"3722pgujaa3721sv8u20qerzhbcb4Hpacx0Jj1BbAVU","status":"false","topic":"test"}],"msg":"查询完成","total":6,"code":0},{}
                ]);
            } , 100);
        });

    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/message\/message\/.*/)
        .query(true)
        .reply(function() {
            setTimeout(function() {
                cb(null , [
                    200 , {"result":{"consumers":[{"email":"","name":"","nick_name":"","phone":"","role":"","user_id":"3722pgujaa36vsvmigo0l9cew3UV5bn9dB0dQHeomsQ"}],"message":{},"producer":{"role":"default","user_id":"3722pgujaa36vsvmigo0l9cew3UV5bn9dB0dQHeomsQ","user_name":"周连毅"},"topic":"申请试用用户","user_detail":{"account_type":0,"apps":[{"app_name":"云志","app_logo":"default","app_id":"36vt02ec1O36vsvdgo21h3hYffhq5aratF0AP8krQZo"}],"comment":"测试备注","create_time":1461304753825,"customer_name":"齐齐哈尔市检察院无科室","end_time":1461254400000,"sales_name":"周连毅","sales_opportunity_id":"83aa0417-3be9-43bf-9d9d-dd43f80e7205","sales_team_name":"","start_time":1429632000000,"type":"apply_user_trial","user_names":["jinantest"]}},"msg":"查询完成","code":0},{}
                ]);
            } , 100);
        });
};