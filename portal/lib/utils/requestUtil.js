//判断是否是ajax请求
exports.isAjax = function(req) {
    var XRequestedWith = req.header('X-Requested-With');
    return XRequestedWith === 'XMLHttpRequest';
}