const HelpRepository = require("../repository/HelpRepository");
const UserService = require("./UserService");
const NotificationMixin = require("../utils/NotificationMixin");

class HelpService {
  constructor() {
    this.HelpRepository = new HelpRepository();
    this.UserService = new UserService();
    this.NotificationMixin = new NotificationMixin();
  }

  async createHelp(data) {
    try {
      const countHelp = await this.HelpRepository.countDocuments(data.ownerId);
      if (countHelp >= 5) {
        throw " Limite máximo de pedidos atingido";
      }

      const createdHelp = await this.HelpRepository.create(data);
      return createdHelp;
    } catch (err) {
      throw err;
    }
  }

  async getHelpByid(id) {
    const Help = await this.HelpRepository.getById(id);

    if (!Help) {
      throw "Ajuda não encontrada";
    }

    return Help;
  }

  async getHelpList(id, status, category, except, helper) {
    const Helplist = await this.HelpRepository.list(
      id,
      status,
      category,
      except,
      helper
    );
    if (!Helplist) {
      throw "Nenhuma Ajuda com esse status foi encontrada";
    }

    return Helplist;
  }

  async getNearHelpList(coords, except, id, categoryArray) {
    const Helplist = await this.HelpRepository.listNear(
      coords,
      except,
      id,
      categoryArray
    );
    if (!Helplist) {
      throw new Error(
        "Pedidos de ajuda não encontrados no seu raio de distância"
      );
    }

    return Helplist;
  }

  async deleteHelpLogically(id) {
    const help = await this.getHelpByid(id);

    help.active = false;

    await this.HelpRepository.update(help);

    return { message: `Help ${id} deleted!` };
  }

  async chooseHelper(data) {
    const idHelper = data.idHelper;
    const help = await this.getHelpByid(data.idHelp);
    const ownerId = help.ownerId;
    const helper = await this.UserService.getUser({ id: idHelper });
    const owner = await this.UserService.getUser({ id: ownerId });
    if (!help) {
      throw "Ajuda não encontrada";
    }
    if (help.helperId) {
      throw "Ajuda já possui ajudante";
    }

    const title = owner.name + " aceitou sua oferta de ajuda!";
    const body = "Sua oferta para " + help.title + " foi aceita!";

    const userPosition = help.possibleHelpers.indexOf(data.idHelper);
    if (userPosition >= 0) {
      help.helperId = data.idHelper;
      const result = await this.HelpRepository.update(help);
      this.NotificationMixin(helper.deviceId, title, body);
      return result;
    }
    throw "Ajudante não encontrado";
  }

  async helperConfirmation(data) {
    const help = await this.getHelpByid(data.helpId);
    const owner = await this.UserService.getUser({ id: help.ownerId });

    if (!help) {
      throw "Ajuda não encontrada";
    } else if (help.helperId != data.helperId) {
      throw "Usuário não é o ajudante dessa ajuda";
    } else if (help.status == "owner_finished") {
      const title = "Pedido de ajuda finalizado!";
      const body = "Seu pedido " + help.title + " foi finalizado";

      this.NotificationMixin.sendNotification(owner.deviceId, title, body);

      help.status = "finished";
    } else if (help.status == "helper_finished") {
      throw "Usuário já confirmou a finalização da ajuda";
    } else if (help.status == "finished") {
      throw "Ajuda já foi finalizada";
    } else {
      help.status = "helper_finished";
    }

    const result = await this.HelpRepository.update(help);

    return result;
  }

  async ownerConfirmation(data) {
    const help = await this.getHelpByid(data.helpId);
    const owner = await this.UserService.getUser({ id: help.ownerId });
    if (!help) {
      throw "Ajuda não encontrada";
    } else if (help.ownerId != data.ownerId) {
      throw "Usuário não é o dono da ajuda";
    } else if (help.status == "helper_finished") {
      const title = "Pedido de ajuda finalizado!";
      const body = "Seu pedido " + help.title + " foi finalizado";

      this.NotificationMixin.sendNotification(owner.id, title, body);

      help.status = "finished";
    } else if (help.status == "owner_finished") {
      throw "Usuário já confirmou a finalização da ajuda";
    } else if (help.status == "finished") {
      throw "Essa ajuda já foi finalizada";
    } else {
      help.status = "owner_finished";
    }

    const result = await this.HelpRepository.update(help);
    return result;
  }

  async addPossibleHelpers(id, idHelper) {
    const help = await this.getHelpByid(id);
    const owner = await this.UserService.getUser({ id: help.ownerId });
    if (!help) {
      throw "Ajuda não encontrada";
    }
    if (idHelper == help.ownerId) {
      throw "Você não pode ser ajudante de sua própria ajuda";
    }

    const helper = await this.UserService.getUser({ id: idHelper });
    const userPosition = help.possibleHelpers.indexOf(idHelper);
    if (userPosition > -1) {
      throw "Usuário já é um possível ajudante";
    }

    help.possibleHelpers.push(idHelper);

    const result = await this.HelpRepository.update(help);

    const title = helper.name + " quer te ajudar!";
    const body = "Seu pedido " + help.title + " recebeu uma oferta de ajuda!";

    this.NotificationMixin.sendNotification(owner.deviceId, title, body);

    return result;
  }

  async getListToDelete() {
    const Helplist = await this.HelpRepository.listToExpire();
    if (!Helplist) {
      throw new Error("Pedidos de ajuda não encontrados");
    }

    return Helplist;
  }
}

module.exports = HelpService;
