/**
 * Communicator messages for routing.
 *
 * Typically you should not call these directly but instead rely on the Router class.
 */

const IWA_DOMAIN = 'iwa';
const LAUNCH_DOMAIN = 'launch';
const APP_DOMAIN = 'app';

const NAVIGATE_EVENT = 'navigate';
const BACK_EVENT = 'navigate_back';

const DOCUMENT_LIBRARY = 'document_library';
const DOCUMENT = 'document';
const IAB = 'iab';

const SET_BACK_OVERRIDE = 'set_back_override';

export type NavigateOptions = {
  app?: string;
  tab?: string;
  replace?: boolean;
  additionalData?: object;
};

/**
 * @deprecated since 2.0 use Messages.iwa.navigate from iwa-core instead.
 */
export const navigate = (route: string, options: NavigateOptions = {}) => {
  const data = {
    route: route,
    transition: options.replace ? 'replace' : 'push',
    webapp_id: options.app,
    tab_id: options.tab,
    ...(options.additionalData || {}),
  };

  return {
    domain: IWA_DOMAIN,
    eventType: NAVIGATE_EVENT,
    data,
  };
};

/**
 * @deprecated since 2.0 use Messages.iwa.navigateBack from iwa-core instead.
 */
export const back = (route?: string, app?: string) => ({
  domain: IWA_DOMAIN,
  eventType: BACK_EVENT,
  data: {
    route_id: route,
    webapp_id: app,
  },
});

/**
 * @deprecated since 2.0 use Messages.launch.documentLibrary from iwa-core instead.
 */
export const launchDocumentLibrary = (category = null) => {
  let data = {};
  if (category) {
    data = { category };
  }
  return {
    domain: LAUNCH_DOMAIN,
    eventType: DOCUMENT_LIBRARY,
    data,
  };
};

/**
 * @deprecated since 2.0 use Messages.launch.document from iwa-core instead.
 */
export const launchDocument = (productId: string, pageSlug: string | null = null) => {
  let data = {
    product_id: productId,
    page_slug: pageSlug,
  };

  return {
    domain: LAUNCH_DOMAIN,
    eventType: DOCUMENT,
    data,
  };
};

/**
 * @deprecated since 2.0 use Messages.launch.browser from iwa-core instead.
 */
export const launchInAppBrowser = (url: string) => ({
  domain: LAUNCH_DOMAIN,
  eventType: IAB,
  data: {
    url,
  },
});

/**
 * @deprecated since 2.0 use Messages.app.setBackOverride from iwa-core instead.
 */
export const setBackOverride = (enabled: boolean) => ({
  domain: APP_DOMAIN,
  eventType: SET_BACK_OVERRIDE,
  data: {
    enabled,
  },
});
