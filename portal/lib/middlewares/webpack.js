

module.exports = function(app) {

    if(config.production) {
        return;
    }

    var webpack = require("webpack");
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    var webpackConfig = require("../../../webpack.config");
    var compiler = webpack(webpackConfig);
    var devMiddleWare = webpackDevMiddleware(compiler , {
        publicPath : webpackConfig.output.publicPath
    });
    app.use(devMiddleWare);
    //dev模式的时候才加载hotMiddleWare
    var hotMiddleWare = webpackHotMiddleware(compiler);
    app.use(hotMiddleWare);
};
