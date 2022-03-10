import Keycloak from "keycloak-js";
import Services from 'services/Services'
export default async function checkSSO () {
    console.debug('checkSSO')

    let conf = await Services.initConfig()
    console.debug(conf)

    if (conf.auth === 'keycloak') {
        initKeyCloak(conf)
    }
  
  }

  function initKeyCloak (conf) {
    console.debug('initKeyCloak')
    let initOptions = {
        url: conf.keycloak.url, 
        realm: conf.keycloak.realm, 
        clientId: conf.keycloak.clientId,
        onLoad: 'login-required'
    }
  
    let keycloak = Keycloak(initOptions);
    keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/sso.html'
    }
    ).then((auth) => {
      console.debug('auth', auth)
    })
  
  }
