import os
import json
import google.generativeai as genai
from google.generativeai import GenerativeModel
from models.graph_types import GraphState
from dotenv import load_dotenv

load_dotenv()

if "GOOGLE_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])


SYSTEM_INSTRUCTION = """
You are Daedalus, an expert software architect AI.
Your task is to update a React Flow diagram state based on a user's technical request.

INPUTS:
1. Current Graph State (JSON): The existing nodes and edges.
2. User Instruction (String): The architectural change requested.

RULES:
1. Mutate the Graph: specificy the new full state of nodes and edges.
2. Layout Logic:
   - Flow direction is generally Left -> Right.
   - Users/Clients start at x=0.
   - Databases/Storage typically reside on the far right.
   - Ensure nodes do not overlap (minimum 250px spacing).
3. Node Types: Use "custom" for all nodes.
4. IDs: Preserve existing IDs for unchanged nodes. Generate simple unique IDs (e.g., "node-1", "node-2") for new ones.
5. Response Format: Return ONLY raw JSON matching the GraphState schema (nodes list, edges list).
"""


def process_graph_update(current_state: GraphState, instructions: str) -> GraphState:
    """
    Sends the current graph state and instruction to Gemini,
    parses the result, and returns the new valid GraphState.
    """

    model = GenerativeModel(
        model_name="gemini-3-pro-preview",
        system_instruction=SYSTEM_INSTRUCTION
    )


    prompt = f"""
    CURRENT GRAPH STATE:
    {current_state.model_dump_json()}

    USER INSTRUCTION:
    "{instructions}"

    Respond with the valid JSON for the new graph state.
    """

    response = model.generate_content(
        prompt,
        generation_config={
            "response_mime_type": "application/json",
        }
    )

    try:
        cleaned_json = response.text.strip()

        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        
        data = json.loads(cleaned_json)

        # validate with pydantic
        new_state = GraphState(**data)
        return new_state
    
    except json.JSONDecodeError:
        print(f"Failed to decode JSON from Gemini: {response.text}")
        raise ValueError("AI returned invalid JSON")
    except Exception as e:
        print(f"Gemini 3 Error: {e}")
        raise e