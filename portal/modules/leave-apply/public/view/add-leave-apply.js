/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/add-leave-apply.less');
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
class AddLeaveApply extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};}

    onStoreChange = () => {

    };
    componentDidMount() {



    }
    //获取全部请假申请

    componentWillUnmount() {

    }
    hideLeaveApplyAddForm = () => {
        this.props.hideLeaveApplyAddForm();
    }

    render() {
        return (
            <RightPanel showFlag={true} data-tracename="添加出差申请" className="add-leave-apply-container">
                <span className="iconfont icon-close add—leave-apply-close-btn" onClick={this.hideLeaveApplyAddForm}
                    data-tracename="关闭添加出差申请面板"></span>

                <div className="add-leave-apply-wrap">
                    <BasicData
                        clueTypeTitle={Intl.get('leave.apply.add.leave.apply','出差申请')}
                    />
                    <div className="add-leave-apply-form-wrap">
                        <GeminiScrollbar>
                            
                        </GeminiScrollbar>
                    </div>

                </div>
            </RightPanel>

        );
    }
}
AddLeaveApply.defaultProps = {
    hideLeaveApplyAddForm: function() {
    },
};
AddLeaveApply.propTypes = {
    hideLeaveApplyAddForm: PropTypes.func,
};
module.exports = AddLeaveApply;