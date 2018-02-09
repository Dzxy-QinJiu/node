var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var commonUtil = require("./portal/lib/utils/common-utils");

//代理服务器端口
var config = require('./webpack.config');
config.entry.app.unshift("webpack-dev-server/client?http://"+ commonUtil.ip.getServerIp() + ":8081");  // 将热替换js内联进去
config.entry.app.unshift("webpack/hot/only-dev-server");

//dev server 端口
var devServerPort = 8081;
//publicPath,本地启动配置sourceMap的时候，解析图片路径。不配置ip，图片会是404
var outPublicPath = 'http://' + commonUtil.ip.getServerIp() + ':' + devServerPort + '/resources/';
//修改publicPath，修改端口
config.output.publicPath=outPublicPath;
new WebpackDevServer(webpack(config), {
    publicPath: outPublicPath,
    hot: true,
    inline: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
}).listen(8081, function (err, result) {
    if (err) {
        return console.log(err);
    }
    console.log('Listening at http://localhost:8081/');
});