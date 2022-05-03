import { Client } from './Client.mjs';
import { Session } from './Session.mjs';
import { humanReadableDate } from '../../utils/index.mjs';
import { Status } from '../status/index.mjs';
import { Api } from 'telegram';
import { generateRandomBigInt } from 'telegram/Helpers';
import { Contact } from '../index.mjs';

export class ClientsPool {
    /**
     * @typedef {Class} ClientsPool
     * @method init
     * @method invokeEach
     */

    /**
     * @property {Client[]}
     */
    static pool = null;

    /**
     * @param {Object} config - service configuration
     * @param {String} config.sessionsFolder - folder path with telegram sessions
     * @param {String} config.apiId - Telegram Api id
     * @param {String} config.apiHash - Telegram Api hash
     * @returns {Promise<void>}
     */
    static async init(config) {
        if (ClientsPool.pool) return;
        ClientsPool.pool = [];

        const sessions = await new Session().readAll({ valid: true });

        for (const session of sessions) {
            const client = new Client(session, config);
            await client.init();
            ClientsPool.pool.push(client);
        }

        ClientsPool.pool.sort((a, b) => a.contactsCount - b.contactsCount);
    }

    static async addClient(client) {
        ClientsPool.pool.unshift(client);
        /* 
        console.log(ClientsPool.pool);
        console.log(client.sessionId); */
    }

    static async removeClient(client) {
        ClientsPool.pool = ClientsPool.pool.filter((item) => item.sessionId !== client.sessionId);
    }

    static async addContact(client, phoneNumber) {
        return client
            .invoke(
                new Api.contacts.ImportContacts({
                    contacts: [
                        new Api.InputPhoneContact({
                            clientId: generateRandomBigInt(),
                            phone: phoneNumber,
                            firstName: 'name',
                            lastName: 'lastName',
                        }),
                    ],
                })
            )
            .then(async (data) => {
                return data.users[0] ? '+' + data.users[0].phone : null;
            });
    }

    /**
     * @method
     * @returns {Promise<Object>}
     */
    static async addContacts(contactsList) {
        for (const contact of contactsList) {
            let result = null;

            for (const client of ClientsPool.pool) {
                result = await ClientsPool.addContact(client, contact.tracked_phone);

                if (result) {
                    await new Contact().updateSession({ trackedPhone: result, sessionId: client.sessionId });
                    break;
                }
            }

            if (!result) {
                await new Contact().updateTrackedStatus({ trackedPhone: contact.tracked_phone, tracked: false });
            }
        }
    }

    static async removeContacts(contactsList) {
        for (const contact of contactsList) {
            const client = ClientsPool.pool.find((client) => client.sessionId === contact.session_id);

            if (client) {
                await client.invoke(
                    new Api.contacts.DeleteByPhones({
                        phones: [contact.tracked_phone],
                    })
                );
                await new Contact().updateSession({ trackedPhone: contact.tracked_phone, sessionId: null });
            }
        }
    }

    /**
     * @method
     * @param {Object} command - Telegram command to be invoked
     * @returns {Promise<void>}
     */
    static async checkStatuses() {
        const command = new Api.contacts.GetContacts({});
        for (const client of ClientsPool.pool) {
            try {
                const result = await client.invoke(command);

                for (const user of result.users) {
                    if (user.status) {
                        const wasOnline =
                            user.status.className === 'UserStatusOnline'
                                ? null
                                : humanReadableDate(user.status.wasOnline);

                        if (wasOnline !== undefined) {
                            await new Status().save({
                                phoneNumber: user.phone,
                                username: user.username,
                                wasOnline,
                                checkDate: new Date().toISOString(),
                            });
                        }
                    }
                }
            } catch (e) {
                ClientsPool.removeClient(client);
                await new Contact().removeSessionId({ sessionId: client.sessionId });
                await new Session().update({ sessionId: client.sessionId, valid: false });
            }
        }
    }
}
