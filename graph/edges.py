from graph.state import GraphState


def after_safety(state: GraphState) -> str:
    return "halt" if state.get("halted") else "primary"


def after_primary(state: GraphState) -> str:
    return "halt" if state.get("halted") else "secondary"


def after_secondary(state: GraphState) -> str:
    return "aggregate"


def after_aggregate(state: GraphState) -> str:
    return "halt" if state.get("halted") else "__end__"