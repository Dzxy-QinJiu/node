/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/3/15.
 */
module.exports = {
    path: 'apply',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};