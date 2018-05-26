exports.toRestObject = function(list) {
    var result = [];
    list = list || [];
    list.forEach(function(item) {
        result.push({
            app_id: item.client_id,
            app_name: item.client_name,
            app_logo: item.client_logo
        });
    });
    return result;
};