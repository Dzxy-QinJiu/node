const PropTypes = require('prop-types');
var React = require('react');
/**
 * Created by wangliping on 2017/10/13.
 * 一直展示的选择框，类似可搜索的Select,但下拉框一直展示不隐藏
 * 批量修改客户行业中有应用
 * 用法： dataList=[{name:"计算机",value:"computer"},{name:"金融",value:"finance"}]
 *       <AlwaysShowSelect
 *          placeholder={Intl.get("crm.22", "请选择行业")}
 *          value={this.state.selected_industries.join(',')}
 *          onChange={this.industryChange}
 *          notFoundContent={dataList.length ? Intl.get("crm.23", "无相关行业") : Intl.get("crm.24", "暂无行业")}
 *          dataList={dataList}
 *          hasClearOption= {false}
 *       >
 */
require('./index.less');
import {Input, Radio} from 'antd';
const RadioGroup = Radio.Group;
import classNames from 'classnames';
let selectTimeout = null;
class AlwaysShowSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || '',
            searchVal: '',
            isSearch: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value || ''
        });
    }

    //选择某一项时
    onSelectChange = (data) => {
        this.props.onChange(data.value);
        //把选中项的名称也传出去
        this.props.getSelectContent(data.name);
        if(selectTimeout){
            clearTimeout(selectTimeout);
        }
        this.setState({value: data.value || '', isSearch: false});
    };
    //输入内容进行搜索时
    onSearch = (e) => {
        let searchVal = e.target.value;
        this.setState({
            value: '',
            searchVal: searchVal
        });
    };
    //输入框获取焦点时
    inputFocus = () => {
        this.setState({isSearch: true, value: '', searchVal: ''});
        this.props.onInputFocus();
    };
    //获取选择下拉选项
    getSelectOptions = (dataList) => {
        if (dataList.length) {
            let options = [];
            _.each(dataList, (data, index) => {
                let className = classNames('select-item', {'item-active': data.value === this.state.value});
                var splitArr = data.name.split('-');
                var dataDsp = data.name;
                if (_.isArray(splitArr) && splitArr.length){
                    dataDsp = <span>
                        <span className="sales-name">{splitArr[0]}</span>
                        {splitArr[1] ?
                            <span>
                                <span>-</span>
                                <span className="team-name">{splitArr[1]}</span>
                            </span> : null}
                    </span>;
                }
                let selectOption = (<li className={className} key={index}
                    onClick={this.onSelectChange.bind(this, data)}>
                    <Radio value={data.value}>
                        {dataDsp}
                    </Radio>
                </li>);
                options.push(selectOption);
            });
            if (this.props.hasClearOption) {//有清空选择的选项
                let className = classNames('select-item', {'item-active': !this.state.value});
                options.unshift(<li className={className}
                    onClick={this.onSelectChange.bind(this, {name: '', value: ''})}>
                    <Radio value=''>
                    &nbsp;
                    </Radio>
                </li>);
            }
            return options;
        } else {
            return (<li className="select-item-no-content">
                {this.props.notFoundContent}
            </li>);
        }
    };
    render() {
        //获取搜索后的列表数据
        let dataList = _.filter(this.props.dataList, data => {
            //忽略英文单词中的大小写
            let nameIgnoreCase = _.toUpper(data.name);
            let searchValIgnoreCase = _.toUpper(this.state.searchVal);

            return nameIgnoreCase.indexOf(searchValIgnoreCase) !== -1;
        });
        let inputVal = '';//输入框中显示的内容
        if (this.state.isSearch) {
            //搜索状态下展示输入的搜索内容
            inputVal = this.state.searchVal;
        } else {
            //非搜索状态下展示选择项的内容
            let findItem = _.find(dataList, data => data.value === this.state.value);
            if (findItem) {
                inputVal = findItem.name;
            }
        }
        return (
            <div className="always-show-select-container">
                <div className="select-input">
                    <Input placeholder={this.props.placeholder}
                        value={inputVal}
                        onChange={this.onSearch}
                        onFocus={this.inputFocus}
                    />
                </div>
                <ul className="select-options">
                    <RadioGroup value={this.state.value}>
                        {this.getSelectOptions(dataList)}
                    </RadioGroup>
                </ul>
            </div>
        );
    }
}
AlwaysShowSelect.defaultProps = {
    placeholder: '',
    value: '',
    hasClearOption: false,//是否有清空选择的选项
    dataList: [],//由{name：展示的内容,value：选择后需要保存的值}组成的下拉列表
    notFoundContent: Intl.get('common.no.data', '暂无数据'),//未搜索到或列表为空时的提示信息
    onChange: function() {
    },
    getSelectContent: function() {

    },//取到所展示的内容
    onInputFocus: function() {

    }
};
AlwaysShowSelect.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    hasClearOption: PropTypes.bool,
    dataList: PropTypes.object,
    notFoundContent: PropTypes.string,
    onChange: PropTypes.func,
    getSelectContent: PropTypes.func,
    onInputFocus: PropTypes.func,
};
export default AlwaysShowSelect;