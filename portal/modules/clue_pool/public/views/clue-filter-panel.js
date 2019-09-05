import { FilterList } from 'CMP_DIR/filter';
import { AntcDatePicker as DatePicker } from 'antc';
import FilterAction from '../action/filter-action';
import clueFilterStore from '../store/filter-store';
import cluePoolAction from '../action';
import {clueStartTime} from '../utils/clue-pool-utils';
import userData from 'PUB_DIR/sources/user-data';

const COMMON_OTHER_ITEM = 'otherSelectedItem';
const SIMILAR_CUSTOMER = '有相似客户';
const SIMILAR_CLUE = '有相似线索';
var otherFilterArray = [{
    name: Intl.get( 'clue.has.similar.customer','有相似客户'),
    value: SIMILAR_CUSTOMER
},{
    name: Intl.get( 'clue.has.similar.clue','有相似线索'),
    value: SIMILAR_CLUE
}
];

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
        FilterAction.getTeamList();
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
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            FilterAction.setExistedFiled();
            FilterAction.setUnexistedFiled();
            FilterAction.setSimilarFiled();
        }
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
            } else if(groupId === 'clue_pool_sales_team_id') {
                FilterAction.setFilterClueTeam(data);
            } else if (groupId === COMMON_OTHER_ITEM){
                if(item.value === SIMILAR_CUSTOMER){
                    FilterAction.setExistedFiled();
                    FilterAction.setUnexistedFiled();
                    FilterAction.setSimilarFiled(SIMILAR_CUSTOMER);
                }else if(item.value === SIMILAR_CLUE){
                    FilterAction.setExistedFiled();
                    FilterAction.setUnexistedFiled();
                    FilterAction.setSimilarFiled(SIMILAR_CLUE);
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
        const commonData = otherFilterArray.map(x => {
            x.readOnly = true;
            x.groupId = COMMON_OTHER_ITEM;
            x.groupName = Intl.get('crm.186', '其他');
            x.data = [{
                name: x.name,
                value: x.value,
                groupId: COMMON_OTHER_ITEM,
                groupName: Intl.get('crm.186', '其他'),
                data: [{
                    name: x.name,
                    value: x.value,
                    groupId: COMMON_OTHER_ITEM,
                    groupName: Intl.get('crm.186', '其他'),
                }]
            }];
            x.plainFilterList = [{
                name: x.name,
                value: x.value
            }];
            return x;
        });
        const advancedData = [
            {
                groupName: Intl.get('crm.6', '负责人'),
                groupId: 'clue_pool_user_name',
                singleSelect: true,
                data: _.map(clueLeadingArray, x => ({
                    name: x,
                    value: x
                }))
            },
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
        //非普通销售才有销团队
        if (!userData.getUserData().isCommonSales) {
            advancedData.unshift(
                {
                    groupName: Intl.get('user.sales.team', '销售团队'),
                    groupId: 'clue_pool_sales_team_id',
                    data: _.drop(this.state.teamList).map(x => ({
                        name: x.group_name,
                        value: x.group_id,
                    }))
                }
            );
        }

        return (
            <div data-tracename="筛选">
                <div className="clue-filter-panel">
                    <FilterList
                        ref={filterList => this.filterList = filterList}
                        commonData={commonData}
                        advancedData={advancedData}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        renderOtherDataContent={this.renderTimeRangeSelect}
                        setDefaultSelectCommonFilter={this.setDefaultSelectCommonFilter}
                        hasSettedDefaultCommonSelect={true}
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
                        showAdvancedPanel={true}
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
