/** === API setup === */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" } 
  });
  
  function getStoredToken() {
    try {
      const raw = localStorage.getItem(ACCESS_TOKEN_NAME);
      if (!raw) return null;
  
      // Jos on JSON objekti — analysoi ja ottaa kenttä token
      try {
        const parsed = JSON.parse(raw);
        if (!parsed) return null;
        // mahdolliset kenttien nimet: token, access_token, authToken
        return parsed.token ?? parsed.access_token ?? parsed.authToken ?? null;
      } catch (err) {
        // ei JSON — mahdollisesti se on «puhdas» token kenttä
        return raw;
      }
    } catch (e) {
      console.error("getStoredToken error", e);
      return null;
    }
  }
  
  const unwrap = (res) => {
    return res?.data?.data ?? res?.data ?? res;
  };
  