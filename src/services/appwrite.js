import { Client, Account, Databases, Storage, OAuthProvider } from 'appwrite';
import { StorageService } from './storage';

// Initialize Appwrite Client
const client = new Client();

const initAppwrite = () => {
  const config = StorageService.getConfig();
  if (config.appwriteEndpoint && config.appwriteProjectId) {
    client
      .setEndpoint(config.appwriteEndpoint)
      .setProject(config.appwriteProjectId);
    return true;
  }
  return false;
};

export const isAppwriteConfigured = () => {
  const config = StorageService.getConfig();
  return Boolean(config.appwriteProjectId);
};

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const AppwriteService = {
  init: initAppwrite,

  // Google OAuth Login
  loginWithGoogle: async (successUrl = window.location.href, failureUrl = window.location.href) => {
    if (!isAppwriteConfigured()) {
      console.warn('Appwrite não configurado. Utilizando modo de demonstração.');
      return false;
    }
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      );
      return true;
    } catch (error) {
      console.error('Erro ao iniciar autenticação Google com Appwrite:', error);
      throw error;
    }
  },

  // Check current session
  getCurrentUser: async () => {
    if (!isAppwriteConfigured()) return null;
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  // Logout
  logout: async () => {
    if (!isAppwriteConfigured()) return true;
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Erro ao deslogar do Appwrite:', error);
      return false;
    }
  }
};
