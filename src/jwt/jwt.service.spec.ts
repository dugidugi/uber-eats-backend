import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'testKey';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
  };
});

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { tokenSecret: TEST_KEY },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const userId = 1;
      const token = service.sign(userId);
      expect(token).toEqual(expect.any(String));
      console.log(token);

      expect(jwt.sign).toHaveBeenCalledTimes(userId);
      expect(jwt.sign).toHaveBeenCalledWith({ id: userId }, TEST_KEY);
    });
  });
  it.todo('verify');
});
