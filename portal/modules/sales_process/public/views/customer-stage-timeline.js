/**
 * Created by hzl on 2019/9/3.
 */
import { Button, Icon } from 'antd';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import classNames from 'classnames';
import CustomerStageForm from 'CMP_DIR/basic-form';
import {Draggable} from 'react-beautiful-dnd';
import Trace from 'LIB_DIR/trace';
import customerStagePrivilege from '../privilege-const';

const getItemStyle = (isDragging, draggableStyle) => ({
    border: '1px solid #E5E5E5',
    height: '68px',
    // change background colour if dragging
    background: '#ffffff',
    // styles we need to apply on draggables
    ...draggableStyle
});

class CustomerStageTimeLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerStage: props.customerStage,
            isEditCustomerStage: false, // 是否编辑客户阶段，默认false
            isDeleteCustomerStage: false, // 是否删除客户阶段，默认false
            customerStageList: props.customerStageList,
        };
    }

    // 编辑客户阶段
    handleEditCustomerStage = () => {
        this.setState({
            isEditCustomerStage: true
        });
    };

    // 取消编辑的客户阶段
    handleCancelCustomerStageForm = () => {
        this.setState({
            isEditCustomerStage: false
        });
    };

    // 提交编辑的客户阶段
    handleSubmitCustomerStageForm = (submitObj) => {
        this.props.handleSubmitCustomerStageForm(submitObj);
        this.setState({
            isEditCustomerStage: false
        });
    };

    // 删除客户阶段
    handleDeleteCustomerStage = () => {
        this.setState({
            isDeleteCustomerStage: true
        });
    };

    // 确认删除客户阶段
    handleConfirmDeleteStage = (customerStage) => {
        this.props.handleConfirmDeleteStage(customerStage, () => {
            this.setState({
                isDeleteCustomerStage: false
            });
        });
    };

    // 取消删除客户阶段
    handleCancelDeleteStage = () => {
        this.setState({
            isDeleteCustomerStage: false
        });
    };

    render() {
        let customerStage = this.props.customerStage;
        let name = customerStage.name; // 阶段名称
        let description = customerStage.description;
        let contentZoneCls = classNames('customer-stage-content', 'draggable-style',{
            'no-description-content': !description,
            'show-confirm-delete-btn-stage-content': this.state.isDeleteCustomerStage,
        });
        if (this.state.isEditCustomerStage) {
            return (
                <div className="edit-customer-stage-zone">
                    <CustomerStageForm
                        isShowSaveBtn={true}
                        currentData={customerStage}
                        loading={this.props.isEditLoading}
                        customerStageList={this.props.customerStageList}
                        handleCancel={this.handleCancelCustomerStageForm}
                        handleSubmit={this.handleSubmitCustomerStageForm}
                    />
                </div>
            );
        }
        return (
            <div
                className="customer-stage-timeline-item-content"
                data-tracename="客户阶段列表"
            >
                <Draggable
                    draggableId={_.get(customerStage, 'id', this.props.index + 1)}
                    index={this.props.index}
                >
                    {(provided, snapshot) => (
                        <div className={contentZoneCls}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style,
                            )}>
                            <div className="customer-stage-content-name">
                                <span>{name}</span>
                            </div>
                            <div className="customer-stage-content-describe">
                                {description}
                            </div>
                            {
                                this.state.isDeleteCustomerStage ? (
                                    <div className="delete-operator">
                                        <span className="delete-buttons">
                                            <Button
                                                className="delete-confirm"
                                                disabled={this.props.isDeletingStageLoading}
                                                onClick={this.handleConfirmDeleteStage.bind(this, customerStage)}
                                            >
                                                {
                                                    this.props.isDeletingStageLoading ? <Icon type="loading"/> : null
                                                }
                                                {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                            </Button>
                                            <Button
                                                className="delete-cancel"
                                                onClick={this.handleCancelDeleteStage}
                                            >
                                                {Intl.get('common.cancel', '取消')}
                                            </Button>
                                        </span>
                                    </div>
                                ) : (
                                    <div className="operation-btn">
                                        <PrivilegeChecker check={customerStagePrivilege.DELETE_SPECIFIC_STAGE}>
                                            <Button
                                                className="icon-delete iconfont handle-btn-item"
                                                onClick={this.handleDeleteCustomerStage}
                                                data-tracename="删除客户阶段"
                                            >
                                            </Button>
                                        </PrivilegeChecker>
                                        <PrivilegeChecker check={customerStagePrivilege.UPDATE_SPECIFIC_STAGE}>
                                            <Button
                                                className="icon-update iconfont handle-btn-item"
                                                onClick={this.handleEditCustomerStage}
                                                data-tracename="编辑客户阶段"
                                            >
                                            </Button>
                                        </PrivilegeChecker>
                                    </div>
                                )
                            }
                        </div>
                    )}
                </Draggable>
            </div>
        );
    }
}

CustomerStageTimeLine.propTypes = {
    customerStage: PropTypes.object,
    customerStageList: PropTypes.array,
    handleSubmitCustomerStageForm: PropTypes.func,
    handleConfirmDeleteStage: PropTypes.func,
    isEditLoading: PropTypes.boolean,
    isDeletingStageLoading: PropTypes.boolean,
    index: PropTypes.number
};

export default CustomerStageTimeLine;