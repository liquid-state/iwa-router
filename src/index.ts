import * as messages from './messages';
import * as querystring from './querystring';
import Router from './router';
import createWrappedHistory from './historyWrapper';

export { messages, querystring, createWrappedHistory, Router };

import createApp from '@liquid-state/iwa-core';

const initialise = (app: any, historyFactory: any) => {
  const router = new Router(app.communicator);
  const history = createWrappedHistory(historyFactory, router);
  router.setHistory(history);
  return {
    router,
    history,
  };
};

export default initialise;
