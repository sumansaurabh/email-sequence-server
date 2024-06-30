import 'reflect-metadata';
import { TransformDto } from './transform.decorator';

export function TransformClassMethods(dtoClass: any) {
    return function (constructor: any) {
        for (const key of Object.getOwnPropertyNames(constructor.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);
            if (descriptor && typeof descriptor.value === 'function' && key !== 'constructor') {
                TransformDto(dtoClass)(constructor.prototype, key, descriptor);
                Object.defineProperty(constructor.prototype, key, descriptor);
            }
        }
    };
}
