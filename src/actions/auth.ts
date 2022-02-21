import { Dispatch } from 'react';
import { Action } from 'context/types';
import { authService } from 'api/services';

export const getAccessToken = async (code: string, dispatch: Dispatch<Action>) => {
  return await authService
    .getAccessToken(code)
    .then((data) => {
      console.log(data)
      // Persist access token.
      localStorage.setItem('token', JSON.stringify(data));
    })
    .catch((error) => alert(error.message));
}