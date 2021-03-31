import { Router } from 'express'
import { createProxyServer } from 'http-proxy'
import { extractUserIdFromRequest, extractUserToken } from '../utils/requestExtract'
import { CONSTANTS } from './env'
import { logInfo } from './logger'

const proxyCreator = (timeout = 10000) => createProxyServer({
  timeout,
})
const proxy = createProxyServer({})
const PROXY_SLUG = '/proxies/v8'

// tslint:disable-next-line: no-any
proxy.on('proxyReq', (proxyReq: any, req: any, _res: any, _options: any) => {
  // tslint:disable-next-line: no-console
  console.log('----req.originalUrl in proxy-----', req.originalUrl)
  // tslint:disable-next-line: no-console
  console.log('-----in proxy session----', req.session)
  proxyReq.setHeader('X-Channel-Id', '0131397178949058560')
  // tslint:disable-next-line: max-line-length
  proxyReq.setHeader('Authorization', CONSTANTS.SB_API_KEY)
  proxyReq.setHeader('x-authenticated-user-token', extractUserToken(req))
  proxyReq.setHeader('x-authenticated-userid', extractUserIdFromRequest(req))
  // tslint:disable-next-line: no-console
  console.log('proxyReq.headers:', proxyReq.headers)

  if (!req.originalUrl.includes('/discussion/user/v1/create')) {
    // tslint:disable-next-line: no-console
    console.log('------------req.session----------', req.session)
    // tslint:disable-next-line: no-console
    console.log('------------req.session.nodebb_authorization_token----------', req.session.nodebb_authorization_token)
    // tslint:disable-next-line: no-console
    console.log('------------proxy req----------', proxyReq.session)
    proxyReq.setHeader('Authorization', 'Bearer ' + req.session.nodebb_authorization_token)
  }

  if (req.body) {
    const bodyData = JSON.stringify(req.body)
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
    proxyReq.write(bodyData)
  }
})

// tslint:disable-next-line: no-any
// discussProxy.on('proxyReq', (proxyReq: any, req: any, _res: any, _options: any) => {

//   proxyReq.setHeader('X-Channel-Id', '0131397178949058560')
//   proxyReq.setHeader('x-authenticated-user-token', extractUserToken(req))
//   proxyReq.setHeader('x-authenticated-userid', extractUserIdFromRequest(req))
//   // tslint:disable-next-line: no-console
//   console.log('req.originalUrl', req.originalUrl)
//   if (!req.originalUrl.includes('/discussion/user/v1/create')) {
//     console.log('------------req.session----------', req.session)
//     console.log('------------req.session.nodebb_authorization_token----------', req.session['nodebb_authorization_token'])
//     console.log('------------proxy req----------', proxyReq.session)
//     proxyReq.setHeader('Authorization', 'Bearer ' + req.session.nodebb_authorization_token)
//   }
//   if (req.body) {
//     const bodyData = JSON.stringify(req.body)
//     proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
//     proxyReq.write(bodyData)
//   }
// })

// tslint:disable-next-line: no-any
// discussProxy.on('proxyRes', (proxyRes: any, req: any, _res: any,) => {
//   if (req.originalUrl.includes('/discussion/user/v1/create')) {
//     const nodebb_auth_token = proxyRes.headers.nodebb_auth_token
//     console.log('nodebb_auth_token------------------------', nodebb_auth_token)
//     if (req.session) {
//       console.log('nodebb_auth_token sesion settttttttttttttttttttt---------', nodebb_auth_token)
//       console.log('nodebb_auth_token sesion settttttttttttttttttttt beforee---------', req.session)
//       req.session['nodebb_authorization_token'] = nodebb_auth_token
//       console.log('nodebb_auth_token sesion settttttttttttttttttttt beforee---------', req.session)
//       console.log('nodebb_auth_token sesion settttttttttttttttttttt afterr----------', req.session.nodebb_authorization_token)
//     }
//   }
// })

// tslint:disable-next-line: no-any
proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
  if (req.originalUrl.includes('/discussion/user/v1/create')) {
    const nodebb_auth_token = proxyRes.headers.nodebb_auth_token

    // tslint:disable-next-line: no-console
    console.log('nodebb_auth_token------------------------', nodebb_auth_token)
    if (req.session) {
      // tslint:disable-next-line: no-console
      console.log('nodebb_auth_token sesion settttttttttttttttttttt---------', nodebb_auth_token)
      // tslint:disable-next-line: no-console
      console.log('nodebb_auth_token sesion settttttttttttttttttttt beforee---------', req.session)
      req.session.nodebb_authorization_token = nodebb_auth_token
      // tslint:disable-next-line: no-console
      console.log('nodebb_auth_token sesion settttttttttttttttttttt beforee---------', req.session)
      // tslint:disable-next-line: no-console
      console.log('nodebb_auth_token sesion settttttttttttttttttttt afterr----------', req.session.nodebb_authorization_token)
    }
  }
})

export function proxyCreatorRoute(route: Router, targetUrl: string, timeout = 10000): Router {
  route.all('/*', (req, res) => {
    const downloadKeyword = '/download/'
    if (req.url.startsWith(downloadKeyword)) {
      req.url = downloadKeyword + req.url.split(downloadKeyword)[1].replace(/\//g, '%2F')
    }
    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL', req.originalUrl)
    // tslint:disable-next-line: no-console
    console.log('REQ_URL', req.url)
    proxyCreator(timeout).web(req, res, {
      target: targetUrl,
    })
  })
  return route
}

export function ilpProxyCreatorRoute(route: Router, baseUrl: string): Router {
  route.all('/*', (req, res) => {
    proxyCreator().web(req, res, {
      headers: { ...req.headers } as { [s: string]: string },
      target: baseUrl + req.url,
    })
  })
  return route
}

export function scormProxyCreatorRoute(route: Router, baseUrl: string): Router {
  route.all('/*', (req, res) => {
    proxyCreator().web(req, res, {
      target: baseUrl,
    })
  })
  return route
}

export function proxyCreatorLearner(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {

    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorLearner', req.originalUrl)
    const url = removePrefix(`${PROXY_SLUG}/learner`, req.originalUrl)
    logInfo('Final URL: ', targetUrl + url)
    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl + url,
    })
  })
  return route
}

export function proxyCreatorSunbird(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {

    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorSunbird', req.originalUrl)
    const url = removePrefix(`${PROXY_SLUG}`, req.originalUrl)
    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl + url,
    })
  })
  return route
}

export function proxyCreatorDiscussion(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {
    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorDiscussion', req.originalUrl)
    const url = removePrefix(`${PROXY_SLUG}`, req.originalUrl)
    // tslint:disable-next-line: no-console
    console.log('------------req session line 144--------', req.session)
    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl + url,
    })
  })
  return route
}

export function proxyCreatorKnowledge(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {
    const url = removePrefix(`${PROXY_SLUG}`, req.originalUrl)
    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorKnowledge', targetUrl + url)
    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl + url,
    })
  })
  return route
}

export function proxyCreatorUpload(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {
    const url = removePrefix(`${PROXY_SLUG}/action`, req.originalUrl)
    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorUpload', targetUrl)
    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl + url,
    })
  })
  return route
}

function removePrefix(prefix: string, s: string) {
  return s.substr(prefix.length)
}

export function proxyCreatorSunbirdSearch(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {

    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorSunbirdSearch', req.originalUrl)

    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl,
    })
  })
  return route
}

export function proxyCreatorToAppentUserId(route: Router, targetUrl: string, _timeout = 10000): Router {
  route.all('/*', (req, res) => {
    const userId = extractUserIdFromRequest(req).split(':')

    // tslint:disable-next-line: no-console
    console.log('REQ_URL_ORIGINAL proxyCreatorToAppentUserId', req.originalUrl)

    proxy.web(req, res, {
      changeOrigin: true,
      ignorePath: true,
      target: targetUrl + userId[userId.length - 1],
    })
  })
  return route
}
