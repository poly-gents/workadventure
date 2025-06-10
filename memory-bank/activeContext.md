# Active Context: Live Agent Testing

## Current Goal
The primary goal is to conduct the first **end-to-end live test** of the Managents system, proving that an external AI agent can be created and controlled within a live WorkAdventure environment.

## Immediate Objectives
1.  **Create a Test Map with Agent Objects**: Author a new Tiled map file (`agent_test_map.json`) and place several objects on a specific layer to act as agent "slots". These objects will need a name or property to identify them.
2.  **Configure the Script**: Embed the `script` property into the test map, pointing to the `agent-bridge.js` file served by the local HTTP server.
3.  **Launch All Services**: Start the WorkAdventure Docker stack, the `workadventure-connector` MCP server, and the HTTP server for the map and script.
4.  **Load the Environment**: Access the correct URL to load the custom map in WorkAdventure.
5.  **Execute a Test Scenario**: Use an MCP client to perform the following sequence:
    *   Call `create_agent` to find and claim an available pre-placed object, assigning it an `agentId`.
    *   Call `move_agent` to move the claimed agent to a new location.
    *   Call `send_chat` to make the agent say something.
6.  **Verify Results**: Visually confirm in the WorkAdventure client that one of the pre-placed objects is controlled as commanded.

## Plan of Action
1.  **[DONE]** Review existing WorkAdventure test maps to understand the format.
2.  **[NEXT]** Create a new file: `tiled/agent_test_map.json`. This file will be a simple map with a floor, a start position, and an object layer containing several placeholder sprites for the agents.
3.  **[NEXT]** In Tiled, give these agent objects a specific name or custom property (e.g., `class: 'agent_slot'`).
4.  **[NEXT]** Manually edit the `.json` file to add the `properties` array containing the `script` property, setting its value to `http://localhost:8088/agent-bridge.js`.
5.  **[TODO]** Create the `agent-bridge.js` file. This script will need to:
    *   Scan the map for objects with `class: 'agent_slot'`.
    *   Implement the agent pool logic (`claim`, `get`, `release`).
    *   Implement the WebSocket client and command handlers for `create_agent`, `move_agent`, etc.
6.  **[TODO]** Write a startup script or document the commands needed to launch the three required services.
7.  **[TODO]** Document the exact URL needed to open the test map.
8.  **[TODO]** Execute the test and document the outcome in `progress.md`.

## Known Blockers / Risks
- **CORS Issues**: The HTTP server for the map/script absolutely must have CORS enabled. **Mitigation**: Use a tool like `http-server -c-1` which enables CORS.
- **URL Mismatches**: The URLs for the script and tilesets inside the map file must be exactly correct and accessible from the browser. **Mitigation**: Double-check all hostnames and ports.
- **API for Object Control**: The exact API for finding and moving a placed Tiled object is still unknown and needs to be discovered from the documentation or source code. This is the primary remaining technical challenge.
- **API Changes**: The underlying WorkAdventure API may have changed in the forked version. **Mitigation**: Be prepared to debug `agent-bridge.js` in the browser's developer tools.
- **Agent Player API**: The biggest unknown is how to spawn and control a *separate* player entity that is not the user's own avatar. The public `WA` API may not support this directly. **Mitigation**: Initial tests may have to focus on "possessing" the main player avatar. The `systemPatterns.md` acknowledges this (`WA.custom.movePlayer`). The first test is to see what is possible. 