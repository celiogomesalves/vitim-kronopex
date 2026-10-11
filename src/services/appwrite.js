import { Client, Account, Databases, Storage, OAuthProvider, Query, ID } from 'appwrite';
import { StorageService } from './storage';

// Initialize Appwrite Client
const client = new Client();
const DEFAULT_ENDPOINT = 'https://appwrite.agenc-ia.net/v1';
const DEFAULT_PROJECT = '6acb990e000fac38ac2f';
const DEFAULT_DATABASE = 'kronopex_main';
const DEFAULT_BUCKET = 'kronopex_storage';

client.setEndpoint(DEFAULT_ENDPOINT).setProject(DEFAULT_PROJECT);

const initAppwrite = () => {
  const config = StorageService.getConfig();
  const endpoint = config.appwriteEndpoint || DEFAULT_ENDPOINT;
  const project = config.appwriteProjectId || DEFAULT_PROJECT;
  if (endpoint && project) {
    client.setEndpoint(endpoint).setProject(project);
    return true;
  }
  return false;
};

export const isAppwriteConfigured = () => true;

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const AppwriteService = {
  init: initAppwrite,
  client,
  account,
  databases,
  storage,

  getDatabaseId: () => {
    const config = StorageService.getConfig();
    return config.appwriteDatabaseId || DEFAULT_DATABASE;
  },

  getBucketId: () => {
    const config = StorageService.getConfig();
    return config.appwriteBucketId || DEFAULT_BUCKET;
  },

  // Busca todos os documentos de uma collection
  listDocuments: async (collectionId) => {
    try {
      const dbId = AppwriteService.getDatabaseId();
      const res = await databases.listDocuments(dbId, collectionId, [
        Query.limit(100)
      ]);
      return res.documents.map((doc) => {
        try {
          return typeof doc.data === 'string' ? JSON.parse(doc.data) : (doc.data || doc);
        } catch {
          return doc;
        }
      });
    } catch (error) {
      console.warn(`[Appwrite] Falha ao listar ${collectionId}:`, error.message || error);
      return null;
    }
  },

  // Salva ou atualiza um documento
  saveDocument: async (collectionId, docId, dataObj) => {
    try {
      const dbId = AppwriteService.getDatabaseId();
      const cleanId = String(docId).replace(/[^a-zA-Z0-9._-]/g, '_');
      const payload = { data: JSON.stringify(dataObj) };

      try {
        return await databases.updateDocument(dbId, collectionId, cleanId, payload);
      } catch (updateErr) {
        // Se não existir, cria
        return await databases.createDocument(dbId, collectionId, cleanId, payload);
      }
    } catch (error) {
      console.error(`[Appwrite] Falha ao salvar em ${collectionId}:`, error);
      throw error;
    }
  },

  // Remove um documento
  deleteDocument: async (collectionId, docId) => {
    try {
      const dbId = AppwriteService.getDatabaseId();
      const cleanId = String(docId).replace(/[^a-zA-Z0-9._-]/g, '_');
      await databases.deleteDocument(dbId, collectionId, cleanId);
      return true;
    } catch (error) {
      console.error(`[Appwrite] Falha ao deletar em ${collectionId}:`, error);
      return false;
    }
  },

  // Google OAuth Login
  loginWithGoogle: async (successUrl = window.location.href, failureUrl = window.location.href) => {
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
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Erro ao deslogar do Appwrite:', error);
      return false;
    }
  }
};
