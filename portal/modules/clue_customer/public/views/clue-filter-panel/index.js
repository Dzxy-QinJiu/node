/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var FilterAction = require('../../action/filter-action');
var FilterStore = require('../../store/filter-store');
import { FilterList } from 'CMP_DIR/filter';
import {CLUE_DIFF_TYPE} from '../../utils/clue-customer-utils';
import DatePicker from 'CMP_DIR/datepicker';
class ClueFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...FilterStore.getState(),
        };
    }
    onStoreChange = () => {
        this.setState(FilterStore.getState());
    };
    componentDidMount = () => {
        FilterStore.listen(this.onStoreChange);
    };
    componentWillUnmount = () => {
        FilterStore.unlisten(this.onStoreChange);
    };

    handleFilterChange = (data) => {
        console.log(data);
        data.forEach(item => {
            if (item.groupId) {
                //线索状态
                if (item.groupId === 'clue_status'){
                    //如果选中的是无效状态
                    if (_.get(item,'data[0]') && _.get(item,'data[0].value') === 'avaibility'){
                        FilterAction.setFilterClueAvailbility();
                    }else{
                        FilterAction.setFilterType( _.get(item,'data'));
                    }
                }else if (item.groupId === 'clue_source' && _.get(item,'data')){
                    //线索来源
                    FilterAction.setFilterClueSoure( _.get(item,'data'));
                }else if (item.groupId === 'clue_access'){
                    //线索接入渠道
                    FilterAction.setFilterClueAccess( _.get(item,'data'));
                }else if (item.groupId === 'clue_classify'){
                    //线索分类
                    FilterAction.setFilterClueClassify( _.get(item,'data'));
                }
            }
        });

        setTimeout(() => {
            this.props.getClueList();
        });
    };
    onSelectDate = (start_time, end_time) => {
        if (!start_time) {
            //为了防止开始时间不传，后端默认时间是从1970年开始的问题
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        FilterAction.setTimeRange({start_time: start_time, end_time: end_time});
        setTimeout(() => {
            this.props.getClueList();
        });
    };
    renderTimeRangeSelect = () => {
        return(
            <div className="time-range-wrap">
                <span className="consult-time">{Intl.get('clue.analysis.consult.time', '咨询时间')}</span>
                <DatePicker
                    disableDateAfterToday={true}
                    range="week"
                    onSelect={this.onSelectDate}>
                    <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                    <DatePicker.Option
                        value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                    <DatePicker.Option
                        value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                    <DatePicker.Option
                        value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                    <DatePicker.Option
                        value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                    <DatePicker.Option
                        value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                    <DatePicker.Option
                        value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                </DatePicker>
            </div>
        );
    };
    render(){
        //线索来源
        const clueSourceArray = this.props.clueSourceArray;
        //接入渠道
        const accessChannelArray = this.props.accessChannelArray;
        //线索分类
        const clueClassifyArray = this.props.clueClassifyArray;
        var filterClueStatus = _.cloneDeep(this.state.filterClueStatus);
        filterClueStatus = _.filter(filterClueStatus, item => {
            return item.value;
        });
        //加上无效线索的筛选
        filterClueStatus.push({
            name: Intl.get('sales.clue.is.enable', '无效'),
            value: 'avaibility',
        });
        const advancedData = [
            {
                groupName: Intl.get('clue.filter.clue.status','线索状态'),
                groupId: 'clue_status',
                singleSelect: true,
                hideClearBtn: true,
                data: filterClueStatus,
            },{
                groupName: Intl.get('crm.sales.clue.source', '线索来源'),
                groupId: 'clue_source',
                data: _.drop(clueSourceArray).map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                groupId: 'clue_access',
                data: _.drop(accessChannelArray).map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('clue.customer.classify', '线索分类'),
                groupId: 'clue_classify',
                data: _.drop(clueClassifyArray).map(x => ({
                    name: x,
                    value: x
                }))
            }];

        return (
            <div data-tracename="筛选">
                <div className="clue-filter-panel">
                    <FilterList
                        advancedData={advancedData}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        hideAdvancedTitle={true}
                        renderOtherDataContent={this.renderTimeRangeSelect}
                    />
                </div>
            </div>
        );
    }
}
ClueFilterPanel.defaultProps = {
    clueSourceArray: [],
    accessChannelArray: [],
    clueClassifyArray: [],
    getClueList: function() {

    }
};
ClueFilterPanel.propTypes = {
    clueSourceArray: React.PropTypes.object,
    accessChannelArray: React.PropTypes.object,
    clueClassifyArray: React.PropTypes.object,
    getClueList: React.PropTypes.func,
};

export default ClueFilterPanel;
