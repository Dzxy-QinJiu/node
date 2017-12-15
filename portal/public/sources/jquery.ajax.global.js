/**
 * author:周连毅
 * description:全局的ajax处理
 *     1.对于session超时的450错误(服务器会返回状态码450，同时返回json信息{type:"login"})
 *       页面会使用$.tooltip提示一个错误信息 "您已很长时间没有进行操作，为了保障帐号安全，请重新登录系统"
 */
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl}  from "../../lib/websso";
(function () {
    let Modal = require("antd").Modal;
    let crypto = require("crypto");
    //socket的emitter
    var socketEmitter = require("./utils/emitters").socketEmitter;
    let userData = require("./user-data");
    //不允许多人登录，被下线的错误码
    var RELOGIN_ERROR = "login-only-one-error";
    const BASE64_PREFIX = "data:image/png;base64,";
    const NO_SERVICE_ERROR = Intl.get("login.error.retry", "登录服务暂时不可用，请稍后重试");
    module.exports.handleSessionExpired = handel401Ajax;
    /*处理ajax时，session过期的问题*/
    function handel401Ajax() {
        sendMessage && sendMessage("globalError status: 401");
        //让socket断开连接
        socketEmitter.emit(socketEmitter.DISCONNECT);
        //session过期提示的添加
        var $modal = $("body >#session-invalid-modal");
        if ($modal && $modal.length > 0) {
            return;
        } else {
            let inputPasswordModal = `<div id="session-invalid-modal">
                                       <div class="session-invalid-modal-block"></div>
                                       <div class="session-invalid-modal-content">
                                           <span class="modal-icon iconfont icon-warn-icon"/>
                                           <span class="modal-title">
                                           ${Intl.get("retry.no.login.for.longtime", "您已长时间没有进行操作，为了您的帐号安全，")}
                                           </span>
                                           <div class="modal-title second-line-title">
                                           ${Intl.get("retry.input.login.password.again", "请重新输入密码:")}
                                           </div>
                                           <input type="password" hidden/>
                                           <input type="password" placeholder="${Intl.get("retry.input.login.password", "请输入登录密码")}" class="modal-password-input" autoComplete="off"/>
                                           <div class="input-item captcha_wrap clearfix" hidden>
                                               <input placeholder="${Intl.get("retry.input.captcha", "请输入验证码")}" type="text" autoComplete="off" class="captcha_input" maxLength="4"/>
                                               <img class="captcha_image" src="" width="120" height="40" title="${Intl.get("login.dim.exchange", "看不清？点击换一张")}"/>
                                           </div>
                                           <div class="modal-submit-error"></div>
                                           <div class="modal-submit-btn">${Intl.get("retry.submit.again", "提交")}</div>
                                       </div>
                                     </div>`;
            $('body').append(inputPasswordModal);
            //事件添加
            addSessionInvalidPanelEvent();
        }
    }

    //session过期重新登录面板的事件添加
    function addSessionInvalidPanelEvent() {
        //密码框
        let $passwordInput = $("#session-invalid-modal .modal-password-input");
        let $errorDiv = $("#session-invalid-modal .modal-submit-error");
        let $captchaWrap = $("#session-invalid-modal .captcha_wrap");
        //密码框获取焦点时，清空密码和错误提示
        $passwordInput.focus(function () {
            $errorDiv.html("");
            $(this).val("");
        }).keydown(function (e) {
            //点击enter时的处理
            if (e.keyCode == 13 && $captchaWrap.is(":hidden")) {
                $("#session-invalid-modal .modal-submit-btn").trigger("click");
            }
        });
        //验证码输入框获取焦点时，清空错误提示
        $captchaWrap.find(".captcha_input").focus(function () {
            $errorDiv.html("");
        }).keydown(function (e) {
            //点击enter时的处理
            if (e.keyCode == 13) {
                $("#session-invalid-modal .modal-submit-btn").trigger("click");
            }
        });
        //点击验证码的图片刷新验证码
        $captchaWrap.find("img").click(function () {
            refreshCaptchaCode();
        });
        //点击提交时的登录处理
        $("#session-invalid-modal .modal-submit-btn").click(function () {
            const password = $passwordInput.val();
            const userName = userData.getUserData().user_name;
            //将密码进行md5加密
            if (password) {
                //做md5
                var md5Hash = crypto.createHash("md5");
                md5Hash.update(password);
                let md5Password = md5Hash.digest('hex');
                let submitObj = {
                    username: userName,
                    password: md5Password
                };
                //验证码
                if ($captchaWrap.is(":visible")) {
                    let captchaCode = $captchaWrap.find(".captcha_input").val();
                    if (captchaCode) {
                        submitObj.retcode = captchaCode;
                        //带验证码的登录
                        reLogin(submitObj);
                    } else {
                        $errorDiv.html(Intl.get("login.write.code", "请输入验证码"));
                    }
                } else {
                    //无验证码的登录
                    reLogin(submitObj);
                }
            } else {
                $errorDiv.html(Intl.get("common.input.password", "请输入密码"));
            }
        });
    }

    //重新登录
    function reLogin(submitObj) {
        let $error = $("#session-invalid-modal .modal-submit-error");
        let $submitBtn = $("#session-invalid-modal .modal-submit-btn");
        //渲染等待效果
        $submitBtn.html(Intl.get("retry.is.submitting", "提交中..."));
        ssoLogin.login(submitObj.username, submitObj.password, submitObj.retcode ? submitObj.retcode : "")
            .then((ticket) => {
                $.ajax({
                    url: callBackUrl + '?t=' + ticket + '&lang=' + window.Oplate.lang,
                    type: 'get',
                    success: function () {
                        userData.getUserDataByAjax().done(function () {
                            //重新建立socket连接
                            require("./push").startSocketIo();
                            $error.html("");
                            $submitBtn.html(Intl.get("retry.submit.again", "提交"));
                            var $modal = $("body >#session-invalid-modal");
                            if ($modal && $modal.length > 0) {
                                $modal.remove();
                            }
                        });
                    },
                    error: function (error) {
                        let errorMsg = error && error.responseJSON;
                        if (errorMsg == Intl.get("errorcode.39", "用户名或密码错误") || !errorMsg) {
                            errorMsg = Intl.get("login.password.error", "密码错误");
                        }
                        $error.html(errorMsg);
                        $submitBtn.html(Intl.get("retry.submit.again", "提交"));
                    }
                });
            }).catch((data) => {
            //渲染验证码
            if (data.captcha) {
                let $captchaWrap = $("#session-invalid-modal .captcha_wrap");
                $captchaWrap.show();
                $captchaWrap.find("img").attr("src", data.captcha);
                $error.html(Intl.get("login.password.error", "密码错误"));
            } else {
                $error.html(data.error);
            }
            $submitBtn.html(Intl.get("retry.submit.again", "提交"));
        });
    }

    //刷新验证码
    function refreshCaptchaCode() {
        $("#session-invalid-modal .captcha_image").attr("src", buildRefreshCaptchaUrl());
    }

    //处理403错误请求（token过期）
    function handel403Ajax(xhr) {
        if (xhr.responseJSON === Intl.get("retry.token.expired", "Token过期")) {
            sendMessage && sendMessage(Intl.get("retry.token.status", "status:403,Token过期"));
            window.location.href = "/login";
        }
    }

    //不允许多人登录，被下线的处理
    function handleReloginError() {
        //让socket断开连接
        socketEmitter.emit(socketEmitter.DISCONNECT);
        Modal.error({
            wrapClassName: 'socket-io',
            content: Intl.get("retry.modify.password", "您的账号在另一地点登录，如非本人操作，建议您尽快修改密码！"),
            okText: Intl.get("retry.login.again", "重新登录"),
            onOk: function () {
                window.location.href = '/logout';
            }
        });
        setTimeout(function () {
            //设置提示框的样式
            var $modal = $("body >.ant-modal-container");
            if ($modal && $modal.length > 0) {
                $modal.addClass("offline-modal-container");
            }
        }, 100);
        //解除 session失效提示的 事件绑定
        $(document).off("ajaxError");
    }

    function globalErrorHandler(xhr) {
        var status = xhr.status;
        switch (status) {
            case 401:
                handel401Ajax();
                break;
            case 403:
                //不允许多人登录被踢出的统一处理
                if (xhr.responseJSON == RELOGIN_ERROR) {
                    handleReloginError();
                } else {
                    handel403Ajax(xhr);
                }
                break;
        }
    }

    $(document).ajaxError(function (event, xhr, settings, thrownError) {
        globalErrorHandler(xhr);
    });
})();
