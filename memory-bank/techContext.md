# Technical Context: WorkAdventure Integration

## Core Technologies
- **WorkAdventure**: The forked version of the platform, used as the primary UI. The key interaction surface is the client-side scripting API.
- **Tiled Map Editor**: The tool for creating and editing maps (`.json` format). All custom maps will be built using this.
- **JavaScript (ES Modules)**: The language for the `agent-bridge.js` script. It must be written as an ES module to be compatible with WorkAdventure's script loader.
- **Node.js / HTTP Server**: A simple server (like `http-server` with CORS enabled) is needed to serve the map files and the `agent-bridge.js` script to the WorkAdventure client.

## Key Technical Components

### 1. The Map (`.json`)
- A standard Tiled map file.
- Its most important feature is the custom `script` property.
- **Example Property**:
  ```json
  "properties":[
      {
       "name":"script",
       "type":"string",
       "value":"http://localhost:8088/agent-bridge.js"
      }
  ]
  ```
- The `value` must be a full URL accessible from the user's browser, pointing to the `agent-bridge.js` script.

### 2. The Script Bridge (`agent-bridge.js`)
- This file is the heart of the integration.
- It is **client-side** code that runs inside a sandboxed iframe within WorkAdventure.
- **Responsibilities**:
    1.  Establish and maintain a WebSocket connection to the `workadventure-connector` MCP server.
    2.  Listen for commands sent from the MCP server (e.g., `create_agent`, `move_agent`).
    3.  Translate these commands into calls to the global `WA` object (the WorkAdventure Scripting API).
    4.  Listen for events within the WorkAdventure environment (e.g., `WA.chat.onChatMessage`).
    5.  Forward relevant events back to the MCP server.

### 3. Backend Agent Management (`GameRoom.ts`)
- **Location**: `back/src/Model/GameRoom.ts`
- **Role**: This is a new, server-side component for managing agents, representing a shift from the purely client-side "bridge" approach for agent creation.
- **Key Modifications**:
    1.  **Agent State**: `GameRoom` now maintains an `agents` map (`Map<string, AgentInfo>`) to track all registered agents and their associated `User` object.
    2.  **Event Dispatching**: The `dispatchEvent` method has been extended to act as a router for agent-specific events (`register-agent`, `move-agent`, `remove-agent`).
    3.  **Agent as User**: The core implementation detail is that an "agent" is a standard WorkAdventure `User` with a mock socket connection. This allows agents to integrate seamlessly into the existing multiplayer infrastructure (position updates, visibility, etc.).
    4.  **Payload Validation**: Includes methods to validate the structure of incoming agent registration payloads, ensuring robustness.
    5.  **ID Generation**: Implemented `generateAgentId` for creating unique agent identifiers when one is not provided.
- **Associated Files**:
    - `back/src/Model/Agent.ts`: Defines the TypeScript interfaces (`AgentRegistrationPayload`, `AgentInfo`, etc.) and validation functions used in `GameRoom.ts`.

## Development & Testing Workflow

### 1. Run Dependent Services
- **WorkAdventure Stack**: The core WA services must be running (e.g., via `docker-compose`).
- **MCP Server**: The `workadventure-connector` Node.js server must be running and accessible.
- **Map/Script Host**: The simple HTTP server needs to be running and serving the directory containing your custom map and `agent-bridge.js`.

### 2. Load the Map
- Access your local WorkAdventure instance in your browser.
- The URL needs to point to your custom map. The format is typically:
  `http://localhost:8080/_/global/localhost:8088/agent_test_map.json`
- **URL Breakdown**:
    - `http://localhost:8080/_/global/`: The base URL for your local WA instance to load a map.
    - `localhost:8088/`: The host and port of your map/script server.
    - `agent_test_map.json`: The name of your map file.

### 3. Trigger Agent Actions
- With the map loaded, the `agent-bridge.js` script will execute and connect to the MCP server.
- Use an MCP client (like the Claude Desktop tools) to send commands to the MCP server.
- Observe the results in the WorkAdventure window.

## Key Constraints & Considerations
- **CORS is crucial**: The server hosting the map and script *must* use `Access-Control-Allow-Origin: *` or you will face cross-origin errors.
- **Client-Side Logic**: All interaction with the WorkAdventure API happens in the browser. The `agent-bridge.js` has no direct access to the WA server-side code.
- **Sandboxing**: The script runs in an iframe, which has some security restrictions.
- **URL Accessibility**: The URLs in the map file (for the script and tilesets) must be accessible from the browser, not just the server. `localhost` is usually fine for local development. 