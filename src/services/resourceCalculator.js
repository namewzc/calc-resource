const { logger } = require('../utils/logger');

// Complexity multipliers for different roles
const COMPLEXITY_MULTIPLIERS = {
  low: 1,
  medium: 1.5,
  high: 2
};

// Role-specific cost rates (per hour)
const ROLE_RATES = {
  developers: 100,
  designers: 90,
  projectManagers: 120,
  testers: 80
};

async function calculateProjectResources(projectData) {
  try {
    const {
      name,
      startDate,
      endDate,
      team,
      features
    } = projectData;

    // Calculate total estimated hours per role
    const totalHours = {
      developers: 0,
      designers: 0,
      projectManagers: 0,
      testers: 0
    };

    // Calculate feature-specific resources
    features.forEach(feature => {
      const multiplier = COMPLEXITY_MULTIPLIERS[feature.complexity];
      const totalFeatureHours = feature.estimatedHours * multiplier;

      // Distribute hours among roles (example distribution)
      totalHours.developers += totalFeatureHours * 0.6; // 60% of work
      totalHours.designers += totalFeatureHours * 0.1;  // 10% of work
      totalHours.projectManagers += totalFeatureHours * 0.1; // 10% of work
      totalHours.testers += totalFeatureHours * 0.2; // 20% of work
    });

    // Calculate costs per role
    const costs = {};
    Object.keys(totalHours).forEach(role => {
      costs[role] = totalHours[role] * ROLE_RATES[role];
    });

    // Calculate project duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return {
      projectName: name,
      duration: {
        startDate,
        endDate,
        totalDays
      },
      resourceAllocation: {
        estimatedHours: totalHours,
        teamComposition: team,
        costs
      },
      totalCost: Object.values(costs).reduce((sum, cost) => sum + cost, 0)
    };
  } catch (error) {
    logger.error('Error calculating project resources:', error);
    throw new Error('Failed to calculate project resources');
  }
}

module.exports = {
  calculateProjectResources
}; 