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
var HappyPack = require('happypack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var CleanWebpackPlugin = require('clean-webpack-plugin');

//打包模式
var webpackMode = config.webpackMode || 'dev';

//webpack entry入口
var entry = function () {
    var entryMap = {
        app: ['./portal/public/index'],
        login: ['./portal/public/login'],
        login_curtao: ['./portal/public/login-curtao'],
        register: ['./portal/public/register'],
        user_agreement: ['./portal/public/user-agreement'],
        privacy_policy: ['./portal/public/privacy-policy']
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
            {loader: 'happypack/loader?id=js'}
        ],
        include: [
            path.join(__dirname, 'portal'),
            path.join(__dirname, 'node_modules/component-util'),
            path.join(__dirname, 'node_modules/ant-chart-collection'),
            path.join(__dirname, 'node_modules/callcenter-sdk-client')
        ]
    },
    {
        test: /\.(png|jpg)$/,
        use: [
            {loader: 'url?limit=8192'}
        ],
        include: [
            path.resolve(__dirname, 'portal')
        ]
    },
    /* bootstrap-webpack config start */
    {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: 'url?limit=10000&mimetype=application/font-woff'}
        ],
        include: [
            path.resolve(__dirname, 'portal'),
            path.resolve(__dirname, 'node_modules/bootstrap')
        ]
    },
    {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: 'url?limit=10000&mimetype=application/octet-stream'}
        ],
        include: [
            path.resolve(__dirname, 'portal'),
            path.resolve(__dirname, 'node_modules/bootstrap')
        ]
    },
    {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: 'file'}
        ],
        include: [
            path.resolve(__dirname, 'portal'),
            path.resolve(__dirname, 'node_modules/bootstrap')
        ]
    },
    {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
            {loader: 'url?limit=10000&mimetype=image/svg+xml'}
        ],
        include: [
            path.resolve(__dirname, 'portal'),
            path.resolve(__dirname, 'node_modules/bootstrap')
        ]
    },
    /* bootstrap-webpack config end */
    /*css,less*/
    {
        test: /\.css?$/,
        use: 'happypack/loader?id=css',
        include: [
            path.resolve(__dirname, 'portal'),
            path.resolve(__dirname, 'node_modules/bootstrap'),
            path.resolve(__dirname, 'node_modules/antd'),
            path.resolve(__dirname, 'node_modules/rc-calendar'),
            path.resolve(__dirname, 'node_modules/react-date-picker'),
            path.resolve(__dirname, 'node_modules/antc'),
            path.resolve(__dirname, 'node_modules/react-big-calendar'),
            path.resolve(__dirname, 'node_modules/rc-slider'),
        ]
    },
    {
        test: /\.less$/,
        use: 'happypack/loader?id=less',
        include: [
            path.resolve(__dirname, 'portal'),
            path.resolve(__dirname, 'node_modules/antc')
        ]
    }
];
//webpack的plugins列表
var pluginLists = [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom',
        PropTypes: 'prop-types',
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        '_': 'lodash',
        moment: 'moment',
        ReactIntl: 'react-intl',
        Intl: [path.resolve(__dirname, 'portal/public/intl/intl.js'), 'default'],
        Trace: path.resolve(__dirname, 'portal/lib/trace'),
        oplateConsts: path.resolve(__dirname, 'portal/lib/consts.js'),
    }),
    new HappyPack(jsLoader),
    new HappyPack(cssLoader),
    new HappyPack(lessLoader),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh\-cn/),
    new CopyWebpackPlugin([
        {from: 'portal/public/sources/piwik.js'},
    ])
];

//DllReferencePlugin
function addDllPlugins() {
    var dllPluins = [
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/echarts-manifest.json')
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/world-manifest.json')
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/china-manifest.json')
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/province-manifest.json')
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/reactRel-manifest.json')
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: require('./dll/vendor-manifest.json')
        })];
    dllPluins.forEach(function (plugin) {
        pluginLists.push(plugin);
    });
}

//执行
addDllPlugins();

//热替换插件
if (webpackMode !== 'production') {
    pluginLists.push(new webpack.HotModuleReplacementPlugin());
    // pluginLists.push(new BundleAnalyzerPlugin({analyzerPort:8088}));
}
if (webpackMode === 'production') {
    pluginLists.push(new CleanWebpackPlugin(['dist']));
    pluginLists.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }));
}

var webpackConfig = {
    mode: webpackMode === 'production' ? 'production' : 'development',
    cache: true,
    entry: entry(),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
        //为了对JS路径进行加密
        chunkFilename: 'chunk.[name].[chunkhash].js',
        publicPath: '/resources/'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    filename: '[name].bundle.js',
                    name: 'common',
                    test: /(\.js|\.jsx)$/,
                    chunks: 'initial',
                    minChunks: 2
                }
            }
        }
    },
    plugins: pluginLists,
    module: {
        rules: loadersLists,
        noParse: [/moment-with-locales/, /alt.min.js/, /jquery.min.js/, /history.min.js/]
    },
    resolveLoader: {
        moduleExtensions: ['-loader']
    },
    resolve: {
        modules: [
            path.join(__dirname, 'portal'),
            'node_modules'
        ],
        //开发模式时使用符号链接所在位置而非其链接的目录的真实位置，方便本地模块调试
        //参考：https://doc.webpack-china.org/configuration/resolve/#resolve-symlinks
        symlinks: webpackMode === 'production',
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            //加$是为了避免require("moment/locale/xx")的时候报找不到模块的错误的问题
            //详见https://github.com/ant-design/ant-design/issues/4491
            moment$: 'moment/min/moment-with-locales.min.js',
            alt: 'alt/dist/alt.min.js',
            jquery: 'jquery/dist/jquery.min.js',
            history$: 'history/umd/history.min.js',
            OPLATE_EMITTER: path.resolve(__dirname, 'portal/public/sources/utils/emitters'),
            PUB_DIR: path.resolve(__dirname, 'portal/public'),
            LIB_DIR: path.resolve(__dirname, 'portal/lib'),
            CMP_DIR: path.resolve(__dirname, 'portal/components'),
            MOD_DIR: path.resolve(__dirname, 'portal/modules'),
        }
    }
};

if (webpackMode !== 'production') {
    webpackConfig.devtool = 'source-map';
}

//webpack config
module.exports = webpackConfig;
