const express = require('express');
const router  = express.Router();
const axios   = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION  = process.env.META_API_VERSION || 'v19.0';

/**
 * GET /api/instagram/profile
 * Fetches the Instagram Business Account linked to the Facebook Pages owned by the token.
 */
router.get('/profile', async (req, res) => {
  if (!ACCESS_TOKEN) {
    return res.status(400).json({ success: false, error: 'Access token missing in server configuration' });
  }

  try {
    // 1. Fetch Facebook Pages linked to the token and their connected Instagram Business Accounts
    const response = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/me/accounts`,
      {
        params: {
          fields: 'name,instagram_business_account{id,name,username,profile_picture_url,followers_count}',
          access_token: ACCESS_TOKEN
        },
        timeout: 10000
      }
    );

    const pages = response.data?.data || [];
    console.log(`📊 Meta returned ${pages.length} pages for token`);

    // Find a page that has a connected Instagram Business Account
    let instagramAccount = null;
    for (const page of pages) {
      if (page.instagram_business_account) {
        instagramAccount = page.instagram_business_account;
        break;
      }
    }

    if (instagramAccount) {
      console.log(`✅ Found connected Instagram account: @${instagramAccount.username}`);
      return res.json({
        success: true,
        source: 'live',
        username: instagramAccount.username,
        name: instagramAccount.name || instagramAccount.username,
        followers: instagramAccount.followers_count || 0,
        profile_picture: instagramAccount.profile_picture_url || null
      });
    }

    // Fallback if no linked Instagram Business Account is found on the pages, or list is empty
    // We return a mock based on the user request, but indicate it's a fallback
    console.warn('⚠️ No Instagram Business Account found linked to the Facebook pages. Returning fallback.');
    return res.json({
      success: true,
      source: 'fallback',
      username: 'shirly_beauty_complex',
      name: 'שירלי קוסמטיקס',
      followers: 1247,
      profile_picture: null,
      message: 'לא נמצא חשבון אינסטגרם מקושר לדפי הפייסבוק של המשתמש. ודא שקישרת את חשבון האינסטגרם העסקי לעמוד הפייסבוק.'
    });

  } catch (err) {
    const errMsg = err.response?.data || err.message;
    console.error('❌ Failed to fetch Instagram profile from Meta:', errMsg);
    
    // In case of any API error (e.g. token permissions), return fallback so the app does not break
    return res.json({
      success: true,
      source: 'fallback_on_error',
      username: 'shirly_beauty_complex',
      name: 'שירלי קוסמטיקס',
      followers: 1247,
      profile_picture: null,
      error: errMsg
    });
  }
});

module.exports = router;
