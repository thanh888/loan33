import {Constant} from './constant-base';

export enum Constant {
  BASE_URL = 'https://docbaodoithuong.com/user',
  BASE_URL_REWARD = 'https://docbaodoithuong.com/reward',
  SHARED_PREFERENCES_USER_KEY = 'USER_INFO',
  SHARED_PREFERENCES_TURN_KEY = 'USER_COIN',
  ATTENDANCE = 'ATTENDANCE',
  DAY_ACTIVE = 'DAY_ACTIVE',
  DAY_CHECK = 'DAY_CHECK',
  STEP = 'STEP',
  COIN = 'COIN',
  SKU = 'com.mmkmnonl.mmomakemoneyonline',
  TOKEN = 'TOKEN',

  BASE_URL_IP = 'http://ip-api.com/',
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  spurlus: number;
  code: string;
}

export const API_CONFIG = {
  // Auth APIs
  login: {
    url: `${Constant.BASE_URL}/login`,
    method: 'POST',
    body: {
      username: string,
      password: string,
    },
  },

  register: {
    url: `${Constant.BASE_URL}/register`,
    method: 'POST',
    body: {
      username: string,
      name: string,
      password: string,
      code: string, // Referral code
    },
  },

  checkUsername: {
    url: `${Constant.BASE_URL}/checkUsername`,
    method: 'POST',
    body: {
      username: string,
    },
  },

  // User APIs
  getUser: {
    url: `${Constant.BASE_URL}/getUser`,
    method: 'POST',
    body: {
      token: string,
    },
  },

  updateSpurlus: {
    url: `${Constant.BASE_URL}/updateSpurlus`,
    method: 'POST',
    body: {
      idUser: string,
      spurlus: number,
    },
  },

  // Reward APIs
  getFriendIntroduced: {
    url: `${Constant.BASE_URL_REWARD}/getFriendIntroduced`,
    method: 'POST',
    body: {
      idUser: string,
    },
  },
};

// Helper types
export type ApiEndpoint = keyof typeof API_CONFIG;

// Helper functions
export const getApiConfig = (endpoint: ApiEndpoint) => API_CONFIG[endpoint];

// IP API for country detection
export const IP_API = {
  getLocation: {
    url: `${Constant.BASE_URL_IP}/json`,
    method: 'GET',
  },
};
