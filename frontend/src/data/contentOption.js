const contactConfig = {
    YOUR_EMAIL: 'contact@sizops.co.il',
    YOUR_PHONE: '1-587-802-2513+',
    YOUR_PHONEWA: '15878022513',
  };

  
  const apiUrl = {
    API_BASE_URL_DEV:  process.env.REACT_APP_BACKEND_URL_DEV || 'http://localhost:3010',
    API_BASE_URL_PROD: 'https://sizops.co.il/server',
  }
  
   
  export {
    contactConfig,
    apiUrl,
  };