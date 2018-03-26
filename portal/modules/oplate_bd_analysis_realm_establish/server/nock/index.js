var path = require("path")
var restLogger = require("../../../../lib/utils/logger").getLogger('nock');
var RestUtil = require("ant-auth-request").restUtil(restLogger)(restLogger);
var nock = require("nock");
var nockParser = require(path.resolve(portal_root_path , "./lib/utils/nockParser"));
var moment = require("moment");

//生成数据
function generateData() {
    var d = [];
    var len = 0;
    var now = new Date();
    var value;
    while (len++ < 200) {
        d.push({
            name : new Date(2014, 9, 1, 0, len * 10000).getTime(),
            value : (Math.random()*30).toFixed(2) - 0
        });
    }
    return d;
}

var idx = 0;

var RealmEstablishService = require("../service/realm-establish-service");

//nock数据设置
exports.init = function() {
    //获取安全域地域信息
    nock(config.nockUrl)
        .persist()
        .get(RealmEstablishService.urls.getRealmEstablish)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            idx ++;
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
            //获取开始、结束时间
            var startTime = req.query.starttime;
            var mStartTime = moment(startTime , oplateConsts.DATE_FORMAT);
            var mNow = moment();
            setTimeout(function() {
                if(idx % 6 === 0) {
                    cb(null , [
                        200, [],{'norealm':true}
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