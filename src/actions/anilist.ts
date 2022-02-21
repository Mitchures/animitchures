import { Dispatch } from 'react';
import { Action } from 'context/types';
import { anilistService } from 'api/services';

export const fetchAnilistUser = async (userId: string, dispatch: Dispatch<Action>) => {
  return await anilistService
    .fetchUser()
    .then(async (anilistUser) => {
      return await anilistService
        .saveUser(userId, anilistUser)
        .then((anilist_user) => {
          dispatch({
            type: 'set_anilist_user',
            anilist_user
          })
        })
    })
    .catch((error) => alert(error.message));
}

export const getAnilistMediaListCollection = async (anilistUserId: number, userName: string) => {
  return await anilistService
    .fetchMediaListCollection(anilistUserId, userName)
    .then((data) => data)
    .catch((error) => alert(error.message));
}

export const getAnilistUserFromFirestore = async (userId: string, dispatch: Dispatch<Action>) => {
  return await anilistService
    .getUser(userId)
    .then((anilist_user) => {
      dispatch({
        type: 'set_anilist_user',
        anilist_user
      })
    })
    .catch((error) => alert(error.message));
}

export const getAnilistUserDetails = async (userName: string, dispatch: Dispatch<Action>) => {
  return await anilistService
    .fetchUserDetails(userName)
    .then((data) => data)
    .catch((error) => alert(error.message));
}

export const getAnilistUserActivity = async (anilistUserId: number, dispatch: Dispatch<Action>) => {
  return await anilistService
    .fetchUserActivity(anilistUserId)
    .then((data) => data)
    .catch((error) => alert(error.message));
}