var path = require('path');
var restLogger = require('../../../../lib/utils/logger').getLogger('nock');
var RestUtil = require('ant-auth-request').restUtil(restLogger)(restLogger);
var nock = require('nock');
var nockParser = require(path.resolve(portal_root_path , './lib/utils/nockParser'));
var moment = require('moment');


var provinces = [
    '北京',
    '天津',
    '上海',
    '重庆',
    '河北',
    '河南',
    '云南',
    '辽宁',
    '黑龙江',
    '湖南',
    '安徽',
    '山东',
    '新疆',
    '江苏',
    '浙江',
    '江西',
    '湖北',
    '广西',
    '甘肃',
    '山西',
    '内蒙古',
    '陕西',
    '吉林',
    '福建',
    '贵州',
    '广东',
    '青海',
    '西藏',
    '四川',
    '宁夏',
    '海南',
    '台湾',
    '香港',
    '澳门'
];

//返回[开头、结束]的数字
function random(start , end) {
    var between = end - start + 1;
    return Math.floor(Math.random() * between + start);
}

//生成数据
function generateData() {
    var list = [];
    var province = provinces.slice();
    for(var i = 0; i < 10; i++) {
        var idx = random(0 , province.length - 1);
        list.push({
            name: province.splice(idx , 1)[0],
            value: random(1 , 100)
        });
    }
    return list;
}

var idx = 0;

var RealmZoneService = require('../service/realm-zone-service');

//nock数据设置
exports.init = function() {
    //获取安全域地域信息
    nock(config.nockUrl)
        .persist()
        .get(RealmZoneService.urls.getRealmZone)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            idx++;
            var req = new nockParser().setUrlParam('/oplate/v1/analysis/:realmId').setRequest(this.req).setBody(requestBody).parse();
            //获取开始、结束时间
            var startTime = req.query.starttime;
            var mStartTime = moment(startTime , oplateConsts.DATE_FORMAT);
            var mNow = moment();
            setTimeout(function() {
                if(idx % 6 === 0) {
                    cb(null , [
                        200, [],{'norealm': true}
                    ]);
                }
                //如果时间是大于当前时间的，返回没有数据
                if(startTime && mStartTime.isAfter(mNow)) {
                    cb(null,[200,[]]);
                } else {
                    cb(null,[200,generateData()]);
                }
            } , 200);
        });
};