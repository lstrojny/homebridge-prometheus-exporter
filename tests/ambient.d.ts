import { SuperTest, Test } from 'supertest'
import { Server } from 'http'

declare module 'supertest' {
    function supertest(app: Server): SuperTest<Test>
}
