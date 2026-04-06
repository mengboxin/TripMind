from typing import Optional
from utils.log_utils import log


def transform_location(location: Optional[str]) -> Optional[str]:
    """
    将中文城市名转换为英文（拼音/英文名），适配数据库搜索。
    """
    if not location:
        return None

    clean_location = location.strip()

    # 中文到英文的城市名映射表
    city_dict = {
        '北京': 'Beijing',
        '上海': 'Shanghai',
        '广州': 'Guangzhou',
        '深圳': 'Shenzhen',
        '成都': 'Chengdu',
        '杭州': 'Hangzhou',
        '武汉': 'Wuhan',
        '西安': 'Xian',
        '南京': 'Nanjing',
        '苏州': 'Suzhou',
        '天津': 'Tianjin',
        '重庆': 'Chongqing',
        '巴塞尔': 'Basel',
        '苏黎世': 'Zurich',
        '巴黎': 'Paris',
        '伦敦': 'London',
        '纽约': 'New York',
        '东京': 'Tokyo'
    }
    # 检测是否包含中文字符
    is_chinese = any('\u4e00' <= char <= '\u9fff' for char in clean_location)

    if is_chinese:
        # 尝试从字典获取
        translated = city_dict.get(clean_location)

        if translated:
            log.info(f"地点转换: '{clean_location}' -> '{translated}'")
            return translated
        else:
            # 如果字典里没有，记录警告，但建议返回原字符串
            log.warning(f"地点转换失败: 字典中未找到 '{clean_location}'，将保持原样搜索。")
            return clean_location

    return clean_location