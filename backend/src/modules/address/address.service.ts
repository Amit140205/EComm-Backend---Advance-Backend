import { Address, AddressType } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/app.error.js";
import { IAddressRepository } from "./address.interface.js";
import { CreateAddressDTO, updateAddressDTO } from "./address.schema.js";

export class AddressService {
    constructor(private addressRepo: IAddressRepository) { }

    async createAddress(userId: string, data: CreateAddressDTO): Promise<{
        address: Address;
    }> {
        const MAX_ADDRESSES = 5;

        const existingCount = await this.addressRepo.countAdressesByUserId(userId);

        if (existingCount > MAX_ADDRESSES) {
            throw new AppError(400, `You can only save up to ${MAX_ADDRESSES} addresses`);
        }

        const newAddress = await this.addressRepo.createAddress({
            userId,
            ...data
        });

        return {
            address: newAddress
        };
    }

    async getAddressesByUserId(userId: string): Promise<{
        addresses: Address[];
    }> {
        const addresses = await this.addressRepo.getAddressesByUserId(userId);

        return {
            addresses
        };
    }

    async updateAddress(id: string, userId: string, data: updateAddressDTO): Promise<{
        address: Address;
    }> {
        const existingAddress = await this.addressRepo.findAddressByIdAndUserId(id, userId);

        if (!existingAddress) {
            throw new AppError(401, "Address not found or you are not authorized to perform this action");
        }

        const updatedAddress = await this.addressRepo.updateAddressById(id, data);

        return {
            address: updatedAddress
        };
    }

    async deleteAddress(id: string, userId: string): Promise<void> {
        const existingAddress = await this.addressRepo.findAddressByIdAndUserId(id, userId);

        if (!existingAddress) {
            throw new AppError(401, "Address not found or you are not authorized to perform this action");
        }

        await this.addressRepo.deleteAddressById(id);
    }
}