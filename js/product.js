Vue.component('product', {
    template: `<div>
        <div>
            <button @click="importProduct">Import Product</button>
            <button @click="exportProduct">Export Product</button>
        </div>
        <form class="builder" @submit.prevent>
            <label>Metric</label>
            <input v-model="newMetric" type="text" autofocus>
            <button @click="addMetric" :disabled="!newMetric.trim()">Add</button>
        </form>
        <ol>
            <li v-for="metric in product.metrics">
                <button @click="removeMetric(metric.name)">X</button>
                <pre v-text="metric.name"></pre>
            </li>
        </ol>
        <div class="node">
            <div class="form">
                <div>
                    <label>Product</label>
                    <input v-model="product.name" type="text">
                    <br>
                    <label>Notes</label>
                    <textarea v-model="product.notes"></textarea>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th v-for="priority in priorities" v-text="priority.name"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="metric in product.metrics">
                            <td v-text="metric.name"></td>
                            <td v-for="priority in priorities" v-text="metricPrioritySum(product, metric.name, priority.value)" :class="priorityRowClassObject(priority.name)"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <button @click="addNode">Add node</button>
            </div>
            <div class="nodes">
                <node v-for="node in product.nodes" :node="node" :priorities="priorities"></node>
            </div>
        </div>
    </div>`,
    data() {
        const data = {
            exporter: document.createElement('a'),
            importer: document.createElement('input'),
            newMetric: '',
            priorities: ['Must', 'Should', 'Could', 'Won\'t'].map((priority, i) => new Priority(priority, i + 1))
        };
        data.importer.type = 'file';
        data.importer.accept = 'application/json';
        data.importer.addEventListener('change', () => {
            const file = data.importer.files[0];
            data.importer.value = '';
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.product = new Node();
                    this.product.fromJSON(JSON.parse(reader.result));
                };
                reader.readAsText(file);
            }
        });
        data.product = new Node([], '', [], '', null, data.priorities[data.priorities.length - 1].value);
        return data;
    },
    methods: {
        addMetric() {
            this.product.nodes.forEach(node => this.addMetricToNode(this.newMetric, node));
            this.product.metrics.push(new Metric(this.newMetric));
            this.newMetric = '';
        },
        addMetricToNode(metric, node) {
            node.metrics.push(new Metric(metric));
            node.nodes.forEach(node => this.addMetricToNode(metric, node));
        },
        addNode() {
            this.product.nodes.push(new Node(
                this.product.metrics.map(metric => new Metric(metric.name)),
                '',
                [],
                '',
                this.product,
                this.priorities[this.priorities.length - 1].value
            ));
        },
        exportProduct() {
            this.exporter.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.product));
            this.exporter.download = this.product.name + ' Product Development Analysis.json';
            this.exporter.click();
        },
        importProduct() {
            this.importer.click();
        },
        priorityRowClassObject(priority) {
            const obj = {};
            obj[priority.toLowerCase().replace(/[^a-z]/, '')] = true;
            return obj;
        },
        metricPrioritySum(node, metric, priority) {
            return node.nodes.reduce((sum, node) => {
                if (node.priority === priority) {
                    sum += Number(node.metrics.find(m => m.name === metric).value);
                }
                return sum + this.metricPrioritySum(node, metric, priority);
            }, 0);
        },
        removeMetric(metric) {
            this.product.metrics.splice(this.product.metrics.findIndex(m => m.name === metric), 1);
            this.product.nodes.forEach(node => this.removeMetricFromNode(metric, node));
        },
        removeMetricFromNode(metric, node) {
            node.metrics.splice(node.metrics.findIndex(m => m.name === metric), 1);
            node.nodes.forEach(node => this.removeMetricFromNode(metric, node));
        }
    }
});