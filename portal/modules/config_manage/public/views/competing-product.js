require("../css/index.less");
const Spinner = require("CMP_DIR/spinner");
const AlertTimer = require("CMP_DIR/alert-timer");
import Trace from "LIB_DIR/trace";
import {Icon, Alert} from "antd";
const ALERT_TIME = 4000;//错误提示的展示时间：4s
const competingProductManage = React.createClass({
    getInitialState: function () {
        return ({
            //竞品列表
            productList: [],
            //点击竞品添加按钮的loading效果是否显示
            isAddloading: false,
            //当前正在删除的竞品
            DeletingItem: "",
            //点击刷新按钮的loading效果是否显示
            isRefreshLoading: false,
            //加载失败的提示信息
            getErrMsg: '',
            //添加失败的信息
            addErrMsg: '',
            // 删除竞品失败
            deleteErrMsg: '',
        })
    },
    //获取竞品列表
    getProductList: function () {
        this.setState({
            isRefreshLoading: true
        });
        $.ajax({
            url: '/rest/competing_product',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                this.setState({
                    productList: data ? data.result : [],
                    isRefreshLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isRefreshLoading: false,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        })

    },
    componentWillMount: function () {
        this.getProductList();
    },
    //点击刷新按钮
    getRefreshInfo: function (e) {
        this.setState({
            isRefreshLoading: true,
            productList: []
        });
        this.getProductList();
    },
    //删除竞品标签
    handleDeleteItem: function (item) {
        //当前正在删除的竞品的id
        this.setState({
            DeletingItem: item
        });
        $.ajax({
            url: '/rest/competing_product/' + item,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                //在数组中删除当前正在删除的竞品
                this.state.productList = _.filter(this.state.productList, (product) => product !== item);
                this.setState({
                    DeletingItem: "",
                    productList: this.state.productList
                });
            },
            error: (errorInfo) => {
                this.setState({
                    DeletingItem: "",
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });

    },
    //增加竞品
    handleSubmit: function (e) {
        Trace.traceEvent(e, "点击添加竞品按钮");
        e.preventDefault();
        //输入的竞品名称去左右空格
        let product = $.trim(this.refs.addProduct.value);
        if (!product) {
            return;
        }
        //显示添加的loading效果
        this.setState({
            isAddloading: true
        });
        $.ajax({
            url: '/rest/competing_product',
            type: 'post',
            dateType: 'json',
            data: {product: product},
            success: (result) => {
                //数组开头添加输入的竞品
                this.state.productList.unshift(product);
                this.setState({
                    productList: this.state.productList,
                    isAddloading: false
                });
                this.refs.addProduct.value = '';

            },
            error: (errorInfo) => {
                this.setState({
                    isAddloading: false,
                    addErrMsg: errorInfo.responseJSON
                });
            }
        });

    },
    //增加竞品失败
    handleAddIndustryFail(){
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
    },

    renderErrorAlert: function (errorMsg, hide) {
        return (<AlertTimer time={ALERT_TIME} message={errorMsg} type="error" showIcon onHide={hide}/>);
    },

    handleDeleteIndustryFail: function () {
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
    },

    renderCompetingProductList: function () {
        let productList = this.state.productList;
        //正在获取数据的状态渲染
        if (this.state.isRefreshLoading) {
            return <Spinner/>;
        } else if (this.state.getErrMsg) {
            //错误提示
            return <Alert type="error" showIcon message={this.state.getErrMsg}/>;
        } else if (_.isArray(productList) && productList.length) {
            //竞品列表
            return (<ul className="mb-taglist">
                {productList.map((item, index) => {
                        return (
                            <li className="mb-tag">
                                <div className="mb-tag-content">
                                    <span className="mb-tag-text">{item}</span>&nbsp;&nbsp;
                                    <span className="glyphicon glyphicon-remove mb-tag-remove"
                                          onClick={this.handleDeleteItem.bind(this, item)}
                                          data-tracename="点击删除某个竞品按钮"
                                    />
                                    { this.state.DeletingItem === item ? (
                                        <Icon type="loading"/>
                                    ) : null}
                                </div>
                            </li>)
                    }
                )}
            </ul>);
        } else {//没有竞品时的提示
            return <Alert type="info" showIcon
                          message={Intl.get("config.manage.no.product", "暂无竞品配置，请添加！")}/>;
        }
    },
    render: function () {
        return (
            <div className="box" data-tracename="竞品配置">
                <div className="box-title">
                    {Intl.get("config.manage.competing.product", "竞品管理")}&nbsp;&nbsp;
                    <span
                        onClick={this.getProductList.bind(this)}
                        className="refresh"
                        data-tracename="点击获取竞品刷新按钮"
                    >
                        <Icon type="reload" title={Intl.get("config.manage.reload.product", "重新获取竞品")}/>
                    </span>
                    {this.state.deleteErrMsg ? this.handleDeleteIndustryFail() : null}
                </div>
                <div className="box-body">
                    {this.renderCompetingProductList()}
                </div>
                <div className="box-footer">
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <input className="mb-input" ref="addProduct"/>
                            <button className="btn mb-add-button" type="submit"
                                    disabled={this.state.isAddloading ? "disabled" : ""}>
                                {Intl.get("common.add", "添加")}
                                {this.state.isAddloading ?
                                    <Icon type="loading"/> : null}
                            </button>
                        </div>
                        {this.state.addErrMsg ? this.handleAddIndustryFail() : null}
                    </form>
                </div>
            </div>
        );
    }
});

module.exports = competingProductManage;
