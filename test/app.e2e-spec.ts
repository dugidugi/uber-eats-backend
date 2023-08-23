import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get(getRepositoryToken(User));
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

  const testUser = {
    email: 'yooduck.h@gmail.com',
    password: '12345',
  };
  let jwtToken: string;

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
  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const users = await usersRepository.find();
      const [user] = users;
      userId = user.id;
    });
    it('유저 프로필을 성공적으로 가져온다', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            query {
              userProfile(userId:${userId}){
                ok,
                error,
                user {
                  id
                }
              }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: {
              userProfile: {
                ok,
                error,
                user: { id },
              },
            },
          } = res.body;
          expect(ok).toEqual(true);
          expect(error).toBeNull();
          expect(id).toEqual(userId);
        });
    });

    it('유저 프로필을 가져오는데 실패한다', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            query {
              userProfile(userId:${22222}){
                ok,
                error,
                user {
                  id
                }
              }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            data: {
              userProfile: { ok, error, user },
            },
          } = res.body;
          console.log(res.body.data);
          expect(ok).toEqual(false);
          expect(error).toEqual('User not found');
          expect(user).toBeNull();
        });
    });
  });
  it.todo('me');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
