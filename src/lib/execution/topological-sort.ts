import { WorkflowEdge, WorkflowNode } from "../types/workflow";


export function topologicalSort(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
): WorkflowNode[] {

    // handle empty workflow
    if (nodes.length === 0) {
        return [];
    }


    const nodeMap = new Map<string, WorkflowNode>();
    const graph = new Map<string, string[]>();
    const indegree = new Map<string, number>();

    for (const node of nodes) {
        // Duplicate node IDs are invalid
        if (nodeMap.has(node.id)) {
            throw new Error(
                `Duplicate workflow node ID: ${node.id}`
            );
        }

        nodeMap.set(node.id, node);
        graph.set(node.id, []);
        indegree.set(node.id, 0);
    }

    //  Build graph
    // Used to prevent duplicate edges from increasing
    // indegree multiple times.
    const edgeSet = new Set<string>();

    for (const edge of edges) {

        // Validate source node

        if (!nodeMap.has(edge.source)) {
            throw new Error(
                `Invalid workflow edge ${edge.id}: ` +
                `source node "${edge.source}" does not exist`
            );
        }


        // Validate target node


        if (!nodeMap.has(edge.target)) {
            throw new Error(
                `Invalid workflow edge ${edge.id}: ` +
                `target node "${edge.target}" does not exist`
            );
        }

        // Prevent self-loop

        if (edge.source === edge.target) {
            throw new Error(
                `Workflow contains a self-loop on node "${edge.source}"`
            );
        }

        // Prevent duplicate edges

        const edgeKey = `${edge.source}->${edge.target}`;

        if (edgeSet.has(edgeKey)) {
            continue;
        }

        edgeSet.add(edgeKey);

        // Add edge
        graph.get(edge.source)!.push(edge.target);

        // Increase target indegree
        indegree.set(
            edge.target,
            indegree.get(edge.target)! + 1
        );
    }

    //  Find all nodes with no dependencies

    const queue: string[] = [];
    let queueIndex = 0;

    for (const node of nodes) {
        if (indegree.get(node.id) === 0) {
            queue.push(node.id);
        }
    }

    //  Kahn's Topological Sort

    const sortedIds: string[] = [];

    while (queueIndex < queue.length) {
        const currentNodeId = queue[queueIndex++];

        sortedIds.push(currentNodeId);

        const neighbors = graph.get(currentNodeId)!;

        for (const neighborId of neighbors) {
            const newIndegree =
                indegree.get(neighborId)! - 1;

            indegree.set(neighborId, newIndegree);

            // All dependencies are now satisfied
            if (newIndegree === 0) {
                queue.push(neighborId);
            }
        }
    }

    // Detect cycle

    if (sortedIds.length !== nodes.length) {
        const remainingNodes = nodes
            .filter((node) => !sortedIds.includes(node.id))
            .map((node) => node.id);

        throw new Error(
            `Workflow contains a cycle. ` +
            `Unable to sort nodes: ${remainingNodes.join(", ")}`
        );
    }


    // Convert IDs back to WorkflowNode[]


    return sortedIds.map((id) => nodeMap.get(id)!);
}