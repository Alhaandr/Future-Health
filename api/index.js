/**
 * Vercel Serverless Function Entry Point for SANAD Abu Dhabi
 * Handles all REST API routes (/api/v1/*) on Vercel's Serverless Infrastructure.
 */

const { requestHandler } = require('../backend/server');

module.exports = async (req, res) => {
  return requestHandler(req, res);
};
