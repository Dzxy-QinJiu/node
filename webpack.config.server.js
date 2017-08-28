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
 
module.exports = 
{
        // The configuration for the server-side rendering
        name: "server-side rendering",
        entry: "./portal/components/Login/index",
        target: "node",
        output: {
            path:path.join(__dirname, 'dist'),
            filename: "server-render/login.js",
            publicPath:  '/resources/' ,
            libraryTarget: "commonjs2"
        },
        externals: /^[a-z\-0-9]+$/ ,
        resolveLoader: {
            moduleExtensions: ["-loader"]
        },
        module: {
              rules: [
               {
                  test: /\.(png|jpg)$/,
                  use: [
                      {loader: "url-loader"}
                  ]
               },
               {
                  test: /\.js$/,
                  use: [
                      {loader: 'babel?compact=false'}
                  ]
               },
               {
                  test: /\.css$/,
                  use: [
                      "style-collector" ,
                      "css-loader"
                  ]
               }
             ]
        }
        
}
