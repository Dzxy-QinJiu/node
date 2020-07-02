/**
 * Created by hzl on 2020/6/5.
 */
import { FilterList } from 'CMP_DIR/filter';

import DealFilterActions from '../action/deal-filter-actions';
import { getCustomFieldFilterContent } from 'PUB_DIR/sources/utils/common-method-util';
class DealFilterPanel extends React.Component {
    constructor(props) {
        super(props);
    }

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
                    DealFilterActions.setFilterCustomField(custom_variables);
                }
            }
        });

        setTimeout( () => {
            this.props.getFilterDealData();
        } );
    };

    render(){
        const advancedData = [];
        const customizedVariables = _.get(this.props.opportunityCustomFieldData, '[0].customized_variables');
        const customFieldOptions = getCustomFieldFilterContent(customizedVariables);
        advancedData.push(...customFieldOptions);

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
    getFilterDealData: function() {

    },
    style: {},
    showSelectTip: false,
    toggleList: function() {

    }
};
DealFilterPanel.propTypes = {
    getFilterDealData: PropTypes.func,
    style: PropTypes.object,
    showSelectTip: PropTypes.bool,
    toggleList: PropTypes.func,
    opportunityCustomFieldData: PropTypes.object,
};

export default DealFilterPanel;