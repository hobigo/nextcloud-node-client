## User Management
The nextcloud-node-client provides the complete set of nextcloud user management funtions in node.js to automate user management tasks.
Create, update or delete user information or bulk operations are supported.

Example: 
```typescript
// typescript
import Client, { User, UserGroup } from "nextcloud-node-client";

(async () => {
    try {
        // create a new client using connectivity 
        // information from environment
        const client = new Client();
        // create a new user group
        const group: UserGroup = await client.createUserGroup("MyGroup");
        // create a new user with a email or password
        const user: User = await client.createUser({ id: "MyUserId", email: "mail@example.com" });
        // set some properties 
        // ... password, phone, website, twitter, address, email, locale
        await user.setDisplayName("My Display Name");
        await user.setQuota("5 GB");
        await user.setLanguage("en");
        // get properties 
        // ... quota, user friendly quota, phone, website, twitter, address, locale
        const email = await user.getEmail();
        // disable user
        await user.disable();
        // enable user
        await user.enable();
        // promote to super administrator
        await user.promoteToSuperAdmin();
        // demote from super administrator
        await user.demoteFromSuperAdmin();
        // resend welcome email to user
        await user.resendWelcomeEmail();
        // add to user group as member
        await user.addToMemberUserGroup(group);
        // get member user groups
        const memberGroups: UserGroup[] = await user.getMemberUserGroups();
        // get user ids of memembers
        await group.getMemberUserIds();
        // remove user from member group
        await user.removeFromMemberUserGroup(group);
        // promote user as subadmin for user group
        await user.promoteToUserGroupSubadmin(group);
        // get user groups where the user is subadmin
        const subadminGroups: UserGroup[] = await user.getSubadminUserGroups();
        // get user ids of subadmins
        await group.getSubadminUserIds();
        // demote user from being subadmin for user group
        await user.demoteFromSubadminUserGroup(group);
        // delete the user
        await user.delete();
        // delete the user group
        await group.delete();
        // mass creations / updates of users
        // groups are created on the fly
        await client.upsertUsers([
            { id: "myUser1", email: "myUser1@example.com", enabled: false, memberGroups: ["group1", "group2"] },
            { id: "myUser2", password: "mySecurePassword", displayName: "My Name", superAdmin: true, quota: "2 GB" },
            // ...
        ]);
    } catch (e) {
        // use specific exception *error classes 
        // for error handling documented in @throws
    }
})();
```