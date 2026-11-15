import { Address, AddressType } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAddressRepository } from "./address.interface.js";
import { updateAddressDTO } from "./address.schema.js";

export class AddressRepository implements IAddressRepository {
    async createAddress(data: {
        userId: string;
        addressType?: AddressType;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    }): Promise<Address> {
        const newAddress = await prisma.address.create({
            data
        });

        return newAddress;
    }

    async countAdressesByUserId(userId: string): Promise<number> {
        const count = await prisma.address.count({
            where: {
                userId
            }
        });

        return count;
    }

    async getAddressesByUserId(userId: string): Promise<Address[]> {
        const addresses = await prisma.address.findMany({
            where: {
                userId
            }
        });

        return addresses;
    }

    async updateAddressById(id: string, data: updateAddressDTO): Promise<Address> {
        const updatedAddress = await prisma.address.update({
            data,
            where: {
                id
            }
        });

        return updatedAddress;
    }

    async findAddressByIdAndUserId(id: string, userId: string): Promise<Address | null> {
        const address = await prisma.address.findUnique({
            where: {
                id,
                userId
            }
        });

        return address;
    }

    async deleteAddressById(id: string): Promise<void> {
        await prisma.address.delete({
            where: {
                id
            }
        });
    }
}