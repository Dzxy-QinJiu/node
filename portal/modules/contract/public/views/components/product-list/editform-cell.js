/**
 * Created by 2019-02-28 13:46
 * 一个可编辑，和展示的Form表单组件
 * 合同查看详情时产品信息里有应用
 * 用法 formItems=[{
                title?: Intl.get('common.start.end.time', '起止时间'), // 选填，label名称
                dataIndex: 'name', // 必填，输入控件唯一标志
                editable?: true,  // 选填，是否可编辑
                editor?: 'Select', // 编辑器的类型，必须是antd或者antc上的组件，选填，默认为Input
                editorChildrenType?: 'Option', // 选填，编辑器的子组件类型
                editorChildren？: (Children) => { // 选填，Children为编辑器的子组件，
                    return _.map(appList, item => {
                        return <Children value={item.app_id} key={item.app_id}>{item.app_name}</Children>;
                    });
                },
                display?: 'inline', // 是否一行显示，可不填
                editorConfig?: { 选填, Form表单getFieldDecorator的配置项
                    rules: (text,record,index) => { // rules规则，[Function|Object],可以是函数或者对象
                        return [{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()];
                    }
                },
                editorProps?: (record, isEdit) => { // 选填，编辑器上的属性，[Function|Object],可以是函数或者对象
                    return {
                        onChange: (e) => {}
                    };
                },
                formLayOut: { // 必填，文本和输入控件占据的位置
                    labelCol: { span: 6 },
                    wrapperCol: { span: 18 }
                },
                dynamicRule?: { // 选填， 动态验证函数
                    index: 2, // 插入到rules规则数组里的索引
                    key: 'amount', // 需要联动验证的另一控件的标志(dataIndex)
                    fn: (parent) => { // 参数[parent],使用此组件的父组件的上下文，返回一个validator验证函数
                        return {
                            validator: (rule,value,callback) => {
                                // 这里需要获取其他产品的价格
                                let validateArr = [];
                                _.each(this.state.products, (item, index) => {
                                    let ref = parent[`form${item.id}Ref`];
                                    let formValue = ref.props.form.getFieldsValue();
                                    if(!_.get(item,'account_start_time')) {
                                        item.account_start_time = moment().valueOf();
                                        item.account_end_time = moment().valueOf();
                                    }
                                    validateArr.push({...item, ...formValue});
                                });
                                this.validateAmount(validateArr,rule,value,callback);
                            }
                        };
                    },
                },
            },];
        <EditFormCell
            wrappedComponentRef={ref => this[`form${product.id}Ref`] = ref}
            parent={this}
            formItems={formItems}
            product={product}
            isEdit={this.state.isEdit}
            productIndex={productIndex}
         />
 */
import { Form } from 'antd';
const FormItem = Form.Item;

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
    // 获取输入控件
    getEditor = (props, product) => {
        let editor = props.editor;
        let editorProps = props.editorProps;
        let Editor;

        if(editor === 'AntcValidity'){
            Editor = require('antc')[editor];
        }else if(editor){
            Editor = require('antd')[editor];
        }

        if(_.isFunction(editorProps)) editorProps = editorProps(product,product.isEditting);

        let renderElement;
        const { getFieldDecorator } = this.props.form;
        // 是否可编辑
        if(product.isEditting && props.editable){
            if(editor !== 'AntcValidity') {
                // 编辑器有无子组件
                if(!_.isFunction(props.editorChildren)){
                    renderElement = getFieldDecorator(props.dataIndex, props.editorConfig)(<Editor {...editorProps}/>);
                }else {
                    let editorChildren = props.editorChildren(Editor[props.editorChildrenType]);
                    renderElement = getFieldDecorator(props.dataIndex, props.editorConfig)(<Editor {...editorProps}>{editorChildren}</Editor>);
                }
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
    // 获取动态验证
    getDynamic(item) {
        let product = this.props.product, parent = this.props.parent;
        // 不为起止时间选择器时
        if(item.editor !== 'AntcValidity'){
            let {initialValue,rules} = item.editorConfig;
            item.editorConfig.initialValue = _.isNil(initialValue) ? product[item.dataIndex] : (_.isFunction(initialValue) ? initialValue(product[item.dataIndex]) : initialValue);
            _.isNil(item.formLayOut) ? item.formLayOut = {} : '';
            let rawRules = !_.isNil(rules) ? rules : [];
            // 如果是一个函数，调用并返回值
            if(_.isFunction(rawRules)) {
                item.editorConfig.rules = rawRules(product[item.dataIndex], product, this.props.productIndex);
                // 动态验证时
                if(!_.isEmpty(item.dynamicRule) && item.dynamicRule.key) {
                    item.editorConfig.rules[item.dynamicRule.index] = ((parent) => {
                        return item.dynamicRule.fn(parent);
                    })(parent);
                }
            }
        }
    }

    render() {
        const {
            product,
            ...restProps
        } = this.props;


        return (
            <Form key={product.id} className='clearfix'>
                {restProps.formItems.map((item,index) => {
                    item.editorConfig = item.editorConfig || {};
                    item.editorProps = item.editorProps || {};
                    item.editor = item.editor || 'Input';

                    // 是否有动态验证方法
                    this.getDynamic(item);

                    // 是否一行显示
                    if(item.display === 'inline') {
                        if(product.isEditting) {
                            item.formLayOut.className = 'form-inline';
                        } else {
                            item.formLayOut = {
                                labelCol: { span: 6 }
                            };
                        }
                    }
                    // 如果为起止时间选择器,并且是单个添加时
                    if(item.editor === 'AntcValidity' && !_.isNil(product.singleAdd)) {
                        item.formLayOut.style = {marginTop: 5};
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

export default Form.create()(EditFormItem);