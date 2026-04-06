from typing import Any, Type
from langchain_tavily import TavilySearch
import os
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field, create_model

os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

search = TavilySearch(max_results=5)

#数据模型类(静态参数)
class SearchArgs(BaseModel):
    query: str = Field(..., description="需要联网进行搜索的关键词或问题")

class SearchWebTool(BaseTool):
    name: str = "web_search"
    description: str = "使用网络搜索引擎搜索公开信息以获取最新的资料和数据。"
    #args_schema: Type[BaseTool]= SearchArgs #设置工具参数描述

    #动态参数
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.args_schema = create_model("SearchArgs", query=(str, Field(..., description="需要联网进行搜索的关键词或问题")))



    def _run(self, query: str) -> str:
        try:
            response = search.run(query)
            if response:
                return response
            else:
                return "没有找到相关的信息。"
        except Exception as e:
            return f"An error occurred: {str(e)}"

    async def _arun(self, query: str) -> str:
        return self._run(query)