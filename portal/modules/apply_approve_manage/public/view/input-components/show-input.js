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
import {Input,Checkbox ,Button} from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
import {ALL_COMPONENTS,ALL_COMPONENTS_TYPE,applyComponentsType} from '../../utils/apply-approve-utils';
import classNames from 'classnames';
class InputShow extends React.Component {
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

    };
    getTargetType = (formItem) => {
        var target = _.find(applyComponentsType,item => item.name === _.get(formItem,'componentType'));
        if (target){
            var ApplyComponent = target.component;
            var componentProps = {
                placeholder: _.get(formItem,'placeholder'),
                type: formItem.type || '',
                addonAfter: formItem.addonAfter || '',
            };
            if (_.get(formItem,'componentType') === ALL_COMPONENTS.RANGEINPUT){
                componentProps.selectedArr = _.filter(_.get(formItem,'timeRange.unitList'),item=>
                    _.indexOf(_.get(formItem,'selectedArr'),item.value) > -1
                );
            };
            return <ApplyComponent {...componentProps}/>;
        }else{
            return null;
        }
    };
    handleRemoveItem = (formItem) => {
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

    render = () => {
        var formItem = this.props.formItem;
        var isRequired = _.get(formItem,'isRequired');

        var cls = classNames('title-label',{
            'required': isRequired
        });
        return (
            <div className="show-container" key={formItem.key}>
                <div className={cls}>{formItem.title}
                    <span className="pull-right icon-container">
                        {this.state.showCancelConfirmBtn ?
                            <span className="btns-container">
                                <Button className='confirm-btn' onClick={this.props.handleRemoveItem.bind(this, formItem)}>{Intl.get('crm.contact.delete.confirm', '确认删除')}</Button>
                                <Button onClick={this.cancelRemoveItem}>{Intl.get('common.cancel', '取消')}</Button>
                            </span>
                            : <span className="icon-wrap">
                                <i className="iconfont icon-update" onClick={this.handleEditItem.bind(this, formItem)}></i>
                                <i className="iconfont icon-transfer"></i>
                                <i className="iconfont icon-delete" onClick={this.handleRemoveItem.bind(this, formItem)}></i>
                            </span>}

                    </span>
                </div>
                {this.getTargetType(formItem)}
            </div>
        );
    }
}

InputShow.defaultProps = {
    formItem: {},
    handleRemoveItem: function() {
        
    },
    handleEditItem: function() {

    }
};

InputShow.propTypes = {
    formItem: PropTypes.object,
    handleRemoveItem: PropTypes.func,
    handleEditItem: PropTypes.func,
};
export default InputShow;