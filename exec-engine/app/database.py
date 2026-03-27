from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from .models.api_mgmt import Base
import os

# 数据库连接配置 (从环境变量读取或使用默认值)
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "root_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "ai_automation_db")

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    # 创建所有表 (如果不存在)
    Base.metadata.create_all(bind=engine)
    
    # 手动处理表结构更新（针对 api_environments 新增列）
    with engine.connect() as conn:
        try:
            # 检查 urls 列是否存在
            conn.execute(text("SELECT urls FROM api_environments LIMIT 1"))
        except Exception:
            try:
                print("正在为 api_environments 表添加 urls 和 variables 列...")
                conn.execute(text("ALTER TABLE api_environments ADD COLUMN urls JSON"))
                conn.execute(text("ALTER TABLE api_environments ADD COLUMN variables JSON"))
                conn.commit()
                print("表结构更新成功")
            except Exception as e:
                print(f"表结构更新失败: {e}")

        # 手动处理 api_test_cases 表结构更新
        try:
            conn.execute(text("SELECT case_type FROM api_test_cases LIMIT 1"))
        except Exception:
            try:
                print("正在为 api_test_cases 表添加 case_type 列...")
                conn.execute(text("ALTER TABLE api_test_cases ADD COLUMN case_type VARCHAR(20) DEFAULT 'test'"))
                conn.commit()
                print("api_test_cases 表结构更新成功")
            except Exception as e:
                print(f"api_test_cases 表结构更新失败: {e}")

        # 手动处理 post_operations 列
        try:
            conn.execute(text("SELECT post_operations FROM api_interfaces LIMIT 1"))
        except Exception:
            try:
                print("正在为 api_interfaces 表添加 post_operations 列...")
                conn.execute(text("ALTER TABLE api_interfaces ADD COLUMN post_operations JSON"))
                conn.commit()
            except Exception:
                pass

        try:
            conn.execute(text("SELECT post_operations FROM api_test_cases LIMIT 1"))
        except Exception:
            try:
                print("正在为 api_test_cases 表添加 post_operations 列...")
                conn.execute(text("ALTER TABLE api_test_cases ADD COLUMN post_operations JSON"))
                conn.commit()
            except Exception:
                pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
