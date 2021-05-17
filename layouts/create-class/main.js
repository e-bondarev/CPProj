new Vue({
    el: '#app',
    data: {
        vscode: acquireVsCodeApi(),
        classData: {
            where: '',
            name: '',
            headerOnly: false
        }
    },
    mounted() {
        document.getElementById('name').focus();

        window.addEventListener('keyup', event => {
            if (event.keyCode === 13) {
                event.preventDefault();
                this.submit();
            }
        });
    },
    methods: {
        submit() {
            this.vscode.postMessage({ command: 'createClass', classData: this.classData });
        }
    }
});