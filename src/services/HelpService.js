const HelpRepository = require('../repository/HelpRepository');

class HelpService {
    constructor() {
        this.HelpRepository = new HelpRepository();
    }

    async createHelp(data) {
        try {
            const createdHelp = await this.HelpRepository.create(data);

            return createdHelp;
        } catch (err) {
            throw err;
        }
    }

    async getHelpByid(id) {
        const Help = await this.HelpRepository.getById(id);

        if (!Help) {
            throw { Help: 'Ajuda não encontrada' };
        }

        return Help;
    }

    async getHelpList(id, status, except, helper) {
        const Helplist = await this.HelpRepository.list(id, status, except, helper);
        if (!Helplist) {
            throw { Helplist: 'Nenhuma Ajuda com esse status foi encontrada' };
        }

        return Helplist;
    }

    async deleteHelpLogically(id) {
        const help = await this.getHelpByid(id);

        help.active = false;

        await this.HelpRepository.update(help);

        return {'message': `Help ${id} deleted!`};
    }
}

module.exports = HelpService;
