import { describe, test, expect } from 'bun:test'

import { handleProvidersApi } from '../api/providers.js'
import { PROVIDER_PRESETS } from '../config/providerPresets.js'

function makeRequest(method: string, urlStr: string): { req: Request; url: URL; segments: string[] } {
  const url = new URL(urlStr, 'http://localhost:3456')
  const req = new Request(url.toString(), { method })
  const segments = url.pathname.split('/').filter(Boolean)
  return { req, url, segments }
}

describe('provider presets API', () => {
  test('GET /api/providers/presets returns the configured presets', async () => {
    const { req, url, segments } = makeRequest('GET', '/api/providers/presets')
    const response = await handleProvidersApi(req, url, segments)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ presets: PROVIDER_PRESETS })
  })

  test('configured presets include built-in official and custom entries', () => {
    expect(PROVIDER_PRESETS.some((preset) => preset.id === 'official')).toBe(true)
    expect(PROVIDER_PRESETS.some((preset) => preset.id === 'custom')).toBe(true)
  })

  test('configured presets keep current default model ids aligned with official provider docs', () => {
    const deepseek = PROVIDER_PRESETS.find((preset) => preset.id === 'deepseek')
    const zhipu = PROVIDER_PRESETS.find((preset) => preset.id === 'zhipuglm')
    const kimi = PROVIDER_PRESETS.find((preset) => preset.id === 'kimi')
    const minimax = PROVIDER_PRESETS.find((preset) => preset.id === 'minimax')

    expect(deepseek?.defaultModels.main).toBe('deepseek-chat')
    expect(deepseek?.defaultModels.haiku).toBe('deepseek-chat')
    expect(zhipu?.defaultModels.main).toBe('glm-5.1')
    expect(zhipu?.defaultModels.haiku).toBe('glm-4.5-air')
    expect(zhipu?.defaultModels.sonnet).toBe('glm-5-turbo')
    expect(zhipu?.defaultModels.opus).toBe('glm-5.1')
    expect(kimi?.defaultModels.main).toBe('kimi-k2.6')
    expect(minimax?.defaultModels.main).toBe('MiniMax-M2.7')
  })
})
