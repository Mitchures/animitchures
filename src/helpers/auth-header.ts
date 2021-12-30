export const authHeader = () => {
  // return authorization header with token.
  const token = localStorage.getItem('token');
  if (token) {
    const { token_type, access_token } = JSON.parse(token);
    return { 'Authorization': `${token_type} ${access_token}` }
  }
  else return {}
}