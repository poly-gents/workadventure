# Progress: WorkAdventure Integration

## Phase 1: Foundational Setup

### Task: Create a Test Map and Script
- **Status**: ⏳ In Progress

- [ ] **Create `agent_test_map.json` with Agent Objects**:
    - **Sub-task**: Create a minimal map in Tiled with a floor layer and a start position.
    - **Sub-task**: Create an object layer and add several placeholder sprites to act as agent slots.
    - **Sub-task**: Assign a common name or property to the agent objects so they can be identified by the script.
    - **Sub-task**: Export the map to `tiled/agent_test_map.json`.
- [ ] **Add Script Property to Map**:
    - **Sub-task**: Manually edit the JSON file to insert the `script` property.
    - **Sub-task**: Set the script value to the URL of the `agent-bridge.js` (e.g., `http://localhost:8088/agent-bridge.js`).
- [ ] **Create `agent-bridge.js`**:
    - **Sub-task**: Create a basic JavaScript file.
    - **Sub-task**: Implement logic to scan the map for the pre-placed agent objects.
    - **Sub-task**: Implement an "agent pool" to manage claiming and releasing the agent objects.
    - **Sub-task**: Implement the WebSocket connection to the MCP server.
    - **Sub-task**: Implement the command handler for `create_agent` (to claim an object), `move_agent`, and `send_chat`.

## Phase 2: Live Testing

### Task: End-to-End Test Execution
- **Status**: 📋 Not Started

- [ ] **Service Launch**:
    - **Sub-task**: Start the WorkAdventure Docker stack.
    - **Sub-task**: Start the `workadventure-connector` MCP server.
    - **Sub-task**: Start the HTTP server for the map and script files.
- [ ] **Environment Loading**:
    - **Sub-task**: Open the test map URL in a browser.
    - **Sub-task**: Verify the "Hello" message from `agent-bridge.js` appears in the browser's developer console.
    - **Sub-task**: Verify the bridge successfully connects to the MCP server (check server logs).
- [ ] **Agent Control Test**:
    - **Sub-task**: Call `create_agent` and verify a pre-placed object is claimed and moved.
    - **Sub-task**: Call `move_agent` and verify the entity moves.
    - **Sub-task**: Call `send_chat` and verify a message from the agent appears in the chat.

## What Works
- **Comprehensive Understanding**: Full context from the parent memory bank has been absorbed.
- **Clear Plan**: A detailed plan for implementing and testing the WorkAdventure integration has been documented in `activeContext.md`.
- **Knowledge of Map Scripting**: We know *how* WorkAdventure loads custom scripts, which is the key technical hurdle.

## What's Left to Build
- The actual `agent_test_map.json` file with pre-placed agent objects.
- The `agent-bridge.js` script with the agent pool and object control logic.
- The command/script to launch all the necessary services for testing.

## Blockers
- The primary blocker is identifying the correct WorkAdventure API calls to find and manipulate pre-placed objects from a Tiled map. This requires further investigation of the `WA` object in the browser's developer console or further source code analysis.

## Phase 3: Backend Agent Registration (New Approach)
- **Status**: ✅ Completed

- [x] **Implement Agent Management in `GameRoom.ts`**:
    - **Sub-task**: Added an `agents` map to track registered AI agents.
    - **Sub-task**: Implemented an `agentIdCounter` to generate unique IDs.
- [x] **Handle Agent Lifecycle Events via `room-api`**:
    - **Sub-task**: Extended `dispatchEvent` to recognize and handle `"register-agent"`, `"move-agent"`, and `"remove-agent"`.
    - **Sub-task**: Implemented `handleAgentRegistration` to create/re-register agents as `User` objects with mock sockets.
    - **Sub-task**: Implemented `handleAgentMovement` and `handleAgentRemoval`.
- [x] **Define Agent Data Structures**:
    - **Sub-task**: Created `Agent.ts` with interfaces for registration, movement, and removal payloads.
    - **Sub-task**: Added comprehensive validation functions for payloads.
- [x] **Broadcast Agent State Changes**:
    - **Sub-task**: The system now broadcasts a `"new-agent"` event on initial registration.
    - **Sub-task**: The system now broadcasts an `"agent-login"` event for returning agents.

## What Works
- **Dynamic Agent Creation**: Agents can now be created dynamically via a `room-api` event, rather than relying on pre-placed objects in a map. This is a more flexible and robust approach.
- **Backend Logic Complete**: The entire backend logic for registering, tracking, and removing agents is implemented in `GameRoom.ts`.
- **UI Visibility**: Registered agents correctly appear as remote players in the WorkAdventure UI.
- **Clear API**: A clear JSON payload structure has been defined for agent registration.