import * as Controllers from './controllers/index.mjs';
import { BOT_COMMAND } from '../../system/index.mjs';
import { decodeSystemMessage } from '../utils/index.mjs';

// Chain of responsibilities pattern. If error occurs in one of the handlers then all chain breaking
function Router(req, res) {
    function next(err) {
        if (err instanceof Error) {
            throw err;
        }
    }

    return async function (...handlers) {
        for await (const handler of handlers) {
            try {
                await handler(req, res, next);
            } catch (err) {
                res.sendMessage(JSON.stringify(err));
                break;
            }
        }
    };
}


export default async function (message, client) {
    // if (!message || !message.chat || !message.chat.id) {
    //     client.sendMessage(chatId, 'Invalid message');
    //     return undefined;
    // }
    // const chatId = message.chat ? message.chat.id : message.message.chat.id;

    // const router = Router(message, client);
    const command = decodeSystemMessage(message);

    switch (command) {
        case BOT_COMMAND.START: {
            // await router(Controllers.main.get);
            // const welcomeMessage = `Привет. Это бот трекинга статусов телеграм аккаунтов.

            //     Доступные команды:
            //     <b>/start</b> - Запустить бота / Помощь и команды
            //     <b>/add_number</b> - Добавить номер и начать отслеживание
            //     <b>/edit_numbers</b> - Список отслеживаемых номеров / Удалить номер
            //     <b>/get_status</b> - Статус отслеживания`;
            // client.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
            break;
        }
        case BOT_COMMAND.ADD_TRACK_PHONE: {
            //  await router(Controllers.session.check, Controllers.main.add);
            // client.sendMessage(chatId, `Номер ${message.text} добавлен`);
            break;
        }
        case BOT_COMMAND.EDIT_TRACK_PHONES: {
            //  await router(Controllers.session.check, Controllers.main.add);
            // function getKeyboardPayload(data) {
            //     const keyboard_payload = data.map((number) => [{ text: number, callback_data: `${BOT_COMMAND_UI.STOP_TRACK_PHONE}:${number}` }]);
            //     return { inline_keyboard: keyboard_payload };
            // }
            // const mockData = ['+380992101314', '+380677738465', '+380504358474', '+380773748398'];
            // const keyboardPayload = getKeyboardPayload(mockData);
            // console.log('keyboardPayload ', JSON.stringify(keyboardPayload));
            // client.sendMessage(
            //     chatId,
            //     '<b>Ваш список номеров.</b> <i>Выберите номер, если хотите удалить его из базы и прекратить отслеживание:</i>',
            //     { reply_markup: keyboardPayload, parse_mode: 'HTML' }
            // );
             break;
        }
        case BOT_COMMAND.GET_TRACK_STATUS: {
            //  await router(Controllers.session.check, Controllers.main.add);
            // client.sendMessage(chatId, 'Not implemented yet!');
             break;
        }
        case BOT_COMMAND.STOP_TRACK_PHONE: {
            //  await router(Controllers.session.check, Controllers.main.add
            // console.log(message);
            // const index = message.data.indexOf(':');
            // const phone = message.data.substring(index)
            // const mockData = ['updated...', 'updated...'];
            // const keyboardPayload = getKeyboardPayload(mockData);
            // client.editMessageReplyMarkup(keyboardPayload, {
            //     chat_id: message.message.chat.id,
            //     message_id: message.message.message_id,
            // });
            // client.answerCallbackQuery(message.id, { text: `Номер ${phone} больше не отслеживается`, show_alert: true });
            // client.sendMessage(chatId, 'Stop track phone!');
             break;
        }
        default: {
            //  await router(Controllers.session.check, Controllers.main.add);
            // client.sendMessage(chatId, 'Invalid command!');
            break;
        }
    }

    return undefined;
}