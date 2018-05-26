/**
 * Created by wangliping on 2017/4/27.
 */
//线性图中tooltip展示位置的计算（不设置会超出图表展示区）
exports.getTooltipPosition = function(_this, mousePointer, params, tooltipDom) {
    var chartWidth = $(_this.refs.chart).width();
    var chartHeight = $(_this.refs.chart).height();
    var tooltipDomWidth = $(tooltipDom).outerWidth(true);
    var tooltipDomHeight = $(tooltipDom).outerHeight(true);
    let tipOffsetLeft = mousePointer[0], tipOffsetTop = mousePointer[1];
    if (tipOffsetLeft < 0) {
        //超出左侧边界
        tipOffsetLeft = 0;
    } else if (tipOffsetLeft + tooltipDomWidth > chartWidth) {
        //超出右侧边界
        let overRightW = tipOffsetLeft + tooltipDomWidth - chartWidth;//提示框右侧超出的宽度
        tipOffsetLeft = tipOffsetLeft - overRightW;
        tipOffsetLeft = tipOffsetLeft > 0 ? tipOffsetLeft : 0;
    }
    if (tipOffsetTop < 0) {
        //超出顶部边界
        tipOffsetTop = 0;
    } else if (tipOffsetTop + tooltipDomHeight > chartHeight) {
        //超出底部侧边界
        let overBottomH = tipOffsetTop + tooltipDomHeight - chartHeight;//提示框底部超出的高度
        tipOffsetTop = tipOffsetTop - overBottomH;
        tipOffsetTop = tipOffsetTop > 0 ? tipOffsetTop : 0;
    }

    return [
        tipOffsetLeft,
        tipOffsetTop
    ];
};