module.exports = {
  // Angular Universal server settings.
  ui: {
    ssl: false,
    host: 'localhost',
    port: 3000,
    // NOTE: Space is capitalized because 'namespace' is a reserved string in TypeScript
    nameSpace: '/'
  },
  // The REST API server settings.
  rest: {
    ssl: true,
    host: 'dspace7.4science.it',
    port: 443,
    // NOTE: Space is capitalized because 'namespace' is a reserved string in TypeScript
    nameSpace: '/dspace-spring-rest/api'
  },
  // Caching settings
  cache: {
    // NOTE: how long should objects be cached for by default
    msToLive: 15 * 60 * 1000, // 15 minutes
    // msToLive: 1000, // 15 minutes
    control: 'max-age=60' // revalidate browser
  },
  // Authentications
  auth: {
    target: {
      host: 'https://dspace7.4science.it',
      page: '/dspace-spring-rest/shib.html'
    }
  },
  form: {
    validatorMap: {
      required: 'required',
      regex: 'pattern'
    }
  },
  filters: {
    loadOpened: ['namedresourcetype']
  },
  // Notifications
  notifications: {
    rtl: false,
    position: ['top', 'right'],
    maxStack: 8,
    // NOTE: after how many seconds notification is closed automatically. If set to zero notifications are not closed automatically
    timeOut: 5000, // 5 second
    clickToClose: true,
    // NOTE: 'fade' | 'fromTop' | 'fromRight' | 'fromBottom' | 'fromLeft' | 'rotate' | 'scale'
    animate: 'scale'
  },
  // Submission settings
  submission: {
    autosave: {
      // NOTE: which metadata trigger an autosave
      metadata: ['dc.title', 'dc.identifier.doi', 'dc.identifier.pmid', 'dc.identifier.arxiv'],
      // NOTE: every how many minutes submission is saved automatically
      timer: 5
    },
    metadata: {
      icons: {
        'dc.contributor.author': 'fa-user',
        default: ''
      }
    }
  },
  // Angular Universal settings
  universal: {
    preboot: true,
    async: true,
    time: false
  },
  // Google Analytics tracking id
  gaTrackingId: '',
  // Log directory
  logDirectory: '.',
  // NOTE: will log all redux actions and transfers in console
  debug: false
};
