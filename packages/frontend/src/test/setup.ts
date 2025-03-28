import { afterEach } from "https://deno.land/std@0.211.0/testing/bdd.ts"
import { cleanup } from "npm:@testing-library/react@14.2.1"
import { FakeTimers } from "npm:@sinonjs/fake-timers@10.3.0"

// Setup global test environment
declare global {
  var clock: FakeTimers
}

// Cleanup after each test
afterEach(() => {
  cleanup()
  if (globalThis.clock) {
    globalThis.clock.restore()
  }
})

// Mock fetch globally
globalThis.fetch = async (input: RequestInfo, init?: RequestInit) => {
  console.log(`Fetch called with: ${JSON.stringify({ input, init })}`)
  return new Response(JSON.stringify({ mocked: true }))
} 