class Node {
    constructor(metrics, name, nodes, notes, parent, priority) {
        this.metrics = metrics;
        this.name = name;
        this.nodes = nodes;
        this.notes = notes;
        this.parent = parent;
        this.priority = priority;
    }

    toJSON() {
        const json = Object.assign({}, this);
        delete json.parent;
        return json;
    }

    fromJSON(json) {
        this.metrics = json.metrics.map(metric => new Metric(metric.name, metric.value));
        this.name = json.name;
        this.nodes = json.nodes.map(json => {
            const withParent = Object.assign({parent: this}, json);
            const node = new Node();
            node.fromJSON(withParent);
            return node;
        });
        this.notes = json.notes;
        this.parent = json.parent;
        this.priority = json.priority;
    }
}