/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/column-item.less';

class ColumnItem extends React.Component {
    render() {
        let containerClass = 'home-column-item';
        if (this.props.contianerClass) {
            containerClass += ` ${this.props.contianerClass}`;
        }
        return (
            <div className={containerClass}>
                {this.props.title || this.props.titleIcon || this.props.titleHandleElement ? (
                    <div className='column-item-title'>
                        {this.props.title || this.props.titleIcon ? (
                            <span className='title-content'>
                                {this.props.titleIcon || ''}
                                <span className='title-descr'>{this.props.title || ''}</span>
                            </span>
                        ) : null}
                        {this.props.titleHandleElement || null}
                    </div>
                ) : null}
                <div className='column-item-content'>
                    {this.props.content || ''}
                </div>
            </div>);
    }
}
ColumnItem.defaultProps = {
    //特殊类的设置
    contianerClass: '',
    //标题
    title: '',
    //标题图标
    titleIcon: '',
    //标题上的操作元素
    titleHandleElement: '',
    //具体内容
    content: '',
};
ColumnItem.propTypes = {
    contianerClass: PropTypes.string,
    title: PropTypes.string,
    titleIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleHandleElement: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
export default ColumnItem;