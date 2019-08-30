import {CUSTOMER_TAGS} from '../utils/crm-util';
import {FilterList} from 'CMP_DIR/filter';
import {COMMON_OTHER_ITEM} from 'PUB_DIR/sources/utils/consts';
import filterAJax from '../ajax/filter-ajax';
const otherFilterArray = [
    {
        name: Intl.get('crm.over.day.without.contact', '超{day}天未联系', {day: 15}),
        value: 'fifteen_uncontact'
    }
];
//合格标签的筛选
const qualifyLabelMap = {
    '1': CUSTOMER_TAGS.QUALIFIED,//合格
    '2': CUSTOMER_TAGS.HISTORY_QUALIFIED,//曾经合格
    '3': CUSTOMER_TAGS.NEVER_QUALIFIED//从未合格
};

class CustomerPoolFilter extends React.Component {
    constructor(props) {
        super(props);
        let condition = this.getInitialCondition();
        this.state = {
            ...condition,
            qualifyLabelList: [],//合格标签列表
            customerLabelList: [],//客户阶段
            immutableLabelsList: [], //系统标签
            labelsList: [],//标签列表
            industryList: [],//行业列表
            provinceList: [],//地域列表
        };
    }

    getInitialCondition() {
        return {
            condition: {
                customer_label: '',//客户阶段
                qualify_label: '',//合格标签（合格、曾经合格）
                immutable_labels: '', //系统标签
                labels: '',//标签的筛选
                industry: '',
                province: '',
                otherSelectedItem: '',//其他类型的筛选
            },
        };
    }

    componentDidMount() {
        //获取客户阶段
        this.getFilterCustomerLabels();
        //获取合格标签
        this.getFilterQualifyTags();
        //获取系统标签
        this.getFilterSystemTags();
        //获取自定义标签
        this.getFilterTags();
        //获取行业列表
        this.getFilterIndustries();
        //获取地域列表
        this.getFilterProvinces();
    }

    getFilterQualifyTags() {
        //获取合格标签
        filterAJax.getCustomerPoolFilterItems({field: 'qualify_label'}).then((data) => {
            let labels = [];
            _.each(data, label => {
                if (qualifyLabelMap[label]) {
                    labels.push({name: qualifyLabelMap[label], value: label});
                }
            });
            this.setState({
                qualifyLabelList: labels || [],
            });
        });
    }

    getFilterCustomerLabels() {
        //获取客户阶段
        filterAJax.getCustomerPoolFilterItems({field: 'customer_label'}).then((data) => {
            this.setState({
                customerLabelList: data || [],
            });
        });
    }

    getFilterSystemTags() {
        //获取系统标签
        filterAJax.getCustomerPoolFilterItems({field: 'immutable_labels'}).then((data) => {
            this.setState({
                immutableLabelsList: data || [],
            });
        });
    }

    getFilterTags() {
        //获取自定义标签
        filterAJax.getCustomerPoolFilterItems({field: 'labels'}).then((data) => {
            this.setState({
                labelsList: data || [],
            });
        });
    }

    getFilterIndustries() {
        //获取行业列表
        filterAJax.getCustomerPoolFilterItems({field: 'industry'}).then((data) => {
            this.setState({
                industryList: data || [],
            });
        });
    }

    getFilterProvinces() {
        //获取地域列表
        filterAJax.getCustomerPoolFilterItems({field: 'province'}).then((data) => {
            this.setState({
                provinceList: data || [],
            });
        });
    }

    handleFilterChange = (data) => {
        const condition = {};
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            condition[COMMON_OTHER_ITEM] = '';
        }
        data.forEach(item => {
            if (item.groupId) {
                condition[item.groupId] = _.map(item.data, x => x.value);
                if (['customer_label', 'immutable_labels', 'labels', COMMON_OTHER_ITEM].includes(item.groupId)) {
                    condition[item.groupId] = condition[item.groupId].join(',');
                } else if (item.singleSelect) {
                    condition[item.groupId] = condition[item.groupId][0] || '';
                }
            }
        });
        this.setState({condition}, () => {
            this.props.search();
        });
    };

    render() {
        const commonData = _.map(otherFilterArray, x => {
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
        //选中的客户阶段列表
        let selectedCustomerLabels = _.get(this.state, 'condition.customer_label', '').split(',');
        //选中的系统标签列表
        let selectedImmutLabels = _.get(this.state, 'condition.immutable_labels', '').split(',');
        //选中的标签列表
        let selectedLabels = _.get(this.state, 'condition.labels', '').split(',');
        const advancedData = [
            {
                groupName: Intl.get('weekly.report.customer.stage', '客户阶段'),
                groupId: 'customer_label',
                data: _.map(this.state.customerLabelList, x => ({
                    name: x,
                    value: x,
                    selected: _.includes(selectedCustomerLabels, x)
                }))
            },
            {
                groupName: Intl.get('common.qualified', '合格'),
                groupId: 'qualify_label',
                singleSelect: true,
                data: _.map(this.state.qualifyLabelList, x => {
                    return {
                        name: x.name,
                        value: x.value,
                        selected: x.value === _.get(this.state, 'condition.qualify_label', '')
                    };
                })
            },
            {
                groupName: Intl.get('crm.system.labels', '系统标签'),
                groupId: 'immutable_labels',
                data: _.map(this.state.immutableLabelsList, x => {
                    return {
                        name: x,
                        value: x,
                        selected: _.includes(selectedImmutLabels, x)
                    };
                })
            },
            {
                groupName: Intl.get('common.tag', '标签'),
                groupId: 'labels',
                data: _.map(this.state.labelsList, x => {
                    return {
                        name: x,
                        value: x,
                        selected: _.includes(selectedLabels, x)
                    };
                })
            },
            {
                groupName: Intl.get('common.industry', '行业'),
                groupId: 'industry',
                singleSelect: true,
                data: _.map(this.state.industryList, x => {
                    return {
                        name: x,
                        value: x,
                        selected: x === _.get(this.state, 'condition.industry', '')
                    };
                })
            },
            {
                groupName: Intl.get('crm.96', '地域'),
                groupId: 'province',
                singleSelect: true,
                data: _.map(this.state.provinceList, x => {
                    return {
                        name: x,
                        value: x,
                        selected: x === _.get(this.state, 'condition.province', '')
                    };
                })
            }
        ];
        return (
            <div data-tracename="筛选">
                <div className="customer-pool-filter">
                    <FilterList
                        ref="filterlist"
                        style={this.props.style}
                        showSelectTip={this.props.showSelectTip}
                        commonData={commonData}
                        advancedData={advancedData}
                        hasSettedDefaultCommonSelect={true}
                        onFilterChange={this.handleFilterChange.bind(this)}
                        showAdvancedPanel={true}
                    />
                </div>
            </div>
        );
    }
}
CustomerPoolFilter.propTypes = {
    showSelectTip: PropTypes.bool,
    style: PropTypes.object,
    search: PropTypes.func
};
module.exports = CustomerPoolFilter;

