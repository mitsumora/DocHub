import consts from '@front/consts';

export type TCacheMethods = 'GET' | 'HEAD';
export type TEnvValue = string | undefined;
export type TProcessEnvValues = { [key: string | symbol]: TEnvValue };

export enum Plugins {
  idea = 'idea',
  vscode = 'vscode'
}

export enum CACHE_LEVEL {
  low = 1,
  high = 2
}

const ENV_ERROR_TAG = '[env.dochub]';

export default {
  dochub: <TProcessEnvValues>{},
  isPlugin(plugin?: Plugins): boolean {
    const isIdea = !!window.DocHubIDEACodeExt;
    const isVsCode = !!window.DochubVsCodeExt;

    switch(plugin) {
    case Plugins.idea: {
      return isIdea;
    }
    case Plugins.vscode: {
      return isVsCode;
    }
    default: {
      return isIdea || isVsCode;
    }
    }
  },
  // Адрес backend сервере
  backendURL(): string {
    return this.dochub.VUE_APP_DOCHUB_BACKEND_URL || window.origin;
  },
  // Адрес API доступа к файлам backend сервера
  backendFileStorageURL(): string {
    return (new URL('/core/storage/', this.backendURL())).toString();
  },
  isBackendMode() {
    return !this.isPlugin() && (process.env.VUE_APP_DOCHUB_BACKEND_URL || ((process.env.VUE_APP_DOCHUB_MODE || '').toLowerCase() === 'backend'));
  },
  isProduction(): boolean {
    return this.dochub.NODE_ENV === 'production';
  },
  isTraceJSONata(): boolean {
    return (this.dochub.VUE_APP_DOCHUB_JSONATA_ANALYZER || 'N').toUpperCase() === 'Y';
  },
  cacheWithPriority(priority: CACHE_LEVEL): boolean {
    const systemSetting = +this.dochub.VUE_APP_DOCHUB_CACHE_LEVEL;

    if (systemSetting in CACHE_LEVEL) {
      if (this.cache) {
        return systemSetting === priority;
      }
    } else if (systemSetting) {
      // eslint-disable-next-line no-console
      console.error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE_LEVEL=${systemSetting}" в env!`, ENV_ERROR_TAG);
    }

    return false;
  },
  get cache(): TCacheMethods | null {
    const currentMethod = (this.dochub.VUE_APP_DOCHUB_CACHE || 'NONE').toUpperCase();

    if (currentMethod === 'NONE') {
      return null;
    }

    if (['GET', 'HEAD'].includes(currentMethod)) {
      return currentMethod as TCacheMethods;
    }

    throw new Error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE=${currentMethod}" в env!`);
  },
  get rootDocument(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_ROOT_DOCUMENT;
  },
  get rootManifest(): TEnvValue {
    if (this.isPlugin(Plugins.idea)) {
      return consts.plugin.ROOT_MANIFEST;
    } else if (this.isPlugin(Plugins.vscode)) {
      return window.DochubVsCodeExt.rootManifest;
    } else return this.dochub.VUE_APP_DOCHUB_ROOT_MANIFEST;
  },
  get renderCore(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_RENDER_CORE;
  },
  get gitlabUrl(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_GITLAB_URL;
  },
  get appendDocHubMetamodel(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_APPEND_DOCHUB_METAMODEL;
  },
  get appendDocHubDocs(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS;
  },
  get appId(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_APP_ID;
  },
  get clientSecret(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_CLIENT_SECRET;
  },
  get personalToken(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_PERSONAL_TOKEN;
  },
  // Определяет сервер рендеринга
  get plantUmlServer(): TEnvValue {
    const envValue = this.dochub.VUE_APP_PLANTUML_SERVER || consts.plantuml.DEFAULT_SERVER;
    if (this.isPlugin(Plugins.idea)) {
      const settings = window.DocHubIDEACodeExt?.settings;
      return settings?.isEnterprise ? envValue : (
        settings?.render?.external ? settings?.render?.server : null
      );
    } else return envValue;
  },
  // Определяет тип запроса к серверу рендеринга
  get plantUmlRequestType(): TEnvValue {
    const settings = (window.DocHubIDEACodeExt || window.DochubVsCodeExt)?.settings;
    if (this.isPlugin(Plugins.idea) && !settings?.isEnterprise) {
      return settings?.render?.external ? 'get' : 'plugin';
    } else if (this.isPlugin(Plugins.vscode)) {
      return settings?.render?.request_type || 'get';
    } else return 'get';
  },
  get isAppendDocHubMetamodel(): boolean {
    return (this.appendDocHubMetamodel || 'y').toLowerCase() === 'y';
  },
  get isAppendDocHubDocs(): boolean {
    return (this.appendDocHubDocs || 'y').toLowerCase() === 'y';
  }
};