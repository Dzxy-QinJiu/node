/**
 * 带放大镜图标的搜索输入框组件
 *
 * 参数说明：
 *
 *     type
 *
 *         搜索类型，格式为字符串，有两种类型，"input" 和 "select"
 *         "input"为普通输入框模式，在输入的同时进行搜索
 *         "select"为带下拉选项的模式，输入关键词后，需要再点一下下拉选项才进行搜索
 *
 *
 *     searchEvent
 *
 *         搜索事件，格式为一个可执行函数
 *
 *         type为"input"时，提供一个回调返回值：keyword
 *         keyword为当前输入的关键词
 *
 *         type为"select"时，提供两个回调返回值：keyword 和 field
 *         keyword为当前输入的关键词
 *         field为当前选中的搜索字段
 *
 *
 *     searchPlaceholder
 *
 *         输入框说明文字，格式为字符串
 *
 *
 *     searchOnTyped
 *
 *         是否在输入的同时进行搜索，格式为 true 或 false
 *
 *
 *     searchFields
 *
 *         搜索字段，type参数值为"select"时可用
 *         格式为一个字段对象组成的数组
 *         字段对象由字段中文名和字段名组成
 *         中文名用于构造下拉选项及在searchPlaceholder属性未设置时构造默认输入框说明文字
 *         字段名用于构造搜索条件
 *
 *         示例：
 *
 *         [
 *             {
 *                 name: "客户名",
 *                 field: "customer_name",
 *             },
 *             ...
 *         ]
 *
 *
 *      hasCloseBtn
 *
 *          是否展示关闭按钮，点击搜索按钮出现搜索框后，点击关闭按钮隐藏搜索框时使用
 */

require("./searchInput.less");
import { Select, Icon } from "antd";
import Trace from "LIB_DIR/trace";

let inputTimeOut = null;
const delayTime = 500;
const PropTypes = React.PropTypes;

const SearchInput = React.createClass({
    getDefaultProps: function () {
        return {
            type: "input",
            searchEvent: function () {},
            searchPlaceholder: "",
            searchFields: [],
            searchOnTyped: false,
            hasCloseBtn: false
        };
    },
    getInitialState: function () {
        let state = {};

        if (this.props.type === "select") {
            const searchFields = this.props.searchFields;
            const names = _.pluck(searchFields, "name");
            const fields = _.pluck(searchFields, "field");
            let placeholder = this.props.searchPlaceholder;
            if (!placeholder && names.length) {
                placeholder = names.length === 1 ? names[0] : names.join(" / ");
            }

            state = {
                keyword: "",
                optionNames: names,
                selectedField: "",
                searchFields: fields,
                placeholder: placeholder,
                formData: {}
            };
        }

        return state;
    },
    onKeywordChange: function (keyword) {
        const trimedKeyword = keyword.trim();

        //直接输入空格或在中文打字过程中时不进行处理
        if (!this.state.keyword && !trimedKeyword) return;

        this.state.keyword = keyword;

        //没有实际值时
        if (!trimedKeyword) {
            //清空搜索条件
            this.state.searchFields.forEach(field => {
                delete this.state.formData[field];
            });

            //清除选中状态
            this.state.selectedField = "";

            //清空关键词时触发搜索
            if (!keyword) {
                this.props.searchEvent("", "");
            }
        } else {
            //若设置了要求输入时即搜索则触发搜索
            if (this.props.searchOnTyped) {
                const searchField = this.state.selectedField || undefined;
                this.props.searchEvent(trimedKeyword, searchField);
            }
        }

        this.setState(this.state);
    },
    onKeywordSelect: function (value, option) {
        Trace.traceEvent(this.getDOMNode(),"按" + value + "搜索");
        const keyword = this.state.keyword.trim();
        const index = option.props.index;
        let formData = this.state.formData;
        const searchFields = this.state.searchFields;
        const selectedField = searchFields[index];
        formData[selectedField] = keyword;

        //记住选中项
        this.state.selectedField = selectedField;

        searchFields.forEach(field => {
            if (field !== selectedField) delete formData[field];
        });

        this.setState(this.state);

        //执行搜索
        this.props.searchEvent(keyword, selectedField);
    },
    searchEvent: function () {
        var _this = this;
        if (inputTimeOut) {
            clearTimeout(inputTimeOut);
        }
        inputTimeOut = setTimeout(function () {
            var searchContent = _this.refs.searchInput.value;
            _this.props.searchEvent(searchContent);
        }, delayTime);
    },
    onSearchButtonClick: function () {
        if (this.props.type === "input") {
            if (this.refs.searchInput.value.trim()) {
                this.searchEvent();
            }
        } else {
            const trimedKeyword = this.state.keyword.trim();

            if (trimedKeyword) {
                const searchField = this.state.selectedField || this.state.searchFields[0];

                this.state.formData = {};
                this.state.formData[searchField] = trimedKeyword;

                this.props.searchEvent(trimedKeyword, searchField);

                //若下拉菜单中没有选中项则将第一项设为高亮状态
                if (!this.state.selectedField) {
                    this.setState({selectedField: this.state.searchFields[0]});
                }
            }
        }
    },
    closeSearchInput: function () {
        if (this.props.type === "input"){
            //在销售首页的右侧列表，会将整个搜索框都隐藏掉
            if (this.props.closeSearchInput){
                this.props.closeSearchInput();
            }else{
                this.props.searchEvent();
            }
            this.refs.searchInput.value = "";
        }else if(this.props.type === "select") {
            this.setState({
                keyword:'',
                formData:{}
            });
            this.state.keyword = '';
            this.state.formData = {};
            this.props.searchEvent();
            Trace.traceEvent(this.getDOMNode(),"清除搜索条件");
        }
    },
    render: function () {
        let keywordOptions = [];

        if (this.props.type === "select" && this.state.keyword.trim()) {
            keywordOptions = this.state.optionNames.map((name, index) => {
                const className = this.state.searchFields[index] === this.state.selectedField ? "selected" : "";

                return <Option key={name} className={className}>根据 <b>{name}</b> 搜索</Option>;
            });
        }

        return (
            <div className="search-input-container">
                {this.props.type === "input" ? (
                    <input type="text" placeholder={this.props.searchPlaceHolder} ref="searchInput"
                           onKeyUp={this.searchEvent}
                           className="search-input"/>
                ) : (
                    <Select
                        combobox
                        filterOption={false}
                        placeholder={this.state.placeholder}
                        value={this.state.keyword}
                        onSearch={this.onKeywordChange}
                        onSelect={this.onKeywordSelect}
                    >
                        {keywordOptions}
                    </Select>
                )}
                {(this.props.type === "input" && this.refs.searchInput && this.refs.searchInput.value)||
                 (this.props.type === "select" && this.state.keyword)? (
                    <Icon type="cross-circle-o" className="search-icon" onClick={this.closeSearchInput}/>
                ) : (<Icon type="search" className="search-icon" onClick={this.onSearchButtonClick}/>
                )}
            </div>
        );
    }
});

SearchInput.propTypes = {
    type: PropTypes.string,
    searchEvent: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    searchFields: PropTypes.array,
    searchOnTyped: PropTypes.bool,
    hasCloseBtn: PropTypes.bool
};

module.exports = SearchInput;