/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/15.
 */
import {Button, Icon, Upload} from 'antd';
class Annex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render = () => {
        return (
            <div className="range-input-container">
                <Upload>
                    <Button type='primary' className='download-btn'>
                        {this.props.upLoadMsg}
                        {this.props.isUpLoading ?
                            <Icon type="loading" className="icon-loading"/> : null}</Button>
                </Upload>
            </div>
        );
    }
}

Annex.defaultProps = {
    isUpLoading: false,
    upLoadMsg: Intl.get('apply.approved.upload.annex.list', '上传附件')
};

Annex.propTypes = {
    isUpLoading: PropTypes.boolean,
    upLoadMsg: PropTypes.string,
};
export default Annex;
