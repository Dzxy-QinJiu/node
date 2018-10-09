const PropTypes = require('prop-types');
var React = require('react');
/**
 * 字段拖动面板
 * onPreview 点击预览按钮的回调,会将分析区域的参数列表传入
 * onSave
 */
import {Select, Button, Card, Checkbox, Spin, Modal} from 'antd';
var Option = Select.Option;

const CheckboxGroup = Checkbox.Group;
import ValueModal from './field-value-modal';
import SortableList from './drag-sortable';
import {
    CONTRACT_FIELDS,
    CONTRACT_FIELDS_MAXLENGTH,
    CONTRACT_TYPES_LIST,
    CONTRACT_VIEW_AUTH,
    CONTRACT_DEFAULT_VALUE_TYPE,
    CONTRACT_VALUE_TYPES
} from '../consts';

class FilterPanel extends React.Component {
    constructor(props) {
        super(props);
        const contractType = 'contract';
        let fieldParamObj = {
            filterList: [],//筛选项
            colList: [],//列字段
            rowList: [],//行字段
            valueList: [],//值
        };
        this.state = {
            selectedValueType: CONTRACT_DEFAULT_VALUE_TYPE,//选中的值类型
            isShowValueModal: false,
            fieldList: CONTRACT_TYPES_LIST,
            contractType,
            fieldParamObj,
            choosedValueItem: null,//选中值
            errMsg: {
                getFieldList: ''
            },
            tableStatus: props.status,
            contractFields: $.extend(true, [], CONTRACT_FIELDS)//用于存储值字段的计算方式
        };

    }

    componentWillReceiveProps({contractType, fieldParamObj, status}) {
        this.setState({
            fieldParamObj,
            contractType,
            tableStatus: status
        });
    }

    handleChooseField(item, idx) {
        this.showValueModal(item);
    }

    showValueModal(choosedValueItem) {
        this.setState({
            isShowValueModal: true,
            choosedValueItem
        });
    }

    handleConfirmValueType(valueType) {
        const valueTypeItem = CONTRACT_VALUE_TYPES.find(x => x.value === valueType);
        CONTRACT_FIELDS[this.state.contractType].find(x => x.value === this.state.choosedValueItem.value).calcType = valueTypeItem;
        let state = this.state;
        state.fieldParamObj.valueList.find(x => x.value === this.state.choosedValueItem.value).calcType = valueTypeItem;
        state.isShowValueModal = false;
        this.setState(state);
    }

    handleCancelValueType() {
        this.setState({
            isShowValueModal: false
        });
    }

    //拖动区域数量变动时
    handleListChange = (fieldName, idList, event) => {
        //拖进来的数据,将默认的id"1kp"滤掉再映射出完整的字段数组
        let newFieldList = _.uniq(idList)
            .filter(id => id !== '1kp')
            .map(id => CONTRACT_FIELDS[this.state.contractType].find(field => field.value === id));
        // //值字段默认计算类型设置为计数count
        if (fieldName === 'valueList') {
            newFieldList = newFieldList.map(item => $.extend({calcType: CONTRACT_DEFAULT_VALUE_TYPE}, item));
        }
        //将已经存在的字段排除掉,防止相同的字段出现在不同的分析区域
        let fieldParamObj = this.state.fieldParamObj;
        //新拖进来的字段id
        const newFieldId = idList[event.newIndex];
        //分析区域中是否存在新拖进来的字段
        let hasField = false;
        _.each(fieldParamObj, (list, key) => {
            hasField = !!list.find(item => item.value === newFieldId);
            //值列表可以出现另外三个区域的字段
            if (key === 'valueList') {
                fieldParamObj[fieldName] = newFieldList;
            } else if (hasField) {
                //原有区域去除该字段 
                fieldParamObj[key] = fieldParamObj[key].filter(item => item.value !== newFieldId);
                fieldParamObj[fieldName] = newFieldList;
            } else {
                fieldParamObj[fieldName] = newFieldList;
            }
        });
        this.setState({
            fieldParamObj
        });
    }

    handleRemoveField(fieldType, field, idx) {
        let fieldParamObj = this.state.fieldParamObj;
        fieldParamObj[fieldType] = fieldParamObj[fieldType].filter(item => item.value !== field.value);
        this.setState({
            fieldParamObj
        });
    }

    handleStatusChange(value) {
        this.setState({
            tableStatus: value
        });
    }

    handleTypeChange(type) {
        this.setState({
            contractType: type
        });
    }

    render() {
        const handleDisableSave = () => {
            //行字段且列字段均为空时，禁止预览和保存
            return !this.state.fieldParamObj.colList.length && !this.state.fieldParamObj.rowList.length;
        };
        //表格类型选项
        const fieldOption = this.state.fieldList.map((field, index) => (
            <Option key={index} value={field.value}>{field.name}</Option>
        ));
        const handlePutPermission = listType => {
            let flag = true;
            if (listType !== 'filterList') {
                flag = this.state.fieldParamObj[listType].length < CONTRACT_FIELDS_MAXLENGTH;
            }
            return flag;
        };
        const getSortableOption = fieldType => {
            const putPermission = handlePutPermission.bind(this, fieldType);
            let configObj = {
                onUpdate: this.handleFieldListChange,
                onEnd: this.handleFieldListChange,
                onAdd: this.handleFieldListChange,
                group: {name: 'shared', pull: true, put: putPermission},
            };
            /**group配置项
             * name: 拖动组件类型 shared：共享区域，可跨区域拖动
             * pull 由此容器拖向外部 boolean || fn || "clone"(拖动表现为复制)
             * put 由外部拖进此容器 boolean || fn
             *
             */
            switch (fieldType) {
                case 'fieldList':
                    configObj.group = {name: 'shared', pull: true, put: false};
                    configObj.sort = false;
                    break;
                default:
                    break;
            }
            return configObj;
        };
        return (
            <div className="filter-panel-wrapper" style={this.props.style}>
                {
                    this.state.fieldList.loading ? <Spin size="small"/> :
                        <div className="filter-container">
                            <Select
                                value={this.state.contractType}
                                onChange={this.handleTypeChange.bind(this)}
                            >
                                {fieldOption}
                            </Select>
                            <Select
                                value={this.state.tableStatus}
                                onChange={this.handleStatusChange.bind(this)}
                            >
                                <Option value={CONTRACT_VIEW_AUTH.SELF.value}>{CONTRACT_VIEW_AUTH.SELF.text}</Option>
                                <Option value={CONTRACT_VIEW_AUTH.ALL.value}>{CONTRACT_VIEW_AUTH.ALL.text}</Option>

                            </Select>
                            <div className="filter-btn-bar">
                                <Button
                                    onClick={() => {
                                        this.props.onPreview(this.state.fieldParamObj, this.state.contractType);
                                    }}
                                    disabled={handleDisableSave()}
                                >
                                    {Intl.get('common.preview', '预览')}
                                </Button>
                                <Button
                                    onClick={() => {
                                        this.props.onSave({
                                            fieldParamObj: this.state.fieldParamObj,
                                            status: this.state.tableStatus,
                                            type: this.state.contractType
                                        });
                                    }}
                                    disabled={handleDisableSave() || this.props.disableSave}
                                >
                                    {Intl.get('common.save', '保存')}
                                </Button>
                            </div>
                        </div>
                }
                <div className="field-container">
                    <Card
                        title={Intl.get('contract.fieldChoose', '字段选择')}
                        className="all-field-container">
                        <SortableList
                            options={getSortableOption('fieldList')}
                            items={CONTRACT_FIELDS[this.state.contractType]}
                        />
                    </Card>
                    <div className="analysis-zone">
                        <Card title={Intl.get('contract.filterCondition', '筛选条件')}>
                            <SortableList
                                options={getSortableOption('filterList')}
                                onRemove={this.handleRemoveField.bind(this, 'filterList')}
                                items={this.state.fieldParamObj.filterList}
                                onChange={this.handleListChange.bind(this, 'filterList')}
                            />
                        </Card>
                        <Card title={Intl.get('contract.analysis.col', '列')}>
                            <SortableList
                                options={getSortableOption('colList')}
                                onRemove={this.handleRemoveField.bind(this, 'colList')}
                                items={this.state.fieldParamObj.colList}
                                onChange={this.handleListChange.bind(this, 'colList')}
                            />
                        </Card>
                        <Card title={Intl.get('contract.analysis.row', '行')}>
                            <SortableList
                                options={getSortableOption('rowList')}
                                onRemove={this.handleRemoveField.bind(this, 'rowList')}
                                items={this.state.fieldParamObj.rowList}
                                onChange={this.handleListChange.bind(this, 'rowList')}
                            />
                        </Card>
                        <Card title={Intl.get('contract.analysis.value', '值')}>
                            <SortableList
                                options={getSortableOption('valueList')}
                                onRemove={this.handleRemoveField.bind(this, 'valueList')}
                                items={this.state.fieldParamObj.valueList}
                                onChange={this.handleListChange.bind(this, 'valueList')}
                                onClick={this.handleChooseField.bind(this)}
                            />
                        </Card>
                        <ValueModal
                            onOk={this.handleConfirmValueType.bind(this)}
                            onCancel={this.handleCancelValueType.bind(this)}
                            isShow={this.state.isShowValueModal}
                            selectedItem={this.state.choosedValueItem}
                        />
                    </div>

                </div>
                {/* <div>
                 <Container />
                 </div> */}
            </div >
        );
    }
}
FilterPanel.propTypes = {
    contractType: PropTypes.string,
    fieldParamObj: PropTypes.object,
    status: PropTypes.number,
    style: PropTypes.object,
    onPreview: PropTypes.func,
    onSave: PropTypes.func,
    disableSave: PropTypes.func
};
export default FilterPanel;