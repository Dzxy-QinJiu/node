var path = require('path');
var restLogger = require('../../../../lib/utils/logger').getLogger('nock');
var RestUtil = require('ant-auth-request').restUtil(restLogger)(restLogger);
var nock = require('nock');
var nockParser = require(path.resolve(portal_root_path , './lib/utils/nockParser'));
var moment = require('moment');

//行业分类
var industrys = [
    '计算机',
    '贸易',
    '制药',
    '广告',
    '房地产',
    '专业服务',
    '服务业',
    '物流',
    '能源',
    '政府'
];

//返回[开头、结束]的数字
function random(start , end) {
    var between = end - start + 1;
    return Math.floor(Math.random() * between + start);
}

//生成数据
function generateData() {
    var list = [];
    var industry = industrys.slice();
    for(var i = 0; i < 10; i++) {
        var idx = random(0 , industry.length - 1);
        list.push({
            name: industry.splice(idx , 1)[0],
            value: random(1 , 100)
        });
    }
    return list;
}

var idx = 0;

var RealmIndustryService = require('../service/realm-industry-service');

//nock数据设置
exports.init = function() {
    //获取安全域地域信息
    nock(config.nockUrl)
        .persist()
        .get(RealmIndustryService.urls.getRealmIndustry)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            idx++;
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
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