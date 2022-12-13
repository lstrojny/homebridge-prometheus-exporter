import type { SuperTest, Test } from 'supertest'
import type { Server } from 'http'
import type { Immutable } from '../src/std'

declare module 'supertest' {
    function supertest(app: Immutable<Server>): SuperTest<Test>
}
