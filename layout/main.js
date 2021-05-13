new Vue({
    el: '#app',
    data: {
        vscode: acquireVsCodeApi(),
        project: {
            name: '',
            type: '',
            appOrLibName: ''
        }
    },
    methods: {
        createStructure() {
            this.vscode.postMessage({
                command: 'createStructure',
                projectData: this.project
            });
        }
    }
});