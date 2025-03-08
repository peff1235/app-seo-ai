import express from 'express';
import keywordController from '../controllers/keywordController.js';

const router = express.Router();

/**
 * @swagger
 * /api/keywords/ideas:
 *   get:
 *     summary: Generate keyword ideas based on a seed keyword
 *     tags: [Keywords]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Seed keyword to generate ideas from
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language code (e.g., 'en', 'fr', 'es')
 *       - in: query
 *         name: locations
 *         schema:
 *           type: string
 *         description: JSON array of location IDs (e.g., '[2250]' for US)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of keyword ideas to return
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/ideas', keywordController.generateKeywordIdeas);

/**
 * @swagger
 * /api/keywords/metrics:
 *   post:
 *     summary: Get keyword metrics for a list of keywords
 *     tags: [Keywords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keywords
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               language:
 *                 type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/metrics', keywordController.getKeywordMetrics);

/**
 * @swagger
 * /api/keywords/historical:
 *   post:
 *     summary: Get historical metrics for keywords
 *     tags: [Keywords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keywords
 *             properties:
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               language:
 *                 type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/historical', keywordController.getHistoricalMetrics);

export default router;