/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
const APPLYAPPROVE_LAYOUT = {
    TOPANDBOTTOM: 64,
    PADDINGHEIGHT: 24,
    TABTITLE: 36
};
exports.APPLYAPPROVE_LAYOUT = APPLYAPPROVE_LAYOUT;
exports.calculateHeight = function() {
    return $(window).height() - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM;
};