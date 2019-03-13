/** Created by 2019-02-19 14:48 */
/*产品的添加和编辑*/
import React, { Component } from 'react';
import './index.less';
import { Icon, Popconfirm, Spin} from 'antd';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import DefaultUserLogoTitle from 'CMP_DIR/default-user-logo-title';
import Trace from 'LIB_DIR/trace';
import { AntcAppSelector,Antc } from 'antc';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import DetailCard from 'CMP_DIR/detail-card';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import EditFormCell from './editform-cell';
import { DISPLAY_TYPES } from 'MOD_DIR/contract/consts';

// 开通应用，默认的数量和金额
const APP_DEFAULT_INFO = {
    COUNT: 1,
    PRICE: 1000
};

class ProductList extends Component {

    static defaultProps = {
        //应用列表
        appList: [],
        formItems: [],
        // 要添加的其他项
        ortherItems: [],
        //数据
        dataSource: [],
        //是否处于详情展示下
        isDetailShow: false,
        //表格是否处于编辑状态
        isEdit: false,
        //编辑按钮是否显示
        isEditBtnShow: false,
        // 合同id
        contractId: '',
        title: '',
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
        ortherItems: PropTypes.array,
        dataSource: PropTypes.array,
        isDetailShow: PropTypes.bool,
        isEdit: PropTypes.bool,
        isEditBtnShow: PropTypes.bool,
        contractId: PropTypes.string,
        title: PropTypes.string,
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
            saveStatus: this.getSaveStatus(props.dataSource),
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
                saveStatus: this.getSaveStatus(nextProps.dataSource),
                currentEditKey,
                isAddApp,
            });
        }
    }

    getSaveStatus(dataSource) {
        return dataSource.length > 0 ? _.map(dataSource, product => {
            return {
                loading: false,
                saveErrMsg: '',
            };
        }) : [];
    }

    // 产品应用选择触发事件
    handleAppSelect = selectedAppList => {
        let data = _.cloneDeep(this.state.data);
        let saveStatus = this.state.saveStatus;

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
    showEdit = (index, type = DISPLAY_TYPES.UPDATE) => {
        let data = _.cloneDeep(this.state.data);
        let saveStatus = this.state.saveStatus;
        data[index].isEditting = !data[index].isEditting;
        let isAddApp = this.state.isAddApp;
        let currentEditKey = null;
        // 当前是否处于编辑状态
        if(data[index].isEditting) {
            currentEditKey = data[index].id;
        }
        // 判断是否是添加的产品取消, 是则要删除这个数据
        if(type === DISPLAY_TYPES.ADD) {
            delete this[`form${data[index].id}Ref`];
            data.splice(index,1);
            saveStatus.splice(index, 1);
            isAddApp = _.findIndex(data, item => {
                return item.isAdd;
            }) > -1;
        }
        this.setState({
            data,
            saveStatus,
            isAddApp,
            currentEditKey
        },() => {
            // 是单项编辑取消时
            if(type === DISPLAY_TYPES.EDIT && !data[index].isEditting) {
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
        let isAddApp = this.state.isAddApp;
        let id = data[index].id;
        let _this = this;
        // 如果是单项编辑时的删除
        if(type === DISPLAY_TYPES.DELETE) {
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
                    saveStatus
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

            isAddApp = _.findIndex(newData, item => {
                return item.isAdd;
            }) > -1;

            this.setState({
                data: newData,
                isAddApp
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
    handleSubmit = (type = DISPLAY_TYPES.UPDATE, productIndex) => {
        let validateArr = [];
        _.each(this.state.data, (item, index) => {
            let ref = this[`form${item.id}Ref`];
            // 这里是单线编辑或者是添加产品时
            if(type === DISPLAY_TYPES.ADD || type === DISPLAY_TYPES.UPDATE && item.isEditting) {
                ref.props.form.validateFields((err, value) => {
                    if(err) return false;
                    if(!_.get(item,'account_start_time')) {
                        item.account_start_time = moment().valueOf();
                        item.account_endt_time = moment().valueOf();
                    }
                    let obj = {...item, ...value};
                    if(type === DISPLAY_TYPES.UPDATE) {
                        delete obj.isEditting;
                        delete obj.isAdd;
                        // 如果是添加的产品时
                        let hasAddItem = !_.isNil(obj.singleAdd);
                        if(hasAddItem) {
                            obj.id = obj.app_name;
                            let app = _.find(this.props.appList, app => app.client_id === obj.id);
                            obj.name = app.client_name;
                            delete obj.singleAdd;
                            delete obj.app_name;
                        }
                    }

                    validateArr.push(obj);
                });
            }
        });
        // 添加合同时，添加产品需要判断数组长度是否相等，如果是展示编辑产品需要判断是否为空
        if(type === DISPLAY_TYPES.ADD && validateArr.length !== this.state.data.length) {
            return false;
        }else {

            if(type === DISPLAY_TYPES.ADD) {
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
                    data,
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
        let type = product.isAdd ? DISPLAY_TYPES.ADD : DISPLAY_TYPES.UPDATE;
        this.showEdit(index, type);
    };
    // 展示时的产品选择确认事件
    handleSubmitAppList = () => {
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
    // 获取选中的应用id
    onAppListChange = (applist) => {
        this.setState({
            appSelected: applist,
            unSelectDataTip: ''
        });
    };
    // 清除选择的数据
    clearSelectAppList = () => {
        this.setState({
            appSelected: '',
            unSelectDataTip: ''
        });
    };

    // 单个添加产品
    addList() {
        let data = _.cloneDeep(this.state.data);
        let saveStatus = this.state.saveStatus;

        saveStatus.unshift({
            loading: false,
            saveErrMsg: '',
        });
        data.unshift({
            id: '',
            name: '',
            isEditting: true,
            isAdd: true,
            singleAdd: true,
            ...this.props.defaultValueMap
        });

        this.setState({
            data,
            saveStatus,
            isAddApp: true
        }, () => {
            if (this.props.onChange) this.props.onChange(data);
        });
    }

    // 渲染编辑按钮
    renderEditBtnBlock(product, index) {
        /*
         *  是否正在编辑中
         *  是：这时判断是添加的产品，是则显示X按钮，否不显示
         *  否：显示可编辑按钮
         */
        if(product.isEditting){
            // 添加的产品有X按钮,已有项不显示
            const hasAddField = product.isAdd;
            return (
                hasAddField ?
                    <span
                        className="btn-bar"
                        onClick={this.handleDelete.bind(this, index, DISPLAY_TYPES.ADD)}
                        title={Intl.get('common.delete', '删除')}>
                        <Icon type="close" theme="outlined"/>
                    </span> : null
            );
        }else {
            // 什么情况下显示，没有正在编辑的项,比如添加产品和编辑产品的情况都没有
            const isShowEditAndDelBtn = !this.state.isAddApp && this.state.currentEditKey === null;
            return (
                isShowEditAndDelBtn ? <Spin spinning={this.state.saveStatus[index].loading} className='float-r'>
                    <span className='btn-box'>
                        <DetailEditBtn
                            title={this.props.editBtnTip}
                            onClick={this.showEdit.bind(this, index, DISPLAY_TYPES.UPDATE)}
                        />
                        <Popconfirm title={`${Intl.get('crm.contact.delete.confirm', '确认删除')}?`}
                            onConfirm={this.handleDelete.bind(this, index, DISPLAY_TYPES.DELETE)}>
                            <span title={Intl.get('common.delete', '删除')}>
                                <i className='iconfont icon-delete' />
                            </span>
                        </Popconfirm>
                    </span>
                </Spin> : null
            );
        }
    }

    renderProductTitle = (product, index) => {
        let appName = product.name;
        let appId = product.id;
        let appList = this.props.appList;
        let matchAppObj = _.find( appList, (appItem) => {
            return appItem.client_id === appId;
        });
        return (
            <div className='product-title'>
                <span className='app-icon-name'>
                    {appName ? (
                        <span>
                            <DefaultUserLogoTitle
                                nickName={appName}
                                userLogo={_.get(matchAppObj,'client_image','')}
                                className='app-default'
                                defaultImgClass="application-img"
                            />
                            <span className='app-name' title={appName}>{appName}</span>
                        </span>
                    ) : null}
                </span>
                {this.renderEditBtnBlock(product, index)}
            </div>
        );
    };

    renderProductItem = (product, productIndex) => {
        const formItems = _.cloneDeep(this.props.formItems);
        if(this.props.ortherItems.length > 0) {
            const ortherItems = _.cloneDeep(this.props.ortherItems);
            if(!_.isNil(product.singleAdd)) {
                _.each(ortherItems, item => {
                    formItems.splice(_.get(item,'index', 0), 0, item);
                });
            }
        }

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
    // 渲染添加单个产品的按钮
    renderSingleAddBtn() {
        // 展示时，需要判断是否有产品在编辑中
        let hasEditingItem = _.find(this.state.data, item => {
            return item.isEditting;
        });
        if(!hasEditingItem){
            return (<span
                className="iconfont icon-add"
                onClick={this.addList.bind(this)}
                title={Intl.get('common.add', '添加')}/>
            );
        }else { return null; }
    }
    // 渲染添加产品的按钮
    renderBtnBlock(appList) {
        // 多个产品添加的按钮显示条件：可编辑，且属于添加情况下
        // 单个产品添加的按钮显示条件： 可编辑，且属于详情展示情况下，且当前没有正在编辑的产品

        if(this.props.isEdit){ // 可编辑
            if(this.props.isDetailShow) { // 详情展示，显示单个产品添加的按钮
                return this.renderSingleAddBtn();
            }else {
                // 显示添加多个产品的按钮
                return (<div className="add-app-container">
                    <AntcAppSelector
                        ref='appSelectorRef'
                        appList={appList}
                        onConfirm={this.handleAppSelect}
                        appendDOM={this.props.appendDOM}
                        addBtnText={this.props.addBtnText}
                    />
                </div>);
            }
        }else {
            return null;
        }
    }

    render() {
        let productListLength = _.get(this,'state.data.length',0);
        const appNames = _.map(this.state.data, 'name');

        const appList = _.filter(this.props.appList, app => _.indexOf(appNames, app.client_name) === -1);
        const showNoDataTip = !productListLength;
        const containerStyle = {
            minHeight: showNoDataTip ? 150 : 0,
            position: showNoDataTip ? 'relative' : 'inherit',
        };

        return (
            <DetailCard
                title={this.props.title}
                content={(<div className="product-list-wrapper">
                    <div className="product-list-container clearfix" style={containerStyle}>
                        {
                            productListLength ? (
                                this.state.data.map((product, index) => {
                                    return (
                                        <DetailCard
                                            className='product-list-item'
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
                            ) : <NoDataIconTip tipContent={Intl.get('deal.detail.no.products', '暂无产品')}/>
                        }
                    </div>
                    {this.renderBtnBlock(appList)}
                </div>)}
            />
        );
    }
}

export default ProductList;