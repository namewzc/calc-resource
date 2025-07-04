const { calculateResource } = require('../controllers/resourceController');
const { validateProjectInput } = require('../middleware/validation');

function setupRoutes(app) {
  // Resource calculation endpoints
  app.post('/api/calculate', validateProjectInput, calculateResource);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
}

module.exports = { setupRoutes }; 