from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_users: int
    total_departments: int
    total_objectives: int
    total_key_results: int
    total_checkins: int
    average_objective_progress: float


class DashboardStatusItem(BaseModel):
    status: str
    count: int


class DashboardProgressResponse(BaseModel):
    average_objective_progress: float
    objective_counts_by_status: list[DashboardStatusItem]


class DashboardRiskItem(BaseModel):
    risk_level: str
    count: int


class DashboardTopPerformerItem(BaseModel):
    user_id: int
    full_name: str
    average_progress: float
    objective_count: int


class DashboardChartItem(BaseModel):
    label: str
    objectives: int
    average_progress: float
