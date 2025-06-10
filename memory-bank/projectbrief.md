# Project Brief: WorkAdventure Integration for Managents

## Vision
This project focuses on implementing the UI Layer of the Managents system using a forked version of WorkAdventure. The goal is to create a tangible, interactive 2D virtual office where AI agents, controlled by the `managents-core` system, can coexist and interact with human players.

## Core Requirements for WorkAdventure

### 1. Agent Presence
- **Pre-placed Agents**: A number of AI agent "slots" must be pre-placed as objects in the Tiled map file. The system will take control of these existing objects rather than creating new ones dynamically.
- **Visual Representation**: Each agent needs a distinct avatar (sprite) in the WorkAdventure environment, defined in the Tiled map.
- **Persistent State (Long-term)**: While initially ephemeral, the long-term goal is to have agents that persist in the world even if no human players are connected.

### 2. Agent Control and Interaction
- **Movement**: The agent's avatar must be movable around the map based on commands from the external AI system.
- **Communication**: Agents must be able to send and receive chat messages to/from human players.
- **Status Display**: The agent's avatar should visually reflect its current status (e.g., "working", "idle", "in a meeting").

### 3. Map-Level Integration
- **Scripting Bridge**: A JavaScript bridge (`agent-bridge.js`) must be loaded into WorkAdventure maps to facilitate communication with the external agent control system. It will be responsible for finding and controlling the pre-placed agent objects.
- **Custom Maps**: We need to be able to load custom maps, created with Tiled, that contain the pre-placed agent objects and are configured to include the scripting bridge.
- **Object Interaction**: Agents should eventually be able to interact with objects on the map (e.g., open a door, use a workstation).

## Technical Implementation

- **Map Script (`agent-bridge.js`)**: This script, when loaded by a map, will open a WebSocket connection to the `workadventure-connector`'s MCP server. It will scan the map for pre-defined agent objects and manage a pool of them. It will listen for commands (like `claim_agent`, `move_agent`) and translate them into WorkAdventure API calls on the appropriate agent object.
- **Custom Map (`agent_test_map.json`)**: A map file created in Tiled that includes agent objects and a `script` property pointing to the URL where `agent-bridge.js` is served.
- **Local Test Server**: A simple HTTP server is required to serve the custom map and the `agent-bridge.js` script with the correct CORS headers.

## Success Criteria for this Sub-Project
- An AI agent can be successfully "claimed" and appear on a custom map in WorkAdventure by calling the `create_agent` MCP tool, which takes control of a pre-placed agent object.
- The agent's avatar can be moved to a specified coordinate using the `move_agent` MCP tool.
- The agent can send a message that appears in the WorkAdventure chat using the `send_chat` MCP tool.
- The entire communication flow is successfully established: `Agent Core -> MCP Server -> agent-bridge.js -> WorkAdventure API`. 