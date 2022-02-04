import UseCaseBase from './UseCaseBase.mjs';
import { UserMessages, UserTrackPhones } from '../models/index.mjs';
import * as ConfigContainer from '../config.cjs';

export class AddTrackingPhone extends UseCaseBase {
    static validationRules = {
        phone: ['string'],
        userId: ['required', 'positive_integer'],
    };

    async execute(params) {
        const userTrackPhones = new UserTrackPhones();

        const limit = ConfigContainer.config.trackedPhonesLimit;

        const trackedPhone = await userTrackPhones.readByPhone(params);
        const allTrackedPhones = (await userTrackPhones.listTracked(params)).map((item) => item.tracked_phone);

        if (allTrackedPhones.length >= limit) return UserMessages.exceedLimitMessage();

        let result;

        if (!trackedPhone) {
            await userTrackPhones.save(params);
            result = UserMessages.phoneStartTrackingMessage(params.phone);
        } else if (trackedPhone.tracked) {
            result = UserMessages.dublicatePhoneMessage(params.phone);
        } else {
            await userTrackPhones.activate(params);
            result = UserMessages.phoneActivateTrackingMessage(params.phone);
        }

        return result;
    }
}
