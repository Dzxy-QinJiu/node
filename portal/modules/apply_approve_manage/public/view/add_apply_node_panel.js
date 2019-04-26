/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/26.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicData from 'MOD_DIR/clue_customer/public/views/right_panel_top';
import {Form, Input, Select, DatePicker, Button, Icon} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
var classNames = require('classnames');
import PropTypes from 'prop-types';
const FORMLAYOUT = {
    PADDINGTOTAL: 70
};
require('../css/add-apply-node.less');
const APPROVER_TYPE = [{
    name: Intl.get('apply.add.approver.higher.level', '上级'),
    value: ''
}, {
    name: Intl.get('apply.add.approver.setting.role', '指定角色'),
    value: ''
}, {
    name: Intl.get('apply.add.approver.setting.user', '指定用户'),
    value: ''
}, {name: Intl.get('apply.add.approver.applicant.setting', '申请人指定'), value: ''},
{name: Intl.get('apply.add.approver.applicant.self', '申请人自己'), value: ''}
];

class AddApplyNodePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
    }

    render() {
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        return (
            <RightPanel showFlag={true} data-tracename="添加审批人节点" className="add-apply-approver-container">
                <BasicData
                    clueTypeTitle={Intl.get('apply.add.apply.approver', '添加审批人')}
                />
                <div className="add-apply-node-item" style={{'height': divHeight}}>
                    <GeminiScrollbar>
                        <div className="add-apply-item">
                            <div className="label">
                                {Intl.get('common.type', '类型')}
                            </div>
                            <div className="content">

                            </div>
                        </div>
                    </GeminiScrollbar>
                </div>
            </RightPanel>
        );
    }
}
AddApplyNodePanel.defaultProps = {


};
AddApplyNodePanel.propTypes = {
    




    defaultClueData: PropTypes.object,
    clueSourceArray: PropTypes.object,
    updateClueSource: PropTypes.func,
    accessChannelArray: PropTypes.object,
    updateClueChannel: PropTypes.func,
    clueClassifyArray: PropTypes.object,
    updateClueClassify: PropTypes.func,
    afterAddSalesClue: PropTypes.func,
    form: PropTypes.object,
    hideAddForm: PropTypes.func,
    appUserId: PropTypes.string,
    appUserName: PropTypes.string
};
export default Form.create()(AddApplyNodePanel);
