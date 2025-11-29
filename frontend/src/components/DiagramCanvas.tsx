import React, { useCallback, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

const INITIAL_NODES: Node[] = [
    {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { label: 'Start Here' }
    }
];


export default function DiagramCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);

    const [instruction, setInstruction] = useState("");

    // Text -> API -> Graph Update
    const handleUpdateGraph = async () => {
        if (!instruction) return;
        setLoading(true);

        try {
            // 1. prep payload
            const payload = {
                current_state: { nodes, edges },
                user_instruction: instruction
            };

            // 2. call backend aka Gemini 3.0
            const response = await fetch('http://localhost:8000/update-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("API Failed");

            const newGraph = await response.json();

            // 3. update react graph: gemini returns standard react flow nodes/edges
            setNodes(newGraph.nodes);
            setEdges(newGraph.edges);

        } catch (error) {
            console.error("Failed to update architecture:", error);
            alert("Daedalus hiccuped. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen bg-slate-50 flex flex-col">

            {/* control hud */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                <div className="bg-white/90 backdrop-blur shadow-xl rounded-full p-2 flex gap-2 border border-slate-200">
                    <input
                        type="text"
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-800 placeholder-slate-400"
                        placeholder="Describe your architecture... (e.g. 'Add a Redis cache')"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateGraph()}
                    />
                    <button
                        onClick={handleUpdateGraph}
                        disabled={loading}
                        className={`
              px-6 py-2 rounded-full font-semibold text-white transition-all
              ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}
            `}
                    >
                        {loading ? "Thinking..." : "Build"}
                    </button>
                </div>
            </div>

            {/* infinite canvas */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#cbd5e1" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}