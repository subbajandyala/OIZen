const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const SENSIBULL_COOKIE = `sb_rudder_utm=%22utm_campaign%22%3A%22option-chain-invoked%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_source%22%3A%22Kite3Web%22; _ga=GA1.1.1212815647.1773819787; rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX18PVoaufhd1dhHPRHqcnfS0%2BA51kGXOXUdh3qZRP M4CeXF%2BLsfmNrQb; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX180BJRQOl1yRr%2FqVmx88yzpRGI1snasnxa3X11tRddbNUB5UkTdEdDz; _gcl_au=1.1.1485466765.1780301843; _ga_NC7XJTRTDX=GS2.1.s1780388777$o3$g1$t1780397875$j60$l0$h0; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX19%2FNGMXMuUSFmLnVadNsmA5K0BY4Bz0BpMpEapn1AGztzc%2BV4zmC5sa3Q1FPUxt10iq9B0G3us94w%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX19Wq9WuiHrwUQz8hkLxVWSzEafHOkWgIbPpKCUccFtzJrKulatcGvpLg6AB4RnMmb1TLyCUYH5sNg%3D%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX19coeC7XeZQERgV1JS5V9U9h%2BjDV98In2MjUKKR30tgw5npk3CQWq%2Fku6phI8%2Bygd20nvv1w1AYUMyn0Q0xSJ1%2FHpTUZ3xc%2B6I0wTgKxy%2F%2BIGKBi0%2BFJGpgCLHUm6B3s2Lg6eN6pz9FToGIsALYt9rsu2%2FDO4jYdZ8if%2BwDgg5tfc1PPuL%2BCBA4pKYX09%Xmmnix3%2B0MmYhFCwTt1G%2FYjc3mVBMzP%2Ben1yCfAjwJt0CPxzQ079Vi5BSBjfodUH%2BgTHfNk1X5py4xsXotUqikhRtk%2Bd7J7FmSeltk%2F3dmYehDMGyfurjYscrSk36nydtqnVZG5VigMAiqur%2BpzjA%2BgqXeoRSANbNy6XE5B5HtNzqHGNJwvo%2FT0rTTJDqG%2B2g2DvwhEM6v3Ltrh4eThl5gTYIWtSVPNDh7vnqFmyDqPwuNfPUz9pOkZXYam51MxkCnQifcGXtmiG2wXLnrla756QuEyfFnF8eVVRbczL6OFoXpHZFXuirBNP3KFjNfJHAJM3czGV%2F%2FyfA%3D%3D; rl_session=RudderEncrypt%3AU2FsdGVkX19%2FOPmPAGnkzaX58gMyUvTTUu3HLWmgQSv%2FDpX6SWzI26eSBIirQ%2BF%2Bv2vL5C4BxnbVSnCKJ1%2F7edT8JXsjpb2VEe%2Bptaq4zRBcSHZ3hHh%2FsMcuzP2YEuOengs1RPCowGLRNLBxDa3fbI7Q%3D%3D`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://web.sensibull.com/',
  'Origin': 'https://web.sensibull.com',
  'cookie': SENSIBULL_COOKIE
};

// OI Analysis endpoint
app.get('/oi/:symbol', async (req, res) => {
  try {
    const url = `https://api.sensibull.com/v1/instruments/${req.params.symbol}/oi_analysis`;
    const r = await axios.get(url, { headers: HEADERS });
    res.json(r.data);
  } catch(e) {
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
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3001, () => console.log('OIZen proxy running'));
