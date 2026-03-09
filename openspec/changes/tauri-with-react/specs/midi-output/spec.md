## ADDED Requirements

### Requirement: List available MIDI outputs
The application SHALL enumerate all available MIDI output ports via the `midir` crate and return their names to the frontend.

#### Scenario: MIDI outputs are listed on startup
- **WHEN** the frontend loads
- **THEN** it SHALL call `list_outputs` and display all available MIDI output port names in a dropdown

#### Scenario: No MIDI outputs available
- **WHEN** no MIDI output ports are available
- **THEN** the dropdown SHALL be empty and display a message indicating no devices found

### Requirement: Refresh MIDI output list
The application SHALL provide a refresh button that re-enumerates MIDI output ports.

#### Scenario: User clicks refresh
- **WHEN** the user clicks the Refresh button
- **THEN** the application SHALL re-enumerate MIDI outputs and update the dropdown

### Requirement: Select and connect to MIDI output
The application SHALL allow the user to select a MIDI output port and open a connection to it.

#### Scenario: User selects a MIDI output
- **WHEN** the user selects a port from the dropdown
- **THEN** the application SHALL open a `midir` connection to that port and store it in app state

#### Scenario: Selected port becomes unavailable
- **WHEN** the user selects a port that cannot be opened
- **THEN** the application SHALL display an error message

### Requirement: Send CC message to connected output
The application SHALL send MIDI CC messages on channel 1 to the connected output port.

#### Scenario: CC message is sent
- **WHEN** the application sends a CC message
- **THEN** it SHALL send a 3-byte MIDI message: status `0xB0`, controller `102`, and the specified value (0 or 127)
