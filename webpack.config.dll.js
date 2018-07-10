/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/5/25.
 */
var path = require('path');
var webpack = require('webpack');

var config = require('./conf/config');
var webpackMode = config.webpackMode || 'dev';

var pluginLists = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh\-cn/),
    new webpack.DllPlugin({
        path: path.join(__dirname, "dll", "[name]-manifest.json"),
        name: "[name]"
    }),
];

if (webpackMode === 'production') {
    pluginLists.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify("production")
        }
    }));
    pluginLists.push(new UglifyJSPlugin({
            test: /(\.jsx|\.js)$/,
            parallel: true,
            sourceMap: false,
            uglifyOptions: {
                ecma: 6,
                output: {
                    comments: false,
                },
                warnings: false
            }
        }));
}

//webpack config
module.exports = {
    mode: webpackMode === 'production' ? 'production' : 'development',
    entry: {
        reactRel: ['react', 'react-dom', 'react-intl', 'antd',
            'intl-messageformat', 'react-router', 'bootstrap',
            'react-bootstrap'],
        vendor: [path.join(__dirname, "portal", "vendors.js")]
    },
    output: {
        path: path.join(__dirname, "dll"),
        filename: "dll.[name].js",
        library: "[name]"
    },
    module: {
        noParse: [/moment-with-locales/, /alt.min.js/, /jquery.min.js/, /History.min.js/]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "portal"),
            "node_modules"
        ],
        extensions: ['.js', '.jsx'],
        alias: {
            moment$: 'moment/min/moment-with-locales.min.js',
            alt: 'alt/dist/alt.min.js',
            jquery: 'jquery/dist/jquery.min.js',
            history$: 'history/umd/History.min.js'
        }
    },
    plugins: pluginLists,
};
