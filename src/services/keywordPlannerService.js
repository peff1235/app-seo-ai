import { GoogleAdsApi } from 'google-ads-api';
import googleAdsConfig from '../config/googleAdsConfig.js';

// Initialize Google Ads API client
const client = new GoogleAdsApi({
  client_id: googleAdsConfig.client_id,
  client_secret: googleAdsConfig.client_secret,
  developer_token: googleAdsConfig.developer_token,
  refresh_token: googleAdsConfig.refresh_token,
});

// Get customer instance
const customer = client.Customer({
  customer_id: googleAdsConfig.login_customer_id,
});

/**
 * Generate keyword ideas based on a seed keyword
 * @param {string} keyword - Seed keyword
 * @param {string} language - Language code (e.g., 'en')
 * @param {Array} locations - Array of location IDs
 * @param {number} limit - Maximum number of keyword ideas to return
 * @returns {Promise<Array>} - Array of keyword ideas with metrics
 */
export const generateKeywordIdeas = async (keyword, language = 'en', locations = [2250], limit = 50) => {
  try {
    // Create keyword text list
    const keywordTexts = [keyword];

    // Generate keyword ideas
    const keywordIdeas = await customer.keywordPlanner.generateKeywordIdeas({
      keywordTexts,
      language,
      geoTargetConstants: locations,
      keywordPlanNetwork: 'GOOGLE_SEARCH_AND_PARTNERS',
    });

    // Process and format the results
    const formattedResults = keywordIdeas.slice(0, limit).map((idea) => {
      return {
        keyword: idea.text,
        avgMonthlySearches: idea.keywordIdeaMetrics?.avgMonthlySearches || 0,
        competition: idea.keywordIdeaMetrics?.competition || 'UNKNOWN',
        competitionIndex: idea.keywordIdeaMetrics?.competitionIndex || 0,
        lowTopOfPageBidMicros: idea.keywordIdeaMetrics?.lowTopOfPageBidMicros
          ? parseFloat(idea.keywordIdeaMetrics.lowTopOfPageBidMicros) / 1000000
          : 0,
        highTopOfPageBidMicros: idea.keywordIdeaMetrics?.highTopOfPageBidMicros
          ? parseFloat(idea.keywordIdeaMetrics.highTopOfPageBidMicros) / 1000000
          : 0,
      };
    });

    return formattedResults;
  } catch (error) {
    console.error('Error generating keyword ideas:', error);
    throw new Error(`Failed to generate keyword ideas: ${error.message}`);
  }
};

/**
 * Get keyword volume and metrics for a list of keywords
 * @param {Array} keywords - Array of keywords to get metrics for
 * @param {string} language - Language code (e.g., 'en')
 * @param {Array} locations - Array of location IDs
 * @returns {Promise<Array>} - Array of keywords with metrics
 */
export const getKeywordMetrics = async (keywords, language = 'en', locations = [2250]) => {
  try {
    // Generate keyword ideas for the provided keywords
    const keywordIdeas = await customer.keywordPlanner.generateKeywordIdeas({
      keywordTexts: keywords,
      language,
      geoTargetConstants: locations,
      keywordPlanNetwork: 'GOOGLE_SEARCH_AND_PARTNERS',
    });

    // Process and format the results
    const formattedResults = keywordIdeas.map((idea) => {
      return {
        keyword: idea.text,
        avgMonthlySearches: idea.keywordIdeaMetrics?.avgMonthlySearches || 0,
        competition: idea.keywordIdeaMetrics?.competition || 'UNKNOWN',
        competitionIndex: idea.keywordIdeaMetrics?.competitionIndex || 0,
        lowTopOfPageBidMicros: idea.keywordIdeaMetrics?.lowTopOfPageBidMicros
          ? parseFloat(idea.keywordIdeaMetrics.lowTopOfPageBidMicros) / 1000000
          : 0,
        highTopOfPageBidMicros: idea.keywordIdeaMetrics?.highTopOfPageBidMicros
          ? parseFloat(idea.keywordIdeaMetrics.highTopOfPageBidMicros) / 1000000
          : 0,
      };
    });

    return formattedResults;
  } catch (error) {
    console.error('Error getting keyword metrics:', error);
    throw new Error(`Failed to get keyword metrics: ${error.message}`);
  }
};

/**
 * Get historical metrics for keywords
 * @param {Array} keywords - Array of keywords to get historical metrics for
 * @param {string} language - Language code (e.g., 'en')
 * @param {Array} locations - Array of location IDs
 * @returns {Promise<Array>} - Array of keywords with historical metrics
 */
export const getHistoricalMetrics = async (keywords, language = 'en', locations = [2250]) => {
  try {
    // Create a keyword plan
    const keywordPlan = await customer.keywordPlans.create({
      name: `Keyword Plan ${Date.now()}`,
    });

    // Create a keyword plan campaign
    const keywordPlanCampaign = await customer.keywordPlanCampaigns.create({
      keywordPlan: keywordPlan.resource_name,
      name: 'Keyword Plan Campaign',
      cpcBidMicros: 1000000, // $1.00
      geoTargets: locations.map(locationId => ({
        geoTargetConstant: `geoTargetConstants/${locationId}`,
      })),
      languageConstant: `languageConstants/${language}`,
    });

    // Create a keyword plan ad group
    const keywordPlanAdGroup = await customer.keywordPlanAdGroups.create({
      keywordPlanCampaign: keywordPlanCampaign.resource_name,
      name: 'Keyword Plan Ad Group',
      cpcBidMicros: 1000000, // $1.00
    });

    // Create keyword plan keywords
    await Promise.all(
      keywords.map(keyword =>
        customer.keywordPlanKeywords.create({
          keywordPlanAdGroup: keywordPlanAdGroup.resource_name,
          text: keyword,
          cpcBidMicros: 1000000, // $1.00
        })
      )
    );

    // Generate forecast metrics
    const forecastMetrics = await customer.keywordPlans.generateForecastMetrics({
      keywordPlan: keywordPlan.resource_name,
    });

    // Clean up by removing the keyword plan
    await customer.keywordPlans.delete({
      resource_name: keywordPlan.resource_name,
    });

    return forecastMetrics;
  } catch (error) {
    console.error('Error getting historical metrics:', error);
    throw new Error(`Failed to get historical metrics: ${error.message}`);
  }
};

export default {
  generateKeywordIdeas,
  getKeywordMetrics,
  getHistoricalMetrics,
};