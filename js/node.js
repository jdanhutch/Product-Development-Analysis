Vue.component('node', {
    props: {
        node: {
            type: Object,
            required: true
        },
        priorities: {
            type: Array,
            required: true
        }
    },
    template: `<div class="node">
        <div :class="classObject" class="form">
            <div class="descriptions">
                <label>Topic</label>
                <input v-model="node.name" type="text">
                <br>
                <label>Notes</label>
                <textarea v-model="node.notes"></textarea>
            </div>
            <select v-model="node.priority" :size="priorities.length">
                <option v-for="priority in priorities" :value="priority.value" v-text="priority.name"></option>
            </select>
            <br>
            <div class="inputs">
                <div v-for="metric in node.metrics">
                    <span v-text="metric.name"></span>
                    <input v-model="metric.value" type="number" min="0">
                </div>
            </div>
        </div>
        <div>
            <button @click="addNode">Add node</button>
            <button @click="removeSelf">Remove</button>
        </div>
        <div class="nodes">
            <node v-for="child in node.nodes" :node="child" :priorities="priorities"></node>
        </div>
    </div>`,
    computed: {
        classObject() {
            const obj = {};
            const priority = this.priorities.find(priority => priority.value === this.node.priority);
            if (priority) {
                obj[priority.name.toLowerCase().replace(/[^a-z]/g, '')] = true;
            }
            return obj;
        }
    },
    watch: {
        'node.priority'() {
            this.node.parent.priority = Math.min(this.node.parent.priority, this.node.priority);
            this.node.nodes.forEach(node => node.priority = Math.max(node.priority, this.node.priority));
        }
    },
    methods: {
        addNode() {
            this.node.nodes.push(new Node(
                this.node.metrics.map(metric => new Metric(metric.name)),
                '',
                [],
                '',
                this.node,
                this.priorities[this.priorities.length - 1].value
            ));
        },
        removeSelf() {
            this.node.parent.nodes.splice(this.node.parent.nodes.findIndex(node => node === this.node), 1);
        }
    }
});