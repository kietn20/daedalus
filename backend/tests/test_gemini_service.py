import pytest
from unittest.mock import patch, MagicMock
from models.graph_types import GraphState, Node, Edge, Position, NodeData
from services.gemini_service import process_graph_update 

@patch('services.gemini_service.GenerativeModel')
def test_add_redis_node(mock_gen_model_class):

    # ARRANGE: mock Gemini response to simulate adding a Redis node for now 
    mock_model_instance = MagicMock()
    mock_gen_model_class.return_value = mock_model_instance
    
    # raw JSON string expected from gemini
    mock_response_json = """
    {
        "nodes": [
            {"id": "1", "type": "custom", "position": {"x": 100, "y": 100}, "data": {"label": "API", "type": "service"}},
            {"id": "2", "type": "custom", "position": {"x": 300, "y": 100}, "data": {"label": "Redis", "type": "database"}}
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2", "label": "caches", "animated": true}
        ]
    }
    """
    
    mock_response = MagicMock()
    mock_response.text = mock_response_json
    mock_model_instance.generate_content.return_value = mock_response

    # define input state (just one API node)
    current_state = GraphState(
        nodes=[
            Node(id="1", type="custom", position=Position(x=100, y=100), data=NodeData(label="API"))
        ],
        edges=[]
    )
    instruction = "Add a Redis cache connected to the API"

    # ACT: call service
    new_state = process_graph_update(current_state, instruction)

    # ASSERT
    assert len(new_state.nodes) == 2
    assert new_state.nodes[1].data.label == "Redis"
    assert len(new_state.edges) == 1
    assert new_state.edges[0].source == "1"
    assert new_state.edges[0].target == "2"