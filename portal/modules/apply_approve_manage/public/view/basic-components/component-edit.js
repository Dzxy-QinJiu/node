/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input, Checkbox, Icon, Radio, Upload, Button, message, Popconfirm} from 'antd';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';

require('./index.less');
import {ALL_COMPONENTS, ADDAPPLYFORMCOMPONENTS, getApplyNameRegMsg} from '../../utils/apply-approve-utils';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';

class componentEdit extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        //组件上有些属性没有保存到后端，需要查找原来组件上的默认属性
        var target = _.find(ADDAPPLYFORMCOMPONENTS, item => item.component_type === formItem.component_type) || {};
        this.state = {
            formItem: _.assign({}, target, formItem),
            loading: false,//正在保存
            submitErrorMsg: '',
            titleRequiredMsg: '',
            templateList: [],//上传的文件模板
            componentTitleErrMsg: '',//组件名字校验的错误信息
        };
    }

    componentWillReceiveProps(nextProps) {
        if ( !_.isEqual(this.state.formItem, nextProps.formItem) ) {
            this.setState({
                formItem: _.cloneDeep(nextProps.formItem),
            });
        }
    }

    onStoreChange = () => {

    };
    handleChangeRequiredMsg = (e) => {
        var formItem = this.state.formItem;
        var value = e.target.value;
        formItem.is_required_errmsg = value;
        this.setState({
            formItem
        });
    };
    handleChangeTopic = (e) => {
        var formItem = this.state.formItem;
        var value = _.trim(e.target.value);
        formItem.title = value;
        this.setState({
            formItem,
            componentTitleErrMsg: getApplyNameRegMsg(value, Intl.get('apply.approve.component', '组件'))
        });
    };
    handleChangeTip = (e) => {
        var formItem = this.state.formItem;
        formItem.placeholder = e.target.value;
        this.setState({
            formItem
        });
    };
    handleSubmit = () => {
        if (this.state.loading || this.state.submitErrorMsg || this.state.componentTitleErrMsg) {
            return;
        }
        var formItem = this.state.formItem;
        //如果必填项没有写，不允许提交
        if (!formItem.title) {
            this.setState({
                titleRequiredMsg: Intl.get('apply.components.write.title', '请填写标题！')
            });
            return;
        }
        this.setState({
            loading: true
        }, () => {
            this.props.handleSubmit(formItem, () => {
            }, (errorMsg) => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });
        });
    };
    handleCancel = () => {
        var formItem = this.state.formItem;
        if (formItem) {
            formItem.isEditting = false;
            this.props.handleCancel(formItem);
        }

    };
    onCheckboxChange = (e) => {
        var formItem = this.state.formItem;
        formItem.is_required = e.target.checked;
        this.setState({
            formItem
        });
    };
    ontimeRangeChange = (checkedValues) => {
        var formItem = this.state.formItem;
        formItem.default_value = _.filter(this.getSelectOrDefaultArr().selectArr, item =>
            _.indexOf(checkedValues, item.value) > -1
        );
        this.setState({formItem});
    };
    handleAddInput = () => {
        var formItem = this.state.formItem;
        var options = _.get(formItem, 'select_arr');
        options.push('');
        this.setState({formItem});
    };
    handleMinusInput = (index) => {
        var formItem = this.state.formItem;
        var options = _.get(formItem, 'select_arr');
        options.splice(index, 1);
        this.setState({formItem});
    };
    onPreciousRadioChange = (e) => {
        var formItem = this.state.formItem;
        formItem.selected_value = e.target.value;
        this.setState({formItem});
    };
    handleInputChange = (index, e) => {
        var formItem = this.state.formItem;
        var options = _.get(formItem, 'select_arr');
        options.splice(index, 1, e.target.value);
        this.setState({formItem});
    };
    beforeUploadFiles = (file) => {
        this.setState(state => ({
            templateList: [file]
        }));
        return false;
    };
    handleDeleteFile = (templateItem) => {
        this.setState(state => ({
            templateList: []
        }));
    };
    renderTemplateList = () => {
        var {templateList} = this.state;
        return (
            <div className="template-container">
                {_.map(templateList, (templateItem) => {
                    return (
                        <span className='template-item'>
                            {templateItem.name}
                            <Popconfirm placement="top" title={Intl.get('apply.approve.delete.this.file', '是否删除此文件')}
                                onConfirm={this.handleDeleteFile.bind(this, templateItem)}
                                okText={Intl.get('user.yes', '是')} cancelText={Intl.get('user.no', '否')}>
                                <i className="iconfont icon-delete handle-btn-item"></i>
                            </Popconfirm>
                        </span>
                    );
                })}
            </div>
        );
    };
    isRangeInputType = () => {
        var formItem = this.state.formItem;
        return _.get(formItem, 'component_type') === ALL_COMPONENTS.RANGEINPUT;
    };
    getSelectOrDefaultArr = () => {
        var formItem = this.state.formItem;
        var selectArr = [], defaultArr = [];
        _.forEach(_.get(formItem, 'select_arr', []), item => {
            if (_.isString(item)) {
                selectArr.push(JSON.parse(item));
            }
        });
        _.forEach(_.get(formItem, 'default_value', []), item => {
            if (_.isString(item)) {
                defaultArr.push(JSON.parse(item));
            }
        });


        return {selectArr, defaultArr};
    };
    render = () => {
        var formItem = this.state.formItem, hasErrTip = this.state.titleRequiredMsg || this.state.componentTitleErrMsg;
        var cls = classNames('', {
            'err-tip': hasErrTip
        });
        var props = {
            name: 'template',
            beforeUpload: this.beforeUploadFiles
        };
        var isRangeInput = this.isRangeInputType();
        var {isShowName, isShowTitle, isShowPlaceHolder, isShowRangeInput, isShowSelectArr, isShowTimePeriod, isShowTemplate, isShowOher, isShowRequiredMsg, isShowSaveBtn} = this.props;
        return (
            <div className="approve-edit-container" key={formItem.key}>
                {isShowName ? <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.name', '组件名称')}</span>
                    <span className="text-components">
                        <i className={`iconfont ${_.get(formItem, 'iconfontCls')}`}></i>
                        {_.get(formItem, 'rulename')}
                    </span>
                </div> : null}
                {isShowTitle ? <div className="component-row required">
                    <span className="label-components">{Intl.get('crm.alert.topic', '标题')}</span>
                    <span className="text-components">
                        <Input className={cls} defaultValue={_.get(formItem, 'title')}
                            onChange={this.handleChangeTopic}/>
                        {hasErrTip ? <span className="require-err-tip">
                            {hasErrTip}
                        </span> : null}
                    </span>
                </div> : null}
                {isShowPlaceHolder && _.get(this, 'props.formItem.placeholder', '') ? <div className="component-row">
                    <span className="label-components">placeHolder</span>
                    <span className='text-components'>
                        <Input className={cls} defaultValue={_.get(formItem, 'placeholder', '')}
                            onChange={this.handleChangeTip}/>
                    </span>
                </div> : null}
                {isShowRangeInput && isRangeInput ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem, 'unitLabel')}</span>
                        <span className='text-components'>
                            {/*select_arr 存储后只能是字符串的数组*/}
                            <CheckboxGroup options={this.getSelectOrDefaultArr().selectArr}
                                defaultValue={_.map(this.getSelectOrDefaultArr().defaultArr, 'value')}
                                onChange={this.ontimeRangeChange}/>
                        </span>
                    </div>
                    : null}
                {isShowSelectArr && _.get(formItem, 'component_type') === ALL_COMPONENTS.SELECTOPTION ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem, 'unitLabel')}</span>
                        <span className="text-components">
                            {_.map(_.get(formItem, 'select_arr'), (item, index) => {
                                const noShowMinus = index === 0 && _.get(formItem, 'select_arr.length') === 1;
                                const noShowAdd = index + 1 !== _.get(formItem, 'select_arr.length');
                                return <span className="option-container" key={index}>
                                    <Input value={item} onChange={this.handleInputChange.bind(this, index)}/>
                                    <span className="icon-container">
                                        <Icon className={noShowMinus ? 'hide-icon' : ''} type="minus"
                                            onClick={this.handleMinusInput.bind(this, index)}/>
                                        <Icon className={noShowAdd ? 'hide-icon' : ''} type="plus"
                                            onClick={this.handleAddInput.bind(this, index)}/>
                                    </span>
                                </span>;
                            })}
                        </span>

                    </div>
                    : null}
                {isShowTimePeriod && _.get(formItem, 'component_type') === ALL_COMPONENTS.TIME_PERIOD ?
                    <div className="component-row required">
                        <span className="label-components">{_.get(formItem, 'unitLabel')}</span>
                        <span className="text-components">
                            <RadioGroup onChange={this.onPreciousRadioChange} value={_.get(formItem, 'selected_value')}>
                                {_.map(_.get(formItem, 'select_arr'), (item) => {
                                    if (_.isString(item)) {
                                        item = JSON.parse(item);
                                    }
                                    return <Radio value={item.value}>{item.label}</Radio>;
                                })}
                            </RadioGroup>({_.get(formItem, 'unitMsg')})
                        </span>

                    </div>
                    : null}
                {isShowTemplate && _.get(formItem, 'component_type') === ALL_COMPONENTS.TEMPLATE ?
                    <div className="component-row required">
                        <span className="label-components">{Intl.get('common.import.template', '模板')}</span>
                        <span className="text-components">
                            <Upload {...props} >
                                {_.get(this.state.templateList, 'length') ?
                                    this.renderTemplateList() :
                                    <Button>{Intl.get('apply.approved.upload.template', '上传模板')}</Button>}
                            </Upload>
                        </span>
                    </div>
                    : null}
                {isShowOher ? <div className="component-row">
                    <span className="label-components">{Intl.get('crm.186', '其他')}</span>
                    <span className="text-components">
                        <Checkbox checked={_.get(formItem, 'is_required')} onChange={this.onCheckboxChange}/>
                        {Intl.get('apply.components.required.item', '必填')}
                    </span>
                </div> : null}

                {isShowRequiredMsg && _.get(formItem, 'is_required') ?
                    <div className="component-row">
                        <span className="label-components"></span>
                        <span className="text-components">
                            <Input placeholder={Intl.get('apply.approve.required.err.msg', '请输入未填写时的提示')}
                                defaultValue={_.get(formItem, 'is_required_errmsg')}
                                onChange={this.handleChangeRequiredMsg}/></span></div> : null}
                {isShowSaveBtn ? <SaveCancelButton loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel}/> : null}
            </div>
        );
    };
}

componentEdit.defaultProps = {
    formItem: {},
    handleCancel: function() {
    },
    handleSubmit: function() {
    },
    isShowName: true,
    isShowTitle: true,
    isShowPlaceHolder: true,
    isShowRangeInput: true,
    isShowSelectArr: true,
    isShowTimePeriod: true,
    isShowTemplate: true,
    isShowOher: true,
    isShowRequiredMsg: true,
    isShowSaveBtn: true
};

componentEdit.propTypes = {
    formItem: PropTypes.object,
    handleCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
    isShowName: PropTypes.bool,
    isShowTitle: PropTypes.bool,
    isShowPlaceHolder: PropTypes.bool,
    isShowRangeInput: PropTypes.bool,
    isShowSelectArr: PropTypes.bool,
    isShowTimePeriod: PropTypes.bool,
    isShowTemplate: PropTypes.bool,
    isShowOher: PropTypes.bool,
    isShowRequiredMsg: PropTypes.bool,
    isShowSaveBtn: PropTypes.bool
};
export default componentEdit;
