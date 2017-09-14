import { calcNotation } from "../src/controllers/postfix-notation"

function testExecute(testing_name: string, testing_method: Function, validating_method: Function, params?: any) {
    test(testing_name, done => {
        testing_method(params, validating_method(done));
    });
}

testExecute("calc notation", calcNotation, (done) => {
    return function validate(err: any, result: number) {
        done();
    };
}, {});