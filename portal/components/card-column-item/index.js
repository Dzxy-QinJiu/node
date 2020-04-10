/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import './index.less';
import classNames from 'classnames';
class CardColumnItem extends React.Component {
    render() {
        let containerClass = classNames('card-column-wrap', {
            'first-card-column': this.props.isFirstColumn,//第一列有左侧间距的样式
            [this.props.contianerClass]: this.props.contianerClass,
        });
        return (
            <div className={containerClass}>
                <div className='card-column-item'>
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
                </div>
            </div>);
    }
}
CardColumnItem.defaultProps = {
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
    // 是否是第一列，有多列内容时，第一列需要有左侧的内间距
    isFirstColumn: false,
};
CardColumnItem.propTypes = {
    contianerClass: PropTypes.string,
    title: PropTypes.string,
    titleIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleHandleElement: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    isFirstColumn: PropTypes.bool
};
export default CardColumnItem;