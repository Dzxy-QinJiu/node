/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/5/25.
 */
var path = require('path');
var webpack = require('webpack');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var config = require('./conf/config');
var webpackMode = config.webpackMode || 'dev';

var pluginLists = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh\-cn/),
    new webpack.DllPlugin({
        path: path.join(__dirname, 'dll', '[name]-manifest.json'),
        name: '[name]'
    }),
];

if (webpackMode === 'production') {
    pluginLists.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }));
} else {
    pluginLists.push(new BundleAnalyzerPlugin());
}

//webpack config
module.exports = {
    mode: webpackMode === 'production' ? 'production' : 'development',
    entry: {
        vendor: [
            'alt',
            'history',
            'immutable',
            'color',
            'jquery',
            'lodash',
            'moment',
            'noty',
            'socket.io-client',
            'es6-shim',
        ],
        reactRel: [
            'react-intl',
            'intl-messageformat',
            'react-router',
            'bootstrap',
            'react-bootstrap',
            'react-date-picker',
        ],
    },
    output: {
        path: path.join(__dirname, 'dll'),
        filename: 'dll.[name].js',
        library: '[name]'
    },
    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: ['.js', '.jsx'],
    },
    plugins: pluginLists,
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
    }
};
