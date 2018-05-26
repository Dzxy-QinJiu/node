import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem} from 'rc-menu';
require("./index.less");
var classNames = require("classnames");
var immutable = require("immutable");
//键盘按键
var KeyCode = {
    DOWN: 40,
    UP: 38,
    ENTER: 13
};
//布局使用的高度
var LAYOUT = {
    ITEM_HEIGHT: 32,
    MAX_HEIGHT: 250
};
/**
 * 显示一个搜索组件
 * <SearchList
     list={[{"name":"A","value":"A"},{"name":"B","value":"B"}]}
     onSelect={function(a) {console.log(a)}}
 >
 </SearchList>
 */
var SearchList = React.createClass({
    //唯一id，做相对定位用
    searchListId: _.uniqueId("oplate-search-list"),
    //React组件的名称
    displayName: 'SearchList',
    //获取默认属性
    getDefaultProps: function() {
        return {
            //数组
            list: [],
            //需要指定宽度
            width: 120,
            //选中的回调函数
            onSelect: function() {},
            //样式名
            className: "",
            //内联样式
            style: {},
            //展示内容的字段
            nameProp: 'name',
            //没有找到的提示
            notFoundContent: Intl.get("common.not.found","无法找到"),
            //暂无数据提示
            noDataCoutent: Intl.get("common.no.data","暂无数据")
        };
    },
    //为传进来的list数据，添加一个uid属性
    expandUniqueKeyForList: function(list) {
        return list.map(function(obj) {
            var expandObj = {
                uid: _.uniqueId("search-list-key"),
                data: obj
            };
            return expandObj;
        });
    },
    //获取组件初始状态
    getInitialState: function() {
        return {
            //全部数据，每一个都添加了一个uid属性，用来辅助查找原始数据
            itemLists: [],
            //根据关键词过滤之后，显示的结果
            resultLists: [],
            //关键词
            keyword: '',
            //选中的当前下标
            selectedIdx: 0
        };
    },
    //根据dropdown的方向设置SearchList的class，以便调整搜索组件的样式
    setDirectionClassForSearchList: function() {
        var isTopDirection = $(".ant-dropdown",this.refs.wrap).hasClass("ant-dropdown-placement-topLeft");
        var isBottomDirection = $(".ant-dropdown",this.refs.wrap).hasClass("ant-dropdown-placement-bottomLeft");
        if(isTopDirection) {
            $(this.refs.wrap).removeClass("bottom-direction").addClass("top-direction");
        }
        if(isBottomDirection) {
            $(this.refs.wrap).removeClass("top-direction").addClass("bottom-direction");
        }
    },
    //组件加载完毕时触发
    componentDidMount: function() {
        var itemLists = this.expandUniqueKeyForList(this.props.list);
        this.setState({
            itemLists: itemLists
        });
        this.search({itemLists: itemLists});
        this.setDirectionClassForSearchList();
    },
    //组件更新时触发
    componentDidUpdate: function() {
        this.setDirectionClassForSearchList();
    },
    //当组件重新接收属性时触发
    componentWillReceiveProps: function(nextProps) {
        if(!immutable.is(this.props.list , nextProps.list)) {
            var itemLists = this.expandUniqueKeyForList(nextProps.list);
            this.setState({
                itemLists: itemLists
            });
            this.search({itemLists: itemLists});
        }
    },
    //当菜单被选中时，触发
    onMenuSelect: function(info) {
        var target = _.find(this.state.itemLists, function(item) {
            return item.uid === info.key;
        });
        if(target) {
            var resultObj = target.data;
            this.props.onSelect(resultObj);
        }
    },
    //输入关键字后，进行搜索
    search: function(args) {
        var keyword = args && 'keyword' in args ? args.keyword : this.state.keyword;
        var itemLists = args && 'itemLists' in args ? args.itemLists : this.state.itemLists;
        if(!keyword) {
            return this.setState({
                keyword: '',
                resultLists: itemLists
            });
        }
        keyword = keyword.toLowerCase();
        var nameProp = this.props.nameProp;
        var resultLists = itemLists.filter(function(obj) {
            if(obj.data[nameProp].toLowerCase().indexOf(keyword) >= 0) {
                return true;
            }
        });
        this.setState({
            selectedIdx: 0,
            keyword: keyword,
            resultLists: resultLists
        });
    },
    keywordValueChange: function(event) {
        var keyword = event.target.value;
        if(keyword !== this.state.keyword) {
            this.setState({
                keyword: keyword
            });
            this.search({keyword: keyword});
        }
    },
    //重新按下
    keyDownPress: function(event) {
        if(!this.state.resultLists.length) {
            return;
        }
        var keyCode = event.keyCode;
        var idx = this.state.selectedIdx;
        var max = this.state.resultLists.length;
        if(keyCode !== KeyCode.DOWN && keyCode !== KeyCode.UP && keyCode !== KeyCode.ENTER) {
            return;
        }
        event.preventDefault();
        if(keyCode === KeyCode.ENTER) {
            var target = this.state.resultLists[idx];
            if(target) {
                var result = target.data;
                this.props.onSelect(result);
            }
            return;
        }
        var direction = "down";
        if(keyCode === KeyCode.UP) {
            direction = "up";
        }
        if(direction === "down") {
            idx++;
            if(idx >= max) {
                idx = 0;
            }
        } else {
            idx--;
            if(idx === -1) {
                idx = max - 1;
            }
        }
        this.setState({
            selectedIdx: idx
        } , function() {
            var ul = $(".oplate-search-list-menu",this.refs.wrap)[0];
            var elm = $("li.ant-dropdown-menu-item",ul)[idx];
            var pos = $(elm).position();
            if(pos.top >= 0 && (pos.top + LAYOUT.ITEM_HEIGHT) <= LAYOUT.MAX_HEIGHT) {
                return;
            }
            ul.scrollTop = 0;
            pos = $(elm).position();
            var targetScrollTop = pos.top;
            if(direction === "down") {
                if((targetScrollTop + LAYOUT.ITEM_HEIGHT - LAYOUT.MAX_HEIGHT) >= 0) {
                    targetScrollTop = targetScrollTop + LAYOUT.ITEM_HEIGHT - LAYOUT.MAX_HEIGHT;
                }
            }
            ul.scrollTop = targetScrollTop;
        });
    },
    onMouseEnterItem: function(idx) {
        this.setState({
            selectedIdx: idx
        });
    },
    render: function() {
        var cls = classNames("oplate-search-list",this.props.className);
        var nameProp = this.props.nameProp;
        var notFound = this.state.resultLists.length === 0 && this.state.itemLists.length > 0;
        var noData = this.state.itemLists.length === 0;
        var selectedIdx = this.state.selectedIdx;
        var _this = this;
        var menuLists = this.state.resultLists.map(function(obj,idx) {
            var cls = classNames({active: selectedIdx === idx});
            return (
                <MenuItem
                    key={obj.uid}
                    className={cls}
                    onMouseEnter={_this.onMouseEnterItem.bind(_this,idx)}
                >
                    {obj.data[nameProp]}
                </MenuItem>
            );
        });
        if(notFound) {
            menuLists.push(<MenuItem key="notFound" disabled={true}>{this.props.notFoundContent}</MenuItem>);
        }
        if(noData) {
            menuLists.push(<MenuItem key="noData" disabled={true}>{this.props.notFoundContent}</MenuItem>);
        }
        var menu = (
            <Menu
                prefixCls="ant-menu"
                onSelect={this.onMenuSelect}
                className="oplate-search-list-menu"
                style={{width: this.props.width}}>
                {menuLists}
            </Menu>
        );
        var _this = this;
        return (
            <span className={cls} style={{width: this.props.width}} id={this.searchListId} ref="wrap">
                <Dropdown
                    getPopupContainer={function(){return document.getElementById(_this.searchListId);}}
                    overlay={menu}
                    visible={true}
                    prefixCls="ant-dropdown">
                    <div className="input-wrap">
                        <input type="text"
                            onKeyDown={this.keyDownPress}
                            className="searchbox"
                            value={this.state.keyword}
                            autoFocus={true}
                            onChange={this.keywordValueChange}/>
                    </div>
                </Dropdown>
            </span>

        );
    }
});

module.exports = SearchList;