/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import { Row, Col,Input,Checkbox } from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
class InputEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    onStoreChange = () => {

    };
    render = () => {
        var form = this.props.formItem;
        return (
            <div className="edit-container">
                <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.name', '组件名称')}</span>
                    <span className="text-components">col-12</span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.alert.topic', '标题')}</span>
                    <span className="text-components">
                        <Input/>
                    </span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('apply.components.tip.msg', '提示说明')}</span>
                    <span className="text-components"><Input/></span>
                </div>
                <div className="component-row">
                    <span className="label-components">{Intl.get('crm.186', '其他')}</span>
                    <span className="text-components"><Checkbox/></span>
                </div>
                <SaveCancelButton/>
            </div>
        );
    }
}

InputEdit.defaultProps = {
    formItem: {}
};

InputEdit.propTypes = {
    formItem: PropTypes.object,
};
export default InputEdit;