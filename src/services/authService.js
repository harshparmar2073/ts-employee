import axiosService from './axiosService';

export const login = async (email, password) => {
  return axiosService.post('/auth/authenticate', {
    username: email,
    password,
    mfaType: 'EMAIL',
  });
};

export const verifyMfaCode = async ({ username, password, mfaCode, mfaSessionId }) => {
  return axiosService.post('/auth/authenticate-mfa', {
    username,
    password,
    mfaType: 'EM',
    mfaSessionId,
    mfaCode
  });
};