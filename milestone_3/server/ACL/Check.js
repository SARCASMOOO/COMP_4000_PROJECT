/* Algoithim,
*  If a path is allowed that will propagate down.
*  If no path is provided then it will be denied.
*  If a deny rule is specified it will propagate down and not allow a user access.
*  If the requested path contains .public at the end it will be allowed.
* .If a file contains .admin it will be only allowed if that user is an admin
*/

class Check {
    constructor(manageACL) {
        this.compareFunction = (rule1, rule2) => (rule1.path.length < rule2.path.length) ? -1 : 1;
        this.cleanRules = requestedRule => this.ruleList.sort(this.compareFunction).filter(rule => requestedRule.path.startsWith(rule.path));
        manageACL.getRulesList().then(ruleList => this.ruleList = ruleList);
    }

    setRuleList(ruleList) {
        this.ruleList = ruleList;
    }

    checkRule(rule, requestedRule) {
        const requestedPermission = requestedRule.permissions;
        const allowedPermissions = rule.permissions;
        const containsPermission = () => allowedPermissions.includes(requestedPermission);

        if (containsPermission()) return (rule.mode === 'allow') ? 1 : -1;
        return 0;
    }

    checkRules(cleanedRulesList, requestedRule) {
        let rc = 0;
        let isAllowed = true;
        let rule;

        for (rule of cleanedRulesList) {
            rc = this.checkRule(rule, requestedRule);
            if (rc === 1) isAllowed = true;
            if (rc === -1) {
                isAllowed = false;
                break;
            }
        }

        isAllowed ? console.log('Allow.') : console.log('Deny.');
        return isAllowed;
    }

    isAccess(requestedRule, userType, username) {
        // Admin may read/write all objects.
        if (userType === 'admin') return true;

        // Trusted users may read/write all config objects
        if (requestedRule.path.endsWith('.config')) {
            return (userType === 'trusted');
        }

        if (requestedRule.path.endsWith('.admin')) {
            return false;
        }

        // Trusted users and admins may read / write all public objects
        // Public users may only read public objects
        if (requestedRule.path.endsWith('.public')) {
            return true;
        }

        // For all other cases that are not a special case
        // Follow the ACL algorithm for access.
        const cleanedRulesList = this.cleanRules(requestedRule).filter(rule => rule.username === username);
        return this.checkRules(cleanedRulesList, requestedRule);
    }
}

module.exports = {Check: Check};