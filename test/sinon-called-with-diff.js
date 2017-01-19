'use strict';

const chalk = require('chalk');

module.exports = (sinon) => {
    const {stub} = sinon;
    
    sinon.stub = () => {
        const fn = stub();
        const {calledWith:original} = fn;
        
        fn.calledWith = (...args) => {
            if (original.apply(fn, args))
                return true;
            
            return calledWith.apply(fn, args);
        };
        
        return fn;
    };
    
    Object.assign(sinon.stub, stub);
    
    return sinon;
};

function calledWith(...args) {
    if (!this.called) {
        write(`expected to call with ${JSON.stringify(this.args)}, but not called at all\n`);
        return false;
    }
    
    const actual = this.args.pop();
    
    
    write('wrong arguments');
    writeObject('actual:', actual);
    writeObject('expected:', args);
    
    return false;
}

function write(str) {
    process.stdout.write(chalk.red(str) + '\n');
}

function writeObject(str, object) {
    const json = JSON.stringify(object, null, 2);
    process.stdout.write(str, chalk.yellow(json) + '\n');
}

