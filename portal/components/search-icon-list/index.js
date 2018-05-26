require("./index.less");
const img_src = require("../../modules/common/public/image/user-info-logo.jpg");
import {Input,Icon,Checkbox,Alert} from 'antd';

import immutable from 'immutable';
import classNames from 'classnames';
import SearchInput from '../../components/searchInput';
const PropTypes = React.PropTypes;

class SearchIconList extends React.Component {
    constructor(props) {
        super(props);
        const selectedIds = _.pluck(props.selectedList, props.id_field);

        const totalList = this.expandListProp(props.totalList, selectedIds);
        this.searchCount = totalList.length;
        this.state = {
            keyword : "",
            totalList : totalList,
            selectedList : props.selectedList,
            onlyShowSelected : false,
        };
    }
    getSearchResult(args) {
        let keyword = args && 'keyword' in args ? args.keyword : this.state.keyword;
        if(!_.isString(keyword)) {
            keyword = '';
        }
        keyword = keyword.toLowerCase();
        const totalList = args && 'totalList' in args ? args.totalList : this.state.totalList;
        const onlyShowSelected = args && 'onlyShowSelected' in args ? args.onlyShowSelected : this.state.onlyShowSelected;
        const searchFields = this.props.search_fields;
        let count = 0;
        _.each(totalList , (item) => {
            const entity = item.entity;
            return _.some(searchFields , function(field) {
                let searchContent = entity && entity[field] || '';
                if(searchContent.toString().toLowerCase().indexOf(keyword) >= 0) {
                    item.searched = true;
                    if(onlyShowSelected) {
                        if(item.selected) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                } else {
                    item.searched = false;
                }
            });
        });
        this.searchCount = count;
        return totalList;
    }
    //将数组进行扩展，添加selected属性
    /**
     * @param totalList  数据列表
     * @param selectedList 已经选中的id数组
     */
    expandListProp(totalList , selectedList) {
        if(!_.isArray(selectedList) || !selectedList[0]) {
            return _.map(totalList , (obj)=> {
                return {
                    selected : false,
                    entity : obj,
                    searched : true,
                    image : null
                };
            });
        } else {
            const id_field = this.props.id_field;
            return _.map(totalList , (obj) => {
                const id = obj[id_field];
                return {
                    selected : selectedList.indexOf(id) >= 0,
                    entity : obj,
                    searched : true,
                };
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        if(!immutable.is(nextProps.totalList , this.props.totalList)) {
            const id_field = this.props.id_field;
            const selectedList = nextProps.selectedList || this.state.selectedList;
            const selectedIds = _.pluck(selectedList, id_field);
            let totalList = this.expandListProp(nextProps.totalList , selectedIds);
            totalList = this.getSearchResult({
                totalList : totalList
            });
            this.setState({totalList, selectedList});
        }
    }
    toggleSelectedItem(obj) {
        let selectedList = this.state.selectedList;
        const id_field = this.props.id_field;
        const id = obj[id_field];
        const exist = _.some(selectedList , function(item) {return item[id_field] === id;});
        if(exist) {
            selectedList = _.filter(selectedList, function(item) {return item[id_field] !== id;});
        } else {
            selectedList = selectedList.concat(obj);
        }
        let totalList = this.state.totalList;
        _.some(totalList , function(item) {
            if(item.entity[id_field] === id) {
                item.selected = !item.selected;
                return true;
            }
        });
        totalList = this.getSearchResult();
        this.setState({selectedList,totalList});
        this.props.onItemsChange(selectedList);
    }
    toggleOnlyShowSelected(event) {
        const onlyShowSelected = event.target.checked;
        const totalList = this.getSearchResult({onlyShowSelected});
        this.setState({onlyShowSelected});
    }
    searchInputChange(keyword) {
        keyword = keyword ? keyword.trim() : '';
        const totalList = this.getSearchResult({keyword});
        this.setState({totalList,keyword});
    }
    render() {
        const id_field = this.props.id_field;
        const name_field = this.props.name_field;
        const onlyShowSelected = this.state.onlyShowSelected;
        return (
            <div className="search-icon-list">
                <div className="search-icon-list-header clearfix">
                    <div className="search-wrap pull-left">
                        <SearchInput
                            ref="searchInput"
                            type="input"
                            searchPlaceHolder={Intl.get("user.keyword.filter","输入关键词筛选")}
                            searchOnTyped={true}
                            searchEvent={this.searchInputChange.bind(this)}
                        />
                    </div>
                    <div className="pull-right only_show_choosen">
                        <label>
                            <Checkbox defaultChecked={false} onChange={this.toggleOnlyShowSelected.bind(this)}/>
                            <span>
                                {Intl.get("user.show.select","只显示选中")}
                            </span>
                        </label>
                    </div>
                </div>
                <div className="search-icon-list-content custom-scrollbar clearfix">
                    {
                        !this.searchCount ? (
                            <Alert message={this.props.notFoundContent} type="info" showIcon/>
                        ) : null
                    }
                    {
                        this.state.totalList.map((item)=> {
                            const obj = item.entity;
                            const id = obj[id_field];
                            const name = obj[name_field];
                            let hide = !item.searched;
                            if(!hide && onlyShowSelected) {
                                hide = !item.selected;
                            }
                            const cls = classNames({
                                "icon-item" : true,
                                "selected" : item.selected,
                                "icon-hide" :  hide
                            });

                            return (
                                <div className={cls} onClick={this.toggleSelectedItem.bind(this,obj)} key={id}>
                                    <div>{name}</div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

function noop(){}

SearchIconList.defaultProps = {
    totalList : [],
    selectedList : [],
    name_field : "app_name",
    id_field : "app_id",
    search_fields : ["app_name"],
    notFoundContent : Intl.get("user.no.related.app","暂无符合条件的应用"),
    onItemsChange : noop
};

SearchIconList.propTypes = {
    totalList : PropTypes.array,
    selectedList : PropTypes.array,
    name_field : PropTypes.string,
    search_fields : PropTypes.array,
    onItemsChange : PropTypes.func,
    notFoundContent : PropTypes.string
};

export default SearchIconList;
