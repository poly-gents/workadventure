import { User } from "./User";

/**
 * Agent-related types and utilities for WorkAdventure
 */

export interface AgentRegistrationPayload {
    agentId?: string;
    name: string;
    avatar?: {
        textures: string[];
        companion?: string;
    };
    position?: {
        x: number;
        y: number;
    };
    tags?: string[];
    variables?: Record<string, unknown>;
}

export interface AgentInfo {
    id: number;
    agentId: string;
    name: string;
    user: User;
    isFirstTime: boolean;
    variables?: Record<string, unknown>;
}

export interface AgentMovementPayload {
    agentId: string;
    x: number;
    y: number;
}

export interface AgentRemovalPayload {
    agentId: string;
}

export interface AgentEventData {
    playerId: number;
    agentId: string;
    name: string;
    position?: {
        x: number;
        y: number;
    };
    uuid?: string;
    availabilityStatus?: number;
    variables?: Record<string, unknown>;
}

export enum AgentEventType {
    NEW_AGENT = "new-agent",
    AGENT_LOGIN = "agent-login",
    AGENT_LOGOUT = "agent-logout",
    AGENT_MOVED = "agent-moved",
    AGENT_REGISTRATION_ERROR = "agent-registration-error",
    AGENT_MOVEMENT_ERROR = "agent-movement-error",
    AGENT_REMOVAL_ERROR = "agent-removal-error",
}

/**
 * Validates an agent registration payload
 */
export function validateAgentRegistrationPayload(data: unknown): AgentRegistrationPayload {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid payload: must be an object");
    }

    const payload = data as Record<string, unknown>;

    if (!payload.name || typeof payload.name !== "string") {
        throw new Error("Invalid payload: name is required and must be a string");
    }

    // Validate optional fields
    if (payload.agentId && typeof payload.agentId !== "string") {
        throw new Error("Invalid payload: agentId must be a string");
    }

    if (payload.position && (typeof payload.position !== "object" || !payload.position)) {
        throw new Error("Invalid payload: position must be an object");
    }

    if (payload.tags && !Array.isArray(payload.tags)) {
        throw new Error("Invalid payload: tags must be an array");
    }

    return payload as unknown as AgentRegistrationPayload;
}

/**
 * Validates an agent movement payload
 */
export function validateAgentMovementPayload(data: unknown): AgentMovementPayload {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid payload: must be an object");
    }

    const payload = data as Record<string, unknown>;
    const agentId = payload.agentId as string;
    const x = payload.x as number;
    const y = payload.y as number;

    if (!agentId || typeof agentId !== "string") {
        throw new Error("Invalid payload: agentId is required");
    }

    if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("Invalid payload: x and y coordinates are required");
    }

    return { agentId, x, y };
}

/**
 * Validates an agent removal payload
 */
export function validateAgentRemovalPayload(data: unknown): AgentRemovalPayload {
    if (!data || typeof data !== "object") {
        throw new Error("Invalid payload: must be an object");
    }

    const payload = data as Record<string, unknown>;
    const agentId = payload.agentId as string;

    if (!agentId || typeof agentId !== "string") {
        throw new Error("Invalid payload: agentId is required");
    }

    return { agentId };
}

/**
 * Generates a unique agent ID
 */
export function generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 