function strMapToObj(strMap) {
    var obj = {};
    for (var key of strMap.keys()) {
        obj[key] = strMap.get(key);
    }
    return obj;
}

module.exports = strMapToObj;