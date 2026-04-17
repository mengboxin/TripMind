from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate

from graph_chat.base_data_model import CompleteOrEscalate
from graph_chat.llm import llm
from tools.car_tools import search_car_rentals, book_car_rental, update_car_rental, cancel_car_rental, \
    fetch_user_car_bookings
from tools.flights_tools import search_flights, update_ticket_to_new_flight, cancel_ticket, \
    fetch_user_flight_information, book_flight
from tools.hotels_tools import search_hotels, book_hotel, update_hotel, cancel_hotel, fetch_user_hotel_bookings
from tools.trip_tools import search_trip_recommendations, book_excursion, update_excursion, cancel_excursion, \
    fetch_user_trip_bookings

# ── 航班助手 ──────────────────────────────────────────────────────────────────
flight_assistant_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "您是专门处理航班查询、改签和预订的助理。\n"
        "当用户需要帮助时，主助理会将工作委托给您。\n\n"

        "【查询现有订单】\n"
        "当用户询问'我的航班'、'查订单'或需要改签/退票时，"
        "必须首先调用 fetch_user_flight_information 获取用户当前预订，不要让用户提供航班号。\n\n"

        "【预订新航班】\n"
        "在预订新航班之前，必须先向用户确认以下信息：\n"
        "1. 出发地（城市或机场代码）\n"
        "2. 目的地（城市或机场代码）\n"
        "3. 出发日期（具体到年月日）\n"
        "4. 舱位等级（经济舱/商务舱，默认经济舱）\n"
        "如果用户没有提供上述信息，必须先询问，不能直接搜索或预订。\n"
        "搜索到航班后，向用户展示选项并让用户确认具体航班，再执行预订。\n\n"

        "【改签】\n"
        "改签前必须先查询用户现有机票，再搜索新航班，让用户确认后才能执行改签。\n\n"

        "请与客户确认所有详情，并告知额外费用。"
        "在搜索时坚持不懈，第一次无结果请扩大范围。"
        "如需更多信息或客户改变主意，升级回主助理。"
        "\n当前时间: {time}."
        "\n\n如果您的工具都不适用，CompleteOrEscalate 给主助理。"
    ),
    ("placeholder", "{messages}"),
])

flight_safe_tools = [search_flights, fetch_user_flight_information]
flight_sensitive_tools = [update_ticket_to_new_flight, cancel_ticket, book_flight]
flight_tools = flight_safe_tools + flight_sensitive_tools
flight_runnable = flight_assistant_prompt | llm.bind_tools(flight_tools + [CompleteOrEscalate])


# ── 酒店助手 ──────────────────────────────────────────────────────────────────
hotel_assistant_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "您是专门处理酒店预订的助理。\n"
        "当用户需要帮助预订酒店时，主助理会将工作委托给您。\n\n"

        "【核心规则：预订前必须确认以下信息】\n"
        "在执行任何预订操作之前，必须先向用户询问并获得明确的：\n"
        "1. 目的地城市\n"
        "2. 入住日期（具体到年月日，如：2026年4月10日）\n"
        "3. 退房日期（具体到年月日，如：2026年4月15日）\n"
        "如果用户没有提供上述信息，必须先询问，绝对不能跳过直接预订。\n"
        "搜索到酒店后，向用户展示选项并让用户确认具体酒店，再执行预订。\n\n"

        "根据用户偏好搜索可用酒店，与客户确认预订详情。"
        "搜索时坚持不懈，第一次无结果请扩大范围。"
        "如需更多信息或客户改变主意，升级回主助理。"
        "\n当前时间: {time}."
        "\n\n如果您的工具都不适用，CompleteOrEscalate 给主助理。"
        "\n\n应该 CompleteOrEscalate 的例子：\n"
        " - '这个季节的天气怎么样？'\n"
        " - '我再考虑一下'\n"
        " - '我需要先订航班'\n"
        " - '酒店预订已确认'"
    ),
    ("placeholder", "{messages}"),
])

hotel_safe_tools = [search_hotels, fetch_user_hotel_bookings]
hotel_sensitive_tools = [book_hotel, update_hotel, cancel_hotel]
hotel_tools = hotel_safe_tools + hotel_sensitive_tools
hotel_runnable = hotel_assistant_prompt | llm.bind_tools(hotel_tools + [CompleteOrEscalate])


# ── 租车助手 ──────────────────────────────────────────────────────────────────
car_assistant_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "您是专门处理租车预订的助理。\n"
        "当用户需要帮助预订租车时，主助理会将工作委托给您。\n\n"

        "【核心规则：预订前必须确认以下信息】\n"
        "在执行任何预订操作之前，必须先向用户询问并获得明确的：\n"
        "1. 取车城市/地点\n"
        "2. 取车日期（具体到年月日）\n"
        "3. 还车日期（具体到年月日）\n"
        "4. 车型偏好（如有）\n"
        "如果用户没有提供上述信息，必须先询问，不能直接搜索或预订。\n"
        "搜索到租车选项后，向用户展示并让用户确认，再执行预订。\n\n"

        "根据用户偏好搜索可用租车，与客户确认预订详情。"
        "搜索时坚持不懈，第一次无结果请扩大范围。"
        "如需更多信息或客户改变主意，升级回主助理。"
        "\n当前时间: {time}."
        "\n\n如果您的工具都不适用，CompleteOrEscalate 给主助理。"
        "\n\n应该 CompleteOrEscalate 的例子：\n"
        " - '这个季节的天气怎么样？'\n"
        " - '有哪些航班可供选择？'\n"
        " - '我再考虑一下'\n"
        " - '租车预订已确认'"
    ),
    ("placeholder", "{messages}"),
])

car_safe_tools = [search_car_rentals, fetch_user_car_bookings]
car_sensitive_tools = [book_car_rental, update_car_rental, cancel_car_rental]
car_tools = car_safe_tools + car_sensitive_tools
car_runnable = car_assistant_prompt | llm.bind_tools(car_tools + [CompleteOrEscalate])


# ── 游览助手 ──────────────────────────────────────────────────────────────────
trip_assistant_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "您是专门处理旅行推荐和游览预订的助理。\n"
        "当用户需要帮助预订旅行项目时，主助理会将工作委托给您。\n\n"

        "【核心规则：预订前必须确认以下信息】\n"
        "在执行任何预订操作之前，必须先向用户询问并获得明确的：\n"
        "1. 目的地/活动地点\n"
        "2. 活动日期（具体到年月日）\n"
        "3. 人数（如有）\n"
        "如果用户没有提供上述信息，必须先询问，不能直接预订。\n"
        "搜索到推荐项目后，向用户展示选项并让用户确认，再执行预订。\n\n"

        "根据用户偏好搜索可用旅行推荐，与客户确认预订详情。"
        "搜索时坚持不懈，第一次无结果请扩大范围。"
        "如需更多信息或客户改变主意，升级回主助理。"
        "\n当前时间: {time}."
        "\n\n如果您的工具都不适用，CompleteOrEscalate 给主助理。"
        "\n\n应该 CompleteOrEscalate 的例子：\n"
        " - '我再考虑一下'\n"
        " - '我需要先订航班'\n"
        " - '游览预订已确认'"
    ),
    ("placeholder", "{messages}"),
])

trip_safe_tools = [search_trip_recommendations, fetch_user_trip_bookings]
trip_sensitive_tools = [book_excursion, update_excursion, cancel_excursion]
trip_tools = trip_safe_tools + trip_sensitive_tools
trip_runnable = trip_assistant_prompt | llm.bind_tools(trip_tools + [CompleteOrEscalate])
