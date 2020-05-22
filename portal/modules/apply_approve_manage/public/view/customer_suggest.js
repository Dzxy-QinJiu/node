/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/23.
 */

import {Input, Radio, Checkbox, Form} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
class CustomerContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render = () => {
        return (
            <CustomerSuggest {...this.props} />
        );
    }
}

CustomerContent.defaultProps = {

};

CustomerContent.propTypes = {

};
export default Form.create()(CustomerContent);