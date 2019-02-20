/** Created by 2019-02-19 14:48 */
/*产品的添加和编辑*/
import React, { Component } from 'react';
import { Icon, Form, Alert } from 'antd';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Trace from 'LIB_DIR/trace';
import { AntcAppSelector } from 'antc';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import DetailCard from 'CMP_DIR/detail-card';

const FormItem = Form.Item;

// 开通应用，默认的数量和金额
const APP_DEFAULT_INFO = {
    COUNT: 1,
    PRICE: 1000
};

class EditFormItem extends React.Component {

    state = {
        value: ''
    };

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

        if(_.isFunction(editorProps)) editorProps = editorProps(product,this.props.isEdit);

        let renderElement;
        const { getFieldDecorator } = this.props.form;

        if(this.props.isEdit && props.editable){
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
                renderElement = `${editorProps.startTime.format(oplateConsts.DATE_FORMAT)} ${Intl.get('common.time.connector', '至')} ${editorProps.endTime.format(oplateConsts.DATE_FORMAT)}`; //<Editor {...editorProps}/>;
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
                        item.formLayOut.className = 'form-inline';
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
        //变更事件，在表格内容变化后会被触发，其回调参数为变化后的表格数据
        onChange: function() {},
        //保存事件，在点击保存按钮后会被触发，其回调参数为变化后的表格数据
        onSave: function() {},
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
        onChange: PropTypes.func,
        onSave: PropTypes.func,
        onEditBtnSubmit: PropTypes.func,
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
        form: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            data: this.props.dataSource,
            loading: false,
            saveErrMsg: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
            this.setState({
                data: _.clone(nextProps.dataSource),
            });
        }
    }

    handleAppSelect = selectedAppList => {
        let data = _.cloneDeep(this.state.data);

        _.each(selectedAppList, app => {
            data.push({
                id: app.client_id,
                name: app.client_name,
                ...this.props.defaultValueMap
            });
        });

        this.setState({data}, () => {
            if (this.props.onChange) {
                this.props.onChange(data);
            }
        });
    };

    showEdit = () => {
        this.setState({
            isEdit: true
        });
    };

    handleDelete = (index) => {
        let data = this.state.data;
        let newData = _.map(data,(item, index) => {
            let value = this[`form${item.id}Ref`].props.form.getFieldsValue();
            return {...item, ...value};
        });
        newData.splice(index, 1);
        delete this[`form${item.id}Ref`];

        this.setState({
            data: newData
        },() => {
            newData.length === 1 && 0 !== index ? index = 0 : index -= 1;
            newData.length > 1 ? this[`form${newData[index].id}Ref`].props.form.validateFields() : '';
            // if(_.isFunction(this.props.onChange)) this.props.onChange(newData);
        });
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
    handleSubmit = (type = 'update') => {
        let validateArr = [];
        _.map(this.state.data, (item, index) => {
            let ref = this[`form${item.id}Ref`];
            ref.props.form.validateFields((err, value) => {
                if(err) return false;
                if(!_.get(item,'start_time')) {
                    item.start_time = moment().valueOf();
                    item.end_time = moment().valueOf();
                }
                validateArr.push({...item, ...value});
            });
        });
        if(validateArr.length !== this.state.data.length) {
            return false;
        }else{
            const totalAmount = this.props.totalAmount;

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
            }

            if(type === 'add') {
                const data = _.cloneDeep(validateArr);
                return data;
            }

            this.setState({loading: true});

            const data = _.cloneDeep(validateArr);

            const successFunc = () => {
                this.setState({
                    loading: false,
                    saveErrMsg: '',
                    isEdit: false,
                });
            };

            const errorFunc = (errorMsg) => {
                this.setState({
                    loading: false,
                    saveErrMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            };

            this.props.onSave(data, successFunc, errorFunc);
        }
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
                {this.state.isEdit ? (
                    <span
                        className="btn-bar"
                        onClick={this.handleDelete.bind(this, index)}
                        title={Intl.get('common.delete', '删除')}>
                        <Icon type="close" theme="outlined" />
                    </span>
                ) : null}
            </div>
        );
    }

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
    }

    render() {
        let productListLength = this.state.data.length || 0;
        const appNames = _.map(this.state.data, 'name');

        const appList = _.filter(this.props.appList, app => appNames.indexOf(app.client_name) === -1);
        return (
            <div className="product-list">
                <div className="product-detail-top-total-block">
                    <div>
                        {
                            this.state.isEdit || !this.props.isEditBtnShow ? null : (
                                <DetailEditBtn
                                    title={this.props.editBtnTip}
                                    onClick={this.showEdit}
                                />)
                        }
                    </div>
                </div>
                {/*<Form className='clearfix'>
                                {
                                    this.state.data.map((product, index) => {
                                        return (
                                            <DetailCard
                                                key={index}
                                                title={this.renderProductTitle(product, index)}
                                                content={this.renderProductItem(product, index)}
                                            />
                                        );
                                    } )
                                }
                            </Form> ) : (
                            <NoDataIconTip tipContent={Intl.get('deal.detail.no.products', '暂无产品')}/>*/}
                <div className="product-list-container clearfix">
                    {
                        productListLength ? (

                            this.state.data.map((product, index) => {
                                return (
                                    <DetailCard
                                        key={product.id}
                                        title={this.renderProductTitle(product, index)}
                                        content={this.renderProductItem(product, index)}
                                    />
                                );
                            })
                        ) : null
                    }
                </div>
                {this.state.isEdit ? (
                    <div>
                        <div className="add-app-container">
                            <AntcAppSelector
                                appList={appList}
                                onConfirm={this.handleAppSelect}
                                appendDOM={this.props.appendDOM}
                                addBtnText={this.props.addBtnText}
                            />
                        </div>
                        { this.props.isSaveCancelBtnShow ? (
                            <SaveCancelButton
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                                loading={this.state.loading}
                                saveErrorMsg={this.state.saveErrMsg}
                            />) : null}
                    </div>) : null}
            </div>
        );
    }
}

// export default Form.create()(ProductList);
export default ProductList;