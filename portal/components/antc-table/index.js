/** 
 * 下拉加载表格
 * 
 * 可以通过配置实现滚动加载、放大排序区域、页码跳转，其余功能和API与antd Table完全一致
 * 可在任意元素上标记id，点击此元素显示自定义列菜单
 * 
 * 参数说明 * 
 * dropload:{滚动加载的配置项
 *  loading [boolean]
 *  listenScrollBottom [boolean] 是否监听滚动到底部事件 （true:监听）
 *  handleScrollBottom [function] 滚动到底部时执行的回调函数
 *  showNoMoreDataTip [boolean] 是否显示 “没有更多数据了”
 *  buttonIdRef [string] 表格的标识，和按钮元素的id必须一样
 *  websiteConfig [array] 需要显示列的dataIndex组成的数组
 *  setWebsiteConfig [function] 修改显示列触发的函数，会传入dataIndex组成的数组
 * }
 * util: {
 *  zoomInSortArea[boolean] 是否放大排序区域 可排序的列需要设置 has-sorter 类
 *  updatePaginationJumpNewPage [boolean] 是否修改表格中页码跳转
 * }
 */
import { Table, Checkbox, Button, Alert } from "antd";
const CheckboxGroup = Checkbox.Group;
import ScrollLoad from 'CMP_DIR/scroll-load';
require("./index.less");

const LIST_CONST = {
    //菜单距窗口底部距离
    PADDING_BOTTOM: 20,
    //确定按钮留白
    BUTTON_PADDING: 20
}
class AntcTable extends React.Component {
    constructor(props) {
        super(props);
        const { tableKey, rawColumns, finalColumns } = this.columnsProcessor(props);
        this.state = {
            showColumnList: false,
            rawColumns,
            finalColumns,
            tableKey,
            checkAll: rawColumns.length == finalColumns.length,
            errorMsg: ""
        }
        this.customizeEventHandler = this.customizeEventHandler.bind(this);
    }
    componentDidMount() {
        if (this.props.util) {
            if (this.props.util.zoomInSortArea) {
                this.zoomInSortArea(ReactDOM.findDOMNode(this.table));
            }
            if (this.props.util.updatePaginationJumpNewPage) {
                this.updatePaginationJumpNewPage(ReactDOM.findDOMNode(this.table));
            }
        }
        if (_.isFunction(this.props.setWebsiteConfig) && this.props.buttonIdRef) {
            $("#" + this.props.buttonIdRef).on("click", this.customizeEventHandler);
        }
    }

    componentWillUnmount() {
        if (_.isFunction(this.props.setWebsiteConfig) && this.props.buttonIdRef) {
            $("#" + this.props.buttonIdRef).off("click", this.customizeEventHandler);
        }
    }
    // 处理自定义显示列事件
    customizeEventHandler = (e) => {
        const $container = $(ReactDOM.findDOMNode(this));
        const $ele = $(e.target);
        this.setState({
            showColumnList: !this.state.showColumnList
        }, () => {
            const $list = $container.find(".customize-colums");
            const top = $ele.offset().top + $ele.height();
            const height = ($(window).height() - top - $list.height()) < 0 ? $(window).height() - top - LIST_CONST.PADDING_BOTTOM : $list.height() + LIST_CONST.BUTTON_PADDING;
            var style = {
                top,
                height
            };
            //右侧空间不足时出现在左侧
            if (($("body").width() - $ele.offset().left) < $list.width()) {
                style.right = $("body").width() - $ele.offset().left - $ele.width();
            } else {                
                style.left = $ele.offset().left;
            }
            $list.css(style)
        })
        e.preventDefault();
    }

    //放大排序区域
    zoomInSortArea(dom, setFilterCondition) {
        if ($(dom).data("thead-sorter-zoomed")) {
            return;
        }
        $(dom).on("click", ".has-sorter, .ant-table-column-sort", function (e) {
            var filterUp = $(this).find(".ant-table-column-sorter-up")[0];
            var filterDown = $(this).find(".ant-table-column-sorter-down")[0];
            $(filterDown).click(function (e) {
                e.stopPropagation();
            });
            $(filterUp).click(function (e) {
                e.stopPropagation();
            });
            if ($(filterDown).hasClass("off")) {
                $(filterDown).click();
            } else {
                $(filterUp).click();
            }
        });
        $(dom).data("thead-sorter-zoomed", true);
    }

    // 表格中页码跳转
    updatePaginationJumpNewPage(dom, newPage) {
        var $input = $('.ant-pagination-options-quick-jumper input[type="text"]', dom);
        if ($input[0]) {
            $input.val(newPage);
        }
    }
    //修改显示列
    handleColumnChange(value) {
        //最后一项不能取消选中
        if (value.length == 0) {
            return
        }
        //按照原有columns的顺序处理
        const sortedValues = _.intersection(this.state.rawColumns.map(x => x.dataIndex), value);

        const finalColumns = sortedValues.map(x => this.state.rawColumns.find(item => item.dataIndex == x));
        const rawColumns = this.state.rawColumns.map(x => {
            x.show = true;
            if (sortedValues.indexOf(x.dataIndex) == -1) {
                x.show = false;
            }
            return x;
        })
        this.setState({
            finalColumns,
            rawColumns,
            checkAll: sortedValues.length == this.state.rawColumns.length,
            indeterminate: !!sortedValues.length && (sortedValues.length < this.state.rawColumns.length)
        });
    }
    //点击全选处理
    onCheckAllChange = (e) => {
        //不能全不选
        if (!e.target.checked) {
            return
        }
        this.setState({
            finalColumns: this.state.rawColumns,
            rawColumns: this.state.rawColumns.map(x => $.extend({}, x, { show: true })),
            indeterminate: false,
            checkAll: e.target.checked
        });
    }
    //点击保存按钮处理
    handleConfirm() {
        if (_.isFunction(this.props.setWebsiteConfig)) {
            this.props.setWebsiteConfig({
                [this.state.tableKey]: this.state.rawColumns.filter(x => x.show).map(x => x.dataIndex)
            }, result => {
                if (result) {
                    this.setState({
                        errorMsg: ""
                    });
                    this.handleBackClick();
                } else {
                    this.setState({
                        errorMsg: result.message || Intl.get("common.save.failed", "保存失败")
                    })
                }
            }, err => {
                this.setState({
                    errorMsg: err.message || Intl.get("common.save.failed", "保存失败")
                })
            });
        }
        
    }
    //点击背景关闭菜单
    handleBackClick() {
        this.setState({
            showColumnList: false
        })
    }
    columnsProcessor(props) {
        const tableKey = location.pathname + "?id=" + props.buttonIdRef;
        const { columns } = props;
        const websiteConfig = props.websiteConfig;
        let finalColumns = [];
        if (websiteConfig && websiteConfig[tableKey] && websiteConfig[tableKey].length > 0) {
            finalColumns = websiteConfig[tableKey].map(x => props.columns.find(item => item.dataIndex == x));
        } else {
            finalColumns = props.columns
        }
        const rawColumns = props.columns.map(x => {
            x.show = true;
            if (websiteConfig && websiteConfig[tableKey] && websiteConfig[tableKey].indexOf(x.dataIndex) == -1) {
                x.show = false;
            }
            return x
        })
        return {
            rawColumns,
            finalColumns,
            tableKey
        }
        
    }
    componentWillReceiveProps(newProps) {
        const { rawColumns, finalColumns } = this.columnsProcessor(newProps);
        this.setState({
            rawColumns,
            finalColumns
        });
    }
    render() {
        //将finalColumns作为最终render的参数传入Table
        const tableProps = $.extend({}, this.props, { columns: this.state.finalColumns });
        //取出Table所需的属性
        delete tableProps.dropLoad;
        //为需要排序的列添加类，以便监听点击事件
        tableProps.columns.forEach(x => {
            if (x.sorter) {
                x.className = x.className + " has-sorter";
            }
        })
        const parseNum = num => {
            if (num) {
                if (typeof num == "string") {
                    return Number(num.replace("px", ""));
                } else if (typeof num == "number") {
                    return num;
                }
            } else {
                return 0;
            }
        };
        const width = tableProps.columns.map(x => x.width || 0).reduce((preVal, nextVal) => {
            return parseNum(preVal) + parseNum(nextVal)
        });
        if (tableProps.scroll) {
            tableProps.scroll.x = width;
        }
        const renderTable = () => {
            //当传入handleScrollBottom函数时，调用下拉加载
            if (this.props.dropLoad && _.isFunction(this.props.dropLoad.handleScrollBottom)) {
                //下拉加载传入 出现滚动条容器的标识(selector)
                const scrollLoadProps = $.extend({ selector: "div.ant-table-body", width }, this.props.dropLoad);
                return (
                    <ScrollLoad {...scrollLoadProps}>
                        <Table
                            ref={table => this.table = table}
                            {...tableProps}
                        />
                    </ScrollLoad>
                )
            } else {
                return (
                    <Table
                        ref={table => this.table = table}
                        {...tableProps}
                    />
                )
            }
        }
        const columnsOptions = this.state.rawColumns.map(x => (
            {
                label: x.title,
                value: x.dataIndex
            }
        ));

        return (
            <div className="antc-table">
                {this.state.showColumnList ?
                    <div>
                        <div className="colums-back" onClick={this.handleBackClick.bind(this)}></div>
                        <div className="customize-colums">
                            <Checkbox
                                indeterminate={this.state.indeterminate}
                                onChange={this.onCheckAllChange}
                                checked={this.state.checkAll}
                            >
                                {Intl.get("authority.all.select", "全选")}
                            </Checkbox>
                            <CheckboxGroup
                                options={columnsOptions}
                                value={this.state.rawColumns.filter(x => x.show).map(x => x.dataIndex)}
                                onChange={this.handleColumnChange.bind(this)}
                            />
                            <div className="bar-bottom">
                                {this.state.errorMsg ?
                                    <Alert message={this.state.errorMsg} type="error" showIcon /> : null}
                                <Button type="primary" onClick={this.handleConfirm.bind(this)}>{Intl.get("common.save", "保存")}</Button>
                            </div>
                        </div>
                    </div> : null}
                {renderTable()}
            </div>
        )
    }
}

export default AntcTable;