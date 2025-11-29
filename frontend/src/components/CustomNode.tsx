import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

type NodeData = {
    label: string;
    type?: string;
    iconUrl?: string; // for nanobanana 
    status?: string;
};

const CustomNode = ({ data }: NodeProps<NodeData>) => {
    return (
        <div className="relative group">
            {/* 
        Styling: 
        - Glassmorphism background 
        - Border that glows when active
      */}
            <div className="
        flex flex-col items-center justify-center 
        w-32 h-32 
        bg-white/80 backdrop-blur-md 
        border-2 border-slate-200 rounded-2xl 
        shadow-lg transition-all duration-300
        group-hover:scale-105 group-hover:border-blue-400
      ">

                {/* image container for NanoBanana output */}
                <div className="w-16 h-16 mb-2 overflow-hidden rounded-lg">
                    {data.iconUrl ? (
                        <img src={data.iconUrl} alt={data.label} className="w-full h-full object-cover" />
                    ) : (
                        // fallback placeholder while image generates
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                            {data.label[0]}
                        </div>
                    )}
                </div>

                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {data.label}
                </span>
            </div>

            <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-3 !h-3" />
            <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-3 !h-3" />
        </div>
    );
};

export default memo(CustomNode);