/**
 * 有遮罩 可选线索/客户 的日程添加面板
 */
import React from 'react';
import {PropTypes} from 'prop-types'
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import DetailCard from 'CMP_DIR/detail-card';
import CrmScheduleForm from 'MOD_DIR/crm/public/views/schedule/form';
import {  Radio } from 'antd';
import './index.less'

class AddSchedule extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            topicValue: 'customer', //添加待办项时选择主题为"客户"还是"线索"
        }
    };

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
                <div className="add-todo-title">
                    <span className="iconfont icon-detail-list"/>
                    <div className="todo-topic-switch">
                        <Radio.Group
                            size="small"
                            value={_.get(this.state, 'topicValue')}
                            onChange={this.onTopicChange}
                        >
                            <Radio.Button value="customer">{Intl.get('call.record.customer', '客户')}</Radio.Button>
                            <Radio.Button value="clue">{Intl.get('crm.sales.clue', '线索')}</Radio.Button>
                        </Radio.Group>
                    </div>
                </div>
                <DetailCard className='add-todo' content={
                    <CrmScheduleForm
                        isAddToDoClicked
                        handleScheduleAdd={this.props.handleScheduleAdd}
                        handleScheduleCancel={this.props.handleCancelAddToDo}
                        topicValue={_.get(this.state, 'topicValue')}
                    />
                }>
                </DetailCard>
            </div>
        );
    }

    render = () =>{
        return(                
            this.props.isShowAddToDo ? (
            <RightPanelModal
                className="todo-add-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.props.handleCancelAddToDo.bind(this)}
                title={this.props.formTitle}
                content={this.renderCrmFormContent()}
                dataTracename={this.props.dataTracename}
            />) : null);
    }
}


AddSchedule.defaultProps = {
    isShowAddToDo: false,
    formTitle:Intl.get('home.page.add.schedule', '添加日程'),
    dataTracename: '',
};

AddSchedule.propTypes = {
    isShowAddToDo: PropTypes.bool.isRequired,//是否展示面板的flag
    handleCancelAddToDo: PropTypes.func.isRequired,//控制关闭面板的函数
    handleScheduleAdd: PropTypes.func.isRequired,//添加完成的回调

    formTitle: PropTypes.string,//标题内容
    dataTracename: PropTypes.string,//追踪事件名 
};

export default AddSchedule;