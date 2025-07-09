import axiosService from './axiosService';

// First step: authenticate user credentials, return supported MFA
export const authenticate = async (email, password) => {
  return axiosService.post('/auth/authenticate', {
    username: email,
    password,
  });
};

// Second step: trigger MFA challenge after selecting method
export const authenticatePreMfa = async (email, password, selectedMfa) => {
  return axiosService.post('/auth/authenticate-pre-mfa', {
    username: email,
    password,
    mfaType: selectedMfa,
  });
};

// Final step: verify code from selected MFA channel
export const verifyMfaCode = async ({ username, password, mfaCode, mfaSessionId,authRememberMeExpDays,authRememberMe }) => {
  return axiosService.post('/auth/authenticate-mfa', {
    username,
    password,
    mfaType: 'EM', // Or use selectedMfa if dynamic
    mfaSessionId,
    mfaCode,
    authRememberMeExpDays,
    authRememberMe
  });
};