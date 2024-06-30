import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export function TransformDto(dtoClass: any) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const transformAndValidate = async (input: any) => {
                try {
                    const dtoObject = plainToClass(dtoClass, input);
                    const errors = await validate(dtoObject);
                    if (errors.length > 0) {
                        throw new BadRequestException('Validation failed');
                    }
                    return dtoObject;
                } catch (error) {
                    return input;  // Return the original input if transformation fails
                }
            };

            // Transform and validate input arguments
            if (Array.isArray(args[0])) {
                args[0] = await Promise.all(args[0].map(item => transformAndValidate(item)));
            } else {
                args[0] = await transformAndValidate(args[0]);
            }

            const result = await originalMethod.apply(this, args);

            // Transform result to DTO
            try {
                if (Array.isArray(result)) {
                    return result.map(item => plainToClass(dtoClass, item));
                } else {
                    return plainToClass(dtoClass, result);
                }
            } catch (error) {
                return result;  // Return the original result if transformation fails
            }
        };

        return descriptor;
    };
}
