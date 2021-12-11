export const authHeader = () => {
  // return authorization header with token.
  let token = localStorage.getItem('token');
  if (token) return { 'Authorization': token }
  else return {}
}