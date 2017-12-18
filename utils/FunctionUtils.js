class FunctionUtils {

    static bindArgsAsArray(func, args) {
        return func.bind.apply(func, [null].concat(args));
    }

}

module.exports = FunctionUtils;
