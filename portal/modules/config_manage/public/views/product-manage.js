/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
require('../css/index.less');
const Spinner = require('CMP_DIR/spinner');
const AlertTimer = require('CMP_DIR/alert-timer');
import Trace from 'LIB_DIR/trace';
import {Icon, Alert} from 'antd';
const ALERT_TIME = 4000;//错误提示的展示时间：4s

class ProductManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //产品列表
            productList: [],
            //点击产品添加按钮的loading效果是否显示
            isAddloading: false,
            //当前正在删除的产品
            DeletingItem: '',
            //点击刷新按钮的loading效果是否显示
            isRefreshLoading: false,
            //加载失败的提示信息
            getErrMsg: '',
            //添加失败的信息
            addErrMsg: '',
            // 删除产品失败
            deleteErrMsg: '',
        };
    }

    //获取产品列表
    getProductList = () => {
        this.setState({
            isRefreshLoading: true
        });
        $.ajax({
            url: '/rest/product',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                this.setState({
                    productList: _.get(data, 'list', []),
                    isRefreshLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isRefreshLoading: false,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        });

    };

    componentWillMount() {
        this.getProductList();
    }

    //点击刷新按钮
    getRefreshInfo = (e) => {
        this.setState({
            isRefreshLoading: true,
            productList: []
        });
        this.getProductList();
    };

    //删除产品标签
    handleDeleteItem = (itemId) => {
        //当前正在删除的产品的id
        this.setState({
            DeletingItem: itemId
        });
        $.ajax({
            url: '/rest/product/' + itemId,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                //在数组中删除当前正在删除的产品
                let productList = _.filter(this.state.productList, (product) => product.id !== itemId);
                this.setState({
                    DeletingItem: '',
                    productList
                });
            },
            error: (errorInfo) => {
                this.setState({
                    DeletingItem: '',
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });

    };

    //增加产品
    handleSubmit = (e) => {
        Trace.traceEvent(e, '点击添加产品按钮');
        e.preventDefault();
        //输入的产品名称去左右空格
        let product = _.trim(this.refs.addProduct.value);
        if (!product) {
            return;
        }
        //显示添加的loading效果
        this.setState({
            isAddloading: true
        });
        $.ajax({
            url: '/rest/product',
            type: 'post',
            dateType: 'json',
            data: {name: product},
            success: (result) => {
                let productList = this.state.productList || [];
                if (result) {
                    //数组开头添加输入的产品
                    productList.unshift(result);
                    this.refs.addProduct.value = '';
                }
                this.setState({
                    productList,
                    isAddloading: false
                });
            },
            error: (errorInfo) => {
                this.setState({
                    isAddloading: false,
                    addErrMsg: errorInfo.responseJSON
                });
            }
        });

    };

    //增加产品失败
    handleAddProductFail = () => {
        var hide = () => {
            this.setState({
                addErrMsg: '',
                isAddloading: false
            });
        };
        return (
            <div className="add-config-fail">
                {this.renderErrorAlert(this.state.addErrMsg, hide)}
            </div>
        );
    };

    renderErrorAlert = (errorMsg, hide) => {
        return (<AlertTimer time={ALERT_TIME} message={errorMsg} type="error" showIcon onHide={hide}/>);
    };

    handleDeleteProductFail = () => {
        var hide = () => {
            this.setState({
                deleteErrMsg: ''
            });
        };
        return (
            <div className="delete_ip_config_err_tips">
                {this.renderErrorAlert(this.state.deleteErrMsg, hide)}
            </div>
        );
    };

    renderProductList = () => {
        let productList = this.state.productList;
        //正在获取数据的状态渲染
        if (this.state.isRefreshLoading) {
            return <Spinner/>;
        } else if (this.state.getErrMsg) {
            //错误提示
            return <Alert type="error" showIcon message={this.state.getErrMsg}/>;
        } else if (_.isArray(productList) && productList.length) {
            //产品列表
            return (<ul className="mb-taglist">
                {productList.map((item, index) => {
                    return (
                        <li className="mb-tag" key={index}>
                            <div className="mb-tag-content">
                                <span className="mb-tag-text">{item.name}</span>&nbsp;&nbsp;
                                <span className="glyphicon glyphicon-remove mb-tag-remove"
                                    onClick={this.handleDeleteItem.bind(this, item.id)}
                                    data-tracename="点击删除某个产品按钮"
                                />
                                { this.state.DeletingItem === item.id ? (
                                    <Icon type="loading"/>
                                ) : null}
                            </div>
                        </li>);
                }
                )}
            </ul>);
        } else {//没有产品时的提示
            return <Alert type="info" showIcon
                message={Intl.get('config.no.product', '暂无产品配置，请添加！')}/>;
        }
    };

    render() {
        return (
            <div className="box" data-tracename="产品配置">
                <div className="box-title">
                    {Intl.get('config.product.manage', '产品管理')}&nbsp;&nbsp;
                    <span
                        onClick={this.getProductList.bind(this)}
                        className="refresh"
                        data-tracename="点击获取产品刷新按钮"
                    >
                        <Icon type="reload" title={Intl.get('config.product.reload', '重新获取产品')}/>
                    </span>
                    {this.state.deleteErrMsg ? this.handleDeleteProductFail() : null}
                </div>
                <div className="box-body">
                    {this.renderProductList()}
                </div>
                <div className="box-footer">
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <input className="mb-input" ref="addProduct"/>
                            <button className="btn mb-add-button" type="submit"
                                disabled={this.state.isAddloading ? 'disabled' : ''}>
                                {Intl.get('common.add', '添加')}
                                {this.state.isAddloading ?
                                    <Icon type="loading"/> : null}
                            </button>
                        </div>
                        {this.state.addErrMsg ? this.handleAddProductFail() : null}
                    </form>
                </div>
            </div>
        );
    }
}

export default ProductManage;

