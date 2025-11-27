import { useState, useCallback, useEffect } from "react";
import useWebSocket from "react-use-websocket";

const AGENT_ID = "YOUR_AGENT_ID";
const ELEVENLABS_WS_URL = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;

export const useDaedalusAgent = (
  onInstruction: (instruction: string) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    ELEVENLABS_WS_URL,
    {
      shouldReconnect: () => true,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
    }
  );

  // handle incoming messages from ElevenLabs
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);

      // for audio events when the AI is speaking
      if (data.type === "audio") {
        setIsSpeaking(true);
      }

      // for client tool call when the AI wants to update the graph
      if (data.type === "client_tool_call") {
        if (data.tool.name === "update_diagram") {
          const instruction = data.parameters.instruction;
          console.log("Voice Command Received:", instruction);
          onInstruction(instruction);
        }
      }
    }
  }, [lastMessage, onInstruction]);

  const startConversation = useCallback(() => {
    // send initial handsake
    sendMessage(
      JSON.stringify({ type: "conversation_initiation_client_data" })
    );
  }, [sendMessage]);

  return { isConnected, isSpeaking, startConversation };
};
