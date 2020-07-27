const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

class CommandLineArguments {

    constructor(name, description, definition = {}) {
        this.name = name;
        this.description = description;
        this.definition = definition;
    }

    formUsageSections () {
        const optionList = [];

        this.definition.forEach(item => {
            optionList.push({
                name: item.name,
                typeLabel: `{underline ${item.type.name}}`,
                description: item.description
            });
        });

        return [
            {
                header: this.name,
                content: this.description
            },
            {
                header: 'Options',
                optionList
            }
        ];
    };

    getUsage() {
        return commandLineUsage(this.formUsageSections())
    }

    getArguments() {
        const args = commandLineArgs(this.definition);
        this.definition.forEach(item => {
            if (item.required && !args[item.name]) {
                throw this.getUsage();
            }
        });

        if (args.help) {
            throw this.getUsage();
        }

        return args;
    }

}



module.exports = CommandLineArguments;
