/** Created by 2019-02-28 13:46 */
import { Form } from 'antd';
const FormItem = Form.Item;

class EditFormItem extends React.Component {

    static propTypes = {
        form: PropTypes.object,
        parent: PropTypes.object,
        formItems: PropTypes.object,
        product: PropTypes.object,
        isEdit: PropTypes.bool,
        productIndex: PropTypes.number,
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
            <Form key={this.props.product.id} className='clearfix'>
                {restProps.formItems.map((item,index) => {
                    item.editorConfig = item.editorConfig || {};
                    item.editorProps = item.editorProps || {};
                    item.editor = item.editor || 'Input';

                    // 是否有动态验证方法
                    this.getDynamic(item);

                    // 是否一行显示
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
                    // 如果为起止时间选择器
                    if(item.editor === 'AntcValidity') {
                        item.formLayOut.style = {marginTop: 10};
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