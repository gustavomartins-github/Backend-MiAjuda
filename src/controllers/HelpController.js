const HelpService = require('../services/HelpService');
const mongoose = require('mongoose')

class HelpController {

    constructor() {
        this.HelpService = new HelpService();
    }

    async createHelp(req, res, next) {
        const data = {
            ...req.body
        }
        try {
            const result = await this.HelpService.createHelp(data);
            res.status(201);
            res.json(result);
            next();
        } catch (err) {
            res.status(400);
            res.send(err);
            next();
        }
    }


    async getHelpById(req, res, next) {
        const id = req.params.id
        try {
            const result = await this.HelpService.getHelpByid(id);
            res.status(200);
            res.json(result);
            next();
        } catch (err) {
            res.status(400);
            res.json(err);
            next();
        }
    }

    async getHelpList(req, res, next) {
        const id = req.query.id || null;
        const status = req.query.status || null;
        try {
            let result
            if (id && status) {
                result = await this.HelpService.getHelpListByStatus(id, status);
            }
            else {
                result = await this.HelpService.getHelpList(id)
            }
            res.status(200);
            res.json(result);
            next();
        } catch (err) {
            res.status(400);
            res.json(err);
            next();
        }
    }

    async getToExpireList(req, res, next) {
        try {
            const result = await this.HelpService.getListToDelete()
            res.status(200);
            res.json(result);
            next();
        } catch (err) {
            res.status(400);
            res.json(err);
            next();
        }
    }
}

module.exports = HelpController