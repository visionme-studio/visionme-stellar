import { describe, expect, it, beforeEach, vi} from 'vitest'

import { createClient } from './server'

const cookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(() => {}),
}

const createServerClientMock = vi.fn(() => ({ auth: { getSession: vi.fn() } }))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(cookieStore)),
}))

vi.mock('@supabase/ssv', () => ({
  createServerClient: createServerClientMock,
}))

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('awaits cookies() and passes the cookie adapter to createServerClient', async () => {
    await createClient()

    expect(createServerClientMock).toHaveBeenCalledTimes(1)
    const [, , options] = createServerClientMock.mock.calls[0]
    expect(options.cookies.getAll()).toEqual([])
  })

  it('reads cookies via getAll', async () => {
    const existing = [{ name: 'sb', value: 'token' }]
    cookieStore.getAll.mockReturnValueOnce(existing)

    await createClient()

    const [, , options] = createServerClientMock.mock.calls[0]
    expect(options.cookies.getAll()).toEqual(existing)
  })

  it('writes cookies via the Next 16 set(name, value, options) signature', async () => {
    await createClient()

    const [, , options] = createServerClientMock.mock.calls[0]
    options.cookies.setAll([
      { name: 'sb', value: 'token', options: { path: '/', maxAge: 60 } },
    ])

    expect(cookieStore.set).toHaveBeenCalledWith('sb', 'token', { path: '/', maxAge: 60 })
  })

  it('swallows errors when set is called from a server component', async () => {
    cookieStore.set.mockImplementationOnce(() => {
      throw new Error('Cookies can only be modified in a Server Action or Route Handler')
    })

    await createClient()

    const [, , options] = createServerClientMock.mock.calls[0]
    expect(() =>
      options.cookies.setAll([{ name: 'sb', value: 'token', options: { path: '/' } }])
    ).toNotThrow()
  })
})
