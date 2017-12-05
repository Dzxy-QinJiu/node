var User = require("../dto/user").User;
var uuid = require('uuid/v4');

var userList = [
    new User({
        userId: uuid(),
        userName: "333",
        nickName: "333",
        userLogo: "",
        //passwd: "333",
        //rePasswd:"333",
        phone: "400-996-9796",
        email: "huangsanwei@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "b2e3a691-d6fb-4e69-8d29-753fcd5f0249",
            "roleName": "oplateAdmin "
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "222",
        userName: "222",
        userLogo: "",
        //passwd: "222",
        //rePasswd: "222",
        phone: "400-996-9796",
        email: "zhangming@antrol.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: true,
        roles: [{
            "roleId": "b2e3a691-d6fb-4e69-8d29-753fcd5f0249",
            "roleName": "oplateAdmin "
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "111",
        userName: "111",
        userLogo: "",
        //passwd: "111",
        //rePasswd: "111",
        phone: "0731-83050659",
        email: "huangxingke@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "b2e3a691-d6fb-4e69-8d29-753fcd5f0249",
            "roleName": "oplateAdmin "
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "aaa",
        userName: "aaaaa",
        userLogo: "",
        //passwd: "aaaaa",
        //rePasswd: "aaaaa",
        phone: "15550029901",
        email: "aaa@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "b2e3a691-d6fb-4e69-8d29-753fcd5f0249",
            "roleName": "oplateAdmin "
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "bbb",
        userName: "bbbbb",
        userLogo: "",
        //passwd: "bbbbb",
        //rePasswd: "bbbbb",
        phone: "15550029902",
        email: "bbbbb@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "ccc",
        userName: "cccccc",
        userLogo: "",
        //passwd: "ccccc",
        //rePasswd: "ccccc",
        phone: "15550029903",
        email: "ccc@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "ddd",
        userName: "ddddd",
        userLogo: "",
        //passwd: "dddddddd",
        //rePasswd: "dddddddd",
        phone: "15550029904",
        email: "dddddd@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "eee",
        userName: "eee",
        userLogo: "",
        //passwd: "eeeee",
        //rePasswd: "eeeee",
        phone: "15550029905",
        email: "eeee@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "fff",
        userName: "fff",
        userLogo: "",
        //passwd: "ffffff",
        //rePasswd: "ffffff",
        phone: "15550029906",
        email: "fff@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: true,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "ggg",
        userName: "ggg",
        userLogo: "",
        //passwd: "ggg",
        //rePasswd: "ggg",
        phone: "15550029907",
        email: "ggg@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "hhh",
        userName: "hhh",
        userLogo: "",
        //passwd: "hhh",
        //rePasswd: "hhh",
        phone: "15550029908",
        email: "hhh@eefung.com",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    }),
    new User({
        userId: uuid(),
        nickName: "iii",
        userName: "iii",
        userLogo: "",
        //passwd: "iii",
        //rePasswd: "iii",
        phone: "15550029909",
        //startTime: "2015.12.13 15:18",
        //endTime: "2015.12.24 15:18",
        email: "iii@eefung.com",
        //isStop: false,
        roles: [{
            "roleId": "2fade248-77ce-4eab-94be-eafea26d5815",
            "roleName": "oplateAanlyst"
        }]
    })
];
var logList = [
    {
        id: 1,
        userId: 1,
        logInfo: "登录系统成功",
        logTime: "2015.12.13 15:18:01"
    }, {
        id: 2,
        userId: 2,
        logInfo: "成功修改用户资料",
        logTime: "2015.08.13 15:18:01"
    }, {
        id: 3,
        userId: 3,
        logInfo: "登录系统成功",
        logTime: "2015.06.13 15:18:01"
    }, {
        id: 4,
        userId: 4,
        logInfo: "登录系统成功",
        logTime: "2015.02.1 15:18:01"
    }, {
        id: 5,
        userId: 5,
        logInfo: "成功修改用户资料",
        logTime: "2015.01.13 15:22:01"
    }, {
        id: 6,
        userId: 6,
        logInfo: "登录系统成功",
        logTime: "2015.01.13 05:18:01"
    }, {
        id: 7,
        userId: 7,
        logInfo: "登录系统成功",
        logTime: "2015.01.13 01:18:01"
    }
];

var roles = [{
    roleId: "6da377fb-ac01-4789-8b17-08810a8b3a7e",
    roleName: "oplateOwner"
}, {
    roleId: "b2e3a691-d6fb-4e69-8d29-753fcd5f0249",
    roleName: "oplateAdmin"
}, {
    roleId: "2fade248-77ce-4eab-94be-eafea26d5815",
    roleName: "oplateAanlyst"
}];

//获取用户列表所需数据
var getUsers = function (params) {
    if (!params.current_page && !params.page_size && !params.filter_content) {
        return userList;
    } else {
        //当前页数
        var curPage = parseInt(params.current_page);
        //每页条数
        var pageSize = parseInt(params.page_size);
        var searchContent = params.filter_content;
        var scUsers = [];
        if (searchContent && userList.length > 0) {
            for (var c = 0, cLen = userList.length; c < cLen; c++) {
                if (userList[c].userName.lastIndexOf(searchContent) != -1) {
                    scUsers.push(userList[c]);
                } else if (userList[c].phone.lastIndexOf(searchContent) != -1) {
                    scUsers.push(userList[c]);
                } else if (userList[c].nickName.lastIndexOf(searchContent) != -1) {
                    scUsers.push(userList[c]);
                } else if (userList[c].email.lastIndexOf(searchContent) != -1) {
                    scUsers.push(userList[c]);
                }

            }
        } else {
            scUsers = userList;
        }
        //当前要展示的第一个域在所有域中的索引
        var first = 0;
        if (curPage != 1) {
            first = (curPage - 1) * pageSize;
        }
        //当前要展示到哪个用户索引之前
        var end = first + pageSize;
        if (end > scUsers.length) {
            end = scUsers.length;
        }
        var curUserList = [];
        for (var i = first; i < end; i++) {
            var user = scUsers[i];
            if (user) {
                curUserList.push(user);
            }
        }

        return {
            list_size: userList.length,//所有用户列表的长度
            data: curUserList//当前页用户列表的数据
        };
    }
};

var addUser = function (user) {
    user.userId = uuid();
    var roleId = user.roles[0] ? user.roles[0].roleId : '';
    for (var i = 0, len = roles.length; i < len; i++) {
        if (roles[i].roleId == roleId) {
            user.roles = [roles[i]];
            delete user.roleId;
            break;
        }
    }
    userList.push(user);
    return user;
};

var editUser = function (user) {
    var target = userList.find(function (item) {
        return item.userId === user.userId;
    });
    if (target) {
        target.userName = user.userName;
        target.nickName = user.nickName;
        target.userLogo = user.userLogo;
        if (target.password && target.password !== "密码") {
            target.password = user.password;
        }
        target.phone = user.phone;
        target.email = user.email;
        for (var i = 0, len = roles.length; i < len; i++) {
            if (roles[i].roleId == user.roleId) {
                target.roles = [roles[i]];
                break;
            }
        }
    }
    return target;
};

var getUserLog = function () {
    return logList;
};

var deleteUser = function (userId) {
    for (var j = 0, jLen = userList.length; j < jLen; j++) {
        if (userId == userList[j].userId) {
            userList.splice(j, 1);
            break;
        }
    }
};

var getRoles = function () {
    return {roles: roles};
};

module.exports = {
    "userList": userList,
    "getUsers": getUsers,
    "addUser": addUser,
    "editUser": editUser,
    "getUserLog": getUserLog,
    "deleteUser": deleteUser,
    "getRoles": getRoles
};