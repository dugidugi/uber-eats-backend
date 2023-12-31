import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import e from 'express';
import { Verification } from 'src/users/entities/verification.entity';

const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
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
      return publicTest(
        `
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
      )
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toEqual(true);
          expect(res.body.data.createAccount.error).toEqual(null);
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(`
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
          `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toEqual(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });
  describe('login', () => {
    it('이메일과 비밀번호가 일치하면 로그인하고 토큰을 반환한다', () => {
      return publicTest(`
          mutation {
            login(input : {
              email:"${testUser.email}",
              password:"${testUser.password}",
            }){
              ok
              error
              token
            }
          }`)
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
      return publicTest(`
          mutation {
            login(input : {
              email:"${testUser.email}",
              password:"wrongPassword",
            }){
              ok
              error
              token
            }
          }`)
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
      return privateTest(`
            query {
              userProfile(userId:${userId}){
                ok,
                error,
                user {
                  id
                }
              }
          }`)
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
      return privateTest(`
             {
              userProfile(userId:${22222}){
                ok,
                error,
                user {
                  id
                }
              }
          }`)
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
  describe('me', () => {
    it('유저가 로그인 되어있으면 유저의 정보를 반환한다', () => {
      return privateTest(`
          {
            me {
              email
            }
          }`)
        .expect(200)
        .expect((res) => {
          const {
            data: {
              me: { email },
            },
          } = res.body;
          expect(email).toEqual(testUser.email);
        });
    });
    it('유저가 로그인이 되어있지 않으면 에러를  반환한다', () => {
      return publicTest(`
          {
            me {
              email
            }
          }`)
        .expect(200)
        .expect((res) => {
          const { errors, data } = res.body;
          expect(errors[0].message).toEqual('Forbidden resource');
          expect(data).toBeNull();
        });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'yooduck.h@naver.com';
    it('유저가 프로필을 성공적으로 수정한다', () => {
      return privateTest(`
          mutation {
            editProfile(input: {
              email:"${NEW_EMAIL}"
            }) {
              ok
              error
            }
          }`)
        .expect(200)
        .expect((res) => {
          const {
            data: {
              editProfile: { ok, error },
            },
          } = res.body;
          expect(ok).toEqual(true);
          expect(error).toBeNull();
        });
    });
    it('유저의 메일이 바뀐 것을 확인한다', () => {
      return privateTest(`
          {
            me {
              email
            }
          }`)
        .expect(200)
        .expect((res) => {
          const {
            data: {
              me: { email },
            },
          } = res.body;
          expect(email).toEqual(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const verifications = await verificationsRepository.find();
      const [verification] = verifications;
      console.log(verification);
      verificationCode = verification.code;
    });
    it('유저가 이메일을 성공적으로 인증한다', () => {
      return privateTest(`
          mutation{
            verifyEmail(input: {
              code: "${verificationCode}"
            }){
              ok
              error
            }
          }`)
        .expect(200)
        .expect((res) => {
          const {
            data: {
              verifyEmail: { ok, error },
            },
          } = res.body;

          expect(ok).toEqual(true);
          expect(error).toBeNull();
        });
    });
    it('유저가 이메일 인증에 실패한다', () => {
      return privateTest(`
          mutation{
            verifyEmail(input: {
              code: "someWrongCode"
            }){
              ok
              error
            }
          }`)
        .expect(200)
        .expect((res) => {
          const {
            data: {
              verifyEmail: { ok, error },
            },
          } = res.body;

          console.log(res.body.data);
          expect(ok).toEqual(false);
          expect(error).toEqual('Verification not found');
        });
    });
  });
});
