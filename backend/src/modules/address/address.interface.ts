import { Address, AddressType } from "../../../generated/prisma/index.js";
import { updateAddressDTO } from "./address.schema.js";

export interface IAddressRepository {
    createAddress(data: {
        userId: string;
        addressType?: AddressType;
        addressLine1: string;
        addressLine2?: string;
        city: String;
        state: String;
        country: String;
        pincode: String;
    }): Promise<Address>;

    countAdressesByUserId(userId: string): Promise<number>;

    getAddressesByUserId(userId: string): Promise<Address[]>;

    updateAddressById(id: string, data: updateAddressDTO): Promise<Address>;

    findAddressByIdAndUserId(id: string, userId: string): Promise<Address | null>;

    deleteAddressById(id: string): Promise<void>;
}