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

export const back = (route?: string, app?: string) => ({
  domain: IWA_DOMAIN,
  eventType: BACK_EVENT,
  data: {
    route_id: route,
    webapp_id: app,
  },
});

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

export const launchInAppBrowser = (url: string) => ({
  domain: LAUNCH_DOMAIN,
  eventType: IAB,
  data: {
    url,
  },
});

export const setBackOverride = (enabled: boolean) => ({
  domain: APP_DOMAIN,
  eventType: SET_BACK_OVERRIDE,
  data: {
    enabled,
  },
});
