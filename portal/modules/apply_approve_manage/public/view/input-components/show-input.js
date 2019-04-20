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
import {Input,Checkbox } from 'antd';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
class InputShow extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {

        };
    }
    onStoreChange = () => {

    };


    render = () => {
        var formItem = this.props.formItem;
        return (
            <div className="show-container">
                <div>{formItem.titleLabel}</div>
            </div>
        );
    }
}

InputShow.defaultProps = {
    formItem: {},
};

InputShow.propTypes = {
    formItem: PropTypes.object,
};
export default InputShow;