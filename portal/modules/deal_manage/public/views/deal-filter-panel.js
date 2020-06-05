/**
 * Created by hzl on 2020/6/5.
 */
import { FilterList } from 'CMP_DIR/filter';
import { selectType } from 'PUB_DIR/sources/utils/consts';

class DealFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    componentDidMount = () => {

    };
    componentWillReceiveProps = (nextProps) => {
    };


    handleFilterChange = (data) => {

        data.forEach(item => {
            if (item.groupId) {
                // 需要处理自定义字段的数据结构
                const customizedVariables = _.get(this.props.opportunityCustomFieldData, '[0].customized_variables');
                let custom_variables = {};
                // 自定义字段名称
                let customFieldName = _.map(customizedVariables, 'name');
                if (_.includes(customFieldName, item.groupId)) {
                    custom_variables[item.groupId] = item.data.map(x => x.value);
                }
            }
        });

        setTimeout(() => {
            this.props.getClueList();
        });
    };





    render(){
        const advancedData = [];
        const customizedVariables = _.get(this.props.opportunityCustomFieldData, '[0].customized_variables');
        _.each(customizedVariables, item => {
            const fieldType = _.get(item, 'field_type');
            const name = _.get(item, 'name');
            const selectValues = _.get(item, 'select_values');
            // 是否是选择类型（现在先做单选、多选类型的）
            if (_.includes(selectType, fieldType)) {
                let customField = {
                    groupName: name,
                    groupId: name,
                    data: _.map(selectValues, x => ({
                        name: x,
                        value: x
                    }))
                };
                // 单选
                if (_.includes(['select', 'radio'], fieldType)) {
                    customField.singleSelect = true;
                }
                advancedData.push(customField);
            }
        });


        return (
            <div data-tracename="订单筛选">
                <div className="deal-filter-panel">
                    <FilterList
                        ref={filterList => this.filterList = filterList}
                        advancedData={advancedData}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
                        toggleList={this.props.toggleList}
                    />
                </div>
            </div>
        );
    }
}
DealFilterPanel.defaultProps = {
    getClueList: function() {

    },
    style: {},
    showSelectTip: false,
    toggleList: function() {

    }
};
DealFilterPanel.propTypes = {
    getClueList: PropTypes.func,
    style: PropTypes.object,
    showSelectTip: PropTypes.bool,
    toggleList: PropTypes.func,
    opportunityCustomFieldData: PropTypes.object,
};

export default DealFilterPanel;