/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/5/25.
 */
var path = require('path');
var webpack = require('webpack');
//webpack config
module.exports = {
    entry: {
        vendor: [path.join(__dirname, "portal", "vendors.js")]
    },
    output: {
        path: path.join(__dirname, "dll"),
        filename: "dll.[name].js",
        library: "[name]"
    },
    module: {
        noParse: [/moment-with-locales/, /alt.min.js/, /jquery.min.js/, /underscore-min.js/, /History.min.js/]
    },
    resolve: {
         modules: [
            path.resolve(__dirname, "portal"),
            "node_modules"
        ],
        extensions: ['.js', '.jsx'],
        alias: {
            moment: 'moment/min/moment-with-locales.min.js',
            alt: 'alt/dist/alt.min.js',
            jquery: 'jquery/dist/jquery.min.js',
            underscore: 'underscore/underscore-min.js',
            history$: 'history/umd/History.min.js'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env' : {
                'NODE_ENV' : JSON.stringify("production")
            }
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/ , /zh\-cn/),
        new webpack.DllPlugin({
            path: path.join(__dirname, "dll", "[name]-manifest.json"),
            name: "[name]"
        }),
        new webpack.optimize.UglifyJsPlugin({
            test: /(\.jsx|\.js)$/,
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
             sourceMap : false
        })
    ]
};
