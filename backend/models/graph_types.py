from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Position(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    label: str
    type: str = "default"
    status: str = "active"
    iconUrl: Optional[str] = None

class Node(BaseModel):
    id: str
    type: str = "custom"
    position: Position
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = True

class GraphState(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class UpdateRequest(BaseModel):
    currrent_state: GraphState
    user_instructions: str