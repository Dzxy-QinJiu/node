/** Created by 2019-02-19 14:48 */
/*产品的添加和编辑*/
import React, { Component } from 'react';
import { Icon, Form, Alert, message, Popconfirm } from 'antd';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import Trace from 'LIB_DIR/trace';
import { AntcAppSelector,Antc } from 'antc';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import DetailCard from 'CMP_DIR/detail-card';
import { getClueSalesList, getLocalSalesClickCount } from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';

const FormItem = Form.Item;

// 开通应用，默认的数量和金额
const APP_DEFAULT_INFO = {
    COUNT: 1,
    PRICE: 1000
};

class EditFormItem extends React.Component {

    static propTypes = {
        form: PropTypes.object,
        parent: PropTypes.object,
        formItems: PropTypes.object,
        product: PropTypes.object,
        isEdit: PropTypes.bool,
        productIndex: PropTypes.number
    };

    static defaultProps = {
        parent: {},
        formItems: [],
        product: {},
        isEdit: false,
        productIndex: 0
    };

    getEditor = (props, product) => {
        let editor = props.editor;
        let editorProps = props.editorProps;
        let Editor;
        if(editor === 'AntcValidity'){
            Editor = require('antc')[editor];
        }else if(editor){
            Editor = require('antd')[editor];
        }

        // if(_.isFunction(editorProps)) editorProps = editorProps(product,this.props.isEdit);
        if(_.isFunction(editorProps)) editorProps = editorProps(product,product.isEditting);

        let renderElement;
        const { getFieldDecorator } = this.props.form;

        // if(this.props.isEdit && props.editable){
        if(product.isEditting && props.editable){
            if(editor !== 'AntcValidity') {
                renderElement = getFieldDecorator(props.dataIndex, props.editorConfig)(<Editor {...editorProps}/>);
            }else {
                editorProps.mode = 'add';
                renderElement = <Editor key={product.id} {...editorProps}/>;
            }
        } else {
            if(editor !== 'AntcValidity') {
                renderElement = product[props.dataIndex];
            }else{
                renderElement = `${editorProps.startTime.format(oplateConsts.DATE_FORMAT)} ${Intl.get('common.time.connector', '至')} ${editorProps.endTime.format(oplateConsts.DATE_FORMAT)}`;
            }
        }

        return renderElement;
    };

    render() {
        const {
            product,
            ...restProps
        } = this.props;


        return (
            <Form key={this.props.product.id} className='clearfix'>
                {restProps.formItems.map((item,index) => {
                    item.editorConfig = item.editorConfig || {};
                    item.editorProps = item.editorProps || {};
                    item.editor = item.editor || 'Input';

                    if(item.editor !== 'AntcValidity'){
                        let {initialValue,rules} = item.editorConfig;
                        item.editorConfig.initialValue = _.isNil(initialValue) ? product[item.dataIndex] : (_.isFunction(initialValue) ? initialValue(product[item.dataIndex]) : initialValue);
                        _.isNil(item.formLayOut) ? item.formLayOut = {} : '';
                        let rawRules = !_.isNil(rules) ? rules : [];
                        if(_.isFunction(rawRules)) {
                            item.editorConfig.rules = rawRules(product[item.dataIndex], product, index);
                            // 动态验证时
                            if(!_.isEmpty(item.dynamicRule) && item.dynamicRule.key) {
                                item.editorConfig.rules[item.dynamicRule.index] = ((parent) => {
                                    return item.dynamicRule.fn(parent);
                                })(restProps.parent);
                            }
                        }
                    }

                    if(item.display === 'inline') {
                        // if(this.props.isEdit) {
                        if(product.isEditting) {
                            item.formLayOut.className = 'form-inline';
                        } else {
                            item.formLayOut = {
                                labelCol: { span: 6 }
                            };
                        }
                    }

                    return (
                        <FormItem
                            key={index}
                            label={item.title}
                            {...item.formLayOut}
                        >
                            {this.getEditor(item, product)}
                        </FormItem>
                    );
                })}
            </Form>
        );
    }
}

const EditFormCell = Form.create()(EditFormItem);

class ProductList extends Component {

    static defaultProps = {
        //应用列表
        appList: [],
        formItems: [],
        //数据
        dataSource: [],
        //是否显示保存取消按钮
        isSaveCancelBtnShow: true,
        //表格是否处于编辑状态
        isEdit: false,
        //编辑按钮是否显示
        isEditBtnShow: false,
        // 合同id
        contractId: '',
        //变更事件，在表格内容变化后会被触发，其回调参数为变化后的表格数据
        onChange: function() {},
        //保存事件，在点击保存按钮后会被触发，其回调参数为变化后的表格数据
        onSave: function() {},
        // 删除事件,在单项编辑删除时
        onDelete: function() {},
        // 获取剩余的合同总金额
        getTotalAmount: function() {},
        //预设总金额，用于验证所有产品的金额之和是否正确
        totalAmount: 0,
        //编辑按钮的提示文案
        editBtnTip: Intl.get('common.update', '修改'),
        //默认值和对应key的map
        defaultValueMap: {
            count: APP_DEFAULT_INFO.COUNT,
            total_price: APP_DEFAULT_INFO.PRICE
        },
    };

    static propTypes = {
        appList: PropTypes.array,
        formItems: PropTypes.array,
        dataSource: PropTypes.array,
        isSaveCancelBtnShow: PropTypes.bool,
        isEdit: PropTypes.bool,
        isEditBtnShow: PropTypes.bool,
        contractId: PropTypes.string,
        onChange: PropTypes.func,
        onSave: PropTypes.func,
        onDelete: PropTypes.func,
        getTotalAmount: PropTypes.func,
        totalAmount: PropTypes.number,
        editBtnTip: PropTypes.string,
        defaultValueMap: PropTypes.object,
        data: PropTypes.array,
        appendDOM: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element,
        ]),
        addBtnText: PropTypes.string,
        handleCancel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            data: this.props.dataSource,
            isAddApp: false, // 是否添加产品
            currentEditKey: null, // 当前编辑的产品
            unSelectDataTip: '', // 未选择选择应用时提示
            loading: false,
            saveErrMsg: '',
            saveStatus: this.props.dataSource.length > 0 ? _.map(this.props.dataSource, product => {
                return {
                    loading: false,
                    saveErrMsg: '',
                };
            }) : [],
            appSelected: '', // 选择的产品应用
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
            let currentEditKey = this.state.currentEditKey;
            let isAddApp = this.state.isAddApp;
            if(!_.isEqual(this.props.contractId, nextProps.contractId)){
                currentEditKey = null;
                isAddApp = false;
            }
            this.setState({
                data: nextProps.dataSource,
                saveStatus: nextProps.dataSource.length > 0 ? _.map(nextProps.dataSource, product => {
                    return {
                        loading: false,
                        saveErrMsg: '',
                    };
                }) : [],
                currentEditKey,
                isAddApp,
            });
        }
    }

    // 产品应用选择触发事件
    handleAppSelect = selectedAppList => {
        let data = _.cloneDeep(this.state.data);
        let saveStatus = this.state.saveStatus;
        let selectedAppListlength = _.get(selectedAppList,'length');

        // 这里得判断是否是展示时的添加产品，是则每次只能添加一个产品
        if(this.props.isSaveCancelBtnShow && selectedAppListlength > 1){
            let selectedAppLists = _.clone(this.refs.appSelectorRef.props.appList);
            setTimeout(() => {
                message.warning(Intl.get('contract.product.choose.tip', '每次只能添加一个产品'));
            }, 0);
            this.refs.appSelectorRef.setState({
                appList: selectedAppLists,
                isPanelShow: true
            });
            return false;
        }

        _.each(selectedAppList, app => {
            saveStatus.unshift({
                loading: false,
                saveErrMsg: '',
            });
            data.unshift({
                id: app.client_id,
                name: app.client_name,
                isEditting: true,
                isAdd: true,
                ...this.props.defaultValueMap
            });
        });

        this.setState({data, saveStatus, isAddApp: true}, () => {
            if (this.props.onChange) {
                this.props.onChange(data);
            }
        });
    };
    // 点击编辑按钮或者取消时
    showEdit = (index, type = 'update') => {
        /*this.setState({
            isEdit: true
        });*/
        let data = _.cloneDeep(this.state.data);
        let saveStatus = this.state.saveStatus;
        data[index].isEditting = !data[index].isEditting;
        let isAddApp = this.state.isAddApp;
        let currentEditKey = this.state.currentEditKey;
        currentEditKey = data[index].id;
        // 判断是否是取消, 是则要删除这个数据
        if(type === 'cancel') {
            delete this[`form${data[index].id}Ref`];
            data.splice(index,1);
            saveStatus.splice(index, 1);
            let addIndex = _.findIndex(data, item => {
                return item.isAdd;
            });
            isAddApp = addIndex > -1;
        }
        if(!data[index].isEditting) {
            currentEditKey = null;
        }
        this.setState({
            data,
            saveStatus,
            isAddApp,
            currentEditKey
        },() => {
            // 是更新取消时
            if(type === 'update' && !data[index].isEditting) {
                if(_.isFunction(this.props.handleCancel)) this.props.handleCancel(index, data[index].id);
            } else {
                if(_.isFunction(this.props.onChange)) this.props.onChange(data);
            }
        });
    };
    // 产品的删除
    handleDelete = (index, type) => {
        let data = _.cloneDeep(this.state.data);
        let saveStatus = this.state.saveStatus;
        let id = data[index].id;
        let _this = this;
        // 如果是单项编辑时的删除
        if(type === 'delete') {
            saveStatus[index].loading = true;
            this.setState({saveStatus});

            const successFunc = () => {
                let data = _.cloneDeep(_this.state.data);
                let deleteIndex = _.findIndex(data, item => {
                    return item.id === id;
                });
                deleteIndex > -1 ? (data.splice(deleteIndex,1),saveStatus.splice(deleteIndex,1)) : '';
                _this.setState({data,saveStatus,currentEditKey: null},() => {
                    if(_.isFunction(_this.props.onChange)) _this.props.onChange(data);
                });
            };

            const errorFunc = (errorMsg) => {
                let data = _.cloneDeep(_this.state.data);
                let deleteIndex = _.findIndex(data, item => {
                    return item.id === id;
                });
                deleteIndex > -1 ? (saveStatus[deleteIndex].loading = false,saveStatus[deleteIndex].saveErrMsg = errorMsg || Intl.get('common.edit.failed', '修改失败')) : '';
                _this.setState({
                    saveStatus,
                    currentEditKey: null
                });
            };

            this.props.onDelete(id, successFunc, errorFunc, type);
        } else { // 添加的产品删除
            let newData = _.map(data,(item, index) => {
                let value = this[`form${item.id}Ref`].props.form.getFieldsValue();
                return {...item, ...value};
            });
            newData.splice(index, 1);
            saveStatus.splice(index, 1);
            delete this[`form${id}Ref`];

            this.setState({
                data: newData
            },() => {
                let currentIndex = index;
                // 当剩最后一个了，index需为0，
                newData.length === 1 || 0 === currentIndex ? currentIndex = 0 : currentIndex -= 1;
                if(_.isFunction(this.props.onChange)) this.props.onChange(newData, () => {
                    newData.length >= 1 ? this[`form${newData[currentIndex].id}Ref`].props.form.validateFields() : '';
                });
            });
        }
    };
    handleCancel = (e) => {
        this.setState({
            isEdit: false,
            data: _.clone(this.props.dataSource),
            saveErrMsg: '',
        });
        if(_.isFunction(this.props.handleCancel)) this.props.handleCancel();
        Trace.traceEvent(e, '取消对产品的修改');
    };
    handleSubmit = (type = 'update', productIndex) => {
        let validateArr = [];
        _.each(this.state.data, (item, index) => {
            let ref = this[`form${item.id}Ref`];
            // 这里是单线编辑或者是添加产品时
            if(type === 'add' || type === 'update' && item.isEditting) {
                ref.props.form.validateFields((err, value) => {
                    if(err) return false;
                    if(!_.get(item,'account_start_time')) {
                        item.account_start_time = moment().valueOf();
                        item.account_endt_time = moment().valueOf();
                    }
                    let obj = {...item, ...value};
                    if(type === 'update') {
                        delete obj.isEditting;
                        delete obj.isAdd;
                    }

                    validateArr.push(obj);
                });
            }
        });
        // 添加合同时，添加产品需要判断数组长度是否相等，如果是展示编辑产品需要判断是否为空
        if(type === 'add' && validateArr.length !== this.state.data.length) {
            return false;
        }else {
            /*const totalAmount = this.props.getTotalAmount();

            const sumAmount = _.reduce(validateArr, (sum, item) => {
                const amount = +item.total_price;
                return sum + amount;
            }, 0);

            // 需求改为不大于合同总额
            if (sumAmount > totalAmount) {
                this.setState({
                    // saveErrMsg: Intl.get('crm.contract.check.tips', '合同额与产品总额不相等，请核对')
                    saveErrMsg: Intl.get('contract.mount.check.tip', '总价合计不能大于合同总额{num}元，请核对',{num: totalAmount}),
                    showErrMsg: type === 'add', // 只有添加时才显示
                });
                return false;
            }*/

            if(type === 'add') {
                const data = _.cloneDeep(validateArr);
                return data;
            }
            if(!validateArr.length){ return false;}

            let saveStatus = this.state.saveStatus;
            saveStatus[productIndex].loading = true;

            this.setState({saveStatus});

            const data = _.map(_.cloneDeep(this.state.data),item => {
                delete item.isEditting;
                delete item.isAdd;
                return item;
            });
            data[productIndex] = validateArr[0];

            const successFunc = () => {
                saveStatus[productIndex].loading = false;
                saveStatus[productIndex].saveErrMsg = '';
                let newData = this.state.data;
                newData[productIndex].isEditting = false;

                this.setState({
                    newData,
                    saveStatus,
                    isAddApp: false,
                    currentEditKey: null
                });
            };

            const errorFunc = (errorMsg) => {
                saveStatus[productIndex].loading = false;
                saveStatus[productIndex].saveErrMsg = errorMsg || Intl.get('common.edit.failed', '修改失败');
                this.setState({
                    saveStatus
                });
            };

            this.props.onSave(data, successFunc, errorFunc);
        }
    };
    // 单项编辑时的取消
    handleItemCancel = (product, index) => {
        let type = product.isAdd ? 'cancel' : 'update';
        this.showEdit(index, type);
    };
    // 展示时的产品选择确认事件
    handleSubmitAppList = () => {
        this.handleVisibleChange();
        if (!this.state.appSelected) {
            this.setState({
                unSelectDataTip: Intl.get('leave.apply.select.product', '请选择产品')
            });
            return;
        } else {
            let data = _.cloneDeep(this.state.data);
            let saveStatus = this.state.saveStatus;
            let selectedApp = _.find(this.props.appList, app => {
                return app.client_id === this.state.appSelected;
            });


            saveStatus.unshift({
                loading: false,
                saveErrMsg: '',
            });
            data.unshift({
                id: selectedApp.client_id,
                name: selectedApp.client_name,
                isEditting: true,
                isAdd: true,
                ...this.props.defaultValueMap
            });

            this.setState({
                data,
                saveStatus,
                isAddApp: true,
                appSelected: ''
            }, () => {
                if (this.props.onChange) this.props.onChange(data);
            });
        }
    };
    handleVisibleChange = () => {
        let dropdownEl = $('.dropdown-container');
        let appBtnEl = $('.add-app-container');
        setTimeout(() => {
            dropdownEl = $('.dropdown-container');
            if(appBtnEl && !dropdownEl.hasClass('.ant-dropdown-hidden')){
                let appBtnOffeset = appBtnEl.offset();
                let appBtnElWidth = appBtnEl.width();
                let dropdownElWidth = dropdownEl.width();
                let offsetX = dropdownElWidth - appBtnElWidth + 10;

                dropdownEl.css({
                    left: appBtnOffeset.left - offsetX,
                    top: appBtnOffeset.top + appBtnEl.outerHeight() + 3
                });
            }
        },0);
    };
    // 获取选中的应用id
    onAppListChange = (applist) => {
        this.setState({
            appSelected: applist,
            unSelectDataTip: ''
        });
        this.handleVisibleChange();
    };
    // 清楚选择的数据
    clearSelectAppList = () => {
        this.setState({
            appSelected: '',
            unSelectDataTip: ''
        });
    };

    renderProductTitle = (product, index) => {
        let appName = product.name;
        let appId = product.id;
        let appList = this.props.appList;
        let matchAppObj = _.find( appList, (appItem) => {
            return appItem.client_id === appId;
        });
        return (
            <div>
                <span className='app-icon-name'>
                    {appName ? (
                        matchAppObj && matchAppObj.client_image ? (
                            <span className='app-self'>
                                <img src={matchAppObj.client_image} />
                            </span>
                        ) : (
                            <span className='app-default'>
                                <i className='iconfont icon-app-default'></i>
                            </span>
                        )
                    ) : null}
                    <span className='app-name' title={appName}>{appName}</span>
                </span>
                {/*{this.state.isEdit ? (
                    <span
                        className="btn-bar"
                        onClick={this.handleDelete.bind(this, index)}
                        title={Intl.get('common.delete', '删除')}>
                        <Icon type="close" theme="outlined" />
                    </span>
                ) : null}*/}
                {product.isEditting ? (
                    <span>
                        {product.isAdd ? <span
                            className="btn-bar"
                            onClick={this.handleDelete.bind(this, index, 'add')}
                            title={Intl.get('common.delete', '删除')}>
                            <Icon type="close" theme="outlined" /></span> :
                            <Popconfirm title={`${Intl.get('crm.contact.delete.confirm', '确认删除')}?`} onConfirm={this.handleDelete.bind(this, index, 'delete')}>
                                <span
                                    className="btn-bar"
                                    title={Intl.get('common.delete', '删除')}>
                                    <Icon type="close" theme="outlined" />
                                </span>
                            </Popconfirm>}
                    </span>
                ) : <span>
                    {this.state.isAddApp || this.state.currentEditKey !== null ? null : <DetailEditBtn
                        title={this.props.editBtnTip}
                        onClick={this.showEdit.bind(this, index, 'update')}
                    />}
                </span>
                }
            </div>
        );
    };

    renderProductItem = (product, productIndex) => {
        const formItems = _.cloneDeep(this.props.formItems);

        return (
            <EditFormCell
                wrappedComponentRef={ref => this[`form${product.id}Ref`] = ref}
                parent={this}
                formItems={formItems}
                product={product}
                isEdit={this.state.isEdit}
                productIndex={productIndex}
            />

        );
    };

    renderAppListBlock = () => {
        const appNames = _.map(this.state.data, 'name');
        const appList = _.filter(this.props.appList, app => appNames.indexOf(app.client_name) === -1);
        let dataList = [];
        _.each(appList, item => {
            dataList.push({
                name: item.client_name,
                value: item.client_id
            });
        });

        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.appSelected}
                    onChange={this.onAppListChange}
                    notFoundContent={dataList.length ? Intl.get('deal.detail.no.products', '暂无产品') : Intl.get('crm.contract.no.product.info', '暂无产品信息')}
                    dataList={dataList}
                />
            </div>
        );
    };

    render() {
        let productListLength = this.state.data.length || 0;
        const appNames = _.map(this.state.data, 'name');

        const appList = _.filter(this.props.appList, app => appNames.indexOf(app.client_name) === -1);
        // const showNoDataTip = !(!!productListLength || this.state.isEdit || !this.props.isEditBtnShow);
        const showNoDataTip = !productListLength;
        const containerStyle = {
            minHeight: showNoDataTip ? 200 : 0,
            position: showNoDataTip ? 'relative' : 'inherit',
        };
        // 展示时，需要判断是否有产品在编辑中
        let isEditting = false;
        _.each(this.state.data, item => {
            this.props.isSaveCancelBtnShow && item.isEditting ? isEditting = true : null;
        });

        return (
            <div className="product-list">
                {/*<div className="product-detail-top-total-block clearfix">
                    <div className=''>
                        {
                            this.state.isEdit || !this.props.isEditBtnShow ? null : (
                                <DetailEditBtn
                                    title={this.props.editBtnTip}
                                    onClick={this.showEdit}
                                />
                            )
                        }
                    </div>
                </div>*/}
                <div className="product-list-container clearfix" style={containerStyle}>
                    {
                        productListLength ? (
                            this.state.data.map((product, index) => {
                                return (
                                    <DetailCard
                                        key={product.id}
                                        isEdit={this.props.isEditBtnShow && product.isEditting}
                                        title={this.renderProductTitle(product, index)}
                                        loading={this.state.saveStatus[index].loading}
                                        saveErrorMsg={this.state.saveStatus[index].saveErrMsg}
                                        content={this.renderProductItem(product, index)}
                                        handleSubmit={this.handleSubmit.bind(this, 'update', index)}
                                        handleCancel={this.handleItemCancel.bind(this, product, index)}
                                    />
                                );
                            })
                        ) : (
                            <NoDataIconTip tipContent={Intl.get('deal.detail.no.products', '暂无产品')}/>
                            // this.state.isEdit || !this.props.isEditBtnShow ? null : (
                            //     <NoDataIconTip tipContent={Intl.get('deal.detail.no.products', '暂无产品')}/>
                            // )
                        )
                    }
                </div>
                <div>
                    {this.props.isEdit ?
                        <div>
                            {!isEditting ?
                                <div className="add-app-container">
                                    {
                                        this.props.isSaveCancelBtnShow ?
                                            <AntcDropdown
                                                ref='appSelectorRef'
                                                content={<span onClick={this.handleVisibleChange}>{this.props.addBtnText}</span>}
                                                overlayTitle={Intl.get('call.record.application.product', '应用产品')}
                                                okTitle={Intl.get('common.confirm', '确认')}
                                                cancelTitle={Intl.get('common.cancel', '取消')}
                                                overlayContent={this.renderAppListBlock()}
                                                handleSubmit={this.handleSubmitAppList}
                                                unSelectDataTip={this.state.unSelectDataTip}
                                                clearSelectData={this.clearSelectAppList}
                                                btnAtTop={false}
                                            /> : <AntcAppSelector
                                                ref='appSelectorRef'
                                                appList={appList}
                                                onConfirm={this.handleAppSelect}
                                                appendDOM={this.props.appendDOM}
                                                addBtnText={this.props.addBtnText}
                                            />
                                    }

                                </div> : null
                            }
                        </div> : null}
                    {/*{this.state.isEdit && this.props.isSaveCancelBtnShow ? (
                        <SaveCancelButton
                            handleSubmit={this.handleSubmit}
                            handleCancel={this.handleCancel}
                            loading={this.state.loading}
                            saveErrorMsg={this.state.saveErrMsg}
                        />) : null}*/}
                </div>
            </div>
        );
    }
}

export default ProductList;