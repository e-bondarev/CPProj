function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

new Vue({
    el: '#app',
    data: {
        vscode: acquireVsCodeApi(),
        project: {
            name: '',
            version: '',
            type: '',
            appOrLibName: '',
            dirs: {
                external: '',
                src: '',
                build: '',
            },
            codeCase: '',
            pch: '',
            formats: {
                source: '',
                header: ''
            },
            submodules: [
            ]
        }
    },
    mounted() {
        this.vscode.postMessage({
            command: 'requireProjectData'
        });
        
        window.addEventListener('message', event => {
            const message = event.data;            
            switch (message.command) {
                case 'loadProjectData':
                    this.project = message.projectData;
                    break;
            }
        });
    },
    methods: {
        createStructure() {
            this.vscode.postMessage({
                command: 'createStructure',
                projectData: this.project
            });
        },

        addSubmodule() {
            this.project.submodules.push({ url: '', name: '' });
        },

        removeSubmodule(i) {
            const reverseOrder = true;
            const reversingVariable = reverseOrder ? this.project.submodules.length - 1 : 0;
            this.project.submodules.splice(reversingVariable - i, 1);
        },

        codeCaseChanged(event) {
            if (this.project.codeCase == 'camel' || this.project.codeCase == 'snake')
            {
                this.project.src = 'src';
            }
            else
            {
                this.project.src = 'Source';
            }

            if (this.project.codeCase == 'camel' || this.project.codeCase == 'snake')
            {
                this.project.src = this.project.src.toLowerCase();
                this.project.build = this.project.build.toLowerCase();
                this.project.external = this.project.external.toLowerCase();
            }
            else
            {
                this.project.src = capitalizeFirstLetter(this.project.src);
                this.project.build = capitalizeFirstLetter(this.project.build);
                this.project.external = capitalizeFirstLetter(this.project.external);
            }
        }
    }
});