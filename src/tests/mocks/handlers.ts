import { graphql } from 'msw'
import * as fs from 'fs'
import * as path from 'path'

export const handlers = [
  graphql.query('GetSessions', (req, res, ctx) => {
    // Try to load the appropriate fixture based on request
    try {
      // You might want to add logic here to load different fixtures
      // based on the request variables (driver ID, limit etc)
      const fixtureData = require('../fixtures/sessions_0.json')
      return res(ctx.data(fixtureData))
    } catch (error) {
      console.error('Failed to load fixture:', error)
      return res(ctx.errors([{ message: 'Failed to load fixture' }]))
    }
  })
]
