# System Patterns: WorkAdventure Integration

## Core Pattern: The Bridge
The primary pattern in use is the **Bridge Pattern**. The `agent-bridge.js` script acts as a bridge between two different systems:
1.  The **WorkAdventure Client-Side API**: A JavaScript-based API (`WA` object) for controlling a character and interacting with the game world.
2.  The **Managents MCP Server**: An external system that issues commands based on AI agent logic.

```
   +-----------------+         +-----------------+
   |   MCP Server    |         | WA Client-Side  |
   | (issues commands) | <-----> |   (executes actions)|
   +-----------------+         +-----------------+
           ^                           ^
           |      WebSocket      |
           +---------------------------+
           |     agent-bridge.js       |
           +---------------------------+
```

The bridge decouples the agent logic (which knows nothing about WorkAdventure's specific API) from the UI implementation (which knows nothing about MCP).

## Key Implementation Patterns

### 1. Singleton for API Access
The `agent-bridge.js` should initialize a single, persistent connection to the MCP server and a single set of handlers for the `WA` API. This prevents multiple connections or redundant event listeners.

```javascript
// agent-bridge.js
class AgentBridge {
    constructor() {
        if (AgentBridge.instance) {
            return AgentBridge.instance;
        }
        this.mcpClient = new MCPClient("ws://localhost:8080"); // URL from config
        this.waAPI = window.WA;
        this.setupEventHandlers();
        AgentBridge.instance = this;
    }
    // ... rest of the implementation
}

const bridge = new AgentBridge();
```

### 2. Command Pattern for MCP Actions
Commands from the MCP server are received as structured messages (e.g., JSON). A handler in the bridge decodes these messages and executes the corresponding `WA` API calls. This is a form of the Command Pattern.

```javascript
// In the MCPClient within agent-bridge.js
this.socket.onmessage = (event) => {
    const command = JSON.parse(event.data);

    switch(command.tool_name) {
        case 'create_agent':
            // The bridge maintains a pool of pre-placed NPC objects found on the map.
            // This command finds an available NPC, assigns it the agentId, and marks it as "in-use".
            const npc = this.agentPool.claim(command.parameters.agentId);
            if (npc) {
                // Potentially move it to a default starting position
                npc.moveTo(command.parameters.x, command.parameters.y);
            }
            break;
        case 'move_agent':
            const agentToMove = this.agentPool.get(command.parameters.agentId);
            if (agentToMove) {
                agentToMove.moveTo(command.parameters.x, command.parameters.y);
            }
            break;
        case 'send_chat':
            // This would likely use a global chat function, but conceptually it's tied to the agent.
            WA.chat.sendChatMessage(command.parameters.message, 'Agent ' + command.parameters.agentId);
            break;
    }
}
```

### 3. Observer Pattern for WA Events
The bridge subscribes to events from the `WA` API (acting as an Observer). When events occur, it forwards them as notifications to the MCP server.

```javascript
// In AgentBridge.setupEventHandlers()
this.waAPI.chat.onChatMessage((message, author) => {
    // Don't forward messages sent by our own agents
    if (author.startsWith('Agent')) return;

    this.mcpClient.notify("chat_message_received", {
        text: message,
        author: author
    });
});
```

## Data Flow
The data flow is strictly defined and bidirectional:

**Agent -> WorkAdventure (Command Flow)**
1.  Agent logic decides to perform an action.
2.  `managents-core` calls an MCP tool on the `workadventure-connector` server.
3.  The MCP server serializes the command and sends it over the WebSocket to the correct `agent-bridge.js` client.
4.  The bridge deserializes the command and calls the appropriate `WA` API function.
5.  The action is rendered in the WorkAdventure client.

**WorkAdventure -> Agent (Event Flow)**
1.  A human player performs an action in the WA client (e.g., sends a chat message).
2.  The `WA` API fires an event.
3.  The `agent-bridge.js` (observing the API) catches the event.
4.  The bridge serializes the event data and sends a notification over the WebSocket to the MCP server.
5.  The MCP server routes the information to the relevant agent's core logic.
6.  The agent can now process this new information. 

## 4. Room API Event-Driven Agent Creation (New Pattern)

This new pattern bypasses the need for a client-side `agent-bridge.js` for agent *creation*, leveraging the backend `room-api` instead. This is a more robust and centralized approach for managing agent lifecycle.

**Core Idea**: An external system sends a `register-agent` event directly to the room's backend. The backend handles the creation of the `User` object for the agent, which then automatically appears for all connected clients.

```
+--------------------+      +-------------------+      +-----------------+
| External System    |----->|     Room API      |----->|   GameRoom.ts   |
| (e.g., managents-core)|      | (listens for events)|      | (handles logic) |
+--------------------+      +-------------------+      +-----------------+
        | (HTTP/gRPC)           (Event: register-agent)         |
        |                                                       | Creates User
        V                                                       V
+--------------------+      +-------------------+      +--------------------+
| WorkAdventure UI   |<-----|   WA Websocket    |<-----| Remote Player Sync |
| (renders new player) |      |   (broadcasts)    |      | (notifies clients) |
+--------------------+      +-------------------+      +--------------------+
```

### Supported Events via Room API

#### Inbound Events (External System -> Room API)
-   **`register-agent`**:
    -   **Purpose**: Creates a new agent or logs in a returning one.
    -   **Payload**: `AgentRegistrationPayload`
        -   `agentId` (string, optional): If omitted, a new agent is created. If provided, the system attempts to log in an existing agent.
        -   `name` (string, required): The agent's display name.
        -   `avatar` (object, optional): `{ textures: string[], companion?: string }`.
        -   `position` (object, optional): `{ x: number, y: number }`.
        -   `tags` (string[], optional): Defaults to `["agent"]`.
        -   `variables` (object, optional): Key-value pairs.

#### Outbound Events (Room -> External System / UI)
These events are broadcast to all clients in the room, including any system listening to the room's event stream.

-   **`new-agent`**:
    -   **Purpose**: Announce that a new agent has been created and has joined the room for the first time.
    -   **Payload**: `AgentInfo` & `User` data.
-   **`agent-login`**:
    -   **Purpose**: Announce that a previously registered agent has re-connected.
    -   **Payload**: `AgentInfo` & `User` data.
-   **`agent-logout`**:
    -   **Purpose**: Announce that an agent has been removed.
    -   **Payload**: `{ agentId: string, playerId: number, name: string }`.
-   **`agent-moved`**:
    -   **Purpose**: Announce that an agent has moved.
    -   **Payload**: `{ agentId: string, playerId: number, position: { x: number, y: number } }`.
-   **`agent-registration-error` / `agent-movement-error` / `agent-removal-error`**:
    -   **Purpose**: Announce that an agent-related operation failed.
    -   **Payload**: `{ error: string }`.

## 5. Centralized Room State Pattern

To provide a single source of truth for the state of a room, a centralized state management pattern has been implemented directly within the `GameRoom` class. This pattern ensures that all information about players and map objects is consistently tracked and can be exposed to external systems.

**Core Idea**: The `GameRoom` instance maintains dedicated state objects (`playersState` and `mapObjectsState`). These objects are updated during key lifecycle events (player join/leave) or initialization (map load). The state is then serialized and saved as a WorkAdventure "room variable", making it accessible to any client with Room API access.

```
+----------------+      +------------------+      +----------------------+
| Player Actions |----->|   GameRoom.ts    |----->|   State Management   |
| (join/leave)   |      | (handles events) |      | (playersState map)   |
+----------------+      +------------------+      +----------------------+
                                  |                         |
                                  |                         | (on update)
                                  V                         V
                          +------------------+      +----------------------+
                          |   WA Variables   |<-----|  Save State Function |
                          | (`players_state`)|      |  (serialize & save)  |
                          +------------------+      +----------------------+
                                  ^
                                  |
                                  | (Room API Read)
                          +------------------+
                          | External System  |
                          | (e.g., dashboard)|
                          +------------------+
```

### Key Components:
- **State Interfaces (`State.ts`)**: Defines the data structures for the state (e.g., `PlayerStateInfo`, `MapState`). This provides a clear schema and type safety.
- **State Properties in `GameRoom`**:
    - `playersState: Map<number, PlayerStateInfo>`: Holds the state for every player (human and agent) in the room, keyed by their ID.
    - `mapObjectsState: MapState`: Holds the state of all object layers from the Tiled map.
- **Lifecycle Hooks**:
    - **Player State**: The `playersState` map is updated within the `join()` and `leave()` methods of `GameRoom`.
    - **Map State**: The `mapObjectsState` is populated once by the `initializeMapObjectsState()` method when the `GameRoom` is created.
- **Room Variable Persistence**:
    - Helper methods (`savePlayersStateToVariable`, `saveMapObjectsStateToVariable`) are called after any state change.
    - These methods serialize the state maps into JSON and use the `setVariable` function to save them as room variables.
    - **Variable Names**:
        - `"players_state"`
        - `"map_objects_state"`