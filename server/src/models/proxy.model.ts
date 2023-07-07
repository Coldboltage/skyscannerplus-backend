import { AppDataSource } from "../data-source";
import { ProxyIP } from "../entity/proxy.entity";

const proxyRepository = AppDataSource.getRepository(ProxyIP)

// Get Proxy and Activate
export const getProxy = async (): Promise<ProxyIP> => {
  const proxy = await proxyRepository.findOne({
    where: {
      active: false
    }, order: {
      lastActive: "ASC"
    }
  })
  if (!proxy) throw new Error("no_proxy_available")
  await proxyRepository.update(proxy.id, { active: true, lastActive: new Date() })
  return proxy
}

// Attach BrowserId to current active IP/Proxy
export const attachBrowserId = async (assignedIp: string, browser: any): Promise<ProxyIP> => {
  console.log("what is this here " + assignedIp)
  console.log(assignedIp)
  const proxy = await proxyRepository.findOneBy({ ip: assignedIp })
  console.log(proxy)
  if (proxy && proxy.active === true) {
    console.log(browser.target()._targetId)
    await proxyRepository.update(proxy.id, { browserId: browser.target()._targetId })
    return proxy
  }
  throw new Error('proxy_not_found_or_active')
}

// Deactivate Proxy By Id
export const resetProxy = async (browser: any) => {
  console.log(browser.target())
  const proxy = await proxyRepository.findOneBy({ browserId: browser.target()._targetId })
  if (!proxy) throw new Error("proxy_not_found")
  return await proxyRepository.update(proxy.id, { active: false, browserId: "" })
}