/**
 * Created by liwenjun on 2015/12/25.
 */
var testLogger = require("../../lib/utils/logger").getLogger('test');
var restUtil = require("ant-auth-request").restUtil(testLogger);

var config = require('../../../conf/config');
var test = require('./test');
var RestTest = {
//获取baidu天气预报
    getData: function (req, res) {

        restUtil.authRest.get(
            {
                url: "http://apis.baidu.com/heweather/weather/free",
                req: req,
                res: res,
                headers: {
                    apikey: '0a6ad5351a437539b21152daa5aba5d2'
                }
            }, {
                city: "jinan"
            }).on("success", function (data) {
                //济南的天气情况
                var jinanCond = data['HeWeather data service 3.0'][0].daily_forecast[0].cond.txt_d;
                //济南风向
                var jinanWind = data['HeWeather data service 3.0'][0].daily_forecast[0].wind.dir + data['HeWeather data service 3.0'][0].daily_forecast[0].wind.spd + "级";
                //济南最低温
                var jinanMin = data['HeWeather data service 3.0'][0].daily_forecast[0].tmp.min;
                //济南最高温
                var jinanMax = data['HeWeather data service 3.0'][0].daily_forecast[0].tmp.max;
                res.json({
                    "jinanCond": jinanCond,
                    "jinanMin": jinanMin,
                    "jinanMax": jinanMax
                });
            }).on("error", function (data) {
                res.json({
                    "data": data
                });
            });
    },
    getToken: function (req, res) {
        restUtil.authRest.post(
            {
                url: "http://172.19.100.17:80/token/access_token",
                req: req,
                res: res
            }, null).on("success", function (data) {
                res.json(data);
            }).on("error", function (data) {
                res.json(data);
            });
    },
    test1: function (req, res) {
        restUtil.authRest.get(
            {
                url: "http://localhost:9192/dev/test1",
                req: req,
                res: res
            }).on("success", function (data) {
                console.log("/test/test1  sucess " + data ? data.message ? data.message : data : "null");
                res.status(200).json(data);
            }).on("error", function (data) {
                res.status(500).json(arguments);
            });
    },
    test2: function (req, res) {
        restUtil.authRest.get(
            {
                url: "dev/test2",
                req: req,
                res: res
            }).on("success", function (data) {
                res.status(200).json(data);
            }).on("error", function (data) {
                res.status(500).json(arguments);
            });
    },
    test3: function (req, res) {
        //使用getBasePath方法
        restUtil.authRest.post(
            {
                url: "/rest/user",
                req: req,
                res: res
            }, {
                name: "zhangsan",
                password: "aaa"
            }).on("success", function (data) {
                res.status(200).json(data);
            }).on("error", function (data) {
                res.status(500).json(data);
            });
    },
    downloadImg: function () {
        restUtil.baseRest.get(
            {
                url: "https://www.baidu.com/img/bd_logo1.png",
                req: req,
                res: res,
                "pipe-download-file": true
            }, null
        ).on("success", function (data) {
            //设置所下载文件的类型 Content-Type
            res.writeHead(200, {"Content-Type": "image/png"});
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    }
}

exports.getData = RestTest.getData;
exports.getToken = RestTest.getToken;
exports.test1 = RestTest.test1;
exports.test2 = RestTest.test2;
exports.test3 = RestTest.test3;
exports.downloadImg = RestTest.downloadImg;