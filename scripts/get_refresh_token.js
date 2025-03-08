import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import url from 'url';
import open from 'open';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const PORT = 8080;
const SCOPES = ['https://www.googleapis.com/auth/adwords'];

// Get client ID and client secret from environment variables
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET must be set in .env file');
  process.exit(1);
}

// Create OAuth2 client
const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  `http://localhost:${PORT}`
);

// Generate authorization URL
const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Force to get refresh token
});

// Create HTTP server to handle the OAuth2 callback
const server = http.createServer(async (req, res) => {
  try {
    // Parse the URL and get the code parameter
    const queryParams = url.parse(req.url, true).query;
    const code = queryParams.code;

    if (code) {
      // Exchange the authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Display the refresh token
      console.log('\nRefresh Token:', tokens.refresh_token);
      console.log('\nAccess Token:', tokens.access_token);
      console.log('\nExpiry Date:', tokens.expiry_date);

      // Save the refresh token to .env file
      if (tokens.refresh_token) {
        try {
          let envContent = fs.readFileSync('.env', 'utf8');
          
          // Check if GOOGLE_ADS_REFRESH_TOKEN already exists in .env
          if (envContent.includes('GOOGLE_ADS_REFRESH_TOKEN=')) {
            // Replace existing refresh token
            envContent = envContent.replace(
              /GOOGLE_ADS_REFRESH_TOKEN=.*/,
              `GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`
            );
          } else {
            // Add new refresh token
            envContent += `\nGOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`;
          }
          
          fs.writeFileSync('.env', envContent);
          console.log('\nRefresh token saved to .env file');
        } catch (error) {
          console.error('Error saving refresh token to .env file:', error);
        }
      } else {
        console.warn('\nWarning: No refresh token received. Try again with prompt=consent parameter.');
      }

      // Send success response to browser
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>Authentication Successful</h1>
            <p>You have successfully authenticated with Google Ads API.</p>
            <p>The refresh token has been saved to your .env file.</p>
            <p>You can close this window now.</p>
          </body>
        </html>
      `);

      // Close the server after a short delay
      setTimeout(() => {
        server.close();
        console.log('\nServer closed. You can close this terminal window.');
      }, 2000);
    } else {
      // Handle error case
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>Authentication Failed</h1>
            <p>No authorization code received from Google.</p>
            <p>Please try again.</p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h1>Authentication Error</h1>
          <p>An error occurred during authentication: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`\nOAuth2 callback server listening on http://localhost:${PORT}`);
  console.log('\nOpening browser to authorize application...');
  
  // Open the authorization URL in the default browser
  open(authorizeUrl);
  
  console.log('\nIf the browser does not open automatically, please visit:');
  console.log(authorizeUrl);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});