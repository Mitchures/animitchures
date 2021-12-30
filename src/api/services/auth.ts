export const authService = {
  getAccessToken: async (code: string) => {
    // proxy stuff: https://stackoverflow.com/questions/36878255/allow-access-control-allow-origin-header-using-html5-fetch-api
    // https://anilist.co/api/v2/oauth/token
    return await fetch('http://localhost:8010/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_ANILIST_CLIENT_ID,
        client_secret: process.env.REACT_APP_ANILIST_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000/callback',
        code,
      }),
    })
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => alert(error.message));
  }
}