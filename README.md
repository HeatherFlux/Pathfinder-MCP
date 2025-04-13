# Pathfinder-MCP

A powerful tool for querying and retrieving information from the Pathfinder 2e Archives of Nethys. Pathfinder-MCP provides context-aware responses to user queries about spells, classes, rules, and other game elements.

## Features

- 🔍 Intelligent question analysis and categorization
- 📚 Comprehensive spell detection and handling
- 🎯 Multi-category search support
- ⚡ Fast and accurate responses
- 🧪 Comprehensive test coverage
- 📝 Clear error handling and user feedback

## How It Works

Pathfinder-MCP uses a sophisticated question analysis system to understand user queries and retrieve relevant information from the Archives of Nethys. Here's how it works:

1. **Question Analysis**
   - Analyzes user queries for keywords and context
   - Identifies relevant categories (spells, classes, feats, etc.)
   - Detects spell names and game-specific terminology

2. **Search Processing**
   - Searches the Archives of Nethys for relevant information
   - Filters and prioritizes results based on query context
   - Returns structured responses for easy consumption

3. **Response Formatting**
   - Formats responses for optimal readability
   - Includes relevant context and source information
   - Provides clear feedback for invalid queries

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Elasticsearch instance (for data storage) if not using AON

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Pathfinder-MCP.git
   cd Pathfinder-MCP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   ELASTICSEARCH_URL=your_elasticsearch_url
   PORT=3000
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3000`

### Running with npx

You can run the server directly using npx without installing it globally:

```bash
npx pathfinder-mcp
```

Or with specific options:
```bash
npx pathfinder-mcp --port 3001
```

### Using with Claude

To use Pathfinder-MCP with Claude Desktop:

1. Open Claude Desktop and go to Settings (from the Claude menu, not the in-app settings)

2. Click on "Developer" in the left sidebar, then click "Edit Config"

3. This will open the configuration file located at:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

4. Add the Pathfinder-MCP server configuration:
   ```json
   {
     "mcpServers": {
       "pathfinder-mcp": {
         "command": "npx",
         "args": ["pathfinder-mcp"]
       }
     }
   }
   ```

5. Save the configuration file and restart Claude Desktop

6. You can now ask Claude questions about Pathfinder 2e rules, spells, and other game elements. For example:
   ```
   Tell me about the Fireball spell in Pathfinder 2e.
   ```

Note: Claude Desktop will ask for your permission before executing any MCP commands.

### Using with Cursor

To integrate Pathfinder-MCP with Cursor:

1. Start the server in development mode:
   ```bash
   npx pathfinder-mcp --dev
   ```

2. In Cursor:
   - Open Settings (⌘, or Ctrl+,)
   - Navigate to "AI" settings
   - Under "Model Context Protocol", click "Add Server"
   - Enter the following configuration:
     ```json
     {
       "name": "Pathfinder-MCP",
       "url": "http://localhost:3000",
       "enabled": true
     }
     ```
   - Save the configuration

3. Use natural language queries in your code comments:
   ```typescript
   // @mcp What are the rules for casting Fireball?
   ```

4. For debugging and inspection:
   ```bash
   npm run inspect
   ```
   This will launch the MCP Inspector to help debug and monitor the server.

Note: The server must be running for Cursor to access the Pathfinder 2e context. You can verify the connection in Cursor's AI settings panel.

### Running Tests

1. Run all tests:
   ```bash
   npm test
   ```

2. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

## API Usage

### Endpoints

- `POST /context`
  - Accepts a JSON body with a `question` field
  - Returns context from the Archives of Nethys

Example request:
```bash
curl -X POST http://localhost:3000/context \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about the Fireball spell"}'
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Description of your changes"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Keep commits focused and atomic
- Provide clear commit messages

## Project Structure

```
Pathfinder-MCP/
├── src/
│   ├── api/             # Server and API-related code
│   │   ├── server.ts    # Express server implementation
│   ├── client/          # Client code for external services
│   │   └── aon-client.ts # Archives of Nethys client
│   ├── config/          # Configuration and type definitions
│   │   ├── config.ts    # Configuration settings
│   │   └── types.ts     # Common type definitions
│   ├── mcp/             # MCP implementation
│   │   └── mcp.ts       # Main MCP class implementation
│   ├── utils/           # Utility functions and example code
│   │   └── example.ts   # Example usage
│   └── index.ts         # Application entry point and exports
├── tests/               # Test files
├── memory-bank/         # Project documentation
├── .env                 # Environment variables
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Pathfinder 2e Archives of Nethys for providing the game data
- All contributors who have helped improve this project 