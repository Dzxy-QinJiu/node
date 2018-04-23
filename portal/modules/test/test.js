/**
 * Created by liwenjun on 2015/12/30.
 */
var nock = require('nock');

function start() {

    nock('http://test.com')
        .persist()
        .get('/users/1')
        .reply(401, {
            _id: '123ABC',
            _rev: '946B7D1C',
            username: 'pgte',
            email: 'pedro.teixeira@gmail.com'
        });

    nock('http://172.19.100.17:80')
        .persist()
        .post('/token/access_token')
        //.reply(400 , {
        //    error_code:11013
        //})
        .reply(200, {token: "access_token"});

    var authRestIndex = 0;

    nock('http://localhost:9192')
        .persist()
        .get('/dev/test1')
        .reply(function () {
            authRestIndex++;
            if (authRestIndex % 2 === 1) {
                console.log("authRestIndex=" + authRestIndex + ",code=400");
                return [400, {
                    error_code: 11012
                }];
            } else {
                console.log("authRestIndex=" + authRestIndex + ",code=200");
                return [200, {
                    data: 'testData'
                }];
            }
        });

    nock('http://172.19.100.17:80')
        .persist()
        .get('/dev/test2')
        .socketDelay(10000)
        .reply(function (uri, requestBody, cb) {
            setTimeout(function () {
                cb(null, [200, 'THIS IS THE REPLY BODY']);
            }, 10);
        });
    nock('http://172.19.100.17:80')
        .persist()
        .post('/rest/user', {
            name: "zhangsan",
            password:"aaa"
        }).reply(200, {name: "name must be lisi", pw: "password must start with a"});
}

start();