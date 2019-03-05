/**
 * 客户列表面板
 *
 * 包含客户列表的右侧面板，用于点击统计数字时滑出右侧面板显示详细的客户列表等场景
 */

import ListPanel from 'CMP_DIR/list-panel';
import CustomerList from './crm-list';

function CustomerListPanel(props) { 
    return (
        <ListPanel listType='customer'>
            <CustomerList {...props}/>
        </ListPanel>
    );
}

export default CustomerListPanel;
