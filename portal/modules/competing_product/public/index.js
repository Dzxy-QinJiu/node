require('./index.less');
const Spinner = require('CMP_DIR/spinner');
import Trace from 'LIB_DIR/trace';
import {Icon, Input, Button, Form, message} from 'antd';
const FormItem = Form.Item;
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {ajustTagWidth} from 'PUB_DIR/sources/utils/common-method-util';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import { validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';
import NoData from 'CMP_DIR/no-data';
import LoadDataError from 'CMP_DIR/load-data-error';
const PADDING_HEIGHT = 8; // 卡片容器的padding-top

class CometingProduct extends React.Component {
    state = {
        isLoading: true, // 获取竞品列表的loading效果是否显示
        productList: [], //竞品列表
        isAddloading: false, //点击竞品添加按钮的loading效果是否显示
        DeletingItem: '', //当前正在删除的竞品
        getErrMsg: '', //加载失败的提示信息
        addErrMsg: '', //添加失败的信息
    };

    //获取竞品列表
    getProductList = () => {
        $.ajax({
            url: '/rest/competing_product',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                this.setState({
                    productList: _.get(data, 'result'),
                    isLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isLoading: false,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        });

    };

    componentWillMount() {
        this.getProductList();
    }

    //删除竞品标签
    handleDeleteItem = (item) => {
        //当前正在删除的竞品的item
        this.setState({
            DeletingItem: item
        });
        $.ajax({
            url: '/rest/competing_product/' + item,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                if (result) {
                    //在数组中删除当前正在删除的竞品
                    let productList = _.filter(this.state.productList, (product) => product !== item);
                    this.setState({
                        DeletingItem: '',
                        productList: productList
                    });
                } else {
                    this.setState({
                        DeletingItem: ''
                    });
                    message.error(Intl.get('crm.139','删除失败'));
                }

            },
            error: (errorInfo) => {
                this.setState({
                    DeletingItem: '',
                });
                message.error(errorInfo.responseJSON || Intl.get('crm.139','删除失败'));
            }
        });

    };

    //增加竞品
    handleSubmit = (e) => {
        Trace.traceEvent(e, '点击添加竞品按钮');
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            //显示添加的loading效果
            this.setState({
                isAddloading: true
            });
            let product = _.trim(values.product);

            $.ajax({
                url: '/rest/competing_product',
                type: 'post',
                dateType: 'json',
                data: {product: product},
                success: (resData) => {
                    let flag = _.get(resData, 'result');
                    if (flag) {
                        this.props.form.setFieldsValue({product: ''});
                        //数组开头添加输入的竞品
                        this.state.productList.unshift(product);
                        this.setState({
                            productList: this.state.productList,
                            isAddloading: false,
                        });
                    } else {
                        this.setState({
                            isAddloading: false,
                            addErrMsg: Intl.get('crm.154','添加失败')
                        });
                    }
                },
                error: (errorInfo) => {
                    this.setState({
                        isAddloading: false,
                        addErrMsg: errorInfo.responseJSON || Intl.get('crm.154','添加失败')
                    });
                }
            });
        });


    };

    renderNoDataOrLoadError = (contentHeight) => {
        let productList = this.state.productList;
        let length = _.get(productList, 'length');
        let getErrMsg = this.state.getErrMsg;
        let isLoading = this.state.isLoading;
        const tipsZoneHeight = contentHeight - PADDING_HEIGHT;

        return (
            <div className="msg-tips" style={{height: tipsZoneHeight}}>
                {
                    length === 0 && !isLoading ? (
                        <NoData
                            textContent={Intl.get('competing.no.data.tips', '暂无竞品，添加竞品后，可以在客户上设置竞品，帮助销售人员更好的完成销售过程')}
                        />
                    ) : null
                }
                {
                    getErrMsg ? (
                        <LoadDataError
                            retryLoadData={this.getProductList}
                        />
                    ) : null
                }
            </div>
        );
    };


    renderCompetingProductList = () => {
        let productList = this.state.productList;
        let isLoading = this.state.isLoading;
        let contentWidth = $(window).width() - BACKGROUG_LAYOUT_CONSTANTS.FRIST_NAV_WIDTH -
            BACKGROUG_LAYOUT_CONSTANTS.NAV_WIDTH - 2 * BACKGROUG_LAYOUT_CONSTANTS.PADDING_WIDTH;
        let tagWidth = ajustTagWidth(contentWidth);

        return (
            <div className="content-zone">
                {
                    isLoading ? <Spinner/> : null
                }

                <ul className="mb-taglist">
                    {
                        _.map(productList, (item, index) => {
                            return (
                                <li className="mb-tag" key={index} style={{width: tagWidth}}>
                                    <div className="mb-tag-content">
                                        <span className="tag-content" title={item}>{item}</span>
                                        <span
                                            onClick={this.handleDeleteItem.bind(this, item)}
                                            data-tracename="点击删除某个竞品按钮"
                                            className="ant-btn"
                                        >
                                            <i className="iconfont icon-delete handle-btn-item"></i>
                                        </span>
                                        { this.state.DeletingItemId === item ? (
                                            <span ><Icon type="loading"/></span>
                                        ) : null
                                        }
                                    </div>
                                </li>
                            );
                        }
                        )}
                </ul>
            </div>
        );
    };

    // 竞品唯一性校验
    getValidator = (name) => {
        return (rule, value, callback) => {
            let productValue = _.trim(value); // 文本框中的值
            let existProductList = this.state.productList;
            let isExist = _.find(existProductList, item => item === productValue);
            if (productValue) {
                if (isExist) {
                    callback(Intl.get('competing.add.check.tips', '该竞品名称已存在'));
                } else {
                    callback();
                }
            } else {
                callback(Intl.get('organization.tree.name.placeholder', '请输入{name}名称', {name: name}));
            }

        };
    };

    resetCompetingProductFlags = () => {
        this.setState({
            addErrMsg: ''
        });
    };

    renderTopNavOperation = () => {
        const { getFieldDecorator } = this.props.form;
        const name = Intl.get('crm.competing.products', '竞品');
        const addErrMsg = this.state.addErrMsg;
        let isLoading = (this.state.isAddloading === 0);
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <Form layout='horizontal' className='form' autoComplete='off'>
                        <FormItem
                            label=''
                        >
                            {getFieldDecorator('product', {
                                rules: [{
                                    required: true,
                                    validator: this.getValidator(name),
                                }, validatorNameRuleRegex(10, name)]
                            })(
                                <Input
                                    placeholder={Intl.get('competing.product.add.placeholder', '添加竞品')}
                                    onPressEnter={this.handleSubmit}
                                    onFocus={this.resetCompetingProductFlags}
                                    addonAfter={
                                        isLoading ?
                                            <Icon type="loading" style={{marginLeft: 12}}/> :
                                            <Icon type="plus" onClick={this.handleSubmit}/>
                                    }
                                />
                            )}
                        </FormItem>
                    </Form>
                    {
                        addErrMsg ? (
                            <div className="competing-product-check">{addErrMsg}</div>
                        ) : null
                    }
                </div>
            </div>
        );
    };

    render() {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let contentHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        let productList = this.state.productList;
        let length = _.get(productList, 'length');
        return (
            <div className="competing-product-container" data-tracename="竞品" style={{height: height}}>
                <div className="competing-product-content-wrap" style={{height: height}}>
                    <div className="competing-product-top-nav">
                        {this.renderTopNavOperation()}
                    </div>
                    <GeminiScrollBar style={{height: contentHeight}}>
                        <div className="competing-product-content">
                            {
                                length ? this.renderCompetingProductList() : this.renderNoDataOrLoadError(contentHeight)
                            }
                        </div>
                    </GeminiScrollBar>

                </div>
            </div>
        );
    }
}

CometingProduct.propTypes = {
    form: PropTypes.form
};

module.exports = Form.create()(CometingProduct);
