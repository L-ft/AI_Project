from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict
from sqlalchemy import String, Integer, ForeignKey, JSON, Enum as SQLEnum, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"

class ApiStatus(str, Enum):
    DEVELOPING = "developing"
    TESTING = "testing"
    RELEASED = "released"
    DEPRECATED = "deprecated"


class RequirementGroupStatus(str, Enum):
    """需求文档批次状态：生成中 / 完成 / 失败"""
    PENDING = "pending"
    GENERATING = "generating"
    DONE = "done"
    FAILED = "failed"


class FunctionalTestCase(Base):
    """
    需求域下的功能测试用例（标准模板：模块、编号、标题、优先级、前置、步骤、预期等）。
    与 api_test_cases（接口自动化）分表存储。
    """
    __tablename__ = "functional_test_cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    module: Mapped[str] = mapped_column(String(512), default="")
    case_code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(512))
    priority: Mapped[str] = mapped_column(String(8), default="P2")
    category: Mapped[str] = mapped_column(String(64), default="functional")
    preconditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    steps: Mapped[Optional[List[Dict]]] = mapped_column(JSON, nullable=True)
    expected_result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    remark: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="draft")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class RequirementGroup(Base):
    """按需求文档归类的测试用例分组（同一 file_hash 可有多个 version）"""
    __tablename__ = "requirement_groups"
    __table_args__ = (
        UniqueConstraint("file_hash", "version", name="uq_requirement_groups_hash_version"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    doc_title: Mapped[str] = mapped_column(String(255))
    upload_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[RequirementGroupStatus] = mapped_column(
        SQLEnum(RequirementGroupStatus),
        default=RequirementGroupStatus.PENDING,
    )
    file_hash: Mapped[str] = mapped_column(String(64), index=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    key_points: Mapped[Optional[List[Dict]]] = mapped_column(JSON, nullable=True)

    test_cases: Mapped[List["TestCase"]] = relationship(
        "TestCase",
        back_populates="requirement_group",
        cascade="all, delete-orphan",
    )


class Folder(Base):
    """目录树模型：支持父子级嵌套"""
    __tablename__ = "api_folders"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("api_folders.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(100))
    sort: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # 树形关系
    children: Mapped[List["Folder"]] = relationship("Folder", backref="parent", remote_side=[id])
    interfaces: Mapped[List["Interface"]] = relationship("Interface", back_populates="folder")

class Interface(Base):
    """接口核心模型"""
    __tablename__ = "api_interfaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    folder_id: Mapped[Optional[int]] = mapped_column(ForeignKey("api_folders.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    method: Mapped[HttpMethod] = mapped_column(SQLEnum(HttpMethod))
    path: Mapped[str] = mapped_column(String(512))
    status: Mapped[ApiStatus] = mapped_column(SQLEnum(ApiStatus), default=ApiStatus.DEVELOPING)
    owner: Mapped[str] = mapped_column(String(100))
    
    query_params: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    header_params: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    body_definition: Mapped[Optional[Dict]] = mapped_column(JSON)
    post_operations: Mapped[Optional[List[Dict]]] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    folder: Mapped["Folder"] = relationship("Folder", back_populates="interfaces")
    test_cases: Mapped[List["TestCase"]] = relationship("TestCase", back_populates="interface")

class TestCase(Base):
    """接口用例模型（接口用例必填 interface_id；需求文档用例必填 requirement_group_id，interface_id 为空）"""
    __tablename__ = "api_test_cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    interface_id: Mapped[Optional[int]] = mapped_column(ForeignKey("api_interfaces.id"), nullable=True)
    requirement_group_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("requirement_groups.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255))
    
    # 用例特定的参数覆盖
    query_params: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    header_params: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    body_definition: Mapped[Optional[Dict]] = mapped_column(JSON)
    
    # 断言规则
    assertions: Mapped[Optional[List[Dict]]] = mapped_column(JSON) # e.g. [{"type": "status_code", "value": 200}]
    pre_operations: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    post_operations: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    case_type: Mapped[str] = mapped_column(String(20), default="test") # "test" or "debug"
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interface: Mapped[Optional["Interface"]] = relationship("Interface", back_populates="test_cases")
    requirement_group: Mapped[Optional["RequirementGroup"]] = relationship(
        "RequirementGroup",
        back_populates="test_cases",
    )

class Environment(Base):
    """环境管理模型"""
    __tablename__ = "api_environments"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    base_url: Mapped[str] = mapped_column(String(255))
    
    urls: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    variables: Mapped[Optional[List[Dict]]] = mapped_column(JSON)
    
    global_config: Mapped[Dict] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(default=True)


class ScenarioPriority(str, Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class TestScenario(Base):
    """测试场景模型：包含多个接口步骤的有序集合"""
    __tablename__ = "test_scenarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    priority: Mapped[ScenarioPriority] = mapped_column(
        SQLEnum(ScenarioPriority), default=ScenarioPriority.P0
    )
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    env_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("api_environments.id"), nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # 步骤列表：[{ "interface_id": 1, "case_id": 2, "order": 1, "name": "..." }]
    steps: Mapped[Optional[List[Dict]]] = mapped_column(JSON, default=list)
    # 最近运行结果：{ "status": "passed|failed|running", "passed": 3, "failed": 1, "duration": 1.2 }
    last_result: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    creator: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    test_reports: Mapped[List["ScenarioTestReport"]] = relationship(
        "ScenarioTestReport", back_populates="scenario", cascade="all, delete-orphan"
    )


class ScenarioTestReport(Base):
    """场景执行测试报告：每次执行批次（如防抖合并后的多步请求）一条记录，明细存 JSON。"""

    __tablename__ = "scenario_test_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    scenario_id: Mapped[int] = mapped_column(
        ForeignKey("test_scenarios.id", ondelete="CASCADE"), index=True
    )
    env_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("api_environments.id"), nullable=True
    )
    creator: Mapped[str] = mapped_column(String(100), default="")
    trigger_type: Mapped[str] = mapped_column(String(20), default="manual")
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    # { "pass": n, "fail": n, "total": n, "sum_ms": x, "avg_ms": y, "untested": 0 }
    summary: Mapped[Dict] = mapped_column(JSON, default=dict)
    entries: Mapped[List[Dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    scenario: Mapped["TestScenario"] = relationship(
        "TestScenario", back_populates="test_reports"
    )


class ScheduledTask(Base):
    """按 Cron 调度执行自动化测试场景（服务端逐步调用执行器，与页面手动运行能力对齐）。"""

    __tablename__ = "scheduled_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    scenario_code: Mapped[str] = mapped_column(String(128), index=True)
    cron_expression: Mapped[str] = mapped_column(String(128))
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Shanghai")
    enabled: Mapped[bool] = mapped_column(default=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    next_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    last_run_status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    runs: Mapped[List["ScheduledTaskRun"]] = relationship(
        "ScheduledTaskRun", back_populates="task", cascade="all, delete-orphan"
    )


class ScheduledTaskRun(Base):
    """单次定时触发执行记录。"""

    __tablename__ = "scheduled_task_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("scheduled_tasks.id", ondelete="CASCADE"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="running")
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    report_code: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    task: Mapped["ScheduledTask"] = relationship("ScheduledTask", back_populates="runs")
