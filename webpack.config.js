/*2种模式
 dev模式          node app
 开发模式：
 1.代码热加载
 2.css会按需加载，变成style插入到head中
 3.css可以调试，有sourcemap

 production模式  node app production
 线上模式：
 1.无代码热加载
 2.css会按需加载，变成style插入到head中
 3.无css的sourcemap
 注意：这个需要先webpack -p打包，再 node app production,打包后的文件会生成到dist目录下
 */

var path = require('path');
var webpack = require('webpack');
var config = require('./conf/config');
var fs = require('fs');
var autoprefixer = require("autoprefixer");
var HappyPack = require("happypack");
var WebpackParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
//打包模式
var webpackMode = config.webpackMode || 'dev';


//线上环境清除之前生成的文件
if (webpackMode === 'production') {
    require('shelljs/global');
    rm('-rf', 'dist');
}
//webpack entry入口
var entry = function () {
    var entryMap = {
        app: ['./portal/public/index'],
        login: ['./portal/public/login']
    };
    //开发模式下并且带test参数时打包测试文件
    if (webpackMode !== 'production' && process.argv.indexOf('test') !== -1) {
        entryMap.test = 'mocha!./test-entry.js';
    }
    return entryMap;
};

var jsLoader = {
    id: 'js',
    loaders: webpackMode !== 'production' ? ['react-hot', 'babel?compact=true&cacheDirectory'] : ['babel?compact=true&cacheDirectory']
};

var cssLoader = {
    id: 'css',
    loaders: ['style', 'css', 'postcss']
};

var lessLoader = {
    id: 'less',
    loaders: ['style', 'css', 'postcss', 'less']
};

var loadersLists = [
    {
        test: /(\.js|\.jsx)$/,
        use: [
            {loader: "happypack/loader?id=js"}
        ],
        include: [
            path.join(__dirname, "portal")
        ]
    },
    {
        test: /\.(png|jpg)$/,
        use: [
            {loader: "url?limit=8192"}
        ],
        include: [
            path.resolve(__dirname, "portal")
        ]
    },
    /* bootstrap-webpack config start */
    {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: "url?limit=10000&mimetype=application/font-woff"}
        ],
        include: [
            path.resolve(__dirname, "portal"),
            path.resolve(__dirname, "node_modules/bootstrap")
        ]
    },
    {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: "url?limit=10000&mimetype=application/octet-stream"}
        ],
        include: [
            path.resolve(__dirname, "portal"),
            path.resolve(__dirname, "node_modules/bootstrap")
        ]
    },
    {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: "file"}
        ],
        include: [
            path.resolve(__dirname, "portal"),
            path.resolve(__dirname, "node_modules/bootstrap")
        ]
    },
    {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: "url?limit=10000&mimetype=image/svg+xml"}
        ],
        include: [
            path.resolve(__dirname, "portal"),
            path.resolve(__dirname, "node_modules/bootstrap")
        ]
    },
    /* bootstrap-webpack config end */
    /*css,less*/
    {
        test: /\.css?$/,
        use: [
            {loader: "happypack/loader?id=css"}
        ],
        include: [
            path.resolve(__dirname, "portal"),
            path.resolve(__dirname, "node_modules/bootstrap"),
            path.resolve(__dirname, "node_modules/antd"),
            path.resolve(__dirname, "node_modules/rc-calendar"),
            path.resolve(__dirname, "node_modules/react-date-picker"),
            path.resolve(__dirname, "node_modules/antc"),
            path.resolve(__dirname, "node_modules/fullcalendar")
        ]
    }, {
        test: /\.less$/,
        use: [
            {loader: "happypack/loader?id=less"}
        ],
        include: [
            path.resolve(__dirname, "portal"),
            path.resolve(__dirname, "node_modules/antc")
        ]
    },
    {
