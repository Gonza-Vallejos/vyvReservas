const SESSION_COOKIE_NAME = 'vyv_session';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const sameSite = (process.env.SESSION_COOKIE_SAME_SITE || (
  process.env.NODE_ENV === 'production' ? 'none' : 'lax'
)).toLowerCase();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.SESSION_COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production' || sameSite === 'none',
  sameSite,
  path: '/api',
};

const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: SESSION_TTL_MS,
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
};

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  setSessionCookie,
  clearSessionCookie,
};
