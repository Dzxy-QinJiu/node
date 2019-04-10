/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import { Row, Col,Input } from 'antd';
class EditComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    onStoreChange = () => {

    };
    render = () => {
        var labelSpan = 6,textSpan = 18;
        return (
            <div>
                <Row>
                    <Col span={labelSpan}>col-12</Col>
                    <Col span={textSpan}>col-12</Col>
                </Row>
                <Row>
                    <Col span={labelSpan}>{Intl.get('crm.alert.topic', '标题')}</Col>
                    <Col span={textSpan}>
                        <Input/>
                    </Col>
                </Row>
                <Row>
                    <Col span={labelSpan}>col-12</Col>
                    <Col span={textSpan}>col-12</Col>
                </Row>
                <Row>
                    <Col span={labelSpan}>col-12</Col>
                    <Col span={textSpan}>col-12</Col>
                </Row>
            </div>
        );
    }
}

EditComponent.defaultProps = {

};

EditComponent.propTypes = {

};
export default EditComponent;