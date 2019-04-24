/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/24.
 */

import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
require('./index.less');
import classNames from 'classnames';
class Regrules extends React.Component {
    constructor(props) {
        super(props);
        var formItem = _.cloneDeep(this.props.formItem);
        this.state = {

        };
    }
    onStoreChange = () => {

    };
    render = () => {
        var formItem = this.props.formItem, hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('',{
            'err-tip': hasErrTip
        });
        return (
            <div className="edit-container">
        
            </div>
        );
    }
}

Regrules.defaultProps = {
    formItem: {},
};

Regrules.propTypes = {
    formItem: PropTypes.object,
   
};
export default Regrules;