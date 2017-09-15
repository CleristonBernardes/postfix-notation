import * as fs from "fs"
import * as path from "path"
import { calcNotation, mapFileToTable } from "../src/controllers/postfix-notation"
jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000

const default_file = {}

function testExecute(testing_name: string, testing_method: Function, validating_method: Function, ...args: any[]) {
    test(testing_name, done => {
        if (args.length > 0) {
          testing_method(...args, validating_method(done));
        } else {
          testing_method(validating_method(done));
        }
    });
}

function fileValidation (done) {
    return function validate(err: any, result: any) {
        expect(err).toBeUndefined();
        expect(result).toBeDefined();
        expect(result.output_file).toBeDefined();
        compareResults(result.output_file, (err: any, valid: boolean)=>{
            expect(err).toBeUndefined();
            expect(valid).toBeTruthy();
            done()
        });
    };
}

function compareResults(output_file, done) {
    const expected_file = `${__dirname}/expected_output/${path.basename(output_file)}`
    fs.readFile(expected_file, (err, expected_data) => {
        expect(err).toBeNull();
        fs.readFile(output_file, (err, output_data) => {
            expect(err).toBeNull();
            done(undefined, output_data.toString('ascii') === expected_data.toString('ascii'));
        });
    });
}


testExecute(`default`, calcNotation, fileValidation, {});
const files_to_test = [`best_case.csv`, `worst_case.csv`, `invalid_references.csv`, `empty.csv`, `only_columns.csv`, `only_rows.csv`, `big_file.csv`]

for (let file_name of files_to_test){
    testExecute(`file ${file_name}`, calcNotation, fileValidation, {file_name});
}



