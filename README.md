# Pathfinder-MCP

A Model Context Protocol (MCP) server that provides access to Pathfinder 2e data from the Archives of Nethys (AON). This tool enables AI assistants like Claude to access and provide accurate information about Pathfinder 2e rules, spells, feats, and more.

## Features

- 🔍 Search for Pathfinder 2e content across 21 categories including spells, feats, classes, and more
- 📚 Retrieve detailed information about specific game elements
- 🎯 Get complete lists of items within categories
- ⚡ Optimized search with intelligent query handling
- 🧠 Designed for use with MCP-compatible AI assistants

## How It Works

Pathfinder-MCP provides a standardized MCP interface between AI assistants and the Pathfinder 2e Archives of Nethys data. It offers three main tools:

1. **searchPathfinder** - Search within a specific category using a query string
2. **getPathfinderItem** - Get detailed information about a specific item by name and category
3. **getAllPathfinderItems** - List all items in a category with pagination support

The server connects to the Archives of Nethys Elasticsearch instance to provide up-to-date game information.

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/HeatherFlux/Pathfinder-MCP.git
   cd Pathfinder-MCP
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

## Usage

### Starting the Server

To start the MCP server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

This will start the server using stdio transport, making it compatible with MCP-enabled applications.

### Using with Claude

Claude can interact with the Pathfinder-MCP server to provide accurate Pathfinder 2e information:

1. Configure Claude Desktop to use the Pathfinder-MCP server:
   - Open Claude Desktop settings
   - Go to the MCP section
   - Add a new server configuration for Pathfinder-MCP

2. Once configured, you can ask Claude about Pathfinder 2e content, such as:
   - "Tell me about the Fireball spell in Pathfinder 2e"
   - "What are the abilities of the Fighter class?"
   - "Explain the Power Attack feat"

Claude will use the MCP server to retrieve accurate information from the Archives of Nethys.

## Available Categories

Pathfinder-MCP supports the following content categories:

- `action` - Actions and activities
- `ancestry` - Character ancestries
- `archetype` - Character archetypes
- `armor` - Armor items
- `article` - General articles and rules explanations
- `background` - Character backgrounds
- `class` - Character classes
- `creature` - Monsters and NPCs
- `creature-family` - Groups of related creatures
- `deity` - Gods and divine entities
- `equipment` - General equipment items
- `feat` - Character feats
- `hazard` - Traps and environmental hazards
- `rules` - Game rules
- `skill` - Character skills
- `shield` - Shield items
- `spell` - Spells and magical abilities
- `source` - Source books and materials
- `trait` - Traits and keywords
- `weapon` - Weapon items
- `weapon-group` - Categories of weapons

## Example Queries

Here are some examples of how to use the MCP tools:

### Searching for content
```
// Search for fire-related spells
searchPathfinder({ category: "spell", query: "fire" })

// Find feats related to striking
searchPathfinder({ category: "feat", query: "strike" })

// Look up fighter class information
searchPathfinder({ category: "class", query: "fighter" })
```

### Getting specific items
```
// Get detailed information about the Fireball spell
getPathfinderItem({ category: "spell", name: "Fireball" })

// Look up the Power Attack feat
getPathfinderItem({ category: "feat", name: "Power Attack" })

// Get information about the Fighter class
getPathfinderItem({ category: "class", name: "Fighter" })
```

### Listing items in a category
```
// Get the first 20 spells
getAllPathfinderItems({ category: "spell" })

// Get 10 feats, starting from the 20th feat
getAllPathfinderItems({ category: "feat", limit: 10, offset: 20 })
```

## Development

### Running in Development Mode

To run the server in development mode with automatic reloading:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Testing

Run the test suite:

```bash
npm test
# or
yarn test
# or
pnpm test
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

To automatically fix lint issues:

```bash
npm run lint:fix
# or
yarn lint:fix
# or
pnpm lint:fix
```

### Debugging

The MCP Inspector can be used to debug the server:

```bash
npm run inspect
# or
yarn inspect
# or
pnpm inspect
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Archives of Nethys](https://2e.aonprd.com/) for providing the Pathfinder 2e game data
- [Model Context Protocol](https://modelcontextprotocol.ai/) for the MCP framework 