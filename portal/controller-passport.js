/**
 * 登录验证
 */

'use strict';
var logger = require('../portal/lib/utils/logger');
//访问日志
var accessLogger = logger.getLogger('access');

var checkLogin = function(passport) {
    return function(req, res, next) {
        // 登入登出的一种特殊检测
        if (req.path === '/login') {
            if (req.session.user) {
                if (req.xhr) {
                    accessLogger.debug('user: ' + req.session.user.username + ' ajax重新登录时，session还存在');
                    //session失效时，登录成功后的处理
                    return res.status(200).json('success');
                } else {
                    //登录界面，登录成功后的处理
                    return res.redirect('/');
                }
            }
            return next();
        } else if (req.url === '/logout') {
            if (!req.session.user) {
                return res.redirect('/login');
            }
            return next();
        }

        // 其它正常逻辑的检测
        if (req.session.user || !passport.needLogin) {
            next();
        } else {
            //如果是ajax请求  “X-Requested-With” header field is “XMLHttpRequest”,
            // indicating that the request was issued by a client library such as jQuery.
            if (req.xhr) {
                accessLogger.error('sessionId:' + req.sessionID + ',用户未登录,url=' + req.url + ',sendStatus 401');
                res.sendStatus(401);
            } else {
                ///处理转页的情况
                dealTurnPage(req);
                res.redirect('/login');
                /*if (global.config.useSso) {
                    //sso登录的情况下，超时需要加stopcheck参数，防止再次sso校验登录
                    res.redirect('/login?stopcheck=true');
                } else {
                    res.redirect('/login');
                }*/
            }
        }
    };

    /**
     * 处理转页的情况，
     * 例如浏览器直接请求某个模块的路径，但是还未登录时，预存之前的请求路径
     * @param req
     */
    function dealTurnPage(req) {
        if (req && req.url) {
            //保存之前的请求路径到session中
            req.session.preUrl = req.url;
        }
    }
};

module.exports = checkLogin;