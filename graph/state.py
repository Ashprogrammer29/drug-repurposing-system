from typing import TypedDict, Optional, List, Any


class GraphState(TypedDict):
    query:           str
    session_id:      str
    safety_result:   Optional[Any]
    primary_results: List[Any]
    secondary_results: List[Any]
    all_results:     List[Any]
    contradictions:  List[Any]
    validation:      Optional[Any]
    profile:         Optional[Any]
    governance:      Optional[Any]
    trace:           Optional[Any]
    halted:          bool
    halt_stage:      Optional[str]
    halt_reason:     Optional[str]
    total_attempts:  int
    stage_2_primary: List[str]
    stage_3_secondary: List[str]