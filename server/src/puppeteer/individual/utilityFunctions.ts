import { usernameDetails } from "../../../services/usernameDetails"
import axios from 'axios'
import { attachBrowserId, resetProxy } from "../../models/proxy.model"

// Apply after browser opened
export const attachNewIP = async (browser: any, page: any, assignedIp: string) => {
  try {
    await page.authenticate(usernameDetails)
    console.log('authenticated')
    await attachBrowserId(assignedIp, browser)
  } catch (error) {
    console.log(error)
    await resetProxy(browser)
  }
  // await axios.patch(`http://localhost:4000/ips/${assignedIp.id}`, { attachedId: browser.target()._targetId })
}

// Apply before browser closes
export const detachIP = async (browser: any) => { 
  await resetProxy(browser)
}