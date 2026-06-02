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
  'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'cookie': SENSIBULL_COOKIE
};

// OI Analysis endpoint
app.get('/oi/:symbol', async (req, res) => {
  try {
    const url = `https://api.sensibull.com/v1/instruments/${req.params.symbol}/oi_analysis`;
    const r = await axios.get(url, { headers: HEADERS });
    res.json(r.data);
  } catch(e) {
    console.error(req.params.symbol, e.message);
    res.status(500).json({ error: e.message });
  }
});

// OI Change endpoint (fallback)
app.get('/oichange/:symbol', async (req, res) => {
  try {
    const url = `https://api.sensibull.com/v1/oi_change/${req.params.symbol}`;
    const r = await axios.get(url, { headers: HEADERS });
    res.json(r.data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(process.env.PORT || 3001, () => console.log('OIZen proxy running'));
