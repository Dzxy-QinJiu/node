//表头、表身子对齐
exports.alignTheadTbody = function(dom) {
    var $thead, $tbody, tbodyWidth;
    var $customTbody = $('.custom-tbody', dom);

    //采用多表格拼凑模式时
    if ($customTbody.length) {
        $thead = $('.custom-thead', dom);
        $tbody = $customTbody.find('.ant-table-tbody');
    } else {
        $thead = $('.ant-table-header', dom);
        $tbody = $('.ant-table-tbody', dom);
    }

    tbodyWidth = $tbody.width();
    $thead.css('width' , tbodyWidth);
};
//放大排序区域
exports.zoomInSortArea = function(dom, setFilterCondition) {
    if($(dom).data('binded-thead-filter')) {
        return;
    }
    $(dom).on('click', '.has-filter, .ant-table-column-sort', function(e) {
        //点击筛选按钮时对筛选面板内容进行自定义修改
        if (e.target.className.indexOf('anticon-filter') > -1) {
            //等表头筛选面板渲染出来之后再对其进行修改
            setTimeout(() => {
                //找到筛选面板内容容器，可能不止一个
                const filterDropdown = $('.ant-table-filter-dropdown');

                //对各个筛选面板进行处理
                filterDropdown.each((idx, elm) => {
                    elm = $(elm);
                    //如果没进行过自定义修改
                    if (!elm.find('input.custom-filter-input').length) {
                        //隐藏选项列表
                        elm.find('ul').hide();
                        //将确定按钮的文字改为搜索
                        elm.find('.ant-table-filter-dropdown-link.confirm').text(Intl.get('common.search','搜索'));
                        //隐藏重置按钮
                        elm.find('.ant-table-filter-dropdown-link.clear').hide();
                        //添加搜索输入框
                        elm.prepend('<input class="custom-filter-input"/>');
                        //找到确定按钮
                        const confirmBtn = elm.find('.ant-table-filter-dropdown-link.confirm');
                        //将确定按钮的文字改为搜索
                        confirmBtn.text(Intl.get('common.search','搜索'));
                        //绑定搜索按钮点击事件
                        confirmBtn.click(() => {
                            //获取搜索内容
                            const searchContent = _.trim(elm.find('.custom-filter-input').val());
                            //获取搜索字段
                            const searchField = elm.find('.ant-checkbox').next().text();
                            //搜索条件默认为空
                            let condition = {};
                            //搜索内容不为空时，将搜索内容赋给对应搜索字段
                            if (searchContent) {
                                condition[searchField] = searchContent;
                                //先请一下筛选器图标的高亮状态
                                $(this).parent().find('.filter-active').removeClass('filter-active');
                                //将当前列的筛选器图标置为高亮
                                $(this).addClass('filter-active');
                            } else {
                                //清空搜索内容时，将当前列的筛选器图标取消高亮
                                $(this).removeClass('filter-active');
                            }
                            //设置搜索条件
                            if (_.isFunction(setFilterCondition)) setFilterCondition(condition);
                        });
                    }
                });
            });

            return;
        }

        var filterUp = $(this).find('.ant-table-column-sorter-up')[0];
        var filterDown = $(this).find('.ant-table-column-sorter-down')[0];
        $(filterDown).click(function(e) {
            e.stopPropagation();
        });
        $(filterUp).click(function(e) {
            e.stopPropagation();
        });
        if ($(filterDown).hasClass('off')) {
            $(filterDown).click();
        } else {
            $(filterUp).click();
        }
    });
    $(dom).data('binded-thead-filter',true);
};

// 表格中页码跳转
exports.updatePaginationJumpNewPage = function(dom, newPage){
    var $input = $('.ant-pagination-options-quick-jumper input[type="text"]',dom);
    if ($input[0]){
        $input.val(newPage);
    }
};
