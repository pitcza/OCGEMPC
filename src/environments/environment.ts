export const environment = {
  production: false,
  // baseUrl: 'http://localhost:3300',
  baseUrl: `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3300`,
  encryptionKey: '12345678901234567890123456789012'
};