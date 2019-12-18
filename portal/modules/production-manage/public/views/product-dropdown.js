/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/1/8.
 */
import {Checkbox, Button, Icon, message, Input} from 'antd';
const CheckboxGroup = Checkbox.Group;
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import classNames from 'classnames';
import util from '../utils/production-util';
class ProductDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            integrateType: props.integrateType,
            productList: props.productList,
            checkedList: [],
            addErrorMsg: '',
            searchValue: '',
            isAddingProduct: false,
        };
    }

    onProductCheck = (checkedList) => {
        this.setState({checkedList, addErrorMsg: ''});
    }
    onSearchValChange = (e) => {
        this.setState({searchValue: _.trim(e.target.value)});
    }

    renderProductList() {
        let searchValue = this.state.searchValue;
        return (
            <div className="import-product-list-container">
                <Input placeholder={Intl.get('common.product.search.placeholder', '请输入产品名进行筛选')}
                    value={searchValue}
                    onChange={this.onSearchValChange}
                    className='search-product-input'
                />
                <div className="product-list">
                    <GeminiScrollbar>
                        <CheckboxGroup value={this.state.checkedList} onChange={this.onProductCheck}>
                            {_.map(this.state.productList, (item, index) => {
                                //搜索时，隐藏掉不符合搜索条件的选项
                                let checkboxCls = classNames('product-checkbox-item', {
                                    'hidden-checkbox': searchValue && item.name && item.name.indexOf(searchValue) === -1
                                });
                                return (
                                    <div key={index} className={checkboxCls}><Checkbox
                                        value={item.id}>{item.name}</Checkbox></div>);
                            })}
                        </CheckboxGroup>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }

    clearCheckedProduct = () => {
        this.setState({checkedList: [], addErrorMsg: ''});
    };

    handleSubmit = () => {
        if (_.get(this.state, 'checkedList[0]')) {
            this.integrateProdcut(this.state.checkedList);
        } else {
            this.setState({addErrorMsg: Intl.get('leave.apply.select.product', '请选择产品')});
        }
    }
    //集成opalte、Matomo产品
    integrateProdcut = (productList) => {
        this.setState({isAddingProduct: true});
        $.ajax({
            url: '/rest/product/' + this.state.integrateType,
            type: 'post',
            dataType: 'json',
            data: {ids: productList.join(',')},
            success: (result) => {
                this.setState({
                    isAddingProduct: false,
                    addErrorMsg: ''
                });
                if (_.get(result, '[0]')) {
                    _.each(result, item => {
                        this.props.afterOperation(util.CONST.ADD, item);
                    });
                }
                //隐藏批量变更标签面板
                if(_.isFunction(_.get(this.productDropdownRef, 'handleCancel'))){
                    this.productDropdownRef.handleCancel();
                }
                message.success(Intl.get('config.product.import.finish', '导入完成'));
            },
            error: (xhr) => {
                this.setState({
                    isAddingProduct: false,
                    addErrorMsg: xhr.responseJSON || Intl.get('config.product.import.failed', '导入失败')
                });
            }
        });
    }

    render() {
        let integrateType = this.state.integrateType.toUpperCase();
        let importBtn = (
            <Button>
                <i className='iconfont icon-oplate'></i>
                {Intl.get('config.product.list.import', '导入产品')}
                <Icon type="down"/>
            </Button>);
        return (
            <div className="product-dropdown-container btn-item">
                <AntcDropdown
                    datatraceContainer='添加产品页面导入产品'
                    ref={productDropdown => this.productDropdownRef = productDropdown}
                    content={importBtn}
                    overlayTitle={Intl.get('config.product.import.tip', '您已集成{type}，可以导入以下{type}的产品', {type: integrateType})}
                    isSaving={this.state.isAddingProduct}
                    overlayContent={this.renderProductList()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get('common.import', '导入')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    unSelectDataTip={this.state.addErrorMsg}
                    btnAtTop={false}
                    clearSelectData={this.clearCheckedProduct}
                    overlayClassName="import-product-dropdown-container"
                />
            </div>
        );
    }
}
ProductDropdown.propTypes = {
    integrateType: PropTypes.string,
    productList: PropTypes.array,
    afterOperation: PropTypes.func
};
export default ProductDropdown;