const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const SENSIBULL_COOKIE = `sb_rudder_utm=%22utm_campaign%22%3A%22option-chain-invoked%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_source%22%3A%22Kite3Web%22; _ga=GA1.1.1212815647.1773819787; rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX18PVoaufhd1dhHPRHqcnfS0%2BA5lkGXOXUdh3qZRPM4CeXF%2BLsfmNrQb; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX180BJRQOllyRr%2FqVmx88yzpRGIlsnasnxa3X11tRddbNUB5UkTdEdDz; _gcl_au=1.1.1485466765.1780301843; bkd_ref=5Xvy4ii3LrEoq5r; access_token=0ASVbUw10sT_f0PDo8XEpRJ7_BtUe4dDN-GicUykBzY; _ga_NC7XJTRTDX=GS2.1.s1780388777$o3$g1$t1780398702$j59$l0$h0; _cfuvid=L2nr8KpkJji7fdzeTThlavNiTDT7xZAOZUmO7rgoJ5k-1780398703.194655-1.0.1.1-DUYIZbaBeH02YqKszRRT30WeTHlsg6pCdODX4wuLxfc; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX1%2BE6HZqW0mCpnjJASl2aTuZTSDGGgG3rNPyazLcVzprdlDr3w3hsUdUkIGu3JSMm4ySgklzrKfOKQ%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX1%2FENJuwa3sgKudqt1pbxCAWkn%2BRaUXfW9OvNQjx8syzcF8LeSsNWEnltnfEUzn1WXu9r9tfbg32OQ%3D%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX19jRXJwTVNxG8AYso0ElVf%2BHt9FzkLWWTEbCr6AbyXdBc8Oml%2FL%2BUal8%2FzC1%2Bh1MyP00AinytSbRDD1w94mTZoi97cl8QoRQpFJcRWMN7EFTbrY7%2F4PcDyO7pNdKIZJae2FbOH17O91%2Bijca5DCGNI%2FrOVQ0uT9ERQdYHnglImBoZTk8g2hDeJ9ieakYAb5%2Fk%2BXV5McvuS7wa8hl0CX5L1pEFMSKolWDRkxlrC%2FB2bR1pPl7xjzFCEVmlF0Wfpm3UCOiUElnhbiclp0hmVvwM7bNU7vObHzT6L0%2BFYKmhgLrq8zyeRc0MuzN5yqrJWwbaScCpMtlIm%2BBm3ZlowrEID6f2xpxdcn5ZvFX2SdV7mkCaKV0SjhPdQu%2Bjt7DT7T9vzxFdS0yPg8G6Q5nHqBxX6mOx71dC2AEhD%2BjqX7m%2FQROAHDm8Qdp7uOhKEGooz1Kw%2BXDvxBHt1UNmGXHpX1mNYip2lZFHCQpqFM5eUKrGBdSie3GBWAXR%2FkAvygUXp6M6tQQo%2Bz4NhPcg%3D%3D; rl_session=RudderEncrypt%3AU2FsdGVkX19F2SZpiVrO7uzJGgZXPQ0NA104QDyJ92%2BqSAD1EYMhirg1hWx%2BmOt7hLit3Tf6x3QDFFCJXNhznPviEdpm4mA8PP2TE09zd48aOS376Bb%2FcZoLiMrqVXAt6V9T9B1D3xp5FYjuDEqK9g%3D%3D`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://web.sensibull.com/',
  'Origin': 'https://web.sensibull.com',
  'cookie': SENSIBULL_COOKIE
};

// Try multiple endpoints and return whichever has data
async function fetchOIData(symbol) {
  const endpoints = [
    // Option chain endpoint - most reliable
    `https://api.sensibull.com/v1/option_chain/${symbol}`,
    // OI change vs strike
    `https://api.sensibull.com/v1/oi_change_vs_strike?tradingsymbol=${symbol}`,
    // OI analysis
    `https://api.sensibull.com/v1/instruments/${symbol}/oi_analysis`,
    // Live OI
    `https://api.sensibull.com/v1/live_oi/${symbol}`,
  ];

  for (const url of endpoints) {
    try {
      const r = await axios.get(url, { headers: HEADERS, timeout: 8000 });
      const d = r.data;
      // Check if data is not empty
      if (d && (
        (Array.isArray(d.data) && d.data.length > 0) ||
        (d.data && typeof d.data === 'object' && Object.keys(d.data).length > 0) ||
        d.total_call_oi || d.totalCallOI || d.call_oi
      )) {
        return { url, data: d };
      }
    } catch(e) {
      // try next
    }
  }
  return null;
}

// Main OI endpoint
app.get('/oi/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const result = await fetchOIData(symbol);
    if (result) {
      res.json({ status: true, source: 'live', endpoint: result.url, data: result.data });
    } else {
      res.json({ status: false, source: 'none', message: 'All endpoints returned empty', data: [] });
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Raw proxy - pass through any sensibull API path
// e.g. /proxy/v1/option_chain/NIFTY
app.get('/proxy/*', async (req, res) => {
  const path = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.sensibull.com/${path}${query ? '?' + query : ''}`;
  try {
    const r = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message, url });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Debug - shows what endpoints return for a symbol
app.get('/debug/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const endpoints = [
    `https://api.sensibull.com/v1/option_chain/${symbol}`,
    `https://api.sensibull.com/v1/oi_change_vs_strike?tradingsymbol=${symbol}`,
    `https://api.sensibull.com/v1/instruments/${symbol}/oi_analysis`,
    `https://api.sensibull.com/v1/live_oi/${symbol}`,
  ];
  const results = [];
  for (const url of endpoints) {
    try {
      const r = await axios.get(url, { headers: HEADERS, timeout: 6000 });
      const d = r.data;
      const dataLen = Array.isArray(d?.data) ? d.data.length :
                      (d?.data && typeof d.data === 'object') ? Object.keys(d.data).length : '?';
      results.push({ url, status: r.status, dataLength: dataLen, keys: Object.keys(d) });
    } catch(e) {
      results.push({ url, error: e.message });
    }
  }
  res.json(results);
});

app.listen(process.env.PORT || 3001, () => console.log('OIZen proxy running'));
