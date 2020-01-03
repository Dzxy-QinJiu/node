/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/29.
 */
require('./index.less');
var Spinner = require('CMP_DIR/spinner');
class ApplyLoading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {


        };
    }

    render(){
        return (<div className="app_user_manage_detail apply-loading-container">
            <Spinner className='apply-loading'/></div>);
    }
}
ApplyLoading.defaultProps = {

};
ApplyLoading.propTypes = {

};

export default ApplyLoading;