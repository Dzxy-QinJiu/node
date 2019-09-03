/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/26.
 */
var React = require('react');
require('./index.less');
import {renderClueStatus} from 'PUB_DIR/sources/utils/common-method-util';

class BasicData extends React.Component {
    render() {
        return (
            <div className="basic-info-container">
                <div className="clue-type-title">
                    {renderClueStatus(this.props.clueStatus)}
                    {this.props.clueTypeTitle}
                </div>
            </div>
        );
    }
}
BasicData.defaultProps = {
    clueStatus: '',
    clueTypeTitle: ''
};
BasicData.propTypes = {
    clueStatus: PropTypes.string,
    clueTypeTitle: PropTypes.string,
};

module.exports = BasicData;
