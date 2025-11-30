from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.graph_types import UpdateRequest, GraphState
from services.gemini_service import process_graph_update
import os

app = FastAPI(title="Daedalus API")

# configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def health_check():
    return {"status": "Daedalus Brain is active"}

@app.post("/update-graph")
async def update_graph(request: UpdateRequest):
    """
    Takes current graph + instructions -> Returns new graph
    """

    try:
        # pass to Gemini service
        new_state = process_graph_update(request.current_state, request.user_instruction)
        return new_state
    except Exception as e:
        print(f"Error processing update: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)