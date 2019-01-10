/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/29.
 */
import {Alert} from 'antd';
class ApplyNoData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {

        return (
            <div className="app_user_manage_detail app_user_manage_detail_error">
                <Alert
                    message={Intl.get('common.no.data', '暂无数据')}
                    type="info"
                    showIcon={true}
                />
            </div>
        );

    }
}
ApplyNoData.defaultProps = {};
ApplyNoData.propTypes = {};

export default ApplyNoData;