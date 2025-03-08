import dotenv from 'dotenv';

dotenv.config();

// Google Ads API configuration
const googleAdsConfig = {
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  use_proto_plus: true,
};

export default googleAdsConfig;