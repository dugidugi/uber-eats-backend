import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testUser = {
    email: 'yooduck.h@gmail.com',
    password: '12345',
  };
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await dataSource.initialize();
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email:"${testUser.email}",
              password:"${testUser.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toEqual(true);
          expect(res.body.data.createAccount.error).toEqual(null);
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email:"${testUser.email}",
              password:"${testUser.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toEqual(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });
  describe('login', () => {
    it('이메일과 비밀번호가 일치하면 로그인하고 토큰을 반환한다', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input : {
              email:"${testUser.email}",
              password:"${testUser.password}",
            }){
              ok
              error
              token
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: {
              login: { ok, error, token },
            },
          } = res.body;
          expect(ok).toEqual(true);
          expect(error).toBeNull();
          expect(token).toEqual(expect.any(String));
          jwtToken = token;
        });
    });
    it('비밀번호 불일치하면 로그인에 실패한다', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            login(input : {
              email:"${testUser.email}",
              password:"wrongPassword",
            }){
              ok
              error
              token
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: {
              login: { ok, error, token },
            },
          } = res.body;
          expect(ok).toEqual(false);
          expect(error).toEqual('wrong password');
          expect(token).toBeNull();
        });
    });
  });
  it.todo('me');
  it.todo('userProfile');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
