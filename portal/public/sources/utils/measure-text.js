// 隐藏的一个容器
var hideContainer = null;
//获取隐藏容器
function getHideContainer() {
    return hideContainer || (hideContainer = $('<div>').css({
        position: 'absolute',
        top: '-2000px',
        left: '-2000px',
        width: '1000px',
        height: '1000px'
    }).appendTo('body'));
}

//测量文字宽度
var measureTextWidth = function(str,fontSize) {
    var $hideContainer = getHideContainer();
    var $span = $('<span style="font-size:' + fontSize + 'px;">' + str
        + '</span>').appendTo($hideContainer);
    var width = $span.width();
    $span.remove();
    return width;
};

//计算文字宽度
exports.measureTextWidth = measureTextWidth;
