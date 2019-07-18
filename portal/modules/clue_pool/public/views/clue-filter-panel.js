import { FilterList } from 'CMP_DIR/filter';
import { AntcDatePicker as DatePicker } from 'antc';
import FilterAction from '../action/filter-action';
import clueFilterStore from '../store/filter-store';
import cluePoolAction from '../action';
import {clueStartTime} from '../utils/clue-pool-utils';

import userData from 'PUB_DIR/sources/user-data';

class ClueFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clueLeadingArray: this.props.clueLeadingArray,
            clueSourceArray: this.props.clueSourceArray,
            accessChannelArray: this.props.accessChannelArray,
            clueClassifyArray: this.props.clueClassifyArray,
            clueProvinceArray: this.props.clueProvinceArray,
            ...clueFilterStore.getState(),
        };
    }

    onStoreChange = () => {
        this.setState(clueFilterStore.getState());
    };
    componentDidMount = () => {
        clueFilterStore.listen(this.onStoreChange);
    };
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            clueLeadingArray: nextProps.clueLeadingArray,
            clueSourceArray: nextProps.clueSourceArray,
            accessChannelArray: nextProps.accessChannelArray,
            clueClassifyArray: nextProps.clueClassifyArray,
            clueProvinceArray: nextProps.clueProvinceArray,
        });
    };
    componentWillUnmount = () => {
        clueFilterStore.unlisten(this.onStoreChange);
    };

    handleFilterChange = (data) => {
        cluePoolAction.setClueInitialData();
        data.forEach(item => {
            let groupId = item.groupId;
            let data = item.data;
            // 线索来源
            if (groupId === 'clue_pool_source'){
                FilterAction.setFilterClueSoure(data);
            }else if (groupId === 'clue_pool_access'){ // 线索接入渠道
                FilterAction.setFilterClueAccess(data);
            }else if (groupId === 'clue_pool_classify'){ // 线索分类
                FilterAction.setFilterClueClassify(data);
            }else if (groupId === 'clue_pool_province'){
                //线索地域
                FilterAction.setFilterClueProvince(data);
            } else if (groupId === 'clue_pool_user_name'){
                FilterAction.setFilterClueUsername(data);
            }
        });

        setTimeout(() => {
            this.props.getClueList();
        });
    };
    onSelectDate = (start_time, end_time) => {
        if (!start_time) {
            //为了防止开始时间不传，后端默认时间是从1970年开始的问题
            start_time = clueStartTime;
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        FilterAction.setTimeRange({start_time, end_time});
        cluePoolAction.setClueInitialData();
        setTimeout(() => {
            this.props.getClueList();
        });
    };
    renderTimeRangeSelect = () => {
        return(
            <div className="time-range-wrap">
                <span className="consult-time">{Intl.get('common.login.time', '时间')}</span>
                <DatePicker
                    disableDateAfterToday={true}
                    range={this.state.timeType}
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
        const clueLeadingArray = this.state.clueLeadingArray;
        //线索来源
        const clueSourceArray = this.state.clueSourceArray;
        //接入渠道
        const accessChannelArray = this.state.accessChannelArray;
        //线索分类
        const clueClassifyArray = this.state.clueClassifyArray;
        const clueProvinceList = this.state.clueProvinceArray;

        const advancedData = [
            {
                groupName: Intl.get('clue.analysis.source', '来源'),
                groupId: 'clue_pool_source',
                data: clueSourceArray.map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                groupId: 'clue_pool_access',
                data: accessChannelArray.map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('clue.customer.classify', '线索分类'),
                groupId: 'clue_pool_classify',
                data: clueClassifyArray.map(x => ({
                    name: x,
                    value: x
                }))
            },{
                groupName: Intl.get('crm.96', '地域'),
                groupId: 'clue_pool_province',
                data: clueProvinceList.map(x => ({
                    name: x,
                    value: x
                }))
            }];
        //非普通销售才有销售角色和团队
        if (!userData.getUserData().isCommonSales) {
            advancedData.unshift(
                {
                    groupName: Intl.get('crm.6', '负责人'),
                    groupId: 'clue_pool_user_name',
                    singleSelect: true,
                    data: _.map(clueLeadingArray, x => ({
                        name: x,
                        value: x
                    }))
                }
            );
        }

        return (
            <div data-tracename="筛选">
                <div className="clue-filter-panel">
                    <FilterList
                        hideAdvancedTitle={true}
                        ref={filterList => this.filterList = filterList}
                        advancedData={advancedData}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        renderOtherDataContent={this.renderTimeRangeSelect}
                        hasSettedDefaultCommonSelect={true}
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
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

    },
    style: {},
    showSelectTip: false
};
ClueFilterPanel.propTypes = {
    clueLeadingArray: PropTypes.array,
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    clueProvinceArray: PropTypes.array,
    getClueList: PropTypes.func,
    style: PropTypes.object,
    showSelectTip: PropTypes.bool
};

export default ClueFilterPanel;
