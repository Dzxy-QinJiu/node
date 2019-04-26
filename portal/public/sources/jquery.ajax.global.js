/**
 * author:周连毅
 * description:全局的ajax处理
 *     1.对于session超时的450错误(服务器会返回状态码450，同时返回json信息{type:"login"})
 *       页面会使用$.tooltip提示一个错误信息 "您已很长时间没有进行操作，为了保障帐号安全，请重新登录系统"
 */
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from '../../lib/websso';

var UI_ERROR = require('../../lib/utils/request-error-util');
import {Modal} from 'antd';

(function() {
    let crypto = require('crypto');
    //socket的emitter
    var socketEmitter = require('./utils/emitters').socketEmitter;
    let userData = require('./user-data');
    const SessionTimeoutModal = require('../../components/Login/session-timeout-modal/index');
    const Translate = require('../intl/i18nTemplate');
    var history = require('./history');
    const Router = require('react-router-dom').Router;
    const BASE64_PREFIX = 'data:image/png;base64,';
    const NO_SERVICE_ERROR = Intl.get('login.error.retry', '登录服务暂时不可用，请稍后重试');
    module.exports.handleSessionExpired = handel401Ajax;

    /*处理ajax时，session过期的问题*/
    function handel401Ajax() {
        sendMessage && sendMessage('session过期, globalError status: 401');
        //让socket断开连接
        socketEmitter.emit(socketEmitter.DISCONNECT);
        //session过期提示的添加
        var $modal = $('body >#session-timeout-modal');
        if ($modal && $modal.length > 0) {
            return;
        } else {
            // let inputPasswordModal = `<div id="session-invalid-modal">
            //                            <div class="session-invalid-modal-block"></div>
            //                            <div class="session-invalid-modal-content">
            //                                <span class="modal-icon iconfont icon-warn-icon"/>
            //                                <span class="modal-title">
            //                                ${Intl.get('retry.no.login.for.longtime', '您已长时间没有进行操作，为了您的帐号安全，')}
            //                                </span>
            //                                <div class="modal-title second-line-title">
            //                                ${Intl.get('retry.input.login.password.again', '请重新输入密码:')}
            //                                </div>
            //                                <input type="password" hidden/>
            //                                <input type="password" placeholder="${Intl.get('retry.input.login.password', '请输入登录密码')}" class="modal-password-input" autoComplete="off"/>
            //                                <div class="input-item captcha_wrap clearfix" hidden>
            //                                    <input placeholder="${Intl.get('retry.input.captcha', '请输入验证码')}" type="text" autoComplete="off" class="captcha_input" maxLength="4"/>
            //                                    <img class="captcha_image" src="" width="120" height="40" title="${Intl.get('login.dim.exchange', '看不清？点击换一张')}"/>
            //                                </div>
            //                                <div class="modal-submit-error"></div>
            //                                <div class="modal-submit-btn">${Intl.get('retry.submit.again', '提交')}</div>
            //                            </div>
            //                          </div>`;
            $('body').append('<div id="session-timeout-modal"></div>');

            ReactDOM.render(<Translate Template={<Router history={history}><SessionTimeoutModal/></Router>}/>, $('#session-timeout-modal')[0]);
            //事件添加
            addSessionInvalidPanelEvent();
        }
    }

    //session过期重新登录面板的事件添加
    function addSessionInvalidPanelEvent() {
        //密码框
        let $passwordInput = $('#session-invalid-modal .modal-password-input');
        let $errorDiv = $('#session-invalid-modal .modal-submit-error');
        let $captchaWrap = $('#session-invalid-modal .captcha_wrap');
        //密码框获取焦点时，清空密码和错误提示
        $passwordInput.focus(function() {
            $errorDiv.html('');
            $(this).val('');
        }).keydown(function(e) {
            //点击enter时的处理
            if (e.keyCode === 13 && $captchaWrap.is(':hidden')) {
                $('#session-invalid-modal .modal-submit-btn').trigger('click');
            }
        });
        //验证码输入框获取焦点时，清空错误提示
        $captchaWrap.find('.captcha_input').focus(function() {
            $errorDiv.html('');
        }).keydown(function(e) {
            //点击enter时的处理
            if (e.keyCode === 13) {
                $('#session-invalid-modal .modal-submit-btn').trigger('click');
            }
        });
        //点击验证码的图片刷新验证码
        $captchaWrap.find('img').click(function() {
            refreshCaptchaCode();
        });
        //点击提交时的登录处理
        $('#session-invalid-modal .modal-submit-btn').click(function() {
            const password = $passwordInput.val();
            const userName = userData.getUserData().user_name;
            //将密码进行md5加密
            if (password) {
                //做md5
                var md5Hash = crypto.createHash('md5');
                md5Hash.update(password);
                let md5Password = md5Hash.digest('hex');
                let submitObj = {
                    username: userName,
                    password: md5Password
                };
                //验证码
                if ($captchaWrap.is(':visible')) {
                    let captchaCode = $captchaWrap.find('.captcha_input').val();
                    if (captchaCode) {
                        submitObj.retcode = captchaCode;
                        //带验证码的登录
                        reLogin(submitObj);
                    } else {
                        $errorDiv.html(Intl.get('login.write.code', '请输入验证码'));
                    }
                } else {
                    //无验证码的登录
                    reLogin(submitObj);
                }
            } else {
                $errorDiv.html(Intl.get('common.input.password', '请输入密码'));
            }
        });
    }

    //重新登录
    function reLogin(submitObj) {
        let $submitBtn = $('#session-invalid-modal .modal-submit-btn');
        //渲染等待效果
        $submitBtn.html(Intl.get('retry.is.submitting', '提交中...'));
        if (window.Oplate && window.Oplate.useSso) {
            //如果使用sso登录
            ssoLogin.login(submitObj.username, submitObj.password, submitObj.retcode ? submitObj.retcode : '')
                .then((ticket) => {
                    $.ajax({
                        url: callBackUrl + '?t=' + ticket + '&lang=' + window.Oplate.lang,
                        type: 'get',
                        success: loginSuccess,
                        error: loginError.bind(this, submitObj.username)
                    });
                }).catch((data) => {
                //渲染验证码
                    if (data.captcha) {
                        let $captchaWrap = $('#session-invalid-modal .captcha_wrap');
                        $captchaWrap.show();
                        $captchaWrap.find('img').attr('src', data.captcha);
                    }
                    if (data.error) {
                        $('#session-invalid-modal .modal-submit-error').html(data.error);
                    }
                    $submitBtn.html(Intl.get('retry.submit.again', '提交'));
                });
        } else {
            $.ajax({
                url: '/login',
                dataType: 'json',
                type: 'post',
                data: submitObj,
                success: loginSuccess.bind(this, submitObj.username),
                error: loginError.bind(this, submitObj.username)
            });
        }
    }

    //登录成功处理
    function loginSuccess(username, data) {
        sendMessage && sendMessage(username + ' 登录成功 data: ' + JSON.stringify(data));
        userData.getUserDataByAjax().done(function() {
            //重新建立socket连接
            !Oplate.hideSomeItem && require('./push').startSocketIo();
            $('#session-invalid-modal .modal-submit-error').html('');
            $('#session-invalid-modal .modal-submit-btn').html(Intl.get('retry.submit.again', '提交'));
            var $modal = $('body >#session-invalid-modal');
            if ($modal && $modal.length > 0) {
                $modal.remove();
            }
        });
    }

    //登录失败处理
    function loginError(username, xhr, error) {
        let errorMsg = xhr && xhr.responseJSON || error;
        sendMessage && sendMessage(username + ' 登录失败，error: ' + errorMsg);
        if (errorMsg === Intl.get('errorcode.39', '用户名或密码错误') || !errorMsg) {
            errorMsg = Intl.get('login.password.error', '密码错误');
        }
        if (window.Oplate && window.Oplate.useSso) {
            $('#session-invalid-modal .modal-submit-error').html(errorMsg);
            $('#session-invalid-modal .modal-submit-btn').html(Intl.get('retry.submit.again', '提交'));
        } else {
            //获取验证码
            getLoginCaptcha(username, errorMsg);
        }
    }

    //刷新验证码
    function refreshCaptchaCode() {
        if (window.Oplate && window.Oplate.useSso) {
            $('#session-invalid-modal .captcha_image').attr('src', buildRefreshCaptchaUrl());
        } else {
            refreshCaptchaCodeWithoutSso();
        }
    }

    //获取验证码
    function getLoginCaptcha(username, errorMsg) {
        let $error = $('#session-invalid-modal .modal-submit-error');
        let $submitBtn = $('#session-invalid-modal .modal-submit-btn');
        $.ajax({
            url: '/loginCaptcha',
            dataType: 'json',
            data: {
                username: username
            },
            success: function(data) {
                //渲染验证码
                if (data) {
                    let $captchaWrap = $('#session-invalid-modal .captcha_wrap');
                    $captchaWrap.show();
                    $captchaWrap.find('img').attr('src', BASE64_PREFIX + data);
                    $error.html(Intl.get('login.password.error', '密码错误'));
                } else {
                    $error.html(errorMsg);
                }
                $submitBtn.html(Intl.get('retry.submit.again', '提交'));
            },
            error: function() {
                sendMessage && sendMessage(username + ',获取验证码错误');
                $error.html(errorMsg || NO_SERVICE_ERROR);
                $submitBtn.html(Intl.get('retry.submit.again', '提交'));
            }
        });
    }

    //刷新验证码
    function refreshCaptchaCodeWithoutSso() {
        var username = userData.getUserData().user_name;
        $.ajax({
            url: '/refreshCaptcha',
            dataType: 'json',
            data: {
                username: username
            },
            success: function(data) {
                //渲染验证码
                if (data) {
                    $('#session-invalid-modal .captcha_image').attr('src', BASE64_PREFIX + data);
                }
            },
            error: function() {
                $('#session-invalid-modal .modal-submit-error').html(NO_SERVICE_ERROR);
            }
        });
    }

    //处理403错误请求（token过期）
    function handel403Ajax(xhr) {
        if (xhr.responseJSON === UI_ERROR.TOKEN_EXPIRED) {
            sendMessage && sendMessage(Intl.get('retry.token.status', 'status:403,Token过期'));
            window.location.href = '/login';
        }
    }

    /**
     *不允许多人登录，被下线的处理
     * @param tipContent
     */
    function handleReloginError(tipContent) {
        //让socket断开连接
        socketEmitter.emit(socketEmitter.DISCONNECT);
        Modal.error({
            wrapClassName: 'socket-io',
            content: tipContent,
            okText: Intl.get('retry.login.again', '重新登录'),
            onOk: function() {
                window.location.href = '/logout';
            }
        });
        setTimeout(function() {
            //设置提示框的样式
            var $modal = $('body >.ant-modal-container');
            if ($modal && $modal.length > 0) {
                $modal.addClass('offline-modal-container');
            }
        }, 100);
        //解除 session失效提示的 事件绑定
        $(document).off('ajaxError');
    }

    /**
     * 处理请求超时的情况(408)
     * @param xhr
     * @param options
     */
    function handleTimeout(xhr, options) {
        sendMessage && sendMessage('Error requesting ' + options && options.url + ': ' + xhr.status + ' ' + xhr.statusText);
    }

    /**
     * 全局ajax错误处理
     * @param xhr
     * @param options
     */
    function globalErrorHandler(xhr, options) {
        var status = xhr.status;
        switch (status) {
            case 401:
                handel401Ajax();
                break;
            case 403:
                //不允许多人登录被踢出的统一处理
                if (xhr.responseJSON === UI_ERROR.LOGIN_ONLY_ONE || xhr.responseJSON === UI_ERROR.KICKED_BY_ADMIN) {
                    let reloginError = Intl.get('login.by.another', '您的账号在另一地点登录，如非本人操作，建议您尽快修改密码！');
                    let kickedByAmdin = Intl.get('kicked.by.admin', '您已被被管理员踢出，请重新登录!');
                    handleReloginError((xhr.responseJSON === UI_ERROR.LOGIN_ONLY_ONE) ? reloginError : kickedByAmdin);
                } else {
                    handel403Ajax(xhr);
                }
                break;
            case 408:
                handleTimeout(xhr, options);
                break;
        }
    }

    $(document).ajaxError(function(event, xhr, options) {
        globalErrorHandler(xhr, options);
    });
})();
