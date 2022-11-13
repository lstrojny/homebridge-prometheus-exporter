import type { SuperTest, Test } from 'supertest'
import type { Server } from 'http'

declare module 'supertest' {
    function supertest(app: Server): SuperTest<Test>
}
