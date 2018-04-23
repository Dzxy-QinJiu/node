class Realm {
    constructor(opts) {
        this.realmId = opts.realm_id;
        //安全域名称
        this.realmName = opts.realm_domain || "";
        //安全域所属组织的域名
        this.company = opts.realm_name || "";
        //安全域的LOGO
        this.realmLogo = opts.realm_logo || "";
        //安全域的所有者
        this.owner = opts.owner || "";
        //电话
        this.phone = opts.phone || "";
        //邮箱
        this.email = opts.email || "";
        //所在省份
        this.province = opts.province || "";
        //所在地级市
        this.city = opts.city || "";
        //所在区县
        this.county = opts.county || "";
        //详细地址
        this.address = opts.address || "";
        //行业
        this.profession = opts.profession || "";
        //安全域状态，1:正常 0:禁用 -1:已删除
        this.status = opts.status || 1;
        //备注
        this.comment = opts.comment || "";
    }

    //从后端对象 转成 前端所需realm
    static toFrontObject(restObject) {
        var frontObj = {};
        frontObj.id = restObject.realm_id;
        frontObj.realmName = restObject.realm_domain || "";
        frontObj.image = restObject.realm_logo || "";
        frontObj.status = restObject.status;
        frontObj.owner = restObject.owner;
        frontObj.phone = restObject.phone || "";
        frontObj.email = restObject.email;
        var address = [];
        if (restObject.province) {
            address.push(restObject.province);
        }
        if (restObject.city) {
            address.push(restObject.city);
        }
        if (restObject.county) {
            address.push(restObject.county);
        }
        frontObj.location = address.join("/");
        frontObj.detailAddress = restObject.address || "";
        frontObj.profession = restObject.profession || "";
        frontObj.comment = restObject.comment;
        frontObj.company = restObject.realm_name || "";
        // 邮箱设置
        frontObj.config = restObject.config || {};
        
        return frontObj;
    }

    //转成rest对象,并返回
    static   toRestObject(frontObj) {
        var restObject = {};
        restObject.realm_id = frontObj.id;
        if (frontObj.realmName) {
            restObject.realm_domain = frontObj.realmName;
        }
        if (frontObj.image) {
            restObject.realm_logo = frontObj.image;
        }
        if (frontObj.status || frontObj.status == 0) {
            restObject.status = frontObj.status;
        }
        if (frontObj.phone || frontObj.phone === "") {
            restObject.phone = frontObj.phone;
        }
        if (frontObj.email || frontObj.email === "") {
            restObject.email = frontObj.email;
        }
        var address = frontObj.location.split("/");
        restObject.province = address[0] || "";
        restObject.city = address[1] || "";
        restObject.county = address[2] || "";
        if (frontObj.detailAddress || frontObj.detailAddress === "") {
            restObject.address = frontObj.detailAddress;
        }
        if (frontObj.profession) {
            restObject.profession = frontObj.profession;
        }
        if (frontObj.comment || frontObj.comment === "") {
            restObject.comment = frontObj.comment;
        }
        if (frontObj.company) {
            restObject.realm_name = frontObj.company;
        }
        return restObject;
    }

    //停用、启用修改时，对象的转换
    static toRestStatusObject(frontObj) {
        var statusObj = {};
        statusObj.realm_id = frontObj.id;
        statusObj.status = frontObj.status;
        return statusObj;
    }

    //添加时，对象的转换
    static toAddObject(frontObj) {
        var addObj = {};
        addObj.realm = this.toRestObject(frontObj);
        addObj.user = {
            user_name: frontObj.userName,
            password: frontObj.password,
            nick_name: frontObj.ownerName,
            phone: frontObj.ownerPhone,
            email: frontObj.ownerEmail
        };
        return addObj;
    }

}
export  default Realm;