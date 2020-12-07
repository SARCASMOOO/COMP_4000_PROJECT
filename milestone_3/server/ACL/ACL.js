const ManageRulesList = require('./ManageRulesList').ManageRulesList;
const Check = require('./Check').Check;

class ACL {
    constructor(ruleListCollection) {
        this.manageACL = new ManageRulesList(ruleListCollection);
        this.check = new Check();

        for (const key of Object.getOwnPropertyNames(Check.prototype)) {
            if (key !== "constructor") {
                ACL.prototype[key] = function (...args) {
                    return this.check[key](...args);
                };
            }
        }

        for (const key of Object.getOwnPropertyNames(ManageRulesList.prototype)) {
            if (key !== "constructor") {
                ACL.prototype[key] = function (...args) {
                    return this.manageACL[key](...args);
                };
            }
        }
    }
}

module.exports = {ACL: ACL};
