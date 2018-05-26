var head = document.getElementsByTagName("head")[0];
module.exports = function(css) {
    var style = document.createElement("style");
    style.setAttribute("type" , "text/css");
    if ('textContent' in style) {
        style.textContent = css;
    } else {
        style.styleSheet.cssText = css;
    }
    head.appendChild(style);
    return {
        destroy: function() {
            head.removeChild(style);
        }
    };
};