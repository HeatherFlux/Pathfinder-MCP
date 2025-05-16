// Test script for MCP tools
import { craftingTool, getPathfinderCraftingRequirements } from './dist/mcp/index.js';

console.log('Crafting Tool Name:', craftingTool.name);
console.log('Functions:', craftingTool.functions.map(f => f.name));
console.log('getPathfinderCraftingRequirements function exists:', typeof getPathfinderCraftingRequirements === 'function'); 