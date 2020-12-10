const ObjectID = require('mongodb').ObjectID;

class ManageRulesList {
    constructor(ruleListCollection) {
        this.ruleListCollection = ruleListCollection;
    }

    getRulesList() {
        return this.ruleListCollection.find().toArray();
    }

    createRuleForUser(rule) {
        return this.ruleListCollection.insertOne(rule);
    }

    readRulesByUser(username) {
        return this.ruleListCollection.find({username: username}).toArray();
    }

    updateRule(ruleId, update) {
        console.log('Overriding rule id');
        ruleId = ObjectID(ruleId);
        return this.ruleListCollection.updateOne({_id: ruleId}, {$set: update});
    }

    removeRule(ruleId) {
        return this.ruleListCollection.deleteOne({_id: ruleId});
    }
}

module.exports = {ManageRulesList: ManageRulesList};