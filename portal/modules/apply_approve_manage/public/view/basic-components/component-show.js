/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input, Checkbox, Button} from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
import {ALL_COMPONENTS, ALL_COMPONENTS_TYPE, applyComponentsType, ADDAPPLYFORMCOMPONENTS} from '../../utils/apply-approve-utils';
import classNames from 'classnames';
class componentShow extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {
            showCancelConfirmBtn: false
        };
    }

    onStoreChange = () => {

    };

    componentWillReceiveProps(nextProps) {

    }

    getTargetType = (formItem) => {
        var target = _.find(ADDAPPLYFORMCOMPONENTS, item => item.component_type === _.get(formItem, 'component_type'));
        if (target) {
            var ApplyComponent = target.component;
            if (target.component_type === ALL_COMPONENTS.DATETIME && !target.defaultValue){
                if (target.type === 'date'){
                    target.defaultValue = moment(moment().format(oplateConsts.DATE_FORMAT), oplateConsts.DATE_FORMAT);
                }else{
                    target.defaultValue = moment(moment().format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT), oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
                }
            }


            return <ApplyComponent {...this.props} {..._.assign({}, target, formItem)}/>;
        } else {
            return null;
        }
    };
    handleDeleteItem = (formItem) => {
        this.setState({
            showCancelConfirmBtn: true
        });
    };
    cancelRemoveItem = () => {
        this.setState({
            showCancelConfirmBtn: false
        });
    };
    handleEditItem = (formItem) => {
        this.props.handleEditItem(formItem);
    };
    handleRemoveItem = (formItem) => {
        this.props.handleRemoveItem(formItem,() => {
            this.setState({
                showCancelConfirmBtn: false
            });
        });
    };

    render = () => {
        var formItem = this.props.formItem;
        var is_required = _.get(formItem, 'is_required');

        var cls = classNames('title-label', {
            'required': is_required
        });
        return (
            <div className="component-show-container" key={formItem.key}>
                <div className={cls}>{formItem.title}
                    <span className="pull-right icon-container">
                        {this.state.showCancelConfirmBtn ?
                            <span className="btns-container">
                                <Button className='confirm-btn'
                                    onClick={this.handleRemoveItem.bind(this, formItem)}>{Intl.get('crm.contact.delete.confirm', '确认删除')}</Button>
                                <Button onClick={this.cancelRemoveItem}>{Intl.get('common.cancel', '取消')}</Button>
                            </span>
                            : <span className="icon-wrap">
                                <i className="iconfont icon-update"
                                    onClick={this.handleEditItem.bind(this, formItem)}></i>
                                {/*<i className="iconfont icon-transfer"></i>*/}
                                <i className="iconfont icon-delete handle-btn-item"
                                    onClick={this.handleDeleteItem.bind(this, formItem)}></i>
                            </span>}

                    </span>
                </div>
                {this.getTargetType(formItem)}
            </div>
        );
    }
}

componentShow.defaultProps = {
    formItem: {},
    handleRemoveItem: function() {

    },
    handleEditItem: function() {

    }
};

componentShow.propTypes = {
    formItem: PropTypes.object,
    handleRemoveItem: PropTypes.func,
    handleEditItem: PropTypes.func,
};
export default componentShow;
