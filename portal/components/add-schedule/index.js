/**
 * 有遮罩 可选线索/客户 的日程添加面板
 */
import './index.less';
import React from 'react';
import { PropTypes } from 'prop-types';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import DetailCard from 'CMP_DIR/detail-card';
import CrmScheduleForm from 'MOD_DIR/crm/public/views/schedule/form';

class AddSchedule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topicValue: 'customer', //添加日程项时选择主题为"客户"还是"线索"
        };
    }
    checkObjectName
    // 待办项的topic修改时
    onTopicChange = (e) => {
        this.setState({
            topicValue: e.target.value
        });
    }

    // 渲染待办项
    renderCrmFormContent() {
        return (
            <div className="add-todo-container">
                <DetailCard className='add-todo' content={
                    <CrmScheduleForm
                        isAddToDoClicked
                        addFromMyWork={this.props.addFromMyWork}
                        handleScheduleAdd={this.props.handleScheduleAdd}
                        handleScheduleCancel={this.props.handleCancelAddToDo}
                        topicValue={_.get(this.state, 'topicValue')}
                    />
                }>
                </DetailCard>
            </div>
        );
    }

    render = () => {
        return (
            this.props.isShowAddToDo ? (
                <RightPanelModal
                    className="todo-add-container"
                    isShowMadal={true}
                    isShowCloseBtn={true}
                    onClosePanel={this.props.handleCancelAddToDo.bind(this)}
                    title={Intl.get('home.page.add.schedule', '添加日程')}
                    content={this.renderCrmFormContent()}
                    dataTracename={'添加日程'}
                />) : null);
    }
}

AddSchedule.defaultProps = {
    addFromMyWork: false,
    isShowAddToDo: false,
    dataTracename: '',
    handleScheduleAdd: () => { },
};

AddSchedule.propTypes = {
    addFromMyWork: PropTypes.bool,//是否从我的工作中添加的日程
    isShowAddToDo: PropTypes.bool,//是否展示面板的flag
    handleCancelAddToDo: PropTypes.func,//控制关闭面板的函数
    handleScheduleAdd: PropTypes.func,//添加完成的回调
};

export default AddSchedule;