export function Debounce(second: number) {
    let timeId: number | undefined


    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

        let func = descriptor.value
        descriptor.value = function (...args: any[]) {

            clearTimeout(timeId)
            timeId = setTimeout(() => {
                func.apply(this, args)
            }, second);
        }

        return descriptor
    }
}
