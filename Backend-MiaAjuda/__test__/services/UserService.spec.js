const UserRepository = require('../../src/repository/UserRepository');
const UserService = require('../../src/services/UserService');

const service = new UserService();

jest.mock('../../src/repository/UserRepository', () => {
  return jest.fn().mockImplementation(() => ({
    getById: jest.fn().mockImplementation(id => {
      if(id === 1010) return { id: 1010 }
      return undefined
    }),
    getUserByEmail: jest.fn().mockImplementation(email => {
      if(email === 'gustavo@email.com') return { id: 1010 }
      return undefined
    }),
  }));
});

describe('#UserService', () => {
  describe('#getAnyUser', () => {
    it('CT1', async () => {
        await service.getAnyUser({ id: 1010, email: 'gustavo@email.com' });
        expect(result).toEqual({ user });
    })
    it('CT2', async () => {
      const result = await service.getUser({ id: 1010, email: undefined });
      xpect(callGetUser).rejects.toThrow(new Error('Usuário não encontrado'));
    })
    it('CT3', async () => {
      const result = await service.getUser({ id: undefined, email: 'gustavo@email.com' });
      xpect(callGetUser).rejects.toThrow(new Error('Usuário não encontrado'));
    })
    it('CT4', async () => {
      const result = await service.getUser({ id: undefined, email: undefined });
      expect(callGetUser).rejects.toThrow(new Error('Nenhum identificador encontrado'));
    })
  });
});
