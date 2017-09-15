import * as fs from "fs"
import * as readline from "readline"
import * as stream from "stream"
import * as path from "path"


interface Iinput {
    file_path?: string;
    file_name?: string;
}

// limiting the columns to alphabet size
const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const err_message = "#ERR"

// map the csv into a table object
export const mapFileToTable = (path: string, done: DefaultResultCallback) => {
    let content_table = {}
    const instream = fs.createReadStream(path);
    // const outstream = process.stdout;
    const rl = readline.createInterface({input: instream});

    rl.on("line", (line)=> {
        let index = 0
        for (let col of line.split(",")) {
            if (!content_table[letters[index]]) {
                content_table[letters[index]] = []
            }
            content_table[letters[index]].push(tryCalculate(col));
            index++;
        }
    });
    
    rl.on("close", function() {
        done(undefined, content_table);
    });
   
}

// try calculate e validate if its a valid return
const tryCalculate = (expression: string) =>{
    const try_calc = postfixCalculator(expression);
    if (try_calc === err_message){
        return err_message
    }
    if ((!try_calc && try_calc!==0) || isNaN(try_calc)){
        return expression
    }
    return try_calc
}

// function to calculate postfix notation
const postfixCalculator = (expression: string) => {

    const no_space_expression = expression.trim();
    if (no_space_expression === ""){
        return "0";
    }
    if (expression.split(" ").join("").indexOf(err_message) > -1){
        return expression;
    }
    if (!isNaN(Number(expression.split(" ").join("")))){ //has only numbers
        let qtd = 0
        let first_number = null
        for (let value of expression.split(" ")){
            if (value !== ""){
                first_number = first_number || value;
                qtd++;
            }
            if (qtd > 1) {
                return err_message
            }
        }
        return first_number
    }
    if (no_space_expression === ""){
        return "0";
    }
    if (!no_space_expression.match(/\d+/) && !(/[a-z]/.test(no_space_expression.toLowerCase()))){ //no letter or number
        return err_message;
    }

    var result;
    var tokens = expression.split(/\s+/);
    var stack = [];
    var first;
    var second;
    const containsInvalidChars = /[^()+\-*/0-9.\s]/gi.test(expression);

    if (containsInvalidChars) {
      return null;
    }

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (token === "*") {
        second = stack.pop() || 1;
        first = stack.pop() || 1;
        stack.push(first * second);
      } else if (token === "/") {
        second = stack.pop();
        first = stack.pop();
        stack.push(first / second);
      } else if (token === "+") {
        second = stack.pop();
        first = stack.pop();
        stack.push(first + second);
      } else if (token === "-") {
        second = stack.pop();
        first = stack.pop();
        stack.push(first - second);
      } else {
        if (!isNaN(Number(token))) {
          stack.push(Number(token));
        }
      }
    }

    result = stack.pop();

    return result.toString();
}

// replace the cells with other cells references and calculate its notation
const replaceAndCalculate = (table: any, done: DefaultResultCallback) =>{
    if (Object.keys(table).length<=0){
        return done(undefined, {})
    }
    let iteration = 0
    const max_iterations = (Object.keys(table).length * table[letters[0]].length) - 1 // loading the file I run 1 iteration
    while (iteration < max_iterations){
        for (let col in table){
            let index = 0;
            for (let cel of table[col]){
                if (cel.indexOf(err_message) > -1){
                    table[col][index] = err_message;
                }
                else {
                    let new_cel = []
                    if (/[a-z]/.test(cel.toLowerCase())){
                        let cel_array = cel.split(" ");
                        for (let value of cel_array){
                            if (/[a-z]/.test(value.toLowerCase())){
                                let letter = value.charAt(0);
                                let position = value.match(/\d+/) ? Number(value.match(/\d+/)[0]) - 1 : null
                                
                                if (letter && table[value.charAt(0)] && (position || position === 0) && table[letter][position] && !isNaN(Number(table[letter][position]))){
                                    new_cel.push(table[letter][position]);
                                }
                                else{
                                    const last_iteration = (iteration+1 === max_iterations);
                                    const is_invalid = isNaN(value)
                                    new_cel.push((last_iteration && is_invalid) ? err_message : value);
                                }
                            }
                            else{
                                new_cel.push(value);
                            }
                        }
                    }
                    if (new_cel.length > 0){
                        if (new_cel.join("").indexOf(err_message) > -1){
                            table[col][index] = err_message
                        }else{
                            table[col][index] = tryCalculate(new_cel.join(" "));
                        }
                    }
                }
                index++;
            }
        }
        iteration++;
    }
    done(undefined, table);
}

//calculates the notation from csv file
export const calcNotation = (input: Iinput, done: DefaultResultCallback) => {
    const {file_path, file_name} = input

    let file = `${__dirname}/../STDIN/input.csv`

    if (file_path) {
        file = file_path;
    } else if (file_name){
        file = `${__dirname}/../STDIN/${file_name}`
    }

    mapFileToTable(file, (err: any, table: any)=>{
        replaceAndCalculate(table, (err: any, new_table: any)=>{
            const output_file = `${__dirname}/../STDOUT/${path.basename(file)}`
            let stream = fs.createWriteStream(output_file);
            
            stream.once('open', function(fd) {
                const max_rows = (new_table[letters[0]]) ? new_table[letters[0]].length : 0;
                let index = 0;
                while (index < max_rows){
                    let row = [];
                    for (let col in new_table){
                        if (table[col][index]){
                            row.push(table[col][index]);
                        }
                    }
                    stream.write(`${index > 0 ? "\n":""}${row.join(",")}`);
                    index++;
                }
              stream.end();
              done(undefined, {output_file, new_table});
            });
        });
    });

}
