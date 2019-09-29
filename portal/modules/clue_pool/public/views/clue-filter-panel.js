import { FilterList } from 'CMP_DIR/filter';
import FilterAction from '../action/filter-action';
import clueFilterStore from '../store/filter-store';
import cluePoolAction from '../action';
import {clueStartTime} from '../utils/clue-pool-utils';
import userData from 'PUB_DIR/sources/user-data';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import {
    COMMON_OTHER_ITEM,
    SIMILAR_CUSTOMER,
    SIMILAR_CLUE,
    sourceClassifyArray
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';

let otherFilterArray = [
    {
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
            } else if(groupId === 'source_classify') {
                FilterAction.setFilterSourceClassify(data);
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
        //今天之后的日期不可以选
        disabledDate = (current) => {
            return current > moment().endOf('day');
        };
        changeRangePicker = (date, dateString) => {
            if (!_.get(date,'[0]')){
                FilterAction.setTimeRange({start_time: clueStartTime, end_time: moment().endOf('day').valueOf(), range: 'all'});
            }else{
                FilterAction.setTimeRange({start_time: moment(_.get(date, '[0]')).startOf('day').valueOf(), end_time: moment(_.get(date, '[1]')).endOf('day').valueOf(), range: ''});
            }
            cluePoolAction.setClueInitialData();
            setTimeout(() => {
                this.props.getClueList();
            });
        };
    renderTimeRangeSelect = () => {
        return(
            <div className="time-range-wrap">
                <span className="consult-time">{Intl.get('common.login.time', '时间')}</span>
                <RangePicker
                    disabledDate={this.disabledDate}
                    onChange={this.changeRangePicker}/>
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
        const advancedData = [{
            groupName: Intl.get('crm.96', '地域'),
            groupId: 'clue_pool_province',
            data: clueProvinceList.map(x => ({
                name: x,
                value: x
            }))
        }];
        //非销售角色才有来源、渠道、分类筛选项
        if(!isSalesRole()) {
            advancedData.unshift(
                {
                    groupName: Intl.get('clue.analysis.source', '来源'),
                    groupId: 'clue_source',
                    data: clueSourceArray.map(x => ({
                        name: x,
                        value: x
                    }))
                },{
                    groupName: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                    groupId: 'clue_access',
                    data: accessChannelArray.map(x => ({
                        name: x,
                        value: x
                    }))
                },{
                    groupName: Intl.get('clue.customer.classify', '线索分类'),
                    groupId: 'clue_classify',
                    data: clueClassifyArray.map(x => ({
                        name: x,
                        value: x
                    }))
                }
            );
        }
        advancedData.unshift({
            groupName: Intl.get('crm.6', '负责人'),
            groupId: 'clue_pool_user_name',
            singleSelect: true,
            data: _.map(clueLeadingArray, x => ({
                name: x,
                value: x
            }))
        }, {
            groupName: Intl.get('crm.clue.client.source', '集客方式'),
            groupId: 'source_classify',
            data: sourceClassifyArray.map(x => ({
                name: x.name,
                value: x.value
            }))
        });
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
                        toggleList={this.props.toggleList}
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
    showSelectTip: false,
    toggleList: function() {

    },
};
ClueFilterPanel.propTypes = {
    clueLeadingArray: PropTypes.array,
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    clueProvinceArray: PropTypes.array,
    getClueList: PropTypes.func,
    style: PropTypes.object,
    showSelectTip: PropTypes.bool,
    toggleList: PropTypes.func,
};

export default ClueFilterPanel;
