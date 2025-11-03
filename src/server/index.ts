// src/server/index.ts
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { tools, getToolList } from './toolRegistry';
import logger from '../lib/logger';

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'carbon-mcp' });
});

// List available tools
app.get('/tools', (req, res) => {
  const toolList = getToolList();
  res.json({ tools: toolList, count: toolList.length });
});

// Get tool schema
app.get('/tool/:name/schema', (req, res) => {
  const name = req.params.name;
  const tool = tools[name];
  
  if (!tool) {
    return res.status(404).json({ 
      error: 'tool_not_found',
      message: `Tool "${name}" not found`,
      available_tools: Object.keys(tools)
    });
  }
  
  res.json(tool.schema);
});

// Execute tool
app.post('/tool/:name', async (req, res) => {
  const name = req.params.name;
  const tool = tools[name];
  
  if (!tool) {
    logger.error('Tool not found', { name });
    return res.status(404).json({ 
      error: 'tool_not_found',
      message: `Tool "${name}" not found`,
      available_tools: Object.keys(tools)
    });
  }
  
  try {
    const input = req.body;
    logger.info(`Executing tool: ${name}`, { input });
    
    // Validate input against schema (basic validation)
    if (tool.schema.input_schema?.required) {
      for (const field of tool.schema.input_schema.required) {
        if (!(field in input)) {
          return res.status(400).json({
            error: 'validation_error',
            message: `Required field missing: ${field}`,
            hint: `Check the schema at GET /tool/${name}/schema`
          });
        }
      }
    }
    
    const result = await tool.handler(input);
    
    // If result contains error_code, return 400
    if (result.error_code) {
      return res.status(400).json(result);
    }
    
    logger.info(`Tool completed: ${name}`, { trace_id: result.trace_id });
    return res.json(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    logger.error('Tool execution error', { name, error: errorMessage, stack: errorStack });
    return res.status(500).json({ 
      error: 'tool_error', 
      message: errorMessage,
      trace_id: `error-${Date.now()}`
    });
  }
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;
  logger.error('Unhandled error', { error: errorMessage, stack: errorStack });
  res.status(500).json({ 
    error: 'internal_error', 
    message: 'An unexpected error occurred' 
  });
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`carbon-mcp server started`, { port: PORT });
  // eslint-disable-next-line no-console
  console.log(`\n🚀 Carbon MCP Server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Available endpoints:`);
  // eslint-disable-next-line no-console
  console.log(`   GET  /health - Health check`);
  // eslint-disable-next-line no-console
  console.log(`   GET  /tools - List all available tools`);
  // eslint-disable-next-line no-console
  console.log(`   GET  /tool/:name/schema - Get tool schema`);
  // eslint-disable-next-line no-console
  console.log(`   POST /tool/:name - Execute tool`);
  // eslint-disable-next-line no-console
  console.log(`\n💡 Available tools: ${Object.keys(tools).join(', ')}`);
  // eslint-disable-next-line no-console
  console.log(`\n📖 Documentation: See README.md\n`);
});

// Handle port already in use error gracefully
// eslint-disable-next-line @typescript-eslint/no-explicit-any
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`, { port: PORT });
    // eslint-disable-next-line no-console
    console.error(`\n❌ Error: Port ${PORT} is already in use`);
    // eslint-disable-next-line no-console
    console.error(`\n💡 Solutions:`);
    // eslint-disable-next-line no-console
    console.error(`   1. Kill the process using port ${PORT}:`);
    // eslint-disable-next-line no-console
    console.error(`      lsof -ti:${PORT} | xargs kill -9`);
    // eslint-disable-next-line no-console
    console.error(`   2. Use a different port:`);
    // eslint-disable-next-line no-console
    console.error(`      PORT=4001 npm run dev`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;

