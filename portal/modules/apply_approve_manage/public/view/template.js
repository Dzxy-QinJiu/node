/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/15.
 */
import {Upload } from 'antd';
class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render = () => {
        return (
            <div className="range-input-container">
                <Upload></Upload>
            </div>
        );
    }
}

Template.defaultProps = {

};

Template.propTypes = {

};
export default Template;

