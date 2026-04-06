import sys, os
from loguru import logger

# 获得当前项目的绝对路径
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log_dir = os.path.join(root_dir, "logs")  # 存放项目日志目录的绝对路径

if not os.path.exists(log_dir):  # 如果日志目录不存在，则创建
    os.mkdir(log_dir)

LOG_FILE = "ctrip_assistant.log"  # 存储日志的文件


# Trace < Debug < Info < Success < Warning < Error < Critical

class MyLogger:
    def __init__(self):
        log_file_path = os.path.join(log_dir, LOG_FILE)
        self.logger = logger  # 写日志的对象
        # 清空所有设置
        self.logger.remove()
        # 添加控制台输出的格式
        self.logger.add(sys.stdout, level='DEBUG',
                        format="<green>{time:YYYYMMDD HH:mm:ss}</green> | "
                               "{process.name} | "
                               "{thread.name} | "
                               "<cyan>{module}</cyan>.<cyan>{function}</cyan>"
                               ":<cyan>{line}</cyan> | "
                               "<level>{level}</level>: "
                               "<level>{message}</level>",
                        )
        # 输出到文件的格式
        self.logger.add(log_file_path, level='DEBUG', encoding='UTF-8',
                        format='{time:YYYYMMDD HH:mm:ss} - '
                               "{process.name} | "
                               "{thread.name} | "
                               '{module}.{function}:{line} - {level} -{message}',
                        rotation="10 MB",
                        retention=20
                        )

    def get_logger(self):
        return self.logger

    def __call__(self, message: str, level: str = "INFO"):
        """让 MyLogger 实例可以直接被调用: log("消息", "INFO")"""
        level = level.upper()
        if level == "TRACE":
            self.logger.trace(message)
        elif level == "DEBUG":
            self.logger.debug(message)
        elif level == "INFO":
            self.logger.info(message)
        elif level == "SUCCESS":
            self.logger.success(message)
        elif level == "WARNING":
            self.logger.warning(message)
        elif level == "ERROR":
            self.logger.error(message)
        elif level == "CRITICAL":
            self.logger.critical(message)
        else:
            self.logger.info(message)

    def info(self, message):
        self.logger.info(message)

    def error(self, message):
        self.logger.error(message)

    def warning(self, message):
        self.logger.warning(message)

    def debug(self, message):
        self.logger.debug(message)

    def exception(self, message):
        self.logger.exception(message)

    def success(self, message):
        self.logger.success(message)

log = MyLogger()


if __name__ == '__main__':
    # 测试新的调用方式
    log("这是一条INFO日志", "INFO")
    log("这是一条ERROR日志", "ERROR")
    log("这是一条WARNING日志", "WARNING")
    log("这是一条DEBUG日志", "DEBUG")
    log("默认级别是INFO")

    # 原来的方式也还能用
    log.logger.info("通过 log.logger.info() 调用")

    def test():
        try:
            print(3 / 0)
        except ZeroDivisionError as e:
            log(f"错误: {e}", "ERROR")

    test()