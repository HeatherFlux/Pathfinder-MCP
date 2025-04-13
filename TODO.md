# Pathfinder-MCP API Functions TODO

## HTTP API Endpoints (server.ts)

### Health Check
- [x] GET /health
  - ✓ Implement health check endpoint
  - ✓ Return status object

### Context Endpoint
- [x] POST /context
  - ✓ Handle question parameter
  - ✓ Process question analysis
  - [ ] Enhance error handling
  - [ ] Add response validation
  - [ ] Improve error messages

## MCP Class (mcp.ts)

### Question Analysis
- [x] analyzeQuestion(question: string)
  - ✓ Implement category detection
  - ✓ Handle spell queries
  - ✓ Return analysis object
  - [ ] Add confidence threshold configuration
  - [ ] Enhance multi-category detection

### Context Retrieval
- [x] getContext(question: string)
  - ✓ Process question analysis
  - ✓ Search AON for relevant content
  - [ ] Improve results ranking
  - [ ] Add pagination support
  - [ ] Handle no results case with better suggestions

### Context Formatting
- [ ] formatContext(question: string, context: string)
  - [ ] Enhance format structure
  - [ ] Add metadata to responses
  - [ ] Improve readability of formatted output

## AonClient Class (aon-client.ts)

### Search Operations
- [x] searchCategory(category: AonCategory, query: string)
  - ✓ Validate category
  - ✓ Implement search query
  - [ ] Optimize search performance
  - [ ] Add advanced search filters

### Item Retrieval
- [x] getItem(category: AonCategory, name: string)
  - ✓ Validate category
  - ✓ Search for specific item
  - [ ] Improve exact match handling
  - [ ] Add fuzzy matching support

### Category Operations
- [x] getAllInCategory(category: AonCategory)
  - ✓ Validate category
  - ✓ Retrieve all items
  - [ ] Implement efficient pagination
  - [ ] Add sorting options

## Documentation and Testing

### Documentation
- [ ] Add comprehensive JSDoc comments
- [ ] Create API documentation
- [ ] Add usage examples
- [ ] Document error codes and messages

### Testing
- [ ] Increase test coverage
- [ ] Add edge case tests
- [ ] Add performance tests
- [ ] Add integration test scenarios

## Supporting Types

### Categories to Support
- [x] spell
- [x] feat
- [x] class
- [x] ancestry
- [x] weapon
- [x] armor
- [x] creature
- [x] rules

### Item Structure
- [x] name: string
- [x] category: AonCategory
- [x] description?: string
- [x] text?: string 