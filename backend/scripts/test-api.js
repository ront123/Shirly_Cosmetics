const axios = require('axios');

async function testAPI() {
  const headers = {
    'x-api-key': '5ceecbab70580b42b7f88b36',
    'x-api-secret': 'bda93d37995b4fc2b43ca3e79e2ac8ff43adcfbf163a439998e7685fe81bce08ffcc5bb0c7234d7eafcb5d31081b95a07acc1213c5ae4cfa9471845b8362456ee5efcfc5ef894c5185205506d0c9897c6af0bcde3fc747ce8f15fb91a65bfbb0',
    'Content-Type': 'application/json'
  };

  const endpoints = [
    'https://api.easybizy.net/api/v1/customers',
    'https://api.easybizy.net/api/v1/appointments',
    'https://api.easybizy.net/api/v1/meetings',
    'https://api.easybizy.net/api/v1/clients'
  ];

  for (const url of endpoints) {
    try {
      console.log(`Testing GET ${url}...`);
      const res = await axios.get(url, { headers, timeout: 5000 });
      console.log(`GET Success! Data:`, JSON.stringify(res.data).substring(0, 100));
    } catch (err) {
      console.error(`  -> GET Failed: ${err.response ? err.response.status : err.message}`);
    }
  }
}

testAPI();
