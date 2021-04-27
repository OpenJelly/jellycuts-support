# Jellycuts Support
This extension allows you to use the Jelly language and connect directly into the Jellycuts iOS app.s

## Jelly language support
### Features
- Syntax highlighting for the Jelly language
- Snippets for common functions

## Jelly Bridge
### Features
- Connect directly to the Jellycuts iOS app.
- Export Jellycuts to the Shortcuts app.
### Commands
Below are the available commands. To run hit cmd+shift+p (mac) or ctrl+shift+p and type the command you want too perform.
1. Open Jellycuts Bridge
    - Opens a Jellycuts Bridge. This is a websocket server running on port 8080 that you can connect to using the Jellycuts App.
2. Close Jellycuts Bridge
    - Closes all connections to the current Jellycuts Bridge.
3. Run in Jellycuts
    - Sends a run command to the Jellycuts app that will run your current script.
4. Export to Shortcuts
    - Sends an export command to the Jellycuts app. This will compile and open your Jellycut in the Shortcuts app.

# Release Notes
### 1.0.0
Fixed an issue with comment highlighting

### 0.9.26
Initial release of 1.0.0 to go with Jellycuts 0.9(17).

### 0.9.25
Fixed a bug where the websocket server was not closing correctly.