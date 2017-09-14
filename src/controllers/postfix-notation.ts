import * as fs from "fs"
import * as readline from "readline"
import * as stream from "stream"



interface Iinput {
    content?: string;
    fileName?: string;
}

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const err_message = "#ERR"

const mapFileToTable = (path: string, done: DefaultResultCallback) => {
    let content_table = {}
    const instream = fs.createReadStream(path);
    const outstream = process.stdout;
    const rl = readline.createInterface({input: instream, output: outstream});

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
        console.log("content_table", content_table);
        done(undefined, content_table);
    });
   
}

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

const replaceAndCalculate = (table: any, done: DefaultResultCallback) =>{
    if (Object.keys(table).length<=0){
        return {}
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
                                    iteration++;
                                }
                                else{
                                    new_cel.push(value); // if last iteration fill with error
                                }
                            }
                            else{
                                new_cel.push(value);
                            }
                        }
                    }
                    if (new_cel.length > 0){
                        table[col][index] = tryCalculate(new_cel.join(" "));
                    }
                }
                index++;
            }
        }
        iteration++;
    }
    console.log("new table", JSON.stringify(table));
    done(null, table);
}

export const calcNotation = (input: Iinput, done: DefaultResultCallback) => {
    const {content, fileName} = input

    mapFileToTable(`${__dirname}/input.csv`, (err: any, table: any)=>{
        replaceAndCalculate(table, done);
    });

}


