//根据之前选中项和当前点击项获取新的选中项
function getSelected (selected, curItem) {
    //如果之前选中的是“全部”
    if (!selected) {
        //如果当前点击的也是“全部”，不做处理
        if (!curItem) {
            return selected;
        }
        //否则设为选中状态
        else {
            selected = curItem;
        }
    } else {
        //如果当前点击的是“全部”，则将选中项置为“全部”
        if (!curItem) {
            selected = curItem;
        }
        //否则判断之前是否已选中
        else {
            selected = selected.split(",");

            //如果之前处于选中状态则取消选择
            if (selected.indexOf(curItem) > -1) {
                selected = _.filter(selected, item => item != curItem);
            }
            //否则设为选中状态
            else {
                selected.push(curItem);
            }
    
            selected = selected.join(",");
        }
    }

    return selected;
}

export { getSelected };

