/*
 * $.ajaxTrans用于进行根据配置返回ajax对象。
 *
 * 使用示例：
 *
 *  ---------------------

 var trans = $.ajaxTrans();
 trans.register('monitorResource' , {url : '/service/assetmonitor/resources/:monitorid',type : 'post'});

 ----------------------

 trans.getAjax('monitorResource').resolvePath({
    monitorid : 100
 }).addQueryParam({
    userid : 10
 }).sendRequest({
    resourceIds:"1329"
 }).success(function(json) {
    alert(JSON.stringify(json));
 }).error(function(xhr, code , errText) {
    alert(errText);
 }).timeout(function() {
    alert('超时了');
 });

 实际使用时，--------中的两行应该在一个单独的文件里，将trans进行返回。

 //调用$.ajaxTrans()返回一个对象，使用其register函数，进行ajax资源注册。
 //注册的时候，提供一个资源名称（唯一标识），和一个ajax配置（与$.ajax配置相同，不需要提供回调函数）

 //$.ajaxTrans()返回的对象上使用getAjax方法，获取到ajax，调用
 // sendRequest方法进行发送请求，参数为Json对象，可以为空，参数为ajax发送的数据

 // 调用resolvePath可以进行rest url中的参数设置，参数是一个json对象，会对url中的:userid 这样的标识进行映射。
 //   resolvePath函数是可选函数，对于rest中没有:userid这样参数的可以不调用

 // 调用addQueryParam可以进行rest url中的post请求，添加url上的参数，这种需求比较少，但是也提供支持。

 //sendRequest之后的success和error和timeout可以处理回调。
 //success的参数与jquery的$.ajax相同
 //error和timeout的参数与jquery的$.ajax相同
 //timeout时间需要在register的时候配置。
 //超过了timeout指定的时间，就会触发超时 。

 *
 */
(function($) {
    //$.ajaxTrans的默认ajax配置
    var defaultCfg = {
        type : 'GET',
        dataType : 'json',
        timeout : 30 * 1000
    };
    //辅助请求的ajax配置
    var requestDefaultCfg = {
        //需要哪些字段，默认为空数组需要全部字段
        //非空数组的时候，会在请求头中添加fields头，标识返回的数据需要的字段
        fields : []
    };
    //ajaxTrans 的意思是ajax transform,即ajax的转换，通过register和getAjax替代传统$.ajax
    $.ajaxTrans = function() {
        //that 提供register和getAjax方法
        var that = {} ,
        //map用来存储ajax配置
            map = {}  ;
        //register用来进行ajax注册
        that.register = function(ns , conf) {
            if(!ns || !conf || !conf.url) {
                throw '$.ajaxTrans->register must provide name and config.url';
            }
            map[ns] = conf;
        };
        //getAjax用来进行ajax获取
        that.getAjax = function(ns , cfg) {
            //默认配置与定义配置融合
            var ajaxOpts = $.extend(true, {}, defaultCfg , map[ns]);
            //需要的字段列表
            var requestCfg = $.extend(true , {} , requestDefaultCfg , cfg);
            //解析rest url之后变量
            var restUrl = ajaxOpts.url;
            //sendRequest的方法
            function sendRequest(data) {
                data = data || {};
                var opts = $.extend({},ajaxOpts);
                //发送的数据
                opts.data = data;
                //使用后来保存的url
                opts.url = restUrl;
                //添加success方法
                opts.success = function() {
                    success && success.apply(this,arguments);
                };
                //添加error方法，error方法上区分error和timeout,主动abort的不管。
                opts.error = function(xhr, errType , errText) {
                    switch(errType) {
                        case 'timeout':
                            timeout && timeout.apply(this,arguments);
                            break;
                        case 'abort':
                            break;
                        default :
                            error && error.apply(this,arguments);
                    }
                };
                //检查请求头，并检查是否需要添加fields头，只获取指定的字段
                if(!opts.headers && requestCfg.fields.length) {
                   opts.headers = {
                       fields : requestCfg.fields.join(",")
                   };
                } else if(opts.headers && requestCfg.fields.length && !opts.headers.fields) {
                    opts.headers.fields = requestCfg.fields.join(",");
                }
                //将jquery的ajax结果保存下来
                var ajaxRet = $.ajax(opts);
                //保存用户定义的回调函数
                var success,
                    error,
                    timeout,
                //链式函数调用
                    union = {
                        //请求成功的回调
                        success : function(s) {
                            success = s;
                            return union;
                        },
                        //请求失败的回调
                        error   : function(e) {
                            error = e;
                            return union;
                        },
                        //请求超时的回调
                        timeout : function(e) {
                            timeout = e;
                            return union;
                        },
                        //使用原始ajax的abort方法
                        abort : function() {
                            if(ajaxRet) {
                                ajaxRet.abort();
                                ajaxRet = null;
                            }
                            return union;
                        }
                    };
                //返回链式调用入口
                return union;
            }
            //解析rest url
            function resolvePath(restParams) {
                //要求参数是一个键值对的对象
                if(!$.isPlainObject(restParams)) {
                    restParams = {};
                }
                //解析url中的变量
                restUrl = restUrl.replace(/\:([\w_]+)/g , function(full,key) {
                    return restParams[key] || full;
                });
                //返回链式调用入口
                return chain;
            }
            //post请求添加url上的参数
            function addQueryParam(queryParams) {
                var hasQueryMark = restUrl.indexOf('?') >= 0;
                //添加上新的参数
                for(var key in queryParams) {
                    var queryKey = key;
                    if(!hasQueryMark) {
                        restUrl += '?';
                        hasQueryMark = true;
                    } else {
                        restUrl += '&';
                    }
                    var val = queryParams[key];
                    if(val === null) {
                        val = '';
                    } else if(val === undefined) {
                        val = '';
                    }
                    restUrl += key + '=' + val;
                }
                //返回链式调用入口
                return chain;
            }
            //将sendRequest和resolvePath定义为链式调用
            var chain = {
                sendRequest : sendRequest,
                resolvePath : resolvePath,
                addQueryParam : addQueryParam
            };
            //返回链式调用入口
            return chain;

        };
        //返回sendRequest和getAjax函数
        return that;
    };
})(jQuery);

//(function() {
//
//	var trans = $.ajaxTrans();
// 	trans.register('monitorResource' , {url : '/service/assetmonitor/resources/' , timeout : 1000});
//
//	trans.getAjax('monitorResource').sendRequest({
//		resourceIds:"1329"
//	}).success(function(json) {
//		console.log('success',arguments);
//	}).error(function(xhr, errType , errText) {
//		console.log('error',arguments);
//	}).timeout(function() {
//		console.log('timeout',arguments);
//	});
//
//})();