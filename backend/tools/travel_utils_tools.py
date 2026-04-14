"""
旅行实用工具集：天气、汇率、时区、签证、紧急电话
全部使用免费 API，无需 key
"""
import requests
from typing import Optional
from langchain_core.tools import tool
from utils.log_utils import log

# 城市坐标缓存（常用城市）
CITY_COORDS = {
    "北京": (39.90, 116.40), "上海": (31.23, 121.47), "广州": (23.13, 113.26),
    "深圳": (22.54, 114.06), "成都": (30.57, 104.07), "杭州": (30.25, 120.15),
    "东京": (35.69, 139.69), "大阪": (34.69, 135.50), "首尔": (37.57, 126.98),
    "曼谷": (13.75, 100.52), "新加坡": (1.35, 103.82), "吉隆坡": (3.14, 101.69),
    "巴厘岛": (-8.41, 115.19), "马尔代夫": (1.97, 73.22), "迪拜": (25.20, 55.27),
    "巴黎": (48.85, 2.35), "伦敦": (51.51, -0.12), "罗马": (41.90, 12.50),
    "巴塞罗那": (41.39, 2.17), "阿姆斯特丹": (52.37, 4.90), "布拉格": (50.08, 14.42),
    "苏黎世": (47.38, 8.54), "维也纳": (48.21, 16.37), "圣托里尼": (36.39, 25.43),
    "纽约": (40.71, -74.01), "洛杉矶": (34.05, -118.24), "迈阿密": (25.77, -80.19),
    "悉尼": (-33.87, 151.21), "墨尔本": (-37.81, 144.96), "奥克兰": (-36.85, 174.76),
    "开罗": (30.04, 31.24), "开普敦": (-33.93, 18.42), "马拉喀什": (31.63, -7.99),
}

WMO_CODES = {
    0:"晴天☀️", 1:"晴间多云🌤️", 2:"多云⛅", 3:"阴天☁️",
    45:"雾🌫️", 48:"冻雾🌫️", 51:"小毛毛雨🌦️", 53:"毛毛雨🌦️", 55:"大毛毛雨🌧️",
    61:"小雨🌧️", 63:"中雨🌧️", 65:"大雨🌧️", 71:"小雪🌨️", 73:"中雪❄️", 75:"大雪❄️",
    80:"阵雨🌦️", 81:"中阵雨🌧️", 82:"强阵雨⛈️", 95:"雷暴⛈️", 99:"强雷暴⛈️",
}


def _get_coords(city: str):
    """获取城市坐标，先查缓存，再用 geocoding API"""
    if city in CITY_COORDS:
        return CITY_COORDS[city]
    try:
        r = requests.get(
            f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=zh&format=json",
            timeout=5
        )
        results = r.json().get("results", [])
        if results:
            return results[0]["latitude"], results[0]["longitude"]
    except Exception:
        pass
    return None, None


@tool
def get_weather(city: str, days: int = 3) -> str:
    """
    【查询天气】
    查询指定城市的当前天气和未来天气预报。

    参数：
    - city: 城市名称（支持中文，如"东京"、"巴黎"、"上海"）
    - days: 预报天数（1-7天，默认3天）

    返回：当前天气状况、温度、湿度、风速，以及未来几天的天气预报。
    """
    from utils.cache_utils import cache_get, cache_set
    log.info(f"查询天气: {city}, {days}天")

    cache_key = f"weather:{city}:{days}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    lat, lon = _get_coords(city)
    if not lat:
        return f"抱歉，未能找到城市 '{city}' 的位置信息，请检查城市名称是否正确。"

    days = max(1, min(7, days))
    try:
        r = requests.get(
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m,apparent_temperature"
            f"&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum"
            f"&timezone=auto&forecast_days={days}",
            timeout=8
        )
        data = r.json()
        cur = data.get("current", {})
        daily = data.get("daily", {})

        weather_desc = WMO_CODES.get(cur.get("weathercode", 0), "未知")
        result = (
            f"📍 {city} 当前天气\n"
            f"天气：{weather_desc}\n"
            f"温度：{cur.get('temperature_2m')}°C（体感 {cur.get('apparent_temperature')}°C）\n"
            f"湿度：{cur.get('relative_humidity_2m')}%\n"
            f"风速：{cur.get('windspeed_10m')} km/h\n\n"
            f"📅 未来{days}天预报：\n"
        )
        for i in range(min(days, len(daily.get("time", [])))):
            d = daily["time"][i]
            desc = WMO_CODES.get(daily["weathercode"][i], "未知")
            tmax = daily["temperature_2m_max"][i]
            tmin = daily["temperature_2m_min"][i]
            rain = daily.get("precipitation_sum", [0]*days)[i]
            result += f"  {d}：{desc} {tmin}~{tmax}°C"
            if rain > 0:
                result += f" 降水{rain}mm"
            result += "\n"

        cache_set(cache_key, result, ttl=1800)
        return result
    except Exception as e:
        log.error(f"天气查询失败: {e}")
        return f"天气查询暂时不可用，请稍后再试。"


@tool
def get_exchange_rate(from_currency: str, to_currency: str, amount: float = 1.0) -> str:
    """
    【查询汇率/货币换算】
    查询两种货币之间的实时汇率并进行换算。

    参数：
    - from_currency: 源货币代码（如 CNY、USD、EUR、JPY、GBP、THB、SGD）
    - to_currency: 目标货币代码
    - amount: 换算金额（默认1）

    返回：实时汇率和换算结果。
    """
    log.info(f"查询汇率: {amount} {from_currency} -> {to_currency}")
    try:
        r = requests.get(
            f"https://open.er-api.com/v6/latest/{from_currency.upper()}",
            timeout=6
        )
        data = r.json()
        if data.get("result") != "success":
            return f"汇率查询失败，请检查货币代码是否正确。"

        rates = data.get("rates", {})
        to_upper = to_currency.upper()
        if to_upper not in rates:
            return f"不支持的货币代码：{to_currency}"

        rate = rates[to_upper]
        converted = amount * rate
        return (
            f"💱 汇率查询结果\n"
            f"1 {from_currency.upper()} = {rate:.4f} {to_upper}\n"
            f"{amount} {from_currency.upper()} = {converted:.2f} {to_upper}\n"
            f"（数据来源：open.er-api.com，仅供参考）"
        )
    except Exception as e:
        log.error(f"汇率查询失败: {e}")
        return "汇率查询暂时不可用，请稍后再试。"


@tool
def get_timezone_info(city: str) -> str:
    """
    【查询时区/当地时间】
    查询指定城市的时区和当前当地时间。

    参数：
    - city: 城市名称（支持中文）

    返回：城市时区、当地时间、与北京时间的时差。
    """
    log.info(f"查询时区: {city}")
    lat, lon = _get_coords(city)
    if not lat:
        return f"未能找到城市 '{city}' 的位置信息。"

    try:
        r = requests.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m&timezone=auto&forecast_days=1",
            timeout=6
        )
        data = r.json()
        tz = data.get("timezone", "未知")
        tz_abbr = data.get("timezone_abbreviation", "")
        utc_offset = data.get("utc_offset_seconds", 0)
        beijing_offset = 8 * 3600
        diff_hours = (utc_offset - beijing_offset) / 3600

        from datetime import datetime, timezone, timedelta
        local_time = datetime.now(timezone(timedelta(seconds=utc_offset)))

        diff_str = f"比北京时间{'早' if diff_hours > 0 else '晚'} {abs(diff_hours):.0f} 小时" if diff_hours != 0 else "与北京时间相同"

        return (
            f"🕐 {city} 时区信息\n"
            f"时区：{tz} ({tz_abbr})\n"
            f"当地时间：{local_time.strftime('%Y-%m-%d %H:%M')}\n"
            f"{diff_str}"
        )
    except Exception as e:
        log.error(f"时区查询失败: {e}")
        return "时区查询暂时不可用。"


@tool
def get_visa_info(destination_country: str, from_country: str = "中国") -> str:
    """
    【查询签证信息】
    查询中国公民前往目标国家的签证要求（基于常识数据库）。

    参数：
    - destination_country: 目标国家（如"日本"、"泰国"、"美国"）
    - from_country: 出发国（默认"中国"）

    返回：签证类型、是否免签、办理建议。
    """
    log.info(f"查询签证: {from_country} -> {destination_country}")

    # 中国公民签证信息（基于常识，仅供参考）
    VISA_DB = {
        "泰国":     {"type":"落地签/电子签", "days":30, "note":"可在线申请电子签证（eVisa），费用约200元"},
        "新加坡":   {"type":"免签", "days":30, "note":"中国公民免签入境，最长30天"},
        "马来西亚": {"type":"免签", "days":30, "note":"中国公民免签入境，最长30天"},
        "印度尼西亚":{"type":"落地签/免签", "days":30, "note":"巴厘岛等旅游区可落地签，部分口岸免签"},
        "马尔代夫": {"type":"落地签", "days":30, "note":"抵达后免费获得30天落地签"},
        "日本":     {"type":"需提前申请", "days":15, "note":"需提前在使馆申请，通常需要1-2周，建议提前1个月办理"},
        "韩国":     {"type":"需提前申请", "days":30, "note":"需提前申请，部分城市有免签政策"},
        "越南":     {"type":"电子签/落地签", "days":30, "note":"可申请电子签证（eVisa），费用约25美元"},
        "柬埔寨":   {"type":"落地签/电子签", "days":30, "note":"可在线申请电子签证，费用30美元"},
        "迪拜":     {"type":"落地签", "days":30, "note":"阿联酋对中国公民提供落地签，费用约200元"},
        "法国":     {"type":"申根签证", "days":90, "note":"需申请申根签证，可游览26个申根国家，建议提前2个月办理"},
        "英国":     {"type":"需提前申请", "days":180, "note":"英国签证需单独申请，非申根区，建议提前6-8周"},
        "意大利":   {"type":"申根签证", "days":90, "note":"申根签证，可游览26个申根国家"},
        "西班牙":   {"type":"申根签证", "days":90, "note":"申根签证，可游览26个申根国家"},
        "德国":     {"type":"申根签证", "days":90, "note":"申根签证，可游览26个申根国家"},
        "瑞士":     {"type":"申根签证", "days":90, "note":"申根签证，可游览26个申根国家"},
        "希腊":     {"type":"申根签证", "days":90, "note":"申根签证，可游览26个申根国家"},
        "美国":     {"type":"需提前申请", "days":180, "note":"需申请B1/B2签证，面签等待时间较长，建议提前3-6个月"},
        "加拿大":   {"type":"需提前申请", "days":180, "note":"需申请访客签证，建议提前2-3个月"},
        "澳大利亚": {"type":"电子签", "days":90, "note":"可申请ETA电子旅行授权，费用约20澳元"},
        "新西兰":   {"type":"电子签", "days":90, "note":"可申请NZeTA电子旅行授权"},
        "埃及":     {"type":"落地签/电子签", "days":30, "note":"可在线申请电子签证，费用约25美元"},
        "摩洛哥":   {"type":"免签", "days":90, "note":"中国公民免签入境，最长90天"},
    }

    info = VISA_DB.get(destination_country)
    if not info:
        return (
            f"⚠️ 暂无 {destination_country} 的签证信息数据库记录。\n"
            f"建议：\n"
            f"1. 访问目标国驻华大使馆官网查询最新要求\n"
            f"2. 咨询专业签证代办机构\n"
            f"3. 出行前务必确认最新政策（签证政策可能随时变化）"
        )

    return (
        f"🛂 {destination_country} 签证信息（{from_country}公民）\n"
        f"签证类型：{info['type']}\n"
        f"最长停留：{info['days']}天\n"
        f"办理建议：{info['note']}\n\n"
        f"⚠️ 以上信息仅供参考，签证政策可能随时变化，出行前请务必核实最新要求。"
    )


@tool
def get_emergency_contacts(country: str) -> str:
    """
    【查询紧急联系电话】
    查询目标国家的紧急求助电话，包括报警、急救、消防等。

    参数：
    - country: 国家名称（如"日本"、"法国"、"美国"）

    返回：该国紧急电话号码和中国驻当地使馆电话。
    """
    log.info(f"查询紧急电话: {country}")

    EMERGENCY_DB = {
        "日本":     {"police":"110", "ambulance":"119", "fire":"119", "embassy":"+81-3-3403-3380"},
        "泰国":     {"police":"191", "ambulance":"1669", "fire":"199", "embassy":"+66-2-245-7032"},
        "新加坡":   {"police":"999", "ambulance":"995", "fire":"995", "embassy":"+65-6734-3361"},
        "马来西亚": {"police":"999", "ambulance":"999", "fire":"994", "embassy":"+60-3-2163-6095"},
        "印度尼西亚":{"police":"110", "ambulance":"118", "fire":"113", "embassy":"+62-21-5761-0060"},
        "法国":     {"police":"17",  "ambulance":"15",  "fire":"18",  "embassy":"+33-1-4723-3677"},
        "英国":     {"police":"999", "ambulance":"999", "fire":"999", "embassy":"+44-20-7299-4049"},
        "德国":     {"police":"110", "ambulance":"112", "fire":"112", "embassy":"+49-30-27588-0"},
        "意大利":   {"police":"113", "ambulance":"118", "fire":"115", "embassy":"+39-06-9279-8288"},
        "西班牙":   {"police":"091", "ambulance":"112", "fire":"080", "embassy":"+34-91-519-4242"},
        "美国":     {"police":"911", "ambulance":"911", "fire":"911", "embassy":"+1-202-495-2266"},
        "澳大利亚": {"police":"000", "ambulance":"000", "fire":"000", "embassy":"+61-2-6228-3999"},
        "日本":     {"police":"110", "ambulance":"119", "fire":"119", "embassy":"+81-3-3403-3380"},
        "阿联酋":   {"police":"999", "ambulance":"998", "fire":"997", "embassy":"+971-2-443-4276"},
        "埃及":     {"police":"122", "ambulance":"123", "fire":"180", "embassy":"+20-2-2531-9042"},
    }

    info = EMERGENCY_DB.get(country)
    if not info:
        return (
            f"📞 {country} 紧急电话\n"
            f"暂无详细数据，通用建议：\n"
            f"• 欧盟国家统一紧急电话：112\n"
            f"• 出发前请查询中国驻当地使馆电话\n"
            f"• 建议下载当地紧急求助 App"
        )

    return (
        f"📞 {country} 紧急联系电话\n"
        f"🚔 报警：{info['police']}\n"
        f"🚑 急救：{info['ambulance']}\n"
        f"🚒 消防：{info['fire']}\n"
        f"🇨🇳 中国驻当地使馆：{info['embassy']}\n\n"
        f"💡 建议出行前将这些号码存入手机"
    )
