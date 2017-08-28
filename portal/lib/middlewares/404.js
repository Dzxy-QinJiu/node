//处理404错误
module.exports = function(req, res) {
    res.status(404).end();
};