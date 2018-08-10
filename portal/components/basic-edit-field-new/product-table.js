/**
 * 产品展示、编辑组件

 * 适应场景：用在需要以表格形式展示数据，并能直接在表格内编辑、删除数据的情况下
 * 
 * 用法：
 * 支持antd表格的所有属性
 * 另外增加了两个属性：
 *   isEdit - 表格是否处于编辑状态，默认为false。若设置为true，则列定义中包含editable为true属性的列会显示为输入框，同时在每一行的后面会出现一个删除按钮
 *   onEdit - 表格数据被修改后触发的回调函数，会将改变后的表格数据整体传出去。通过将传出去的值再通过dataSource属性的方式回传回该组件，可实现表格展示与变化后的数据的同步。
 * 
 * 列定义中增加了一个属性：
 *   editable - 控制该列是否可编辑，若设置为true，则在表格的isEdit属性为true的情况下，该列会显示成输入框的形式，里面的值可以被编辑
 */

import { AntcEditableTable } from 'antd';
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';
import SelectAppList from '../select-app-list';

class ProductTable extends React.Component {
    static defaultProps = {
    };

    constructor(props) {
        super(props);
        this.columns = this.getColumns();
    }

    componentWillReceiveProps(nextProps) {
    }

    handleChange(value, recordIndex, column) {
    }

    handleDelete(recordIndex) {
    }

    render() {
        return (
            <div>
                <SaveCancelButton
                /> 
            </div>
        );
    }
}

export default ProductTable;
