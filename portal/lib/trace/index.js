/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/7/31.
 */
//获取跟踪的路线
function getTraceLines(target) {
    var traces = {};
    if (target && $(target).attr("data-tracename")) {
        var parentNames = getParentsTraceLines(target);
        parentNames.push($(target).attr("data-tracename"));
        traces.root = parentNames[0];
        traces.traceLine = parentNames.join(">");
    }
    return traces;
}
//获取父元素的跟踪路线集合
function getParentsTraceLines(target) {
    var parentNames = [];
    if (target) {
        var parents = $(target).parents("[data-tracename]");
        if (parents && parents.length > 0) {
            parentNames = parents.get().reverse().map(function (p) {
                return $(p).attr("data-tracename");
            })
        }
    }
    return parentNames;
}

module.exports = {
    //事件处理器
    eventHandler: function (event) {
        event = event || window.event;
        var target = event.target;
        var tracename = $(target).attr("data-tracename");
        //tracename属性不存在时，查找上一层父元素是否有tracename属性
        if (!tracename) {
            target = $(target).parent();
            tracename = target.attr("data-tracename");
        }
        if (tracename && typeof _paq == "object") {
            var traceObj = getTraceLines(target);
            console.log(JSON.stringify(traceObj.traceLine));
            _paq.push(['trackEvent', traceObj.root || tracename, 'clicked', traceObj.traceLine || tracename]);
        }
    }
    ,
    //添加事件监听
    addEventListener: function (element, eventType, eventHandler, useCapture = false) {
        if (element.addEventListener) {
            element.addEventListener(eventType, eventHandler, useCapture);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventType, eventHandler);
        } else {
            element['on' + eventType] = eventHandler;
        }
    }
    ,
    //取消事件监听
    detachEventListener: function (element, eventType, eventHandler, useCapture = false) {
        if (element.removeEventListener) {
            element.removeEventListener(eventType, eventHandler, useCapture);
        } else if (element.detachEvent) {
            element.detachEvent(eventType, eventHandler);
        } else {
            element['on' + eventType] = null;
        }
    },//直接发送事件数据
    traceEvent: function (element, traceName) {
        if (!traceName)
            return;
        var parentNames = [];
        //如果是字符串描述
        if (typeof element == "string") {
            parentNames.push(element);
        } else {
            let dom;
            //如果传入event,从event中取出target
            if (element) {
                if (element.target) {
                    dom = element.target;
                } else {
                    dom = element;
                }
                parentNames = getParentsTraceLines(dom);
            }
        }
        parentNames.push(traceName);
        var traceObj = {
            root: parentNames[0] || "",
            traceLine: parentNames.join(">")
        };
        if (typeof _paq == "object") {
            //todo 暂时增加控制台日志，完成后删掉
            console.log(JSON.stringify(traceObj.traceLine));
            _paq.push(['trackEvent', traceObj.root || traceName, 'clicked', traceObj.traceLine || traceName]);
        }
    }
}