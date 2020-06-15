/**
 * Created by hzl on 2020/5/21.
 * 自定义字段配置后，展示以及编辑
 */

import DetailCard from '../detail-card';
import BasicEditInputField from '../basic-edit-field-new/input';
import BasicEditSelectField from '../basic-edit-field-new/select';
import BasicEditDateField from '../basic-edit-field-new/date-picker';
import RadioOrCheckBoxEditField from '../basic-edit-field-new/radio-checkbox';
import {inputType, selectType} from 'PUB_DIR/sources/utils/consts';
import classNames from 'classnames';
import './index.less';

const nameLongEditWidth = 245;

class CustomField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            basicDetailData: props.basicDetailData, // 详情的基本信息
            customFieldData: props.customFieldData, // 配置的自定义字段数据
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'basicDetailData.id') !== _.get(this.state, 'basicDetailData.id') ||
            !_.isEqual(_.get(nextProps.basicDetailData, 'custom_variables'), _.get(this.state.basicDetailData, 'custom_variables'))) {
            this.setState({
                basicDetailData: nextProps.basicDetailData,
                customFieldData: nextProps.customFieldData,
            });
        }
    }

    // 自定义字段
    renderCustomField = () => {
        const customizedVariables = _.get(this.state.customFieldData, '[0].customized_variables');
        return (
            _.map(customizedVariables, item => {
                const name = _.get(item, 'name');
                return (
                    <div className="basic-info-item">
                        <span className="basic-info-label">{name}:</span>
                        {this.renderCustomFieldType(item)}
                    </div>
                );
            })
        );
    };

    renderCustomFieldType = (item) => {
        const basicDetailData = this.state.basicDetailData;
        // 自定义的值
        const customVariables = _.get(basicDetailData, 'custom_variables', {});
        const fieldType = _.get(item, 'field_type');
        const name = _.get(item, 'name');
        const editWidth = name.length > 6 ? nameLongEditWidth : this.props.editWidth;
        const editBtnTip = Intl.get('custom.field.set.name', '设置{name}', {name: name});
        const noDataTip = Intl.get('custom.field.no.name', '暂无{name}', {name: name});
        const addDataTip = Intl.get('custom.field.add.name', '添加{name}', {name: name});
        const selectPlaceholderTip = Intl.get('custom.field.select.name', '请选择{name}', {name: name});
        const customCls = classNames({
            'custom-field-name-long': name.length > 6
        });
        // 默认的自定义的值
        let value = customVariables[name];
        // 是否是选择类型
        if (_.includes(selectType, fieldType)) {
            let selectOptions = _.map(_.get(item, 'select_values'), (name, i) => {
                return (<Option key={i} value={name}>{name}</Option>);
            });
            let isMultiple = false;
            if (_.isEqual(fieldType, 'multiselect')) {
                isMultiple = true;
                if ( _.isEmpty(value)) {
                    value = [];
                }
            }
            if (_.includes(['radio', 'checkbox'], fieldType)) {
                selectOptions = _.get(item, 'select_values');
                if (_.isEqual(fieldType, 'checkbox') && _.isEmpty(value)) {
                    value = [];
                }
                return (
                    <div className={customCls}>
                        <RadioOrCheckBoxEditField
                            width={editWidth}
                            id={basicDetailData.id}
                            displayText={value}
                            value={value}
                            field={name}
                            componentType={fieldType}
                            selectOptions={selectOptions}
                            hasEditPrivilege={this.props.hasEditPrivilege}
                            editBtnTip={editBtnTip}
                            saveEditInput={this.saveEditCustomFieldInfo.bind(this)}
                            noDataTip={noDataTip}
                            addDataTip={addDataTip}
                        />
                    </div>

                );

            } else {
                return (
                    <div className={customCls}>
                        <BasicEditSelectField
                            width={editWidth}
                            multiple={isMultiple}
                            id={basicDetailData.id}
                            displayText={value}
                            value={value}
                            field={name}
                            selectOptions={selectOptions}
                            placeholder={selectPlaceholderTip}
                            validators={[isMultiple ? {type: 'array'} : {}]}
                            hasEditPrivilege={this.props.hasEditPrivilege}
                            editBtnTip={editBtnTip}
                            saveEditSelect={this.saveEditCustomFieldInfo.bind(this)}
                            noDataTip={noDataTip}
                            addDataTip={addDataTip}
                        />
                    </div>

                );
            }

        } else if (_.includes(inputType, fieldType)) {
            let type = fieldType;
            if (_.isEqual(type, 'multitext')) {
                type = 'textarea';
            }
            return (
                <div className={customCls}>
                    <BasicEditInputField
                        width={editWidth}
                        id={basicDetailData.id}
                        type={type}
                        field={name}
                        textCut={true}
                        value={value}
                        editBtnTip={editBtnTip}
                        placeholder={_.get(item, 'select_values[0]')}
                        hasEditPrivilege={this.props.hasEditPrivilege}
                        saveEditInput={this.saveEditCustomFieldInfo.bind(this)}
                        noDataTip={noDataTip}
                        addDataTip={addDataTip}
                    />
                </div>

            );
        } else if(_.isEqual(fieldType, 'date')){
            return (
                <BasicEditDateField
                    width={editWidth}
                    id={basicDetailData.id}
                    displayText={value}
                    value={value}
                    field={name}
                    placeholder={selectPlaceholderTip}
                    hasEditPrivilege={this.props.hasEditPrivilege}
                    saveEditDateInput={this.saveEditCustomFieldInfo.bind(this)}
                    noDataTip={noDataTip}
                    addDataTip={addDataTip}
                />
            );
        }
    };

    saveEditCustomFieldInfo(saveObj, successFunc, errorFunc) {
        _.isFunction(this.props.saveEditCustomFieldInfo) && this.props.saveEditCustomFieldInfo(saveObj, successFunc, errorFunc);
    }

    render() {
        return (
            <DetailCard
                className="custom-field-detail-card"
                content={this.renderCustomField()}
            />
        );
    }
}

CustomField.defaultProps = {
    basicDetailData: {}, // 详情中的基本信息
    customFieldData: {}, // 配置的自定义字段数据
    hasEditPrivilege: false, // 是否能编辑，默认false
    editWidth: 340, // 默认编辑区域的宽度340
    saveEditCustomFieldInfo: () => {}
};

CustomField.propTypes = {
    basicDetailData: PropTypes.object,
    customFieldData: PropTypes.object,
    hasEditPrivilege: PropTypes.bool,
    editWidth: PropTypes.number,
    saveEditCustomFieldInfo: PropTypes.func,
};

export default CustomField;
