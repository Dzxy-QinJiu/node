var Realm = require("../dto/realm").default;
var uuid = require('uuid/v4');
var userData = require("../../../user_manage/server/nock/data");

var realmList = [
    new Realm({
        realmId: uuid(),
        realmDomain: "www.eefung.oplate.com",
        realmName: "蚁坊",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@eefung.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.antrol.oplate.com",
        realmName: "蚁巡",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@antrol.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.civiw.oplate.com",
        realmName: "识微",
        realmLogo: "",
        phone: "400-829-9196",
        email: "info@civiw.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 0,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.antrol.oplate.com",
        realmName: "蚁巡",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@antrol.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.1688.oplate.com",
        realmName: "阿里巴巴",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@eefung.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.civiw.oplate.com",
        realmName: "识微",
        realmLogo: "",
        phone: "400-829-9196",
        email: "info@civiw.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.eefung.oplate.com",
        realmName: "蚁坊",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@eefung.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.1688.oplate.com",
        realmName: "阿里巴巴",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@eefung.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.baidu.oplate.com",
        realmName: "百度",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@eefung.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.eefung.oplate.com",
        realmName: "蚁坊",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@eefung.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.civiw.oplate.com",
        realmName: "识微",
        realmLogo: "",
        phone: "400-829-9196",
        email: "info@civiw.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    }),
    new Realm({
        realmId: uuid(),
        realmDomain: "www.antrol.com",
        realmName: "蚁巡",
        realmLogo: "",
        phone: "400-996-9796",
        email: "info@antrol.oplate.com",
        province: "湖南",
        city: "长沙",
        county: "岳麓区",
        address: "文轩路27号麓谷企业广场A4栋603室",
        profession: "计算机/互联网/通信/电子",
        startTime: "2015.12.13 15:18",
        endTime: "2015.12.24 15:18",
        status: 1,
        comment: ""
    })
];
//获取安全域列表所需数据
var getRealms = function (params) {
    if (!params.current_page && !params.page_size && !params.filter_content) {
        return realmList;
    } else {
        //当前页数
        var curPage = parseInt(params.current_page);
        //每页条数
        var pageSize = parseInt(params.page_size);
        var searchContent = params.filter_content;
        var scRealms = [];
        if (searchContent) {
            for (var c = 0, cLen = realmList.length; c < cLen; c++) {
                if (realmList[c].realmDomain.lastIndexOf(searchContent) != -1) {
                    //域名过滤
                    scRealms.push(realmList[c]);
                } else if (realmList[c].phone.lastIndexOf(searchContent) != -1) {
                    //电话过滤
                    scRealms.push(realmList[c]);
                } else if (realmList[c].realmName.lastIndexOf(searchContent) != -1) {
                    //名称鼓励
                    scRealms.push(realmList[c]);
                } else if (realmList[c].profession.lastIndexOf(searchContent) != -1) {
                    //行业过滤
                    scRealms.push(realmList[c]);
                }

            }
        } else {
            scRealms = realmList;
        }

        //当前要展示的第一个域在所有域中的索引
        var first = 0;
        if (curPage != 1) {
            first = (curPage - 1) * pageSize;
        }
        //当前要展示到哪个用户索引之前
        var end = first + pageSize;
        if (end > scRealms.length) {
            end = scRealms.length;
        }
        var curRealmList = [];
        for (var i = first; i < end; i++) {
            var realm = scRealms[i];
            if (realm) {
                curRealmList.push(realm);
            }
        }
        return {
            list_size: realmList.length,//所有安全域列表的长度
            data: curRealmList//当前页安全域列表的数据
        };
    }
};

var addRealm = function (addRealm) {
    var realm = new Realm(addRealm.realm);
    realm.realmId = uuid();
    realmList.push(realm);
    userData.addUser(addRealm.user);
    return realm;
};
var editRealm = function (realm) {
    var target = realmList.find(function (item) {
        return item.realmId === realm.realmId;
    });
    if (target) {
        if (realm.hasOwnProperty('status')) {
            target.status = realm.status;
        } else {
            target.realmDomain = realm.realmDomain;
            target.realmLogo = realm.realmLogo;
            target.realmName = realm.realmName;
            target.phone = realm.phone;
            target.email = realm.email;
            target.province = realm.province;
            target.city = realm.city;
            target.county = realm.county;
            target.address = realm.address;
            target.profession = realm.profession;
            target.comment = realm.comment;
        }
    }
    return target;
};

module.exports = {
    "realmList": realmList,
    "getRealms": getRealms,
    "addRealm": addRealm,
    "editRealm": editRealm
};