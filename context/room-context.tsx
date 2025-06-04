"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { toast } from 'sonner';

type DrawingAction = {
  type: 'path' | 'clear' | 'undo' | 'emoji';
  data: any;
};

interface RoomContextType {
  roomId: string;
  userId: string;
  isHost: boolean;
  peers: string[];
  sendDrawingAction: (action: DrawingAction) => void;
  shareCanvas: (canvasData: string) => void;
  drawingActions: DrawingAction[];
  addDrawingAction: (action: DrawingAction) => void;
  clearDrawingActions: () => void;
  undoLastAction: () => void;
  initialized: boolean;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}

export function RoomProvider({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId: string;
}) {
  const [userId] = useState(() => `user-${Math.random().toString(36).substring(2, 9)}`);
  const [isHost, setIsHost] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [drawingActions, setDrawingActions] = useState<DrawingAction[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  const peerRef = useRef<Peer | null>(null);
  const isHostRef = useRef(false);

  // Initialize PeerJS and connect to room
  useEffect(() => {
    const initializePeer = async () => {
      // Import PeerJS dynamically to avoid SSR issues
      const peer = new Peer(userId);
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        
        // Try to join the room
        tryJoinRoom();
      });

      peer.on('error', (error) => {
        console.error('Peer error:', error);
        toast.error('Connection error: ' + error.message);
      });

      peer.on('connection', (conn) => {
        handleNewConnection(conn);
      });
    };

    const tryJoinRoom = () => {
      if (!peerRef.current) return;
      
      // Try to connect to a potential host
      const hostId = `host-${roomId}`;
      
      if (hostId !== userId) {
        try {
          const conn = peerRef.current.connect(hostId);
          
          conn.on('open', () => {
            console.log('Connected to host!');
            handleNewConnection(conn);
            setConnections((prev) => [...prev, conn]);
          });
          
          conn.on('error', (err) => {
            console.error('Error connecting to host:', err);
            becomeHost();
          });
          
          // If we can't connect to the host after 3 seconds, become the host
          setTimeout(() => {
            if (connections.length === 0 && !isHostRef.current) {
              becomeHost();
            }
          }, 3000);
        } catch (err) {
          console.error('Failed to connect to host:', err);
          becomeHost();
        }
      } else {
        becomeHost();
      }
    };

    const becomeHost = () => {
      console.log('Becoming host for room:', roomId);
      
      if (!peerRef.current) return;
      
      // Change our peer ID to be the host ID for this room
      peerRef.current.destroy();
      
      const hostPeer = new Peer(`host-${roomId}`);
      peerRef.current = hostPeer;
      
      hostPeer.on('open', (id) => {
        console.log('Host peer ID is: ' + id);
        setIsHost(true);
        isHostRef.current = true;
        
        hostPeer.on('connection', (conn) => {
          handleNewConnection(conn);
        });
      });
      
      hostPeer.on('error', (error) => {
        // If we couldn't become host (ID taken), revert to being a normal peer
        if (error.type === 'unavailable-id') {
          console.log('Host already exists, joining as normal peer');
          hostPeer.destroy();
          
          const peer = new Peer(userId);
          peerRef.current = peer;
          
          peer.on('open', () => {
            tryJoinRoom();
          });
        } else {
          console.error('Host peer error:', error);
          toast.error('Connection error: ' + error.message);
        }
      });
    };

    const handleNewConnection = (conn: DataConnection) => {
      console.log('New connection from:', conn.peer);
      
      setConnections((prev) => [...prev, conn]);
      setPeers((prev) => [...prev, conn.peer]);

      conn.on('data', (data: any) => {
        if (data.type === 'action') {
          setDrawingActions(prev => [...prev, data.action]);
        } else if (data.type === 'requestCanvasState' && isHostRef.current) {
          // Send the current canvas state to the new peer
          conn.send({
            type: 'fullCanvasState',
            actions: drawingActions
          });
        } else if (data.type === 'fullCanvasState') {
          // Received full canvas state from host
          setDrawingActions(data.actions);
        }
      });
      
      conn.on('close', () => {
        console.log('Connection closed:', conn.peer);
        setConnections((prev) => prev.filter((c) => c !== conn));
        setPeers((prev) => prev.filter((p) => p !== conn.peer));
      });

      // If we're not the host, request the canvas state
      if (!isHostRef.current) {
        conn.send({
          type: 'requestCanvasState'
        });
      }
    };

    initializePeer();
    setInitialized(true);

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId, userId]);

  // Function to send drawing action to all peers
  const sendDrawingAction = useCallback((action: DrawingAction) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: 'action',
          action: action,
        });
      }
    });
  }, [connections]);

  // Function to share entire canvas with a new peer
  const shareCanvas = useCallback((canvasData: string) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: 'canvasState',
          canvasData,
        });
      }
    });
  }, [connections]);

  // Add a new drawing action
  const addDrawingAction = useCallback((action: DrawingAction) => {
    setDrawingActions(prev => [...prev, action]);
    sendDrawingAction(action);
  }, [sendDrawingAction]);

  // Clear all drawing actions
  const clearDrawingActions = useCallback(() => {
    const clearAction: DrawingAction = {
      type: 'clear',
      data: {}
    };
    setDrawingActions([]);
    sendDrawingAction(clearAction);
  }, [sendDrawingAction]);

  // Undo last drawing action
  const undoLastAction = useCallback(() => {
    const undoAction: DrawingAction = {
      type: 'undo',
      data: {}
    };
    setDrawingActions(prev => prev.slice(0, -1));
    sendDrawingAction(undoAction);
  }, [sendDrawingAction]);

  return (
    <RoomContext.Provider
      value={{
        roomId,
        userId,
        isHost,
        peers,
        sendDrawingAction,
        shareCanvas,
        drawingActions,
        addDrawingAction,
        clearDrawingActions,
        undoLastAction,
        initialized,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}