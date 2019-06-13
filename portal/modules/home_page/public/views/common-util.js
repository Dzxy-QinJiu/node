/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/13.
 */

const LAYOUT_CONSTS = {
    PADDING: 10,//上下间距
    TITLE_HEIGHT: 30,//标题的goad
    MIN_BODY_WIDTH: 768,//body宽度小于768时折行展示
};

exports.getColumnHeight = function() {
    let columnHeight = $('body').height() - 2 * LAYOUT_CONSTS.PADDING - LAYOUT_CONSTS.TITLE_HEIGHT;
    //body宽度小于768时折行展示
    if ($('body').width() < 768) {
        columnHeight = $('body').height() / 2 - 2 * LAYOUT_CONSTS.PADDING - LAYOUT_CONSTS.TITLE_HEIGHT;
    }
    return columnHeight;
};