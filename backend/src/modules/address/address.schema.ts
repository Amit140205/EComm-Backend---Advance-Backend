import { z } from "zod";

export const createAddressSchema = z.object({
    addressType: z.enum(["HOME", "WORK", "OTHER"]).optional(),
    addressLine1: z.string().min(1, "Address line 1 can not be empty"),
    addressLine2: z.string().min(1, "Address line 1 can not be empty").optional(),
    city: z.string().min(1, "City can not be empty").toLowerCase(),
    state: z.string().min(1, "State can not be empty").toLowerCase(),
    country: z.string().min(1, "Country can not be empty").toLowerCase(),
    pincode: z.string().min(1, "Pincode can not be empty")
}).strict();

export const updateAddressSchema = z.object({
    addressType: z.enum(["HOME", "WORK", "OTHER"]).optional(),
    addressLine1: z.string().min(1, "Address line 1 can not be empty").optional(),
    addressLine2: z.string().min(1, "Address line 1 can not be empty").optional(),
    city: z.string().min(1, "City can not be empty").toLowerCase().optional(),
    state: z.string().min(1, "State can not be empty").toLowerCase().optional(),
    country: z.string().min(1, "Country can not be empty").toLowerCase().optional(),
    pincode: z.string().min(1, "Pincode can not be empty").optional()
}).strict().refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
        message: "At least one field is required to update the address"
    }
);

export type CreateAddressDTO = z.infer<typeof createAddressSchema>;
export type updateAddressDTO = z.infer<typeof updateAddressSchema>;