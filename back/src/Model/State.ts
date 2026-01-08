export interface PlayerStateInfo {
    id: number;
    uuid: string;
    name: string;
    type: 'human' | 'agent';
    agentId?: string; // Only for agents
    isLogged: boolean;
    visitCardUrl: string | null;
    tags: string[];
    group: {
        id: number;
        members: number;
    } | null;
}

export interface MapObjectState {
    id: number;
    name: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    properties: Record<string, unknown>;
}

export interface MapLayerState {
    name: string;
    objects: Map<number, MapObjectState>;
}

export interface MapState {
    layers: Map<string, MapLayerState>;
} 