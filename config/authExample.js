module.exports = {
  
      'facebook' : {
          'clientID'      : 'your-secret-clientID-here',  // your App ID
          'clientSecret'  : 'your-client-secret-here',    // your App Secret
          'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
      },
  
      'twitter' : {
          'consumerKey'       : 'your-consumer-key-here',
          'consumerSecret'    : 'your-client-secret-here',
          'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
      },
  
      'google' : {
          'clientID'      : 'your-secret-clientID-here',
          'clientSecret'  : 'your-client-secret-here',
          'callbackURL'   : 'http://localhost:8080/auth/google/callback'
      }
  
  };