function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

new Vue({
    el: '#app',
    data: {
        vscode: acquireVsCodeApi(),
        project: {
            name: 'ProjectorProject',
            version: '0.0.1',
            type: 'Application',
            appOrLibName: 'ProjectorApp',
            external: 'External',
            src: 'Source',
            build: 'Build',
            codeCase: 'pascal',
            submodules: [
                { url: 'https://github.com/glfw/glfw', name: 'glfw' }
            ]
        }
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
            this.project.submodules.splice(i, 1);
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